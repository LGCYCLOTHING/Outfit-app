import React from 'react';
import { useTheme, bgColor, fgColor, StatusBar, Glass } from '../lib/shared.jsx';
import LiquidMesh from '../lib/liquid-mesh.jsx';

export default function ScreenPaywall() {
  const [yearly, setYearly] = React.useState(true);
  const t = useTheme();
  const accent = t.light;
  const accentHot = t.hot;
  const accentDeep = t.deep;
  const accentRgba = t.softRgba;

  const features = [
    { title: 'Unlimited AI combos', sub: 'Daily mix & match across your full archive', icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2l2.5 5L20 8l-4 4 1 5.5L12 15l-5 2.5L8 12 4 8l5.5-1z"/>
      </svg>
    )},
    { title: 'Unlimited photo archive', sub: 'Free is capped at 30 fits/month', icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>
      </svg>
    )},
    { title: 'Weather-aware picks', sub: 'Picks adjust to forecast & calendar', icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="4"/><path d="M12 3v1.5M12 19.5V21M3 12h1.5M19.5 12H21M5.6 5.6l1 1M17.4 17.4l1 1M5.6 18.4l1-1M17.4 6.6l1-1"/>
      </svg>
    )},
    { title: 'Style trends & analytics', sub: 'Color, palette & fabric breakdowns', icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 20h18M6 20V10M11 20V4M16 20v-7M21 20v-3"/>
      </svg>
    )},
    { title: 'Export & private share', sub: 'High-res lookbook PDFs', icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3v12M7 8l5-5 5 5M5 21h14"/>
      </svg>
    )},
  ];

  return (
    <div style={{
      width: '100%', height: '100%', position: 'relative', overflow: 'hidden',
      background: bgColor(),
      fontFamily: 'DM Sans, -apple-system, system-ui, sans-serif',
      color: fgColor(),
    }}>
      <div style={{
        position: 'absolute', top: -120, left: '50%', transform: 'translateX(-50%)',
        width: 700, height: 500, borderRadius: '50%',
        background: `radial-gradient(circle, rgba(${accentRgba},0.5) 0%, rgba(${accentRgba},0.18) 35%, transparent 65%)`,
        filter: 'blur(40px)', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', top: 220, left: '50%', transform: 'translateX(-50%)',
        width: 500, height: 300, borderRadius: '50%',
        background: `radial-gradient(ellipse, rgba(${accentRgba},0.22) 0%, transparent 70%)`,
        filter: 'blur(40px)', pointerEvents: 'none',
      }} />
      <LiquidMesh seed={3} intensity={1.1} />

      <StatusBar />

      <div onClick={() => window.__archiveGo && window.__archiveGo('you')} style={{ position: 'absolute', top: 22, right: 22, zIndex: 30, cursor: 'pointer' }}>
        <div className="liquid-glass" style={{
          width: 32, height: 32, borderRadius: 16,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.8" strokeLinecap="round">
            <path d="M2 2l8 8M10 2l-8 8"/>
          </svg>
        </div>
      </div>

      <div style={{ position: 'relative', zIndex: 2, padding: 'calc(50px + var(--archive-safe-top, 54px)) 24px calc(30px + var(--archive-safe-bottom, 0px))', height: '100%', overflow: 'auto', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 22 }}>
          <div style={{
            width: 88, height: 88, borderRadius: 28,
            background: `linear-gradient(135deg, ${accent} 0%, ${accentHot} 50%, ${accentDeep} 100%)`,
            boxShadow: `inset 0 1px 0 rgba(255,255,255,0.4)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative',
          }}>
            <div style={{
              position: 'absolute', inset: 4, borderRadius: 24,
              boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.4), inset 0 -2px 4px rgba(0,0,0,0.2)',
            }} />
            <svg width="40" height="40" viewBox="0 0 24 24" fill="#0a0a0a">
              <path d="M12 1l2.5 6L21 8l-5 4.5L17.5 19 12 16l-5.5 3L8 12.5 3 8l6.5-1z"/>
            </svg>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginBottom: 6 }}>
          <div style={{ fontSize: 13, color: accent, letterSpacing: -0.50, fontFamily: '"DM Sans", sans-serif', marginBottom: 8 }}>
            AĒVUM PRO
          </div>
          <div style={{ fontSize: 30, fontWeight: 300, letterSpacing: -0.5, lineHeight: 1.1 }}>
            Every fit. <span style={{ fontStyle: 'italic', fontWeight: 400 }}>Endlessly</span><br/>
            remixed.
          </div>
        </div>
        <div style={{ textAlign: 'center', fontSize: 15, color: 'rgba(255,255,255,0.92)', marginTop: 10, marginBottom: 24, lineHeight: 1.5 }}>
          AI-powered styling on your own wardrobe.
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 22 }}>
          {features.map((f, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 11,
                background: `rgba(${accentRgba},0.10)`,
                boxShadow: `inset 0 0 0 0.5px rgba(${accentRgba},0.25)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: accent, flexShrink: 0,
              }}>
                {f.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 2 }}>{f.title}</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.92)', lineHeight: 1.3 }}>{f.sub}</div>
              </div>
            </div>
          ))}
        </div>

        <Glass radius={16} style={{ padding: 5, display: 'flex', gap: 4, marginBottom: 14 }}>
          {[
            { id: 'monthly', label: 'Monthly', price: '$6.99', sub: 'per month' },
            { id: 'yearly', label: 'Yearly', price: '$39.99', sub: 'per year · save 52%' },
          ].map(p => {
            const isActive = (yearly && p.id === 'yearly') || (!yearly && p.id === 'monthly');
            return (
              <div key={p.id}
                onClick={() => setYearly(p.id === 'yearly')}
                style={{
                  flex: 1, padding: '12px 14px', borderRadius: 12, cursor: 'pointer',
                  position: 'relative',
                  background: isActive
                    ? `linear-gradient(135deg, rgba(${accentRgba},0.18) 0%, rgba(${accentRgba},0.10) 100%)`
                    : 'transparent',
                  boxShadow: isActive ? `inset 0 0 0 1px ${accent}` : 'none',
                  transition: 'all .2s',
                }}>
                {p.id === 'yearly' && (
                  <div style={{
                    position: 'absolute', top: -8, right: 10,
                    padding: '2px 7px', borderRadius: 100,
                    background: `linear-gradient(135deg, ${accent} 0%, ${accentHot} 100%)`,
                    fontSize: 9, color: '#0a0a0a', fontWeight: 500, letterSpacing: -0.13,
                  }}>BEST VALUE</div>
                )}
                <div style={{ fontSize: 13, color: isActive ? accent : 'rgba(255,255,255,0.55)', fontWeight: 500, marginBottom: 4, letterSpacing: 0.4 }}>
                  {p.label.toUpperCase()}
                </div>
                <div style={{ fontSize: 19, fontWeight: 500, letterSpacing: -0.3, color: isActive ? '#fff' : 'rgba(255,255,255,0.85)' }}>
                  {p.price}
                </div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.92)', marginTop: 2 }}>
                  {p.sub}
                </div>
              </div>
            );
          })}
        </Glass>

        <div style={{ flex: 1 }} />

        <button onClick={() => {
          // Finish onboarding if in flow, otherwise return to You
          if (window.__archiveFinishOnboarding) window.__archiveFinishOnboarding();
          else if (window.__archiveGo) window.__archiveGo('you');
        }} style={{
          width: '100%', height: 56, borderRadius: 28, border: 'none', cursor: 'pointer',
          background: `linear-gradient(135deg, ${accent} 0%, ${accentHot} 100%)`,
          boxShadow: `inset 0 1px 0 rgba(255,255,255,0.4)`,
          color: '#0a0a0a', fontSize: 16, fontWeight: 500, letterSpacing: 0.2,
          fontFamily: 'inherit',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          Start 7-day free trial
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M5 12h14M13 6l6 6-6 6"/>
          </svg>
        </button>

        <div style={{ textAlign: 'center', fontSize: 13, color: 'rgba(255,255,255,0.92)', marginTop: 14, lineHeight: 1.5 }}>
          Free for 7 days, then {yearly ? '$39.99/year' : '$6.99/month'}.<br/>
          Cancel anytime · Restore purchase
        </div>

        {/* Maybe later — visible skip for the onboarding flow */}
        <div
          onClick={() => {
            if (window.__archiveFinishOnboarding) window.__archiveFinishOnboarding();
            else if (window.__archiveGo) window.__archiveGo('today');
          }}
          className="archive-pressable"
          style={{
            textAlign: 'center', marginTop: 18, padding: '8px 0',
            fontSize: 14, color: 'rgba(245,240,232,0.55)',
            fontWeight: 500, cursor: 'pointer', letterSpacing: '-0.01em',
          }}
        >
          Maybe later
        </div>
      </div>
    </div>
  );
}
