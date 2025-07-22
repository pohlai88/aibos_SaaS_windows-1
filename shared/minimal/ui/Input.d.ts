/**
 * Simple Input Component for AI-BOS Shared Library
 */
import React from 'react';
export interface InputProps {
    value?: string;
    onChange?: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
}
export declare const Input: React.FC<InputProps>;
//# sourceMappingURL=Input.d.ts.map