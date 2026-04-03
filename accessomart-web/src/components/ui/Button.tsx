import React, { ButtonHTMLAttributes } from 'react';
import Link from 'next/link';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary';
  href?: string;
}

export function Button({ variant = 'primary', className = '', children, href, ...props }: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-primary text-on-primary rounded-xl px-8 py-3.5 font-medium bg-gradient-to-br from-primary to-primary-container hover:brightness-110 shadow-[0_0_20px_rgba(143,245,255,0.3)]',
    secondary: 'bg-transparent text-on-surface border border-outline-variant/15 rounded-xl px-8 py-3.5 font-medium hover:bg-primary/10',
    tertiary: 'bg-transparent text-tertiary uppercase text-sm tracking-wider font-semibold hover:text-tertiary-container px-4 py-2'
  };

  const combinedClassName = `${baseStyles} ${variants[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={combinedClassName}>
        {children}
      </Link>
    );
  }

  return (
    <button className={combinedClassName} {...props}>
      {children}
    </button>
  );
}

export const PrimaryButton = (props: ButtonProps) => <Button variant="primary" {...props} />;
export const SecondaryButton = (props: ButtonProps) => <Button variant="secondary" {...props} />;
export const TertiaryButton = (props: ButtonProps) => <Button variant="tertiary" {...props} />;
