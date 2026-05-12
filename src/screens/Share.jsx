import React from 'react';
import { useTheme, bgColor, fgColor, StatusBar, FitPhoto } from '../lib/shared.jsx';
import LiquidMesh from '../lib/liquid-mesh.jsx';

export default function ScreenShare() {
  const t = useTheme();
  const accent = t.light;
  const accentHot = t.hot;
  const accentRgba = t.softRgba;

  const [variant, setVariant] = React.useState('dark');

  function ShareCard({ style = 'dark', size = 'large' }) {
    const isDark = style === 'dark';
    return (
      <div style={{
        position: 'relative', width: '100%', aspectRatio: '4/5',
        borderRadius: size === 'large' ? 24 : 14,
        overflow: 'hidden',
        background: isDark ? '#080705' : '#f4ede0',
        boxShadow: size === 'large'
          ? `0 30px 60px -15px rgba(0,0,0,0.7), 0 0 40px rgba(${accentRgba},0.25)`
          : '0 8px 20px -6px rgba(0,0,0,0.6)',
      }}>
        <div style={{
          position: 'absolute',
          top: size === 'large' ? 60 : 32,
          left: size === 'large' ? 36 : 18,
          right: size === 'large' ? 36 : 18,
          bottom: size === 'large' ? 90 : 48,
          borderRadius: size === 'large' ? 14 : 8,
          overflow: 'hidden',
        }}>
          <FitPhoto id={23} ratio="4/5" radius={size === 'large' ? 14 : 8} showNumber={false} />
        </div>

        {isDark && (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(80% 60% at 50% 50%, transparent 50%, rgba(0,0,0,0.45) 100%)',
            pointerEvents: 'none',
          }} />
        )}

        <div style={{
          position: 'absolute',
          top: size === 'large' ? 24 : 12,
          left: size === 'large' ? 36 : 18,
          fontSize: size === 'large' ? 13 : 7,
          fontWeight: 500, letterSpacing: size === 'large' ? 4 : 2.2,
          color: isDark ? '#fff' : '#1a1612',
          fontFamily: '"DM Sans", sans-serif',
        }}>AĒVUM</div>

        <div style={{
          position: 'absolute',
          top: size === 'large' ? 24 : 12,
          right: size === 'large' ? 36 : 18,
          fontSize: size === 'large' ? 11 : 6,
          fontFamily: '"DM Sans", sans-serif',
          letterSpacing: size === 'large' ? 1.5 : 0.8,
          color: isDark ? 'rgba(255,255,255,0.55)' : 'rgba(26,22,18,0.55)',
        }}>FIT 023</div>

        <div style={{
          position: 'absolute',
          bottom: size === 'large' ? 28 : 14,
          left: size === 'large' ? 36 : 18,
        }}>
          <div style={{
            fontSize: size === 'large' ? 18 : 10,
            fontWeight: 400,
            color: isDark ? '#fff' : '#1a1612',
            fontFamily: 'Cormorant Garamond, serif',
            fontStyle: 'italic',
            lineHeight: 1.1,
          }}>April 27, 2026</div>
          <div style={{
            fontSize: size === 'large' ? 11 : 6.5,
            fontFamily: '"DM Sans", sans-serif',
            letterSpacing: size === 'large' ? 1 : 0.5,
            color: isDark ? 'rgba(255,255,255,0.55)' : 'rgba(26,22,18,0.55)',
            marginTop: size === 'large' ? 4 : 2,
          }}>61° · CLEAR · BROOKLYN</div>
        </div>

        <div style={{
          position: 'absolute',
          bottom: size === 'large' ? 28 : 14,
          right: size === 'large' ? 36 : 18,
          textAlign: 'right',
        }}>
          <div style={{
            fontSize: size === 'large' ? 28 : 14,
            fontWeight: 300, letterSpacing: -0.5,
            fontFamily: 'Cormorant Garamond, serif',
            fontStyle: 'italic',
            color: isDark ? accent : '#1a1612',
            lineHeight: 1,
          }}>023</div>
          <div style={{
            fontSize: size === 'large' ? 9 : 5.5,
            fontFamily: '"DM Sans", sans-serif',
            letterSpacing: size === 'large' ? 1.2 : 0.6,
            color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(26,22,18,0.45)',
            marginTop: 3,
          }}>OF 312</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      width: '100%', height: '100%', position: 'relative', overflow: 'hidden',
      background: bgColor(),
      fontFamily: 'DM Sans, -apple-system, system-ui, sans-serif',
      color: fgColor(),
    }}>
      <div style={{
        position: 'absolute', top: -180, left: '50%', transform: 'translateX(-50%)',
        width: 480, height: 480, borderRadius: '50%',
        background: `radial-gradient(circle, rgba(${accentRgba},0.20) 0%, transparent 60%)`,
        filter: 'blur(40px)', pointerEvents: 'none',
      }} />
      <LiquidMesh seed={8} intensity={1} />
      <StatusBar />

      <div style={{ position: 'relative', zIndex: 2, padding: 'calc(24px + var(--archive-safe-top, 54px)) 24px calc(40px + var(--archive-safe-bottom, 0px))', height: '100%', overflow: 'auto', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
          <div className="liquid-glass" onClick={() => window.__archiveGo && window.__archiveGo('today')} style={{
            width: 36, height: 36, borderRadius: 18,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 6l12 12M18 6L6 18"/>
            </svg>
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-primary)', letterSpacing: -0.40, fontFamily: '"DM Sans", sans-serif' }}>
            SHARE CARD
          </div>
          <div style={{ width: 36 }} />
        </div>

        <div style={{ marginBottom: 26 }}>
          <ShareCard style={variant} size="large" />
        </div>

        <div style={{ marginBottom: 22 }}>
          <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', letterSpacing: -0.4, fontFamily: '"DM Sans", sans-serif', marginBottom: 12 }}>
            STYLE
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <div onClick={() => setVariant('dark')} style={{
              flex: 1, cursor: 'pointer',
              padding: 8, borderRadius: 14,
              background: variant === 'dark' ? `rgba(${accentRgba},0.12)` : 'rgba(255,255,255,0.03)',
              boxShadow: variant === 'dark'
                ? `inset 0 0 0 1px rgba(${accentRgba},0.5)`
                : 'inset 0 0 0 0.5px rgba(255,255,255,0.06)',
            }}>
              <div style={{ width: '60%', margin: '0 auto' }}>
                <ShareCard style="dark" size="small" />
              </div>
              <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 15, fontWeight: 500 }}>Dark</span>
                {variant === 'dark' && (
                  <div style={{
                    width: 16, height: 16, borderRadius: 8, background: accent,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12l5 5L20 7"/>
                    </svg>
                  </div>
                )}
              </div>
            </div>

            <div onClick={() => setVariant('clean')} style={{
              flex: 1, cursor: 'pointer', position: 'relative',
              padding: 8, borderRadius: 14,
              background: variant === 'clean' ? `rgba(${accentRgba},0.12)` : 'rgba(255,255,255,0.03)',
              boxShadow: variant === 'clean'
                ? `inset 0 0 0 1px rgba(${accentRgba},0.5)`
                : 'inset 0 0 0 0.5px rgba(255,255,255,0.06)',
            }}>
              <div style={{ width: '60%', margin: '0 auto' }}>
                <ShareCard style="clean" size="small" />
              </div>
              <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 15, fontWeight: 500 }}>Clean</span>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  padding: '2px 7px', borderRadius: 6,
                  background: `linear-gradient(135deg, ${accent} 0%, ${accentHot} 100%)`,
                }}>
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="#0a0a0a" stroke="none">
                    <path d="M12 2l3 6 6 1-4 4 1 6-6-3-6 3 1-6-4-4 6-1z"/>
                  </svg>
                  <span style={{ fontSize: 9, fontWeight: 500, color: '#0a0a0a', letterSpacing: -0.13 }}>PRO</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <button style={{
          width: '100%', border: 'none', cursor: 'pointer',
          padding: '15px 22px', borderRadius: 100,
          background: `linear-gradient(135deg, ${accent} 0%, ${accentHot} 100%)`,
          color: '#0a0a0a', fontSize: 15, fontWeight: 500,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7M16 6l-4-4-4 4M12 2v14"/>
          </svg>
          Share fit
        </button>

        <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-primary)', marginTop: 12 }}>
          Saves to camera roll · share to anywhere
        </div>
      </div>
    </div>
  );
}
