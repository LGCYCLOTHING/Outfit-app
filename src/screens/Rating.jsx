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
  // Tick bumps on every interactive change so we can replay CSS keyframes
  const [starsTick, setStarsTick] = React.useState(0);
  const [moodTick, setMoodTick] = React.useState(0);
  const [ctxTick, setCtxTick] = React.useState(0);
  const pickStars = (n) => { setStars(n); setStarsTick(t => t + 1); };
  const pickMood  = (m) => { setMood(m);  setMoodTick(t => t + 1); };
  const pickCtx   = (c) => { setCtx(c);   setCtxTick(t => t + 1); };
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
            background: `rgba(${accentRgba}, 0.55)`,
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
          height: '100%', display: 'flex', flexDirection: 'column',
          boxSizing: 'border-box',
          paddingTop: 32,
        }}>
          {/* Scrollable content body */}
          <div style={{
            flex: 1, minHeight: 0, overflowY: 'auto', overflowX: 'hidden',
            padding: '0 24px 16px',
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none',
          }}>
            <style>{`.rating-scroll::-webkit-scrollbar{display:none}`}</style>
            <div className="rating-scroll">
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 14 }}>
                <div style={{
                  fontSize: 11, color: accent, letterSpacing: 1.6,
                  fontFamily: '"DM Sans", sans-serif', fontWeight: 600,
                }}>
                  FIT 024 · LOGGED 09:14
                </div>
              </div>

              {/* Photo — full bleed within content area, no rounded corners, contain */}
              <div style={{
                position: 'relative', width: '100%',
                margin: '0 auto 18px',
                background: 'rgba(0,0,0,0.35)',
                boxShadow: `0 20px 50px -10px rgba(${accentRgba},0.30), 0 30px 60px -20px rgba(0,0,0,0.7)`,
                aspectRatio: '4/5',
                overflow: 'visible',
              }}>
                {photo ? (
                  <img src={photo} alt="" style={{
                    width: '100%', height: '100%',
                    objectFit: 'contain', display: 'block',
                  }} />
                ) : (
                  <FitPhoto id={24} radius={0} ratio="4/5" photoKey={todayKey} />
                )}
                <input
                  ref={fileRef} type="file" accept="image/*"
                  onChange={onPickFile} style={{ display: 'none' }}
                />
                <div
                  onClick={() => fileRef.current && fileRef.current.click()}
                  className="liquid-glass archive-pressable"
                  style={{
                    position: 'absolute', bottom: 10, right: 10,
                    width: 36, height: 36, borderRadius: 18,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer',
                  }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 7h3l2-2.5h8L18 7h3a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1z"/>
                    <circle cx="12" cy="13" r="3.5"/>
                  </svg>
                </div>
              </div>

              <div style={{ textAlign: 'center', marginBottom: 12 }}>
                <div style={{ fontSize: 22, fontWeight: 300, letterSpacing: -0.4, lineHeight: 1.2 }}>
                  How did it feel?
                </div>
              </div>

              {/* Stars — staggered pop animation when rating changes */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 6 }}>
                {[1,2,3,4,5].map(n => {
                  const active = n <= stars;
                  return (
                    <div key={n} onClick={() => pickStars(n)}
                      className="archive-pressable"
                      style={{
                        width: 36, height: 36, borderRadius: 8,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                      <svg key={`${n}-${starsTick}`} width="26" height="26" viewBox="0 0 24 24"
                           fill={active ? accent : 'transparent'}
                           stroke={active ? accent : 'rgba(255,255,255,0.35)'}
                           strokeWidth="1.4" strokeLinejoin="round"
                           style={{
                             animation: active ? `star-pop .42s cubic-bezier(.34,1.56,.64,1) ${(n - 1) * 0.04}s` : 'none',
                             transformOrigin: 'center',
                           }}>
                        <path d="M12 2.5l3 6.4 7 .9-5.2 4.7L18 21l-6-3.5L6 21l1.2-6.5L2 9.8l7-.9z"/>
                      </svg>
                    </div>
                  );
                })}
              </div>
              <div key={`label-${starsTick}`} style={{
                textAlign: 'center', color: accent, fontWeight: 500,
                letterSpacing: 0.3, marginBottom: 18,
                fontStyle: 'italic',
                fontFamily: 'Cormorant Garamond, serif',
                fontSize: 16,
                animation: 'star-pop .35s ease',
                transformOrigin: 'center',
              }}>
                {ratingLabels[stars]}
              </div>

              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 10, color: 'var(--text-secondary)', letterSpacing: 1.2, marginBottom: 8, fontFamily: '"DM Sans", sans-serif' }}>
                  MOOD
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {moods.map(m => {
                    const active = m === mood;
                    return (
                      <div key={`${m}-${active ? moodTick : 0}`}
                        onClick={() => pickMood(m)}
                        className="archive-pressable"
                        style={{
                          padding: '7px 13px', borderRadius: 100,
                          fontSize: 12.5, fontWeight: 500,
                          background: active ? `rgba(${accentRgba},0.22)` : 'rgba(255,255,255,0.06)',
                          color: active ? accent : 'rgba(255,255,255,0.78)',
                          boxShadow: active
                            ? `inset 0 0 0 0.5px rgba(${accentRgba},0.55)`
                            : 'inset 0 0 0 0.5px rgba(255,255,255,0.08)',
                          animation: active ? 'pill-pop .25s ease' : 'none',
                        }}>{m}</div>
                    );
                  })}
                </div>
              </div>

              <div style={{ marginBottom: 4 }}>
                <div style={{ fontSize: 10, color: 'var(--text-secondary)', letterSpacing: 1.2, marginBottom: 8, fontFamily: '"DM Sans", sans-serif' }}>
                  CONTEXT
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {contexts.map(c => {
                    const active = c === ctx;
                    return (
                      <div key={`${c}-${active ? ctxTick : 0}`}
                        onClick={() => pickCtx(c)}
                        className="archive-pressable"
                        style={{
                          padding: '7px 13px', borderRadius: 100,
                          fontSize: 12.5, fontWeight: 500,
                          background: active ? `rgba(${accentRgba},0.22)` : 'rgba(255,255,255,0.06)',
                          color: active ? accent : 'rgba(255,255,255,0.78)',
                          boxShadow: active
                            ? `inset 0 0 0 0.5px rgba(${accentRgba},0.55)`
                            : 'inset 0 0 0 0.5px rgba(255,255,255,0.08)',
                          animation: active ? 'pill-pop .25s ease' : 'none',
                        }}>{c}</div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Sticky Save footer — full-width centered button */}
          <div style={{
            flexShrink: 0,
            padding: '14px 24px calc(20px + var(--archive-safe-bottom, 0px))',
            background: 'linear-gradient(to top, rgba(20,18,16,0.95) 0%, rgba(20,18,16,0.0) 100%)',
            pointerEvents: 'auto',
          }}>
            <button onClick={saveFit}
              className="archive-pressable"
              style={{
                width: '100%', height: 52, borderRadius: 26, border: 'none', cursor: 'pointer',
                background: `linear-gradient(135deg, ${accent} 0%, ${accentHot} 100%)`,
                color: '#0a0a0a', fontSize: 15, fontWeight: 600,
                letterSpacing: '-0.01em', fontFamily: 'inherit',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                boxShadow: `0 10px 28px -6px rgba(${accentRgba}, 0.6)`,
              }}>
              Save fit
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12l5 5L20 7"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
