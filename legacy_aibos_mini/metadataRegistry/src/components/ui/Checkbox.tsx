import React from 'react';
import { clsx } from 'clsx';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function Checkbox({ 
  className, 
  label, 
  error, 
  ...props 
}: CheckboxProps) {
  return (
    <div className="flex items-center">
      <input
        type="checkbox"
        className={clsx(
          'h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded',
          error && 'border-red-300 focus:ring-red-500',
          className
        )}
        {...props}
      />
      {label && (
        <label className="ml-2 block text-sm text-gray-900">
          {label}
        </label>
      )}
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
} 