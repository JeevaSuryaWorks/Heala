import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';

const ThemeSelector = () => {
    const { theme, toggleTheme } = useTheme();
    const [isOpen, setIsOpen] = useState(false);

    const themes = [
        { id: 'ocean', name: 'Ocean Blue', color: '#0891b2' },
        { id: 'medical', name: 'Medical Green', color: '#059669' },
        { id: 'sunset', name: 'Sunset Purple', color: '#a855f7' },
        { id: 'coral', name: 'Coral Pink', color: '#f43f5e' }
    ];

    return (
        <div style={{ position: 'relative' }}>
            <button
                className="btn btn-sm btn-outline"
                onClick={() => setIsOpen(!isOpen)}
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
                <div style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: themes.find(t => t.id === theme)?.color
                }}></div>
                Theme
            </button>

            {isOpen && (
                <div className="card card-glass" style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: '8px',
                    padding: '12px',
                    zIndex: 1000,
                    minWidth: '160px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                }}>
                    {themes.map(t => (
                        <button
                            key={t.id}
                            className={`btn btn-sm ${theme === t.id ? 'btn-primary' : 'btn-outline'}`}
                            style={{ width: '100%', justifyContent: 'flex-start', border: theme === t.id ? 'none' : '1px solid var(--color-border)' }}
                            onClick={() => {
                                toggleTheme(t.id);
                                setIsOpen(false);
                            }}
                        >
                            <div style={{
                                width: '10px',
                                height: '10px',
                                borderRadius: '50%',
                                backgroundColor: t.color,
                                marginRight: '8px'
                            }}></div>
                            {t.name}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ThemeSelector;
