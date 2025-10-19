'use client';

import { useState } from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/pixelact-ui/button';
import { Input } from '@/components/ui/pixelact-ui/input';

export default function AdvertiserLoginPage() {
  // Redirect to unified auth with preselected role/mode
  if (typeof window !== 'undefined') {
    redirect('/auth?role=advertiser&mode=login');
  }
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please enter email and password.');
      return;
    }

    try {
      setLoading(true);
      // Placeholder auth simulation
      await new Promise((r) => setTimeout(r, 700));
      // TODO: integrate real auth
      alert('Logged in (demo).');
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="center-viewport p-6 md:p-8">
      <div className="w-full max-w-md bg-gray-900/70 border border-gray-700 rounded-lg p-8 md:p-10 shadow-xl mx-auto flex flex-col">
        <div className="mb-8 text-center">
          <h1 className="neon-heading text-2xl">Advertiser Login</h1>
          <p className="text-gray-400 text-xs mt-3">Access your dashboard</p>
        </div>

        {error && (
          <div className="mb-4 text-red-400 text-sm" role="alert">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-300 text-xs mb-2" htmlFor="email">Email</label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>
          <div>
            <label className="block text-gray-300 text-xs mb-2" htmlFor="password">Password</label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>
          <Button type="submit" variant="green" disabled={loading} className="w-full">
            {loading ? 'Signing in…' : 'Login'}
          </Button>
        </form>

        <div className="mt-8 flex items-center justify-between text-xs text-gray-400 gap-6">
          <Link href="/" className="hover:text-gray-200">Back to home</Link>
          <Link href="/advertiser/register" className="hover:text-gray-200">Create account</Link>
        </div>
      </div>
    </div>
  );
}


