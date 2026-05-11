import React from 'react';
import { useTheme, bgColor, fgColor, StatusBar, TabBar, fitGradient } from '../lib/shared.jsx';
import LiquidMesh from '../lib/liquid-mesh.jsx';

export default function ScreenCalendar() {
  const t = useTheme();
  const accent = t.light;
  const accentRgba = t.softRgba;

  const today = 27;
  const firstDow = 3;
  const daysInMonth = 30;
  const log = {
    1: 11, 2: 7, 3: 12, 4: null, 5: 9,
    6: 4, 7: 8, 8: 6, 9: 1, 10: 11, 11: 3, 12: null,
    13: 5, 14: 10, 15: 2, 16: 7, 17: 19, 18: null, 19: 20,
    20: 12, 21: 21, 22: 6, 23: 23, 24: null, 25: 22, 26: 24,
    27: 23,
    28: null, 29: null, 30: null,
  };
  const dows = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  const cells = [];
  for (let i = 0; i < firstDow; i++) cells.push({ blank: true, key: 'b' + i });
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, fit: log[d], isToday: d === today, isFuture: d > today, key: d });
  }

  return (
    <div style={{
      width: '100%', height: '100%', position: 'relative', overflow: 'hidden',
      background: bgColor(),
      fontFamily: 'DM Sans, -apple-system, system-ui, sans-serif',
      color: fgColor(),
    }}>
      <div style={{
        position: 'absolute', top: -200, left: '50%', transform: 'translateX(-50%)',
        width: 480, height: 480, borderRadius: '50%',
        background: `radial-gradient(circle, rgba(${accentRgba},0.20) 0%, transparent 60%)`,
        filter: 'blur(40px)', pointerEvents: 'none',
      }} />
      <LiquidMesh seed={7} intensity={1} />
      <StatusBar />

      <div style={{ position: 'relative', zIndex: 2, padding: 'calc(24px + var(--archive-safe-top, 0px)) 0 calc(120px + var(--archive-safe-bottom, 0px))', height: '100%', overflow: 'auto', boxSizing: 'border-box' }}>
        <div style={{ padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <div onClick={() => window.__archiveGo && window.__archiveGo('archive')} style={{
            width: 36, height: 36, borderRadius: 18,
            background: 'rgba(255,255,255,0.05)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: 'inset 0 0 0 0.5px rgba(255,255,255,0.08)',
            cursor: 'pointer',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 6l-6 6 6 6"/>
            </svg>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill={accent} stroke="none">
              <path d="M12 2c1 4-3 6-3 10a5 5 0 0 0 10 0c0-2-1-4-2-5 0 2-1 3-2 3 0-3-1-5-3-8z"/>
            </svg>
            <span style={{ fontSize: 15, fontWeight: 500, color: accent, letterSpacing: 0.2 }}>
              18 day streak
            </span>
          </div>
          <div onClick={() => window.__archiveGo && window.__archiveGo('archive')} style={{
            width: 36, height: 36, borderRadius: 18,
            background: 'rgba(255,255,255,0.05)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: 'inset 0 0 0 0.5px rgba(255,255,255,0.08)',
            cursor: 'pointer',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
            </svg>
          </div>
        </div>

        <div style={{ padding: '0 24px', marginTop: 18, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 18 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 500, color: 'rgba(255,255,255,0.95)', letterSpacing: -0.4, fontFamily: '"DM Sans", sans-serif', marginBottom: 4 }}>
              26 OF 30 LOGGED
            </div>
            <div style={{ fontSize: 32, fontWeight: 300, letterSpacing: -0.6, lineHeight: 1 }}>
              <span style={{ fontStyle: 'italic', fontFamily: 'Cormorant Garamond, serif', fontWeight: 400 }}>April</span>
              <span style={{ color: 'rgba(255,255,255,0.92)' }}> · 2026</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 16,
              background: 'rgba(255,255,255,0.05)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 6l-6 6 6 6"/>
              </svg>
            </div>
            <div style={{
              width: 32, height: 32, borderRadius: 16,
              background: 'rgba(255,255,255,0.03)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              opacity: 0.4,
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 6l6 6-6 6"/>
              </svg>
            </div>
          </div>
        </div>

        <div style={{ padding: '0 24px', display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, marginBottom: 8 }}>
          {dows.map((d, i) => (
            <div key={i} style={{
              fontSize: 12, color: 'rgba(255,255,255,0.92)',
              textAlign: 'center', letterSpacing: -0.35,
              fontFamily: '"DM Sans", sans-serif',
            }}>{d}</div>
          ))}
        </div>

        <div style={{ padding: '0 24px', display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
          {cells.map(c => {
            if (c.blank) return <div key={c.key} style={{ aspectRatio: '1' }} />;
            const hasFit = c.fit != null;
            const isToday = c.isToday;
            const isFuture = c.isFuture;
            return (
              <div key={c.key} onClick={() => hasFit && !isFuture && window.__archiveGo && window.__archiveGo('detail')} style={{
                position: 'relative', aspectRatio: '1', borderRadius: 8,
                overflow: 'hidden',
                background: hasFit ? fitGradient(c.fit) : 'rgba(255,255,255,0.025)',
                opacity: isFuture ? 0.25 : 1,
                cursor: hasFit && !isFuture ? 'pointer' : 'default',
                boxShadow: isToday
                  ? `inset 0 0 0 1.5px ${accent}, 0 0 14px rgba(${accentRgba},0.5)`
                  : (hasFit
                      ? 'inset 0 0 0 0.5px rgba(255,255,255,0.06)'
                      : 'inset 0 0 0 0.5px rgba(255,255,255,0.04)'),
              }}>
                {hasFit && (
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(180deg, transparent 30%, rgba(0,0,0,0.55) 100%)',
                  }} />
                )}
                <div style={{
                  position: 'absolute', top: 4, left: 5,
                  fontSize: 9.5, fontWeight: 500,
                  color: hasFit ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.45)',
                  textShadow: hasFit ? '0 1px 2px rgba(0,0,0,0.7)' : 'none',
                  fontFamily: '"DM Sans", sans-serif',
                }}>{c.day}</div>
                {isToday && (
                  <div style={{
                    position: 'absolute', bottom: 4, right: 5,
                    width: 5, height: 5, borderRadius: 3, background: accent,
                    boxShadow: `0 0 6px ${accent}`,
                  }} />
                )}
              </div>
            );
          })}
        </div>

        <div style={{ padding: '24px 24px 0', display: 'flex', gap: 16, alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: fitGradient(5) }} />
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.92)' }}>Logged</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: 'rgba(255,255,255,0.08)' }} />
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.92)' }}>Skipped</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: fitGradient(23),
              boxShadow: `inset 0 0 0 1.5px ${accent}` }} />
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.92)' }}>Today</span>
          </div>
        </div>
      </div>

      <TabBar active="archive" />
    </div>
  );
}
