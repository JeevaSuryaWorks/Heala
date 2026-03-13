import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../config/supabaseConfig';
import ReviewSection from '../components/ReviewSection';


const DoctorProfile = () => {
    const { id } = useParams();
    const [doctor, setDoctor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('about');
    const [user, setUser] = useState(null);

    useEffect(() => {
        if (id) {
            fetchDoctorProfile();
        }
        fetchUser();
    }, [id]);

    const fetchUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
    };

    const fetchDoctorProfile = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('doctors')
                .select('*, profiles(name, email, phone)')
                .eq('id', id)
                .single();

            if (error) throw error;
            setDoctor(data);
        } catch (error) {
            console.error('Error fetching doctor profile:', error.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div style={{ minHeight: '100vh', background: 'var(--color-bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '50px', height: '50px', border: '5px solid var(--glass-border)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );

    if (!doctor) return (
        <div style={{ minHeight: '100vh', background: 'var(--color-bg-primary)', padding: '5rem', textAlign: 'center' }}>
            <h2 style={{ color: 'var(--color-text-primary)' }}>Expert Not Found</h2>
            <Link to="/doctors" style={{ color: 'var(--color-primary)', fontWeight: '800', textDecoration: 'none' }}>Back to Search</Link>
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', background: 'var(--color-bg-primary)', padding: '5rem 2rem', position: 'relative', overflow: 'hidden' }}>
            {/* Ambient Background */}
            <div style={{ position: 'absolute', top: '15%', left: '5%', width: '50vw', height: '50vw', background: 'radial-gradient(circle, var(--color-primary) 0%, transparent 70%)', filter: 'blur(150px)', opacity: 0.05, zIndex: 0 }} />

            <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
                {/* Hero Header */}
                <div style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(30px)', border: '1px solid var(--glass-border)', borderRadius: '40px', padding: '4rem', marginBottom: '3rem', display: 'flex', gap: '4rem', alignItems: 'center', boxShadow: '0 40px 100px -20px rgba(0,0,0,0.3)' }}>
                    <div style={{ width: '220px', height: '220px', borderRadius: '48px', overflow: 'hidden', border: '8px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '5rem', fontWeight: '900', color: 'var(--color-primary)' }}>
                        {doctor.profiles?.name?.charAt(0)}
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                            <h1 style={{ fontSize: '3rem', fontWeight: '900', color: 'var(--color-text-primary)', margin: 0, letterSpacing: '-1.5px' }}>{doctor.profiles?.name}</h1>
                            <span style={{ padding: '0.5rem 1rem', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '900' }}>VERIFIED EXPERT</span>
                        </div>
                        <p style={{ fontSize: '1.4rem', color: 'var(--color-primary)', fontWeight: '800', marginBottom: '2.5rem' }}>{doctor.specialization} • {doctor.qualification}</p>
                        
                        <div style={{ display: 'flex', gap: '3rem' }}>
                            <div>
                                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-secondary)', fontWeight: '700' }}>Experience</p>
                                <p style={{ margin: '0.2rem 0 0', fontSize: '1.25rem', fontWeight: '900', color: 'var(--color-text-primary)' }}>{doctor.experience}</p>
                            </div>
                            <div>
                                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-secondary)', fontWeight: '700' }}>Success Rate</p>
                                <p style={{ margin: '0.2rem 0 0', fontSize: '1.25rem', fontWeight: '900', color: 'var(--color-text-primary)' }}>98%</p>
                            </div>
                            <div>
                                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-secondary)', fontWeight: '700' }}>Rating</p>
                                <p style={{ margin: '0.2rem 0 0', fontSize: '1.25rem', fontWeight: '900', color: 'var(--color-text-primary)' }}>★ {doctor.rating || '5.0'}</p>
                            </div>
                            <div>
                                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-secondary)', fontWeight: '700' }}>Consultation</p>
                                <p style={{ margin: '0.2rem 0 0', fontSize: '1.25rem', fontWeight: '900', color: 'var(--color-primary)' }}>₹{doctor.fee}</p>
                            </div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <Link to={`/book/${doctor.id}`} style={{ padding: '1.2rem 2.5rem', background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '20px', fontSize: '1.1rem', fontWeight: '900', textDecoration: 'none', textAlign: 'center', boxShadow: '0 10px 20px -5px rgba(139, 92, 246, 0.4)', transition: 'all 0.3s ease' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.background = 'var(--color-accent)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.background = 'var(--color-primary)'; }}>Reserve Session</Link>
                        <a 
                            href={`https://www.google.com/maps/dir/?api=1&destination=${doctor.latitude || 13.0827},${doctor.longitude || 80.2707}&travelmode=driving`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            style={{ 
                                padding: '1.2rem 2.5rem', 
                                background: 'rgba(255,255,255,0.03)', 
                                color: 'var(--color-text-primary)', 
                                border: '1px solid var(--glass-border)', 
                                borderRadius: '20px', 
                                fontSize: '1.1rem', 
                                fontWeight: '800', 
                                textDecoration: 'none',
                                textAlign: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                                e.currentTarget.style.transform = 'translateY(-2px)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                                e.currentTarget.style.transform = 'translateY(0)';
                            }}
                        >
                            Navigate to Clinic
                        </a>
                    </div>
                </div>

                {/* Content Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '3rem' }}>
                    <div style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(30px)', border: '1px solid var(--glass-border)', borderRadius: '40px', overflow: 'hidden' }}>
                        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--glass-border)' }}>
                            {['about', 'availability', 'location', 'reviews'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    style={{
                                        padding: '2rem 3rem', border: 'none', background: 'transparent', color: activeTab === tab ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                                        fontWeight: '900', fontSize: '1rem', cursor: 'pointer', position: 'relative', textTransform: 'uppercase', letterSpacing: '1px'
                                    }}
                                >
                                    {tab}
                                    {activeTab === tab && <div style={{ position: 'absolute', bottom: 0, left: '20%', right: '20%', height: '4px', background: 'var(--color-primary)', borderRadius: '4px' }} />}
                                </button>
                            ))}
                        </div>

                        <div style={{ padding: '4rem' }}>
                            {activeTab === 'about' && (
                                <div style={{ animation: 'fadeIn 0.5s ease' }}>
                                    <h3 style={{ fontSize: '1.8rem', fontWeight: '900', marginBottom: '1.5rem', letterSpacing: '-0.5px' }}>Professional Biography</h3>
                                    <p style={{ fontSize: '1.15rem', color: 'var(--color-text-secondary)', lineHeight: '1.8', marginBottom: '3rem' }}>{doctor.about || 'Specialist with extensive experience in clinical research and patient care. Dedicated to providing personalized medical solutions using latest healthcare technologies.'}</p>
                                    
                                    <h3 style={{ fontSize: '1.8rem', fontWeight: '900', marginBottom: '1.5rem', letterSpacing: '-0.5px' }}>Core Expertise</h3>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                        {['Clinical Diagnostics', 'Patient Education', 'Preventive Strategy', 'Emergency Protocols'].map(exp => (
                                            <div key={exp} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '24px', border: '1px solid var(--glass-border)' }}>
                                                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--color-primary)' }} />
                                                <span style={{ fontWeight: '800', color: 'var(--color-text-primary)' }}>{exp}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'availability' && (
                                <div style={{ animation: 'fadeIn 0.5s ease' }}>
                                    <h3 style={{ fontSize: '1.8rem', fontWeight: '900', marginBottom: '2.5rem' }}>Clinical Engagement Hours</h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => (
                                            <div key={day} style={{ padding: '2rem', background: 'rgba(255,255,255,0.03)', borderRadius: '28px', border: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{ fontSize: '1.2rem', fontWeight: '900', color: 'var(--color-text-primary)' }}>{day}</span>
                                                <div style={{ display: 'flex', gap: '0.8rem' }}>
                                                    {['09:00', '13:00', '16:00'].map(slot => (
                                                        <span key={slot} style={{ background: 'var(--color-primary)', color: 'white', padding: '0.6rem 1.2rem', borderRadius: '14px', fontSize: '0.9rem', fontWeight: '900' }}>{slot}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'location' && (
                                <div style={{ animation: 'fadeIn 0.5s ease' }}>
                                    <h3 style={{ fontSize: '1.8rem', fontWeight: '900', marginBottom: '2.5rem' }}>Clinic Location</h3>
                                    
                                    <div style={{ 
                                        background: 'rgba(255,255,255,0.03)', 
                                        border: '1px solid var(--glass-border)', 
                                        borderRadius: '32px', 
                                        padding: '4rem',
                                        textAlign: 'center',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: '2rem'
                                    }}>
                                        <div style={{ width: '100px', height: '100px', borderRadius: '30px', background: 'rgba(139, 92, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}>
                                            📍
                                        </div>
                                        <div>
                                            <h4 style={{ fontSize: '1.6rem', fontWeight: '900', color: 'var(--color-text-primary)', marginBottom: '0.5rem' }}>{doctor.clinic_name || 'Clinic Center'}</h4>
                                            <p style={{ fontSize: '1.1rem', color: 'var(--color-text-secondary)', maxWidth: '400px', margin: '0 auto' }}>{doctor.clinic_address || 'Healthcare Block, Sector 12, Medical City'}</p>
                                        </div>

                                        <div style={{ width: '100%', height: '1px', background: 'var(--glass-border)', margin: '1rem 0' }} />

                                        <p style={{ fontSize: '1rem', color: 'var(--color-text-secondary)', fontWeight: '600' }}>
                                            Ready to visit? Get real-time turn-by-turn directions directly to the clinic.
                                        </p>

                                        <a 
                                            href={`https://www.google.com/maps/dir/?api=1&destination=${doctor.latitude || 13.0827},${doctor.longitude || 80.2707}&travelmode=driving`} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            style={{ 
                                                padding: '1.5rem 3.5rem', 
                                                background: 'var(--color-primary)', 
                                                color: 'white', 
                                                borderRadius: '24px', 
                                                textDecoration: 'none', 
                                                fontWeight: '900',
                                                fontSize: '1.2rem',
                                                boxShadow: '0 20px 40px -10px rgba(139, 92, 246, 0.5)',
                                                transition: 'all 0.3s ease',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '1rem'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.transform = 'translateY(-4px)';
                                                e.currentTarget.style.boxShadow = '0 25px 50px -10px rgba(139, 92, 246, 0.6)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.transform = 'translateY(0)';
                                                e.currentTarget.style.boxShadow = '0 20px 40px -10px rgba(139, 92, 246, 0.5)';
                                            }}
                                        >
                                            🚀 Start Navigation
                                        </a>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'reviews' && (
                                <div style={{ animation: 'fadeIn 0.5s ease' }}>
                                    <ReviewSection doctorId={doctor.id} doctorName={doctor.profiles?.name} />
                                </div>
                            )}
                        </div>
                    </div>

                    <aside>
                        <div style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(30px)', border: '1px solid var(--glass-border)', borderRadius: '40px', padding: '3rem', position: 'sticky', top: '2rem' }}>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: '900', marginBottom: '2rem' }}>Facility Details</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                <div style={{ display: 'flex', gap: '1.5rem' }}>
                                    <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>📍</div>
                                    <div>
                                        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-secondary)', fontWeight: '700' }}>Primary Clinic</p>
                                        <p style={{ margin: '0.2rem 0 0', fontWeight: '800', color: 'var(--color-text-primary)', lineHeight: '1.4' }}>{doctor.clinic_name || 'Expert Medical Center'},<br/>{doctor.clinic_address || 'Sector 12, Healthcare City'}</p>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '1.5rem' }}>
                                    <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>📞</div>
                                    <div>
                                        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-secondary)', fontWeight: '700' }}>Consultation Line</p>
                                        <p style={{ margin: '0.2rem 0 0', fontWeight: '800', color: 'var(--color-text-primary)' }}>{doctor.profiles?.phone || '+91 00000 00000'}</p>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '1.5rem' }}>
                                    <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>✉</div>
                                    <div>
                                        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-secondary)', fontWeight: '700' }}>Digital Reach</p>
                                        <p style={{ margin: '0.2rem 0 0', fontWeight: '800', color: 'var(--color-text-primary)' }}>{doctor.profiles?.email}</p>
                                    </div>
                                </div>
                            </div>

                            <div style={{ margin: '3rem 0', borderTop: '1px solid var(--glass-border)' }} />

                            <Link to={`/book/${doctor.id}`} style={{ display: 'block', padding: '1.2rem', background: 'var(--color-primary)', color: 'white', textAlign: 'center', borderRadius: '20px', fontWeight: '900', textDecoration: 'none', boxShadow: '0 10px 20px -5px rgba(139, 92, 246, 0.4)' }}>Reserve Session Now</Link>
                        </div>
                    </aside>
                </div>
            </div>
            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
};

export default DoctorProfile;
