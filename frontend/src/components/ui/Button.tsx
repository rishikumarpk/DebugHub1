import React from 'react';

type ButtonVariant = 'primary' | 'outline' | 'cta';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    children: React.ReactNode;
    className?: string;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ variant = 'primary', type = 'button', className = '', children, ...props }, ref) => {
        let baseClass = '';
        if (variant === 'primary') baseClass = 'btn-primary';
        if (variant === 'outline') baseClass = 'btn-outline';
        if (variant === 'cta') baseClass = 'btn-cta';

        return (
            <button ref={ref} type={type} className={`${baseClass} ${className}`} {...props}>
                {children}
            </button>
        );
    }
);
Button.displayName = 'Button';

export default Button;
