import React, { useState, useRef, useCallback, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

const ImageLightbox = ({ images, startIndex = 0, onClose }) => {
  const [index, setIndex] = useState(startIndex);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const lastOffset = useRef({ x: 0, y: 0 });

  // Reset zoom/pan when image changes
  useEffect(() => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  }, [index]);

  // Close on ESC key
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const prev = () => {
    setIndex(i => (i - 1 + images.length) % images.length);
  };
  const next = () => {
    setIndex(i => (i + 1) % images.length);
  };

  // Mouse wheel zoom
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.15 : 0.15;
    setScale(s => Math.min(5, Math.max(0.5, s + delta)));
  }, []);

  // Drag to pan
  const handleMouseDown = (e) => {
    if (scale <= 1) return;
    setIsDragging(true);
    dragStart.current = { x: e.clientX - lastOffset.current.x, y: e.clientY - lastOffset.current.y };
  };
  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const newX = e.clientX - dragStart.current.x;
    const newY = e.clientY - dragStart.current.y;
    lastOffset.current = { x: newX, y: newY };
    setOffset({ x: newX, y: newY });
  };
  const handleMouseUp = () => setIsDragging(false);

  const resetZoom = () => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
    lastOffset.current = { x: 0, y: 0 };
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.93)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backdropFilter: 'blur(10px)',
        userSelect: 'none',
      }}
    >
      {/* Top bar */}
      <div
        onClick={e => e.stopPropagation()}
        style={{ position: 'absolute', top: '1rem', left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: '0.5rem', zIndex: 10 }}
      >
        {/* Counter */}
        <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.82rem', background: 'rgba(0,0,0,0.45)', padding: '4px 14px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)' }}>
          {index + 1} / {images.length}
        </div>

        {/* Zoom controls */}
        <div style={{ display: 'flex', gap: '4px', background: 'rgba(0,0,0,0.45)', borderRadius: '20px', padding: '4px 8px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <button
            onClick={() => setScale(s => Math.max(0.5, s - 0.25))}
            style={btnStyle}
            title="Zoom Out"
          ><ZoomOut size={16} /></button>

          <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', minWidth: '38px', textAlign: 'center', lineHeight: '28px' }}>
            {Math.round(scale * 100)}%
          </span>

          <button
            onClick={() => setScale(s => Math.min(5, s + 0.25))}
            style={btnStyle}
            title="Zoom In"
          ><ZoomIn size={16} /></button>

          <button
            onClick={resetZoom}
            style={btnStyle}
            title="Reset"
          ><RotateCcw size={16} /></button>
        </div>
      </div>

      {/* Close */}
      <button
        onClick={onClose}
        style={{ ...btnStyle, position: 'absolute', top: '1rem', right: '1rem', padding: '8px', borderRadius: '10px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}
        title="Close (ESC)"
      ><X size={20} /></button>

      {/* Prev */}
      {images.length > 1 && (
        <button
          onClick={e => { e.stopPropagation(); prev(); }}
          style={{ ...navBtnStyle, left: '1.25rem' }}
        ><ChevronLeft size={28} /></button>
      )}

      {/* Image container */}
      <div
        onClick={e => e.stopPropagation()}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{
          overflow: 'hidden',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          maxWidth: '90vw', maxHeight: '85vh',
          cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
        }}
      >
        <img
          src={images[index]}
          alt={`Photo ${index + 1}`}
          draggable={false}
          style={{
            maxWidth: '88vw',
            maxHeight: '82vh',
            objectFit: 'contain',
            borderRadius: '14px',
            boxShadow: '0 24px 64px rgba(0,0,0,0.7)',
            transform: `scale(${scale}) translate(${offset.x / scale}px, ${offset.y / scale}px)`,
            transition: isDragging ? 'none' : 'transform 0.15s ease',
            pointerEvents: 'none',
          }}
        />
      </div>

      {/* Scroll hint */}
      <div style={{ position: 'absolute', bottom: '1rem', left: '50%', transform: 'translateX(-50%)', color: 'rgba(255,255,255,0.35)', fontSize: '0.72rem', textAlign: 'center' }}>
        Scroll to zoom • Drag to pan • ESC to close
      </div>

      {/* Next */}
      {images.length > 1 && (
        <button
          onClick={e => { e.stopPropagation(); next(); }}
          style={{ ...navBtnStyle, right: '1.25rem' }}
        ><ChevronRight size={28} /></button>
      )}
    </div>
  );
};

const btnStyle = {
  background: 'transparent',
  border: 'none',
  color: 'white',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '4px',
  borderRadius: '6px',
  opacity: 0.8,
  transition: 'opacity 0.2s',
};

const navBtnStyle = {
  position: 'absolute',
  background: 'rgba(255,255,255,0.1)',
  border: '1px solid rgba(255,255,255,0.15)',
  color: 'white',
  borderRadius: '50%',
  width: '50px', height: '50px',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer',
  transition: 'background 0.2s',
  zIndex: 10,
};

export default ImageLightbox;
