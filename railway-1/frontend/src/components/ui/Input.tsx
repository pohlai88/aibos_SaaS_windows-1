import React from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  onChange: (value: string) => void;
}

export function Input({ 
  label, 
  error, 
  className, 
  onChange, 
  ...props 
}: InputProps) {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <input
        className={cn(
          'input-field',
          error && 'border-red-300 focus:ring-red-500 focus:border-red-300',
          className
        )}
        onChange={(e) => onChange(e.target.value)}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
} 