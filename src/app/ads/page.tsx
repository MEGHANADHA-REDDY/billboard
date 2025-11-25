'use client';
import { Button } from '@/components/ui/pixelact-ui/button';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdsWall() {
  const router = useRouter();
  const slots = new Array(7).fill(0);
  
  // 25-minute countdown then redirect to main grid page
  const [secondsLeft, setSecondsLeft] = useState<number>(1500);
  const [now, setNow] = useState<string>('');
  const formatTime = (date: Date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  
  useEffect(() => {
    setSecondsLeft(1500);
    setNow(formatTime(new Date()));
    const id = window.setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          window.clearInterval(id);
          router.push('/');
          return 0;
        }
        return s - 1;
      });
      setNow(formatTime(new Date()));
    }, 1000);
    return () => window.clearInterval(id);
  }, [router]);

  return (
    <div className="min-h-screen relative p-6 md:p-10">
      {/* Clock (top-left) */}
      <div className="absolute top-4 left-4 z-40 pointer-events-none text-left">
        <div className="bg-gray-900/70 border border-gray-700 rounded px-3 py-2 text-xs inline-block">
          <span className="text-gray-300" suppressHydrationWarning>{now}</span>
        </div>
      </div>
      
      {/* Countdown (top-right) */}
      <div className="absolute top-4 right-4 z-40 pointer-events-none text-right">
        <div className="bg-gray-900/70 border border-gray-700 rounded px-3 py-2 text-xs inline-block">
          <span className="text-gray-300">Refresh </span>
          <span className="neon-heading text-sm align-middle">
            {Math.floor(secondsLeft / 60)}:{(secondsLeft % 60).toString().padStart(2, '0')}
          </span>
        </div>
      </div>
      
      <div className="center-viewport">
        <div className="w-full max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="neon-heading text-xl md:text-2xl">Sponsored Ads</h1>
            <div className="flex items-center gap-3">
              <a href="/auth?role=advertiser&mode=login"><Button variant="green" className="text-xs md:text-sm">Login</Button></a>
              <a href="/auth?role=advertiser&mode=register"><Button variant="blue" className="text-xs md:text-sm">Register</Button></a>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {slots.map((_, i) => (
              <div key={i} className="bg-gray-900/70 border border-gray-700 rounded-lg aspect-video flex items-center justify-center text-gray-400">
                Ad Slot {i + 1}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}


