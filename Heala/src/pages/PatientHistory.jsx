import React, { useState, useEffect } from 'react';
import { supabase } from '../config/supabaseConfig';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import HealaLoader from '../components/HealaLoader';

const PatientHistory = () => {
    const { user } = useAuth();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('active'); // 'active' or 'past'

    useEffect(() => {
        if (user) {
            fetchAppointments();
        }
    }, [user]);

    const fetchAppointments = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('appointments')
                .select(`
                    *,
                    doctor:doctors(
                        profiles(name),
                        clinic_name,
                        specialization
                    ),
                    prescriptions(id)
                `)
                .eq('patient_id', user.id)
                .order('appointment_date', { ascending: false })
                .order('appointment_time', { ascending: false });

            if (error) throw error;
            setAppointments(data || []);
        } catch (err) {
            console.error("Error fetching patient history:", err);
        } finally {
            setLoading(false);
        }
    };

    const activeApts = appointments.filter(apt => ['pending', 'accepted', 'arrived'].includes(apt.status));
    const pastApts = appointments.filter(apt => ['completed', 'cancelled'].includes(apt.status));

    const displayedApts = filter === 'active' ? activeApts : pastApts;

    if (loading) return <HealaLoader fullScreen={true} />;

    return (
        <div style={{ padding: '8rem 2rem 4rem 2rem', maxWidth: '1200px', margin: '0 auto', minHeight: '100vh', background: 'var(--color-bg)' }}>
            <div style={{ marginBottom: '3rem' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>My Appointments</h1>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.1rem' }}>Track your medical visits and access digital prescriptions.</p>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                <button 
                    onClick={() => setFilter('active')}
                    style={{
                        padding: '0.8rem 1.5rem',
                        borderRadius: '12px',
                        border: 'none',
                        background: filter === 'active' ? 'var(--color-primary)' : 'var(--color-bg-secondary)',
                        color: filter === 'active' ? 'white' : 'var(--color-text-primary)',
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                    }}
                >
                    Active ({activeApts.length})
                </button>
                <button 
                    onClick={() => setFilter('past')}
                    style={{
                        padding: '0.8rem 1.5rem',
                        borderRadius: '12px',
                        border: 'none',
                        background: filter === 'past' ? 'var(--color-primary)' : 'var(--color-bg-secondary)',
                        color: filter === 'past' ? 'white' : 'var(--color-text-primary)',
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                    }}
                >
                    History ({pastApts.length})
                </button>
            </div>

            <div style={{ display: 'grid', gap: '1.5rem' }}>
                {displayedApts.length > 0 ? displayedApts.map(apt => (
                    <div key={apt.id} style={{ 
                        background: 'var(--color-surface)', 
                        border: '1px solid var(--border)', 
                        borderRadius: '20px', 
                        padding: '1.5rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '2rem',
                        flexWrap: 'wrap',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
                    }}>
                        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                            <div style={{ 
                                width: '60px', 
                                height: '60px', 
                                borderRadius: '15px', 
                                background: 'var(--gradient-primary)', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                color: 'white',
                                fontWeight: 900,
                                fontSize: '1.5rem'
                            }}>
                                {apt.doctor?.profiles?.name?.[0] || 'D'}
                            </div>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>Dr. {apt.doctor?.profiles?.name}</h3>
                                <p style={{ margin: '4px 0', fontSize: '0.9rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                                    {apt.doctor?.specialization} • {apt.doctor?.clinic_name}
                                </p>
                                <div style={{ display: 'flex', gap: '1rem', marginTop: '8px' }}>
                                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                                        📅 {new Date(apt.appointment_date).toLocaleDateString()}
                                    </span>
                                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text-secondary)' }}>
                                        ⏰ {apt.appointment_time}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ textAlign: 'right' }}>
                                <span style={{ 
                                    display: 'inline-block',
                                    padding: '6px 12px',
                                    borderRadius: '8px',
                                    fontSize: '0.75rem',
                                    fontWeight: 800,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px',
                                    background: apt.status === 'completed' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                                    color: apt.status === 'completed' ? '#10b981' : '#3b82f6'
                                }}>
                                    {apt.status}
                                </span>
                            </div>
                            
                            {apt.prescriptions && apt.prescriptions.length > 0 && (
                                <Link 
                                    to={`/prescription/${apt.id}`}
                                    style={{
                                        padding: '10px 20px',
                                        background: 'var(--color-primary)',
                                        color: 'white',
                                        borderRadius: '12px',
                                        textDecoration: 'none',
                                        fontWeight: 700,
                                        fontSize: '0.9rem',
                                        boxShadow: '0 8px 16px rgba(139, 92, 246, 0.2)',
                                        transition: 'all 0.3s ease'
                                    }}
                                    onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                                    onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                                >
                                    📄 Digital Prescription
                                </Link>
                            )}
                        </div>
                    </div>
                )) : (
                    <div style={{ padding: '5rem', textAlign: 'center', background: 'var(--color-surface)', borderRadius: '24px', border: '1px dashed var(--border)' }}>
                        <p style={{ color: 'var(--color-text-muted)', fontWeight: 600, fontSize: '1.1rem' }}>
                            No {filter} appointments found.
                        </p>
                        {filter === 'active' && <Link to="/doctors" style={{ color: 'var(--color-primary)', fontWeight: 700, textDecoration: 'none', display: 'inline-block', marginTop: '1rem' }}>Book a New Appointment</Link>}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PatientHistory;
