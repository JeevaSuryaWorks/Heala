import React from 'react';
import Ballpit from '../components/Ballpit';

const Enjoy = () => {
    // Array of vibrant color hex codes (numeric format for Three.js)
    const colorfulPalette = [0x00ffff, 0xff00ff, 0xffff00, 0x00ff00, 0xff5500];

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 9999, overflow: 'hidden', backgroundColor: '#050505' }}>
            
            {/* Centered Neon Background Text */}
            <style>
                {`
                    @import url('https://fonts.googleapis.com/css2?family=Righteous&display=swap');
                    
                    @keyframes neonCycle {
                        0%, 100% { text-shadow: 0 0 10px #00ffff, 0 0 20px #00ffff, 0 0 40px #00ffff, 0 0 80px #00ffff, 0 0 120px #00ffff; }
                        20% { text-shadow: 0 0 10px #ff00ff, 0 0 20px #ff00ff, 0 0 40px #ff00ff, 0 0 80px #ff00ff, 0 0 120px #ff00ff; }
                        40% { text-shadow: 0 0 10px #ffff00, 0 0 20px #ffff00, 0 0 40px #ffff00, 0 0 80px #ffff00, 0 0 120px #ffff00; }
                        60% { text-shadow: 0 0 10px #00ff00, 0 0 20px #00ff00, 0 0 40px #00ff00, 0 0 80px #00ff00, 0 0 120px #00ff00; }
                        80% { text-shadow: 0 0 10px #ff5500, 0 0 20px #ff5500, 0 0 40px #ff5500, 0 0 80px #ff5500, 0 0 120px #ff5500; }
                    }
                    
                    .animated-neon {
                        animation: neonCycle 10s infinite;
                    }
                `}
            </style>
            <div style={{ 
                position: 'absolute', 
                top: '50%', 
                left: '50%', 
                transform: 'translate(-50%, -50%)', 
                zIndex: 1, 
                pointerEvents: 'none',
                width: '100%',
                textAlign: 'center'
            }}>
                <h1 className="animated-neon" style={{ 
                    color: '#ffffff', 
                    fontFamily: '"Righteous", cursive', 
                    fontWeight: 400, 
                    fontSize: 'clamp(5rem, 15vw, 15rem)',
                    margin: 0, 
                    padding: 0,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    opacity: 0.8
                }}>
                    Heala
                </h1>
            </div>

            {/* Interactive Ballpit over the text */}
            <div style={{ position: 'relative', width: '100%', height: '100%', zIndex: 10 }}>
                <Ballpit 
                    count={200} 
                    gravity={0.7} 
                    friction={0.9975} 
                    wallBounce={0.95} 
                    maxVelocity={0.15} 
                    followCursor={true}
                    colors={colorfulPalette}
                    ambientIntensity={1.5}
                    lightIntensity={300}
                    materialParams={{
                        metalness: 0.2, // Lower metalness makes colors pop more
                        roughness: 0.1, // Smooth and glossy
                        clearcoat: 1,
                        clearcoatRoughness: 0.1
                    }}
                />
            </div>
        </div>
    );
};

export default Enjoy;
