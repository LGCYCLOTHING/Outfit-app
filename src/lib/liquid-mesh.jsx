import React from 'react';

// Per-theme gradient configs — exact spec.
// secondary (bottom-left, baked at 0.2 opacity via rgba), main (top-right), base color.
const THEME_BG = {
  slate: {
    secondary: 'radial-gradient(ellipse 40% 35% at 10% 90%, rgba(0,77,58,0.2) 0%, transparent 60%)',
    main:      'radial-gradient(ellipse 65% 55% at 85% 10%, #00BFA5 0%, #004D3A 30%, #060E08 70%)',
    base:      '#060E08',
  },
  ivory: {
    secondary: 'radial-gradient(ellipse 40% 35% at 10% 90%, rgba(61,32,16,0.2) 0%, transparent 60%)',
    main:      'radial-gradient(ellipse 65% 55% at 85% 10%, #C8956C 0%, #3D2010 30%, #0C0A06 70%)',
    base:      '#0C0A06',
  },
  forest: {
    secondary: 'radial-gradient(ellipse 40% 35% at 10% 90%, rgba(15,42,24,0.2) 0%, transparent 60%)',
    main:      'radial-gradient(ellipse 65% 55% at 85% 10%, #2D7D4A 0%, #0F2A18 30%, #060E08 70%)',
    base:      '#060E08',
  },
  smoke: {
    secondary: 'radial-gradient(ellipse 40% 35% at 10% 90%, rgba(26,26,26,0.2) 0%, transparent 60%)',
    main:      'radial-gradient(ellipse 65% 55% at 85% 10%, #808080 0%, #1A1A1A 30%, #080808 70%)',
    base:      '#080808',
  },
  dusk: {
    secondary: 'radial-gradient(ellipse 40% 35% at 10% 90%, rgba(26,10,61,0.2) 0%, transparent 60%)',
    main:      'radial-gradient(ellipse 65% 55% at 85% 10%, #6B3FA0 0%, #1A0A3D 30%, #07040F 70%)',
    base:      '#07040F',
  },
  ember: {
    secondary: 'radial-gradient(ellipse 40% 35% at 10% 90%, rgba(42,14,4,0.2) 0%, transparent 60%)',
    main:      'radial-gradient(ellipse 65% 55% at 85% 10%, #C4500A 0%, #2A0E04 30%, #0A0600 70%)',
    base:      '#0A0600',
  },
};

function bgFor(themeId) {
  const cfg = THEME_BG[themeId] || THEME_BG.dusk;
  // Stack: secondary, main, base. Per spec.
  return `${cfg.secondary}, ${cfg.main}, ${cfg.base}`;
}

export default function LiquidMesh({ seed = 0, intensity = 1 }) {
  const initial = (typeof window !== 'undefined' && window.__archiveTheme) || 'dusk';
  const [current, setCurrent] = React.useState(initial);
  const [previous, setPrevious] = React.useState(null);
  const isLight = typeof window !== 'undefined' && !!window.__archiveLight;

  // Listen for theme changes — crossfade by stacking previous + current with opacity transitions
  React.useEffect(() => {
    const handler = () => {
      const next = (typeof window !== 'undefined' && window.__archiveTheme) || 'dusk';
      setCurrent(prev => {
        if (next === prev) return prev;
        setPrevious(prev);
        // Drop previous after the crossfade completes
        setTimeout(() => setPrevious(null), 440);
        return next;
      });
    };
    window.addEventListener('archive:themechange', handler);
    return () => window.removeEventListener('archive:themechange', handler);
  }, []);

  // Keyframes for crossfade
  const keyframes = `
    @keyframes archive-bg-fade-in  { from { opacity: 0; } to { opacity: 1; } }
    @keyframes archive-bg-fade-out { from { opacity: 1; } to { opacity: 0; } }
  `;

  // ─────────── LIGHT MODE ───────────
  if (isLight) {
    return (
      <div data-liquid-mesh="true" style={{
        position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none',
        background: '#F5F0E8',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: bgFor(current),
          opacity: 0.30,
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.4 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")`,
          backgroundSize: '220px 220px',
          opacity: 0.04,
          mixBlendMode: 'multiply',
        }} />
      </div>
    );
  }

  // ─────────── DARK MODE — top-right glow + bottom-left secondary, with crossfade ───────────
  return (
    <div data-liquid-mesh="true" style={{
      position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none',
      background: '#020204',
    }}>
      <style>{keyframes}</style>

      {/* Previous theme — fades out over 400ms */}
      {previous && (
        <div
          key={`prev-${previous}`}
          style={{
            position: 'absolute', inset: 0,
            background: bgFor(previous),
            animation: 'archive-bg-fade-out 400ms ease forwards',
          }}
        />
      )}

      {/* Current theme — fades in over 400ms (or static if no previous) */}
      <div
        key={`curr-${current}`}
        style={{
          position: 'absolute', inset: 0,
          background: bgFor(current),
          animation: previous ? 'archive-bg-fade-in 400ms ease forwards' : 'none',
        }}
      />

      {/* Top vignette so status-bar reads clearly */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '7%',
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, transparent 100%)',
        pointerEvents: 'none',
      }} />

      {/* Film grain */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.5 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")`,
        backgroundSize: '220px 220px',
        opacity: 0.05,
        mixBlendMode: 'overlay',
        pointerEvents: 'none',
      }} />
    </div>
  );
}
