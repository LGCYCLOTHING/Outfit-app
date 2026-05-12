import React from 'react';
import { useTheme, fitGradient } from '../lib/shared.jsx';

export default function ScreenStory() {
  const t = useTheme();
  const accent = t.light;
  const accentRgba = t.softRgba;
  const SEGMENTS = 5;
  const DURATION = 5000;

  const fits = [
    { id: 23, name: 'Rust suede + cream knit',  date: 'MAR 14', mood: 'Confident', weather: '61° clear' },
    { id: 11, name: 'Espresso wool + ivory',    date: 'FEB 28', mood: 'Sharp',     weather: '48° wind'  },
    { id: 5,  name: 'Black leather + amber',    date: 'JAN 19', mood: 'Bold',      weather: '52° rain'  },
    { id: 8,  name: 'Brick crew + olive cargo', date: 'JAN 04', mood: 'Easy',      weather: '64° sun'   },
    { id: 4,  name: 'Cool stone + ivory linen', date: 'DEC 21', mood: 'Soft',      weather: '38° clear' },
  ];

  const [idx, setIdx] = React.useState(0);
  const [progress, setProgress] = React.useState(0);
  const [paused, setPaused] = React.useState(false);
  const startRef = React.useRef(performance.now());
  const elapsedRef = React.useRef(0);
  const rafRef = React.useRef(0);

  React.useEffect(() => {
    elapsedRef.current = 0;
    startRef.current = performance.now();
    setProgress(0);
  }, [idx]);

  React.useEffect(() => {
    let last = performance.now();
    const tick = (now) => {
      const dt = now - last;
      last = now;
      if (!paused) {
        elapsedRef.current += dt;
        const p = Math.min(1, elapsedRef.current / DURATION);
        setProgress(p);
        if (p >= 1) {
          if (idx < SEGMENTS - 1) {
            setIdx(i => i + 1);
          } else {
            window.__archiveGo && window.__archiveGo('today');
            return;
          }
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [idx, paused]);

  const goPrev = () => {
    if (idx > 0) setIdx(i => i - 1);
    else { elapsedRef.current = 0; setProgress(0); }
  };
  const goNext = () => {
    if (idx < SEGMENTS - 1) setIdx(i => i + 1);
    else window.__archiveGo && window.__archiveGo('today');
  };

  const fit = fits[idx];

  return (
    <div style={{
      width: '100%', height: '100%', position: 'relative', overflow: 'hidden',
      background: '#000',
      fontFamily: 'DM Sans, -apple-system, system-ui, sans-serif',
      color: '#fff',
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: fitGradient(fit.id),
        transition: 'background .4s ease',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'url("data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22120%22 height=%22120%22><filter id=%22n%22><feTurbulence baseFrequency=%220.9%22 numOctaves=%222%22 stitchTiles=%22stitch%22/><feColorMatrix values=%220 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.45 0%22/></filter><rect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22 opacity=%220.5%22/></svg>")',
          mixBlendMode: 'overlay', opacity: 0.4, pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 240,
          background: 'linear-gradient(180deg, rgba(0,0,0,0.55) 0%, transparent 100%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 280,
          background: 'linear-gradient(0deg, rgba(0,0,0,0.7) 0%, transparent 100%)',
          pointerEvents: 'none',
        }} />
      </div>

      <div
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = e.clientX - rect.left;
          if (x < rect.width * 0.33) goPrev(); else goNext();
        }}
        onPointerDown={() => setPaused(true)}
        onPointerUp={() => setPaused(false)}
        onPointerLeave={() => setPaused(false)}
        style={{ position: 'absolute', inset: 0, zIndex: 10, cursor: 'pointer' }}
      />

      <div style={{
        position: 'absolute', top: 'calc(14px + var(--archive-safe-top, 54px))', left: 14, right: 14,
        display: 'flex', gap: 4, zIndex: 20,
      }}>
        {Array.from({ length: SEGMENTS }).map((_, i) => (
          <div key={i} style={{
            flex: 1, height: 2.5, borderRadius: 2,
            background: 'rgba(255,255,255,0.25)',
            overflow: 'hidden',
          }}>
            <div style={{
              width: `${i < idx ? 100 : i === idx ? progress * 100 : 0}%`,
              height: '100%',
              background: '#fff',
              transition: i === idx ? 'none' : 'width .2s ease',
            }} />
          </div>
        ))}
      </div>

      <div style={{
        position: 'absolute', top: 'calc(30px + var(--archive-safe-top, 54px))', left: 18, right: 18,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        zIndex: 20, pointerEvents: 'none',
      }}>
        <div style={{ pointerEvents: 'auto' }}>
          <div style={{
            fontSize: 12, color: 'var(--text-secondary)',
            fontFamily: '"DM Sans", sans-serif', letterSpacing: -0.40,
          }}>FIT #{String(fit.id).padStart(3, '0')} · {fit.date}</div>
        </div>
        <div className="liquid-glass" onClick={(e) => { e.stopPropagation(); window.__archiveGo && window.__archiveGo('today'); }} style={{
          width: 32, height: 32, borderRadius: 16,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', pointerEvents: 'auto',
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1" strokeLinecap="round">
            <path d="M6 6l12 12M18 6L6 18"/>
          </svg>
        </div>
      </div>

      <div style={{
        position: 'absolute', bottom: 'calc(28px + var(--archive-safe-bottom, 0px))',
        left: 16, right: 16, zIndex: 20,
        padding: 20, borderRadius: 24,
        background: 'rgba(20,15,12,0.55)',
        backdropFilter: 'blur(28px) saturate(140%)',
        WebkitBackdropFilter: 'blur(28px) saturate(140%)',
        boxShadow: 'inset 0 0 0 0.5px rgba(255,255,255,0.12), 0 20px 50px rgba(0,0,0,0.5)',
        pointerEvents: 'none',
      }}>
        <div style={{
          textAlign: 'center', fontSize: 12, color: 'var(--text-primary)',
          fontFamily: '"DM Sans", sans-serif', letterSpacing: -0.45, marginBottom: 6,
        }}>{fit.mood.toUpperCase()} · {fit.weather.toUpperCase()}</div>
        <div className="h-display" style={{ fontSize: 30, textAlign: 'center', lineHeight: 1.05 }}>
          {fit.name}
        </div>

        <div style={{
          marginTop: 16, padding: 6,
          borderRadius: 100, background: 'rgba(0,0,0,0.4)',
          display: 'flex', justifyContent: 'space-around', alignItems: 'center',
          pointerEvents: 'auto',
          boxShadow: 'inset 0 0 0 0.5px rgba(255,255,255,0.1)',
        }}>
          {[
            { key: 'share', svg: <path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7M16 6l-4-4-4 4M12 2v14"/>, action: 'share' },
            { key: 'heart', svg: <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>, action: null },
            { key: 'open',  svg: <><circle cx="12" cy="12" r="3"/><path d="M12 5c-7 0-9 7-9 7s2 7 9 7 9-7 9-7-2-7-9-7z"/></>, action: 'detail' },
            { key: 'next',  svg: <path d="M5 12h14M13 5l7 7-7 7"/>, action: null, label: true },
          ].map(item => (
            <div key={item.key}
              onClick={(e) => {
                e.stopPropagation();
                if (item.key === 'next') goNext();
                else if (item.action) window.__archiveGo && window.__archiveGo(item.action);
              }}
              style={{
                width: 38, height: 38, borderRadius: 19,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
              }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                {item.svg}
              </svg>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
