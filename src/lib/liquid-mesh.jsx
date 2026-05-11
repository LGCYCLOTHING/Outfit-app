import React from 'react';

export default function LiquidMesh({ seed = 0, intensity = 1 }) {
  const phase = (seed % 9) * -1.6;

  const themeId = (typeof window !== 'undefined' && window.__archiveTheme) || 'dusk';
  let bgImage = '';
  if (typeof document !== 'undefined') {
    const el = document.getElementById(`archive-bg-${themeId}`)
            || document.getElementById('archive-bg-dusk');
    if (el) bgImage = el.currentSrc || el.src || '';
  }

  const keyframes = `
    @keyframes archive-mesh-drift {
      0%   { transform: scale(1.05) translate(0%, 0%); }
      50%  { transform: scale(1.10) translate(-2%, -1.5%); }
      100% { transform: scale(1.05) translate(0%, 0%); }
    }
  `;

  return (
    <div data-liquid-mesh="true" style={{
      position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none',
      background: '#000',
    }}>
      <style>{keyframes}</style>

      <div style={{
        position: 'absolute', inset: '-5%',
        backgroundImage: `url("${bgImage}")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        animation: `archive-mesh-drift 24s ease-in-out infinite`,
        animationDelay: `${phase}s`,
        willChange: 'transform',
        opacity: 0.95 * intensity,
      }} />

      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, rgba(0,0,0,0) 35%, rgba(0,0,0,0.55) 100%)',
      }} />

      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.6 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")`,
        backgroundSize: '220px 220px',
        opacity: 0.04,
        mixBlendMode: 'screen',
        pointerEvents: 'none',
      }} />
    </div>
  );
}
