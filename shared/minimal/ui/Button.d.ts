/**
 * Simple Button Component for AI-BOS Shared Library
 */
import React from 'react';
export interface ButtonProps {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    variant?: 'primary' | 'secondary' | 'danger';
    className?: string;
}
export declare const Button: React.FC<ButtonProps>;
//# sourceMappingURL=Button.d.ts.map