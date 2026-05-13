import React from 'react';

export default function ScreenSplash({ onContinue, onSkip }) {
  const features = [
    { icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="7" width="18" height="14" rx="2"/><circle cx="12" cy="14" r="3.5"/><path d="M8 7l1.5-3h5L16 7"/>
      </svg>
    ), t: 'Log fits daily', s: 'One tap. One photo. Done.' },
    { icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 3h5v5M4 20l16-16M21 16v5h-5M14 14l7 7M3 4l5 5"/>
      </svg>
    ), t: 'AI Mix & Match', s: 'Smart combinations from your closet.' },
    { icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 20h18M6 20V10M11 20V4M16 20v-7M21 20v-3"/>
      </svg>
    ), t: 'Wardrobe insights', s: 'Color trends, wear analytics, streaks.' },
  ];

  return (
    <div style={{
      width: '100%', height: '100%', position: 'relative', overflow: 'hidden',
      backgroundImage: "url('/backgrounds/bg-ember.png')",
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      fontFamily: 'Inter, -apple-system, system-ui, sans-serif',
    }}>
      {/* Darken for legibility */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.15) 35%, rgba(0,0,0,0.70) 100%)',
        pointerEvents: 'none',
      }} />

      {/* Skip → dashboard */}
      <div
        onClick={onSkip}
        className="archive-pressable"
        style={{
          position: 'absolute',
          top: 'calc(20px + var(--archive-safe-top, 54px))',
          right: 22,
          padding: '7px 14px', borderRadius: 100,
          fontSize: 12, fontWeight: 500, color: '#fff',
          background: 'rgba(0,0,0,0.35)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.15)',
          cursor: 'pointer', zIndex: 10,
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
        Skip
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14M13 6l6 6-6 6"/>
        </svg>
      </div>

      {/* Title block */}
      <div style={{
        position: 'absolute',
        top: 'calc(80px + var(--archive-safe-top, 54px))',
        left: 28, right: 28,
        zIndex: 5,
      }}>
        <div style={{
          fontSize: 10, letterSpacing: '0.35em', color: 'rgba(255,255,255,0.75)',
          fontWeight: 500, marginBottom: 16, textTransform: 'uppercase',
          textShadow: '0 1px 6px rgba(0,0,0,0.5)',
        }}>
          AĒVUM · Edition Noire
        </div>
        <div className="inter-light-display" style={{
          fontSize: 52, color: '#fff',
          lineHeight: 0.98, marginBottom: 16,
          textShadow: '0 2px 14px rgba(0,0,0,0.5)',
        }}>
          Your daily<br/>fit story.
        </div>
        <div className="inter-light" style={{
          fontSize: 15, color: 'rgba(255,255,255,0.9)',
          lineHeight: 1.55, maxWidth: 300,
          textShadow: '0 1px 6px rgba(0,0,0,0.4)',
        }}>
          One photo a day. Every fit, remembered — with AI matching, style insights, and a private wardrobe archive.
        </div>
      </div>

      {/* Feature cards */}
      <div style={{
        position: 'absolute',
        bottom: 'calc(180px + var(--archive-safe-bottom, 0px))',
        left: 22, right: 22,
        display: 'flex', flexDirection: 'column', gap: 8,
        zIndex: 5,
      }}>
        {features.map((f, i) => (
          <div key={i} className="lg-card" style={{
            padding: '11px 14px', borderRadius: 14,
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <div style={{
              width: 30, height: 30, borderRadius: 15,
              background: 'rgba(255,255,255,0.14)',
              border: '1px solid rgba(255,255,255,0.22)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              {f.icon}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, color: '#fff', fontWeight: 600, letterSpacing: '-0.01em' }}>{f.t}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 1 }}>{f.s}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Get Started */}
      <button
        onClick={onContinue}
        className="archive-pressable"
        style={{
          position: 'absolute',
          bottom: 'calc(54px + var(--archive-safe-bottom, 0px))',
          left: 22, right: 22,
          height: 54, borderRadius: 27,
          background: '#F5F0E8', color: '#0a0a0a',
          fontSize: 15, fontWeight: 600,
          letterSpacing: '-0.01em',
          border: 'none', cursor: 'pointer',
          fontFamily: 'inherit',
          boxShadow: '0 12px 30px rgba(0,0,0,0.5)',
          zIndex: 5,
        }}>
        Get Started
      </button>

      {/* Terms */}
      <div style={{
        position: 'absolute',
        bottom: 'calc(22px + var(--archive-safe-bottom, 0px))',
        left: 0, right: 0,
        textAlign: 'center',
        fontSize: 11, color: 'rgba(255,255,255,0.55)',
        letterSpacing: '-0.01em',
        pointerEvents: 'none',
        textShadow: '0 1px 4px rgba(0,0,0,0.4)',
        zIndex: 5,
      }}>
        By continuing, you agree to <span style={{ textDecoration: 'underline' }}>Terms</span> & <span style={{ textDecoration: 'underline' }}>Conditions</span>
      </div>
    </div>
  );
}
