'use client';

import { useRef, useEffect, useState } from 'react';

interface GridSelectorProps {
  selectedCells: Array<{ x: number; y: number }>;
  onCellSelect: (position: { x: number; y: number } | null) => void;
  maxCells?: number;
  activeAds?: Array<{ id: string; positions: Array<{ x: number; y: number }>; mediaType: string; title?: string }>;
  pixelCount?: number;
}

export default function GridSelector({ selectedCells, onCellSelect, maxCells = Infinity, activeAds = [], pixelCount = 1 }: GridSelectorProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [viewport, setViewport] = useState({ x: 0, y: 0, zoom: 6 });
  const sizeRef = useRef({ width: 0, height: 0 });
  const isDraggingRef = useRef<boolean>(false);
  const dragStartRef = useRef<{ startX: number; startY: number; originX: number; originY: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const width = 600; // Larger width for dashboard
      const height = 400; // Larger height for dashboard
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      sizeRef.current = { width, height };
      draw();
    };

    resize();
  }, []);

  useEffect(() => {
    draw();
  }, [viewport, selectedCells, activeAds]);

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;

    const { width, height } = sizeRef.current;
    context.clearRect(0, 0, width, height);

    const GRID_SIZE = 5000; // Same as main grid
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

    // Draw existing ads (occupied cells)
    activeAds.forEach(ad => {
      ad.positions.forEach(pos => {
        const offsets = [-GRID_SIZE, 0, GRID_SIZE];
        for (let oy = 0; oy < offsets.length; oy++) {
          for (let ox = 0; ox < offsets.length; ox++) {
            const screenX = (pos.x + offsets[ox]) * pixelSize - viewport.x;
            const screenY = (pos.y + offsets[oy]) * pixelSize - viewport.y;
            
            if (screenX >= -pixelSize && screenX <= width + pixelSize && 
                screenY >= -pixelSize && screenY <= height + pixelSize) {
              // Fill with red to indicate occupied
              context.fillStyle = 'rgba(255, 0, 0, 0.4)';
              context.fillRect(screenX, screenY, pixelSize, pixelSize);
              context.lineWidth = 2;
              context.strokeStyle = '#ff0000';
              context.strokeRect(screenX + 0.5, screenY + 0.5, pixelSize, pixelSize);
              context.lineWidth = 1;
              context.strokeStyle = '#333333';
            }
          }
        }
      });
    });

    // Highlight selected cells
    selectedCells.forEach(cell => {
      const offsets = [-GRID_SIZE, 0, GRID_SIZE];
      for (let oy = 0; oy < offsets.length; oy++) {
        for (let ox = 0; ox < offsets.length; ox++) {
          const screenX = (cell.x + offsets[ox]) * pixelSize - viewport.x;
          const screenY = (cell.y + offsets[oy]) * pixelSize - viewport.y;
          
          if (screenX >= -pixelSize && screenX <= width + pixelSize && 
              screenY >= -pixelSize && screenY <= height + pixelSize) {
            context.fillStyle = 'rgba(0, 255, 247, 0.3)';
            context.fillRect(screenX, screenY, pixelSize, pixelSize);
            context.lineWidth = 2;
            context.strokeStyle = '#00fff7';
            context.strokeRect(screenX + 0.5, screenY + 0.5, pixelSize, pixelSize);
            context.lineWidth = 1;
            context.strokeStyle = '#333333';
          }
        }
      }
    });
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = true;
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      originX: viewport.x,
      originY: viewport.y,
    };
    window.addEventListener('mousemove', onMouseMove as any);
    window.addEventListener('mouseup', onMouseUp as any);
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // Only handle click if we're not dragging
    if (isDraggingRef.current) return;
    
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

    // Check if any of the cells that would be selected are occupied
    const sqrt = Math.sqrt(pixelCount);
    const width = Math.ceil(sqrt);
    const height = Math.ceil(pixelCount / width);
    
    let hasOccupiedCell = false;
    for (let i = 0; i < pixelCount; i++) {
      const row = Math.floor(i / width);
      const col = i % width;
      const checkX = wrappedX + col;
      const checkY = wrappedY + row;
      
      const isOccupied = activeAds.some(ad => 
        ad.positions.some(pos => pos.x === checkX && pos.y === checkY)
      );
      
      if (isOccupied) {
        hasOccupiedCell = true;
        break;
      }
    }

    if (hasOccupiedCell) {
      alert('Some of the selected cells are already occupied by other ads. Please choose a different location.');
      return;
    }

    // Set the click position - the parent component will handle generating the cells
    onCellSelect({ x: wrappedX, y: wrappedY });
  };

  const onMouseMove = (e: MouseEvent) => {
    if (!isDraggingRef.current) return;
    const drag = dragStartRef.current;
    if (!drag) return;
    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;
    setViewport(v => ({ ...v, x: drag.originX - dx, y: drag.originY - dy }));
  };

  const onMouseUp = (e: MouseEvent) => {
    const drag = dragStartRef.current;
    const wasDragging = isDraggingRef.current;
    isDraggingRef.current = false;
    dragStartRef.current = null;
    window.removeEventListener('mousemove', onMouseMove as any);
    window.removeEventListener('mouseup', onMouseUp as any);
    
    if (!drag) return;
    const movedX = Math.abs(e.clientX - drag.startX);
    const movedY = Math.abs(e.clientY - drag.startY);
    
    // Only treat as click if movement was minimal and we weren't dragging
    if (movedX < 3 && movedY < 3 && !wasDragging) {
      // Create a synthetic click event
      const syntheticEvent = {
        clientX: e.clientX,
        clientY: e.clientY,
      } as React.MouseEvent<HTMLCanvasElement>;
      handleCanvasClick(syntheticEvent);
    }
  };


  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const canvas = canvasRef.current;
    if (!canvas) return;

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

  return (
    <div className="space-y-4" onWheel={(e) => e.preventDefault()}>
      <div className="flex justify-between items-center">
        <h3 className="text-gray-300 text-sm">Select Grid Cells</h3>
        <span className="text-gray-500 text-xs">
          {selectedCells.length} pixels selected
        </span>
      </div>
      
      <div className="border border-gray-700 rounded-lg overflow-hidden bg-black relative" style={{ overscrollBehavior: 'none' }}>
        <canvas
          ref={canvasRef}
          className={`block ${isDraggingRef.current ? 'cursor-grabbing' : 'cursor-grab'}`}
          onMouseDown={handleMouseDown}
          onClick={handleCanvasClick}
          onWheel={handleWheel}
          style={{ 
            width: '600px', 
            height: '400px', 
            touchAction: 'none',
            overscrollBehavior: 'none'
          }}
        />
        
        {/* Zoom Controls */}
        <div className="absolute bottom-2 right-2 flex flex-col gap-1">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const scaleFactor = 1.2;
              const newZoom = Math.max(0.1, Math.min(50, viewport.zoom * scaleFactor));
              setViewport(v => ({ ...v, zoom: newZoom }));
            }}
            className="w-8 h-8 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded flex items-center justify-center text-white text-lg font-bold transition-colors"
            title="Zoom In"
          >
            +
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const scaleFactor = 0.8;
              const newZoom = Math.max(0.1, Math.min(50, viewport.zoom * scaleFactor));
              setViewport(v => ({ ...v, zoom: newZoom }));
            }}
            className="w-8 h-8 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded flex items-center justify-center text-white text-lg font-bold transition-colors"
            title="Zoom Out"
          >
            −
          </button>
        </div>
      </div>
      
      <div className="text-xs text-gray-500">
        <p>• Click cells to select/deselect</p>
        <p>• Drag to pan around the grid</p>
        <p>• Scroll to zoom in/out or use +/− buttons</p>
        <p>• Red cells are occupied by existing ads</p>
        <p>• Selected cells: {selectedCells.map(cell => `(${cell.x},${cell.y})`).join(', ') || 'None'}</p>
      </div>
    </div>
  );
}
