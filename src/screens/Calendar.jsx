import React from 'react';
import { useTheme, bgColor, fgColor, StatusBar, TabBar, fitGradient, fitBorder } from '../lib/shared.jsx';
import LiquidMesh from '../lib/liquid-mesh.jsx';

// Soft outer-glow rgba palette — index-matched to FIT_BORDERS in shared.jsx
// (lavender, teal, coral, sky, pink, mint, amber, indigo, rose, sage, slate-blue, magenta)
const AMBIENT_GLOWS = [
  'rgba(138,123,216,0.45)',
  'rgba(77,184,160,0.45)',
  'rgba(224,122,74,0.45)',
  'rgba(107,163,224,0.45)',
  'rgba(224,122,176,0.45)',
  'rgba(107,200,144,0.45)',
  'rgba(224,176,96,0.45)',
  'rgba(96,128,224,0.45)',
  'rgba(224,128,112,0.45)',
  'rgba(160,180,128,0.45)',
  'rgba(112,128,149,0.45)',
  'rgba(192,96,160,0.45)',
];
function ambientGlow(id) {
  const n = typeof id === 'number' ? id : String(id).split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return AMBIENT_GLOWS[Math.abs(n) % AMBIENT_GLOWS.length];
}

function DotsMenu({ color = 'rgba(245,240,232,0.85)' }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill={color}>
      <circle cx="5" cy="12" r="1.5"/>
      <circle cx="12" cy="12" r="1.5"/>
      <circle cx="19" cy="12" r="1.5"/>
    </svg>
  );
}

