import React from 'react';
import { useTheme, bgColor, fgColor, StatusBar, TabBar, fitGradient } from '../lib/shared.jsx';
import LiquidMesh from '../lib/liquid-mesh.jsx';

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

  return (
    <div style={{
      width: '100%', height: '100%', position: 'relative', overflow: 'hidden',
      background: bgColor(),
      fontFamily: 'DM Sans, -apple-system, system-ui, sans-serif',
      color: fgColor(),
    }}>
      <LiquidMesh seed={7} intensity={0.7} />
      <StatusBar />

      <div style={{ position: 'relative', zIndex: 2, padding: 'calc(20px + var(--archive-safe-top, 0px)) 0 calc(120px + var(--archive-safe-bottom, 0px))', height: '100%', overflow: 'auto', boxSizing: 'border-box' }}>

        {/* Header — year selector + calendar icon */}
        <div style={{ padding: '0 22px', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div onClick={() => setYear(y => y - 1)} className="archive-pressable" style={{
            display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer',
          }}>
            <span style={{ fontSize: 26, color: '#F5F0E8', fontWeight: 500, letterSpacing: -0.4 }}>
              {year}
            </span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(245,240,232,0.75)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 9l6 6 6-6"/>
            </svg>
          </div>
          <div onClick={() => window.__archiveGo && window.__archiveGo('archive')} className="liquid-glass archive-pressable" style={{
            width: 38, height: 38, borderRadius: 19,
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F5F0E8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="5" width="18" height="16" rx="2"/>
              <path d="M3 10h18M8 3v4M16 3v4"/>
            </svg>
          </div>
        </div>

        {/* Month cards — stacked, each with a big watermark month name over a warm gradient */}
        <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {months.map((m, i) => (
            <div key={m.name}
              onClick={() => window.__archiveGo && window.__archiveGo('archive')}
              className="archive-pressable"
              style={{
                position: 'relative',
                aspectRatio: '16/9',
                borderRadius: 22,
                overflow: 'hidden',
                background: fitGradient(m.fitId),
                boxShadow: '0 8px 24px rgba(0,0,0,0.45), inset 0 1px 0 rgba(245,240,232,0.08), inset 0 -1px 0 rgba(0,0,0,0.25)',
                cursor: 'pointer',
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
                  color: 'rgba(245,240,232,0.94)',
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
                  color: 'rgba(245,240,232,0.6)',
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
                fontSize: 11, color: '#F5F0E8', fontWeight: 500, letterSpacing: 0.2,
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
          ))}
        </div>

        {/* Footer streak summary — keeps some of the original info */}
        <div style={{ padding: '28px 24px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill={t.light} stroke="none">
            <path d="M12 2c1 4-3 6-3 10a5 5 0 0 0 10 0c0-2-1-4-2-5 0 2-1 3-2 3 0-3-1-5-3-8z"/>
          </svg>
          <span style={{ fontSize: 12, color: 'rgba(245,240,232,0.6)', letterSpacing: 1, fontWeight: 500 }}>
            18 day streak · {year}
          </span>
        </div>

      </div>

      <TabBar active="archive" />
    </div>
  );
}
