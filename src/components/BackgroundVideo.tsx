'use client';

import { usePathname } from 'next/navigation';
import React, { useState } from 'react';
import Image from 'next/image';

export default function BackgroundVideo() {
  const pathname = usePathname();
  // Do not show on the grid (home) page
  if (pathname === '/') return null;
  const isAdsPage = pathname.startsWith('/ads');

  const [hidden, setHidden] = useState(false);
  return (
    <>
      <div className={`fixed inset-0 -z-10 ${hidden ? 'hidden' : ''}`}>
        <Image
          src="/login.png"
          alt="Background"
          fill
          priority
          onError={() => setHidden(true)}
          style={{ objectFit: 'cover' }}
        />
      </div>
      {/* Heading overlay (hidden on ads page) */}
      {!isAdsPage && (
        <div className="fixed inset-x-0 top-6 sm:top-8 md:top-12 lg:top-20 xl:top-24 z-0 flex justify-center pointer-events-none w-full px-4">
          <h1 className="press-start text-white text-base sm:text-lg md:text-2xl lg:text-3xl xl:text-4xl text-center">thequarterbillboard</h1>
        </div>
      )}
    </>
  );
}


