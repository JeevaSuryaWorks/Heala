import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { sendWelcomeEmail } from '../services/emailService';

const Register = () => {
    const [searchParams] = useSearchParams();
    const initialRole = searchParams.get('role') || 'patient';

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '+91 ',
        role: initialRole,
        // Doctor Specific
        specialization: '',
        qualification: '',
        experience: '',
        licenseNumber: '',
        clinicName: '',
        clinicAddress: '',
        fee: '',
        availableDays: [],
        availableTimeStart: '09:00',
        availableTimeEnd: '17:00'
    });

    const [currentStep, setCurrentStep] = useState(1);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const { register } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (searchParams.get('role')) {
            setFormData(prev => ({ ...prev, role: searchParams.get('role') }));
        }
    }, [searchParams]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        if (name === 'availableDays') {
            const days = [...formData.availableDays];
            if (checked) {
                days.push(value);
            } else {
                const index = days.indexOf(value);
                if (index > -1) days.splice(index, 1);
            }
            setFormData(prev => ({ ...prev, availableDays: days }));
        } else if (name === 'phone') {
            const digitsOnly = value.slice(4).replace(/\D/g, '');
            const limitedValue = '+91 ' + digitsOnly.slice(0, 10);
            setFormData(prev => ({ ...prev, [name]: limitedValue }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };


    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        
        // Final validation
        if (formData.role === 'doctor' && currentStep < 3) {
            setCurrentStep(currentStep + 1);
            return;
        }

        setError('');
        setLoading(true);

        try {
            const result = await register(formData);
            if (result.success) {
                // Send welcome email via Resend
                sendWelcomeEmail(formData.email, formData.name).catch(console.error);
                navigate('/onboarding');
            } else {
                setError(result.message);
                // Go back to first step if there's a basic auth error
                if (result.message.toLowerCase().includes('email') || result.message.toLowerCase().includes('password')) {
                    setCurrentStep(1);
                }
            }
        } catch (err) {
            setError('An error occurred during registration. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    const renderStepContent = () => {
        if (currentStep === 1) {
            return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'fadeIn 0.4s ease' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div>
                            <label style={labelStyle}>Full Name</label>
                            <input name="name" type="text" placeholder="John Doe" value={formData.name} onChange={handleChange} required style={inputStyle} className="auth-input" />
                        </div>
                        <div>
                            <label style={labelStyle}>Email Address</label>
                            <input name="email" type="email" placeholder="name@example.com" value={formData.email} onChange={handleChange} required style={inputStyle} className="auth-input" />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div>
                            <label style={labelStyle}>Phone Number</label>
                            <input name="phone" type="tel" placeholder="+91 00000 00000" value={formData.phone} onChange={handleChange} required style={inputStyle} className="auth-input" />
                        </div>
                        <div>
                            <label style={labelStyle}>Password</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    style={inputStyle}
                                    className="auth-input"
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} style={eyeButtonStyle}>
                                    {showPassword ? (
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                                    ) : (
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        if (currentStep === 2 && formData.role === 'doctor') {
            return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'fadeIn 0.4s ease' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div>
                            <label style={labelStyle}>Specialization</label>
                            <input name="specialization" type="text" placeholder="Cardiologist" value={formData.specialization} onChange={handleChange} required style={inputStyle} className="auth-input" />
                        </div>
                        <div>
                            <label style={labelStyle}>Qualification</label>
                            <input name="qualification" type="text" placeholder="MBBS, MD" value={formData.qualification} onChange={handleChange} required style={inputStyle} className="auth-input" />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div>
                            <label style={labelStyle}>Experience (Years)</label>
                            <input name="experience" type="number" placeholder="8" value={formData.experience} onChange={handleChange} required style={inputStyle} className="auth-input" />
                        </div>
                        <div>
                            <label style={labelStyle}>Medical License Number</label>
                            <input name="licenseNumber" type="text" placeholder="LIC-12345678" value={formData.licenseNumber} onChange={handleChange} required style={inputStyle} className="auth-input" />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div>
                            <label style={labelStyle}>Clinic Name</label>
                            <input name="clinicName" type="text" placeholder="Heala Wellness Clinic" value={formData.clinicName} onChange={handleChange} required style={inputStyle} className="auth-input" />
                        </div>
                        <div>
                            <label style={labelStyle}>Consultation Fee (₹)</label>
                            <input name="fee" type="number" placeholder="500" value={formData.fee} onChange={handleChange} required style={inputStyle} className="auth-input" />
                        </div>
                    </div>

                    <div>
                        <label style={labelStyle}>Clinic Address</label>
                        <textarea name="clinicAddress" placeholder="123 Health Ave, Medical District..." value={formData.clinicAddress} onChange={handleChange} required 
                        style={{ ...inputStyle, minHeight: '80px', resize: 'none' }} className="auth-input" />
                    </div>
                </div>
            );
        }

        if (currentStep === 3 && formData.role === 'doctor') {
            return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'fadeIn 0.4s ease' }}>
                    <div>
                        <label style={labelStyle}>Available Days</label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginTop: '0.5rem' }}>
                            {daysOfWeek.map(day => (
                                <label key={day} style={{ 
                                    display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer',
                                    padding: '0.6rem 0.8rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px',
                                    border: '1px solid var(--glass-border)', fontSize: '0.85rem', fontWeight: '600',
                                    color: formData.availableDays.includes(day) ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                                    transition: 'all 0.2s ease'
                                }}>
                                    <input 
                                        type="checkbox" 
                                        name="availableDays" 
                                        value={day} 
                                        checked={formData.availableDays.includes(day)}
                                        onChange={handleChange}
                                        style={{ accentColor: 'var(--color-primary)' }}
                                    />
                                    {day.slice(0, 3)}
                                </label>
                            ))}
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div>
                            <label style={labelStyle}>Start Time</label>
                            <input name="availableTimeStart" type="time" value={formData.availableTimeStart} onChange={handleChange} required style={inputStyle} className="auth-input" />
                        </div>
                        <div>
                            <label style={labelStyle}>End Time</label>
                            <input name="availableTimeEnd" type="time" value={formData.availableTimeEnd} onChange={handleChange} required style={inputStyle} className="auth-input" />
                        </div>
                    </div>

                    <div style={{ 
                        padding: '1.2rem', background: 'rgba(59, 130, 246, 0.05)', borderRadius: '20px', 
                        border: '1px solid rgba(59, 130, 246, 0.1)', marginTop: '0.5rem'
                    }}>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: '1.5' }}>
                            <span style={{ fontWeight: '800', color: 'var(--color-primary)', marginRight: '0.5rem' }}>ℹ️ Security Check:</span>
                            Your account will be marked as <strong>pending</strong> until an administrator verifies your medical credentials.
                        </p>
                    </div>
                </div>
            );
        }
    };


    const totalSteps = formData.role === 'doctor' ? 3 : 1;

    return (
        <div style={containerStyle}>
            <div style={glowTopStyle} />
            <div style={glowBottomStyle} />

            <div className="animate-slide-up" style={{ ...cardStyle, maxWidth: '750px' }}>
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <h1 style={titleStyle}>Welcome to Heala<span style={{ color: 'var(--color-primary)' }}>.</span></h1>
                    <p style={subtitleStyle}>Joining the healthcare revolution is only a few <br /> steps away.</p>
                </div>

                {/* Progress Bar for Doctors */}
                {formData.role === 'doctor' && (
                    <div style={{ marginBottom: '2.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem', padding: '0 0.5rem' }}>
                            <span style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--color-primary)' }}>STEP {currentStep} OF {totalSteps}</span>
                            <span style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--color-text-secondary)' }}>
                                {currentStep === 1 ? 'Personal Profile' : currentStep === 2 ? 'Clinical Credentials' : 'Work Schedule'}
                            </span>
                        </div>
                        <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
                            <div style={{ 
                                width: `${(currentStep / totalSteps) * 100}%`, height: '100%', 
                                background: 'linear-gradient(90deg, var(--color-primary), var(--color-accent))',
                                transition: 'width 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
                            }} />
                        </div>
                    </div>
                )}

                {error && <div style={errorStyle}>{error}</div>}

                {/* Role Switcher - Only in Step 1 */}
                {currentStep === 1 && (
                    <div style={{ ...switcherStyle, position: 'relative', overflow: 'hidden' }}>
                        <div style={{
                            position: 'absolute',
                            top: '6px',
                            bottom: '6px',
                            left: formData.role === 'patient' ? '6px' : 'calc(50% + 3px)',
                            width: 'calc(50% - 9px)',
                            background: 'var(--color-primary)',
                            borderRadius: '15px',
                            transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                            zIndex: 0,
                            boxShadow: '0 4px 15px rgba(139, 92, 246, 0.3)'
                        }} />
                        <button type="button" onClick={() => setFormData(prev => ({ ...prev, role: 'patient' }))}
                            style={{ ...switchBtnStyle, position: 'relative', zIndex: 1, color: formData.role === 'patient' ? 'white' : 'var(--color-text-secondary)', background: 'transparent' }}>
                            I'm a Patient
                        </button>
                        <button type="button" onClick={() => setFormData(prev => ({ ...prev, role: 'doctor' }))}
                            style={{ ...switchBtnStyle, position: 'relative', zIndex: 1, color: formData.role === 'doctor' ? 'white' : 'var(--color-text-secondary)', background: 'transparent' }}>
                            I'm a Doctor
                        </button>
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                    {renderStepContent()}

                    <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem' }}>
                        {formData.role === 'doctor' && currentStep > 1 && (
                            <button type="button" onClick={() => setCurrentStep(currentStep - 1)} style={backBtnStyle}>Back</button>
                        )}
                        <button type="submit" disabled={loading} style={btnStyle} className="auth-btn">
                            {loading ? 'Processing...' : (formData.role === 'doctor' && currentStep < 3) ? 'Continue to Credentials' : 'Create My Account'}
                        </button>
                    </div>
                </form>

                <div style={{ textAlign: 'center', marginTop: '3rem' }}>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
                        Already have an account? <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: '800', textDecoration: 'none', marginLeft: '0.5rem' }}>Sign In</Link>
                    </p>
                </div>
            </div>

            <style>{`
                @keyframes gentleFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-30px); } }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
                .auth-input:focus { border-color: var(--color-primary) !important; background: rgba(255, 255, 255, 0.07) !important; box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.15) !important; }
                .auth-btn:hover:not(:disabled) { transform: translateY(-3px); box-shadow: 0 15px 30px -5px rgba(139, 92, 246, 0.6); }
                .auth-btn:active:not(:disabled) { transform: translateY(-1px); }
            `}</style>
        </div>
    );
};

