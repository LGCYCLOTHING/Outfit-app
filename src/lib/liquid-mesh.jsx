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
  noir: {
    secondary: 'radial-gradient(ellipse 40% 35% at 10% 90%, rgba(40,40,40,0.18) 0%, transparent 60%)',
    main:      'radial-gradient(ellipse 65% 55% at 85% 10%, #2a2a2a 0%, #0d0d0d 30%, #000 70%)',
    base:      '#000000',
  },
};

// Themes that only have a dark background — light mode falls back to the dark image
const DARK_ONLY_THEMES = new Set(['noir']);

function bgFor(themeId) {
  const cfg = THEME_BG[themeId] || THEME_BG.dusk;
  // Stack: secondary, main, base. Per spec.
  return `${cfg.secondary}, ${cfg.main}, ${cfg.base}`;
}

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

  // A single layer = gradient fallback + bg image on top, scoped to one variant.
  // The whole stack fades in/out so gradient + image transition together.
  const ThemeLayer = ({ variant, anim }) => {
    const { themeId, light } = parseVariant(variant);
    const useLight = light && !DARK_ONLY_THEMES.has(themeId);
    const imageSrc = useLight
      ? `/backgrounds/bg-${themeId}-light.png`
      : `/backgrounds/bg-${themeId}.png`;
    return (
      <div style={{ position: 'absolute', inset: 0, animation: anim || 'none' }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: useLight ? '#F5F0E8' : bgFor(themeId),
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `url('${imageSrc}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }} />
      </div>
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
