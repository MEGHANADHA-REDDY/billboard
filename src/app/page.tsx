"use client";
import { Button } from '@/components/ui/pixelact-ui/button';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdOverlay from '@/components/AdOverlay';

export default function Landing() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const router = useRouter();
  const [viewport, setViewport] = useState<{ x: number; y: number; zoom: number }>({ x: 0, y: 0, zoom: 6 });
  const isDraggingRef = useRef<boolean>(false);
  const dragStartRef = useRef<{ startX: number; startY: number; originX: number; originY: number } | null>(null);
  const sizeRef = useRef<{ width: number; height: number }>({ width: 0, height: 0 });
  const lastMouseRef = useRef<{ x: number; y: number } | null>(null);
  const [selectedCell, setSelectedCell] = useState<{ x: number; y: number } | null>(null);
  const [activeAds, setActiveAds] = useState<any[]>([]);
  const [hoveredAd, setHoveredAd] = useState<string | null>(null);
  const miniMapRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const width = window.innerWidth;
      const height = window.innerHeight;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      sizeRef.current = { width, height };

      // Clear for a clean slate
      context.clearRect(0, 0, width, height);

      draw();
    };

    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  // Add non-passive wheel event listener to prevent browser zoom
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleWheel = (e: WheelEvent) => {
      // Prevent browser zoom
      e.preventDefault();
      e.stopPropagation();
      
      // Create a synthetic React event
      const reactEvent = {
        ...e,
        currentTarget: canvas,
        target: canvas,
        nativeEvent: e,
      } as unknown as React.WheelEvent<HTMLCanvasElement>;
      
      onWheel(reactEvent);
    };

    // Add non-passive event listener (third parameter: { passive: false })
    canvas.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => {
      canvas.removeEventListener('wheel', handleWheel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewport]);

  useEffect(() => {
    draw();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewport]);

  // Redraw when selected cell changes so highlight appears immediately
  useEffect(() => {
    draw();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCell, activeAds, hoveredAd]);

  // Draw mini map
  useEffect(() => {
    drawMiniMap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewport, activeAds]);


  // Fetch active ads and preload images
  useEffect(() => {
    const fetchAds = async () => {
      try {
        const response = await fetch('/api/ads/active');
        if (response.ok) {
          const data = await response.json();
          console.log('Fetched ads:', data.ads);
          setActiveAds(data.ads || []);
          
          // Store ads data for rendering
          console.log('Fetched ads:', data.ads);
        }
      } catch (error) {
        console.error('Failed to fetch ads:', error);
      }
    };
    
    fetchAds();
    // Refresh ads every 30 seconds
    const interval = setInterval(fetchAds, 30000);
    return () => clearInterval(interval);
  }, []);

  // Simple grid rendering without complex media handling

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;

    const { width, height } = sizeRef.current.width
      ? sizeRef.current
      : { width: canvas.clientWidth, height: canvas.clientHeight };

    context.clearRect(0, 0, width, height);

    const GRID_SIZE = 5000; // 5000 x 5000 = 25,000,000
    const pixelSize = Math.max(1, Math.floor(viewport.zoom * 2));

    // Determine world cell range visible on screen
    const startWorldX = Math.floor(viewport.x / pixelSize);
    const endWorldX = Math.floor((viewport.x + width) / pixelSize);
    const startWorldY = Math.floor(viewport.y / pixelSize);
    const endWorldY = Math.floor((viewport.y + height) / pixelSize);

    // Draw cells with seamless wrapping by rendering adjacent copies
    context.lineWidth = 1;
    context.strokeStyle = '#333333';

    const offsets = [-GRID_SIZE, 0, GRID_SIZE];
    for (let oy = 0; oy < offsets.length; oy++) {
      const offsetY = offsets[oy];
      for (let ox = 0; ox < offsets.length; ox++) {
        const offsetX = offsets[ox];

        for (let worldY = startWorldY; worldY <= endWorldY; worldY++) {
          // position including copy offset
          const screenY = (worldY + offsetY) * pixelSize - viewport.y;
          if (screenY < -pixelSize || screenY > height + pixelSize) continue;

          for (let worldX = startWorldX; worldX <= endWorldX; worldX++) {
            const screenX = (worldX + offsetX) * pixelSize - viewport.x;
            if (screenX < -pixelSize || screenX > width + pixelSize) continue;

            const wrappedX = ((worldX % GRID_SIZE) + GRID_SIZE) % GRID_SIZE;
            const wrappedY = ((worldY % GRID_SIZE) + GRID_SIZE) % GRID_SIZE;
            const isAlt = (wrappedX + wrappedY) % 2 === 0;
            if (pixelSize >= 6 && isAlt) {
              context.fillStyle = 'rgba(255,255,255,0.03)';
              context.fillRect(screenX, screenY, pixelSize, pixelSize);
            }

            context.strokeRect(screenX + 0.5, screenY + 0.5, pixelSize, pixelSize);
          }
        }
      }
    }

    // Highlight selected cell (with wrap copies) if any
    if (selectedCell) {
      const offsets = [-GRID_SIZE, 0, GRID_SIZE];
      context.lineWidth = 2;
      context.strokeStyle = '#00fff7';
      context.shadowColor = '#00fff7';
      context.shadowBlur = 6;
      for (let oy = 0; oy < offsets.length; oy++) {
        for (let ox = 0; ox < offsets.length; ox++) {
          const screenX = (selectedCell.x + offsets[ox]) * pixelSize - viewport.x;
          const screenY = (selectedCell.y + offsets[oy]) * pixelSize - viewport.y;
          if (screenX < -pixelSize || screenX > width + pixelSize) continue;
          if (screenY < -pixelSize || screenY > height + pixelSize) continue;
          context.strokeRect(screenX + 0.5, screenY + 0.5, pixelSize, pixelSize);
        }
      }
      context.shadowBlur = 0;
    }

    // Grid is now just for background - ads will be rendered as HTML overlays
  };

  const drawMiniMap = () => {
    const miniMapCanvas = miniMapRef.current;
    if (!miniMapCanvas) {
      console.log('Mini map canvas not found');
      return;
    }
    const context = miniMapCanvas.getContext('2d');
    if (!context) {
      console.log('Mini map context not found');
      return;
    }

    const miniMapSize = 200;
    const GRID_SIZE = 5000;
    
    // Set canvas size
    miniMapCanvas.width = miniMapSize;
    miniMapCanvas.height = miniMapSize;
    miniMapCanvas.style.width = `${miniMapSize}px`;
    miniMapCanvas.style.height = `${miniMapSize}px`;

    // Clear canvas
    context.clearRect(0, 0, miniMapSize, miniMapSize);

    // Draw plain background
    context.fillStyle = 'rgba(20, 20, 20, 0.95)';
    context.fillRect(0, 0, miniMapSize, miniMapSize);

    // Draw subtle grid lines for reference
    context.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    context.lineWidth = 0.5;
    
    const gridStep = miniMapSize / 10; // 10x10 grid for reference
    for (let i = 0; i <= 10; i++) {
      const pos = i * gridStep;
      context.beginPath();
      context.moveTo(pos, 0);
      context.lineTo(pos, miniMapSize);
      context.stroke();
      
      context.beginPath();
      context.moveTo(0, pos);
      context.lineTo(miniMapSize, pos);
      context.stroke();
    }

    // Calculate current position as a percentage of the total grid
    const pixelSize = Math.max(1, Math.floor(viewport.zoom * 2));
    const screenWidth = sizeRef.current.width || window.innerWidth;
    const screenHeight = sizeRef.current.height || window.innerHeight;
    
    // Get current viewport center in world coordinates
    const currentCenterX = (viewport.x + screenWidth / 2) / pixelSize;
    const currentCenterY = (viewport.y + screenHeight / 2) / pixelSize;
    
    // Convert to mini map coordinates (0 to miniMapSize)
    const dotX = ((currentCenterX % GRID_SIZE + GRID_SIZE) % GRID_SIZE) / GRID_SIZE * miniMapSize;
    const dotY = ((currentCenterY % GRID_SIZE + GRID_SIZE) % GRID_SIZE) / GRID_SIZE * miniMapSize;

    // Draw current position as a bright dot
    context.fillStyle = '#00fff7';
    context.shadowColor = '#00fff7';
    context.shadowBlur = 8;
    context.beginPath();
    context.arc(dotX, dotY, 4, 0, 2 * Math.PI);
    context.fill();
    
    // Draw a smaller inner dot for better visibility
    context.shadowBlur = 0;
    context.fillStyle = '#ffffff';
    context.beginPath();
    context.arc(dotX, dotY, 2, 0, 2 * Math.PI);
    context.fill();
  };


  const onMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = true;
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      originX: viewport.x,
      originY: viewport.y,
    };
    lastMouseRef.current = { x: e.clientX, y: e.clientY };
    window.addEventListener('mousemove', onMouseMove as any);
    window.addEventListener('mouseup', onMouseUp as any);
  };

  const onMouseMove = (e: MouseEvent) => {
    if (!isDraggingRef.current) return;
    const drag = dragStartRef.current;
    if (!drag) return;
    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;
    setViewport(v => ({ ...v, x: drag.originX - dx, y: drag.originY - dy }));
    lastMouseRef.current = { x: e.clientX, y: e.clientY };
  };

  const onMouseUp = () => {
    const drag = dragStartRef.current;
    const last = lastMouseRef.current;
    isDraggingRef.current = false;
    dragStartRef.current = null;
    window.removeEventListener('mousemove', onMouseMove as any);
    window.removeEventListener('mouseup', onMouseUp as any);
    if (!drag || !last) return;
    const movedX = Math.abs(last.x - drag.startX);
    const movedY = Math.abs(last.y - drag.startY);
    if (movedX < 3 && movedY < 3) {
      // treat as click
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const mouseX = last.x - rect.left;
      const mouseY = last.y - rect.top;
      const pixelSize = Math.max(1, Math.floor(viewport.zoom * 2));
      const GRID_SIZE = 5000;
      const worldX = Math.floor((viewport.x + mouseX) / pixelSize);
      const worldY = Math.floor((viewport.y + mouseY) / pixelSize);
      const wrappedX = ((worldX % GRID_SIZE) + GRID_SIZE) % GRID_SIZE;
      const wrappedY = ((worldY % GRID_SIZE) + GRID_SIZE) % GRID_SIZE;
      setSelectedCell({ x: wrappedX, y: wrappedY });
    }
  };

  const onWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Prevent browser zoom - must be called first
    e.preventDefault();
    e.stopPropagation();
    
    // Also prevent default on the native event
    if (e.nativeEvent) {
      e.nativeEvent.preventDefault();
      e.nativeEvent.stopPropagation();
    }

    const scaleFactor = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.1, Math.min(50, viewport.zoom * scaleFactor));

    // Zoom to mouse position
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const preZoomPixelSize = Math.max(1, Math.floor(viewport.zoom * 2));
    const postZoomPixelSize = Math.max(1, Math.floor(newZoom * 2));

    const worldXBefore = (viewport.x + mouseX) / preZoomPixelSize;
    const worldYBefore = (viewport.y + mouseY) / preZoomPixelSize;

    const newViewportX = worldXBefore * postZoomPixelSize - mouseX;
    const newViewportY = worldYBefore * postZoomPixelSize - mouseY;

    setViewport(v => ({ ...v, zoom: newZoom, x: newViewportX, y: newViewportY }));
  };

  // 10-minute countdown then redirect to ads page
  const [secondsLeft, setSecondsLeft] = useState<number>(600);
  const [now, setNow] = useState<string>('');
  const formatTime = (date: Date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  useEffect(() => {
    setSecondsLeft(600);
    setNow(formatTime(new Date()));
    const id = window.setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          window.clearInterval(id);
          router.push('/ads');
          return 0;
        }
        return s - 1;
      });
      setNow(formatTime(new Date()));
    }, 1000);
    return () => window.clearInterval(id);
  }, [router]);

  const onClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDraggingRef.current) return; // ignore clicks that are part of drag
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const pixelSize = Math.max(1, Math.floor(viewport.zoom * 2));

    const worldX = Math.floor((viewport.x + mouseX) / pixelSize);
    const worldY = Math.floor((viewport.y + mouseY) / pixelSize);
    const GRID_SIZE = 5000;
    const wrappedX = ((worldX % GRID_SIZE) + GRID_SIZE) % GRID_SIZE;
    const wrappedY = ((worldY % GRID_SIZE) + GRID_SIZE) % GRID_SIZE;
    
    // Check if click is on an ad
    for (const ad of activeAds) {
      if (!ad.ctaUrl || ad.positions.length === 0) continue;
      
      // Calculate bounding box of ad
      const minX = Math.min(...ad.positions.map((pos: any) => pos.x));
      const maxX = Math.max(...ad.positions.map((pos: any) => pos.x));
      const minY = Math.min(...ad.positions.map((pos: any) => pos.y));
      const maxY = Math.max(...ad.positions.map((pos: any) => pos.y));
      
      // Check if click is within ad bounds
      if (wrappedX >= minX && wrappedX <= maxX && wrappedY >= minY && wrappedY <= maxY) {
        // Open CTA URL in new tab
        window.open(ad.ctaUrl, '_blank', 'noopener,noreferrer');
        return;
      }
    }
    
    // If not clicking on an ad, select the cell
    setSelectedCell({ x: wrappedX, y: wrappedY });
  };

  const handleAdHover = (adId: string | null) => {
    setHoveredAd(adId);
  };

  const handleAdClick = (ad: any) => {
    if (ad.ctaUrl) {
      window.open(ad.ctaUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const navigateToNearestAd = (direction: 'left' | 'right') => {
    if (activeAds.length === 0) {
      alert('No ads available.');
      return;
    }

    const pixelSize = Math.max(1, Math.floor(viewport.zoom * 2));
    const screenWidth = sizeRef.current.width || window.innerWidth;
    const screenHeight = sizeRef.current.height || window.innerHeight;
    const GRID_SIZE = 5000;
    
    // Calculate current viewport center in world coordinates
    const currentCenterX = (viewport.x + screenWidth / 2) / pixelSize;
    const currentCenterY = (viewport.y + screenHeight / 2) / pixelSize;

    console.log('Current position:', currentCenterX, currentCenterY);
    console.log('Looking for ads in direction:', direction);

    let bestAd = null;
    let bestDistance = Infinity;

    // First pass: find ads in the specified direction
    activeAds.forEach((ad, adIndex) => {
      if (ad.positions.length === 0) return;

      // Calculate ad center
      const minX = Math.min(...ad.positions.map((pos: any) => pos.x));
      const maxX = Math.max(...ad.positions.map((pos: any) => pos.x));
      const minY = Math.min(...ad.positions.map((pos: any) => pos.y));
      const maxY = Math.max(...ad.positions.map((pos: any) => pos.y));
      
      const adCenterX = (minX + maxX) / 2;
      const adCenterY = (minY + maxY) / 2;

      console.log(`Ad ${adIndex}: center at (${adCenterX}, ${adCenterY})`);

      // Check all possible wrapped positions (including wrapping)
      const offsets = [-GRID_SIZE, 0, GRID_SIZE];
      
      for (let offsetY of offsets) {
        for (let offsetX of offsets) {
          const wrappedAdX = adCenterX + offsetX;
          const wrappedAdY = adCenterY + offsetY;
          
          // Calculate distance to this wrapped position
          const dx = wrappedAdX - currentCenterX;
          const dy = wrappedAdY - currentCenterY;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          // Check if this ad is in the right direction
          let isInDirection = false;
          
          if (direction === 'left') {
            // For left, we want ads that are to the left (smaller X)
            isInDirection = wrappedAdX < currentCenterX;
          } else if (direction === 'right') {
            // For right, we want ads that are to the right (larger X)
            isInDirection = wrappedAdX > currentCenterX;
          }
          
          if (isInDirection && distance < bestDistance) {
            bestDistance = distance;
            bestAd = { 
              adCenterX: wrappedAdX, 
              adCenterY: wrappedAdY,
              adIndex,
              distance,
              isInDirection: true
            };
            console.log(`Found ad in direction at (${wrappedAdX}, ${wrappedAdY}), distance: ${distance}`);
          }
        }
      }
    });

    // Second pass: if no ads found in the specified direction, find the nearest ad overall
    if (!bestAd) {
      console.log('No ads found in specified direction, looking for nearest ad overall...');
      bestDistance = Infinity;
      
      activeAds.forEach((ad, adIndex) => {
        if (ad.positions.length === 0) return;

        // Calculate ad center
        const minX = Math.min(...ad.positions.map((pos: any) => pos.x));
        const maxX = Math.max(...ad.positions.map((pos: any) => pos.x));
        const minY = Math.min(...ad.positions.map((pos: any) => pos.y));
        const maxY = Math.max(...ad.positions.map((pos: any) => pos.y));
        
        const adCenterX = (minX + maxX) / 2;
        const adCenterY = (minY + maxY) / 2;

        // Check all possible wrapped positions (including wrapping)
        const offsets = [-GRID_SIZE, 0, GRID_SIZE];
        
        for (let offsetY of offsets) {
          for (let offsetX of offsets) {
            const wrappedAdX = adCenterX + offsetX;
            const wrappedAdY = adCenterY + offsetY;
            
            // Calculate distance to this wrapped position
            const dx = wrappedAdX - currentCenterX;
            const dy = wrappedAdY - currentCenterY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < bestDistance) {
              bestDistance = distance;
              bestAd = { 
                adCenterX: wrappedAdX, 
                adCenterY: wrappedAdY,
                adIndex,
                distance,
                isInDirection: false
              };
              console.log(`Found nearest ad at (${wrappedAdX}, ${wrappedAdY}), distance: ${distance}`);
            }
          }
        }
      });
    }

    if (bestAd) {
      console.log('Navigating to ad:', bestAd);
      // Move viewport to center on the target ad
      const newViewportX = bestAd.adCenterX * pixelSize - screenWidth / 2;
      const newViewportY = bestAd.adCenterY * pixelSize - screenHeight / 2;
      
      setViewport(prev => ({
        ...prev,
        x: newViewportX,
        y: newViewportY
      }));
    } else {
      console.log('No suitable ad found');
      alert('No ads found in that direction. Try refreshing the page.');
    }
  };

  const handleMiniMapClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const miniMapCanvas = miniMapRef.current;
    if (!miniMapCanvas) return;
    
    const rect = miniMapCanvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    
    const miniMapSize = 200;
    const GRID_SIZE = 5000;
    const pixelSize = Math.max(1, Math.floor(viewport.zoom * 2));
    const screenWidth = sizeRef.current.width || window.innerWidth;
    const screenHeight = sizeRef.current.height || window.innerHeight;
    
    // Convert mini map click to world coordinates
    const worldX = (clickX / miniMapSize) * GRID_SIZE;
    const worldY = (clickY / miniMapSize) * GRID_SIZE;
    
    // Center viewport on clicked position
    const newViewportX = worldX * pixelSize - screenWidth / 2;
    const newViewportY = worldY * pixelSize - screenHeight / 2;
    
    setViewport(prev => ({
      ...prev,
      x: newViewportX,
      y: newViewportY
    }));
  };

  return (
    <div 
      className="relative w-full h-screen bg-black overflow-hidden"
      style={{ 
        touchAction: 'none',
        overscrollBehavior: 'none',
      }}
      onWheel={(e) => {
        // Prevent browser zoom on the container
        if (e.target === e.currentTarget) {
          e.preventDefault();
        }
      }}
    >
      {/* Top-centered header */}
      <div className="absolute inset-x-0 top-4 z-40 pointer-events-none">
        <div className="mx-auto w-full max-w-4xl flex flex-col items-center gap-3 text-center pointer-events-auto">
          <h1 className="neon-heading text-2xl md:text-3xl">THE QUARTER BILLBOARD</h1>
          <div className="flex items-center justify-center gap-3">
            <a href="/auth?role=advertiser&mode=login"><Button variant="green">Login</Button></a>
            <a href="/auth?role=advertiser&mode=register"><Button variant="blue">Register</Button></a>
          </div>
        </div>
      </div>
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 block ${hoveredAd ? 'cursor-pointer' : 'cursor-move'}`}
        aria-hidden="true"
        onMouseDown={onMouseDown}
        onClick={onClick}
        style={{ 
          touchAction: 'none',
          overscrollBehavior: 'none',
        }}
      />
      {/* Clock (top-left) */}
      <div className="absolute top-4 left-4 z-40 pointer-events-none text-left">
        <div className="bg-gray-900/70 border border-gray-700 rounded px-3 py-2 text-xs inline-block">
          <span className="text-gray-300" suppressHydrationWarning>{now}</span>
        </div>
      </div>
      {/* Countdown (top-right) */}
      <div className="absolute top-4 right-4 z-40 pointer-events-none text-right">
        <div className="bg-gray-900/70 border border-gray-700 rounded px-3 py-2 text-xs inline-block">
          <span className="text-gray-300">Next rotation in </span>
          <span className="neon-heading text-sm align-middle">
            {Math.floor(secondsLeft / 60)}:{(secondsLeft % 60).toString().padStart(2, '0')}
          </span>
        </div>
      </div>

      {/* Mini Map */}
      <div className="absolute bottom-4 right-4 z-50 pointer-events-none">
        <div className="bg-black/90 border-2 border-gray-500 rounded-lg p-3 pointer-events-auto shadow-2xl">
          <div className="text-sm text-white mb-2 text-center font-semibold">Position Map</div>
          <canvas
            ref={miniMapRef}
            onClick={handleMiniMapClick}
            className="cursor-pointer border-2 border-gray-400 rounded bg-gray-900"
            style={{ width: '200px', height: '200px' }}
            title="Click to navigate to any position on the grid"
          />
        </div>
      </div>

      {/* Ad Overlays */}
      <div className="absolute inset-0 pointer-events-none z-30">
        {activeAds.length > 0 && (
          <div className="absolute top-20 left-4 bg-black bg-opacity-50 text-white p-2 text-xs">
            {activeAds.length} ads loaded
          </div>
        )}
        {activeAds.map((ad) => (
          <AdOverlay
            key={ad.id}
            ad={ad}
            viewport={viewport}
            pixelSize={Math.max(1, Math.floor(viewport.zoom * 2))}
            width={sizeRef.current.width || window.innerWidth}
            height={sizeRef.current.height || window.innerHeight}
            hoveredAd={hoveredAd}
            onHover={handleAdHover}
            onClick={handleAdClick}
          />
        ))}
      </div>

      {/* Ad Tooltip - Positioned relative to viewport */}
      {hoveredAd && (() => {
        const ad = activeAds.find(a => a.id === hoveredAd);
        if (!ad || (!ad.about && !ad.title)) return null;
        
        return (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none">
            <div className="bg-black bg-opacity-95 text-white text-sm px-6 py-4 rounded-lg shadow-xl border border-gray-600 min-w-[250px] max-w-[400px]">
              <div className="font-semibold mb-2 text-center text-base">About this ad:</div>
              <div className="text-gray-200 text-center leading-relaxed">{ad.about || ad.title}</div>
            </div>
          </div>
        );
      })()}

      {/* Navigation Buttons */}
      <div className="absolute inset-0 pointer-events-none z-30">
        {/* Left Button */}
        <button
          onClick={() => navigateToNearestAd('left')}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-auto bg-gray-900/80 hover:bg-gray-800/90 border border-gray-600 rounded-full w-12 h-12 flex items-center justify-center text-white transition-colors"
          title="Go to nearest ad on the left"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Right Button */}
        <button
          onClick={() => navigateToNearestAd('right')}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-auto bg-gray-900/80 hover:bg-gray-800/90 border border-gray-600 rounded-full w-12 h-12 flex items-center justify-center text-white transition-colors"
          title="Go to nearest ad on the right"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

    </div>
  );
}
