import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../config/supabaseConfig';

const Onboarding = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    
    // Form state
    const [formData, setFormData] = useState({
        age: '',
        gender: '',
        bloodGroup: '',
        height: '',
        weight: '',
        allergies: '',
    });

    useEffect(() => {
        // Enforce login for onboarding
        if (!user) {
            navigate('/login');
        }
    }, [user, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleNext = () => {
        if (step < 3) setStep(step + 1);
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Save the onboarding data to Supabase medical_details table
            const { error } = await supabase
                .from('medical_details')
                .upsert({
                    profile_id: user.id,
                    age: parseInt(formData.age),
                    gender: formData.gender,
                    blood_group: formData.bloodGroup,
                    height: parseInt(formData.height),
                    weight: parseInt(formData.weight),
                    allergies: formData.allergies
                });

            if (error) throw error;
            
            // Navigate to appropriate dashboard based on role
            if (user?.role === 'patient') {
                navigate('/patient-dashboard');
            } else if (user?.role === 'doctor') {
                navigate('/doctor-dashboard');
            } else if (user?.role === 'admin') {
                navigate('/admin-dashboard');
            } else {
                navigate('/');
            }
        } catch (error) {
            console.error('Failed to save onboarding data:', error.message);
            alert('Error saving profile: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--color-bg-primary)',
            position: 'relative',
            overflow: 'hidden',
            padding: '2rem'
        }}>
            {/* Ambient Background Elements */}
            <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '50vw', height: '50vw', background: 'radial-gradient(circle, var(--color-primary) 0%, transparent 50%)', filter: 'blur(120px)', opacity: 0.15, animation: 'gentleFloat 15s ease-in-out infinite' }} />
            <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '60vw', height: '60vw', background: 'radial-gradient(circle, var(--color-accent) 0%, transparent 50%)', filter: 'blur(150px)', opacity: 0.1, animation: 'gentleFloat 20s ease-in-out infinite reverse' }} />

            <div className="animate-slide-up" style={{
                width: '100%',
                maxWidth: '600px',
                background: 'var(--glass-bg)',
                backdropFilter: 'blur(30px) saturate(150%)',
                WebkitBackdropFilter: 'blur(30px) saturate(150%)',
                border: '1px solid var(--glass-border)',
                borderRadius: '32px',
                padding: '3rem 4rem',
                position: 'relative',
                zIndex: 1,
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <h1 style={{ 
                        fontFamily: '"Outfit", "Inter", sans-serif', 
                        fontSize: '2.5rem', 
                        fontWeight: '900', 
                        marginBottom: '0.5rem',
                        background: 'linear-gradient(135deg, var(--color-text-primary), var(--color-primary))',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        Complete Profile
                    </h1>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.1rem' }}>
                        Let's get you set up, {user?.name || 'there'}!
                    </p>
                </div>

                {/* Progress Bar */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '3rem' }}>
                    {[1, 2, 3].map(item => (
                        <div key={item} style={{
                            flex: 1,
                            height: '6px',
                            borderRadius: '10px',
                            background: step >= item ? 'var(--color-primary)' : 'var(--glass-border)',
                            transition: 'all 0.5s ease',
                            boxShadow: step >= item ? '0 0 10px rgba(139, 92, 246, 0.4)' : 'none'
                        }} />
                    ))}
                </div>

                <form onSubmit={step === 3 ? handleSubmit : (e) => { e.preventDefault(); handleNext(); }}>
                    
                    {/* STEP 1: Basic Stats */}
                    <div style={{ display: step === 1 ? 'block' : 'none', animation: 'fadeIn 0.5s ease' }}>
                        <h3 style={{ fontFamily: '"Outfit", sans-serif', fontSize: '1.5rem', marginBottom: '1.5rem' }}>Basic Details</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--color-text-secondary)', fontWeight: '600' }}>Age</label>
                                <input type="number" name="age" value={formData.age} onChange={handleChange} required={step === 1} style={{
                                    width: '100%', padding: '1rem 1.25rem', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--glass-border)',
                                    borderRadius: '16px', color: 'var(--color-text-primary)', outline: 'none', transition: 'all 0.3s ease'
                                }} placeholder="E.g. 28" />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--color-text-secondary)', fontWeight: '600' }}>Gender</label>
                                <select name="gender" value={formData.gender} onChange={handleChange} required={step === 1} style={{
                                    width: '100%', padding: '1rem 1.25rem', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--glass-border)',
                                    borderRadius: '16px', color: 'var(--color-text-secondary)', outline: 'none', transition: 'all 0.3s ease', appearance: 'none'
                                }}>
                                    <option value="" disabled>Select Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* STEP 2: Physical Stats */}
                    <div style={{ display: step === 2 ? 'block' : 'none', animation: 'fadeIn 0.5s ease' }}>
                        <h3 style={{ fontFamily: '"Outfit", sans-serif', fontSize: '1.5rem', marginBottom: '1.5rem' }}>Physical Properties</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--color-text-secondary)', fontWeight: '600' }}>Height (cm)</label>
                                <input type="number" name="height" value={formData.height} onChange={handleChange} required={step === 2} style={{
                                    width: '100%', padding: '1rem 1.25rem', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--glass-border)',
                                    borderRadius: '16px', color: 'var(--color-text-primary)', outline: 'none', transition: 'all 0.3s ease'
                                }} placeholder="E.g. 175" />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--color-text-secondary)', fontWeight: '600' }}>Weight (kg)</label>
                                <input type="number" name="weight" value={formData.weight} onChange={handleChange} required={step === 2} style={{
                                    width: '100%', padding: '1rem 1.25rem', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--glass-border)',
                                    borderRadius: '16px', color: 'var(--color-text-primary)', outline: 'none', transition: 'all 0.3s ease'
                                }} placeholder="E.g. 70" />
                            </div>
                        </div>
                    </div>

                    {/* STEP 3: Medical Specifics */}
                    <div style={{ display: step === 3 ? 'block' : 'none', animation: 'fadeIn 0.5s ease' }}>
                        <h3 style={{ fontFamily: '"Outfit", sans-serif', fontSize: '1.5rem', marginBottom: '1.5rem' }}>Medical Overview</h3>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--color-text-secondary)', fontWeight: '600' }}>Blood Group</label>
                            <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} required={step === 3} style={{
                                width: '100%', padding: '1rem 1.25rem', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--glass-border)',
                                borderRadius: '16px', color: 'var(--color-text-secondary)', outline: 'none', transition: 'all 0.3s ease', appearance: 'none'
                            }}>
                                <option value="" disabled>Select Group</option>
                                <option value="A+">A+</option><option value="A-">A-</option>
                                <option value="B+">B+</option><option value="B-">B-</option>
                                <option value="O+">O+</option><option value="O-">O-</option>
                                <option value="AB+">AB+</option><option value="AB-">AB-</option>
                            </select>
                        </div>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--color-text-secondary)', fontWeight: '600' }}>Any known allergies?</label>
                            <input type="text" name="allergies" value={formData.allergies} onChange={handleChange} style={{
                                width: '100%', padding: '1rem 1.25rem', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--glass-border)',
                                borderRadius: '16px', color: 'var(--color-text-primary)', outline: 'none', transition: 'all 0.3s ease'
                            }} placeholder="E.g. Peanuts, Penicillin (Leave empty if none)" />
                        </div>
                    </div>

                    {/* Navigation Buttons */}
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '3rem' }}>
                        {step > 1 && (
                            <button type="button" onClick={handleBack} style={{
                                flex: 1, padding: '1rem', borderRadius: '16px', border: '1px solid var(--glass-border)',
                                background: 'transparent', color: 'var(--color-text-primary)', fontWeight: 'bold', cursor: 'pointer',
                                transition: 'all 0.3s ease'
                            }} onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'} onMouseLeave={(e) => e.target.style.background = 'transparent'}>
                                Back
                            </button>
                        )}
                        <button type="submit" disabled={loading} style={{
                            flex: 2, padding: '1rem', borderRadius: '16px', border: 'none',
                            background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))', 
                            color: 'white', fontWeight: 'bold', fontSize: '1.05rem', cursor: 'pointer',
                            boxShadow: '0 8px 20px -5px rgba(139, 92, 246, 0.4)', transition: 'all 0.3s ease',
                            opacity: loading ? 0.7 : 1
                        }} onMouseEnter={(e) => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 12px 25px -5px rgba(139, 92, 246, 0.6)'; }} onMouseLeave={(e) => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 8px 20px -5px rgba(139, 92, 246, 0.4)'; }}>
                            {loading ? 'Saving...' : (step === 3 ? 'Complete Setup' : 'Continue')}
                        </button>
                    </div>
                </form>
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                input:focus, select:focus {
                    border-color: var(--color-primary) !important;
                    background: rgba(255,255,255,0.06) !important;
                    box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.2) !important;
                }
            `}</style>
        </div>
    );
};

export default Onboarding;
