"use client";
import { useEffect, useRef, useState } from 'react';

interface AdOverlayProps {
  ad: any;
  viewport: { x: number; y: number; zoom: number };
  pixelSize: number;
  width: number;
  height: number;
  hoveredAd: string | null;
  onHover: (adId: string | null) => void;
  onClick: (ad: any) => void;
}

export default function AdOverlay({ 
  ad, 
  viewport, 
  pixelSize, 
  width, 
  height, 
  hoveredAd, 
  onHover, 
  onClick 
}: AdOverlayProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!overlayRef.current) return;

    // Calculate bounding box of all positions
    const minX = Math.min(...ad.positions.map((pos: any) => pos.x));
    const maxX = Math.max(...ad.positions.map((pos: any) => pos.x));
    const minY = Math.min(...ad.positions.map((pos: any) => pos.y));
    const maxY = Math.max(...ad.positions.map((pos: any) => pos.y));
    
    const adWidth = (maxX - minX + 1) * pixelSize;
    const adHeight = (maxY - minY + 1) * pixelSize;
    
    // Calculate screen position
    const screenX = minX * pixelSize - viewport.x;
    const screenY = minY * pixelSize - viewport.y;
    
    // More lenient visibility check for debugging
    const visible = screenX + adWidth >= -200 && screenX <= width + 200 && 
                   screenY + adHeight >= -200 && screenY <= height + 200;
    
    console.log(`Ad ${ad.id}: positions=${ad.positions?.length}, screenX=${screenX}, screenY=${screenY}, visible=${visible}`);
    console.log(`Ad ${ad.id}: minX=${minX}, maxX=${maxX}, minY=${minY}, maxY=${maxY}, adWidth=${adWidth}, adHeight=${adHeight}`);
    console.log(`Ad ${ad.id}: viewport.x=${viewport.x}, viewport.y=${viewport.y}, pixelSize=${pixelSize}`);
    
    setIsVisible(visible);
    
    // Always position the overlay for debugging
    overlayRef.current.style.left = `${screenX}px`;
    overlayRef.current.style.top = `${screenY}px`;
    overlayRef.current.style.width = `${adWidth}px`;
    overlayRef.current.style.height = `${adHeight}px`;
  }, [ad, viewport, pixelSize, width, height]);

  // Temporarily show all ads for debugging
  if (!isVisible) {
    console.log(`Ad ${ad.id} not visible, but rendering anyway for debugging`);
  }

  const handleMouseEnter = () => onHover(ad.id);
  const handleMouseLeave = () => onHover(null);
  const handleClick = () => onClick(ad);

  return (
    <div
      ref={overlayRef}
      className={`absolute pointer-events-auto cursor-pointer transition-all duration-200 ${
        hoveredAd === ad.id ? 'ring-2 ring-white ring-opacity-50' : 'ring-2 ring-cyan-400'
      }`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      style={{
        backgroundColor: hoveredAd === ad.id ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
        zIndex: 10,
      }}
    >
      {/* Media Content */}
      <div className="w-full h-full overflow-hidden">
        {ad.mediaType === 'video' ? (
          <video
            src={ad.mediaUrl}
            className="w-full h-full object-cover"
            autoPlay
            loop
            muted
            playsInline
          />
        ) : (
          <img
            src={ad.mediaUrl}
            alt={ad.about || 'Ad'}
            className="w-full h-full object-cover"
          />
        )}
      </div>
      
       {/* Remove the tooltip from here - it will be handled by the main page */}
       
    </div>
  );
}
