import React, { useState, useEffect, useRef } from 'react';

const ModernDropdown = ({ 
    options = [], 
    value, 
    onChange, 
    placeholder = "Select option", 
    label,
    icon,
    style = {},
    containerStyle = {}
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const selectedOption = options.find(opt => opt.value === value);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (optionValue) => {
        onChange(optionValue);
        setIsOpen(false);
    };

    return (
        <div style={{ position: 'relative', width: '100%', ...containerStyle }} ref={dropdownRef}>
            {label && (
                <label style={{ 
                    display: 'block', 
                    marginBottom: '0.5rem', 
                    fontSize: '0.85rem', 
                    fontWeight: 700, 
                    color: 'var(--color-text-muted)',
                    letterSpacing: '0.5px'
                }}>
                    {label}
                </label>
            )}
            
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    width: '100%',
                    padding: '1rem 1.25rem',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border, rgba(255,255,255,0.1))',
                    borderRadius: '14px',
                    color: selectedOption ? 'inherit' : 'var(--color-text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    fontSize: '0.95rem',
                    fontWeight: 500,
                    ...style
                }}
                className="dropdown-trigger"
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {icon && <span style={{ opacity: 0.7 }}>{icon}</span>}
                    <span>{selectedOption ? selectedOption.label : placeholder}</span>
                </div>
                <svg 
                    width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" 
                    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                    style={{ 
                        transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                        transform: isOpen ? 'rotate(-180deg)' : 'rotate(0deg)',
                        opacity: 0.5
                    }}
                >
                    <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
            </button>

            {isOpen && (
                <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    left: 0,
                    right: 0,
                    background: 'var(--color-surface, rgba(255, 255, 255, 0.98))',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '16px',
                    boxShadow: '0 30px 60px -12px rgba(0,0,0,0.25), 0 18px 36px -18px rgba(0,0,0,0.3), 0 0 0 1px var(--glass-border)',
                    zIndex: 1000,
                    overflow: 'hidden',
                    animation: 'dropdownRotateIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    transformOrigin: 'top center',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)'
                }}>
                    <style>{`
                        @keyframes dropdownRotateIn {
                            from { opacity: 0; transform: translateY(-10px) scale(0.95); }
                            to { opacity: 1; transform: translateY(0) scale(1); }
                        }
                        .dropdown-option:hover {
                            background: rgba(20, 184, 166, 0.08) !important;
                            padding-left: 1.75rem !important;
                        }
                    `}</style>
                    <div style={{ maxHeight: '250px', overflowY: 'auto', padding: '6px' }}>
                        {options.map((opt) => (
                            <div
                                key={opt.value}
                                onClick={() => handleSelect(opt.value)}
                                className="dropdown-option"
                                style={{
                                    padding: '0.85rem 1.25rem',
                                    fontSize: '0.9rem',
                                    fontWeight: value === opt.value ? 700 : 500,
                                    color: value === opt.value ? 'var(--color-primary, #14b8a6)' : 'inherit',
                                    background: value === opt.value ? 'rgba(20, 184, 166, 0.05)' : 'transparent',
                                    cursor: 'pointer',
                                    borderRadius: '10px',
                                    transition: 'all 0.25s ease',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between'
                                }}
                            >
                                <span>{opt.label}</span>
                                {value === opt.value && (
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ModernDropdown;
