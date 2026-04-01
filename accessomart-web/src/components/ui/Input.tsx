import React, { InputHTMLAttributes } from 'react';

export function Input({ className = '', ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`
        bg-surface-container-highest text-on-surface 
        border-0 border-b border-outline-variant/15
        focus:outline-none focus:ring-0 focus:border-b-primary
        transition-colors duration-300
        px-4 py-3 w-full font-sans
        placeholder:text-on-surface-variant
        ${className}
      `}
      {...props}
    />
  );
}
