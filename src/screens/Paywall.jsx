import React from 'react';
import { useTheme, StatusBar } from '../lib/shared.jsx';

export default function ScreenPaywall() {
  const [yearly, setYearly] = React.useState(true);
  const t = useTheme();
  const accent = t.light;
  const accentHot = t.hot;
  const accentRgba = t.softRgba;

  const features = [
    { title: 'Unlimited AI combos',     sub: 'Daily mix & match across your full archive', icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 3h5v5M4 20l16-16M21 16v5h-5M14 14l7 7M3 4l5 5"/>
      </svg>
    )},
    { title: 'Unlimited photo archive', sub: 'Free is capped at 30 fits/month', icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>
      </svg>
    )},
    { title: 'Weather-aware picks',     sub: 'Picks adjust to forecast & calendar', icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="4"/><path d="M12 3v1.5M12 19.5V21M3 12h1.5M19.5 12H21M5.6 5.6l1 1M17.4 17.4l1 1M5.6 18.4l1-1M17.4 6.6l1-1"/>
      </svg>
    )},
    { title: 'Style trends & analytics', sub: 'Color, palette & fabric breakdowns', icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 20h18M6 20V10M11 20V4M16 20v-7M21 20v-3"/>
      </svg>
    )},
    { title: 'Export & private share',  sub: 'High-res lookbook PDFs', icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3v12M7 8l5-5 5 5M5 21h14"/>
      </svg>
    )},
  ];

  return (
    <div style={{
      width: '100%', height: '100%', position: 'relative', overflow: 'hidden',
      backgroundImage: "url('/backgrounds/bg-dusk.png')",
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      fontFamily: 'Inter, -apple-system, system-ui, sans-serif',
      color: 'var(--text-primary)',
    }}>
      {/* Darken for legibility */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.2) 30%, rgba(0,0,0,0.75) 100%)',
        pointerEvents: 'none',
      }} />

      <StatusBar />

      {/* Close — top right */}
      <div onClick={() => window.__archiveGo && window.__archiveGo('you')}
        className="archive-pressable"
        style={{
          position: 'absolute',
          top: 'calc(20px + var(--archive-safe-top, 54px))', right: 22,
          width: 36, height: 36, borderRadius: 18,
          background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.18)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', zIndex: 30,
        }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round">
          <path d="M6 6l12 12M18 6L6 18"/>
        </svg>
      </div>

      <div style={{
        position: 'relative', zIndex: 2,
        padding: 'calc(40px + var(--archive-safe-top, 54px)) 22px calc(24px + var(--archive-safe-bottom, 0px))',
        height: '100%', overflow: 'auto', boxSizing: 'border-box',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* App logo */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 18 }}>
          <div style={{
            width: 78, height: 78, borderRadius: 20,
            overflow: 'hidden', position: 'relative',
            boxShadow: '0 20px 40px -8px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.22)',
          }}>
            <img src="/icons/icon-ivory-mark.png" alt="" style={{
              width: '100%', height: '100%', objectFit: 'cover', display: 'block',
            }} />
          </div>
        </div>

        {/* Eyebrow + headline */}
        <div style={{ textAlign: 'center', marginBottom: 14 }}>
          <div style={{
            fontSize: 10, letterSpacing: '0.35em', color: 'rgba(255,255,255,0.7)',
            marginBottom: 12, textTransform: 'uppercase',
            textShadow: '0 1px 4px rgba(0,0,0,0.4)',
          }}>
            AĒVUM PRO
          </div>
          <div className="inter-light-display" style={{
            fontSize: 36, color: '#fff',
            lineHeight: 1.05, marginBottom: 12,
            textShadow: '0 2px 14px rgba(0,0,0,0.5)',
          }}>
            Every fit. <em style={{ fontStyle: 'italic' }}>Endlessly</em><br/>remixed.
          </div>
          <div className="inter-light" style={{
            fontSize: 14, color: 'rgba(255,255,255,0.85)',
            lineHeight: 1.5, maxWidth: 300, margin: '0 auto',
            textShadow: '0 1px 4px rgba(0,0,0,0.4)',
          }}>
            AI-powered styling on your own wardrobe.
          </div>
        </div>

        {/* Features */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 22, marginBottom: 20 }}>
          {features.map((f, i) => (
            <div key={i} className="lg-card" style={{
              padding: '11px 14px', borderRadius: 14,
              display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: 10,
                background: `rgba(${accentRgba},0.28)`,
                border: `1px solid rgba(${accentRgba},0.5)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: accent, flexShrink: 0,
              }}>
                {f.icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, color: '#fff', letterSpacing: '-0.01em', fontWeight: 600 }}>
                  {f.title}
                </div>
                <div className="inter-light" style={{
                  fontSize: 11.5, color: 'rgba(255,255,255,0.75)',
                  lineHeight: 1.35, marginTop: 1,
                }}>
                  {f.sub}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Plan toggle */}
        <div className="lg-card" style={{
          padding: 6, display: 'flex', gap: 4, marginBottom: 16, borderRadius: 16,
        }}>
          {[
            { id: 'monthly', label: 'Monthly', price: '$6.99', sub: 'per month' },
            { id: 'yearly',  label: 'Yearly',  price: '$39.99', sub: 'save 52%' },
          ].map(p => {
            const isActive = (yearly && p.id === 'yearly') || (!yearly && p.id === 'monthly');
            return (
              <div key={p.id} onClick={() => setYearly(p.id === 'yearly')}
                style={{
                  flex: 1, padding: '12px 14px', borderRadius: 12, cursor: 'pointer',
                  position: 'relative',
                  background: isActive
                    ? `linear-gradient(135deg, ${accent} 0%, ${accentHot} 100%)`
                    : 'rgba(0,0,0,0.25)',
                  boxShadow: isActive
                    ? `0 6px 18px -4px rgba(${accentRgba},0.55)`
                    : 'inset 0 0 0 1px rgba(255,255,255,0.08)',
                  transition: 'all .2s',
                }}>
                {p.id === 'yearly' && (
                  <div style={{
                    position: 'absolute', top: -8, right: 10,
                    padding: '3px 8px', borderRadius: 100,
                    background: '#fff',
                    fontSize: 8.5, color: '#0a0a0a', fontWeight: 700, letterSpacing: 1.2,
                    boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
                  }}>BEST VALUE</div>
                )}
                <div style={{
                  fontSize: 10, color: isActive ? '#0a0a0a' : 'rgba(255,255,255,0.7)',
                  fontWeight: 600, marginBottom: 4, letterSpacing: 1.2,
                }}>
                  {p.label.toUpperCase()}
                </div>
                <div style={{
                  fontSize: 22, letterSpacing: '-0.04em',
                  color: isActive ? '#0a0a0a' : '#fff',
                }}>
                  {p.price}
                </div>
                <div className="inter-light" style={{
                  fontSize: 11, marginTop: 1,
                  color: isActive ? 'rgba(10,10,10,0.7)' : 'rgba(255,255,255,0.65)',
                }}>
                  {p.sub}
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <button onClick={() => {
          if (window.__archiveFinishOnboarding) window.__archiveFinishOnboarding();
          else if (window.__archiveGo) window.__archiveGo('you');
        }} style={{
          width: '100%', height: 56, borderRadius: 28, border: 'none', cursor: 'pointer',
          background: '#F5F0E8',
          boxShadow: '0 12px 30px rgba(0,0,0,0.45)',
          color: '#0a0a0a', fontSize: 15, fontWeight: 600, letterSpacing: '-0.01em',
          fontFamily: 'inherit',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          Start 7-day free trial
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M13 6l6 6-6 6"/>
          </svg>
        </button>

        {/* Fine print */}
        <div className="inter-light" style={{
          textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.7)',
          marginTop: 12, lineHeight: 1.5,
          textShadow: '0 1px 4px rgba(0,0,0,0.4)',
        }}>
          Free for 7 days, then {yearly ? '$39.99/year' : '$6.99/month'}.<br/>
          Cancel anytime · Restore purchase
        </div>

        {/* Maybe later — visible skip */}
        <div
          onClick={() => {
            if (window.__archiveFinishOnboarding) window.__archiveFinishOnboarding();
            else if (window.__archiveGo) window.__archiveGo('today');
          }}
          className="archive-pressable"
          style={{
            textAlign: 'center', marginTop: 14, padding: '8px 0',
            fontSize: 13, color: 'rgba(255,255,255,0.85)',
            fontWeight: 500, cursor: 'pointer', letterSpacing: '-0.01em',
            textDecoration: 'underline', textUnderlineOffset: 4,
            textShadow: '0 1px 4px rgba(0,0,0,0.4)',
          }}
        >
          Maybe later
        </div>
      </div>
    </div>
  );
}
