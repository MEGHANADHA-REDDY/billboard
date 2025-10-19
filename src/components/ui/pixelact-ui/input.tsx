'use client';

import React from 'react';

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export function Input({ className = '', ...props }: InputProps) {
  const base = 'press-start w-full rounded bg-gray-900/40 text-gray-100 placeholder-gray-500 px-4 py-3 outline-none border border-gray-700/60 focus:border-cyan-400';
  return <input className={`${base} ${className}`} {...props} />;
}

export default Input;


