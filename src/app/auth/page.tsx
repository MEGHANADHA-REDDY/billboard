'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/pixelact-ui/button';
import { Input } from '@/components/ui/pixelact-ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/pixelact-ui/card';

type Role = 'advertiser';
type Mode = 'login' | 'register';

export default function AuthPage() {
  const [role, setRole] = useState<Role>('advertiser');
  const [mode, setMode] = useState<Mode>('login');
  const searchParams = useSearchParams();

  useEffect(() => {
    const r = searchParams.get('role');
    const m = searchParams.get('mode');
    if (r === 'advertiser') setRole(r as Role);
    if (m === 'login' || m === 'register') setMode(m);
  }, [searchParams]);

  // shared fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const title = `Advertiser ${mode === 'login' ? 'Login' : 'Sign Up'}`;
  const subtitle = mode === 'login' ? 'Access your dashboard' : 'Join and manage your ad slots';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (mode === 'register' && !name) {
      setError('Please enter your name.');
      return;
    }
    if (!email || !password) {
      setError('Please fill in all required fields.');
      return;
    }
    if (mode === 'register' && password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      
      if (mode === 'register') {
        const res = await fetch('/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password })
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || 'Registration failed');
        }
      }
      
      // Login after registration or direct login
      const loginRes = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      if (!loginRes.ok) {
        const data = await loginRes.json().catch(() => ({}));
        throw new Error(data.error || 'Login failed');
      }
      
      // Store user data in localStorage for now (simple auth)
      const user = await loginRes.json();
      localStorage.setItem('user', JSON.stringify(user));
      
      // Redirect to dashboard
      window.location.href = '/advertiser/dashboard';
      
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-start justify-center p-6 md:p-8 pt-28 md:pt-40 overflow-y-auto">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          {/* Role + Mode toggles */}
          <div className="flex flex-col items-center justify-center gap-3">
          
          <div className="w-full flex flex-wrap items-center justify-center gap-2 bg-gray-800/70 p-1 rounded">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`px-2 py-1 text-[10px] md:text-xs rounded ${mode === 'login' ? 'bg-gray-700 text-white' : 'text-gray-300 hover:text-white'}`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setMode('register')}
              className={`px-2 py-1 text-[10px] md:text-xs rounded ${mode === 'register' ? 'bg-gray-700 text-white' : 'text-gray-300 hover:text-white'}`}
            >
              Register
            </button>
          </div>
          </div>
          <div className="mt-4 text-center">
            <CardTitle>{title}</CardTitle>
            <CardDescription>{subtitle}</CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          {error && (
            <div className="mb-4 text-red-400 text-sm" role="alert">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
          {mode === 'register' && (
            <div>
              <label className="block text-gray-300 text-xs mb-2" htmlFor="name">Name</label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your Name"
                autoComplete="name"
              />
            </div>
          )}
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
              autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
            />
          </div>
          {mode === 'register' && (
            <div>
              <label className="block text-gray-300 text-xs mb-2" htmlFor="confirm">Confirm Password</label>
              <Input
                id="confirm"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </div>
          )}
            <Button type="submit" variant={mode === 'login' ? 'green' : 'blue'} disabled={loading} className="w-full">
              {loading ? (mode === 'login' ? 'Signing in…' : 'Creating…') : (mode === 'login' ? 'Login' : 'Create Account')}
            </Button>
          </form>
        </CardContent>

        <CardFooter>
          <div className="flex items-center justify-between text-xs text-gray-400 gap-6 w-full">
            <Link href="/" className="hover:text-gray-200">Back to home</Link>
            {mode === 'login' ? (
              <button className="hover:text-gray-200" onClick={() => setMode('register')}>Create account</button>
            ) : (
              <button className="hover:text-gray-200" onClick={() => setMode('login')}>Have an account? Login</button>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}


