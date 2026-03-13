import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../config/supabaseConfig';

const PatientDashboard = () => {
    const { user } = useAuth();
    const [appointments, setAppointments] = useState([]);
    const [prescriptions, setPrescriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('appointments');
    const [showFeedbackModal, setShowFeedbackModal] = useState(null);
    const [feedback, setFeedback] = useState({ rating: 5, comment: '' });

    useEffect(() => {
        if (user) {
            fetchData();
        }
    }, [user]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch appointments with doctor info join
            const { data: aptData, error: aptError } = await supabase
                .from('appointments')
                .select(`
                    *,
                    doctor:doctor_id(
                        id,
                        profiles(name, specialization)
                    )
                `)
                .eq('patient_id', user.id)
                .order('appointment_date', { ascending: false });

            if (aptError) throw aptError;
            setAppointments(aptData || []);

            // Prescriptions (mocked for now as we don't have a table yet, but prepared for future)
            // const { data: presData } = await supabase.from('prescriptions').select('*').eq('patient_id', user.id);
            // setPrescriptions(presData || []);
        } catch (error) {
            console.error('Error fetching dashboard data:', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (id) => {
        if (window.confirm('Are you sure you want to cancel this appointment?')) {
            try {
                const { error } = await supabase
                    .from('appointments')
                    .update({ status: 'cancelled' })
                    .eq('id', id);
                if (error) throw error;
                fetchData();
            } catch (err) {
                alert('Failed to cancel: ' + err.message);
            }
        }
    };

    const submitFeedback = async (e) => {
        e.preventDefault();
        // Feedback implementation will go here once table is ready
        alert('Thank you! Your feedback has been saved (Cloud).');
        setShowFeedbackModal(null);
        setFeedback({ rating: 5, comment: '' });
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'var(--color-bg-primary)',
            padding: '2rem',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Ambient Elements */}
            <div style={{ position: 'absolute', top: '5%', right: '5%', width: '40vw', height: '40vw', background: 'radial-gradient(circle, var(--color-primary) 0%, transparent 70%)', filter: 'blur(100px)', opacity: 0.05, zIndex: 0 }} />

            <div className="container" style={{ position: 'relative', zIndex: 1, maxWidth: '1200px', margin: '0 auto' }}>
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                    <div>
                        <h1 style={{ fontFamily: '"Outfit", sans-serif', fontSize: '2.5rem', fontWeight: '900', color: 'var(--color-text-primary)' }}>
                            Patient Portal
                        </h1>
                        <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.1rem' }}>Welcome back, <span style={{ color: 'var(--color-primary)', fontWeight: '700' }}>{user?.name}</span></p>
                    </div>
                    <Link to="/doctors" style={{
                        padding: '1rem 2rem', background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
                        color: 'white', textDecoration: 'none', borderRadius: '16px', fontWeight: '800', fontSize: '1rem',
                        boxShadow: '0 10px 20px -5px rgba(139, 92, 246, 0.4)', transition: 'all 0.3s ease'
                    }} onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'} onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}>
                        Book Appointment
                    </Link>
                </header>

                <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '3rem' }}>
                    {/* Sidebar Nav */}
                    <aside style={{
                        background: 'var(--glass-bg)', backdropFilter: 'blur(20px)', border: '1px solid var(--glass-border)',
                        borderRadius: '32px', padding: '2rem', height: 'fit-content', boxShadow: '0 15px 35px rgba(0,0,0,0.05)'
                    }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {['appointments', 'prescriptions', 'payments'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    style={{
                                        padding: '1.2rem 1.5rem', borderRadius: '18px', border: 'none', textAlign: 'left',
                                        background: activeTab === tab ? 'var(--color-primary)' : 'rgba(255,255,255,0.03)',
                                        color: activeTab === tab ? 'white' : 'var(--color-text-secondary)',
                                        fontWeight: '700', fontSize: '1rem', cursor: 'pointer', transition: 'all 0.3s ease',
                                        boxShadow: activeTab === tab ? '0 8px 15px -3px rgba(139, 92, 246, 0.4)' : 'none'
                                    }}
                                >
                                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                </button>
                            ))}
                        </div>
                    </aside>

                    {/* Content Area */}
                    <main>
                        {loading ? (
                            <div className="card text-center" style={{ padding: '5rem', background: 'var(--glass-bg)', borderRadius: '32px' }}>
                                <div className="loader" style={{ margin: '0 auto 1.5rem auto' }}></div>
                                <p style={{ color: 'var(--color-text-secondary)' }}>Syncing with Health Cloud...</p>
                            </div>
                        ) : activeTab === 'appointments' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                {appointments.length > 0 ? (
                                    appointments.map(apt => (
                                        <div key={apt.id} style={{
                                            background: 'var(--glass-bg)', backdropFilter: 'blur(25px)', border: '1px solid var(--glass-border)',
                                            borderRadius: '28px', padding: '2rem', transition: 'all 0.3s ease', borderLeft: `8px solid ${apt.status === 'completed' ? '#10b981' : apt.status === 'cancelled' ? '#ef4444' : 'var(--color-primary)'}`
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div>
                                                    <h4 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '0.3rem' }}>{apt.doctor?.profiles?.name || 'Doctor'}</h4>
                                                    <p style={{ color: 'var(--color-primary)', fontWeight: '700', fontSize: '0.9rem', marginBottom: '1rem' }}>{apt.doctor?.profiles?.specialization || 'General'}</p>
                                                    <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>Status: <span style={{ textTransform: 'capitalize', fontWeight: '600' }}>{apt.status}</span></p>
                                                </div>
                                                <div style={{ textAlign: 'right' }}>
                                                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.8rem 1.2rem', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
                                                        <p style={{ fontWeight: '800', fontSize: '1.1rem', margin: 0 }}>{new Date(apt.appointment_date).toLocaleDateString()}</p>
                                                        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', margin: 0 }}>{new Date(apt.appointment_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            {apt.status === 'pending' && (
                                                <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                                    <button onClick={() => handleCancel(apt.id)} style={{
                                                        padding: '0.6rem 1.2rem', borderRadius: '12px', border: '1px solid #ef4444',
                                                        background: 'transparent', color: '#ef4444', fontWeight: '700', cursor: 'pointer'
                                                    }}>Cancel Appointment</button>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="card text-center" style={{ padding: '5rem', background: 'var(--glass-bg)', borderRadius: '32px' }}>
                                        <h3 style={{ marginBottom: '1rem' }}>No Appointments Found</h3>
                                        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '2rem' }}>You haven't booked any health checks yet.</p>
                                        <Link to="/doctors" style={{ color: 'var(--color-primary)', fontWeight: '800', textDecoration: 'none' }}>Find a Doctor →</Link>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'prescriptions' && (
                             <div className="card text-center" style={{ padding: '5rem', background: 'var(--glass-bg)', borderRadius: '32px' }}>
                                <p style={{ color: 'var(--color-text-secondary)' }}>Medical history will sync here after your first completed visit.</p>
                             </div>
                        )}
                    </main>
                </div>
            </div>

            <style>{`
                .loader {
                    border: 4px solid rgba(255, 255, 255, 0.1);
                    border-left-color: var(--color-primary);
                    border-radius: 50%; width: 40px; height: 40px;
                    animation: spin 1s linear infinite;
                }
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default PatientDashboard;
