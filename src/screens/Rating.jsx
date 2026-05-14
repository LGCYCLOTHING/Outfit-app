import React from 'react';
import { useTheme, FitPhoto, getSavedFitPhoto, saveFitPhoto } from '../lib/shared.jsx';

function ymd(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export default function ScreenRating() {
  const t = useTheme();
  const accent = t.light;
  const accentHot = t.hot;
  const accentRgba = t.softRgba;

  const [stars, setStars] = React.useState(4);
  const [mood, setMood] = React.useState('Confident');
  const [ctx, setCtx] = React.useState('Campus');
  const todayKey = ymd(new Date());
  const [photo, setPhoto] = React.useState(() => getSavedFitPhoto(todayKey));
  const fileRef = React.useRef(null);

  // ── Slide-up sheet state (mirrors the hamburger drawer pattern) ──
  const [open, setOpen] = React.useState(false);
  const [dragOffset, setDragOffset] = React.useState(0);
  const [isDragging, setIsDragging] = React.useState(false);
  const dragStartY = React.useRef(0);

  // Animate in after mount
  React.useEffect(() => {
    const raf = requestAnimationFrame(() => setOpen(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  // Re-animate the sheet up whenever the user navigates to 'rating' again
  // (App.jsx keeps screens mounted so the on-mount useEffect won't re-fire).
  React.useEffect(() => {
    const handler = (e) => {
      if (e && e.detail === 'rating') {
        setOpen(false);
        setDragOffset(0);
        // next frame → open=true → CSS transition animates from translateY(100%) → 0
        requestAnimationFrame(() => requestAnimationFrame(() => setOpen(true)));
      }
    };
    window.addEventListener('archive:navigate', handler);
    return () => window.removeEventListener('archive:navigate', handler);
  }, []);

  const close = () => {
    setOpen(false);
    // Bring the nav back IMMEDIATELY (don't wait for the slow slide-down to finish)
    if (typeof document !== 'undefined') document.body.classList.remove('aevum-modal-open');
    setTimeout(() => {
      if (typeof window !== 'undefined' && window.__archiveGo) window.__archiveGo('today');
    }, 1100);
  };

  const onHandleDown = (e) => {
    try { e.target.setPointerCapture(e.pointerId); } catch (err) {}
    dragStartY.current = e.clientY;
    setIsDragging(true);
  };
  const onHandleMove = (e) => {
    if (!isDragging) return;
    const delta = e.clientY - dragStartY.current;
    setDragOffset(Math.max(0, delta));
  };
  const onHandleUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (dragOffset > 120) {
      close();
    } else {
      setDragOffset(0);
    }
  };

  const onPickFile = (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      saveFitPhoto(todayKey, dataUrl);
      setPhoto(dataUrl);
    };
    reader.readAsDataURL(f);
  };

  const saveFit = () => {
    try {
      const logged = JSON.parse(localStorage.getItem('aevum_fits_logged') || '[]');
      if (!logged.includes(todayKey)) {
        logged.push(todayKey);
        localStorage.setItem('aevum_fits_logged', JSON.stringify(logged));
      }
      if (typeof window !== 'undefined') window.__archiveEmpty = false;
    } catch (e) {}
    close();
  };

  const ratingLabels = {
    1: 'Rough day',
    2: 'Off',
    3: 'Solid',
    4: 'Sharp',
    5: 'Iconic',
  };
  const moods = ['Confident', 'Comfortable', 'Underdressed', 'Overdressed'];
  const contexts = ['Campus', 'Work', 'Night out', 'Travel', 'Casual'];

  // Transform / transition for the sheet — open: slide up, close: slide back down
  const sheetTransform = open
    ? `translateY(${dragOffset}px)`
    : 'translateY(100%)';
  const sheetTransition = isDragging
    ? 'none'
    : open
      ? 'transform .9s cubic-bezier(.16,1,.3,1)'
      : 'transform 1.2s cubic-bezier(.16,1,.3,1)';

  return (
    <div style={{
      width: '100%', height: '100%', position: 'relative', overflow: 'hidden',
      fontFamily: 'DM Sans, -apple-system, system-ui, sans-serif',
      color: '#fff',
    }}>
      {/* Modal mode: no LiquidMesh here. The underlying screen (Today, Archive,
          etc.) is kept visible by App.jsx so we show through it. */}

      {/* Transparent backdrop — tap-to-close only, no dim overlay (matches the
          hamburger drawer behavior: underlying screen stays fully visible) */}
      <div
        onClick={close}
        style={{
          position: 'absolute', inset: 0,
          background: 'transparent',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transition: 'opacity .28s ease-out',
        }}
      />

      {/* StatusBar already on underlying screen — don't duplicate */}

      {/* The sliding sheet itself */}
      <div className="lg-sheet" style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        height: '88%',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        transform: sheetTransform,
        transition: sheetTransition,
        overflow: 'hidden',
        zIndex: 5,
      }}>
        {/* Drag handle — pull this down to close */}
        <div
          onPointerDown={onHandleDown}
          onPointerMove={onHandleMove}
          onPointerUp={onHandleUp}
          onPointerCancel={onHandleUp}
          style={{
            position: 'absolute', top: 0, left: '50%',
            transform: 'translateX(-50%)',
            width: 80, height: 28,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'grab',
            touchAction: 'none',
            zIndex: 10,
          }}>
          <div style={{
            width: 40, height: 4, borderRadius: 2,
            background: 'rgba(255,255,255,0.45)',
          }} />
        </div>

        {/* Accent glow at top of sheet */}
        <div style={{
          position: 'absolute', top: -80, left: '50%', transform: 'translateX(-50%)',
          width: 520, height: 320, borderRadius: '50%',
          background: `radial-gradient(ellipse, rgba(${accentRgba},0.32) 0%, transparent 70%)`,
          filter: 'blur(40px)', pointerEvents: 'none',
        }} />

        <div style={{
          position: 'relative', zIndex: 2,
          padding: '36px 24px 28px',
          height: '100%', display: 'flex', flexDirection: 'column',
          boxSizing: 'border-box',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 14 }}>
            <div style={{ fontSize: 13, color: 'var(--text-primary)', letterSpacing: -0.40, fontFamily: '"DM Sans", sans-serif' }}>
              FIT 024 · LOGGED 09:14
            </div>
          </div>

          <div style={{
            position: 'relative', width: '78%', margin: '0 auto 4px',
            borderRadius: 22, overflow: 'hidden',
            background: 'rgba(0,0,0,0.35)',
            boxShadow: `0 20px 50px -10px rgba(${accentRgba},0.35), 0 30px 60px -20px rgba(0,0,0,0.7)`,
          }}>
            {photo ? (
              <div style={{ width: '100%', aspectRatio: '4/5', borderRadius: 22, overflow: 'hidden', background: 'rgba(0,0,0,0.35)' }}>
                <img src={photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
              </div>
            ) : (
              <FitPhoto id={24} radius={22} ratio="4/5" photoKey={todayKey} />
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={onPickFile}
              style={{ display: 'none' }}
            />
            <div
              onClick={() => fileRef.current && fileRef.current.click()}
              className="liquid-glass archive-pressable"
              style={{
                position: 'absolute', bottom: 10, right: 10,
                width: 34, height: 34, borderRadius: 17,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
              }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F5F0E8" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 7h3l2-2.5h8L18 7h3a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1z"/>
                <circle cx="12" cy="13" r="3.5"/>
              </svg>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: 18, marginBottom: 14 }}>
            <div style={{ fontSize: 22, fontWeight: 300, letterSpacing: -0.4, lineHeight: 1.2 }}>
              How did it feel?
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginBottom: 8 }}>
            {[1,2,3,4,5].map(n => {
              const active = n <= stars;
              return (
                <div key={n} onClick={() => setStars(n)} style={{
                  cursor: 'pointer', width: 38, height: 38,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  filter: 'none',
                }}>
                  <svg width="32" height="32" viewBox="0 0 24 24"
                       fill={active ? accent : 'transparent'}
                       stroke={active ? accent : 'rgba(255,255,255,0.35)'}
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
            <div style={{ fontSize: 12, color: 'var(--text-primary)', letterSpacing: -0.38, fontFamily: '"DM Sans", sans-serif', marginBottom: 8 }}>
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
                    background: active ? `rgba(${accentRgba},0.22)` : 'rgba(255,255,255,0.06)',
                    color: active ? accent : 'rgba(255,255,255,0.78)',
                    boxShadow: active
                      ? `inset 0 0 0 0.5px rgba(${accentRgba},0.55)`
                      : 'inset 0 0 0 0.5px rgba(255,255,255,0.08)',
                  }}>{m}</div>
                );
              })}
            </div>
          </div>

          <div style={{ marginBottom: 22 }}>
            <div style={{ fontSize: 12, color: 'var(--text-primary)', letterSpacing: -0.38, fontFamily: '"DM Sans", sans-serif', marginBottom: 8 }}>
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
                    background: active ? `rgba(${accentRgba},0.22)` : 'rgba(255,255,255,0.06)',
                    color: active ? accent : 'rgba(255,255,255,0.78)',
                    boxShadow: active
                      ? `inset 0 0 0 0.5px rgba(${accentRgba},0.55)`
                      : 'inset 0 0 0 0.5px rgba(255,255,255,0.08)',
                  }}>{c}</div>
                );
              })}
            </div>
          </div>

          <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10 }}>
            <button onClick={saveFit} style={{
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
