import React, { useEffect, useState } from 'react';

const HealaLoader = ({ fullScreen = false }) => {
    const [stars, setStars] = useState([]);
    const [sparkles, setSparkles] = useState([]);
    const [pills] = useState(['Cardiology', 'Wellness', 'Skincare', 'Mental Health']);

    useEffect(() => {
        // Generate Starfield
        const starCount = fullScreen ? 60 : 30;
        const newStars = Array.from({ length: starCount }).map((_, i) => ({
            id: i,
            size: Math.random() * 2 + 1,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            duration: `${Math.random() * 3 + 1.5}s`,
            delay: `${Math.random() * 5}s`,
        }));
        setStars(newStars);

        // Generate Sparkles
        const sparkleCount = fullScreen ? 12 : 6;
        const sparkleColors = ['#f9a8d4', '#e879f9', '#c084fc', '#d8b4fe'];
        const newSparkles = Array.from({ length: sparkleCount }).map((_, i) => {
            const angle = Math.random() * Math.PI * 2;
            const radius = fullScreen ? (150 + Math.random() * 100) : (80 + Math.random() * 40);
            return {
                id: i,
                color: sparkleColors[Math.floor(Math.random() * sparkleColors.length)],
                sx: `${Math.cos(angle) * radius}px`,
                sy: `${Math.sin(angle) * radius}px`,
                duration: `${Math.random() * 2.5 + 2}s`,
                delay: `${Math.random() * 4}s`,
            };
        });
        setSparkles(newSparkles);
    }, [fullScreen]);

    const activeStyles = {
        ...styles,
        fullScreen: {
            ...styles.fullScreen,
            position: fullScreen ? 'fixed' : 'absolute',
            width: '100%',
            height: '100%',
            borderRadius: fullScreen ? '0' : 'inherit'
        },
        ringContainer: {
            ...styles.ringContainer,
            transform: fullScreen ? 'scale(1)' : 'scale(0.7)'
        },
        textBlock: {
            ...styles.textBlock,
            marginTop: fullScreen ? '40px' : '10px'
        },
        brandName: {
            ...styles.brandName,
            fontSize: fullScreen ? '52px' : '32px'
        },
        tagline: {
            ...styles.tagline,
            marginBottom: fullScreen ? '28px' : '10px'
        }
    };

    return (
        <div style={activeStyles.fullScreen}>
            {/* Starfield */}
            {stars.map((star) => (
                <div
                    key={star.id}
                    className="loader-star"
                    style={{
                        ...styles.star,
                        width: star.size,
                        height: star.size,
                        left: star.left,
                        top: star.top,
                        '--duration': star.duration,
                        '--delay': star.delay,
                    }}
                />
            ))}

            {/* DNA Decorations */}
            {fullScreen && (
                <>
                    <div style={{ ...styles.dnaColumn, left: '40px' }} className="loader-dna">
                        <DNASVG />
                    </div>
                    <div style={{ ...styles.dnaColumn, right: '40px', transform: 'scaleX(-1)' }} className="loader-dna">
                        <DNASVG />
                    </div>
                </>
            )}

            <div style={styles.container}>
                {/* Orbiting Sparkles */}
                {sparkles.map((s) => (
                    <div
                        key={s.id}
                        className="loader-sparkle"
                        style={{
                            ...styles.sparkle,
                            background: s.color,
                            '--sx': s.sx,
                            '--sy': s.sy,
                            '--duration': s.duration,
                            '--delay': s.delay,
                        }}
                    />
                ))}

                <div style={activeStyles.ringContainer}>
                    <div className="loader-ring ring-outer" style={styles.ringOuter} />
                    <div className="loader-ring ring-mid" style={styles.ringMid} />
                    <div className="loader-ring ring-inner" style={styles.ringInner} />

                    {/* Petals */}
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div
                            key={i}
                            className="loader-petal"
                            style={{
                                ...styles.petal,
                                background: ['#f9a8d4', '#e879f9', '#c084fc', '#d8b4fe', '#fce7f3'][i % 5],
                                '--angle': `${i * 45}deg`,
                                animationDelay: `${i * 0.9}s, 0s`,
                            }}
                        />
                    ))}

                    <div style={styles.coreOrb} className="loader-core-pulse">
                        <HeartSVG scale={fullScreen ? 1 : 0.7} />
                    </div>
                </div>

                <div style={activeStyles.textBlock}>
                    <h1 className="loader-brand-name" style={activeStyles.brandName}>Heala</h1>
                    <p style={activeStyles.tagline}>Your health, your way</p>

                    <div style={styles.progressContainer}>
                        <div className="loader-progress-fill" style={styles.progressFill}>
                            <div style={styles.progressDot} />
                        </div>
                    </div>

                    <div style={styles.statusWrapper}>
                        <div className="loader-status-list" style={styles.statusList}>
                            <div style={styles.statusText}>Finding the best doctors for you…</div>
                            <div style={styles.statusText}>Personalizing your experience…</div>
                            <div style={styles.statusText}>Almost ready ✦</div>
                        </div>
                    </div>
                </div>
            </div>

            {fullScreen && (
                <div style={styles.pillsContainer}>
                    {pills.map((p, i) => (
                        <div key={p} className="loader-pill" style={{ ...styles.pill, animationDelay: `${i * 0.3}s` }}>
                            {p}
                        </div>
                    ))}
                </div>
            )}

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&family=Playfair+Display:ital,wght@1,500&display=swap');

                .loader-star {
                    animation: loaderTwinkle var(--duration) ease-in-out infinite var(--delay);
                }
                @keyframes loaderTwinkle {
                    0%, 100% { opacity: 0.15; transform: scale(1); }
                    50% { opacity: 0.9; transform: scale(1.4); }
                }

                .loader-dna { animation: loaderFloat 4s ease-in-out infinite; }
                @keyframes loaderFloat {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-8px); }
                }

                .ring-outer { animation: loaderSpin 5s linear infinite; }
                .ring-mid { animation: loaderSpin 3.5s linear infinite reverse; }
                .ring-inner { animation: loaderSpin 7s linear infinite; }
                @keyframes loaderSpin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }

                .loader-core-pulse { animation: loaderPulseOrb 2.4s ease-in-out infinite; }
                @keyframes loaderPulseOrb {
                    0%, 100% { transform: scale(1); box-shadow: 0 0 40px rgba(192, 132, 252, 0.5), 0 0 80px rgba(192, 132, 252, 0.2); }
                    50% { transform: scale(1.06); box-shadow: 0 0 60px rgba(192, 132, 252, 0.7), 0 0 100px rgba(192, 132, 252, 0.4); }
                }

                .loader-petal { 
                    animation: loaderOrbit 7.2s linear infinite, loaderPetalPop 2.4s ease-in-out infinite; 
                }
                @keyframes loaderOrbit {
                    from { transform: rotate(var(--angle)) translateX(100px) rotate(calc(-1 * var(--angle))); }
                    to { transform: rotate(calc(var(--angle) + 360deg)) translateX(100px) rotate(calc(-1 * (var(--angle) + 360deg))); }
                }
                @keyframes loaderPetalPop {
                    0%, 100% { opacity: 0.7; transform: scale(1); }
                    50% { opacity: 1; transform: scale(1.2); }
                }

                .loader-sparkle { animation: loaderSparkleFly var(--duration) ease-out infinite var(--delay); }
                @keyframes loaderSparkleFly {
                    0% { transform: translate(0, 0) scale(0); opacity: 0; }
                    20% { opacity: 1; }
                    80% { opacity: 0.8; }
                    100% { transform: translate(var(--sx), var(--sy)) scale(1.2); opacity: 0; }
                }

                .loader-brand-name { animation: loaderNameShimmer 3s ease-in-out infinite; }
                @keyframes loaderNameShimmer {
                    0%, 100% { filter: brightness(1); }
                    50% { filter: brightness(1.2); }
                }

                .loader-progress-fill { animation: loaderBar 3.2s cubic-bezier(.4, 0, .2, 1) forwards; }
                @keyframes loaderBar {
                    0% { width: 0%; }
                    40% { width: 72%; }
                    80% { width: 90%; }
                    100% { width: 100%; }
                }

                .loader-status-list { animation: loaderCycleUp 3.2s steps(1) forwards; }
                @keyframes loaderCycleUp {
                    0% { transform: translateY(0); }
                    33% { transform: translateY(-20px); }
                    66% { transform: translateY(-40px); }
                    100% { transform: translateY(-40px); }
                }

                .loader-pill { animation: loaderPillFloat 2.2s ease-in-out infinite; }
                @keyframes loaderPillFloat {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-5px); }
                }
            `}</style>
        </div>
    );
};

const DNASVG = () => (
    <svg viewBox="0 0 36 200" style={{ width: '100%', height: '100%' }}>
        <line x1="4" y1="20" x2="4" y2="170" stroke="#ff00ff" strokeWidth="1.5" opacity="0.4" />
        <line x1="32" y1="20" x2="32" y2="170" stroke="#ff00ff" strokeWidth="1.5" opacity="0.4" />
        <ellipse cx="18" cy="20" rx="14" ry="5" fill="none" stroke="#f9a8d4" strokeWidth="2" />
        <ellipse cx="18" cy="50" rx="14" ry="5" fill="none" stroke="#e879f9" strokeWidth="2" />
        <ellipse cx="18" cy="80" rx="14" ry="5" fill="none" stroke="#f9a8d4" strokeWidth="2" />
        <ellipse cx="18" cy="110" rx="14" ry="5" fill="none" stroke="#e879f9" strokeWidth="2" />
        <ellipse cx="18" cy="140" rx="14" ry="5" fill="none" stroke="#f9a8d4" strokeWidth="2" />
        <ellipse cx="18" cy="170" rx="14" ry="5" fill="none" stroke="#e879f9" strokeWidth="2" />
    </svg>
);

const HeartSVG = () => (
    <svg viewBox="0 0 100 100" style={{ width: '50px', height: '50px', animation: 'loaderHeartbeat 1.2s ease-in-out infinite' }}>
        <defs>
            <linearGradient id="loaderHeartGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#f9a8d4', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#e879f9', stopOpacity: 1 }} />
            </linearGradient>
        </defs>
        <path d="M50 88.9L42.8 82.4C17.1 59.1 0 43.6 0 26.7C0 11.8 11.8 0 26.7 0C35.1 0 43.2 3.9 48.5 10C53.8 3.9 61.9 0 70.3 0C85.2 0 97 11.8 97 26.7C97 43.6 79.9 59.1 54.2 82.4L50 88.9Z" fill="white" fillOpacity="0.95" />
        <path d="M50 88.9L42.8 82.4C17.1 59.1 0 43.6 0 26.7C0 11.8 11.8 0 26.7 0C35.1 0 43.2 3.9 48.5 10C53.8 3.9 61.9 0 70.3 0C85.2 0 97 11.8 97 26.7C97 43.6 79.9 59.1 54.2 82.4L50 88.9Z" fill="url(#loaderHeartGradient)" />
        <polyline points="20,45 35,45 42,25 50,65 58,45 75,45" fill="none" stroke="#c084fc" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        <style>{`
            @keyframes loaderHeartbeat {
                0% { transform: scale(1); }
                14% { transform: scale(1.18); }
                28% { transform: scale(1); }
                42% { transform: scale(1.11); }
                70% { transform: scale(1); }
            }
        `}</style>
    </svg>
);

const styles = {
    fullScreen: {
        position: 'fixed',
        top: 0, left: 0, width: '100vw', height: '100vh',
        background: 'linear-gradient(160deg, #1a0a2e 0%, #2d1150 40%, #1a0a2e 100%)',
        zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden', fontFamily: '"Nunito", sans-serif'
    },
    star: { position: 'absolute', background: '#f5d0fe', borderRadius: '50%', opacity: 0 },
    container: { position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 10 },
    dnaColumn: { position: 'absolute', width: '36px', height: '200px', opacity: 0.5 },
    ringContainer: { position: 'relative', width: '250px', height: '250px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    ringOuter: { position: 'absolute', width: '220px', height: '220px', borderRadius: '50%', border: '2px solid transparent', borderTopColor: '#f0abfc', borderRightColor: '#e879f9' },
    ringMid: { position: 'absolute', width: '188px', height: '188px', borderRadius: '50%', border: '2px solid transparent', borderTopColor: '#fbcfe8', borderLeftColor: '#f9a8d4' },
    ringInner: { position: 'absolute', width: '156px', height: '156px', borderRadius: '50%', border: '2px solid transparent', borderTopColor: '#c4b5fd', borderRightColor: '#a78bfa' },
    coreOrb: {
        width: '120px', height: '120px', borderRadius: '50%',
        background: 'radial-gradient(circle at 38% 35%, #fce7f3 0%, #f0abfc 45%, #c084fc 75%, #7c3aed 100%)',
        boxShadow: '0 0 40px rgba(192,132,252,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'absolute'
    },
    petal: { position: 'absolute', width: '18px', height: '18px', borderRadius: '50% 0 50% 0' },
    sparkle: { position: 'absolute', width: '6px', height: '6px', borderRadius: '50%', opacity: 0 },
    textBlock: { marginTop: '40px', textAlign: 'center' },
    brandName: {
        fontFamily: '"Playfair Display", serif', fontStyle: 'italic', fontWeight: 500, fontSize: '52px',
        background: 'linear-gradient(to right, #fce7f3, #f0abfc, #c084fc)', WebkitBackgroundClip: 'text', backgroundClip: 'text',
        color: 'transparent', margin: 0
    },
    tagline: { fontSize: '13px', fontWeight: 700, color: '#d8b4fe', textTransform: 'uppercase', letterSpacing: '3px', marginTop: '5px', marginBottom: '28px' },
    progressContainer: { width: '220px', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px' },
    progressFill: { height: '100%', background: 'linear-gradient(90deg, #f9a8d4, #e879f9, #c084fc)', borderRadius: '3px', position: 'relative' },
    progressDot: { position: 'absolute', right: '-6px', top: '-3px', width: '12px', height: '12px', background: '#fff', borderRadius: '50%', boxShadow: '0 0 10px #e879f9' },
    statusWrapper: { height: '20px', overflow: 'hidden', marginTop: '15px' },
    statusList: { display: 'flex', flexDirection: 'column' },
    statusText: { height: '20px', fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.7)', textAlign: 'center' },
    pillsContainer: { position: 'absolute', bottom: '20px', display: 'flex', gap: '12px' },
    pill: { fontSize: '10px', fontWeight: 700, padding: '4px 12px', borderRadius: '20px', border: '1px solid rgba(240,171,252,0.3)', background: 'rgba(192,132,252,0.12)', color: '#f5d0fe' }
};

export default HealaLoader;
