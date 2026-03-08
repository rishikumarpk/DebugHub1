import React from 'react';

export type BadgeColor = 'python' | 'javascript' | 'java' | 'cpp' | 'go' | 'easy' | 'medium' | 'hard' | 'default';

interface BadgeProps {
    color?: BadgeColor;
    children: React.ReactNode;
    className?: string;
}

const Badge = ({ color = 'default', children, className = '' }: BadgeProps) => {
    let colorClass = '';
    switch (color) {
        case 'python':
            colorClass = 'badge-python';
            break;
        case 'javascript':
            colorClass = 'badge-javascript';
            break;
        case 'java':
            colorClass = 'badge-java';
            break;
        case 'cpp':
            colorClass = 'badge-cpp';
            break;
        case 'go':
            colorClass = 'badge-go';
            break;
        case 'easy':
            colorClass = 'badge-easy';
            break;
        case 'medium':
            colorClass = 'badge-medium';
            break;
        case 'hard':
            colorClass = 'badge-hard';
            break;
        default:
            colorClass = 'bg-[#E0E0E026] text-[#E0E0E0]'; // Default mute purple
    }

    return (
        <span className={`badge ${colorClass} ${className}`}>
            {children}
        </span>
    );
};

export default Badge;
