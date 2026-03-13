import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const [showPassword, setShowPassword] = useState(false);
    const { user, role, login, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    React.useEffect(() => {
        if (user && !authLoading) {
            if (role === 'admin') {
                navigate('/admin-dashboard');
            } else {
                navigate('/');
            }
        }
    }, [user, role, authLoading, navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await login(email, password);
            if (!result.success) {
                setError(result.message);
            }
            // Redirection is handled by the useEffect above
        } catch (err) {
            setError('An error occurred during login. Please try again.');
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
                maxWidth: '480px',
                background: 'var(--glass-bg)',
                backdropFilter: 'blur(30px) saturate(150%)',
                WebkitBackdropFilter: 'blur(30px) saturate(150%)',
                border: '1px solid var(--glass-border)',
                borderRadius: '40px',
                padding: '4rem 3.5rem',
                position: 'relative',
                zIndex: 1,
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <div style={{
                        background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
                        width: '60px',
                        height: '60px',
                        borderRadius: '18px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: '900',
                        fontSize: '2rem',
                        margin: '0 auto 1.5rem auto',
                        boxShadow: '0 10px 25px -5px rgba(139, 92, 246, 0.5)'
                    }}>H</div>
                    <h1 style={{ 
                        fontFamily: '"Outfit", "Inter", sans-serif', 
                        fontSize: '2.5rem', 
                        fontWeight: '900', 
                        marginBottom: '0.75rem',
                        color: 'var(--color-text-primary)',
                        letterSpacing: '-1px'
                    }}>
                        Welcome Back
                    </h1>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.05rem', lineHeight: '1.6' }}>
                        Enter your credentials to access your <br /> secure health portal.
                    </p>
                </div>

                {error && (
                    <div style={{
                        padding: '1rem',
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        borderRadius: '16px',
                        marginBottom: '2rem',
                        color: 'var(--color-error)',
                        textAlign: 'center',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        animation: 'shake 0.4s ease'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.6rem', fontSize: '0.9rem', color: 'var(--color-text-secondary)', fontWeight: '600', paddingLeft: '0.5rem' }}>Email Address</label>
                        <input
                            type="email"
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={{
                                width: '100%', padding: '1.1rem 1.5rem', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--glass-border)',
                                borderRadius: '18px', color: 'var(--color-text-primary)', outline: 'none', transition: 'all 0.3s ease', fontSize: '1rem'
                            }}
                            className="login-input"
                        />
                    </div>

                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem', padding: '0 0.5rem' }}>
                            <label style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', fontWeight: '600' }}>Password</label>
                            <a href="#" style={{ fontSize: '0.8rem', color: 'var(--color-primary)', textDecoration: 'none', fontWeight: '600' }}>Forgot?</a>
                        </div>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                style={{
                                    width: '100%', padding: '1.1rem 3.5rem 1.1rem 1.5rem', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--glass-border)',
                                    borderRadius: '18px', color: 'var(--color-text-primary)', outline: 'none', transition: 'all 0.3s ease', fontSize: '1rem'
                                }}
                                className="login-input"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute',
                                    right: '1.2rem',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--color-text-secondary)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: '0.5rem',
                                    transition: 'color 0.3s ease'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-primary)'}
                                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-secondary)'}
                            >
                                {showPassword ? (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                        <line x1="1" y1="1" x2="23" y2="23"></line>
                                    </svg>
                                ) : (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                        <circle cx="12" cy="12" r="3"></circle>
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            marginTop: '1rem',
                            padding: '1.1rem',
                            borderRadius: '18px',
                            border: 'none',
                            background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))', 
                            color: 'white',
                            fontWeight: '800',
                            fontSize: '1.1rem',
                            cursor: 'pointer',
                            boxShadow: '0 10px 25px -5px rgba(139, 92, 246, 0.4)',
                            transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                            opacity: loading ? 0.7 : 1
                        }}
                        className="login-btn"
                    >
                        {loading ? 'Authenticating...' : 'Login to Account'}
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '3rem' }}>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
                        New to Heala? <Link to="/register" style={{ color: 'var(--color-primary)', fontWeight: '800', textDecoration: 'none', marginLeft: '0.5rem' }}>Create Account</Link>
                    </p>
                </div>
            </div>

            <style>{`
                @keyframes gentleFloat {
                    0% { transform: translateY(0) scale(1); }
                    50% { transform: translateY(-30px) scale(1.05); }
                    100% { transform: translateY(0) scale(1); }
                }
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    75% { transform: translateX(5px); }
                }
                .login-input:focus {
                    border-color: var(--color-primary) !important;
                    background: rgba(255, 255, 255, 0.07) !important;
                    box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.15) !important;
                }
                .login-btn:hover {
                    transform: translateY(-3px) scale(1.02);
                    box-shadow: 0 15px 30px -5px rgba(139, 92, 246, 0.6);
                }
                .login-btn:active {
                    transform: translateY(0) scale(0.98);
                }
            `}</style>
        </div>
    );
};

export default Login;
