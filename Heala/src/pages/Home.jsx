import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
    const { user } = useAuth();
    const [memberIndex, setMemberIndex] = useState(0);
    const [wordIndex, setWordIndex] = useState(0);
    const peacefulWords = ['Healing.', 'Harmony.', 'Hope.', 'Serenity.', 'Vitality.', 'Elegance.',
        'Recovery.', 'Wellness.', 'Comfort.', 'Restoration.', 'Resilience.',
        'Nurturing.', 'Compassion.', 'Relief.', 'Renewal.', 'Strength.',
        'Wholeness.', 'Care.', 'Support.', 'Clarity.', 'Trust.',
        'Reassurance.', 'Progress.', 'Patience.', 'Balance.', 'Gentle.'];

    const teamMembers = [
        {
            name: 'Dr. Gobika',
            role: 'Senior Neurologist',
            rating: '5.0/5',
            image: '/Gobika.jpg'
        },
        {
            name: 'Dr. Karthika',
            role: 'Chief Cardiologist',
            rating: '4.9/5',
            image: '/Karthika.jpg'
        },
        {
            name: 'Dr. Mathumitha',
            role: 'Head of Diagnostics',
            rating: '4.8/5',
            image: '/Madhumitha.jpg'
        },
        {
            name: 'Dr. Manju',
            role: 'Lead Pediatrician',
            rating: '4.9/5',
            image: '/Manju.jpg'
        }
    ];

    useEffect(() => {
        // Load Premium Fonts for Founder Section
        const link = document.createElement('link');
        link.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,900;1,400&family=Cormorant+Garamond:ital,wght@0,300;0,600;1,300&display=swap';
        link.rel = 'stylesheet';
        document.head.appendChild(link);

        teamMembers.forEach(member => {
            const img = new Image();
            img.src = member.image;
        });

        const memberInterval = setInterval(() => {
            setMemberIndex((prev) => (prev + 1) % teamMembers.length);
        }, 8000);

        const wordInterval = setInterval(() => {
            setWordIndex((prev) => (prev + 1) % peacefulWords.length);
        }, 3000);

        return () => {
            clearInterval(memberInterval);
            clearInterval(wordInterval);
        };
    }, []);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0', overflowX: 'hidden' }}>
            {/* Hero Section */}
            <section style={{
                padding: '10rem 0 8rem',
                backgroundColor: 'var(--color-bg-primary)',
                position: 'relative',
                overflow: 'hidden',
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center'
            }}>
                {/* Advanced Background System */}
                <div className="animate-mesh-1" style={{ position: 'absolute', top: '-10%', left: '-10%', width: '800px', height: '800px', background: 'var(--color-primary-light)', filter: 'blur(150px)', opacity: '0.12', borderRadius: '50%' }}></div>
                <div className="animate-mesh-2" style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '700px', height: '700px', background: 'var(--color-secondary-light)', filter: 'blur(130px)', opacity: '0.12', borderRadius: '50%' }}></div>

                <div className="container" style={{ position: 'relative', zIndex: 10 }}>
                    <div className="grid grid-cols-2 items-center" style={{ gap: '6rem' }}>
                        <div className="animate-reveal">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '2rem' }}>
                                <div style={{ height: '2px', width: '30px', background: 'var(--color-primary)' }}></div>
                                <span style={{ fontSize: '0.9rem', fontWeight: 900, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '4px' }}>Heala x JS Corporations</span>
                            </div>

                            <h1 style={{ marginBottom: '2rem', lineHeight: '0.95', fontSize: '6rem', letterSpacing: '-4px', fontWeight: '950', color: 'var(--color-text-primary)' }}>
                                The Future of <br />
                                <span key={wordIndex} style={{
                                    background: 'linear-gradient(to right, #2DD4BF, #3B82F6, #8B5CF6)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text',
                                    display: 'inline-block',
                                    animation: 'wordReveal 1s cubic-bezier(0.16, 1, 0.3, 1)',
                                    paddingBottom: '0.2em'
                                }}>
                                    {peacefulWords[wordIndex]}
                                </span>
                            </h1>

                            <p style={{ fontSize: '1.4rem', marginBottom: '3.5rem', maxWidth: '600px', color: 'var(--color-text-secondary)', lineHeight: '1.7', fontWeight: '500', opacity: 0.9 }}>
                                Transcend classical boundaries. Heala delivers a clinically-precise, digitally-soothing recovery environment engineered by the visionaries at JS Corporations.
                            </p>

                            <div className="flex gap-lg">
                                <Link to="/doctors" className="btn btn-lg btn-gradient" style={{ borderRadius: '1.5rem', padding: '1.5rem 3.5rem', fontSize: '1.1rem', fontWeight: 900, boxShadow: '0 20px 40px -10px rgba(139, 92, 246, 0.5)', border: 'none' }}>
                                    Find Your Expert →
                                </Link>
                                {!user && (
                                    <Link to="/register" className="btn btn-lg" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', color: 'var(--color-text-primary)', borderRadius: '1.5rem', padding: '1.5rem 3.5rem', fontWeight: 700, backdropFilter: 'blur(10px)' }}>
                                        Join Community
                                    </Link>
                                )}
                            </div>

                            <div style={{ marginTop: '5rem', display: 'flex', gap: '3rem', borderTop: '1px solid var(--glass-border)', paddingTop: '3rem' }}>
                                {[
                                    { top: '500+', sub: 'World-Class Gurus' },
                                    { top: '12K+', sub: 'Global Citizens Healed' }
                                ].map((stat, i) => (
                                    <div key={i} className="animate-reveal-delayed">
                                        <h4 style={{ fontSize: '2.5rem', fontWeight: 950, color: 'var(--color-text-primary)', margin: 0 }}>{stat.top}</h4>
                                        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-tertiary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>{stat.sub}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Interactive Hero Visual */}
                        <div style={{ position: 'relative' }} className="animate-float-hero">
                            {/* Decorative Rings */}
                            <div style={{ position: 'absolute', inset: '-20px', border: '1px solid var(--color-primary-light)', borderRadius: '3.5rem', opacity: 0.2, animation: 'spin 30s linear infinite' }}></div>
                            <div style={{ position: 'absolute', inset: '-40px', border: '1px solid var(--color-secondary-light)', borderRadius: '4rem', opacity: 0.1, animation: 'spin 40s linear infinite reverse' }}></div>

                            <div style={{
                                width: '100%', height: '650px',
                                borderRadius: '3rem', position: 'relative', overflow: 'hidden',
                                boxShadow: '0 50px 100px -20px rgba(0,0,0,0.5)',
                                background: '#0f172a' // Fallback color
                            }}>
                                {/* Layered Image Transitions for Liquid-Smooth Cross-fade */}
                                {teamMembers.map((member, i) => (
                                    <div
                                        key={i}
                                        style={{
                                            position: 'absolute',
                                            inset: 0,
                                            background: `url("${member.image}") center/cover`,
                                            opacity: memberIndex === i ? 1 : 0,
                                            transition: 'opacity 1.5s cubic-bezier(0.16, 1, 0.3, 1)',
                                            zIndex: memberIndex === i ? 1 : 0,
                                            transform: memberIndex === i ? 'scale(1)' : 'scale(1.05)',
                                        }}
                                    />
                                ))}

                                {/* Permanent Cinematic Overlay */}
                                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15, 23, 42, 0.9) 0%, transparent 60%)', zIndex: 2 }}></div>

                                <div key={memberIndex} style={{ position: 'absolute', bottom: '3rem', left: '3rem', right: '3rem', animation: 'fadeInUp 0.8s ease-out', zIndex: 3 }}>
                                    <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', padding: '0.5rem 1.2rem', borderRadius: '100px', border: '1px solid rgba(255,255,255,0.1)', marginBottom: '1rem' }}>
                                        <span style={{ fontSize: '0.85rem', fontWeight: 900, color: 'white', letterSpacing: '1px' }}>PREMIUM PRACTITIONER</span>
                                    </div>
                                    <h3 style={{ fontSize: '3rem', fontWeight: 950, color: 'white', margin: '0 0 0.5rem 0', letterSpacing: '-1.5px' }}>{teamMembers[memberIndex].name}</h3>
                                    <p style={{ fontSize: '1.3rem', color: 'rgba(255,255,255,0.8)', fontWeight: 600, margin: 0 }}>{teamMembers[memberIndex].role}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* REVOLUTIONARY FEATURES SECTION */}
            <section style={{ padding: '12rem 0', background: 'var(--color-bg-secondary)', position: 'relative', overflow: 'hidden' }}>
                <div className="container">
                    <div className="grid grid-cols-12 items-start" style={{ gap: '4rem' }}>
                        <div className="col-span-5" style={{ position: 'sticky', top: '150px' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: 'rgba(8, 145, 178, 0.08)', padding: '0.6rem 1.2rem', borderRadius: '100px', marginBottom: '2rem', border: '1px solid rgba(8, 145, 178, 0.2)' }}>
                                <span style={{ width: '8px', height: '8px', background: 'var(--color-primary)', borderRadius: '50%', boxShadow: '0 0 10px var(--color-primary)' }}></span>
                                <span style={{ fontSize: '0.8rem', fontWeight: 900, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '2px' }}>Care Reimagined</span>
                            </div>
                            <h2 style={{ fontSize: '4.5rem', fontWeight: 950, lineHeight: '1.2', letterSpacing: '-3px', marginBottom: '2rem', color: 'var(--color-text-primary)' }}>
                                Care that <br />
                                <span style={{
                                    background: 'linear-gradient(to right, var(--color-primary), var(--color-secondary))',
                                    WebkitBackgroundClip: 'text',
                                    backgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    color: 'transparent',
                                    display: 'inline-block'
                                }}>comes to you.</span>
                            </h2>
                            <p style={{ fontSize: '1.2rem', color: 'var(--color-text-secondary)', lineHeight: '1.8', marginBottom: '3rem', fontWeight: 500 }}>
                                We've engineered a seamless healthcare ecosystem where clinical expertise meets digital fluidness. No friction. No waiting. Just recovery.
                            </p>
                            <div style={{ display: 'flex', gap: '20px' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 20px rgba(0,0,0,0.05)' }}>🧪</div>
                                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 20px rgba(0,0,0,0.05)' }}>🧠</div>
                                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 20px rgba(0,0,0,0.05)' }}>💖</div>
                            </div>
                        </div>

                        <div className="col-span-7 grid grid-cols-2" style={{ gap: '2rem' }}>
                            {[
                                { title: 'Neural Matching', icon: '🔍', color: '#3b82f6', desc: 'Our AI finds the perfect medical match for your specific condition based on 50+ clinical data points.' },
                                { title: 'Fluid Booking', icon: '⚡', color: '#10b981', desc: 'Instant access to global specialists with zero friction. Book, confirm, and heal in seconds.' },
                                { title: 'Vault Access', icon: '🔒', color: '#8b5cf6', desc: 'Military-grade encryption for your lifelong medical data. Your history, globally accessible by you.' },
                                { title: 'Treatment Sync', icon: '🔄', color: '#f59e0b', desc: 'Real-time synchronization between your wearable data and your doctors clinical console.' }
                            ].map((item, i) => (
                                <div key={i} className="glass-panel" style={{
                                    padding: '3rem', borderRadius: '2.5rem', border: '1px solid rgba(0,0,0,0.05)',
                                    background: 'rgba(255,255,255,0.7)', transition: 'all 0.4s ease',
                                    display: 'flex', flexDirection: 'column', gap: '1.5rem',
                                    marginTop: i % 2 !== 0 ? '4rem' : '0',
                                    boxShadow: '0 10px 30px -10px rgba(0,0,0,0.05)',
                                    backdropFilter: 'blur(20px)'
                                }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-15px)'; e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = 'var(--color-primary)'; e.currentTarget.style.boxShadow = '0 30px 60px -20px rgba(0,0,0,0.1)'; }}>
                                    <div style={{ width: '70px', height: '70px', borderRadius: '20px', background: `${item.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', color: item.color, boxShadow: `0 15px 30px ${item.color}20` }}>{item.icon}</div>
                                    <h3 style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--color-text-primary)' }}>{item.title}</h3>
                                    <p style={{ fontSize: '1.05rem', color: 'var(--color-text-secondary)', lineHeight: '1.6', fontWeight: 500 }}>{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* EXPERT WALL SECTION */}
            <section style={{ padding: '12rem 0', background: 'var(--color-bg-primary)', position: 'relative' }}>
                <div className="container">
                    <div className="text-center" style={{ marginBottom: '8rem' }}>
                        <h2 className="animate-reveal" style={{ fontSize: '5rem', fontWeight: 950, letterSpacing: '-4px', lineHeight: '1', color: 'var(--color-text-primary)', marginBottom: '2rem' }}>
                            Expert care for <br />
                            <span style={{ color: 'var(--color-primary)' }}>every condition.</span>
                        </h2>
                        <p style={{ maxWidth: '700px', margin: '0 auto', fontSize: '1.3rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                            Access a global roster of board-certified specialists across 50+ medical domains, unified by Healas clinical protocol.
                        </p>
                    </div>

                    <div className="grid grid-cols-4" style={{ gap: '2rem' }}>
                        {[
                            { name: 'Cardiology', icon: '🫀', color: '#ff4d4d', docCount: '120+' },
                            { name: 'Neurology', icon: '🧠', color: '#3b82f6', docCount: '85+' },
                            { name: 'Pediatrics', icon: '🧸', color: '#f97316', docCount: '150+' },
                            { name: 'Dermatology', icon: '✨', color: '#d946ef', docCount: '92+' },
                            { name: 'Psychiatry', icon: '🧘', color: '#10b981', docCount: '110+' },
                            { name: 'Orthopedics', icon: '🦴', color: '#6366f1', docCount: '78+' },
                            { name: 'Oncology', icon: '🎗️', color: '#ec4899', docCount: '64+' },
                            { name: 'Emergency', icon: '🚑', color: '#ef4444', docCount: '24/7' }
                        ].map((spec, i) => (
                            <div key={i} className="spec-card" style={{
                                padding: '3rem 2rem', background: 'var(--color-bg-secondary)',
                                borderRadius: '35px', border: '1px solid transparent', textAlign: 'center',
                                transition: 'all 0.3s ease', cursor: 'pointer', position: 'relative', overflow: 'hidden'
                            }}>
                                <div style={{ fontSize: '4rem', marginBottom: '1.5rem', transition: 'transform 0.3s ease' }} className="icon-bounce">{spec.icon}</div>
                                <h4 style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--color-text-primary)', marginBottom: '0.5rem' }}>{spec.name}</h4>
                                <span style={{ fontSize: '0.85rem', color: 'var(--color-text-tertiary)', fontWeight: 800 }}>{spec.docCount} PRACTITIONERS</span>
                                <div className="spec-hover-glow" style={{ position: 'absolute', inset: 0, background: `radial-gradient(circle at center, ${spec.color}15 0%, transparent 70%)`, opacity: 0, transition: 'opacity 0.3s' }}></div>
                            </div>
                        ))}
                    </div>

                    <div style={{ marginTop: '6rem', textAlign: 'center' }}>
                        <Link to="/doctors" style={{ display: 'inline-flex', alignItems: 'center', gap: '15px', padding: '1.5rem 4rem', borderRadius: '100px', background: 'var(--color-text-primary)', color: 'white', textDecoration: 'none', fontWeight: 900, fontSize: '1.1rem', transition: 'all 0.3s' }}>
                            VIEW GLOBAL DIRECTORY 🌐
                        </Link>
                    </div>
                </div>
            </section>

            {/* SPECIALIZED FOUNDER SECTION - GOBIKA RANGASAMY */}
            <section style={{
                padding: '12rem 0',
                background: '#faf5f5', // Soft champagne/warm white
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Cinematic Background Text */}
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    fontSize: '25rem',
                    fontWeight: 900,
                    color: 'rgba(241, 156, 187, 0.05)',
                    fontFamily: 'Playfair Display, serif',
                    letterSpacing: '2rem',
                    pointerEvents: 'none',
                    whiteSpace: 'nowrap',
                    zIndex: 0,
                    animation: 'gentlePulse 10s infinite ease-in-out'
                }}>
                    HEAL
                </div>

                {/* Enhanced Chic Background Elements */}
                <div className="sparkle-container" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1 }}>
                    {[...Array(30)].map((_, i) => (
                        <div key={i} className="sparkle" style={{
                            position: 'absolute',
                            top: `${Math.random() * 100}%`,
                            left: `${Math.random() * 100}%`,
                            width: i % 3 === 0 ? '6px' : '3px',
                            height: i % 3 === 0 ? '6px' : '3px',
                            background: i % 2 === 0 ? 'white' : '#f19cbb',
                            borderRadius: '50%',
                            boxShadow: `0 0 15px 2px ${i % 2 === 0 ? 'rgba(139, 92, 246, 0.3)' : 'rgba(241, 156, 187, 0.6)'}`,
                            animation: `floatSparkle ${4 + Math.random() * 6}s infinite ease-in-out`,
                            animationDelay: `${Math.random() * 5}s`,
                            opacity: 0.6
                        }}></div>
                    ))}
                    {/* Floating Soft Glows */}
                    <div className="animate-aurora" style={{ position: 'absolute', top: '10%', right: '10%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(241, 156, 187, 0.15) 0%, transparent 70%)', filter: 'blur(60px)' }}></div>
                    <div className="animate-aurora" style={{ position: 'absolute', bottom: '10%', left: '10%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 70%)', filter: 'blur(50px)', animationDelay: '-5s' }}></div>
                </div>

                <div className="container" style={{ position: 'relative', zIndex: 2 }}>
                    <div className="flex flex-col items-center text-center" style={{ maxWidth: '900px', margin: '0 auto' }}>
                        {/* Content Side - Now Centered */}
                        <div className="animate-reveal">
                            <div style={{ marginBottom: '3rem' }}>
                                <span style={{
                                    fontSize: '1rem',
                                    color: '#f19cbb',
                                    fontWeight: 800,
                                    textTransform: 'uppercase',
                                    letterSpacing: '4px',
                                    display: 'block',
                                    marginBottom: '1rem'
                                }}>The Heart Behind Heala</span>

                                <h1 className="font-chic" style={{
                                    fontSize: '6.5rem',
                                    lineHeight: '1.2', // Increased to prevent clipping of g and y
                                    margin: '0 0 1.5rem 0',
                                    padding: '0 0 1rem 0', // Added bottom padding for descenders
                                    background: 'linear-gradient(135deg, #2d1b33 20%, #f19cbb 50%, #2d1b33 80%)',
                                    WebkitBackgroundClip: 'text',
                                    backgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    color: 'transparent',
                                    letterSpacing: '-3px',
                                    fontWeight: 900,
                                    display: 'block',
                                    width: '100%',
                                    position: 'relative',
                                    zIndex: 1
                                }}>
                                    Gobika <br /> Rangasamy
                                </h1>

                                <div style={{ width: '120px', height: '1.5px', background: 'linear-gradient(to right, transparent, #f19cbb, transparent)', margin: '0 auto 4rem' }}></div>
                            </div>

                            <p className="font-garamond" style={{
                                fontSize: '2.2rem',
                                color: '#2d1b33',
                                lineHeight: '1.6',
                                fontStyle: 'italic',
                                fontWeight: 400,
                                marginBottom: '5rem',
                                position: 'relative',
                                maxWidth: '850px',
                                margin: '0 auto 5rem',
                                opacity: 1
                            }}>
                                <span style={{ fontSize: '12rem', color: '#f19cbb', position: 'absolute', top: '-100px', left: '0', right: '0', opacity: 0.1, fontFamily: 'serif', pointerEvents: 'none' }}>“</span>
                                We believe healthcare is more than clinical precision—it's a journey of compassion and grace. Heala is my vision for a world where every patient feels the warmth of personalized care, empowered by technology that truly understands.
                            </p>

                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <span style={{ fontSize: '0.9rem', fontWeight: 900, color: '#f19cbb', textTransform: 'uppercase', letterSpacing: '2px' }}>CEO & VISIONARY</span>
                                    <span className="font-signature" style={{ fontSize: '3rem', color: '#2d1b33', marginTop: '0.5rem' }}>Gobika R.</span>
                                </div>
                                <Link to="/team" style={{
                                    color: '#2d1b33',
                                    textDecoration: 'none',
                                    fontWeight: 800,
                                    fontSize: '1rem',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    borderBottom: '2px solid #f19cbb',
                                    paddingBottom: '5px',
                                    marginTop: '2rem'
                                }}>
                                    READ THE FULL JOURNEY <span>↗</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CINEMATIC FINALE - EMPOWERED BY JS CORPORATIONS */}
            <section style={{ padding: '15rem 0', background: '#020617', position: 'relative', overflow: 'hidden', color: 'white' }}>
                {/* Cosmic Background */}
                <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 50%, rgba(30, 58, 138, 0.3) 0%, transparent 70%)' }}></div>
                <div className="aurora" style={{ position: 'absolute', top: '-20%', left: '-10%', width: '120%', height: '140%', background: 'linear-gradient(45deg, #1e3a8a 0%, #3b82f6 25%, #8b5cf6 50%, #ec4899 75%, #ef4444 100%)', filter: 'blur(120px)', opacity: 0.15, animation: 'auroraMove 20s linear infinite alternate' }}></div>

                <div className="container" style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3rem' }}>
                        <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: 'linear-gradient(135deg, #0ea5e9, #a855f7)', padding: '2px' }}>
                            <div style={{ width: '100%', height: '100%', background: '#020617', borderRadius: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>JS</div>
                        </div>

                        <h2 style={{ fontSize: '1.2rem', fontWeight: 900, letterSpacing: '8px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', margin: 0 }}>Empowered By</h2>

                        <h1 className="cinematic-title" style={{
                            fontSize: '9rem', fontWeight: 950, letterSpacing: '-8px', lineHeight: '0.8',
                            background: 'linear-gradient(to bottom, #ffffff 30%, rgba(255,255,255,0.4) 100%)',
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                            margin: 0
                        }}>
                            JS CORPORATIONS
                        </h1>

                        <p style={{ maxWidth: '850px', fontSize: '1.8rem', color: 'rgba(255,255,255,0.7)', fontWeight: 400, lineHeight: '1.6', letterSpacing: '-0.5px' }}>
                            Heala is the physical manifestation of JS Corporations visionary healthcare engineering. A sanctuary of health designed for the 21st century.
                        </p>

                        <div style={{ display: 'flex', gap: '2rem', marginTop: '3rem' }}>
                            <Link to="/register?role=doctor" style={{ padding: '1.8rem 5rem', borderRadius: '100px', background: 'white', color: '#020617', fontWeight: 950, textDecoration: 'none', fontSize: '1.2rem', boxShadow: '0 0 50px rgba(255,255,255,0.2)' }}>JOIN THE EVOLUTION</Link>
                            <Link to="/team" style={{ padding: '1.8rem 5rem', borderRadius: '100px', background: 'transparent', color: 'white', fontWeight: 800, textDecoration: 'none', fontSize: '1.2rem', border: '2px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)' }}>MEET THE VISIONARIES</Link>
                        </div>
                    </div>
                </div>

                {/* Floating Founder Credits (Subtle) */}
                <div style={{ position: 'absolute', bottom: '4rem', left: '0', right: '0', textAlign: 'center', opacity: 0.3 }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 900, letterSpacing: '4px', textTransform: 'uppercase' }}>Vision Led By Gobika Rangasamy & The JS Council</span>
                </div>
            </section>

            <style>{`
                @keyframes floatSparkle { 0%, 100% { transform: translateY(0) scale(1); opacity: 0; } 50% { transform: translateY(-40px) scale(1.5); opacity: 0.8; } }
                @keyframes wordReveal { from { opacity: 0; transform: translateY(20px) rotateX(-20deg); } to { opacity: 1; transform: translateY(0) rotateX(0); } }
                @keyframes auroraMove { from { transform: rotate(0deg) scale(1); } to { transform: rotate(10deg) scale(1.1); } }
                @keyframes gentlePulse { 0%, 100% { opacity: 0.03; transform: translate(-50%, -50%) scale(1); } 50% { opacity: 0.08; transform: translate(-50%, -50%) scale(1.05); } }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes floatHero { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-20px); } }
                
                .font-chic { font-family: 'Playfair Display', serif; }
                .font-garamond { font-family: 'Cormorant Garamond', serif; }
                .animate-chic-reveal { animation: fadeInUp 1.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                .animate-reveal { animation: fadeInUp 1s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                .animate-aurora { animation: auroraMove 20s linear infinite alternate; }
                .animate-reveal-delayed { opacity: 0; animation: fadeInUp 1s cubic-bezier(0.16, 1, 0.3, 1) 0.5s forwards; }
                .animate-float-hero { animation: floatHero 8s ease-in-out infinite; }
                
                .spec-card:hover { border-color: var(--color-primary) !important; transform: scale(1.05) translateY(-5px); box-shadow: 0 30px 60px -15px rgba(139, 92, 246, 0.4); background: white !important; }
                .spec-card:hover .spec-hover-glow { opacity: 1; }
                .spec-card:hover .icon-bounce { transform: scale(1.2) rotate(10deg); }
                
                .cinematic-title { filter: drop-shadow(0 0 30px rgba(255,255,255,0.2)); }
                
                @media (max-width: 1024px) {
                    h1 { fontSize: '4rem' !important; }
                    .cinematic-title { fontSize: '4.5rem' !important; letterSpacing: '-2px' !important; }
                }
            `}</style>
        </div>
    );
};

export default Home;
