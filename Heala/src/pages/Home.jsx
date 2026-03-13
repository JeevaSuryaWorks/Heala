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
        // Pre-load images for zero-latency transitions
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {/* Hero Section */}
            <section style={{
                padding: '8rem 0 6rem',
                backgroundColor: 'var(--color-bg-primary)',
                position: 'relative',
                overflow: 'hidden',
                minHeight: '90vh',
                display: 'flex',
                alignItems: 'center'
            }}>
                {/* Decorative Background Blobs */}
                <div className="animate-float" style={{
                    position: 'absolute',
                    top: '-15%', left: '-10%', width: '600px', height: '600px',
                    background: 'var(--color-primary-light)',
                    filter: 'blur(120px)', opacity: '0.15', borderRadius: '50%'
                }}></div>
                <div className="animate-float-delayed" style={{
                    position: 'absolute',
                    bottom: '-10%', right: '-5%', width: '500px', height: '500px',
                    background: 'var(--color-secondary-light)',
                    filter: 'blur(100px)', opacity: '0.15', borderRadius: '50%'
                }}></div>
                <div style={{
                    position: 'absolute',
                    top: '20%', right: '35%', width: '300px', height: '300px',
                    background: 'var(--color-accent-light)',
                    filter: 'blur(80px)', opacity: '0.1', borderRadius: '50%'
                }}></div>

                <div className="container grid grid-cols-2 items-center" style={{ position: 'relative', zIndex: 1, gap: '4rem' }}>
                    <div className="animate-slide-in">
                        <div className="glass-pill" style={{ display: 'inline-flex', alignItems: 'center', marginBottom: '1.5rem', gap: '8px' }}>
                            <span style={{
                                background: 'var(--gradient-primary)',
                                color: 'white',
                                padding: '2px 8px',
                                borderRadius: '12px',
                                fontSize: '0.75rem',
                                fontWeight: 'bold'
                            }}>NEW</span>
                            <span style={{ fontSize: '0.85rem', fontWeight: '500', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                Heala Telemedicine is now live <span style={{ color: 'var(--color-primary)', fontWeight: '800' }}>by JS Corporations</span> ✨
                            </span>
                        </div>

                        <h1 style={{ marginBottom: '1.5rem', lineHeight: '1.2', fontSize: '4.5rem', letterSpacing: '-2px', fontWeight: '900', color: 'var(--color-text-primary)' }}>
                            Modern healthcare, <br />
                            <span key={wordIndex} style={{
                                background: 'var(--gradient-hero, linear-gradient(135deg, #0891b2 0%, #3b82f6 100%))',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                                display: 'inline-block',
                                animation: 'typingWord 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards'
                            }}>
                                {peacefulWords[wordIndex]}
                            </span>
                        </h1>
                        <p style={{ fontSize: '1.35rem', marginBottom: '2.5rem', maxWidth: '550px', color: 'var(--color-text-secondary)', lineHeight: '1.8', fontWeight: '400' }}>
                            Experience a new era of restorative wellness. Heala combines clinical excellence with soul-soothing digital experiences, designed to bring peace to your recovery journey.
                        </p>

                        <div className="flex gap-md">
                            <Link to="/doctors" className="btn btn-lg btn-gradient" style={{ borderRadius: '2rem', padding: '1rem 2.5rem' }}>
                                <span>Find a Doctor</span>
                                <span style={{ marginLeft: '0.5rem' }}>→</span>
                            </Link>
                            {!user && (
                                <Link to="/register" className="btn btn-lg glass-panel" style={{ borderRadius: '2rem', padding: '1rem 2.5rem', color: 'var(--color-text-primary)', fontWeight: '600' }}>
                                    Join as Patient
                                </Link>
                            )}
                        </div>

                        {/* Stats Row */}
                        <div className="flex gap-xl" style={{ marginTop: '4rem' }}>
                            <div className="animate-fade-in" style={{ animationDelay: '0.3s', opacity: 0 }}>
                                <h3 style={{ marginBottom: '0.25rem', color: 'var(--color-text-primary)', fontSize: '2.5rem', fontWeight: '800' }}>500+</h3>
                                <p className="font-medium" style={{ margin: 0, color: 'var(--color-text-tertiary)', fontSize: '1rem' }}>Expert Specialists</p>
                            </div>
                            <div className="animate-fade-in" style={{ animationDelay: '0.5s', opacity: 0 }}>
                                <h3 style={{ marginBottom: '0.25rem', color: 'var(--color-text-primary)', fontSize: '2.5rem', fontWeight: '800' }}>10k<span style={{ color: 'var(--color-primary)' }}>+</span></h3>
                                <p className="font-medium" style={{ margin: 0, color: 'var(--color-text-tertiary)', fontSize: '1rem' }}>Happy Patients</p>
                            </div>
                        </div>
                    </div>

                    <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }} className="animate-fade-in">
                        {/* Main Graphic Card */}
                        <div style={{
                            width: '100%',
                            height: '600px',
                            background: `url("${teamMembers[memberIndex].image}") center/cover`,
                            borderRadius: '2.5rem',
                            position: 'relative',
                            boxShadow: '0 30px 60px -15px rgba(0,0,0,0.3)',
                            transition: 'background 0.8s ease-in-out'
                        }}>
                            <div style={{
                                position: 'absolute', inset: 0, borderRadius: '2.5rem',
                                background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)'
                            }}></div>

                            <div key={memberIndex} style={{
                                position: 'absolute', bottom: '2.5rem', left: '2.5rem', color: 'white',
                                animation: 'fadeInLeft 0.8s cubic-bezier(0.16, 1, 0.3, 1)'
                            }}>
                                <div className="glass-pill" style={{
                                    display: 'inline-flex', alignItems: 'center', gap: '8px',
                                    background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)',
                                    color: 'white', border: '1px solid rgba(255,255,255,0.1)',
                                    marginBottom: '1rem', padding: '0.4rem 1rem', borderRadius: '100px',
                                    fontSize: '0.85rem', fontWeight: 'bold'
                                }}>
                                    <span style={{ color: '#fbbf24' }}>⭐️</span> {teamMembers[memberIndex].rating} Rating
                                </div>
                                <h3 style={{ color: 'white', fontSize: '2.4rem', marginBottom: '0.25rem', fontWeight: '900', letterSpacing: '-1px' }}>
                                    {teamMembers[memberIndex].name}
                                </h3>
                                <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.2rem', fontWeight: '500' }}>
                                    {teamMembers[memberIndex].role}
                                </p>
                            </div>
                        </div>

                        {/* Floating Notification 1 */}
                        <div className="glass-panel animate-float" style={{
                            position: 'absolute',
                            top: '40px',
                            right: '-30px',
                            padding: '1rem 1.5rem',
                            borderRadius: '1rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            zIndex: 2
                        }}>
                            <div style={{
                                width: '40px', height: '40px',
                                background: 'rgba(16, 185, 129, 0.1)',
                                borderRadius: '50%',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: 'var(--color-success)', fontSize: '1.2rem'
                            }}>✓</div>
                            <div>
                                <p className="font-bold" style={{ margin: 0, fontSize: '0.9rem' }}>Verified</p>
                                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-tertiary)' }}>Top Professionals</p>
                            </div>
                        </div>

                        {/* Floating Notification 2 */}
                        <div className="glass-panel animate-float-delayed" style={{
                            position: 'absolute',
                            top: '180px',
                            left: '-60px',
                            padding: '1rem',
                            borderRadius: '1.5rem',
                            zIndex: 2,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.5rem',
                            width: '200px'
                        }}>
                            <div className="flex justify-between items-center">
                                <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Upcoming</span>
                                <span style={{ fontSize: '0.7rem', color: 'var(--color-primary)' }}>Today</span>
                            </div>
                            <div className="flex items-center gap-sm">
                                <div style={{ width: '32px', height: '32px', background: 'var(--color-bg-secondary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🩺</div>
                                <div>
                                    <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 'bold' }}>Checkup</p>
                                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>10:30 AM</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features/Why Choose Us */}
            <section style={{ padding: '8rem 0', background: 'var(--color-bg-secondary)' }}>
                <div className="container">
                    <div className="text-center" style={{ marginBottom: '5rem' }}>
                        <h2 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Care that comes to you</h2>
                        <p style={{ maxWidth: '600px', margin: '0 auto', fontSize: '1.2rem', color: 'var(--color-text-secondary)' }}>
                            We've optimized the entire healthcare journey. From finding the right specialist to managing your prescriptions.
                        </p>
                    </div>
                    <div className="grid grid-cols-3" style={{ gap: '2rem' }}>
                        {[
                            { title: 'Find Specialists', icon: '🔍', color: 'var(--color-primary)', desc: 'Search by specialty, location, or directly by name to find the perfect healthcare provider.' },
                            { title: 'Instant Booking', icon: '⚡', color: 'var(--color-warning)', desc: 'View real-time availability and book your appointment instantly without calling.' },
                            { title: 'Secure Records', icon: '🔒', color: 'var(--color-success)', desc: 'Your medical history and prescriptions are securely stored and easily accessible by you.' }
                        ].map((item, i) => (
                            <div key={i} className="card" style={{
                                padding: '3rem 2.5rem',
                                border: 'none',
                                borderRadius: '1.5rem',
                                background: 'var(--color-bg-primary)',
                                boxShadow: '0 10px 30px rgba(0,0,0,0.03)',
                                transition: 'transform 0.3s ease, box-shadow 0.3s ease'
                            }}
                                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-10px)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.08)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.03)'; }}
                            >
                                <div style={{
                                    width: '64px', height: '64px',
                                    borderRadius: '1rem',
                                    background: `${item.color}15`,
                                    color: item.color,
                                    fontSize: '2rem',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    marginBottom: '2rem'
                                }}>
                                    {item.icon}
                                </div>
                                <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>{item.title}</h3>
                                <p style={{ fontSize: '1.05rem', color: 'var(--color-text-secondary)', lineHeight: '1.6' }}>{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Specializations Section */}
            <section style={{ padding: '8rem 0', background: 'var(--color-bg-primary)' }}>
                <div className="container">
                    <div className="flex justify-between items-end" style={{ marginBottom: '4rem' }}>
                        <div style={{ maxWidth: '500px' }}>
                            <span className="badge badge-primary" style={{ marginBottom: '1rem' }}>Specialties</span>
                            <h2 style={{ fontSize: '3rem', marginBottom: '1rem', lineHeight: '1.1' }}>Expert care for<br />every condition</h2>
                        </div>
                        <Link to="/doctors" className="btn btn-outline" style={{ borderRadius: '2rem', padding: '0.75rem 2rem' }}>View All Providers →</Link>
                    </div>

                    <div className="grid grid-cols-4" style={{ gap: '1.5rem' }}>
                        {[
                            { name: 'Cardiology', icon: '🫀', count: '45 Doctors', color: 'var(--color-error)' },
                            { name: 'Neurology', icon: '🧠', count: '32 Doctors', color: 'var(--color-primary)' },
                            { name: 'Pediatrics', icon: '🧸', count: '56 Doctors', color: 'var(--color-warning)' },
                            { name: 'Dermatology', icon: '✨', count: '28 Doctors', color: 'var(--color-secondary)' }
                        ].map((spec) => (
                            <Link to={`/doctors?specialization=${spec.name}`} key={spec.name}
                                className="card"
                                style={{
                                    padding: '2rem',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'flex-start',
                                    textDecoration: 'none',
                                    background: 'var(--color-bg-secondary)',
                                    border: '1px solid transparent',
                                    transition: 'all 0.3s ease'
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 15px 30px rgba(0,0,0,0.05)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--color-bg-secondary)'; e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                            >
                                <div style={{
                                    fontSize: '2.5rem',
                                    marginBottom: '2rem'
                                }}>{spec.icon}</div>
                                <h4 style={{ color: 'var(--color-text-primary)', marginBottom: '0.25rem', fontSize: '1.25rem' }}>{spec.name}</h4>
                                <p style={{ fontSize: '0.9rem', color: 'var(--color-text-tertiary)', margin: 0 }}>{spec.count}</p>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* LEADER SECTION - GOBIKA R */}
            <section style={{ padding: '8rem 0', background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)', position: 'relative', overflow: 'hidden', color: 'white' }}>
                {/* Decorative Background Elements */}
                <div style={{ position: 'absolute', inset: 0, opacity: 0.15, backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.8) 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
                <div className="animate-float" style={{ position: 'absolute', top: '-10%', left: '-10%', width: '600px', height: '600px', background: 'radial-gradient(circle, var(--color-primary-dark) 0%, transparent 60%)', opacity: 0.4, borderRadius: '50%' }}></div>
                <div className="animate-float-delayed" style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '500px', height: '500px', background: 'radial-gradient(circle, var(--color-accent) 0%, transparent 60%)', opacity: 0.2, borderRadius: '50%' }}></div>

                <div className="container" style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
                    <div className="glass-panel" style={{
                        margin: '0 auto',
                        maxWidth: '900px',
                        padding: '5rem 4rem',
                        borderRadius: '2rem',
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 0 0 1px rgba(255,255,255,0.05)',
                        backdropFilter: 'blur(24px)'
                    }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
                            <div style={{ height: '1px', width: '50px', background: 'rgba(255,255,255,0.2)' }}></div>
                            <span className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--color-primary-light)', padding: '0.5rem 1rem', border: '1px solid rgba(255,255,255,0.1)' }}>Visionary Leadership</span>
                            <div style={{ height: '1px', width: '50px', background: 'rgba(255,255,255,0.2)' }}></div>
                        </div>

                        <h2 style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '4px' }}>Project Led By</h2>

                        <div style={{ position: 'relative', margin: '2rem 0 3rem' }}>
                            <h1 className="font-signature animate-glow" style={{
                                fontSize: '7.5rem',
                                background: 'linear-gradient(to right, #ffffff, #e0f2fe, #7dd3fc)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                margin: '0 0 1rem 0',
                                textShadow: '0 0 40px rgba(125, 211, 252, 0.4)',
                                lineHeight: '1.2'
                            }}>
                                Gobika R.
                            </h1>
                        </div>

                        <div style={{ position: 'relative' }}>
                            <div style={{ fontSize: '8rem', color: 'rgba(125, 211, 252, 0.1)', position: 'absolute', top: '-50px', left: '0', fontStyle: 'italic', fontFamily: 'serif', lineHeight: 1 }}>"</div>
                            <p style={{
                                fontSize: '1.8rem',
                                color: 'rgba(255,255,255,0.95)',
                                maxWidth: '750px',
                                margin: '0 auto',
                                lineHeight: '1.6',
                                fontStyle: 'italic',
                                fontWeight: '300',
                                position: 'relative',
                                zIndex: 1
                            }}>
                                Technology should empower healthcare, not complicate it. Heala is designed to put the patient's well-being absolutely first.
                            </p>
                            <div style={{ width: '40px', height: '4px', background: 'var(--gradient-primary)', margin: '3.5rem auto 0', borderRadius: '2px' }}></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section style={{ padding: '8rem 0', background: 'var(--color-bg-primary)' }}>
                <div className="container">
                    <div className="card-gradient" style={{
                        padding: '6rem 4rem',
                        textAlign: 'center',
                        borderRadius: '2.5rem',
                        position: 'relative',
                        overflow: 'hidden',
                        boxShadow: '0 20px 40px rgba(var(--color-primary-rgb), 0.2)'
                    }}>
                        <div style={{ position: 'absolute', top: '-50%', left: '-20%', width: '150%', height: '200%', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)', transform: 'rotate(35deg)' }}></div>
                        <h2 style={{ fontSize: '3.5rem', marginBottom: '1.5rem', position: 'relative', zIndex: 1, letterSpacing: '-2px', fontWeight: '900' }}>
                            Empowered by<br />
                            <span style={{
                                background: 'linear-gradient(to right, #60a5fa, #a78bfa, #f472b6)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                                fontFamily: '"Outfit", sans-serif'
                            }}>JS Corporations</span>
                        </h2>
                        <p style={{ marginBottom: '3rem', fontSize: '1.25rem', opacity: 0.9, position: 'relative', zIndex: 1, maxWidth: '600px', margin: '0 auto 3rem', lineHeight: '1.6', fontWeight: '500' }}>
                            Heala is built on the cutting-edge ecosystem of JS Corporations. We are revolutionizing healthcare delivery through advanced technology and visionary leadership.
                        </p>
                        <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                            <Link to="/register?role=doctor" className="btn btn-lg" style={{
                                background: 'white',
                                color: 'var(--color-primary)',
                                padding: '1.25rem 3rem',
                                fontSize: '1.1rem',
                                borderRadius: '3rem',
                                fontWeight: '800',
                                boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
                            }}>
                                Join the Revolution
                            </Link>
                            <Link to="/team" className="btn btn-lg" style={{
                                background: 'transparent',
                                color: 'white',
                                border: '2px solid rgba(255,255,255,0.3)',
                                padding: '1.25rem 3rem',
                                fontSize: '1.1rem',
                                borderRadius: '3rem',
                                fontWeight: '700'
                            }}>
                                Meet Our Team
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
            <style>{`
                @keyframes typingWord { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes gentleFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-30px); } }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes fadeInLeft { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }
                @keyframes pulse { 0%, 100% { transform: scale(1); opacity: 0.8; } 50% { transform: scale(1.1); opacity: 1; } }
                .animate-slide-in { animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                .animate-float { animation: gentleFloat 15s ease-in-out infinite; }
                .animate-float-delayed { animation: gentleFloat 20s ease-in-out infinite reverse; }
                .animate-glow { animation: pulse 4s ease-in-out infinite; }
            `}</style>
        </div>
    );
};

export default Home;
