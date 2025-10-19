'use client';

import React from 'react';

type DivProps = React.HTMLAttributes<HTMLDivElement>;

export function Card({ className = '', ...props }: DivProps) {
  const base = 'bg-black/20 backdrop-blur-md border border-transparent rounded-lg shadow-lg';
  return <div className={`${base} ${className}`} {...props} />;
}

export function CardHeader({ className = '', ...props }: DivProps) {
  return <div className={`p-4 md:p-5 ${className}`} {...props} />;
}

export function CardTitle({ className = '', ...props }: DivProps) {
  return <h3 className={`neon-heading text-xl md:text-2xl ${className}`} {...props} />;
}

export function CardDescription({ className = '', ...props }: DivProps) {
  return <p className={`text-gray-300 text-xs md:text-sm mt-1 ${className}`} {...props} />;
}

export function CardContent({ className = '', ...props }: DivProps) {
  return <div className={`px-4 md:px-5 pb-4 md:pb-5 ${className}`} {...props} />;
}

export function CardFooter({ className = '', ...props }: DivProps) {
  return <div className={`px-4 md:px-5 pb-4 md:pb-5 ${className}`} {...props} />;
}

export default Card;


