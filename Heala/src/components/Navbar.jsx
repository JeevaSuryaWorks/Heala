import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
    const { user, role, loading, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [scrolled, setScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const isScrolled = window.scrollY > 20;
            if (isScrolled !== scrolled) {
                setScrolled(isScrolled);
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [scrolled]);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/');
        } catch (error) {
            console.error('Failed to log out:', error.message);
        }
    };

    const getDashboardLink = () => {
        if (!user) return '/login';
        switch (role) {
            case 'patient': return '/doctors';
            case 'doctor': return '/doctor-dashboard';
            case 'admin': return '/admin-dashboard';
            default: return '/login';
        }
    };

    const isActive = (path) => location.pathname === path;

    // Check if we are on an auth or onboarding page
    const hideNavbarRoutes = ['/login', '/register', '/onboarding', '/doctor-dashboard', '/appointments', '/medical-history'];
    
    if (hideNavbarRoutes.includes(location.pathname) || location.pathname.startsWith('/prescription/')) {
        return null;
    }

    return (
        <nav style={{
            position: 'fixed',
            top: scrolled ? '1rem' : '0',
            left: '0',
            right: '0',
            zIndex: 100,
            transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
            padding: scrolled ? '0 1.5rem' : '1.5rem 2rem',
        }}>
            <div style={{
                maxWidth: '1280px',
                margin: '0 auto',
                background: scrolled ? 'var(--glass-bg)' : 'transparent',
                backdropFilter: scrolled ? 'blur(28px) saturate(200%)' : 'none',
                WebkitBackdropFilter: scrolled ? 'blur(28px) saturate(200%)' : 'none',
                border: scrolled ? '1px solid var(--glass-border)' : '1px solid transparent',
                boxShadow: scrolled ? '0 25px 50px -12px rgba(0,0,0,0.1)' : 'none',
                borderRadius: scrolled ? '28px' : '0',
                padding: scrolled ? '0.85rem 2rem' : '0 1rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
            }}>
                
                {/* Logo Section */}
                <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '1rem', textDecoration: 'none', outline: 'none' }} className="group">
                    <div style={{
                        background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
                        width: '46px',
                        height: '46px',
                        borderRadius: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: '900',
                        fontSize: '1.6rem',
                        boxShadow: '0 8px 25px -6px rgba(139, 92, 246, 0.5)',
                        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                    className="logo-icon hover:-translate-y-1 hover:scale-105 hover:shadow-[0_12px_30px_-6px_rgba(139,92,246,0.6)]"
                    >
                        <div style={{ position: 'absolute', width: '150%', height: '30%', background: 'rgba(255,255,255,0.2)', transform: 'rotate(-45deg)', top: '-20%', left: '-20%', transition: 'all 0.6s ease' }} className="logo-glare hover:translate-x-full hover:translate-y-full"></div>
                        H
                    </div>
                    <span style={{
                        fontSize: '1.75rem',
                        fontWeight: '800',
                        letterSpacing: '-0.75px',
                        color: 'var(--color-text-primary)'
                    }}>
                        Heala<span style={{ color: 'var(--color-primary)' }}>.</span>
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <div className="desktop-only" style={{ display: 'flex', alignItems: 'center', gap: '3rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem' }}>
                        {role === 'patient' ? (
                            <>
                                <Link to="/doctors" style={{
                                    fontWeight: '600', fontSize: '1rem',
                                    color: isActive('/doctors') ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                                    transition: 'all 0.3s ease', position: 'relative', textDecoration: 'none', padding: '0.5rem 0'
                                }} className="nav-link">
                                    Find Doctors
                                    <div style={{ position: 'absolute', bottom: '0', left: '50%', transform: 'translateX(-50%)', height: '2px', width: isActive('/doctors') ? '100%' : '0%', background: 'var(--gradient-primary)', borderRadius: '2px', transition: 'width 0.3s ease' }} className="nav-indicator"></div>
                                </Link>
                                <Link to="/chatbot" style={{
                                    fontWeight: '600', fontSize: '1rem',
                                    color: isActive('/chatbot') ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                                    transition: 'all 0.3s ease', position: 'relative', textDecoration: 'none', padding: '0.5rem 0'
                                }} className="nav-link">
                                    AI Chatbot
                                    <div style={{ position: 'absolute', bottom: '0', left: '50%', transform: 'translateX(-50%)', height: '2px', width: isActive('/chatbot') ? '100%' : '0%', background: 'var(--gradient-primary)', borderRadius: '2px', transition: 'width 0.3s ease' }} className="nav-indicator"></div>
                                </Link>
                                <Link to="/history" style={{
                                    fontWeight: '600', fontSize: '1rem',
                                    color: isActive('/history') ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                                    transition: 'all 0.3s ease', position: 'relative', textDecoration: 'none', padding: '0.5rem 0'
                                }} className="nav-link">
                                    History
                                    <div style={{ position: 'absolute', bottom: '0', left: '50%', transform: 'translateX(-50%)', height: '2px', width: isActive('/history') ? '100%' : '0%', background: 'var(--gradient-primary)', borderRadius: '2px', transition: 'width 0.3s ease' }} className="nav-indicator"></div>
                                </Link>
                                <Link to="/notifications" style={{
                                    fontWeight: '600', fontSize: '1rem',
                                    color: isActive('/notifications') ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                                    transition: 'all 0.3s ease', position: 'relative', textDecoration: 'none', padding: '0.5rem 0'
                                }} className="nav-link">
                                    Notifications
                                    <div style={{ position: 'absolute', bottom: '0', left: '50%', transform: 'translateX(-50%)', height: '2px', width: isActive('/notifications') ? '100%' : '0%', background: 'var(--gradient-primary)', borderRadius: '2px', transition: 'width 0.3s ease' }} className="nav-indicator"></div>
                                </Link>
                            </>
                        ) : null}

                        {role === 'doctor' && (
                            <>
                                <Link to="/doctor-dashboard" style={{
                                    fontWeight: '600', fontSize: '1rem',
                                    color: isActive('/doctor-dashboard') ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                                    transition: 'all 0.3s ease', position: 'relative', textDecoration: 'none', padding: '0.5rem 0'
                                }} className="nav-link">
                                    Dashboard
                                    <div style={{ position: 'absolute', bottom: '0', left: '50%', transform: 'translateX(-50%)', height: '2px', width: isActive('/doctor-dashboard') ? '100%' : '0%', background: 'var(--gradient-primary)', borderRadius: '2px', transition: 'width 0.3s ease' }} className="nav-indicator"></div>
                                </Link>
                                <Link to="/appointments" style={{
                                    fontWeight: '600', fontSize: '1rem',
                                    color: isActive('/appointments') ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                                    transition: 'all 0.3s ease', position: 'relative', textDecoration: 'none', padding: '0.5rem 0'
                                }} className="nav-link">
                                    Appointments
                                    <div style={{ position: 'absolute', bottom: '0', left: '50%', transform: 'translateX(-50%)', height: '2px', width: isActive('/appointments') ? '100%' : '0%', background: 'var(--gradient-primary)', borderRadius: '2px', transition: 'width 0.3s ease' }} className="nav-indicator"></div>
                                </Link>
                                <Link to="/medical-history" style={{
                                    fontWeight: '600', fontSize: '1rem',
                                    color: isActive('/medical-history') ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                                    transition: 'all 0.3s ease', position: 'relative', textDecoration: 'none', padding: '0.5rem 0'
                                }} className="nav-link">
                                    History
                                    <div style={{ position: 'absolute', bottom: '0', left: '50%', transform: 'translateX(-50%)', height: '2px', width: isActive('/medical-history') ? '100%' : '0%', background: 'var(--gradient-primary)', borderRadius: '2px', transition: 'width 0.3s ease' }} className="nav-indicator"></div>
                                </Link>
                                <Link to="/notifications" style={{
                                    fontWeight: '600', fontSize: '1rem',
                                    color: isActive('/notifications') ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                                    transition: 'all 0.3s ease', position: 'relative', textDecoration: 'none', padding: '0.5rem 0'
                                }} className="nav-link">
                                    Notifications
                                    <div style={{ position: 'absolute', bottom: '0', left: '50%', transform: 'translateX(-50%)', height: '2px', width: isActive('/notifications') ? '100%' : '0%', background: 'var(--gradient-primary)', borderRadius: '2px', transition: 'width 0.3s ease' }} className="nav-indicator"></div>
                                </Link>
                            </>
                        )}
                        
                        {role === 'admin' && (
                            <>
                                <Link to="/admin-dashboard" style={{
                                    fontWeight: '600', fontSize: '1rem',
                                    color: isActive('/admin-dashboard') ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                                    transition: 'all 0.3s ease', position: 'relative', textDecoration: 'none', padding: '0.5rem 0'
                                }} className="nav-link">
                                    Admin Panel
                                    <div style={{ position: 'absolute', bottom: '0', left: '50%', transform: 'translateX(-50%)', height: '2px', width: isActive('/admin-dashboard') ? '100%' : '0%', background: 'var(--gradient-primary)', borderRadius: '2px', transition: 'width 0.3s ease' }} className="nav-indicator"></div>
                                </Link>
                            </>
                        )}

                        <Link to="/team" style={{
                            fontWeight: '600',
                            fontSize: '1rem',
                            color: isActive('/team') ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                            transition: 'all 0.3s ease',
                            position: 'relative',
                            textDecoration: 'none',
                            padding: '0.5rem 0'
                        }}
                        className="nav-link"
                        >
                            Our Team
                            <div style={{ 
                                position: 'absolute', bottom: '0', left: '50%', transform: 'translateX(-50%)', 
                                height: '2px', width: isActive('/team') ? '100%' : '0%', 
                                background: 'var(--gradient-primary)', borderRadius: '2px',
                                transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                            }} className="nav-indicator"></div>
                        </Link>
                    </div>

                    <div style={{ width: '1px', height: '24px', background: 'var(--glass-border)' }}></div>

                    {/* Actions */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', minWidth: '200px', justifyContent: 'flex-end' }}>
                        {loading ? (
                            <div style={{ width: '30px', height: '30px', borderRadius: '50%', border: '2px solid var(--glass-border)', borderTopColor: 'var(--color-primary)', animation: 'spin 1s linear infinite' }}></div>
                        ) : user ? (
                            <>
                                {role === 'admin' && (
                                    <Link to={getDashboardLink()} style={{
                                        padding: '0.7rem 1.4rem', borderRadius: '100px', fontWeight: 'bold', fontSize: '0.95rem',
                                        background: 'var(--color-bg-secondary)', color: 'var(--color-text-primary)',
                                        border: '1px solid var(--color-border)', transition: 'all 0.3s ease', textDecoration: 'none'
                                    }}
                                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--color-primary)'; e.currentTarget.style.color = 'var(--color-primary)'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.color = 'var(--color-text-primary)'; }}
                                    >
                                        Admin Panel
                                    </Link>
                                )}
                                {role === 'doctor' && user?.doctorData && (
                                    <div style={{ 
                                        display: 'flex', background: 'rgba(255, 255, 255, 0.05)', padding: '2px', 
                                        borderRadius: '12px', border: '1px solid var(--glass-border)', marginRight: '0.5rem'
                                    }}>
                                        <button 
                                            onClick={async () => {
                                                const newMethod = user.doctorData.consultation_method === 'direct' ? 'video' : 'direct';
                                                const { error } = await supabase.from('doctors').update({ consultation_method: newMethod }).eq('profile_id', user.id);
                                                if (!error) window.location.reload(); // Quick sync
                                            }}
                                            style={{
                                                padding: '0.5rem 0.8rem', borderRadius: '10px', border: 'none',
                                                background: 'transparent', color: 'var(--color-text-secondary)',
                                                fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem'
                                            }}
                                        >
                                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: user.doctorData.consultation_method === 'direct' ? '#10b981' : '#3b82f6' }}></div>
                                            {user.doctorData.consultation_method === 'direct' ? 'Direct Mode' : 'Video Mode'}
                                        </button>
                                    </div>
                                )}
                                <button onClick={handleLogout} style={{
                                    padding: '0.7rem 1.4rem', borderRadius: '100px', fontWeight: 'bold', fontSize: '0.95rem',
                                    background: 'var(--color-error)', color: 'white', border: 'none', cursor: 'pointer',
                                    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)', transition: 'all 0.3s ease'
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(239, 68, 68, 0.3)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.2)'; }}
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" style={{
                                    fontWeight: '700', fontSize: '1rem', color: 'var(--color-text-primary)',
                                    padding: '0.5rem 1rem', transition: 'color 0.3s ease', textDecoration: 'none'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-primary)'}
                                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-primary)'}
                                >
                                    Login
                                </Link>
                                <Link to="/register" style={{
                                    padding: '0.75rem 1.75rem', borderRadius: '100px', fontWeight: 'bold', fontSize: '1rem',
                                    background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))', 
                                    color: 'white', textDecoration: 'none', boxShadow: '0 8px 20px -5px rgba(139, 92, 246, 0.4)',
                                    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 25px -5px rgba(139, 92, 246, 0.6)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 20px -5px rgba(139, 92, 246, 0.4)'; }}
                                >
                                    Get Started
                                </Link>
                            </>
                        )}
                    </div>
                </div>

                {/* Mobile Menu Toggle (Hamburger) */}
                <button 
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
                    className="mobile-only"
                    style={{
                        width: '48px', height: '48px', borderRadius: '16px',
                        background: isMobileMenuOpen ? 'var(--color-bg-secondary)' : 'var(--color-bg-tertiary)',
                        border: '1px solid var(--glass-border)',
                        cursor: 'pointer', transition: 'all 0.3s ease',
                        position: 'relative', display: 'flex', flexDirection: 'column',
                        justifyContent: 'center', alignItems: 'center',
                        zIndex: 110 // Ensures hamburger is above the drawer overlay
                    }}
                    aria-label="Menu"
                >
                    <div style={{
                        width: '20px', height: '2px', background: isMobileMenuOpen ? 'var(--color-primary)' : 'var(--color-text-primary)',
                        transition: 'all 0.3s ease', position: 'absolute',
                        transform: isMobileMenuOpen ? 'rotate(45deg)' : 'translateY(-6px)'
                    }} />
                    <div style={{
                        width: '20px', height: '2px', background: isMobileMenuOpen ? 'transparent' : 'var(--color-text-primary)',
                        transition: 'all 0.2s ease', position: 'absolute', opacity: isMobileMenuOpen ? 0 : 1
                    }} />
                    <div style={{
                        width: '20px', height: '2px', background: isMobileMenuOpen ? 'var(--color-primary)' : 'var(--color-text-primary)',
                        transition: 'all 0.3s ease', position: 'absolute',
                        transform: isMobileMenuOpen ? 'rotate(-45deg)' : 'translateY(6px)'
                    }} />
                </button>
            </div>
            
            {/* Mobile Menu Overlay */}
            <div 
                style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 90,
                    opacity: isMobileMenuOpen ? 1 : 0, pointerEvents: isMobileMenuOpen ? 'auto' : 'none',
                    transition: 'opacity 0.4s ease'
                }}
                onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Mobile Menu Drawer */}
            <div style={{
                position: 'fixed', top: 0, right: 0, bottom: 0, width: '300px', maxWidth: '80vw',
                background: 'var(--color-bg-primary)',
                borderLeft: '1px solid var(--glass-border)',
                padding: '6rem 2rem 2rem 2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem',
                boxShadow: '-10px 0 40px rgba(0,0,0,0.2)',
                transform: isMobileMenuOpen ? 'translateX(0)' : 'translateX(100%)',
                transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                zIndex: 95
            }}>
                {user && <Link to="/doctors" style={{ textDecoration: 'none', color: 'var(--color-text-primary)', fontWeight: '800', fontSize: '1.25rem', padding: '0.5rem 0' }} onClick={() => setIsMobileMenuOpen(false)}>Find Doctors</Link>}
                <Link to="/team" style={{ textDecoration: 'none', color: 'var(--color-text-primary)', fontWeight: '800', fontSize: '1.25rem', padding: '0.5rem 0' }} onClick={() => setIsMobileMenuOpen(false)}>Our Team</Link>
                
                <div style={{ height: '1px', background: 'var(--glass-border)', margin: '0.5rem 0' }}></div>
                
                {user ? (
                    <>
                        {role !== 'patient' && <Link to={getDashboardLink()} style={{ textDecoration: 'none', color: 'var(--color-primary)', fontWeight: '800', fontSize: '1.25rem' }} onClick={() => setIsMobileMenuOpen(false)}>Dashboard</Link>}
                        <button onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} style={{ textAlign: 'left', background: 'none', border: 'none', color: 'var(--color-error)', fontWeight: '800', fontSize: '1.25rem', padding: 0, cursor: 'pointer' }}>Logout</button>
                    </>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: 'auto' }}>
                        <Link to="/login" style={{ textDecoration: 'none', color: 'var(--color-text-primary)', fontWeight: '700', fontSize: '1.1rem', padding: '1rem', textAlign: 'center', background: 'var(--color-bg-secondary)', border: '1px solid var(--glass-border)', borderRadius: '16px' }} onClick={() => setIsMobileMenuOpen(false)}>Log in</Link>
                        <Link to="/register" style={{ textDecoration: 'none', color: 'white', background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))', fontWeight: '700', fontSize: '1.1rem', padding: '1rem', textAlign: 'center', borderRadius: '16px', boxShadow: '0 8px 20px -5px rgba(139, 92, 246, 0.4)' }} onClick={() => setIsMobileMenuOpen(false)}>Join Heala</Link>
                    </div>
                )}
            </div>

            <style>{`
            .nav-link:hover .nav-indicator {
                width: 100% !important;
            }
            .logo-icon:hover .logo-glare {
                transform: translateX(100%) translateY(100%);
            }
            `}</style>
        </nav>
    );
};

export default Navbar;
