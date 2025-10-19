'use client';
import { Button } from '@/components/ui/pixelact-ui/button';

export default function AdsWall() {
  const slots = new Array(7).fill(0);
  return (
    <div className="center-viewport p-6 md:p-10">
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
  );
}


