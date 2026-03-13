import React, { useState, useEffect } from 'react';
import { supabase } from '../config/supabaseConfig';
import { Link } from 'react-router-dom';

const DoctorSearch = () => {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        specialization: '',
        searchQuery: ''
    });

    useEffect(() => {
        fetchDoctors();
    }, [filters]);

    const fetchDoctors = async () => {
        setLoading(true);
        try {
            let query = supabase
                .from('doctors')
                .select(`
                    *,
                    profiles(name, role)
                `)
                .eq('verification_status', 'approved');

            if (filters.specialization) {
                query = query.eq('specialization', filters.specialization);
            }

            if (filters.searchQuery) {
                query = query.ilike('profiles.name', `%${filters.searchQuery}%`);
            }

            const { data, error } = await query;
            if (error) throw error;
            setDoctors(data || []);
        } catch (error) {
            console.error('Error fetching doctors:', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--color-bg-primary)', padding: '6rem 2rem', position: 'relative', overflow: 'hidden' }}>
            {/* Animated Background Orbs */}
            <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '40vw', height: '40vw', background: 'radial-gradient(circle, var(--color-primary) 0%, transparent 70%)', filter: 'blur(120px)', opacity: 0.08, zIndex: 0 }} />
            <div style={{ position: 'absolute', bottom: '10%', left: '-5%', width: '30vw', height: '30vw', background: 'radial-gradient(circle, var(--color-accent) 0%, transparent 70%)', filter: 'blur(100px)', opacity: 0.05, zIndex: 0 }} />

            <div style={{ maxWidth: '1400px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
                <header style={{ textAlign: 'center', marginBottom: '5rem' }}>
                    <h1 style={{ fontSize: '4.5rem', fontWeight: '900', color: 'var(--color-text-primary)', marginBottom: '1.5rem', letterSpacing: '-2.5px' }}>Find Your <span style={{ color: 'var(--color-primary)' }}>Specialist</span></h1>
                    <p style={{ fontSize: '1.4rem', color: 'var(--color-text-secondary)', maxWidth: '700px', margin: '0 auto', fontWeight: '600' }}>Connect with certified experts for personalized care and advanced medical solutions.</p>
                </header>

                {/* Glass Filter Bar */}
                <div style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(30px)', border: '1px solid var(--glass-border)', borderRadius: '32px', padding: '2.5rem', marginBottom: '4rem', display: 'flex', gap: '2rem', alignItems: 'center', boxShadow: '0 25px 60px -15px rgba(0,0,0,0.3)', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '300px', position: 'relative' }}>
                        <input
                            type="text"
                            placeholder="Search by expert name..."
                            value={filters.searchQuery}
                            onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
                            style={{ width: '100%', padding: '1.4rem 2rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', borderRadius: '20px', color: 'var(--color-text-primary)', fontSize: '1.1rem', fontWeight: '700', outline: 'none', transition: 'all 0.3s ease' }}
                        />
                    </div>
                    <select
                        value={filters.specialization}
                        onChange={(e) => setFilters({ ...filters, specialization: e.target.value })}
                        style={{ padding: '1.4rem 2rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', borderRadius: '20px', color: 'var(--color-text-primary)', fontSize: '1.1rem', fontWeight: '700', minWidth: '220px', cursor: 'pointer' }}
                    >
                        <option value="" style={{ background: '#1a1a1a' }}>All Specialities</option>
                        <option value="Cardiology" style={{ background: '#1a1a1a' }}>Cardiology</option>
                        <option value="Dermatology" style={{ background: '#1a1a1a' }}>Dermatology</option>
                        <option value="Neurology" style={{ background: '#1a1a1a' }}>Neurology</option>
                        <option value="General Physician" style={{ background: '#1a1a1a' }}>General Physician</option>
                    </select>
                </div>

                {loading ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '2.5rem' }}>
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} style={{ height: '480px', background: 'var(--glass-bg)', borderRadius: '40px', border: '1px solid var(--glass-border)', animation: 'pulse 1.5s infinite linear' }} />
                        ))}
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '2.5rem' }}>
                        {doctors.map(doctor => (
                            <div
                                key={doctor.id}
                                style={{
                                    background: 'var(--glass-bg)', backdropFilter: 'blur(30px)', border: '1px solid var(--glass-border)',
                                    borderRadius: '40px', padding: '3rem', transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                                    display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden',
                                    animation: 'slideUp 0.8s ease'
                                }}
                                className="doctor-card"
                            >
                                <div style={{ position: 'absolute', top: '2rem', right: '2rem' }}>
                                    <span style={{ padding: '0.5rem 1rem', background: 'rgba(139, 92, 246, 0.1)', color: 'var(--color-primary)', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '900' }}>★ {doctor.rating || '5.0'}</span>
                                </div>

                                <div style={{ width: '100px', height: '100px', borderRadius: '32px', background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '2.5rem', fontWeight: '900', marginBottom: '2rem', boxShadow: '0 15px 30px -10px rgba(139, 92, 246, 0.5)' }}>
                                    {doctor.profiles?.name?.charAt(0)}
                                </div>

                                <h3 style={{ fontSize: '1.8rem', fontWeight: '900', color: 'var(--color-text-primary)', marginBottom: '0.5rem', letterSpacing: '-0.5px' }}>{doctor.profiles?.name}</h3>
                                <p style={{ fontSize: '1.1rem', color: 'var(--color-primary)', fontWeight: '800', marginBottom: '1.5rem' }}>{doctor.specialization}</p>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2.5rem' }}>
                                    <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '18px', border: '1px solid var(--glass-border)' }}>
                                        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontWeight: '700', textTransform: 'uppercase' }}>Exp.</p>
                                        <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: '900', color: 'var(--color-text-primary)' }}>{doctor.experience}</p>
                                    </div>
                                    <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '18px', border: '1px solid var(--glass-border)' }}>
                                        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontWeight: '700', textTransform: 'uppercase' }}>Fee</p>
                                        <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: '900', color: 'var(--color-text-primary)' }}>₹{doctor.fee}</p>
                                    </div>
                                </div>

                                <div style={{ marginTop: 'auto', display: 'flex', gap: '1rem' }}>
                                    <Link 
                                        to={`/doctor/${doctor.id}`} 
                                        style={{ flex: 1, padding: '1.2rem', background: 'rgba(255,255,255,0.03)', color: 'var(--color-text-primary)', textAlign: 'center', borderRadius: '20px', fontWeight: '800', textDecoration: 'none', border: '1px solid var(--glass-border)', transition: 'all 0.3s ease' }}
                                        className="btn-secondary"
                                    >Profile</Link>
                                    <Link 
                                        to={`/book/${doctor.id}`} 
                                        style={{ flex: 1.5, padding: '1.2rem', background: 'var(--color-primary)', color: 'white', textAlign: 'center', borderRadius: '20px', fontWeight: '900', textDecoration: 'none', boxShadow: '0 8px 20px -5px rgba(139, 92, 246, 0.4)', transition: 'all 0.3s ease' }}
                                        className="btn-primary"
                                    >Book Now</Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!loading && doctors.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '10rem 0' }}>
                        <div style={{ fontSize: '4rem', marginBottom: '2rem' }}>🔍</div>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--color-text-primary)', marginBottom: '1rem' }}>No Experts Found</h2>
                        <p style={{ fontSize: '1.2rem', color: 'var(--color-text-secondary)' }}>Try adjusting your filters or search query.</p>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes pulse { 0% { opacity: 0.5; } 50% { opacity: 0.8; } 100% { opacity: 0.5; } }
                @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
                .doctor-card:hover { transform: translateY(-12px); border-color: var(--color-primary); box-shadow: 0 40px 80px -20px rgba(0,0,0,0.4); }
                .btn-primary:hover { background: var(--color-accent); transform: scale(1.02); }
                .btn-secondary:hover { background: rgba(255,255,255,0.08); border-color: var(--color-primary); }
            `}</style>
        </div>
    );
};

export default DoctorSearch;
