import React from 'react';
import { useTheme, fitGradient, getSavedFitPhotos } from '../lib/shared.jsx';

function ymd(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function getThisWeekFits() {
  try {
    const today = new Date();
    const dow = (today.getDay() + 6) % 7; // Monday = 0
    const monday = new Date(today);
    monday.setDate(today.getDate() - dow);
    const monthShort = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
    const fits = [];
    // For each day this week, emit one story entry PER saved photo so
    // logging multiple fits on one day produces multiple slides.
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const key = ymd(d);
      const photos = getSavedFitPhotos(key);
      const isToday = d.toDateString() === today.toDateString();
      photos.forEach((photo, photoIdx) => {
        fits.push({
          id: `${key}-${photoIdx}`,
          dateKey: key,
          photoIdx,
          photo,
          date: `${monthShort[d.getMonth()]} ${String(d.getDate()).padStart(2, '0')}`,
          name: isToday ? "Today's fit" : 'Logged fit',
          gradientId: ((d.getDate() * 31) + d.getMonth() * 7 + photoIdx) % 12,
        });
      });
    }
    return fits;
  } catch (e) {
    return [];
  }
}

function readLikedSet() {
  try { return new Set(JSON.parse(localStorage.getItem('aevum_liked_fits') || '[]')); }
  catch (e) { return new Set(); }
}
function writeLikedSet(set) {
  try { localStorage.setItem('aevum_liked_fits', JSON.stringify(Array.from(set))); } catch (e) {}
}

