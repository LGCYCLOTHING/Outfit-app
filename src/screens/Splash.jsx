import React from 'react';

export default function ScreenSplash({ onContinue }) {
  return (
    <div style={{
      width: '100%', height: '100%', position: 'relative', overflow: 'hidden',
      background: 'linear-gradient(180deg, #2a2218 0%, #1a1410 35%, #0a0805 100%)',
      fontFamily: 'Inter, -apple-system, system-ui, sans-serif',
    }}>
      {/* Top warm glow */}
      <div style={{
        position: 'absolute', top: '-15%', left: '50%', transform: 'translateX(-50%)',
        width: '110%', height: '60%',
        background: 'radial-gradient(ellipse at center, rgba(200,149,108,0.35) 0%, transparent 70%)',
        filter: 'blur(50px)', pointerEvents: 'none',
      }} />

      {/* Bottom dim anchor */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '40%',
        background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 100%)',
        pointerEvents: 'none',
      }} />

      {/* Centered content */}
      <div style={{
        position: 'absolute', inset: 0,
        padding: 'calc(140px + var(--archive-safe-top, 54px)) 30px 0',
        display: 'flex', flexDirection: 'column',
      }}>
        <div style={{
          fontSize: 11, letterSpacing: '0.3em', color: '#C8956C',
          fontWeight: 600, marginBottom: 22,
        }}>
          ARCHIVE
        </div>
        <div style={{
          fontFamily: '"Inter", sans-serif',
          fontSize: 52, fontWeight: 700, color: '#F5F0E8',
          lineHeight: 1.0, letterSpacing: '-0.045em', marginBottom: 18,
        }}>
          Your daily<br/>fit story.
        </div>
        <div style={{
          fontSize: 15, color: 'rgba(245,240,232,0.65)',
          lineHeight: 1.5, letterSpacing: '-0.01em', maxWidth: 280,
        }}>
          One photo a day. Every fit, remembered.
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={onContinue}
        className="archive-pressable"
        style={{
          position: 'absolute',
          bottom: 'calc(54px + var(--archive-safe-bottom, 0px))',
          left: 24, right: 24,
          height: 54, borderRadius: 27,
          background: '#F5F0E8', color: '#0a0a0a',
          fontSize: 15, fontWeight: 600,
          letterSpacing: '-0.01em',
          border: 'none', cursor: 'pointer',
          fontFamily: 'inherit',
          boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
        }}>
        Get Started
      </button>

      {/* Terms */}
      <div style={{
        position: 'absolute',
        bottom: 'calc(20px + var(--archive-safe-bottom, 0px))',
        left: 0, right: 0,
        textAlign: 'center',
        fontSize: 11, color: 'rgba(245,240,232,0.45)',
        letterSpacing: '-0.01em',
        pointerEvents: 'none',
      }}>
        By continuing, you agree to <span style={{ textDecoration: 'underline' }}>Terms</span> & <span style={{ textDecoration: 'underline' }}>Conditions</span>
      </div>
    </div>
  );
}
