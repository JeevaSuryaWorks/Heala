import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../config/supabaseConfig';

const BookAppointment = () => {
    const { doctorId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [doctor, setDoctor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [step, setStep] = useState(1);
    const [bookingData, setBookingData] = useState({
        date: '',
        time: '',
        reason: '',
        paymentMethod: 'card'
    });

    useEffect(() => {
        fetchDoctor();
    }, [doctorId]);

    const fetchDoctor = async () => {
        try {
            const { data, error } = await supabase
                .from('doctors')
                .select('*, profiles(name)')
                .eq('id', doctorId)
                .single();

            if (error) throw error;
            setDoctor(data);
        } catch (error) {
            console.error('Error fetching doctor:', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleBooking = async () => {
        try {
            const { data, error } = await supabase
                .from('appointments')
                .insert([{
                    patient_id: user.id,
                    doctor_id: doctor.id,
                    date: bookingData.date,
                    time: bookingData.time,
                    reason: bookingData.reason,
                    status: 'pending'
                }]);

            if (error) throw error;
            setStep(3);
        } catch (error) {
            console.error('Error booking appointment:', error.message);
            alert('Failed to book appointment. Please try again.');
        }
    };

    if (loading) return (
        <div style={{ minHeight: '100vh', background: 'var(--color-bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="loader" style={{ width: '50px', height: '50px', border: '5px solid var(--glass-border)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );

    if (!doctor) return (
        <div style={{ minHeight: '100vh', background: 'var(--color-bg-primary)', padding: '5rem', textAlign: 'center' }}>
            <h2 style={{ color: 'var(--color-text-primary)' }}>Doctor not found</h2>
            <Link to="/doctors" style={{ color: 'var(--color-primary)', fontWeight: '700' }}>Return to Search</Link>
        </div>
    );

    return (
        <div style={{
            minHeight: '100vh',
            background: 'var(--color-bg-primary)',
            padding: '4rem 2rem',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Ambient Elements */}
            <div style={{ position: 'absolute', top: '20%', right: '10%', width: '30vw', height: '30vw', background: 'radial-gradient(circle, var(--color-primary) 0%, transparent 70%)', filter: 'blur(100px)', opacity: 0.05, zIndex: 0 }} />

            <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
                {/* Stepper */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4rem', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: '24px', left: '0', right: '0', height: '2px', background: 'rgba(255,255,255,0.05)', zIndex: 0 }} />
                    <div style={{ 
                        position: 'absolute', top: '24px', left: '0', 
                        width: step === 1 ? '0%' : step === 2 ? '50%' : '100%', 
                        height: '2px', background: 'var(--color-primary)', 
                        zIndex: 0, transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)' 
                    }} />

                    {[1, 2, 3].map(s => (
                        <div key={s} style={{ zIndex: 1, textAlign: 'center' }}>
                            <div style={{
                                width: '48px', height: '48px', borderRadius: '16px',
                                background: step >= s ? 'var(--color-primary)' : 'rgba(255,255,255,0.03)',
                                border: `1px solid ${step >= s ? 'var(--color-primary)' : 'var(--glass-border)'}`,
                                color: step >= s ? 'white' : 'var(--color-text-secondary)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontWeight: '900', margin: '0 auto 1rem', boxShadow: step >= s ? '0 8px 20px -5px rgba(139, 92, 246, 0.4)' : 'none',
                                transition: 'all 0.4s ease'
                            }}>{s === 3 && step === 3 ? '✓' : s}</div>
                            <span style={{ fontSize: '0.85rem', fontWeight: '800', color: step >= s ? 'var(--color-primary)' : 'var(--color-text-secondary)' }}>
                                {s === 1 ? 'Details' : s === 2 ? 'Security' : 'Ready'}
                            </span>
                        </div>
                    ))}
                </div>

                {step === 1 && (
                    <div style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(20px)', border: '1px solid var(--glass-border)', borderRadius: '32px', padding: '3rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)' }}>
                        <h2 style={{ fontSize: '2rem', fontWeight: '900', marginBottom: '2rem', letterSpacing: '-1px' }}>Appointment Details</h2>
                        
                        <div style={{ display: 'flex', gap: '1.5rem', padding: '1.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '24px', border: '1px solid var(--glass-border)', marginBottom: '3rem' }}>
                            <div style={{ width: '64px', height: '64px', borderRadius: '18px', background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '900', fontSize: '1.5rem' }}>
                                {doctor.profiles.name.charAt(0)}
                            </div>
                            <div>
                                <h4 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800' }}>{doctor.profiles.name}</h4>
                                <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontWeight: '600' }}>{doctor.specialization} • ₹{doctor.fee}</p>
                            </div>
                        </div>

                        <form onSubmit={(e) => { e.preventDefault(); setStep(2); }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                                <div className="input-field">
                                    <label style={{ display: 'block', marginBottom: '0.8rem', fontWeight: '700', color: 'var(--color-text-secondary)' }}>Preferred Date</label>
                                    <input
                                        type="date"
                                        min={new Date().toISOString().split('T')[0]}
                                        value={bookingData.date}
                                        onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
                                        required
                                        style={{ width: '100%', padding: '1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', borderRadius: '16px', color: 'var(--color-text-primary)' }}
                                    />
                                </div>
                                <div className="input-field">
                                    <label style={{ display: 'block', marginBottom: '0.8rem', fontWeight: '700', color: 'var(--color-text-secondary)' }}>Available Slot</label>
                                    <select
                                        value={bookingData.time}
                                        onChange={(e) => setBookingData({ ...bookingData, time: e.target.value })}
                                        required
                                        style={{ width: '100%', padding: '1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', borderRadius: '16px', color: 'var(--color-text-primary)' }}
                                    >
                                        <option value="">Select a time</option>
                                        {(doctor.availability.monday || ['09:00', '10:00', '11:00']).map(t => (
                                            <option key={t} value={t}>{t}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div style={{ marginBottom: '3rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.8rem', fontWeight: '700', color: 'var(--color-text-secondary)' }}>Note to Specialist</label>
                                <textarea
                                    placeholder="Describe your symptoms or reason for visit..."
                                    value={bookingData.reason}
                                    onChange={(e) => setBookingData({ ...bookingData, reason: e.target.value })}
                                    required
                                    style={{ width: '100%', padding: '1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', borderRadius: '16px', color: 'var(--color-text-primary)', minHeight: '120px', resize: 'vertical' }}
                                />
                            </div>

                            <button type="submit" style={{ width: '100%', padding: '1.2rem', borderRadius: '18px', border: 'none', background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))', color: 'white', fontWeight: '900', letterSpacing: '0.5px', boxShadow: '0 10px 20px -5px rgba(139, 92, 246, 0.4)', cursor: 'pointer', transition: 'all 0.3s ease' }}>Continue to Verification</button>
                        </form>
                    </div>
                )}

                {step === 2 && (
                    <div style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(20px)', border: '1px solid var(--glass-border)', borderRadius: '32px', padding: '3rem' }}>
                        <h2 style={{ fontSize: '2rem', fontWeight: '900', marginBottom: '1rem' }}>Finalize Booking</h2>
                        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '3rem' }}>Review your session summary and complete the verification.</p>

                        <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '24px', padding: '2rem', marginBottom: '3rem', border: '1px solid var(--glass-border)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <span style={{ color: 'var(--color-text-secondary)' }}>Specialist Fee</span>
                                <span style={{ fontWeight: '800' }}>₹{doctor.fee}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <span style={{ color: 'var(--color-text-secondary)' }}>Platform Service</span>
                                <span style={{ fontWeight: '800' }}>₹100</span>
                            </div>
                            <div style={{ height: '1px', background: 'var(--glass-border)', margin: '1.5rem 0' }} />
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.5rem', fontWeight: '900', color: 'var(--color-primary)' }}>
                                <span>Total Due</span>
                                <span>₹{doctor.fee + 100}</span>
                            </div>
                        </div>

                        <div style={{ marginBottom: '3rem' }}>
                            <label style={{ display: 'block', marginBottom: '1rem', fontWeight: '800' }}>Verification Method</label>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                {['Card', 'Wallet'].map(m => (
                                    <button
                                        key={m}
                                        onClick={() => setBookingData({ ...bookingData, paymentMethod: m.toLowerCase() })}
                                        style={{
                                            flex: 1, padding: '1rem', borderRadius: '16px', border: '1px solid var(--glass-border)',
                                            background: m.toLowerCase() === bookingData.paymentMethod ? 'rgba(139, 92, 246, 0.1)' : 'transparent',
                                            color: m.toLowerCase() === bookingData.paymentMethod ? 'var(--color-primary)' : 'var(--color-text-primary)',
                                            borderColor: m.toLowerCase() === bookingData.paymentMethod ? 'var(--color-primary)' : 'var(--glass-border)',
                                            fontWeight: '800', cursor: 'pointer', transition: 'all 0.3s ease'
                                        }}
                                    >{m}</button>
                                ))}
                            </div>
                        </div>

                        <button onClick={handleBooking} style={{ width: '100%', padding: '1.2rem', borderRadius: '18px', border: 'none', background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))', color: 'white', fontWeight: '900', boxShadow: '0 10px 20px -5px rgba(139, 92, 246, 0.4)', cursor: 'pointer', marginBottom: '1rem' }}>Confirm & Secure Booking</button>
                        <button onClick={() => setStep(1)} style={{ width: '100%', background: 'transparent', border: 'none', color: 'var(--color-text-secondary)', fontWeight: '700', cursor: 'pointer' }}>Go back and edit</button>
                    </div>
                )}

                {step === 3 && (
                    <div style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(20px)', border: '1px solid var(--glass-border)', borderRadius: '32px', padding: '5rem 3rem', textAlign: 'center' }}>
                        <div style={{ width: '80px', height: '80px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', fontSize: '2.5rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2.5rem' }}>✓</div>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: '900', marginBottom: '1rem' }}>Session Reserved!</h2>
                        <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.1rem', maxWidth: '400px', margin: '0 auto 4rem' }}>
                            Your appointment with <strong>{doctor.profiles.name}</strong> is confirmed for <strong>{bookingData.date}</strong> at <strong>{bookingData.time}</strong>.
                        </p>
                        
                        <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center' }}>
                            <Link to="/patient-dashboard" style={{ padding: '1rem 2.5rem', borderRadius: '18px', background: 'var(--color-primary)', color: 'white', textDecoration: 'none', fontWeight: '900', boxShadow: '0 8px 15px -3px rgba(139, 92, 246, 0.3)' }}>My Dashboard</Link>
                            <Link to="/" style={{ padding: '1rem 2.5rem', borderRadius: '18px', border: '1px solid var(--glass-border)', color: 'var(--color-text-primary)', textDecoration: 'none', fontWeight: '800' }}>Return Home</Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BookAppointment;
