import React, { useState, useEffect } from 'react';
import { supabase } from '../config/supabaseConfig';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import HealaLoader from '../components/HealaLoader';

const Notifications = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [notifications, setNotifications] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchNotifications = async () => {
            if (!user) return;
            setLoading(true);
            try {
                // Fetch News Addressed to Everyone
                const { data: newsData, error: newsError } = await supabase
                    .from('news')
                    .select('*')
                    .order('created_at', { ascending: false });
                
                if (newsError) throw newsError;

                // Fetch Prescriptions for this Patient
                const { data: presData, error: presError } = await supabase
                    .from('prescriptions')
                    .select('*, doctor:doctors(*, profile:profiles(name))')
                    .eq('patient_id', user.id)
                    .order('created_at', { ascending: false });

                if (presError) throw presError;

                // Standardize the shape to match a unified Notification type
                const unified = [];

                if (newsData) {
                    newsData.forEach(item => {
                        unified.push({
                            id: `news-${item.id}`,
                            type: 'news',
                            title: item.title,
                            message: item.content,
                            date: new Date(item.created_at),
                            originalData: item
                        });
                    });
                }

                if (presData) {
                    presData.forEach(item => {
                        unified.push({
                            id: `pres-${item.id}`,
                            type: 'prescription',
                            title: `New Digital Prescription`,
                            message: `Dr. ${item.doctor?.profile?.name || 'Practitioner'} has issued a new prescription for your recent visit.`,
                            date: new Date(item.created_at),
                            link: `/prescription/${item.appointment_id}`,
                            originalData: item
                        });
                    });
                }

                // Sort unified array chronologically (newest first)
                unified.sort((a, b) => b.date - a.date);

                setNotifications(unified);
            } catch (err) {
                console.error("Fetch notifications error", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();
    }, [user]);

    if (loading) return <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><HealaLoader /></div>;

    return (
        <div style={{ padding: '8rem 2rem 4rem 2rem', maxWidth: '800px', margin: '0 auto', minHeight: '100vh', fontFamily: '"DM Sans", sans-serif' }}>
            <h2 style={{ fontFamily: '"Playfair Display", serif', fontSize: '2.5rem', color: '#0f172a', marginBottom: '2rem', borderBottom: '2px solid var(--border)', paddingBottom: '1rem' }}>Notifications Feed</h2>

            {error && <div style={{ padding: '1rem', background: '#fef2f2', color: '#ef4444', borderRadius: '12px', marginBottom: '1rem', fontWeight: 600 }}>{error}</div>}

            {notifications.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'var(--color-surface)', borderRadius: '24px', border: '1px solid var(--border)' }}>
                    <h3 style={{ fontSize: '1.25rem', color: 'var(--color-text-primary)' }}>You're all caught up!</h3>
                    <p style={{ color: 'var(--color-text-muted)' }}>You have no new notifications.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {notifications.map(item => (
                        <div key={item.id} style={{
                            padding: '1.5rem',
                            background: 'white',
                            borderRadius: '16px',
                            border: '1px solid var(--border)',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                            display: 'flex',
                            gap: '1.5rem',
                            alignItems: 'flex-start'
                        }}>
                            <div style={{
                                width: '48px', height: '48px', borderRadius: '12px', flexShrink: 0,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                background: item.type === 'news' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(20, 184, 166, 0.1)',
                                color: item.type === 'news' ? '#3b82f6' : '#14b8a6',
                                fontSize: '1.5rem'
                            }}>
                                {item.type === 'news' ? '📢' : '⚕️'}
                            </div>

                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                    <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>{item.title}</h3>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>{item.date.toLocaleDateString()}</span>
                                </div>
                                <p style={{ margin: '0 0 1rem 0', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>{item.message}</p>
                                
                                {item.type === 'prescription' && item.link && (
                                    <Link to={item.link} style={{
                                        display: 'inline-block',
                                        padding: '10px 20px',
                                        background: 'var(--color-primary)',
                                        color: 'white',
                                        textDecoration: 'none',
                                        borderRadius: '8px',
                                        fontWeight: 700,
                                        fontSize: '0.9rem',
                                        boxShadow: '0 4px 10px rgba(139, 92, 246, 0.2)'
                                    }}>
                                        View Digital Prescription
                                    </Link>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Notifications;