// Styles
const containerStyle = { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg-primary)', position: 'relative', overflow: 'hidden', padding: '4rem 2rem' };
const glowTopStyle = { position: 'absolute', top: '-10%', left: '-10%', width: '50vw', height: '50vw', background: 'radial-gradient(circle, var(--color-primary) 0%, transparent 50%)', filter: 'blur(120px)', opacity: 0.15, animation: 'gentleFloat 15s ease-in-out infinite' };
const glowBottomStyle = { position: 'absolute', bottom: '-20%', right: '-10%', width: '60vw', height: '60vw', background: 'radial-gradient(circle, var(--color-accent) 0%, transparent 50%)', filter: 'blur(150px)', opacity: 0.1, animation: 'gentleFloat 20s ease-in-out infinite reverse' };
const cardStyle = { width: '100%', maxWidth: '650px', background: 'var(--glass-bg)', backdropFilter: 'blur(30px) saturate(150%)', WebkitBackdropFilter: 'blur(30px) saturate(150%)', border: '1px solid var(--glass-border)', borderRadius: '40px', padding: '4rem 3.5rem', position: 'relative', zIndex: 1, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)' };
const iconContainerStyle = { width: '80px', height: '80px', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem', border: '1px solid rgba(139, 92, 246, 0.2)' };
const titleStyle = { fontFamily: '"Outfit", sans-serif', fontSize: '2.5rem', fontWeight: '900', marginBottom: '0.75rem', color: 'var(--color-text-primary)', letterSpacing: '-1.5px' };
const subtitleStyle = { color: 'var(--color-text-secondary)', fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '2.5rem' };
const errorStyle = { padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '16px', marginBottom: '2rem', color: 'var(--color-error)', textAlign: 'center', fontSize: '0.9rem', animation: 'shake 0.4s ease' };
const switcherStyle = { display: 'flex', background: 'rgba(255, 255, 255, 0.03)', padding: '6px', borderRadius: '20px', border: '1px solid var(--glass-border)', marginBottom: '2.5rem' };
const switchBtnStyle = { flex: 1, padding: '0.8rem', borderRadius: '15px', border: 'none', fontWeight: '700', cursor: 'pointer', transition: 'all 0.3s ease' };
const labelStyle = { display: 'block', marginBottom: '0.6rem', fontSize: '0.9rem', color: 'var(--color-text-secondary)', fontWeight: '600', paddingLeft: '0.5rem' };
const inputStyle = { width: '100%', padding: '1.1rem 1.5rem', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--glass-border)', borderRadius: '18px', color: 'var(--color-text-primary)', outline: 'none', transition: 'all 0.3s ease' };
const eyeButtonStyle = { position: 'absolute', right: '1.2rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.5rem' };
const btnStyle = { flex: 2, padding: '1.1rem', borderRadius: '18px', border: 'none', background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))', color: 'white', fontWeight: '800', fontSize: '1.1rem', cursor: 'pointer', boxShadow: '0 10px 25px -5px rgba(139, 92, 246, 0.4)', transition: 'all 0.4s ease' };
const backBtnStyle = { flex: 1, padding: '1.1rem', borderRadius: '18px', border: '1px solid var(--glass-border)', background: 'transparent', color: 'var(--color-text-primary)', fontWeight: '700', cursor: 'pointer', transition: 'all 0.3s ease' };

export default Register;
