import React from 'react';

const Card = ({ children, variant = 'default', className = '', ...props }) => {
    let baseClass = 'card';
    if (variant === 'glass') baseClass = 'card card-glass';
    if (variant === 'gradient') baseClass = 'card card-gradient';

    return (
        <div className={`${baseClass} ${className}`} {...props}>
            {children}
        </div>
    );
};

export default Card;
