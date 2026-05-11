import React from 'react';
import {
  useTheme, bgColor, fgColor,
  ArchiveBurger, StatusBar, GlowCard, TabBar, PhotoPlaceholder,
} from '../lib/shared.jsx';
import LiquidMesh from '../lib/liquid-mesh.jsx';

export default function ScreenMix() {
  const t = useTheme();
  const accent = t.light;
  const accentHot = t.hot;
  const accentRgba = t.softRgba;

  const combos = [
    {
      title: 'Soft tailoring × denim',
      ids: [6, 11, 4],
      reason: 'Your cream knit (#006) hasn\'t met those vintage Levi\'s. Pair with the espresso loafer for a 60/40 contrast you tend to favor at brunch.',
      conf: 92, locked: false, pieces: '3 pieces · brunch',
    },
    {
      title: 'Rust + olive monochrome',
      ids: [3, 7, 8],
      reason: 'Earth-tone study. The suede jacket grounds the olive trousers; brick scarf adds tension. Echoes a fit from Oct \'25 that you saved twice.',
      conf: 88, locked: false, pieces: '3 pieces · evening',
    },
    {
      title: 'High-contrast layering',
      ids: [2, 12, 5],
      reason: 'Charcoal trench over dusty rose, leather boots. AI flagged this as a stretch — bold but harmonious.',
      conf: 81, locked: true, pieces: '3 pieces · night out',
    },
  ];

  return (
    <div style={{
      width: '100%', height: '100%', position: 'relative', overflow: 'hidden',
      background: bgColor(),
      fontFamily: 'DM Sans, -apple-system, system-ui, sans-serif',
      color: fgColor(),
    }}>
      <div style={{
        position: 'absolute', top: -200, right: -120,
        width: 460, height: 460, borderRadius: '50%',
        background: `radial-gradient(circle, rgba(${accentRgba},0.26) 0%, transparent 60%)`,
        filter: 'blur(40px)', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', top: 480, left: -160,
        width: 380, height: 380, borderRadius: '50%',
        background: `radial-gradient(circle, rgba(${accentRgba},0.16) 0%, transparent 60%)`,
        filter: 'blur(40px)', pointerEvents: 'none',
      }} />
      <LiquidMesh seed={2} intensity={1} />

      <StatusBar />

      <div style={{ position: 'relative', zIndex: 2, padding: 'calc(24px + var(--archive-safe-top, 0px)) 24px calc(120px + var(--archive-safe-bottom, 0px))', height: '100%', overflow: 'auto', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 6 }}>
          <ArchiveBurger />
          <div style={{ width: 3, height: 14, borderRadius: 1.5, background: accent, boxShadow: `0 0 10px ${accent}` }} />
          <span style={{ fontSize: 14, fontWeight: 500, color: 'rgba(255,255,255,0.95)', letterSpacing: -0.4, fontFamily: '"DM Sans", sans-serif' }}>
            AI MIX · UPDATED 2h AGO
          </span>
        </div>
        <div className="h-display" style={{ fontSize: 40, marginBottom: 8 }}>
          Combos you<br/>
          <em>haven't tried.</em>
        </div>
        <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.92)', lineHeight: 1.45, marginBottom: 22 }}>
          Pulled from 312 logged fits · refreshed daily
        </div>

        {combos.map((c, idx) => (
          <div key={idx} style={{ marginBottom: 18, position: 'relative' }}>
            <GlowCard
              glow={idx % 2 === 0 ? 'br' : 'bl'}
              accent={c.locked ? 'rgba(180,180,200,0.6)' : accentHot}
              intensity={c.locked ? 0.4 : 1}
              style={{ padding: 16 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.92)', fontFamily: '"DM Sans", sans-serif', letterSpacing: -0.30 }}>
                    COMBO · {String(idx + 1).padStart(2, '0')}
                  </span>
                  {!c.locked && (
                    <span style={{
                      fontSize: 12, color: accent, fontFamily: '"DM Sans", sans-serif', letterSpacing: -0.20,
                      padding: '2px 7px', borderRadius: 4,
                      background: `rgba(${accentRgba},0.10)`,
                      boxShadow: `inset 0 0 0 0.5px rgba(${accentRgba},0.3)`,
                    }}>{c.conf}% MATCH</span>
                  )}
                </div>
                {c.locked && (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    padding: '3px 9px', borderRadius: 100,
                    background: `linear-gradient(135deg, ${accent} 0%, ${accentHot} 100%)`,
                    fontSize: 12, color: '#0a0a0a', fontWeight: 500, letterSpacing: -0.13,
                    boxShadow: `0 0 12px rgba(${accentRgba},0.5)`,
                  }}>
                    <svg width="9" height="11" viewBox="0 0 12 14" fill="#0a0a0a">
                      <path d="M6 0a4 4 0 0 0-4 4v2H1v8h10V6h-1V4a4 4 0 0 0-4-4zm0 2a2 2 0 0 1 2 2v2H4V4a2 2 0 0 1 2-2z"/>
                    </svg>
                    PRO
                  </div>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, marginBottom: 14, position: 'relative' }}>
                {c.ids.map((id, i) => (
                  <div key={i} onClick={() => !c.locked && window.__archiveGo && window.__archiveGo('detail')} style={{ position: 'relative', filter: c.locked ? 'blur(8px) brightness(0.6)' : 'none', cursor: c.locked ? 'default' : 'pointer' }}>
                    <PhotoPlaceholder ratio="3/4" radius={12} photoId={id} />
                    {i < 2 && (
                      <div style={{
                        position: 'absolute', top: '50%', right: -6, width: 12, height: 1,
                        background: `rgba(${accentRgba},0.4)`, zIndex: 2,
                      }} />
                    )}
                  </div>
                ))}
                {c.locked && (
                  <div style={{
                    position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    pointerEvents: 'none',
                  }}>
                    <div style={{
                      width: 52, height: 52, borderRadius: 26,
                      background: 'rgba(20,16,14,0.7)',
                      backdropFilter: 'blur(10px)',
                      boxShadow: `inset 0 0 0 0.5px rgba(${accentRgba},0.4), 0 0 24px rgba(${accentRgba},0.3)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <svg width="20" height="22" viewBox="0 0 12 14" fill={accent}>
                        <path d="M6 0a4 4 0 0 0-4 4v2H1v8h10V6h-1V4a4 4 0 0 0-4-4zm0 2a2 2 0 0 1 2 2v2H4V4a2 2 0 0 1 2-2z"/>
                      </svg>
                    </div>
                  </div>
                )}
              </div>

              <div style={{ fontSize: 17, fontWeight: 500, letterSpacing: -0.2, marginBottom: 6 }}>
                {c.title}
              </div>
              <div style={{
                fontSize: 14, color: 'rgba(255,255,255,0.92)', lineHeight: 1.5,
                marginBottom: 12, paddingLeft: 10,
                borderLeft: `2px solid ${c.locked ? `rgba(${accentRgba},0.3)` : accent}`,
              }}>
                {c.reason}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.92)', fontFamily: '"DM Sans", sans-serif', letterSpacing: -0.15 }}>
                  {c.pieces}
                </span>
                <span onClick={() => window.__archiveGo && window.__archiveGo(c.locked ? 'paywall' : 'rating')} style={{
                  fontSize: 14, fontWeight: 500,
                  color: c.locked ? accent : '#fff',
                  display: 'flex', alignItems: 'center', gap: 4,
                  cursor: 'pointer',
                }}>
                  {c.locked ? 'Unlock' : 'Try it'}
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                    <path d="M9 6l6 6-6 6"/>
                  </svg>
                </span>
              </div>
            </GlowCard>
          </div>
        ))}
      </div>

      <TabBar active="mix" />
    </div>
  );
}
