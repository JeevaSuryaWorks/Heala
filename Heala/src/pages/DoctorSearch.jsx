import React, { useState, useEffect } from 'react';
import { supabase } from '../config/supabaseConfig';
import { Link } from 'react-router-dom';
import ModernDropdown from '../components/ModernDropdown';
import { useAuth } from '../contexts/AuthContext';

const DoctorSearch = () => {
    const { user } = useAuth();
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        specialization: '',
        searchQuery: ''
    });

    const [unratedAppointment, setUnratedAppointment] = useState(null);
    const [ratingData, setRatingData] = useState({ rating: 0, comment: '' });
    const [isSubmittingRating, setIsSubmittingRating] = useState(false);

    useEffect(() => {
        fetchDoctors();
        if (user && user.role === 'patient') {
            checkUnratedVisits();
        }
    }, [filters, user]);

    const checkUnratedVisits = async () => {
        try {
            const { data, error } = await supabase
                .from('appointments')
                .select(`*, reviews(id), doctor:doctors(id, profiles(name))`)
                .eq('patient_id', user.id)
                .eq('status', 'completed');
                
            if (error) throw error;
            
            // Find first completed appointment without a review
            const pending = data?.find(apt => !apt.reviews || apt.reviews.length === 0);
            if (pending) {
                setUnratedAppointment(pending);
            }
        } catch (err) {
            console.error("Error checking unrated visits:", err);
        }
    };

    const submitRating = async () => {
        if (!ratingData.rating) return alert('Please select a star rating (1-5).');
        setIsSubmittingRating(true);
        try {
            const { error: revErr } = await supabase.from('reviews').insert([{
                patient_id: user.id,
                doctor_id: unratedAppointment.doctor_id,
                rating: ratingData.rating,
                comment: ratingData.comment
            }]);
            if (revErr) throw revErr;
            
            // Close dialog
            setUnratedAppointment(null);
            setRatingData({ rating: 0, comment: '' });
            alert('Thank you for your feedback! Your rating helps others find great doctors.');
        } catch (error) {
            console.error('Rating error:', error.message);
            alert('Failed to submit rating: ' + error.message);
        } finally {
            setIsSubmittingRating(false);
        }
    };

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
        <div style={{ minHeight: '100vh', background: 'var(--color-bg-primary)', padding: '10rem 1.5rem 4rem', position: 'relative', overflow: 'hidden' }}>
            {/* Animated Background Orbs */}
            <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '40vw', height: '40vw', background: 'radial-gradient(circle, var(--color-primary) 0%, transparent 70%)', filter: 'blur(120px)', opacity: 0.08, zIndex: 0 }} />
            <div style={{ position: 'absolute', bottom: '10%', left: '-5%', width: '30vw', height: '30vw', background: 'radial-gradient(circle, var(--color-accent) 0%, transparent 70%)', filter: 'blur(100px)', opacity: 0.05, zIndex: 0 }} />

            <div style={{ maxWidth: '1400px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
                <header style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <h1 className="search-title" style={{ fontWeight: '900', color: 'var(--color-text-primary)', marginBottom: '1.5rem', letterSpacing: '-2.5px' }}>Find Your <span style={{ color: 'var(--color-primary)' }}>Specialist</span></h1>
                    <p className="search-subtitle" style={{ color: 'var(--color-text-secondary)', maxWidth: '700px', margin: '0 auto', fontWeight: '600' }}>Connect with certified experts for personalized care and advanced medical solutions.</p>
                </header>

                {/* Glass Filter Bar */}
                <div style={{ 
                    background: 'var(--glass-bg)', 
                    backdropFilter: 'blur(30px)', 
                    border: '1px solid var(--glass-border)', 
                    borderRadius: '32px', 
                    padding: '2rem', 
                    marginBottom: '4rem', 
                    display: 'flex', 
                    gap: '1.5rem', 
                    rowGap: '1.5rem',
                    alignItems: 'center', 
                    boxShadow: '0 25px 60px -15px rgba(0,0,0,0.15)', 
                    flexWrap: 'wrap',
                    position: 'relative',
                    zIndex: 50
                }}>
                    <div style={{ flex: 1, minWidth: '300px', position: 'relative' }}>
                        <input
                            type="text"
                            placeholder="Search by expert name..."
                            value={filters.searchQuery}
                            onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
                            style={{ width: '100%', padding: '1.4rem 2rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', borderRadius: '20px', color: 'var(--color-text-primary)', fontSize: '1.1rem', fontWeight: '700', outline: 'none', transition: 'all 0.3s ease' }}
                        />
                    </div>
                    <ModernDropdown
                        placeholder="All Specialities"
                        options={[
                            { value: '', label: 'All Specialities' },
                            { value: 'Cardiology', label: 'Cardiology' },
                            { value: 'Dermatology', label: 'Dermatology' },
                            { value: 'Neurology', label: 'Neurology' },
                            { value: 'General Physician', label: 'General Physician' }
                        ]}
                        value={filters.specialization}
                        onChange={(val) => setFilters({ ...filters, specialization: val })}
                        containerStyle={{ minWidth: '240px', flex: '0 1 auto' }}
                    />
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

            {/* Rating Modal */}
            {unratedAppointment && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(10px)' }}>
                    <div className="animate-in" style={{ width: '100%', maxWidth: '450px', background: 'var(--color-surface)', borderRadius: '24px', padding: '3rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)', textAlign: 'center', position: 'relative' }}>
                        
                        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', margin: '0 auto 1.5rem auto', boxShadow: '0 10px 25px rgba(139, 92, 246, 0.4)' }}>
                            ⭐
                        </div>
                        
                        <h3 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--color-text-primary)', marginBottom: '0.5rem', fontFamily: '"Playfair Display", serif' }}>
                            Rate Your Experience
                        </h3>
                        <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: '2rem', fontWeight: 600 }}>
                            How was your recent appointment with <strong>{unratedAppointment.doctor?.profiles?.name || 'the Practitioner'}</strong>?
                        </p>
                        
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    onClick={() => setRatingData({...ratingData, rating: star})}
                                    style={{
                                        background: 'none', border: 'none', fontSize: '2.5rem', cursor: 'pointer', outline: 'none', transition: 'transform 0.2s', padding: 0,
                                        transform: ratingData.rating >= star ? 'scale(1.15)' : 'scale(1)',
                                        filter: ratingData.rating >= star ? 'grayscale(0%)' : 'grayscale(100%) opacity(0.2)'
                                    }}
                                >⭐</button>
                            ))}
                        </div>

                        <textarea
                            placeholder="Share some details about your visit (optional)"
                            value={ratingData.comment}
                            onChange={(e) => setRatingData({...ratingData, comment: e.target.value})}
                            style={{
                                width: '100%', padding: '1rem', borderRadius: '16px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.02)', fontSize: '0.9rem', minHeight: '100px', resize: 'none', outline: 'none', fontFamily: 'inherit', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '1.5rem'
                            }}
                        />

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button 
                                onClick={() => setUnratedAppointment(null)} 
                                style={{ flex: 1, padding: '1rem', borderRadius: '14px', border: 'none', background: 'transparent', color: 'var(--color-text-muted)', fontWeight: 800, cursor: 'pointer' }}
                            >Ask Later</button>
                            <button 
                                onClick={submitRating} 
                                disabled={isSubmittingRating}
                                style={{ flex: 1, padding: '1rem', borderRadius: '14px', border: 'none', background: 'var(--color-primary)', color: 'white', fontWeight: 900, cursor: 'pointer', boxShadow: '0 8px 16px rgba(139, 92, 246, 0.3)', opacity: isSubmittingRating ? 0.7 : 1 }}
                            >{isSubmittingRating ? 'Submitting...' : 'Submit Rating'}</button>
                        </div>
                        
                        <div style={{ marginTop: '1.5rem' }}>
                            <Link to={`/prescription/${unratedAppointment.id}`} target="_blank" style={{ fontSize: '0.8rem', color: 'var(--color-accent)', fontWeight: 800, textDecoration: 'none' }}>
                                View Digital Prescription →
                            </Link>
                        </div>
                    </div>
                </div>
            )}


            <style>{`
                @keyframes pulse { 0% { opacity: 0.5; } 50% { opacity: 0.8; } 100% { opacity: 0.5; } }
                @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .animate-in { animation: fadeIn 0.4s ease-out forwards; }
                .search-title { font-size: 4.5rem; }
                .search-subtitle { font-size: 1.4rem; }
                @media (max-width: 768px) {
                    .search-title { font-size: 2.5rem; }
                    .search-subtitle { font-size: 1.1rem; }
                }
                .doctor-card:hover { transform: translateY(-12px); border-color: var(--color-primary); box-shadow: 0 40px 80px -20px rgba(0,0,0,0.4); }
                .btn-primary:hover { background: var(--color-accent); transform: scale(1.02); }
                .btn-secondary:hover { background: rgba(255,255,255,0.08); border-color: var(--color-primary); }
            `}</style>
        </div>
    );
};

export default DoctorSearch;
