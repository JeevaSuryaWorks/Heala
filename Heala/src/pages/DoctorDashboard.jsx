import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../config/supabaseConfig';

const DoctorDashboard = ({ defaultTab = 'appointments' }) => {
    const { user } = useAuth();
    const [appointments, setAppointments] = useState([]);
    const [doctorProfile, setDoctorProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState(defaultTab);
    const [showPrescriptionModal, setShowPrescriptionModal] = useState(null);
    const [prescription, setPrescription] = useState('');

    useEffect(() => {
        setActiveTab(defaultTab);
    }, [defaultTab]);

    useEffect(() => {
        if (user) {
            fetchDoctorData();
        }
    }, [user]);

    const fetchDoctorData = async () => {
        setLoading(true);
        try {
            // 1. Fetch Doctor Profile
            const { data: profile, error: profileError } = await supabase
                .from('doctors')
                .select('*, profiles(name, email)')
                .eq('profile_id', user.id)
                .single();

            if (profileError) throw profileError;
            setDoctorProfile(profile);

            // 2. Fetch Appointments
            const { data: apts, error: aptError } = await supabase
                .from('appointments')
                .select('*, profiles!appointments_patient_id_fkey(name)')
                .eq('doctor_id', profile.id)
                .order('created_at', { ascending: false });

            if (aptError) throw aptError;
            setAppointments(apts || []);
        } catch (error) {
            console.error('Error fetching doctor data:', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleProfileUpdate = async (updates) => {
        try {
            const { error } = await supabase
                .from('doctors')
                .update(updates)
                .eq('id', doctorProfile.id);

            if (error) throw error;
            fetchDoctorData();
        } catch (error) {
            console.error('Error updating doctor profile:', error.message);
        }
    };

    const handleStatusUpdate = async (id, status) => {
        try {
            const { error } = await supabase
                .from('appointments')
                .update({ status })
                .eq('id', id);

            if (error) throw error;
            fetchDoctorData();
        } catch (error) {
            console.error('Error updating status:', error.message);
        }
    };

    const submitPrescription = async (e) => {
        e.preventDefault();
        try {
            // In a real app, we'd have a prescriptions table. 
            // For now, we'll mark as completed and maybe store notes in appointments.
            const { error } = await supabase
                .from('appointments')
                .update({ 
                    status: 'completed',
                    reason: `${appointments.find(a => a.id === showPrescriptionModal.id).reason}\n\nPRESCRIPTION: ${prescription}`
                })
                .eq('id', showPrescriptionModal.id);

            if (error) throw error;
            
            fetchDoctorData();
            setShowPrescriptionModal(null);
            setPrescription('');
            alert('Consultation completed and saved!');
        } catch (error) {
            console.error('Error completing appointment:', error.message);
        }
    };

    if (loading) return (
        <div style={{ minHeight: '100vh', background: 'var(--color-bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '50px', height: '50px', border: '5px solid var(--glass-border)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );

    if (!doctorProfile) return (
        <div style={{ minHeight: '100vh', background: 'var(--color-bg-primary)', padding: '5rem', textAlign: 'center' }}>
            <h2 style={{ color: 'var(--color-text-primary)' }}>Profile Not Found</h2>
            <p style={{ color: 'var(--color-text-secondary)' }}>You must be registered as a doctor to view this page.</p>
        </div>
    );

    const stats = [
        { label: 'Total Patients', value: appointments.length, color: 'var(--color-primary)' },
        { label: 'Pending', value: appointments.filter(a => a.status === 'pending').length, color: '#f59e0b' },
        { label: 'Completed', value: appointments.filter(a => a.status === 'completed').length, color: '#10b981' },
        { label: 'Earnings', value: `₹${appointments.filter(a => a.status === 'completed').reduce((sum, a) => sum + (doctorProfile.fee || 0), 0)}`, color: 'var(--color-accent)' }
    ];

    return (
        <div style={{ minHeight: '100vh', background: 'var(--color-bg-primary)', padding: '4rem 2rem', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '10%', left: '5%', width: '40vw', height: '40vw', background: 'radial-gradient(circle, var(--color-primary) 0%, transparent 70%)', filter: 'blur(120px)', opacity: 0.05, zIndex: 0 }} />

            <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
                <header style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--color-text-primary)', marginBottom: '0.5rem', letterSpacing: '-1px' }}>
                            Expert Portal<span style={{ color: 'var(--color-primary)' }}>.</span>
                        </h1>
                        <p style={{ color: 'var(--color-text-secondary)', fontWeight: '600' }}>Manage clinical sessions and patient records.</p>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                        {/* Consultation Method Toggle */}
                        <div style={{ 
                            display: 'flex', background: 'rgba(255, 255, 255, 0.03)', padding: '4px', 
                            borderRadius: '14px', border: '1px solid var(--glass-border)' 
                        }}>
                            <button 
                                onClick={() => handleProfileUpdate({ consultation_method: 'direct' })}
                                style={{
                                    padding: '0.6rem 1rem', borderRadius: '10px', border: 'none',
                                    background: doctorProfile.consultation_method === 'direct' ? 'var(--color-primary)' : 'transparent',
                                    color: doctorProfile.consultation_method === 'direct' ? 'white' : 'var(--color-text-secondary)',
                                    fontSize: '0.8rem', fontWeight: '800', cursor: 'pointer', transition: 'all 0.3s ease'
                                }}
                            >Direct</button>
                            <button 
                                onClick={() => handleProfileUpdate({ consultation_method: 'video' })}
                                style={{
                                    padding: '0.6rem 1rem', borderRadius: '10px', border: 'none',
                                    background: doctorProfile.consultation_method === 'video' ? 'var(--color-primary)' : 'transparent',
                                    color: doctorProfile.consultation_method === 'video' ? 'white' : 'var(--color-text-secondary)',
                                    fontSize: '0.8rem', fontWeight: '800', cursor: 'pointer', transition: 'all 0.3s ease'
                                }}
                            >Video Call</button>
                        </div>

                        <div style={{ 
                            background: doctorProfile.verification_status === 'approved' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)', 
                            color: doctorProfile.verification_status === 'approved' ? '#10b981' : '#f59e0b', 
                            padding: '0.6rem 1.2rem', borderRadius: '12px', fontSize: '0.85rem', fontWeight: '900' 
                        }}>
                            {doctorProfile.verification_status?.[0].toUpperCase() + doctorProfile.verification_status?.slice(1)}
                        </div>
                    </div>
                </header>

                {doctorProfile.verification_status === 'pending' ? (
                    <div style={{ 
                        background: 'var(--glass-bg)', padding: '5rem', borderRadius: '40px', 
                        border: '1px solid var(--glass-border)', textAlign: 'center', marginTop: '2rem' 
                    }}>
                        <div style={{ width: '80px', height: '80px', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem' }}>
                            <span style={{ fontSize: '2rem' }}>⏳</span>
                        </div>
                        <h2 style={{ fontSize: '2rem', fontWeight: '900', marginBottom: '1rem' }}>Verification in Progress</h2>
                        <p style={{ color: 'var(--color-text-secondary)', maxWidth: '500px', margin: '0 auto 2rem', lineHeight: '1.6' }}>
                            Your medical credentials (<strong>License: {doctorProfile.license_number}</strong>) are currently being reviewed by our medical board. 
                            You'll receive full portal access once approved.
                        </p>
                        <div style={{ color: 'var(--color-primary)', fontWeight: '800', fontSize: '0.9rem' }}>Typical review time: 24-48 hours</div>
                    </div>
                ) : (
                    <>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
                            {stats.map(stat => (
                                <div key={stat.label} style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(20px)', border: '1px solid var(--glass-border)', borderRadius: '24px', padding: '2rem', textAlign: 'center' }}>
                                    <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-text-secondary)', fontWeight: '700' }}>{stat.label}</p>
                                    <h2 style={{ margin: '0.5rem 0 0', fontSize: '2rem', fontWeight: '900', color: stat.color }}>{stat.value}</h2>
                                </div>
                            ))}
                        </div>

                <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '3rem' }}>
                    <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                        {[
                            { id: 'appointments', label: 'Appointments', icon: '📅' },
                            { id: 'history', label: 'Patient History', icon: '📜' },
                            { id: 'profile', label: 'Professional Info', icon: '👤' },
                            { id: 'availability', label: 'Work Hours', icon: '⏰' }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                style={{
                                    padding: '1.2rem', borderRadius: '18px', border: 'none', textAlign: 'left',
                                    background: activeTab === tab.id ? 'var(--color-primary)' : 'rgba(255,255,255,0.03)',
                                    color: activeTab === tab.id ? 'white' : 'var(--color-text-primary)',
                                    fontWeight: '800', cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                                    boxShadow: activeTab === tab.id ? '0 8px 15px -3px rgba(139, 92, 246, 0.3)' : 'none'
                                }}
                            >
                                <span style={{ marginRight: '1rem' }}>{tab.icon}</span> {tab.label}
                            </button>
                        ))}
                    </nav>

                    <div style={{ minHeight: '600px' }}>
                        {activeTab === 'appointments' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                {appointments.filter(a => a.status !== 'completed').length > 0 ? (
                                    appointments.filter(a => a.status !== 'completed').map(apt => (
                                        <div key={apt.id} style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(20px)', border: '1px solid var(--glass-border)', borderRadius: '24px', padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                                                <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '1.2rem' }}>
                                                    {apt.profiles?.name?.charAt(0)}
                                                </div>
                                                <div>
                                                    <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800' }}>{apt.profiles?.name}</h4>
                                                    <p style={{ margin: '0.2rem 0', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>{apt.reason}</p>
                                                    <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', fontSize: '0.8rem', fontWeight: '700', color: 'var(--color-primary)' }}>
                                                        <span>📅 {apt.appointment_date}</span>
                                                        <span>⏰ {apt.appointment_time}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <span style={{
                                                    display: 'block', padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '900', marginBottom: '1rem',
                                                    background: apt.status === 'pending' ? 'rgba(245, 158, 11, 0.1)' : apt.status === 'accepted' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                                    color: apt.status === 'pending' ? '#f59e0b' : apt.status === 'accepted' ? '#3b82f6' : '#ef4444'
                                                }}>{apt.status.toUpperCase()}</span>
                                                
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    {apt.status === 'pending' && (
                                                        <>
                                                            <button onClick={() => handleStatusUpdate(apt.id, 'accepted')} style={{ padding: '0.5rem 1rem', borderRadius: '10px', border: 'none', background: 'var(--color-primary)', color: 'white', fontWeight: '800', cursor: 'pointer' }}>Accept</button>
                                                            <button onClick={() => handleStatusUpdate(apt.id, 'cancelled')} style={{ padding: '0.5rem 1rem', borderRadius: '10px', border: '1px solid var(--glass-border)', background: 'transparent', color: 'var(--color-text-primary)', fontWeight: '700', cursor: 'pointer' }}>Decline</button>
                                                        </>
                                                    )}
                                                    {apt.status === 'accepted' && (
                                                        <button onClick={() => setShowPrescriptionModal(apt)} style={{ padding: '0.5rem 1rem', borderRadius: '10px', border: 'none', background: '#10b981', color: 'white', fontWeight: '800', cursor: 'pointer' }}>Complete</button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div style={{ padding: '5rem', textAlign: 'center', background: 'var(--glass-bg)', borderRadius: '32px' }}>
                                        <p style={{ color: 'var(--color-text-secondary)', fontWeight: '600' }}>No active requests found.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'history' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                {appointments.filter(a => a.status === 'completed').length > 0 ? (
                                    appointments.filter(a => a.status === 'completed').map(apt => (
                                        <div key={apt.id} style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(20px)', border: '1px solid var(--glass-border)', borderRadius: '24px', padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: 0.8 }}>
                                            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                                                <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '1.2rem', color: '#10b981' }}>
                                                    ✓
                                                </div>
                                                <div>
                                                    <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800' }}>{apt.profiles?.name}</h4>
                                                    <p style={{ margin: '0.2rem 0', color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>{apt.reason?.split('PRESCRIPTION:')[0]}</p>
                                                    <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', fontSize: '0.8rem', fontWeight: '700', color: 'var(--color-text-secondary)' }}>
                                                        <span>📅 {apt.appointment_date}</span>
                                                        <span>💰 ₹{doctorProfile.fee}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <span style={{ padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '900', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>COMPLETED</span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div style={{ padding: '5rem', textAlign: 'center', background: 'var(--glass-bg)', borderRadius: '32px' }}>
                                        <p style={{ color: 'var(--color-text-secondary)', fontWeight: '600' }}>No medical history available.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'profile' && (
                            <div style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(20px)', border: '1px solid var(--glass-border)', borderRadius: '32px', padding: '3rem' }}>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: '900', marginBottom: '2.5rem' }}>Professional Profile</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                                    <div className="field">
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '800', color: 'var(--color-text-secondary)' }}>Public Name</label>
                                        <input style={{ width: '100%', padding: '1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', borderRadius: '16px', color: 'var(--color-text-secondary)' }} defaultValue={doctorProfile.profiles.name} disabled />
                                    </div>
                                    <div className="field">
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '800', color: 'var(--color-text-secondary)' }}>Specialization</label>
                                        <input style={{ width: '100%', padding: '1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', borderRadius: '16px', color: 'var(--color-text-primary)' }} defaultValue={doctorProfile.specialization} />
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                                    <div className="field">
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '800', color: 'var(--color-text-secondary)' }}>Consultation Fee (₹)</label>
                                        <input style={{ width: '100%', padding: '1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', borderRadius: '16px', color: 'var(--color-text-primary)' }} defaultValue={doctorProfile.fee} />
                                    </div>
                                    <div className="field">
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '800', color: 'var(--color-text-secondary)' }}>Experience</label>
                                        <input style={{ width: '100%', padding: '1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', borderRadius: '16px', color: 'var(--color-text-primary)' }} defaultValue={doctorProfile.experience} />
                                    </div>
                                </div>
                                <div style={{ marginBottom: '3rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '800', color: 'var(--color-text-secondary)' }}>Biography</label>
                                    <textarea style={{ width: '100%', padding: '1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', borderRadius: '16px', color: 'var(--color-text-primary)', minHeight: '150px' }} defaultValue={doctorProfile.about}></textarea>
                                </div>
                                <button style={{ padding: '1.2rem 3rem', borderRadius: '18px', border: 'none', background: 'var(--color-primary)', color: 'white', fontWeight: '900', cursor: 'pointer', boxShadow: '0 8px 15px -3px rgba(139, 92, 246, 0.3)' }}>Update Profile</button>
                            </div>
                        )}

                        {activeTab === 'availability' && (
                            <div style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(20px)', border: '1px solid var(--glass-border)', borderRadius: '32px', padding: '3rem' }}>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: '900', marginBottom: '1.5rem' }}>Schedule Management</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].map(day => (
                                        <div key={day} style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '24px', border: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontWeight: '800', fontSize: '1.1rem', textTransform: 'capitalize' }}>{day}</span>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                {(doctorProfile.availability?.[day] || ['09:00', '13:00']).map(s => (
                                                    <span key={s} style={{ background: 'var(--color-primary)', color: 'white', padding: '0.4rem 0.8rem', borderRadius: '10px', fontSize: '0.8rem', fontWeight: '800' }}>{s}</span>
                                                ))}
                                                <button style={{ marginLeft: '1rem', background: 'transparent', border: 'none', color: 'var(--color-text-secondary)', fontWeight: '800', cursor: 'pointer' }}>Edit</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </>
        )}

            {/* Modal */}
            {showPrescriptionModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '2rem' }}>
                    <div style={{ background: 'var(--color-bg-primary)', border: '1px solid var(--glass-border)', borderRadius: '32px', padding: '3rem', width: '100%', maxWidth: '600px', boxShadow: '0 50px 100px -20px rgba(0,0,0,0.5)' }}>
                        <h2 style={{ fontSize: '2rem', fontWeight: '900', marginBottom: '1rem' }}>Final Summary</h2>
                        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '2.5rem' }}>Recording clinical data for <strong>{showPrescriptionModal.profiles?.name}</strong>.</p>
                        <form onSubmit={submitPrescription}>
                            <div style={{ marginBottom: '2.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.8rem', fontWeight: '800', color: 'var(--color-text-secondary)' }}>Medical Advice & Notes</label>
                                <textarea
                                    value={prescription}
                                    onChange={(e) => setPrescription(e.target.value)}
                                    placeholder="Enter diagnosis, advice, or prescribed medicines..."
                                    style={{ width: '100%', padding: '1.2rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', borderRadius: '20px', color: 'var(--color-text-primary)', minHeight: '200px', outline: 'none' }}
                                    required
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button type="submit" style={{ flex: 2, padding: '1.2rem', borderRadius: '18px', border: 'none', background: '#10b981', color: 'white', fontWeight: '900', cursor: 'pointer' }}>Save & Complete</button>
                                <button type="button" onClick={() => setShowPrescriptionModal(null)} style={{ flex: 1, padding: '1.2rem', borderRadius: '18px', border: '1px solid var(--glass-border)', background: 'transparent', color: 'var(--color-text-primary)', fontWeight: '700', cursor: 'pointer' }}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            </div>
        </div>
    );
};

export default DoctorDashboard;
