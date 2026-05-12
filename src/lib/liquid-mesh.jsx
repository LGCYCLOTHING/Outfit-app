import React from 'react';
import { THEMES } from './shared.jsx';

function rgba(hex, a) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

export default function LiquidMesh({ seed = 0, intensity = 1 }) {
  const themeId = (typeof window !== 'undefined' && window.__archiveTheme) || 'dusk';
  const theme = THEMES[themeId] || THEMES.dusk;
  const isLight = typeof window !== 'undefined' && !!window.__archiveLight;

  // ─────────── LIGHT MODE ───────────
  if (isLight) {
    return (
      <div data-liquid-mesh="true" style={{
        position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none',
        background: '#F5F0E8',
      }}>
        {/* Strong warm haze top */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '60%',
          background: `radial-gradient(ellipse 100% 100% at 50% -20%, ${rgba(theme.light, 0.60 * intensity)} 0%, ${rgba(theme.hot, 0.30 * intensity)} 40%, transparent 80%)`,
        }} />
        {/* Strong bottom warmth */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '40%',
          background: `linear-gradient(to top, ${rgba(theme.deep, 0.22)} 0%, transparent 100%)`,
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

  // ─────────── DARK MODE — STRONG gradient ───────────
  return (
    <div data-liquid-mesh="true" style={{
      position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none',
      background: '#08070A',
    }}>
      {/* Strong theme-tinted top glow — fills upper 60% of screen */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '70%',
        background: `radial-gradient(ellipse 100% 100% at 50% -20%, ${rgba(theme.light, 0.55 * intensity)} 0%, ${rgba(theme.hot, 0.32 * intensity)} 35%, ${rgba(theme.deep, 0.18 * intensity)} 65%, transparent 85%)`,
        pointerEvents: 'none',
      }} />

      {/* Secondary corner glow for depth */}
      <div style={{
        position: 'absolute', top: '-15%', right: '-20%', width: '70%', height: '60%',
        background: `radial-gradient(ellipse at center, ${rgba(theme.hot, 0.35 * intensity)} 0%, transparent 65%)`,
        filter: 'blur(40px)',
      }} />

      {/* Deep bottom anchor — theme deep color washes upward */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%',
        background: `linear-gradient(to top, ${rgba(theme.deep, 0.85)} 0%, ${rgba(theme.deep, 0.30)} 50%, transparent 100%)`,
      }} />

      {/* Top vignette so status bar reads clearly */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '8%',
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, transparent 100%)',
      }} />

      {/* Film grain */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.5 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")`,
        backgroundSize: '220px 220px',
        opacity: 0.05,
        mixBlendMode: 'overlay',
      }} />
    </div>
  );
}
