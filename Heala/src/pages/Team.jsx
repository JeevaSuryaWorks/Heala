import React, { useEffect, useState, useRef } from 'react';

const StarParticles = ({ color }) => {
    return (
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
            {[...Array(6)].map((_, i) => (
                <div key={i} style={{
                    position: 'absolute',
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                    width: '4px',
                    height: '4px',
                    background: color,
                    borderRadius: '50%',
                    boxShadow: `0 0 10px ${color}`,
                    animation: `twinkle ${2 + Math.random() * 2}s infinite ease-in-out ${Math.random() * 2}s`
                }} />
            ))}
        </div>
    );
};

const TeamCard = ({ member, index }) => {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isHovering, setIsHovering] = useState(false);
    
    const isLead = member.name.includes('Gobika');

    const handleMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setMousePosition({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        });
    };

    return (
        <div
            className={`team-card animate-slide-up delay-${index * 100}`}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            style={{
                position: 'relative',
                background: isHovering ? 'rgba(255, 255, 255, 0.05)' : 'var(--glass-bg)',
                backdropFilter: 'blur(30px)',
                WebkitBackdropFilter: 'blur(30px)',
                border: isLead ? `1.5px solid ${member.color}44` : '1px solid var(--glass-border)',
                borderRadius: '40px',
                padding: '4rem 2.5rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                overflow: 'hidden',
                flex: '0 1 400px',
                maxWidth: '100%',
                transform: isHovering 
                    ? `translateY(-15px) scale(${isLead ? 1.05 : 1.02})` 
                    : 'translateY(0) scale(1)',
                boxShadow: isHovering 
                    ? `0 40px 80px -20px ${member.gradient.replace('0.25', '0.4').replace('0.15', '0.3')}` 
                    : (isLead ? `0 20px 50px -20px ${member.gradient}` : '0 10px 30px -10px rgba(0,0,0,0.1)')
            }}
        >
            {/* Lead Specific Shimmer */}
            {isLead && (
                <div style={{
                    position: 'absolute',
                    top: '-100%',
                    left: '-100%',
                    width: '300%',
                    height: '300%',
                    background: `linear-gradient(45deg, transparent 45%, rgba(255,255,255,0.1) 50%, transparent 55%)`,
                    animation: 'shimmer 4s infinite linear',
                    pointerEvents: 'none',
                    zIndex: 0
                }} />
            )}

            {/* Lead Particles */}
            {isLead && <StarParticles color={member.color} />}

            {/* Subtle ambient glow for Lead */}
            {isLead && (
                <div style={{
                    position: 'absolute', inset: 0,
                    background: `radial-gradient(circle at center, ${member.gradient}, transparent 70%)`,
                    opacity: isHovering ? 0.6 : 0.2, 
                    pointerEvents: 'none', zIndex: 0,
                    transition: 'opacity 0.5s ease'
                }} />
            )}

            {/* Spotlight Effect */}
            <div
                style={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: `radial-gradient(circle 350px at ${mousePosition.x}px ${mousePosition.y}px, ${member.gradient}, transparent 80%)`,
                    opacity: isHovering ? 1 : 0,
                    transition: 'opacity 0.4s ease',
                    pointerEvents: 'none',
                    zIndex: 0
                }}
            />

            {/* Content */}
            <div style={{ position: 'relative', zIndex: 1, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{
                    position: 'relative',
                    width: '140px',
                    height: '140px',
                    marginBottom: '3rem'
                }}>
                    <div style={{
                        position: 'absolute',
                        inset: '-20px',
                        background: isHovering || isLead ? member.color : 'transparent',
                        filter: 'blur(30px)',
                        opacity: isHovering ? 0.5 : (isLead ? 0.25 : 0),
                        transition: 'all 0.5s ease',
                        borderRadius: '50%'
                    }} />
                    <div style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: '42px',
                        background: `rgba(255, 255, 255, 0.03)`,
                        border: `2px solid ${isHovering || isLead ? member.color : 'var(--glass-border)'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '4rem',
                        backdropFilter: 'blur(5px)',
                        boxShadow: isHovering ? `0 15px 35px -5px ${member.gradient}` : 'inset 0 4px 15px rgba(0,0,0,0.1)',
                        transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                        position: 'relative',
                        zIndex: 2,
                        color: member.color,
                        transform: isHovering ? 'rotate(5deg) scale(1.1)' : 'rotate(0deg) scale(1)'
                    }}>
                        {member.emoji}
                        {isLead && (
                            <div style={{
                                position: 'absolute', bottom: '-5px', right: '-5px',
                                background: member.color, padding: '0.4rem', borderRadius: '12px',
                                fontSize: '1rem', boxShadow: `0 5px 15px ${member.gradient}`
                            }}>✨</div>
                        )}
                    </div>
                </div>

                <div style={{
                    background: isLead ? member.color : member.gradient,
                    color: isLead ? 'white' : member.color,
                    padding: '0.6rem 1.75rem',
                    borderRadius: '100px',
                    fontSize: '0.85rem',
                    fontWeight: '900',
                    letterSpacing: '2px',
                    textTransform: 'uppercase',
                    marginBottom: '1.5rem',
                    transform: isHovering ? 'translateY(-5px)' : 'translateY(0)',
                    transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                    boxShadow: isHovering ? `0 8px 20px ${member.gradient}` : 'none'
                }}>
                    {member.role}
                </div>

                <h3 style={{
                    fontFamily: '"Outfit", "Inter", sans-serif',
                    fontSize: '2.2rem',
                    fontWeight: '900',
                    color: 'var(--color-text-primary)',
                    marginBottom: '1rem',
                    letterSpacing: '-1px',
                    lineHeight: '1.2'
                }}>
                    {member.name}
                </h3>
                
                <p style={{
                    color: 'var(--color-text-secondary)',
                    fontSize: '1.1rem',
                    lineHeight: '1.8',
                    opacity: isHovering ? 1 : 0.8,
                    transition: 'opacity 0.3s ease',
                    maxWidth: '90%'
                }}>
                    {member.desc}
                </p>
            </div>
        </div>
    );
};

const GuideCard = ({ guide, index }) => {
    const [isHovering, setIsHovering] = useState(false);

    return (
        <div 
            className={`animate-slide-up delay-${index * 200}`} 
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            style={{
                flex: '1 1 450px',
                maxWidth: '550px',
                background: 'var(--glass-bg)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderRadius: '45px',
                padding: '4rem',
                position: 'relative',
                overflow: 'hidden',
                border: '1px solid var(--glass-border)',
                transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                boxShadow: isHovering ? `0 40px 80px -15px ${guide.gradient.replace('0.2', '0.4')}` : '0 20px 40px -10px rgba(0,0,0,0.05)',
                transform: isHovering ? 'translateY(-10px)' : 'translateY(0)',
                cursor: 'pointer'
            }}
        >
            <div style={{
                position: 'absolute',
                top: '-40%',
                right: '-40%',
                width: '100%',
                height: '100%',
                background: `radial-gradient(circle, ${guide.gradient} 0%, transparent 70%)`,
                opacity: isHovering ? 0.4 : 0.2,
                pointerEvents: 'none',
                transition: 'all 0.6s ease'
            }} />
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '3rem', position: 'relative', zIndex: 1 }}>
                <div style={{
                    width: '120px',
                    height: '120px',
                    borderRadius: '40px',
                    background: guide.gradient,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '4rem',
                    transform: isHovering ? 'rotate(10deg) scale(1.15)' : 'rotate(-5deg) scale(1)',
                    boxShadow: isHovering ? `0 20px 40px -10px ${guide.color}` : `0 10px 20px -5px ${guide.color}44`,
                    transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                    border: `2px solid ${guide.color}33`
                }}>
                    {guide.emoji}
                </div>
                <div>
                    <div style={{ color: guide.color, fontWeight: '900', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '1rem' }}>
                        {guide.role}
                    </div>
                    <h3 style={{ fontFamily: '"Outfit", sans-serif', fontSize: '2rem', fontWeight: '900', color: 'var(--color-text-primary)', letterSpacing: '-0.5px' }}>
                        {guide.name}
                    </h3>
                </div>
            </div>
        </div>
    );
};

const Team = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const teamMembers = [
        { name: 'Gobika R.', role: 'Team Lead & Full Stack', desc: 'Architecting the core neural networks and leading the vision for Heala\'s premium clinical intelligence.', emoji: '👑', color: '#8b5cf6', gradient: 'rgba(139, 92, 246, 0.25)' },
        { name: 'Karthika', role: 'Frontend Experience', desc: 'Crafting pixel-perfect, hyper-fluid user interfaces and sleek glassmorphism interactions.', emoji: '✨', color: '#ec4899', gradient: 'rgba(236, 72, 153, 0.15)' },
        { name: 'Madhumitha', role: 'Database & Backend', desc: 'Designing robust cloud architectures and high-security distributed medical data systems.', emoji: '☁️', color: '#06b6d4', gradient: 'rgba(6, 182, 212, 0.15)' },
        { name: 'Manju', role: 'UI/UX Strategy', desc: 'Mapping intuitive patient journeys and creating comprehensive, world-class design languages.', emoji: '🎨', color: '#f59e0b', gradient: 'rgba(245, 158, 11, 0.15)' },
    ];

    const guides = [
        { name: 'Mrs. M. Predeepa M.E', role: 'Strategic Guide', emoji: '👩‍🏫', color: '#8b5cf6', gradient: 'rgba(139, 92, 246, 0.2)' },
        { name: 'Mr. K. Ashok Kumar B.E', role: 'Project Director', emoji: '👨‍🏫', color: '#10b981', gradient: 'rgba(16, 185, 129, 0.2)' },
    ];

    return (
        <div style={{ background: 'var(--color-bg-primary)', minHeight: '100vh', position: 'relative', overflow: 'hidden', paddingBottom: '12rem' }}>
            
            {/* Highly Dynamic Ambient Background */}
            <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
                <div style={{ position: 'absolute', top: '-10%', left: '10%', width: '70vw', height: '70vw', background: 'radial-gradient(circle, var(--color-primary) 0%, transparent 60%)', filter: 'blur(160px)', opacity: 0.18, animation: 'gentleFloat 25s ease-in-out infinite' }}></div>
                <div style={{ position: 'absolute', bottom: '-10%', right: '10%', width: '80vw', height: '80vw', background: 'radial-gradient(circle, var(--color-accent) 0%, transparent 60%)', filter: 'blur(200px)', opacity: 0.15, animation: 'gentleFloat 30s ease-in-out infinite reverse' }}></div>
            </div>

            <div className="container" style={{ position: 'relative', zIndex: 1, maxWidth: '1400px', margin: '0 auto', paddingTop: '15rem' }}>
                
                {/* Enhanced Hero Section */}
                <section className="text-center" style={{ marginBottom: '12rem' }}>
                    <div className="animate-fade-in" style={{ display: 'inline-flex', alignItems: 'center', gap: '1.2rem', marginBottom: '3rem', padding: '0.8rem 2.5rem', background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(30px)', borderRadius: '100px', border: '1px solid var(--glass-border)', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
                        <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--color-primary)', boxShadow: '0 0 20px var(--color-primary)', animation: 'pulse 2s infinite' }}></span>
                        <span style={{ color: 'var(--color-text-primary)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '4px', fontSize: '0.9rem' }}>The Visionaries</span>
                    </div>
                    
                    <h1 className="animate-slide-up" style={{ fontFamily: '"Outfit", sans-serif', fontSize: 'clamp(4rem, 8vw, 7.5rem)', fontWeight: '900', marginBottom: '2.5rem', letterSpacing: '-4px', color: 'var(--color-text-primary)', lineHeight: '0.95' }}>
                        Architecting <br />
                        <span style={{ 
                            background: 'linear-gradient(135deg, var(--color-primary) 20%, var(--color-accent) 80%)', 
                            WebkitBackgroundClip: 'text', 
                            WebkitTextFillColor: 'transparent',
                            position: 'relative',
                            display: 'inline-block'
                        }}>
                            New Realities.
                            <svg style={{ position: 'absolute', bottom: '-15px', left: 0, width: '100%', height: '25px', zIndex: -1 }} viewBox="0 0 100 20" preserveAspectRatio="none">
                                <path d="M0 10 Q 50 25 100 10" stroke="var(--color-primary)" strokeWidth="6" fill="none" opacity="0.4" strokeLinecap="round" />
                            </svg>
                        </span>
                    </h1>
                    <p className="animate-slide-up delay-100" style={{ fontSize: '1.5rem', color: 'var(--color-text-secondary)', maxWidth: '800px', margin: '0 auto', lineHeight: '1.8', fontWeight: '400', opacity: 0.9 }}>
                        A collective of deep-tech innovators and aesthetic purists united to redefine clinical engagement through elegant, autonomous digital systems.
                    </p>
                </section>

                {/* Mentors Section */}
                <section style={{ marginBottom: '15rem' }}>
                    <div className="animate-fade-in text-center" style={{ marginBottom: '6rem' }}>
                        <h2 style={{ fontFamily: '"Outfit", sans-serif', fontSize: '3.5rem', fontWeight: '900', color: 'var(--color-text-primary)', letterSpacing: '-2px', marginBottom: '1.5rem' }}>Core Leadership</h2>
                        <div style={{ width: '120px', height: '6px', background: 'rgba(255,255,255,0.05)', margin: '0 auto', borderRadius: '10px' }}></div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'center', gap: '4rem', flexWrap: 'wrap' }}>
                        {guides.map((guide, index) => (
                            <GuideCard key={guide.name} guide={guide} index={index} />
                        ))}
                    </div>
                </section>

                {/* Team Grid */}
                <section>
                    <div className="animate-fade-in text-center" style={{ marginBottom: '8rem' }}>
                        <h2 style={{ fontFamily: '"Outfit", sans-serif', fontSize: '4rem', fontWeight: '900', color: 'var(--color-text-primary)', letterSpacing: '-2px', marginBottom: '2rem' }}>Divine Developers</h2>
                        <div style={{ width: '150px', height: '8px', background: 'linear-gradient(90deg, var(--color-primary), var(--color-accent))', margin: '0 auto', borderRadius: '10px', boxShadow: '0 5px 20px rgba(139, 92, 246, 0.5)' }}></div>
                    </div>

                    <div style={{ 
                        display: 'flex', 
                        flexWrap: 'wrap',
                        justifyContent: 'center',
                        gap: '4rem',
                        padding: '0 2rem'
                    }}>
                        {teamMembers.map((member, index) => (
                            <TeamCard key={member.name} member={member} index={index} />
                        ))}
                    </div>
                </section>

                {/* Corporate Watermark */}
                <div style={{ 
                    textAlign: 'center', 
                    marginTop: '15rem',
                    paddingBottom: '5rem',
                    opacity: 0.4,
                    transition: 'opacity 0.5s ease',
                    fontFamily: '"Outfit", sans-serif'
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '0.4'}
                >
                    <p style={{ 
                        fontSize: '1rem', 
                        color: 'var(--color-text-secondary)',
                        letterSpacing: '5px',
                        textTransform: 'uppercase',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '1rem'
                    }}>
                        <span>Powered by</span>
                        <span 
                            onMouseEnter={(e) => {
                                e.currentTarget.style.color = 'var(--color-accent)';
                                e.currentTarget.innerText = "Jeevasurya";
                                e.currentTarget.style.letterSpacing = '2px';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.color = 'var(--color-primary)';
                                e.currentTarget.innerText = "JS";
                                e.currentTarget.style.letterSpacing = '5px';
                            }}
                            style={{ 
                                color: 'var(--color-primary)', 
                                fontWeight: '900', 
                                cursor: 'help',
                                transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                                borderBottom: '2px solid transparent'
                            }}
                        >JS</span>
                        <span>Corporations</span>
                    </p>
                </div>
            </div>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@100;400;600;700;800;900&display=swap');

                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(60px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                @keyframes gentleFloat {
                    0% { transform: translate(0, 0); }
                    50% { transform: translate(-20px, -30px); }
                    100% { transform: translate(0, 0); }
                }

                @keyframes pulse {
                    0% { transform: scale(1); opacity: 0.8; }
                    50% { transform: scale(1.3); opacity: 1; }
                    100% { transform: scale(1); opacity: 0.8; }
                }

                @keyframes shimmer {
                    from { transform: translateX(-100%) translateY(-100%); }
                    to { transform: translateX(100%) translateY(100%); }
                }

                @keyframes twinkle {
                    0%, 100% { opacity: 0.3; transform: scale(0.8); }
                    50% { opacity: 1; transform: scale(1.2); }
                }

                .animate-slide-up {
                    opacity: 0;
                    animation: slideUp 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }

                .delay-100 { animation-delay: 0.1s; }
                .delay-200 { animation-delay: 0.2s; }
                .delay-300 { animation-delay: 0.3s; }
                .delay-400 { animation-delay: 0.4s; }
                .delay-500 { animation-delay: 0.5s; }
                .delay-600 { animation-delay: 0.6s; }
            `}</style>
        </div>
    );
};

export default Team;
