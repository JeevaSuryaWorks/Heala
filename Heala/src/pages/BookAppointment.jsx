import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../config/supabaseConfig';
import ModernDropdown from '../components/ModernDropdown';

const BookAppointment = () => {
    const { doctorId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [doctor, setDoctor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [step, setStep] = useState(1);
    const [bookingData, setBookingData] = useState({
        appointment_date: '',
        appointment_time: '',
        appointment_type: 'General Checkup',
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
            
            // Map schema to UI format
            if (data && data.available_days && data.available_time) {
                data.availability = {};
                data.available_days.forEach(day => {
                    data.availability[day.toLowerCase()] = [
                        data.available_time.start,
                        data.available_time.end
                    ];
                });
            }
            
            setDoctor(data);
        } catch (error) {
            console.error('Error fetching doctor:', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleBooking = async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);
        try {
            const { error } = await supabase
                .from('appointments')
                .insert([{
                    patient_id: user.id,
                    doctor_id: doctor.id,
                    appointment_date: bookingData.appointment_date,
                    appointment_time: bookingData.appointment_time,
                    appointment_type: bookingData.appointment_type,
                    reason: bookingData.reason,
                    amount: doctor.fee + 100,
                    status: 'pending'
                }]);

            if (error) throw error;
            setStep(3);
        } catch (error) {
            console.error('Error booking appointment:', error.message);
            alert('Failed to book appointment: ' + error.message);
        } finally {
            setIsSubmitting(false);
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
            <h2 style={{ color: 'var(--color-text-primary)' }}>Expert not found</h2>
            <Link to="/doctors" style={{ color: 'var(--color-primary)', fontWeight: '700' }}>Return to Search</Link>
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', background: 'var(--color-bg-primary)', padding: '4rem 2rem', position: 'relative', overflow: 'hidden' }}>
            {/* Ambient Background Orbs */}
            <div style={{ position: 'absolute', top: '10%', left: '0%', width: '35vw', height: '35vw', background: 'radial-gradient(circle, var(--color-primary) 0%, transparent 70%)', filter: 'blur(100px)', opacity: 0.05, zIndex: 0 }} />
            <div style={{ position: 'absolute', bottom: '0%', right: '0%', width: '25vw', height: '25vw', background: 'radial-gradient(circle, var(--color-accent) 0%, transparent 70%)', filter: 'blur(100px)', opacity: 0.03, zIndex: 0 }} />

            <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
                {/* Modern Stepper */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5rem', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: '24px', left: '0', right: '0', height: '1px', background: 'var(--glass-border)', zIndex: 0 }} />
                    <div style={{ position: 'absolute', top: '24px', left: '0', height: '1px', background: 'var(--color-primary)', zIndex: 0, width: `${(step - 1) * 50}%`, transition: 'width 0.6s ease' }} />
                    
                    {[
                        { label: 'Selection', icon: '1' },
                        { label: 'Security', icon: '2' },
                        { label: 'Success', icon: '✓' }
                    ].map((s, i) => (
                        <div key={i} style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div style={{ 
                                width: '48px', height: '48px', borderRadius: '16px', background: step > i + 1 ? 'var(--color-primary)' : step === i + 1 ? 'var(--color-primary)' : 'rgba(255,255,255,0.03)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', color: step >= i + 1 ? 'white' : 'var(--color-text-secondary)',
                                border: '1px solid', borderColor: step >= i + 1 ? 'var(--color-primary)' : 'var(--glass-border)',
                                boxShadow: step === i + 1 ? '0 10px 25px -5px rgba(139, 92, 246, 0.4)' : 'none',
                                transition: 'all 0.4s ease'
                            }}>
                                {s.icon}
                            </div>
                            <span style={{ marginTop: '1rem', fontSize: '0.8rem', fontWeight: '900', color: step >= i + 1 ? 'var(--color-text-primary)' : 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>{s.label}</span>
                        </div>
                    ))}
                </div>

                {step === 1 && (
                    <div style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(30px)', border: '1px solid var(--glass-border)', borderRadius: '40px', padding: '4rem', boxShadow: '0 40px 100px -20px rgba(0,0,0,0.3)', animation: 'fadeInUp 0.6s ease' }}>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: '900', marginBottom: '2.5rem', letterSpacing: '-1px' }}>Session Details</h2>
                        
                        <div style={{ display: 'flex', gap: '2rem', padding: '2rem', background: 'rgba(255,255,255,0.03)', borderRadius: '24px', border: '1px solid var(--glass-border)', marginBottom: '3.5rem', alignItems: 'center' }}>
                            <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '900', fontSize: '2rem' }}>
                                {doctor.profiles.name.charAt(0)}
                            </div>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '900' }}>{doctor.profiles.name}</h3>
                                <p style={{ margin: '0.3rem 0 0', color: 'var(--color-primary)', fontWeight: '800' }}>{doctor.specialization} • ₹{doctor.fee}</p>
                            </div>
                        </div>

                        <form onSubmit={(e) => { e.preventDefault(); setStep(2); }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2.5rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '1rem', fontWeight: '800', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>Preferred Date</label>
                                    <input
                                        type="date"
                                        min={new Date().toISOString().split('T')[0]}
                                        value={bookingData.appointment_date}
                                        onChange={(e) => setBookingData({ ...bookingData, appointment_date: e.target.value })}
                                        required
                                        style={{ width: '100%', padding: '1.2rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', borderRadius: '18px', color: 'var(--color-text-primary)', outline: 'none', transition: 'all 0.3s ease' }}
                                    />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    <ModernDropdown
                                        label="Consultation Type"
                                        placeholder="Select appointment type"
                                        options={[
                                            { value: 'General Checkup', label: 'General Checkup' },
                                            { value: 'Follow-up', label: 'Follow-up' },
                                            { value: 'Emergency', label: 'Emergency' },
                                            { value: 'Prescription Refill', label: 'Prescription Refill' }
                                        ]}
                                        value={bookingData.appointment_type}
                                        onChange={(val) => setBookingData({ ...bookingData, appointment_type: val })}
                                        icon="🏥"
                                    />
                                    <ModernDropdown
                                        label="Available Slots"
                                        placeholder="Select time slot"
                                        options={(doctor.availability.monday || ['09:00', '10:00', '11:00', '14:00', '16:00']).map(t => ({ value: t, label: t }))}
                                        value={bookingData.appointment_time}
                                        onChange={(val) => setBookingData({ ...bookingData, appointment_time: val })}
                                        icon="⏰"
                                    />
                                </div>
                            </div>

                            <div style={{ marginBottom: '3.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '1rem', fontWeight: '800', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>Primary Concerns</label>
                                <textarea
                                    placeholder="Briefly describe your health concerns..."
                                    value={bookingData.reason}
                                    onChange={(e) => setBookingData({ ...bookingData, reason: e.target.value })}
                                    required
                                    style={{ width: '100%', padding: '1.2rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', borderRadius: '18px', color: 'var(--color-text-primary)', minHeight: '140px', outline: 'none', resize: 'vertical' }}
                                />
                            </div>

                            <button type="submit" style={{ width: '100%', padding: '1.4rem', borderRadius: '22px', border: 'none', background: 'var(--color-primary)', color: 'white', fontWeight: '900', fontSize: '1.1rem', cursor: 'pointer', boxShadow: '0 15px 30px -10px rgba(139, 92, 246, 0.4)', transition: 'all 0.3s ease' }}>Continue to Checkout</button>
                        </form>
                    </div>
                )}

                {step === 2 && (
                    <div style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(30px)', border: '1px solid var(--glass-border)', borderRadius: '40px', padding: '4rem', animation: 'fadeInUp 0.6s ease' }}>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: '900', marginBottom: '1rem' }}>Final Review</h2>
                        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '3.5rem', fontWeight: '600' }}>Please verify your session information before proceeding.</p>

                        <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '24px', padding: '2.5rem', marginBottom: '3.5rem', border: '1px solid var(--glass-border)', textAlign: 'center' }}>
                            <div style={{ color: 'var(--color-text-secondary)' }}>
                                <span style={{ fontSize: '1.5rem', display: 'block', marginBottom: '1rem' }}>📋</span>
                                <span style={{ fontWeight: '700', fontSize: '1.1rem' }}>Fees Based on Your Treatments.</span>
                                <p style={{ margin: '0.5rem 0 0', fontSize: '0.9rem', opacity: 0.8 }}>Final charges will be discussed during your consultation.</p>
                            </div>
                        </div>

                        <div style={{ 
                            padding: '1.5rem', borderRadius: '20px', background: 'rgba(37, 211, 102, 0.05)', 
                            border: '1px solid rgba(37, 211, 102, 0.3)', marginBottom: '3.5rem', display: 'flex', gap: '1rem', alignItems: 'center' 
                        }}>
                           <span style={{ fontSize: '1.5rem' }}>🛡️</span>
                           <p style={{ margin: 0, fontSize: '0.9rem', color: '#10b981', fontWeight: '800' }}>Secure medical portal connection established.</p>
                        </div>

                        <div style={{ display: 'flex', gap: '1.5rem' }}>
                            <button onClick={() => setStep(1)} style={{ flex: 1, padding: '1.3rem', borderRadius: '20px', border: '1px solid var(--glass-border)', background: 'transparent', color: 'var(--color-text-primary)', fontWeight: '800', cursor: 'pointer' }}>Edit Details</button>
                            <button onClick={handleBooking} disabled={isSubmitting} style={{ flex: 2, padding: '1.3rem', borderRadius: '20px', border: 'none', background: 'var(--color-primary)', color: 'white', fontWeight: '900', cursor: 'pointer', boxShadow: '0 15px 30px -10px rgba(139, 92, 246, 0.4)', opacity: isSubmitting ? 0.7 : 1 }}>
                                {isSubmitting ? 'Booking...' : 'Confirm & Book'}
                            </button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(30px)', border: '1px solid var(--glass-border)', borderRadius: '40px', padding: '5rem 3rem', textAlign: 'center', animation: 'fadeInUp 0.6s ease' }}>
                        <div style={{ width: '90px', height: '90px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', fontSize: '3rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 3rem', boxShadow: '0 20px 40px -10px rgba(16, 185, 129, 0.3)' }}>✓</div>
                        <h2 style={{ fontSize: '3rem', fontWeight: '900', marginBottom: '1.5rem', letterSpacing: '-1.5px' }}>Session Reserved</h2>
                        <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.2rem', maxWidth: '500px', margin: '0 auto 4rem', fontWeight: '600' }}>
                            Your appointment with <strong>{doctor.profiles.name}</strong> is confirmed for <strong>{bookingData.appointment_date}</strong> at <strong>{bookingData.appointment_time}</strong>.
                        </p>
                        
                        <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center' }}>
                            <Link to="/doctors" style={{ padding: '1.2rem 3rem', borderRadius: '20px', background: 'var(--color-primary)', color: 'white', textDecoration: 'none', fontWeight: '900', boxShadow: '0 10px 20px -5px rgba(139, 92, 246, 0.3)' }}>Return to Search</Link>
                            <Link to="/" style={{ padding: '1.2rem 3rem', borderRadius: '20px', border: '1px solid var(--glass-border)', color: 'var(--color-text-primary)', textDecoration: 'none', fontWeight: '800' }}>Return Home</Link>
                        </div>
                    </div>
                )}
            </div>
            
            <style>{`
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
                input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(1); cursor: pointer; }
            `}</style>
        </div>
    );
};

export default BookAppointment;
