import React from 'react';
import {
  useTheme, bgColor, fgColor,
  ArchiveBurger, StatusBar, Glass, TabBar, PhotoPlaceholder,
} from '../lib/shared.jsx';
import LiquidMesh from '../lib/liquid-mesh.jsx';

export default function ScreenArchive() {
  const t = useTheme();
  const accent = t.light;
  const accentHot = t.hot;
  const accentRgba = t.softRgba;
  const months = [
    { label: 'APRIL · 2026', fits: [
      { id: 24, n: '024', d: 'APR 26' },
      { id: 23, n: '023', d: 'APR 25' },
      { id: 22, n: '022', d: 'APR 23' },
      { id: 21, n: '021', d: 'APR 21' },
      { id: 20, n: '020', d: 'APR 19' },
      { id: 19, n: '019', d: 'APR 17' },
    ]},
    { label: 'MARCH · 2026', fits: [
      { id: 18, n: '018', d: 'MAR 30' },
      { id: 17, n: '017', d: 'MAR 28' },
      { id: 16, n: '016', d: 'MAR 24' },
      { id: 15, n: '015', d: 'MAR 19' },
      { id: 14, n: '014', d: 'MAR 14' },
      { id: 13, n: '013', d: 'MAR 11' },
      { id: 12, n: '012', d: 'MAR 07' },
      { id: 11, n: '011', d: 'MAR 02' },
      { id: 10, n: '010', d: 'MAR 01' },
    ]},
  ];

  const tags = ['All', 'Knit', 'Outerwear', 'Suede', 'Vintage', 'Studio', 'Evening'];

  return (
    <div style={{
      width: '100%', height: '100%', position: 'relative', overflow: 'hidden',
      background: bgColor(),
      fontFamily: 'DM Sans, -apple-system, system-ui, sans-serif',
      color: fgColor(),
    }}>
      <div style={{
        position: 'absolute', top: -240, left: '50%', transform: 'translateX(-50%)',
        width: 460, height: 460, borderRadius: '50%',
        background: `radial-gradient(circle, rgba(${accentRgba},0.18) 0%, transparent 60%)`,
        filter: 'blur(40px)', pointerEvents: 'none',
      }} />
      <LiquidMesh seed={1} intensity={1} />
      <StatusBar />

      <div style={{ position: 'relative', zIndex: 2, padding: 'calc(24px + var(--archive-safe-top, 0px)) 0 calc(120px + var(--archive-safe-bottom, 0px))', height: '100%', overflow: 'auto', boxSizing: 'border-box' }}>
        {(typeof window !== 'undefined' && window.__archiveEmpty) ? (
          <div style={{ padding: '0 24px', display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 30 }}>
              <ArchiveBurger />
              <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', fontWeight: 400 }}>0 fits</div>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, marginTop: -40 }}>
              <div style={{
                fontFamily: '"DM Sans", sans-serif', fontWeight: 700,
                fontSize: 44, color: '#fff', letterSpacing: -1.2, lineHeight: 1,
              }}>The archive</div>
              <div style={{
                fontFamily: 'Inter, sans-serif', fontWeight: 300,
                fontSize: 15, color: 'rgba(255,255,255,0.55)', letterSpacing: 0.1,
              }}>312 fits start with 1.</div>
              <button onClick={() => window.__archiveGo && window.__archiveGo('rating')} style={{
                marginTop: 12,
                padding: '11px 22px', borderRadius: 100,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.18)',
                color: 'rgba(255,255,255,0.92)',
                fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 400,
                letterSpacing: 0.1, cursor: 'pointer',
                backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
              }}>+ Log fit</button>
            </div>
          </div>
        ) : (
        <React.Fragment>
        <div style={{ padding: '0 24px', marginBottom: 18, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <ArchiveBurger />
            <div>
              <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.92)', fontWeight: 500, marginBottom: 6 }}>
                312 fits · 18 months
              </div>
              <div className="h-display" style={{ fontSize: 40 }}>
                The <em>archive</em>
              </div>
            </div>
          </div>
          <div style={{
            display: 'flex', padding: 3, borderRadius: 12,
            background: 'rgba(255,255,255,0.04)',
            boxShadow: 'inset 0 0 0 0.5px rgba(255,255,255,0.06)',
          }}>
            <div style={{
              width: 30, height: 28, borderRadius: 9,
              background: `linear-gradient(135deg, ${accent} 0%, ${accentHot} 100%)`,
              boxShadow: `0 0 10px rgba(${accentRgba},0.4)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
              </svg>
            </div>
            <div onClick={() => window.__archiveGo && window.__archiveGo('calendar')} style={{
              width: 30, height: 28, borderRadius: 9,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>
              </svg>
            </div>
          </div>
        </div>

        <div style={{ padding: '0 24px', marginBottom: 14 }}>
          <Glass radius={16} style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="1.8" strokeLinecap="round">
              <circle cx="11" cy="11" r="7"/><path d="M21 21l-4-4"/>
            </svg>
            <span style={{ flex: 1, fontSize: 15, color: 'rgba(255,255,255,0.92)' }}>Search by piece, color, mood…</span>
            <div style={{
              padding: '4px 9px', borderRadius: 6,
              background: 'rgba(255,255,255,0.06)',
              fontSize: 13, color: 'rgba(255,255,255,0.92)',
              fontFamily: '"DM Sans", sans-serif',
            }}>⌘K</div>
          </Glass>
        </div>

        <div style={{ display: 'flex', gap: 8, padding: '0 24px 4px', overflowX: 'auto', marginBottom: 24 }}>
          {tags.map((tag, i) => {
            const active = i === 0;
            return (
              <div key={tag} style={{
                padding: '9px 16px', borderRadius: 100, whiteSpace: 'nowrap',
                fontSize: 15, fontWeight: 500, letterSpacing: 0.1,
                background: active ? `linear-gradient(135deg, ${accent} 0%, ${accentHot} 100%)` : 'rgba(255,255,255,0.05)',
                color: active ? '#0a0a0a' : 'rgba(255,255,255,0.7)',
                boxShadow: active
                  ? `0 0 16px rgba(${accentRgba},0.4)`
                  : 'inset 0 0 0 0.5px rgba(255,255,255,0.08)',
              }}>{tag}</div>
            );
          })}
        </div>

        {months.map((m) => (
          <div key={m.label} style={{ marginBottom: 28 }}>
            <div style={{
              padding: '0 24px', marginBottom: 12,
              display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <span style={{ fontSize: 15, color: 'rgba(255,255,255,0.7)', fontWeight: 500, letterSpacing: 0.2 }}>
                {m.label}
              </span>
              <div style={{ flex: 1, height: 0.5, background: 'rgba(255,255,255,0.08)' }} />
              <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.92)', fontFamily: '"DM Sans", sans-serif' }}>
                {String(m.fits.length).padStart(2, '0')}
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, padding: '0 24px' }}>
              {m.fits.map(f => (
                <div key={f.id} onClick={() => window.__archiveGo && window.__archiveGo('detail')} style={{ position: 'relative', cursor: 'pointer' }}>
                  <PhotoPlaceholder ratio="3/4" radius={10} photoId={f.id} />
                  <div style={{
                    position: 'absolute', top: 6, left: 8,
                    fontSize: 9, color: 'rgba(255,255,255,0.92)',
                    fontFamily: '"DM Sans", sans-serif', letterSpacing: -0.25,
                  }}>#{f.n}</div>
                  <div style={{
                    position: 'absolute', bottom: 6, left: 8,
                    fontSize: 9.5, color: 'rgba(255,255,255,0.92)',
                    fontFamily: '"DM Sans", sans-serif', letterSpacing: -0.15,
                  }}>{f.d}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
        </React.Fragment>
        )}
      </div>

      <TabBar active="archive" />
    </div>
  );
}
