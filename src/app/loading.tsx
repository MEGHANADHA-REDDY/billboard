'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

export default function GlobalLoading() {
  const images = ['/shirt.png', '/house.png', '/food.png'];
  const [index, setIndex] = useState<number>(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % images.length);
    }, 700);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="center-viewport">
      <div className="relative" style={{ width: 160, height: 160 }}>
        <Image src={images[index]} alt="Loading" fill priority style={{ objectFit: 'contain' }} />
      </div>
    </div>
  );
}


