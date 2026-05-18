import React from 'react';

// Themes that only have a dark background — light mode falls back to the dark image
const DARK_ONLY_THEMES = new Set(['noir']);

// Build a "background variant" key from theme id + light flag.
// e.g. "dusk:dark", "ivory:light". Used so the crossfade fires for either
// a theme switch or a dark↔light flip.
function variantKey(themeId, light) {
  return `${themeId}:${light ? 'light' : 'dark'}`;
}
function parseVariant(key) {
  const [themeId, mode] = key.split(':');
  return { themeId, light: mode === 'light' };
}

export default function LiquidMesh({ seed = 0, intensity = 1 }) {
  const initialTheme = (typeof window !== 'undefined' && window.__archiveTheme) || 'dusk';
  const initialLight = typeof window !== 'undefined' && !!window.__archiveLight;
  const [current, setCurrent] = React.useState(variantKey(initialTheme, initialLight));
  const [previous, setPrevious] = React.useState(null);

  // One handler covers both: theme change AND dark/light flip.
  // Builds the next variant key, crossfades if it differs from the current.
  React.useEffect(() => {
    const handler = () => {
      const theme = (typeof window !== 'undefined' && window.__archiveTheme) || 'dusk';
      const light = typeof window !== 'undefined' && !!window.__archiveLight;
      const next = variantKey(theme, light);
      setCurrent(prev => {
        if (next === prev) return prev;
        setPrevious(prev);
        setTimeout(() => setPrevious(null), 440);
        return next;
      });
    };
    window.addEventListener('archive:themechange', handler);
    window.addEventListener('archive:lightchange', handler);
    return () => {
      window.removeEventListener('archive:themechange', handler);
      window.removeEventListener('archive:lightchange', handler);
    };
  }, []);

  const keyframes = `
    @keyframes archive-bg-fade-in  { from { opacity: 0; } to { opacity: 1; } }
    @keyframes archive-bg-fade-out { from { opacity: 1; } to { opacity: 0; } }
  `;

  // A single layer = just the bg image. No CSS-gradient fallback (it was
  // flashing through during crossfade transitions); the parent's solid bg
  // covers the brief load window.
  const ThemeLayer = ({ variant, anim }) => {
    const { themeId, light } = parseVariant(variant);
    const useLight = light && !DARK_ONLY_THEMES.has(themeId);
    const imageSrc = useLight
      ? `/backgrounds/bg-${themeId}-light.png`
      : `/backgrounds/bg-${themeId}.png`;
    return (
      <div style={{
        position: 'absolute', inset: 0,
        animation: anim || 'none',
        backgroundImage: `url('${imageSrc}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        // Note: deliberately NOT background-attachment: fixed — that causes
        // significant scroll lag on iOS Safari (forces a full repaint of the
        // bg on every scroll frame). The mesh is in an absolute-positioned
        // container that doesn't scroll itself, so the visual is the same.
      }} />
    );
  };

  const { light: currentLight } = parseVariant(current);

  return (
    <div data-liquid-mesh="true" style={{
      position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none',
      background: currentLight ? '#F5F0E8' : '#020204',
    }}>
      <style>{keyframes}</style>

      {/* Previous variant — fades out over 400ms */}
      {previous && (
        <ThemeLayer
          key={`prev-${previous}`}
          variant={previous}
          anim="archive-bg-fade-out 400ms ease forwards"
        />
      )}

      {/* Current variant — fades in over 400ms when there's a previous to swap from */}
      <ThemeLayer
        key={`curr-${current}`}
        variant={current}
        anim={previous ? 'archive-bg-fade-in 400ms ease forwards' : null}
      />

      {/* Top vignette so status-bar reads clearly (dark mode only) */}
      {!currentLight && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '7%',
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, transparent 100%)',
          pointerEvents: 'none',
        }} />
      )}

      {/* Film grain */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: currentLight
          ? `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.4 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")`
          : `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.5 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")`,
        backgroundSize: '220px 220px',
        opacity: currentLight ? 0.04 : 0.05,
        mixBlendMode: currentLight ? 'multiply' : 'overlay',
        pointerEvents: 'none',
      }} />
    </div>
  );
}
