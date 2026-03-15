import React, { useState, useEffect } from 'react';
import { supabase } from '../config/supabaseConfig';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ModernDropdown from '../components/ModernDropdown';

const AdminDashboard = () => {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [news, setNews] = useState([]);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('stats');
    
    // News Form State
    const [newsTitle, setNewsTitle] = useState('');
    const [newsContent, setNewsContent] = useState('');
    const [newsCategory, setNewsCategory] = useState('Health');

    useEffect(() => {
        fetchInitialData();
        setupRealtime();
    }, []);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const [
                { data: userData },
                { data: docData },
                { data: aptData },
                { data: newsData },
                { data: logsData }
            ] = await Promise.all([
                supabase.from('profiles').select('*').order('created_at', { ascending: false }),
                supabase.from('doctors').select('*, profiles(name, email)').order('created_at', { ascending: false }),
                supabase.from('appointments').select('*, patient:patient_id(profiles(name)), doctor:doctor_id(profiles(name))').order('created_at', { ascending: false }),
                supabase.from('news').select('*').order('created_at', { ascending: false }),
                supabase.from('activity_logs').select('*').order('created_at', { ascending: false }).limit(20)
            ]);

            setUsers(userData || []);
            setDoctors(docData || []);
            setAppointments(aptData || []);
            setNews(newsData || []);
            setLogs(logsData || []);
        } catch (error) {
            console.error('Error fetching data:', error.message);
        } finally {
            setLoading(false);
        }
    };

    const setupRealtime = () => {
        const profileSub = supabase.channel('profiles_realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => fetchDataSync())
            .subscribe();

        const doctorSub = supabase.channel('doctors_realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'doctors' }, () => fetchDataSync())
            .subscribe();

        const newsSub = supabase.channel('news_realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'news' }, () => fetchDataSync())
            .subscribe();

        const logsSub = supabase.channel('logs_realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'activity_logs' }, () => fetchDataSync())
            .subscribe();

        return () => {
            supabase.removeChannel(profileSub);
            supabase.removeChannel(doctorSub);
            supabase.removeChannel(newsSub);
            supabase.removeChannel(logsSub);
        };
    };

    const fetchDataSync = async () => {
        // Light refresh for real-time
        const { data: userData } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
        const { data: docData } = await supabase.from('doctors').select('*, profiles(name, email)').order('created_at', { ascending: false });
        const { data: newsData } = await supabase.from('news').select('*').order('created_at', { ascending: false });
        const { data: logsData } = await supabase.from('activity_logs').select('*').order('created_at', { ascending: false }).limit(20);
        
        setUsers(userData || []);
        setDoctors(docData || []);
        setNews(newsData || []);
        setLogs(logsData || []);
    };

    const logActivity = async (action, details = {}) => {
        await supabase.from('activity_logs').insert([{ action, details: { ...details, performed_by: currentUser?.email } }]);
    };

    const handleUserDelete = async (id, name) => {
        if (window.confirm(`Delete user ${name}? This cannot be undone.`)) {
            const { error } = await supabase.from('profiles').delete().eq('id', id);
            if (!error) logActivity('USER_DELETED', { deleted_user: name });
        }
    };

    const handleVerification = async (doc, status) => {
        // Optimistic Update
        const previousDoctors = [...doctors];
        setDoctors(prev => prev.map(d => d.id === doc.id ? { ...d, verification_status: status } : d));

        try {
            const { error } = await supabase.from('doctors').update({ verification_status: status }).eq('id', doc.id);
            if (error) throw error;
            logActivity('DOCTOR_VERIFIED', { doctor: doc.profiles?.name, status });
            // Alert is slow, let's use a non-blocking notification if possible, but for now just console
            console.log(`Doctor ${status} successfully!`);
        } catch (error) {
            console.error('Error verifying doctor:', error.message);
            setDoctors(previousDoctors); // Rollback
            alert('Failed to update status: ' + error.message);
        }
    };

    const handlePostNews = async (e) => {
        e.preventDefault();
        try {
            const { error } = await supabase.from('news').insert([{
                title: newsTitle,
                content: newsContent,
                category: newsCategory
            }]);
            if (error) throw error;
            logActivity('NEWS_POSTED', { title: newsTitle });
            setNewsTitle('');
            setNewsContent('');
            alert('News posted successfully!');
        } catch (error) {
            alert(error.message);
        }
    };

    const handleDeleteNews = async (id, title) => {
        if (window.confirm('Delete this news post?')) {
            const { error } = await supabase.from('news').delete().eq('id', id);
            if (!error) logActivity('NEWS_DELETED', { title });
        }
    };

    const stats = [
        { label: 'Cloud Users', value: users.length, color: 'var(--color-primary)' },
        { label: 'Verified Experts', value: doctors.filter(d => d.verification_status === 'approved').length, color: '#ec4899' },
        { label: 'Pending Requests', value: doctors.filter(d => d.verification_status === 'pending').length, color: '#f59e0b' },
        { label: 'Health Posts', value: news.length, color: '#10b981' }
    ];

    if (loading) return (
        <div style={{ minHeight: '100vh', background: 'var(--color-bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '50px', height: '50px', border: '5px solid var(--glass-border)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', background: 'var(--color-bg-primary)', padding: '5rem 2rem', position: 'relative' }}>
            {/* Ambient Background */}
            <div style={{ position: 'absolute', top: '10%', right: '10%', width: '50vw', height: '50vw', background: 'radial-gradient(circle, var(--color-primary) 0%, transparent 70%)', filter: 'blur(150px)', opacity: 0.05, zIndex: 0 }} />

            <div className="container" style={{ maxWidth: '1400px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4rem' }}>
                    <div>
                        <div 
                            style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', opacity: 0.6, transition: 'all 0.3s ease', cursor: 'pointer', marginBottom: '1.5rem' }}
                            className="js-corp-brand"
                            onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                            onMouseLeave={(e) => e.currentTarget.style.opacity = '0.6'}
                        >
                            <div style={{ width: '32px', height: '32px', background: 'var(--color-primary)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: '900', color: 'white' }}>JS</div>
                            <span style={{ fontSize: '0.85rem', fontWeight: '800', letterSpacing: '1px', color: 'var(--color-text-primary)' }}>JS CORPORATIONS</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                            <span style={{ padding: '0.4rem 1rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '900' }}>PRECISION ACCESS</span>
                            <h1 style={{ fontSize: '3rem', fontWeight: '900', color: 'var(--color-text-primary)', margin: 0, letterSpacing: '-2px' }}>Admin Dashboard</h1>
                        </div>
                        <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.2rem' }}>Real-time Gateway: <span style={{ color: '#10b981', fontWeight: '800' }}>LIVE_SYNC</span></p>
                    </div>
                </header>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2rem', marginBottom: '4rem' }}>
                    {stats.map(stat => (
                        <div key={stat.label} style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(20px)', border: '1px solid var(--glass-border)', borderRadius: '32px', padding: '2.5rem', textAlign: 'center', transition: 'all 0.3s ease' }}>
                            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-text-secondary)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>{stat.label}</p>
                            <h2 style={{ margin: '1rem 0 0', fontSize: '2.5rem', fontWeight: '900', color: stat.color }}>{stat.value}</h2>
                        </div>
                    ))}
                </div>

                <div style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(30px)', border: '1px solid var(--glass-border)', borderRadius: '40px', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--glass-border)', overflowX: 'auto' }}>
                        {['stats', 'verification', 'users', 'news', 'logs'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                style={{
                                    padding: '2rem 2.5rem', border: 'none', background: 'transparent', 
                                    color: activeTab === tab ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                                    fontWeight: '900', fontSize: '1rem', cursor: 'pointer', position: 'relative', textTransform: 'uppercase', letterSpacing: '1px',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                {tab}
                                {tab === 'verification' && doctors.filter(d => d.verification_status === 'pending').length > 0 && (
                                    <span style={{ marginLeft: '10px', background: '#ef4444', color: 'white', padding: '2px 8px', borderRadius: '6px', fontSize: '0.7rem' }}>
                                        {doctors.filter(d => d.verification_status === 'pending').length}
                                    </span>
                                )}
                                {activeTab === tab && <div style={{ position: 'absolute', bottom: 0, left: '20%', right: '20%', height: '4px', background: 'var(--color-primary)', borderRadius: '4px' }} />}
                            </button>
                        ))}
                    </div>

                    <div style={{ padding: '3rem' }}>
                        {activeTab === 'stats' && (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
                                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '2.5rem', borderRadius: '32px', border: '1px solid var(--glass-border)' }}>
                                    <h4 style={{ margin: '0 0 2rem', fontSize: '1.4rem', fontWeight: '800' }}>Real-time Feed</h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        {appointments.slice(0, 5).map(apt => (
                                            <div key={apt.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px solid var(--glass-border)' }}>
                                                <span style={{ fontWeight: '700' }}>{apt.patient?.profiles?.name} booked {apt.doctor?.profiles?.name}</span>
                                                <span style={{ padding: '0.4rem 1rem', background: 'rgba(139, 92, 246, 0.1)', color: 'var(--color-primary)', borderRadius: '10px', fontSize: '0.75rem', fontWeight: '900' }}>{apt.status}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '2.5rem', borderRadius: '32px', border: '1px solid var(--glass-border)' }}>
                                    <h4 style={{ margin: '0 0 2rem', fontSize: '1.4rem', fontWeight: '800' }}>Recent Logs</h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        {logs.slice(0, 5).map(log => (
                                            <div key={log.id} style={{ padding: '1.2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px solid var(--glass-border)' }}>
                                                <div style={{ fontWeight: '800', fontSize: '0.9rem', marginBottom: '0.3rem' }}>{log.action}</div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>{new Date(log.created_at).toLocaleString()} by {log.details?.performed_by}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'verification' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                {doctors.filter(d => d.verification_status === 'pending').map(doc => (
                                    <div key={doc.id} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', borderRadius: '24px', padding: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                                            <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '900', fontSize: '1.5rem' }}>
                                                {doc.profiles?.name?.charAt(0)}
                                            </div>
                                            <div>
                                                <h4 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '900' }}>{doc.profiles?.name}</h4>
                                                <p style={{ margin: '0.2rem 0', color: 'var(--color-text-secondary)', fontWeight: '600' }}>{doc.specialization} • {doc.qualification}</p>
                                                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-tertiary)' }}>License: {doc.license_number} | {doc.clinic_name}</p>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '1rem' }}>
                                            <button onClick={() => handleVerification(doc, 'approved')} style={{ padding: '0.8rem 1.5rem', borderRadius: '12px', border: 'none', background: '#10b981', color: 'white', fontWeight: '800', cursor: 'pointer' }}>Approve</button>
                                            <button onClick={() => handleVerification(doc, 'rejected')} style={{ padding: '0.8rem 1.5rem', borderRadius: '12px', border: '1px solid #ef4444', background: 'transparent', color: '#ef4444', fontWeight: '800', cursor: 'pointer' }}>Reject</button>
                                        </div>
                                    </div>
                                ))}
                                {doctors.filter(d => d.verification_status === 'pending').length === 0 && <p style={{ textAlign: 'center', color: 'var(--color-text-secondary)' }}>No pending verifications.</p>}
                            </div>
                        )}

                        {activeTab === 'users' && (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                                {users.map(u => (
                                    <div key={u.id} style={{ background: 'rgba(255,255,255,0.02)', padding: '2rem', borderRadius: '24px', border: '1px solid var(--glass-border)', position: 'relative' }}>
                                        <span style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', padding: '0.3rem 0.6rem', background: u.role === 'admin' ? '#ef4444' : 'var(--color-primary)', color: 'white', fontSize: '0.7rem', borderRadius: '8px', fontWeight: '900' }}>{u.role.toUpperCase()}</span>
                                        <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800' }}>{u.name}</h4>
                                        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>{u.email}</p>
                                        {u.role !== 'admin' && (
                                            <button onClick={() => handleUserDelete(u.id, u.name)} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #ef4444', color: '#ef4444', background: 'transparent', fontWeight: '700', cursor: 'pointer' }}>Erase Identity</button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeTab === 'news' && (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '3rem' }}>
                                <form onSubmit={handlePostNews} style={{ background: 'rgba(255,255,255,0.02)', padding: '2.5rem', borderRadius: '32px', border: '1px solid var(--glass-border)', height: 'fit-content' }}>
                                    <h4 style={{ margin: '0 0 2rem', fontSize: '1.2rem', fontWeight: '800' }}>Post New Update</h4>
                                    <input value={newsTitle} onChange={e => setNewsTitle(e.target.value)} placeholder="Title" required style={{ width: '100%', padding: '1rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', borderRadius: '12px', color: 'white', marginBottom: '1rem' }} />
                                    <ModernDropdown
                                        placeholder="Select Category"
                                        options={[
                                            { value: 'Health', label: 'Health Tip' },
                                            { value: 'Update', label: 'Platform Update' },
                                            { value: 'Emergency', label: 'Emergency Alert' }
                                        ]}
                                        value={newsCategory}
                                        onChange={(val) => setNewsCategory(val)}
                                        containerStyle={{ marginBottom: '1rem' }}
                                    />
                                    <textarea value={newsContent} onChange={e => setNewsContent(e.target.value)} placeholder="Content..." required rows="5" style={{ width: '100%', padding: '1rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', borderRadius: '12px', color: 'white', marginBottom: '1.5rem', resize: 'none' }} />
                                    <button type="submit" style={{ width: '100%', padding: '1rem', borderRadius: '12px', background: 'var(--color-primary)', color: 'white', fontWeight: '800', border: 'none', cursor: 'pointer' }}>Publish Now</button>
                                </form>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    {news.map(n => (
                                        <div key={n.id} style={{ background: 'rgba(255,255,255,0.02)', padding: '2rem', borderRadius: '24px', border: '1px solid var(--glass-border)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                                <span style={{ color: 'var(--color-primary)', fontWeight: '900', fontSize: '0.8rem' }}>{n.category.toUpperCase()}</span>
                                                <button onClick={() => handleDeleteNews(n.id, n.title)} style={{ background: 'none', border: 'none', color: '#ef4444', fontWeight: '900', cursor: 'pointer' }}>DELETE</button>
                                            </div>
                                            <h4 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800' }}>{n.title}</h4>
                                            <p style={{ color: 'var(--color-text-secondary)', lineHeight: '1.6' }}>{n.content}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'logs' && (
                            <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '32px', border: '1px solid var(--glass-border)', padding: '2rem', fontFamily: 'monospace' }}>
                                {logs.map(log => (
                                    <div key={log.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '1rem 0', color: '#10b981' }}>
                                        <span style={{ color: 'var(--color-text-secondary)' }}>[{new Date(log.created_at).toLocaleString()}]</span> {log.action} : {JSON.stringify(log.details)}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <style>{` @keyframes spin { to { transform: rotate(360deg); } } `}</style>
        </div>
    );
};

export default AdminDashboard;