export default function ScreenCalendar() {
  const t = useTheme();

  // Months for 2026 — each gets a deterministic fit gradient as its "landscape photo"
  const months = [
    { name: 'April',     fitId: 23, count: 26 },
    { name: 'March',     fitId: 4,  count: 23 },
    { name: 'February',  fitId: 9,  count: 19 },
    { name: 'January',   fitId: 6,  count: 22 },
    { name: 'December',  fitId: 2,  count: 18 },
    { name: 'November',  fitId: 11, count: 21 },
    { name: 'October',   fitId: 7,  count: 24 },
    { name: 'September', fitId: 3,  count: 25 },
  ];

  const [year, setYear] = React.useState(2026);
  const [yearOpen, setYearOpen] = React.useState(false);
  const yearOptions = [2026, 2025, 2024, 2023, 2022];

  return (
    <div style={{
      width: '100%', height: '100%', position: 'relative', overflow: 'hidden',
      background: bgColor(),
      fontFamily: 'DM Sans, -apple-system, system-ui, sans-serif',
      color: fgColor(),
    }}>
      <LiquidMesh seed={7} intensity={0.7} />
      <StatusBar />

      <div style={{ position: 'absolute', zIndex: 2, top: 'var(--archive-safe-top, 54px)', left: 0, right: 0, bottom: 0, padding: '0 0 calc(120px + var(--archive-safe-bottom, 0px))', overflow: 'auto', boxSizing: 'border-box' }}>

        {/* Header — year picker (tap to open) + close (X, no circle) */}
        <div style={{ padding: '0 22px', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
          <div onClick={() => setYearOpen(o => !o)} className="archive-pressable" style={{
            display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer',
          }}>
            <span style={{ fontSize: 26, color: 'var(--text-primary)', fontWeight: 500, letterSpacing: -0.4 }}>
              {year}
            </span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(245,240,232,0.75)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              style={{ transform: yearOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform .2s ease' }}>
              <path d="M6 9l6 6 6-6"/>
            </svg>
          </div>
          <div onClick={() => window.__archiveGo && window.__archiveGo('archive')} className="archive-pressable" style={{
            width: 38, height: 38,
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.4))',
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 6l12 12M18 6L6 18"/>
            </svg>
          </div>

          {/* Year dropdown */}
          {yearOpen && (
            <>
              {/* tap-anywhere-to-close scrim */}
              <div onClick={() => setYearOpen(false)} style={{
                position: 'fixed', inset: 0, zIndex: 40, background: 'transparent',
              }} />
              <div className="lg-sheet" style={{
                position: 'absolute', top: 'calc(100% + 8px)', left: 22,
                zIndex: 41, minWidth: 110,
                borderRadius: 14, padding: 6,
                boxShadow: '0 14px 40px -8px rgba(0,0,0,0.5)',
              }}>
                {yearOptions.map(y => {
                  const active = y === year;
                  return (
                    <div key={y}
                      onClick={() => { setYear(y); setYearOpen(false); }}
                      className="archive-pressable"
                      style={{
                        padding: '10px 14px', borderRadius: 10,
                        fontSize: 16, fontWeight: active ? 500 : 400,
                        color: active ? '#fff' : 'rgba(255,255,255,0.65)',
                        background: active ? 'rgba(255,255,255,0.08)' : 'transparent',
                        cursor: 'pointer',
                        letterSpacing: -0.2,
                      }}>{y}</div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Month cards — stacked, each with a big watermark month name + colored ambient ring */}
        <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {months.map((m, i) => {
            const glow = ambientGlow(m.fitId);
            return (
            <div key={m.name}
              onClick={() => window.__archiveGo && window.__archiveGo('archive')}
              style={{
                position: 'relative',
                aspectRatio: '16/9',
                borderRadius: 24, padding: 6,
                background: '#0a0a0a',
                cursor: 'pointer',
              }}>
            <div className="archive-pressable lg-border-gradient"
              style={{
                position: 'relative', width: '100%', height: '100%',
                borderRadius: 19, overflow: 'hidden',
                background: fitBorder(m.fitId),
                '--grad-border': fitBorder(m.fitId),
                boxShadow:
                  `0 0 60px -10px ${glow}, ` +
                  `0 18px 40px -8px ${glow}, ` +
                  `0 8px 24px rgba(0,0,0,0.45), ` +
                  `inset 0 -60px 80px rgba(0,0,0,0.55), ` +
                  `inset 0 30px 60px rgba(0,0,0,0.25)`,
              }}>

              {/* Film grain */}
              <div style={{
                position: 'absolute', inset: 0,
                backgroundImage: 'url("data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22140%22 height=%22140%22><filter id=%22n%22><feTurbulence baseFrequency=%220.85%22 numOctaves=%222%22 stitchTiles=%22stitch%22/><feColorMatrix values=%220 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.5 0%22/></filter><rect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/></svg>")',
                opacity: 0.35, mixBlendMode: 'overlay', pointerEvents: 'none',
              }} />

              {/* Subtle bottom-darken so chrome reads better */}
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(to bottom, transparent 30%, rgba(12,10,8,0.35) 100%)',
                pointerEvents: 'none',
              }} />

              {/* HUGE watermark month name — clipped by the card overflow */}
              <div style={{
                position: 'absolute', left: 0, right: 0, top: '50%',
                transform: 'translateY(-50%)',
                textAlign: 'center', pointerEvents: 'none',
              }}>
                <div style={{
                  fontFamily: '"DM Sans", -apple-system, sans-serif',
                  fontSize: 'clamp(72px, 18vw, 130px)',
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                  letterSpacing: -4,
                  lineHeight: 0.85,
                  textShadow: '0 6px 28px rgba(0,0,0,0.45)',
                  whiteSpace: 'nowrap',
                  mixBlendMode: 'overlay',
                  filter: 'contrast(1.1)',
                }}>
                  {m.name}
                </div>
              </div>
              {/* Second pass — solid white for legibility on top of overlay layer */}
              <div style={{
                position: 'absolute', left: 0, right: 0, top: '50%',
                transform: 'translateY(-50%)',
                textAlign: 'center', pointerEvents: 'none',
              }}>
                <div style={{
                  fontFamily: '"DM Sans", -apple-system, sans-serif',
                  fontSize: 'clamp(72px, 18vw, 130px)',
                  fontWeight: 800,
                  color: 'var(--text-secondary)',
                  letterSpacing: -4,
                  lineHeight: 0.85,
                  whiteSpace: 'nowrap',
                }}>
                  {m.name}
                </div>
              </div>

              {/* Top-left — report count pill */}
              <div className="liquid-glass" style={{
                position: 'absolute', top: 12, left: 12,
                padding: '5px 12px', borderRadius: 100,
                fontSize: 11, color: 'var(--text-primary)', fontWeight: 500, letterSpacing: 0.2,
                zIndex: 3,
              }}>
                {m.count} fits
              </div>

              {/* Top-right — ··· menu */}
              <div className="liquid-glass archive-pressable" onClick={(e) => e.stopPropagation()} style={{
                position: 'absolute', top: 8, right: 8,
                width: 30, height: 30, borderRadius: 15,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', zIndex: 3,
              }}>
                <DotsMenu />
              </div>
            </div>
            </div>
            );
          })}
        </div>

        {/* Footer streak summary — keeps some of the original info */}
        <div style={{ padding: '28px 24px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill={t.light} stroke="none">
            <path d="M12 2c1 4-3 6-3 10a5 5 0 0 0 10 0c0-2-1-4-2-5 0 2-1 3-2 3 0-3-1-5-3-8z"/>
          </svg>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)', letterSpacing: 1, fontWeight: 500 }}>
            18 day streak · {year}
          </span>
        </div>

      </div>

      <TabBar active="archive" />
    </div>
  );
}
