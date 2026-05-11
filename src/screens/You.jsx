import React from 'react';
import {
  useTheme, bgColor, fgColor, THEMES,
  ArchiveBurger, StatusBar, GlowCard, Glass, TabBar,
} from '../lib/shared.jsx';
import LiquidMesh from '../lib/liquid-mesh.jsx';

export default function ScreenYou() {
  const t = useTheme();
  const accent = t.light;
  const accentRgba = t.softRgba;
  const accentHot = t.hot;
  const accentDeep = t.deep;
  const activeId = t.id;

  const swatches = ['ivory', 'slate', 'forest', 'smoke', 'dusk', 'ember'].map(id => THEMES[id]);

  const setTheme = (id) => {
    window.__archiveTheme = id;
    window.dispatchEvent(new CustomEvent('archive:themechange', { detail: id }));
  };

  const isLight = !!window.__archiveLight;
  const toggleLight = () => {
    window.__archiveLight = !window.__archiveLight;
    window.dispatchEvent(new CustomEvent('archive:lightchange'));
  };

  return (
    <div style={{
      width: '100%', height: '100%', position: 'relative', overflow: 'hidden',
      background: bgColor(),
      fontFamily: 'DM Sans, -apple-system, system-ui, sans-serif',
      color: fgColor(),
    }}>
      <div style={{
        position: 'absolute', top: -180, left: '50%', transform: 'translateX(-50%)',
        width: 460, height: 460, borderRadius: '50%',
        background: `radial-gradient(circle, rgba(${accentRgba},0.22) 0%, transparent 60%)`,
        filter: 'blur(40px)', pointerEvents: 'none',
      }} />
      <LiquidMesh seed={4} intensity={1} />

      <StatusBar />

      <div style={{ position: 'relative', zIndex: 2, padding: 'calc(24px + var(--archive-safe-top, 0px)) 24px calc(120px + var(--archive-safe-bottom, 0px))', height: '100%', overflow: 'auto', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 26 }}>
          <ArchiveBurger />
          <div style={{
            width: 64, height: 64, borderRadius: 32,
            background: `radial-gradient(circle at 30% 30%, ${accent} 0%, ${accentHot} 50%, ${accentDeep} 100%)`,
            boxShadow: `inset 0 0 0 0.5px rgba(${accentRgba},0.4), 0 0 24px rgba(${accentRgba},0.4)`,
          }} />
          <div>
            <div className="h-display" style={{ fontSize: 26 }}>Your <em>archive</em></div>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.92)', marginTop: 4, letterSpacing: -0.35, fontFamily: '"DM Sans", sans-serif' }}>312 FITS · 47 DAY STREAK</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <div style={{ width: 3, height: 14, borderRadius: 1.5, background: accent, boxShadow: `0 0 10px ${accent}` }} />
          <span style={{ fontSize: 14, fontWeight: 500, color: 'rgba(255,255,255,0.95)', letterSpacing: -0.4, fontFamily: '"DM Sans", sans-serif' }}>
            DISPLAY MODE
          </span>
        </div>
        <Glass radius={18} style={{ padding: 6, marginBottom: 22, display: 'flex' }}>
          {[
            { id: 'dark', label: 'Dark' },
            { id: 'light', label: 'Light' },
          ].map(opt => {
            const active = (opt.id === 'light') === isLight;
            return (
              <div key={opt.id}
                onClick={() => { if (active) return; toggleLight(); }}
                style={{
                  flex: 1, textAlign: 'center', padding: '12px 0',
                  borderRadius: 13,
                  background: active ? `rgba(${accentRgba},0.16)` : 'transparent',
                  boxShadow: active ? `inset 0 0 0 0.5px rgba(${accentRgba},0.35)` : 'none',
                  fontSize: 15, fontWeight: 500,
                  color: active ? accent : 'rgba(255,255,255,0.65)',
                  cursor: 'pointer',
                  transition: 'all .2s ease',
                }}>
                {opt.label}
              </div>
            );
          })}
        </Glass>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <div style={{ width: 3, height: 14, borderRadius: 1.5, background: accent, boxShadow: `0 0 10px ${accent}` }} />
          <span style={{ fontSize: 14, fontWeight: 500, color: 'rgba(255,255,255,0.95)', letterSpacing: -0.4, fontFamily: '"DM Sans", sans-serif' }}>
            APPEARANCE · THEME
          </span>
        </div>

        <Glass radius={22} style={{ padding: 20, marginBottom: 18 }}>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '20px 12px',
          }}>
            {swatches.map(s => {
              const isActive = s.id === activeId;
              return (
                <div key={s.id}
                  onClick={() => setTheme(s.id)}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                    cursor: 'pointer',
                  }}>
                  <div style={{
                    position: 'relative',
                    width: 56, height: 56, borderRadius: 28,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {isActive && (
                      <div style={{
                        position: 'absolute', inset: -5, borderRadius: 33,
                        boxShadow: `inset 0 0 0 1.5px ${s.light}`,
                      }} />
                    )}
                    <div style={{
                      width: 48, height: 48, borderRadius: 24,
                      background: `radial-gradient(circle at 30% 30%, ${s.light} 0%, ${s.hot} 50%, ${s.deep} 100%)`,
                      boxShadow: `0 0 ${isActive ? 22 : 12}px rgba(${s.softRgba},${isActive ? 0.65 : 0.35}), inset 0 1px 1px rgba(255,255,255,0.25)`,
                    }} />
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 14, fontWeight: isActive ? 600 : 500, color: isActive ? s.light : '#fff' }}>
                      {s.name}
                    </div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.92)', marginTop: 2, letterSpacing: 0.2 }}>
                      {s.sub}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Glass>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, marginTop: 22 }}>
          <svg width="11" height="13" viewBox="0 0 12 14" fill={accent}>
            <path d="M6 0a4 4 0 0 0-4 4v2H1v8h10V6h-1V4a4 4 0 0 0-4-4zm0 2a2 2 0 0 1 2 2v2H4V4a2 2 0 0 1 2-2z"/>
          </svg>
          <span style={{ fontSize: 14, fontWeight: 500, color: 'rgba(255,255,255,0.95)', letterSpacing: -0.4, fontFamily: '"DM Sans", sans-serif' }}>
            PRO · LOCKED
          </span>
        </div>

        <div onClick={() => window.__archiveGo && window.__archiveGo('paywall')} style={{ cursor: 'pointer' }}>
          <GlowCard glow="br" intensity={0.85}>
            <div style={{ padding: 18, display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                position: 'relative', width: 52, height: 52, borderRadius: 26, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'conic-gradient(from 0deg, #f5e6c8, #7aa6c4, #6e9a4d, #a8aab2, #9472cf, #ff8a3d, #f5e6c8)',
                boxShadow: `0 0 18px rgba(${accentRgba},0.5), inset 0 0 0 1.5px rgba(255,255,255,0.15)`,
              }}>
                <div style={{
                  width: 38, height: 38, borderRadius: 19,
                  background: 'rgba(10,8,8,0.85)',
                  backdropFilter: 'blur(8px)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: 'inset 0 0 0 0.5px rgba(255,255,255,0.1)',
                }}>
                  <svg width="16" height="18" viewBox="0 0 12 14" fill={accent}>
                    <path d="M6 0a4 4 0 0 0-4 4v2H1v8h10V6h-1V4a4 4 0 0 0-4-4zm0 2a2 2 0 0 1 2 2v2H4V4a2 2 0 0 1 2-2z"/>
                  </svg>
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <div style={{ fontSize: 15, fontWeight: 500, letterSpacing: -0.2 }}>Dynamic Theme</div>
                  <div style={{
                    padding: '2px 7px', borderRadius: 100,
                    background: `linear-gradient(135deg, ${accent} 0%, ${accentHot} 100%)`,
                    fontSize: 9, color: '#0a0a0a', fontWeight: 500, letterSpacing: -0.13,
                    boxShadow: `0 0 10px rgba(${accentRgba},0.5)`,
                  }}>PRO</div>
                </div>
                <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.92)', lineHeight: 1.4 }}>
                  App color updates automatically from your outfit photo.
                </div>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="1" strokeLinecap="round">
                <path d="M9 6l6 6-6 6"/>
              </svg>
            </div>
          </GlowCard>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, marginTop: 26 }}>
          <span style={{ fontSize: 14, fontWeight: 500, color: 'rgba(255,255,255,0.95)', letterSpacing: -0.4, fontFamily: '"DM Sans", sans-serif' }}>
            ACCOUNT
          </span>
        </div>
        <Glass radius={18} style={{ overflow: 'hidden' }}>
          {[
            { label: 'Notifications', sub: 'Daily pick at 7:30 am' },
            { label: 'Photo backup', sub: 'iCloud · 2.4 GB' },
            { label: 'Export archive', sub: 'PDF · 312 fits' },
          ].map((row, i, arr) => (
            <div key={row.label} style={{
              padding: '14px 16px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              borderBottom: i < arr.length - 1 ? '0.5px solid rgba(255,255,255,0.06)' : 'none',
            }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 500 }}>{row.label}</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.92)', marginTop: 2 }}>{row.sub}</div>
              </div>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1" strokeLinecap="round">
                <path d="M9 6l6 6-6 6"/>
              </svg>
            </div>
          ))}
        </Glass>
      </div>

      <TabBar active="you" />
    </div>
  );
}
