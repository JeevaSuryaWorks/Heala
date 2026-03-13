import React from 'react';

const Input = ({ label, error, className = '', ...props }) => {
    return (
        <div className={`input-group ${error ? 'has-error' : ''}`}>
            {label && <label className="input-label">{label}</label>}
            <input
                className={`input ${error ? 'input-error' : ''} ${className}`}
                {...props}
            />
            {error && <p className="error-message">{error}</p>}
        </div>
    );
};

export default Input;
