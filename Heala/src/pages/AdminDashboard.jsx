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
    const [activePage, setActivePage] = useState('overview');
    
    // News Form State
    const [newsTitle, setNewsTitle] = useState('');
    const [newsContent, setNewsContent] = useState('');
    const [newsCategory, setNewsCategory] = useState('Health');

    // Messaging State
    const [msgUser, setMsgUser] = useState(null);
    const [msgTitle, setMsgTitle] = useState('');
    const [msgContent, setMsgContent] = useState('');
    const [isSendingMsg, setIsSendingMsg] = useState(false);

    useEffect(() => {
        fetchInitialData();
        const cleanup = setupRealtime();
        return cleanup;
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
                supabase.from('activity_logs').select('*').order('created_at', { ascending: false }).limit(50)
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
        // Use a single channel for all admin-related updates for efficiency
        const adminChannel = supabase.channel('admin_core_wall')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => fetchDataSync())
            .on('postgres_changes', { event: '*', schema: 'public', table: 'doctors' }, () => fetchDataSync())
            .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, () => fetchDataSync())
            .on('postgres_changes', { event: '*', schema: 'public', table: 'news' }, () => fetchDataSync())
            .on('postgres_changes', { event: '*', schema: 'public', table: 'activity_logs' }, () => fetchDataSync())
            .subscribe();

        return () => {
            supabase.removeChannel(adminChannel);
        };
    };

    const fetchDataSync = async () => {
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
            supabase.from('activity_logs').select('*').order('created_at', { ascending: false }).limit(50)
        ]);
        
        setUsers(userData || []);
        setDoctors(docData || []);
        setAppointments(aptData || []);
        setNews(newsData || []);
        setLogs(logsData || []);
    };

    const logActivity = async (action, details = {}) => {
        await supabase.from('activity_logs').insert([{ action, details: { ...details, performed_by: currentUser?.email } }]);
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!msgUser) return;
        setIsSendingMsg(true);
        try {
            const { error } = await supabase.from('notifications').insert([{
                user_id: msgUser.id,
                title: msgTitle,
                message: msgContent,
                type: 'direct_message'
            }]);

            if (error) throw error;

            logActivity('MSG_SENT', { recipient: msgUser.email });
            alert(`Message sent to ${msgUser.name}`);
            setMsgUser(null);
            setMsgTitle('');
            setMsgContent('');
        } catch (err) {
            console.error('Message failure:', err);
            alert(`Failed to send message: ${err.message}`);
        } finally {
            setIsSendingMsg(false);
        }
    };

    const handleVerification = async (doc, status) => {
        const previousDoctors = [...doctors];
        setDoctors(prev => prev.map(d => d.id === doc.id ? { ...d, verification_status: status } : d));

        try {
            const { error } = await supabase.from('doctors').update({ verification_status: status }).eq('id', doc.id);
            if (error) throw error;
            logActivity('DOCTOR_VERIFIED', { doctor: doc.profiles?.name, status });
        } catch (error) {
            console.error('Error verifying doctor:', error.message);
            setDoctors(previousDoctors);
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

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if (!error) window.location.href = '/login';
    };

    const handleDeleteNews = async (id, title) => {
        if (window.confirm('Delete this news post?')) {
            const { error } = await supabase.from('news').delete().eq('id', id);
            if (!error) logActivity('NEWS_DELETED', { title });
        }
    };

    const navItems = [
        { id: 'overview', label: 'Overview', icon: '📊' },
        { id: 'verification', label: 'Doctor Verifications', icon: '🩺', badge: doctors.filter(d => d.verification_status === 'pending').length },
        { id: 'users', label: 'Platform Users', icon: '👤' },
        { id: 'news', label: 'Health News', icon: '📢' },
        { id: 'logs', label: 'Activity Logs', icon: '📜' },
    ];

    if (loading) return (
        <div style={{ minHeight: '100vh', background: 'var(--color-bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '50px', height: '50px', border: '5px solid var(--glass-border)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        </div>
    );

    const renderOverview = () => (
        <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
                <StatCard label="Total Users" value={users.length} icon="👥" color="#6366f1" />
                <StatCard label="Approved Doctors" value={doctors.filter(d => d.verification_status === 'approved').length} icon="👨‍⚕️" color="#10b981" />
                <StatCard label="Pending Verifications" value={doctors.filter(d => d.verification_status === 'pending').length} icon="⏳" color="#f59e0b" />
                <StatCard label="News Posts" value={news.length} icon="🗞️" color="#ec4899" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
                <div style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(20px)', border: '1px solid var(--glass-border)', borderRadius: '24px', padding: '2rem' }}>
                    <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.25rem', fontWeight: 800 }}>Platform Pulse</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {appointments.slice(0, 8).map(apt => (
                            <div key={apt.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900 }}>{apt.patient?.profiles?.name?.[0]}</div>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{apt.patient?.profiles?.name}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>Booked Dr. {apt.doctor?.profiles?.name}</div>
                                    </div>
                                </div>
                                <span style={{ padding: '6px 12px', background: 'rgba(139, 92, 246, 0.1)', color: 'var(--color-primary)', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase' }}>{apt.status}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(20px)', border: '1px solid var(--glass-border)', borderRadius: '24px', padding: '2rem' }}>
                    <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.25rem', fontWeight: 800 }}>Recent System Events</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {logs.slice(0, 10).map(log => (
                            <div key={log.id} style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
                                <div style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--color-primary)', marginBottom: '4px' }}>{log.action}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>{new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {log.details?.performed_by?.split('@')[0]}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    const renderVerification = () => (
        <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '2rem' }}>Credential Verification</h2>
            <div style={{ display: 'grid', gap: '1.5rem' }}>
                {doctors.filter(d => activePage === 'verification' ? (d.verification_status === 'pending') : true).map(doc => (
                    <div key={doc.id} style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '24px', padding: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                            <div style={{ width: '70px', height: '70px', borderRadius: '18px', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900, fontSize: '1.8rem' }}>
                                {doc.profiles?.name?.charAt(0)}
                            </div>
                            <div>
                                <h4 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    {doc.profiles?.name}
                                    <span style={{ fontSize: '0.7rem', padding: '4px 8px', borderRadius: '6px', background: doc.verification_status === 'approved' ? '#10b98120' : '#f59e0b20', color: doc.verification_status === 'approved' ? '#10b981' : '#f59e0b' }}>
                                        {doc.verification_status.toUpperCase()}
                                    </span>
                                </h4>
                                <p style={{ margin: '6px 0', color: 'var(--color-text-secondary)', fontWeight: 600 }}>{doc.specialization} • {doc.qualification}</p>
                                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-tertiary)', fontWeight: 600 }}>License: {doc.license_number} | {doc.clinic_name}</p>
                            </div>
                        </div>
                        {doc.verification_status === 'pending' && (
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button onClick={() => handleVerification(doc, 'approved')} style={{ padding: '0.8rem 1.8rem', borderRadius: '14px', border: 'none', background: '#10b981', color: 'white', fontWeight: '800', cursor: 'pointer', transition: 'all 0.3s ease' }}>Verify & Approve</button>
                                <button onClick={() => handleVerification(doc, 'rejected')} style={{ padding: '0.8rem 1.8rem', borderRadius: '14px', border: '1px solid #ef4444', background: 'transparent', color: '#ef4444', fontWeight: '800', cursor: 'pointer' }}>Reject</button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );

    const renderUsers = () => (
        <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '2rem' }}>Identity Management</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                {users.map(u => (
                    <div key={u.id} style={{ background: 'var(--glass-bg)', padding: '2rem', borderRadius: '24px', border: '1px solid var(--glass-border)', position: 'relative' }}>
                        <span style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', padding: '6px 10px', background: u.role === 'admin' ? '#ef4444' : 'var(--color-primary)', color: 'white', fontSize: '0.65rem', borderRadius: '8px', fontWeight: '900', letterSpacing: '1px' }}>{u.role.toUpperCase()}</span>
                        <h4 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800' }}>{u.name}</h4>
                        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginBottom: '1.8rem', fontWeight: 600 }}>{u.email}</p>
                        {u.role !== 'admin' && (
                            <button onClick={() => setMsgUser(u)} style={{ width: '100%', padding: '0.9rem', borderRadius: '14px', border: '1px solid var(--color-primary)', color: 'var(--color-primary)', background: 'rgba(139, 92, 246, 0.05)', fontWeight: '800', cursor: 'pointer', transition: 'all 0.3s ease' }}>Message</button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );

    const renderNews = () => (
        <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '2rem' }}>Platform Announcements</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '3rem' }}>
                <form onSubmit={handlePostNews} style={{ background: 'var(--glass-bg)', padding: '2.5rem', borderRadius: '32px', border: '1px solid var(--glass-border)', height: 'fit-content' }}>
                    <h4 style={{ margin: '0 0 2rem', fontSize: '1.3rem', fontWeight: '800' }}>Broadcast Message</h4>
                    <input value={newsTitle} onChange={e => setNewsTitle(e.target.value)} placeholder="Headline" required style={{ width: '100%', padding: '1.2rem', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: '14px', color: 'var(--color-text-primary)', marginBottom: '1.2rem', fontWeight: 600, outline: 'none' }} />
                    <ModernDropdown
                        placeholder="Importance"
                        options={[
                            { value: 'Health', label: 'Health Perspective' },
                            { value: 'Update', label: 'Platform Upgrade' },
                            { value: 'Emergency', label: 'CRITICAL ALERT' }
                        ]}
                        value={newsCategory}
                        onChange={(val) => setNewsCategory(val)}
                        containerStyle={{ marginBottom: '1.2rem' }}
                    />
                    <textarea value={newsContent} onChange={e => setNewsContent(e.target.value)} placeholder="Broadcast content details..." required rows="6" style={{ width: '100%', padding: '1.2rem', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: '14px', color: 'var(--color-text-primary)', marginBottom: '1.8rem', resize: 'none', fontWeight: 500, outline: 'none' }} />
                    <button type="submit" style={{ width: '100%', padding: '1.2rem', borderRadius: '14px', background: 'var(--color-primary)', color: 'white', fontWeight: '900', border: 'none', cursor: 'pointer', boxShadow: '0 10px 20px rgba(139, 92, 246, 0.3)' }}>Deploy Broadcast</button>
                </form>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {news.map(n => (
                        <div key={n.id} style={{ background: 'var(--glass-bg)', padding: '2rem', borderRadius: '24px', border: '1px solid var(--glass-border)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
                                <span style={{ padding: '4px 10px', borderRadius: '6px', background: n.category === 'Emergency' ? '#ef444420' : 'var(--color-primary)20', color: n.category === 'Emergency' ? '#ef4444' : 'var(--color-primary)', fontWeight: '900', fontSize: '0.7rem' }}>{n.category.toUpperCase()}</span>
                                <button onClick={() => handleDeleteNews(n.id, n.title)} style={{ background: 'none', border: 'none', color: '#ef4444', fontWeight: '900', cursor: 'pointer', opacity: 0.6 }}>RECALL</button>
                            </div>
                            <h4 style={{ margin: 0, fontSize: '1.3rem', fontWeight: '800', marginBottom: '0.5rem' }}>{n.title}</h4>
                            <p style={{ color: 'var(--color-text-secondary)', lineHeight: '1.7', fontWeight: 500 }}>{n.content}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderLogs = () => (
        <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '2rem' }}>Security & Activity Console</h2>
            <div style={{ background: '#020617', borderRadius: '24px', border: '1px solid var(--glass-border)', padding: '2rem', fontFamily: '"JetBrains Mono", monospace', maxHeight: '70vh', overflowY: 'auto' }}>
                {logs.map(log => (
                    <div key={log.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '1.2rem 0', display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
                        <span style={{ color: '#475569', fontWeight: 600, fontSize: '0.85rem' }}>{new Date(log.created_at).toLocaleString()}</span>
                        <div style={{ flex: 1 }}>
                            <div style={{ color: '#10b981', fontWeight: 700, fontSize: '0.9rem' }}>{log.action}</div>
                            <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: '4px' }}>
                                Agent: {log.details?.performed_by} | Payload: {JSON.stringify(log.details)}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', background: 'var(--color-bg-primary)', display: 'flex', color: 'var(--color-text-primary)' }}>
            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes spin { to { transform: rotate(360deg); } }
                ::-webkit-scrollbar { width: 6px; }
                ::-webkit-scrollbar-track { background: transparent; }
                ::-webkit-scrollbar-thumb { background: var(--glass-border); borderRadius: 10px; }
            `}</style>

            {/* Fixed Sidebar */}
            <aside style={{ width: '280px', height: '100vh', position: 'fixed', left: 0, top: 0, background: 'var(--glass-bg)', backdropFilter: 'blur(40px)', borderRight: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', zIndex: 100 }}>
                <div style={{ padding: '2.5rem', borderBottom: '1px solid var(--glass-border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.5rem' }}>
                        <div style={{ width: '40px', height: '40px', background: 'var(--color-primary)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: '900', color: 'white' }}>JS</div>
                        <span style={{ fontSize: '1.2rem', fontWeight: '900', letterSpacing: '-1px' }}>Heala Admin</span>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.65rem', fontWeight: '900', color: 'var(--color-text-tertiary)', letterSpacing: '2px' }}>CORE INFRASTRUCTURE</p>
                </div>

                <nav style={{ flex: 1, padding: '2rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {navItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActivePage(item.id)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.5rem', borderRadius: '15px', border: 'none', background: activePage === item.id ? 'var(--gradient-primary)' : 'transparent', color: activePage === item.id ? 'white' : 'var(--color-text-secondary)', fontWeight: 800, cursor: 'pointer', transition: 'all 0.3s ease', textAlign: 'left', position: 'relative'
                            }}
                        >
                            <span>{item.icon}</span>
                            <span style={{ fontSize: '0.95rem' }}>{item.label}</span>
                            {item.badge > 0 && (
                                <span style={{ position: 'absolute', right: '1rem', background: '#ef4444', color: 'white', fontSize: '0.65rem', padding: '2px 7px', borderRadius: '100px', fontWeight: 900 }}>{item.badge}</span>
                            )}
                        </button>
                    ))}
                </nav>

                <div style={{ padding: '2rem', borderTop: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                    <button 
                        onClick={() => window.location.href = '/'}
                        style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    >
                        <span>🏠</span> Portal Home
                    </button>
                    <button 
                        onClick={handleLogout}
                        style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    >
                        <span>🚪</span> Logout
                    </button>
                </div>
            </aside>

            {/* Main Content Areas */}
            <main style={{ marginLeft: '280px', flex: 1, padding: '4rem 5rem' }}>
                {activePage === 'overview' && renderOverview()}
                {activePage === 'verification' && renderVerification()}
                {activePage === 'users' && renderUsers()}
                {activePage === 'news' && renderNews()}
                {activePage === 'logs' && renderLogs()}
            </main>

            {/* Messaging Modal */}
            {msgUser && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, animation: 'fadeIn 0.3s ease-out' }}>
                    <div style={{ background: 'var(--color-bg-primary)', width: '100%', maxWidth: '500px', padding: '2.5rem', borderRadius: '32px', border: '1px solid var(--glass-border)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
                        <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.5rem', fontWeight: 900 }}>Direct Message</h3>
                        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '2rem', fontWeight: 600 }}>Recipient: {msgUser.name} ({msgUser.email})</p>
                        
                        <form onSubmit={handleSendMessage}>
                            <input 
                                value={msgTitle} 
                                onChange={e => setMsgTitle(e.target.value)} 
                                placeholder="Subject / Title" 
                                required 
                                style={{ width: '100%', padding: '1.2rem', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: '14px', color: 'var(--color-text-primary)', marginBottom: '1.2rem', fontWeight: 600, outline: 'none' }} 
                            />
                            <textarea 
                                value={msgContent} 
                                onChange={e => setMsgContent(e.target.value)} 
                                placeholder="Write your specific message here..." 
                                required 
                                rows="5" 
                                style={{ width: '100%', padding: '1.2rem', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: '14px', color: 'var(--color-text-primary)', marginBottom: '1.8rem', resize: 'none', fontWeight: 500, outline: 'none' }} 
                            />
                            
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button 
                                    type="button" 
                                    onClick={() => setMsgUser(null)} 
                                    style={{ flex: 1, padding: '1.2rem', borderRadius: '14px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'var(--color-text-secondary)', fontWeight: '800', cursor: 'pointer' }}
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={isSendingMsg}
                                    style={{ flex: 2, padding: '1.2rem', borderRadius: '14px', background: 'var(--color-primary)', color: 'white', fontWeight: '900', border: 'none', cursor: 'pointer', boxShadow: '0 10px 20px rgba(139, 92, 246, 0.3)' }}
                                >
                                    {isSendingMsg ? 'Sending...' : 'Send Message'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const StatCard = ({ label, value, icon, color }) => (
    <div style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(20px)', border: '1px solid var(--glass-border)', borderRadius: '24px', padding: '2rem', transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)', position: 'relative', overflow: 'hidden' }} className="stat-hover">
        <div style={{ position: 'absolute', top: '-10px', right: '-10px', fontSize: '4rem', opacity: 0.05 }}>{icon}</div>
        <div style={{ color: 'var(--color-text-tertiary)', fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>{label}</div>
        <div style={{ fontSize: '2.5rem', fontWeight: 900, color: color }}>{value}</div>
        <style>{`
            .stat-hover:hover { transform: translateY(-5px); border-color: ${color}40; box-shadow: 0 15px 30px -10px ${color}20; }
        `}</style>
    </div>
);

export default AdminDashboard;
