'use client';

import React from 'react';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'green' | 'blue' | 'pixel-green';
};

export function Button({ variant = 'default', className = '', children, ...props }: ButtonProps) {
  const base = 'press-start inline-flex items-center justify-center rounded px-3 py-2 text-xs transition-colors disabled:opacity-60 disabled:cursor-not-allowed';
  const palette =
    variant === 'green'
      ? 'bg-green-500 text-black hover:brightness-110'
      : variant === 'blue'
      ? 'bg-blue-500 text-black hover:brightness-110'
      : variant === 'pixel-green'
      ? 'bg-[#00ff85] text-black shadow-[0_0_0_2px_#0a0a0a,0_0_0_4px_#00ff85] hover:brightness-110'
      : 'bg-gray-200 text-black hover:brightness-110';
  return (
    <button className={`${base} ${palette} ${className}`} {...props}>
      {children}
    </button>
  );
}

export default Button;


