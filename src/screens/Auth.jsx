import React from 'react';

export default function ScreenAuth({ onContinue, onBack }) {
  return (
    <div style={{
      width: '100%', height: '100%', position: 'relative', overflow: 'hidden',
      background: '#0A0807',
      fontFamily: 'Inter, -apple-system, system-ui, sans-serif',
      color: '#F5F0E8',
    }}>
      {/* Subtle top glow */}
      <div style={{
        position: 'absolute', top: '-15%', left: '50%', transform: 'translateX(-50%)',
        width: '110%', height: '50%',
        background: 'radial-gradient(ellipse at center, rgba(155,184,159,0.18) 0%, transparent 70%)',
        filter: 'blur(60px)', pointerEvents: 'none',
      }} />

      {/* Back button */}
      <div
        onClick={onBack}
        className="archive-pressable liquid-glass"
        style={{
          position: 'absolute',
          top: 'calc(20px + var(--archive-safe-top, 0px))',
          left: 22,
          width: 38, height: 38, borderRadius: 19,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', zIndex: 10,
        }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#F5F0E8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 6l-6 6 6 6"/>
        </svg>
      </div>

      {/* Heading */}
      <div style={{
        padding: 'calc(110px + var(--archive-safe-top, 0px)) 28px 0',
      }}>
        <div style={{
          fontSize: 11, letterSpacing: 2.4, color: '#9BB89F',
          fontWeight: 500, marginBottom: 14,
        }}>
          SIGN IN
        </div>
        <div style={{
          fontSize: 40, fontWeight: 700, color: '#F5F0E8',
          letterSpacing: '-0.045em', lineHeight: 1.0, marginBottom: 12,
        }}>
          Welcome back
        </div>
        <div style={{
          fontSize: 15, color: 'rgba(245,240,232,0.6)',
          lineHeight: 1.5, letterSpacing: '-0.01em',
        }}>
          Sign in to access your archive.
        </div>
      </div>

      {/* Auth buttons */}
      <div style={{
        position: 'absolute',
        bottom: 'calc(28px + var(--archive-safe-bottom, 0px))',
        left: 24, right: 24,
        display: 'flex', flexDirection: 'column', gap: 10,
      }}>
        {/* Apple — primary */}
        <button
          onClick={onContinue}
          className="archive-pressable"
          style={{
            height: 54, borderRadius: 27,
            background: '#F5F0E8', color: '#0a0a0a',
            fontSize: 15, fontWeight: 600, letterSpacing: '-0.01em',
            border: 'none', cursor: 'pointer', fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
          }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#0a0a0a">
            <path d="M17.05 20.28c-.98.95-2.05.88-3.08.45-1.09-.45-2.09-.49-3.24 0-1.44.62-2.2.44-3.06-.45C2.79 15.16 3.5 7.4 9.05 7.13c1.35.07 2.29.74 3.08.79 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.27zM12.03 7.05c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
          </svg>
          Continue with Apple
        </button>

        {/* Google */}
        <button
          onClick={onContinue}
          className="archive-pressable liquid-glass"
          style={{
            height: 54, borderRadius: 27,
            color: '#F5F0E8',
            fontSize: 15, fontWeight: 600, letterSpacing: '-0.01em',
            border: 'none', cursor: 'pointer', fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          }}>
          <svg width="16" height="16" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        {/* Email */}
        <button
          onClick={onContinue}
          className="archive-pressable"
          style={{
            height: 54, borderRadius: 27,
            background: 'transparent',
            color: 'rgba(245,240,232,0.7)',
            fontSize: 14, fontWeight: 500, letterSpacing: '-0.01em',
            border: '1px solid rgba(245,240,232,0.18)',
            cursor: 'pointer', fontFamily: 'inherit',
          }}>
          Continue with email
        </button>

        {/* Create account link */}
        <div style={{
          textAlign: 'center', marginTop: 12,
          fontSize: 13, color: 'rgba(245,240,232,0.5)',
          letterSpacing: '-0.01em',
        }}>
          New here?{' '}
          <span
            onClick={onContinue}
            className="archive-pressable"
            style={{
              color: '#F5F0E8', fontWeight: 600,
              cursor: 'pointer', textDecoration: 'underline',
              textUnderlineOffset: 3,
            }}>
            Create account
          </span>
        </div>
      </div>
    </div>
  );
}
