import React from 'react';
import { useTheme, StatusBar, FitPhoto } from '../lib/shared.jsx';
import LiquidMesh from '../lib/liquid-mesh.jsx';

export default function ScreenRating() {
  const t = useTheme();
  const accent = t.light;
  const accentHot = t.hot;
  const accentRgba = t.softRgba;

  const [stars, setStars] = React.useState(4);
  const [mood, setMood] = React.useState('Confident');
  const [ctx, setCtx] = React.useState('Campus');

  const ratingLabels = {
    1: 'Rough day',
    2: 'Off',
    3: 'Solid',
    4: 'Sharp',
    5: 'Iconic',
  };
  const moods = ['Confident', 'Comfortable', 'Underdressed', 'Overdressed'];
  const contexts = ['Campus', 'Work', 'Night out', 'Travel', 'Casual'];

  return (
    <div style={{
      width: '100%', height: '100%', position: 'relative', overflow: 'hidden',
      background: '#050505',
      fontFamily: 'DM Sans, -apple-system, system-ui, sans-serif',
      color: '#fff',
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(80% 60% at 50% 0%, rgba(40,30,20,0.6) 0%, #050505 70%)',
      }} />
      <LiquidMesh seed={5} intensity={1.1} />

      <div style={{
        position: 'absolute', top: 32, left: 24, right: 24, height: 90,
        opacity: 0.18, pointerEvents: 'none',
      }}>
        <div style={{ fontSize: 28, fontWeight: 300, color: '#fff' }}>Good morning,</div>
      </div>

      <StatusBar />

      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        height: 720, borderTopLeftRadius: 32, borderTopRightRadius: 32,
        background: `linear-gradient(180deg, #1a1410 0%, #0d0a08 60%, #060504 100%)`,
        boxShadow: '0 -30px 80px rgba(0,0,0,0.7), inset 0 0.5px 0 rgba(255,255,255,0.08)',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: -80, left: '50%', transform: 'translateX(-50%)',
          width: 520, height: 320, borderRadius: '50%',
          background: `radial-gradient(ellipse, rgba(${accentRgba},0.28) 0%, transparent 70%)`,
          filter: 'blur(40px)', pointerEvents: 'none',
        }} />

        <div style={{
          position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)',
          width: 38, height: 4, borderRadius: 2,
          background: 'rgba(255,255,255,0.2)',
        }} />

        <div style={{
          position: 'relative', zIndex: 2,
          padding: '28px 24px 28px',
          height: '100%', display: 'flex', flexDirection: 'column',
          boxSizing: 'border-box',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.92)', letterSpacing: -0.40, fontFamily: '"DM Sans", sans-serif' }}>
              FIT 024 · LOGGED 09:14
            </div>
            <div className="liquid-glass" onClick={() => window.__archiveGo && window.__archiveGo('today')} style={{
              width: 28, height: 28, borderRadius: 14,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1" strokeLinecap="round">
                <path d="M6 6l12 12M18 6L6 18"/>
              </svg>
            </div>
          </div>

          <div style={{
            position: 'relative', width: '60%', margin: '0 auto 4px',
            borderRadius: 22, overflow: 'hidden',
            boxShadow: `0 20px 50px -10px rgba(${accentRgba},0.35), 0 30px 60px -20px rgba(0,0,0,0.7)`,
          }}>
            <FitPhoto id={24} radius={22} ratio="3/4" />
          </div>

          <div style={{ textAlign: 'center', marginTop: 18, marginBottom: 14 }}>
            <div style={{ fontSize: 22, fontWeight: 300, letterSpacing: -0.4, lineHeight: 1.2 }}>
              How did it feel?
            </div>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.92)', marginTop: 4 }}>
              Rate honestly — the AI listens.
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginBottom: 8 }}>
            {[1,2,3,4,5].map(n => {
              const active = n <= stars;
              return (
                <div key={n} onClick={() => setStars(n)} style={{
                  cursor: 'pointer', width: 38, height: 38,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  filter: active ? `drop-shadow(0 0 8px ${accent})` : 'none',
                }}>
                  <svg width="32" height="32" viewBox="0 0 24 24"
                       fill={active ? accent : 'transparent'}
                       stroke={active ? accent : 'rgba(255,255,255,0.25)'}
                       strokeWidth="1.4" strokeLinejoin="round">
                    <path d="M12 2.5l3 6.4 7 .9-5.2 4.7L18 21l-6-3.5L6 21l1.2-6.5L2 9.8l7-.9z"/>
                  </svg>
                </div>
              );
            })}
          </div>
          <div style={{
            textAlign: 'center', color: accent, fontWeight: 500,
            letterSpacing: 0.3, marginBottom: 22,
            fontStyle: 'italic',
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: 18,
          }}>
            {ratingLabels[stars]}
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.92)', letterSpacing: -0.38, fontFamily: '"DM Sans", sans-serif', marginBottom: 8 }}>
              MOOD
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
              {moods.map(m => {
                const active = m === mood;
                return (
                  <div key={m} onClick={() => setMood(m)} style={{
                    cursor: 'pointer',
                    padding: '8px 14px', borderRadius: 100,
                    fontSize: 14, fontWeight: 500,
                    background: active ? `rgba(${accentRgba},0.18)` : 'rgba(255,255,255,0.04)',
                    color: active ? accent : 'rgba(255,255,255,0.7)',
                    boxShadow: active
                      ? `inset 0 0 0 0.5px rgba(${accentRgba},0.5)`
                      : 'inset 0 0 0 0.5px rgba(255,255,255,0.06)',
                  }}>{m}</div>
                );
              })}
            </div>
          </div>

          <div style={{ marginBottom: 22 }}>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.92)', letterSpacing: -0.38, fontFamily: '"DM Sans", sans-serif', marginBottom: 8 }}>
              CONTEXT
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
              {contexts.map(c => {
                const active = c === ctx;
                return (
                  <div key={c} onClick={() => setCtx(c)} style={{
                    cursor: 'pointer',
                    padding: '8px 14px', borderRadius: 100,
                    fontSize: 14, fontWeight: 500,
                    background: active ? `rgba(${accentRgba},0.18)` : 'rgba(255,255,255,0.04)',
                    color: active ? accent : 'rgba(255,255,255,0.7)',
                    boxShadow: active
                      ? `inset 0 0 0 0.5px rgba(${accentRgba},0.5)`
                      : 'inset 0 0 0 0.5px rgba(255,255,255,0.06)',
                  }}>{c}</div>
                );
              })}
            </div>
          </div>

          <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ flex: 1, fontSize: 13, color: 'rgba(255,255,255,0.92)', lineHeight: 1.4 }}>
              Feeds Mix &amp; Today picks.<br/>Never shown to others.
            </div>
            <button onClick={() => window.__archiveGo && window.__archiveGo('today')} style={{
              border: 'none', cursor: 'pointer',
              padding: '13px 22px', borderRadius: 100,
              background: `linear-gradient(135deg, ${accent} 0%, ${accentHot} 100%)`,
              color: '#0a0a0a', fontSize: 16, fontWeight: 500,
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              Save fit
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12l5 5L20 7"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