export default function ScreenStory() {
  const t = useTheme();
  const accent = t.light;
  const accentRgba = t.softRgba;
  const DURATION = 5000;

  const fits = React.useMemo(() => getThisWeekFits(), []);

  // If there's nothing to play, send the user back so they don't see a black screen.
  React.useEffect(() => {
    if (fits.length === 0) {
      const id = setTimeout(() => {
        window.__archiveGo && window.__archiveGo('today');
      }, 50);
      return () => clearTimeout(id);
    }
  }, [fits.length]);

  const SEGMENTS = Math.max(1, fits.length);
  const [idx, setIdx] = React.useState(0);
  const [progress, setProgress] = React.useState(0);
  const [paused, setPaused] = React.useState(false);
  const startRef = React.useRef(performance.now());
  const elapsedRef = React.useRef(0);
  const rafRef = React.useRef(0);

  // Reactive liked state — flips immediately on tap and writes through to storage.
  const [liked, setLiked] = React.useState(readLikedSet);

  React.useEffect(() => {
    elapsedRef.current = 0;
    startRef.current = performance.now();
    setProgress(0);
  }, [idx]);

  React.useEffect(() => {
    if (fits.length === 0) return; // nothing to advance through
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
  }, [idx, paused, fits.length, SEGMENTS]);

  const goPrev = () => {
    if (idx > 0) setIdx(i => i - 1);
    else { elapsedRef.current = 0; setProgress(0); }
  };
  const goNext = () => {
    if (idx < SEGMENTS - 1) setIdx(i => i + 1);
    else window.__archiveGo && window.__archiveGo('today');
  };

  const fit = fits[idx] || null;
  const isLiked = fit ? liked.has(fit.dateKey) : false;

  // ── Drag-to-dismiss (Instagram-style swipe-down to close) ─────────────
  const [dragY, setDragY] = React.useState(0);
  const [closing, setClosing] = React.useState(false);
  const dragRef = React.useRef({ active: false, startX: 0, startY: 0, dy: 0, didDrag: false });
  const DRAG_THRESHOLD = 110; // px past which release dismisses

  const onPointerDown = (e) => {
    setPaused(true);
    dragRef.current = {
      active: true, startX: e.clientX, startY: e.clientY,
      dy: 0, didDrag: false,
    };
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch (err) {}
  };
  const onPointerMove = (e) => {
    const s = dragRef.current;
    if (!s.active) return;
    const dx = e.clientX - s.startX;
    const dy = e.clientY - s.startY;
    // Only enter drag mode when vertical movement dominates and exceeds 10px.
    if (!s.didDrag && Math.abs(dy) > 10 && Math.abs(dy) > Math.abs(dx)) {
      s.didDrag = true;
    }
    if (s.didDrag) {
      s.dy = Math.max(0, dy); // downward only
      setDragY(s.dy);
    }
  };
  const onPointerUp = (e) => {
    const s = dragRef.current;
    setPaused(false);
    if (s.didDrag) {
      if (s.dy > DRAG_THRESHOLD) {
        // Slide further out then exit
        setClosing(true);
        setTimeout(() => {
          window.__archiveGo && window.__archiveGo('today');
        }, 220);
      } else {
        setDragY(0);
      }
    }
    s.active = false;
  };
  const onTapZoneClick = (e) => {
    // Suppress tap navigation if the gesture turned into a drag.
    if (dragRef.current.didDrag) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    if (x < rect.width * 0.33) goPrev(); else goNext();
  };

  const dragProgress = Math.min(1, dragY / 300);
  const scale = closing ? 0.7 : (1 - dragProgress * 0.12);
  const translate = closing ? '120%' : `${dragY}px`;
  const radius = closing ? 28 : Math.min(28, dragY * 0.25);
  const dimOpacity = closing ? 0 : (1 - dragProgress * 0.35);

  const toggleLike = () => {
    if (!fit) return;
    setLiked(prev => {
      const next = new Set(prev);
      if (next.has(fit.dateKey)) next.delete(fit.dateKey);
      else next.add(fit.dateKey);
      writeLikedSet(next);
      try { window.dispatchEvent(new CustomEvent('archive:likeschanged')); } catch (e) {}
      return next;
    });
  };

  // Empty state — short black flash while the effect navigates away
  if (!fit) {
    return (
      <div style={{
        width: '100%', height: '100%', background: '#000',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'rgba(255,255,255,0.5)', fontFamily: 'DM Sans, sans-serif', fontSize: 13,
      }}>
        Nothing to play this week — log a fit first.
      </div>
    );
  }

  return (
    <div style={{
      width: '100%', height: '100%', position: 'relative', overflow: 'hidden',
      background: '#000',
      fontFamily: 'DM Sans, -apple-system, system-ui, sans-serif',
      color: '#fff',
      // Drag-to-dismiss transform — only animates on release, not while dragging
      transform: `translateY(${translate}) scale(${scale})`,
      borderRadius: radius,
      opacity: dimOpacity,
      transition: dragRef.current.active
        ? 'none'
        : 'transform .32s cubic-bezier(.16,1,.3,1), border-radius .25s ease, opacity .25s ease',
      willChange: 'transform',
    }}>
      {/* Background — real saved photo if it exists, otherwise stable gradient */}
      <div style={{
        position: 'absolute', inset: 0,
        background: fit.photo ? '#000' : fitGradient(fit.gradientId),
        transition: 'background .4s ease',
      }}>
        {fit.photo && (
          <img src={fit.photo} alt="" style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%', objectFit: 'cover', display: 'block',
          }} />
        )}
        {/* Soft grain — only over the gradient fallback */}
        {!fit.photo && (
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: 'url("data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22120%22 height=%22120%22><filter id=%22n%22><feTurbulence baseFrequency=%220.9%22 numOctaves=%222%22 stitchTiles=%22stitch%22/><feColorMatrix values=%220 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.45 0%22/></filter><rect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22 opacity=%220.5%22/></svg>")',
            mixBlendMode: 'overlay', opacity: 0.4, pointerEvents: 'none',
          }} />
        )}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 240,
          background: 'linear-gradient(180deg, rgba(0,0,0,0.55) 0%, transparent 100%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 320,
          background: 'linear-gradient(0deg, rgba(0,0,0,0.78) 0%, transparent 100%)',
          pointerEvents: 'none',
        }} />
      </div>

      {/* Tap zone — handles prev/next taps AND swipe-down to dismiss */}
      <div
        onClick={onTapZoneClick}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        style={{
          position: 'absolute', inset: 0, zIndex: 10,
          cursor: 'pointer', touchAction: 'pan-y',
        }}
      />

      {/* Progress segments */}
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

      {/* Top bar — fit code + close */}
      <div style={{
        position: 'absolute', top: 'calc(30px + var(--archive-safe-top, 54px))', left: 18, right: 18,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        zIndex: 20, pointerEvents: 'none',
      }}>
        <div style={{
          fontSize: 12, color: 'rgba(255,255,255,0.78)',
          fontFamily: '"DM Sans", sans-serif', letterSpacing: 0.4,
          textShadow: '0 1px 3px rgba(0,0,0,0.5)',
          pointerEvents: 'auto',
        }}>
          {fit.date}
        </div>
        <div className="liquid-glass archive-pressable"
          onClick={(e) => { e.stopPropagation(); window.__archiveGo && window.__archiveGo('today'); }}
          style={{
            width: 34, height: 34, borderRadius: 17,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', pointerEvents: 'auto',
          }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round">
            <path d="M6 6l12 12M18 6L6 18"/>
          </svg>
        </div>
      </div>

      {/* Bottom caption + actions */}
      <div style={{
        position: 'absolute', bottom: 'calc(28px + var(--archive-safe-bottom, 0px))',
        left: 16, right: 16, zIndex: 20,
        padding: 18, borderRadius: 24,
        background: 'rgba(20,15,12,0.55)',
        backdropFilter: 'blur(28px) saturate(140%)',
        WebkitBackdropFilter: 'blur(28px) saturate(140%)',
        boxShadow: 'inset 0 0 0 0.5px rgba(255,255,255,0.12), 0 20px 50px rgba(0,0,0,0.5)',
      }}>
        <div style={{
          textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.78)',
          fontFamily: '"DM Sans", sans-serif', letterSpacing: 1.4, marginBottom: 4,
        }}>{fit.date}</div>
        <div className="h-display" style={{ fontSize: 26, textAlign: 'center', lineHeight: 1.1, marginBottom: 4 }}>
          {fit.name}
        </div>

        <div style={{
          marginTop: 14, padding: 6,
          borderRadius: 100, background: 'rgba(0,0,0,0.4)',
          display: 'flex', justifyContent: 'space-around', alignItems: 'center',
          boxShadow: 'inset 0 0 0 0.5px rgba(255,255,255,0.1)',
        }}>
          {/* Share */}
          <div
            onClick={(e) => { e.stopPropagation(); window.__archiveGo && window.__archiveGo('share'); }}
            className="archive-pressable"
            style={{
              width: 40, height: 40, borderRadius: 20,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
            }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7M16 6l-4-4-4 4M12 2v14"/>
            </svg>
          </div>
          {/* Heart (functional) */}
          <div
            onClick={(e) => { e.stopPropagation(); toggleLike(); }}
            className="archive-pressable"
            style={{
              width: 40, height: 40, borderRadius: 20,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
            }}>
            <svg width="17" height="17" viewBox="0 0 24 24"
              fill={isLiked ? '#F08AB0' : 'none'}
              stroke={isLiked ? '#F08AB0' : '#fff'}
              strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </div>
          {/* Open detail */}
          <div
            onClick={(e) => { e.stopPropagation(); window.__archiveGo && window.__archiveGo('detail'); }}
            className="archive-pressable"
            style={{
              width: 40, height: 40, borderRadius: 20,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
            }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"/>
              <path d="M12 5c-7 0-9 7-9 7s2 7 9 7 9-7 9-7-2-7-9-7z"/>
            </svg>
          </div>
          {/* Next */}
          <div
            onClick={(e) => { e.stopPropagation(); goNext(); }}
            className="archive-pressable"
            style={{
              width: 40, height: 40, borderRadius: 20,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
            }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M13 5l7 7-7 7"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
