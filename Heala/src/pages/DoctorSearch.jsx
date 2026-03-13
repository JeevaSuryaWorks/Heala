import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { supabase } from '../config/supabaseConfig';

const DoctorSearch = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        specialization: searchParams.get('specialization') || '',
        location: searchParams.get('location') || '',
        maxFees: searchParams.get('maxFees') || ''
    });

    const specializations = [
        'Cardiologist', 'Dermatologist', 'Pediatrician',
        'Neurologist', 'Orthopedic Surgeon', 'General Physician'
    ];

    useEffect(() => {
        fetchDoctors();
    }, [filters]);

    const fetchDoctors = async () => {
        setLoading(true);
        try {
            let query = supabase
                .from('doctors')
                // TODO:
                - [x] **Security & Reliability Update**:
    - [x] Migrate Supabase credentials to `.env`
    - [x] Update `supabaseConfig.js` to use env variables
    - [x] Fix Resend email integration (browser compatibility)
    - [x] Verify registration flow locally
                .select(`
                    *,
                    profiles(name, role)
                `)
                .eq('verification_status', 'approved');

            if (filters.specialization) {
                query = query.eq('specialization', filters.specialization);
            }
            if (filters.maxFees) {
                query = query.lte('fee', parseInt(filters.maxFees));
            }

            const { data, error } = await query;
            if (error) throw error;
            
            // Note: Location filter is currently in profiles or we might need to add it to doctors
            setDoctors(data || []);
        } catch (error) {
            console.error('Error fetching doctors:', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));

        const newParams = new URLSearchParams(searchParams);
        if (value) newParams.set(name, value);
        else newParams.delete(name);
        setSearchParams(newParams);
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'var(--color-bg-primary)',
            padding: '4rem 2rem',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Ambient Elements */}
            <div style={{ position: 'absolute', top: '10%', left: '5%', width: '40vw', height: '40vw', background: 'radial-gradient(circle, var(--color-primary) 0%, transparent 70%)', filter: 'blur(120px)', opacity: 0.08, zIndex: 0 }} />

            <div className="container" style={{ position: 'relative', zIndex: 1, maxWidth: '1200px', margin: '0 auto' }}>
                <header style={{ marginBottom: '4rem', textAlign: 'center' }}>
                    <h1 style={{ fontFamily: '"Outfit", sans-serif', fontSize: '3rem', fontWeight: '900', color: 'var(--color-text-primary)', marginBottom: '1rem', letterSpacing: '-1.5px' }}>
                        Find Specialists<span style={{ color: 'var(--color-primary)' }}>.</span>
                    </h1>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
                        Connect with top-tier healthcare professionals in our global network.
                    </p>
                </header>

                <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '3rem' }}>
                    {/* Filters Sidebar */}
                    <aside style={{
                        background: 'var(--glass-bg)', backdropFilter: 'blur(20px)', border: '1px solid var(--glass-border)',
                        borderRadius: '32px', padding: '2.5rem', height: 'fit-content', boxShadow: '0 20px 40px rgba(0,0,0,0.05)',
                        position: 'sticky', top: '100px'
                    }}>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '2rem' }}>Filters</h3>

                        <div style={{ marginBottom: '2rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.8rem', fontSize: '1rem', fontWeight: '700', color: 'var(--color-text-secondary)' }}>Specialization</label>
                            <select
                                name="specialization"
                                value={filters.specialization}
                                onChange={handleFilterChange}
                                style={{
                                    width: '100%', padding: '1rem 1.2rem', background: 'rgba(255,255,255,0.03)',
                                    border: '1px solid var(--glass-border)', borderRadius: '16px', color: 'var(--color-text-primary)',
                                    outline: 'none', transition: 'all 0.3s ease'
                                }}
                            >
                                <option value="">All Fields</option>
                                {specializations.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>

                        <div style={{ marginBottom: '2rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.8rem', fontSize: '1rem', fontWeight: '700', color: 'var(--color-text-secondary)' }}>Max Fee</label>
                            <input
                                name="maxFees"
                                type="range"
                                min="200"
                                max="2000"
                                step="100"
                                value={filters.maxFees || 2000}
                                onChange={handleFilterChange}
                                style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--color-primary)' }}
                            />
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontWeight: '600', color: 'var(--color-primary)' }}>
                                <span>₹200</span>
                                <span>₹{filters.maxFees || 2000}</span>
                            </div>
                        </div>

                        <button
                            onClick={() => setFilters({ specialization: '', location: '', maxFees: '' })}
                            style={{
                                width: '100%', padding: '1rem', borderRadius: '16px', border: '1px solid var(--glass-border)',
                                background: 'transparent', color: 'var(--color-text-primary)', fontWeight: '800', cursor: 'pointer',
                                transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
                            onMouseLeave={(e) => e.target.style.background = 'transparent'}
                        >
                            Reset Defaults
                        </button>
                    </aside>

                    {/* Results Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '2rem' }}>
                        {loading ? (
                             [1,2,3,4].map(i => (
                                <div key={i} style={{ height: '300px', background: 'var(--glass-bg)', borderRadius: '32px', border: '1px solid var(--glass-border)', animation: 'pulse 1.5s infinite' }} />
                             ))
                        ) : doctors.length > 0 ? (
                            doctors.map(doctor => (
                                <div key={doctor.id} className="doctor-card" style={{
                                    background: 'var(--glass-bg)', backdropFilter: 'blur(20px)', border: '1px solid var(--glass-border)',
                                    borderRadius: '32px', padding: '2rem', display: 'flex', flexDirection: 'column',
                                    transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)', position: 'relative', overflow: 'hidden'
                                }}>
                                    <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem' }}>
                                        <div style={{
                                            width: '80px', height: '80px', borderRadius: '24px',
                                            background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            color: 'white', fontSize: '1.8rem', fontWeight: '900',
                                            boxShadow: '0 10px 20px -5px rgba(139, 92, 246, 0.4)'
                                        }}>
                                            {doctor.profiles?.name?.charAt(0) || 'D'}
                                        </div>
                                        <div>
                                            <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '0.3rem 0.8rem', borderRadius: '10px', fontSize: '0.75rem', fontWeight: '800', display: 'inline-block', marginBottom: '0.5rem' }}>VERIFIED</div>
                                            <h4 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0 }}>{doctor.profiles?.name}</h4>
                                            <p style={{ color: 'var(--color-primary)', fontWeight: '700', fontSize: '0.9rem', margin: 0 }}>{doctor.specialization}</p>
                                        </div>
                                    </div>

                                    <div style={{ marginBottom: '2rem', flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.8rem' }}>
                                            <span style={{ color: '#f59e0b', fontSize: '1.2rem' }}>★</span>
                                            <span style={{ fontWeight: '800', fontSize: '1.1rem' }}>4.9</span>
                                            <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>(120+ Reviews)</span>
                                        </div>
                                        <div style={{ fontSize: '0.95rem', color: 'var(--color-text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            <p style={{ margin: 0 }}>📍 {doctor.location || 'Virtual Clinic'}</p>
                                            <p style={{ margin: 0, fontWeight: '700', color: 'var(--color-text-primary)' }}>💰 ₹{doctor.fee} per session</p>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        <Link to={`/doctor/${doctor.id}`} style={{
                                            flex: 1, padding: '1rem', borderRadius: '16px', border: '1px solid var(--glass-border)',
                                            background: 'transparent', color: 'var(--color-text-primary)', textDecoration: 'none',
                                            textAlign: 'center', fontWeight: '700', transition: 'all 0.3s ease'
                                        }}>Profile</Link>
                                        <Link to={`/book/${doctor.id}`} style={{
                                            flex: 2, padding: '1rem', borderRadius: '16px', border: 'none',
                                            background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
                                            color: 'white', textDecoration: 'none', textAlign: 'center', fontWeight: '800',
                                            boxShadow: '0 8px 15px -3px rgba(139, 92, 246, 0.3)', transition: 'all 0.3s ease'
                                        }}>Book Session</Link>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '5rem', background: 'var(--glass-bg)', borderRadius: '32px' }}>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: '800' }}>No Specialists Found</h3>
                                <p style={{ color: 'var(--color-text-secondary)' }}>Try adjusting your search criteria.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes pulse {
                    0% { opacity: 0.6; }
                    50% { opacity: 0.3; }
                    100% { opacity: 0.6; }
                }
                .doctor-card:hover {
                    transform: translateY(-8px);
                    box-shadow: 0 30px 60px -12px rgba(0,0,0,0.15);
                    border-color: var(--color-primary);
                }
            `}</style>
        </div>
    );
};

export default DoctorSearch;
