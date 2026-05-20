import React from 'react';
import {
  useTheme, bgColor, fgColor,
  ArchiveBurger, StatusBar, GlowCard, Glass, TabBar, PhotoPlaceholder, fitGradient, fitBorder,
  getSavedFitPhoto, getSavedFitPhotos,
} from '../lib/shared.jsx';
import { calculateWeeklyScore, scoreLabel, scoreTier } from '../lib/fitScore.js';
import { getWardrobeCompletion } from '../lib/wardrobe.js';
import LiquidMesh from '../lib/liquid-mesh.jsx';
import { useWeather, WeatherIcon } from '../lib/weather.jsx';

// ─────────── Streak / week helpers (read from localStorage) ───────────
function readLoggedDays() {
  try {
    return JSON.parse(localStorage.getItem('aevum_fits_logged') || '[]');
  } catch (e) { return []; }
}

function ymd(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function computeStreak() {
  const set = new Set(readLoggedDays());
  const today = new Date();
  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    if (set.has(ymd(d))) streak++;
    else if (i > 0) break; // today not yet logged is OK
  }
  return streak;
}

function getThisWeekDays() {
  const today = new Date();
  const dow = (today.getDay() + 6) % 7; // 0 = Monday
  const monday = new Date(today);
  monday.setDate(today.getDate() - dow);
  const logged = new Set(readLoggedDays());
  const letters = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const key = ymd(d);
    return {
      letter: letters[i],
      dateNum: d.getDate(),
      dateKey: key,
      isToday: d.toDateString() === today.toDateString(),
      isFuture: d > today,
      hasFit: logged.has(key),
    };
  });
}

function StreakRing({ streak, weekProgress, accent, onClick }) {
  const size = 40;
  const stroke = 2;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = Math.max(0, Math.min(1, weekProgress)) * c;
  return (
    <div
      onClick={onClick}
      className="archive-pressable"
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
        cursor: 'pointer',
      }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)' }}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none"
            stroke="rgba(245,240,232,0.12)" strokeWidth={stroke} />
          <circle cx={size / 2} cy={size / 2} r={r} fill="none"
            stroke={accent} strokeWidth={stroke} strokeLinecap="round"
            strokeDasharray={`${dash} ${c}`} />
        </svg>
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14, fontWeight: 700, color: 'var(--text-primary)',
          letterSpacing: '-0.02em',
        }}>
          {streak === 0 ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="rgba(245,240,232,0.55)">
              <path d="M12 2c1 4-3 6-3 10a5 5 0 0 0 10 0c0-2-1-4-2-5 0 2-1 3-2 3 0-3-1-5-3-8z"/>
            </svg>
          ) : streak}
        </div>
      </div>
      <div style={{
        fontSize: 8, fontWeight: 500, letterSpacing: 1.4,
        color: 'var(--text-muted)', textTransform: 'uppercase',
      }}>
        Day streak
      </div>
    </div>
  );
}

export default function ScreenToday() {
  const t = useTheme();
  const accent = t.light;
  const accentHot = t.hot;
  const accentDeep = t.deep;
  const accentRgba = t.softRgba;
  const weather = useWeather();

  // Force re-render when a fit is saved (Rating modal dispatches this) so the
  // photo + logged state on the Today screen refresh without a manual reload.
  const [, setFitsRev] = React.useState(0);
  React.useEffect(() => {
    const onFitsChanged = () => setFitsRev(r => r + 1);
    window.addEventListener('archive:fitschanged', onFitsChanged);
    return () => window.removeEventListener('archive:fitschanged', onFitsChanged);
  }, []);

  // Weekly Fit Score — recomputes on every save and on screen mount.
  const [fitScore, setFitScore] = React.useState(() => calculateWeeklyScore());
  React.useEffect(() => {
    const refresh = () => setFitScore(calculateWeeklyScore());
    window.addEventListener('archive:fitschanged', refresh);
    window.addEventListener('archive:scorechanged', refresh);
    return () => {
      window.removeEventListener('archive:fitschanged', refresh);
      window.removeEventListener('archive:scorechanged', refresh);
    };
  }, []);
  // Animated arc/dot — start at 0 on first paint so the on-load draw plays.
  const [gaugeProgress, setGaugeProgress] = React.useState(0);
  React.useEffect(() => {
    const target = Math.max(0, Math.min(1, fitScore.score / 100));
    const r = requestAnimationFrame(() => setGaugeProgress(target));
    return () => cancelAnimationFrame(r);
  }, [fitScore.score]);

  // Per-PHOTO like state. The set holds composite keys like "2026-05-18#0"
  // so multiple photos on the same day can be liked individually (a bare
  // "2026-05-18" is treated as legacy = the first photo).
  const todayKey = ymd(new Date());
  const readLikedSet = () => {
    try { return new Set(JSON.parse(localStorage.getItem('aevum_liked_fits') || '[]')); }
    catch (e) { return new Set(); }
  };
  const [likedSet, setLikedSet] = React.useState(readLikedSet);
  React.useEffect(() => {
    const refresh = () => setLikedSet(readLikedSet());
    window.addEventListener('archive:likeschanged', refresh);
    return () => window.removeEventListener('archive:likeschanged', refresh);
  }, []);
  const isPhotoLiked = (photoIdx) => {
    if (photoIdx == null) return false;
    if (likedSet.has(`${todayKey}#${photoIdx}`)) return true;
    if (photoIdx === 0 && likedSet.has(todayKey)) return true; // legacy bare date key
    return false;
  };
  const togglePhotoLike = (photoIdx) => {
    if (photoIdx == null) return; // can't like the empty placeholder
    const composite = `${todayKey}#${photoIdx}`;
    setLikedSet(prev => {
      const next = new Set(prev);
      const wasLiked = next.has(composite) || (photoIdx === 0 && next.has(todayKey));
      if (wasLiked) {
        next.delete(composite);
        if (photoIdx === 0) next.delete(todayKey); // also strip legacy entry
      } else {
        next.add(composite);
      }
      try { localStorage.setItem('aevum_liked_fits', JSON.stringify(Array.from(next))); } catch (e) {}
      try { window.dispatchEvent(new CustomEvent('archive:likeschanged')); } catch (e) {}
      return next;
    });
  };

  // ── TODAY date selector + month-calendar dropdown ─────────────────────
  const [calOpen, setCalOpen] = React.useState(false);
  const [calCursor, setCalCursor] = React.useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });
  const goPrevDay = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    if (typeof window !== 'undefined') window.__archiveDetailKey = ymd(d);
    window.__archiveGo && window.__archiveGo('detail');
  };
  const stepMonth = (dir) => setCalCursor(({ year, month }) => {
    let m = month + dir, y = year;
    if (m < 0)  { m = 11; y -= 1; }
    if (m > 11) { m = 0;  y += 1; }
    return { year: y, month: m };
  });

  // ── Today's fit carousel — scroll-driven active dot ──
  const [picksIdx, setPicksIdx] = React.useState(0);
  const picksRowRef = React.useRef(null);

  // ── Scroll-driven collapse for the sticky top bar (hamburger / TODAY pill /
  // streak). 0 = fully expanded, 1 = fully collapsed. Saturates over the first
  // 90px of scroll — quick enough to feel responsive, long enough to be smooth.
  const scrollRef = React.useRef(null);
  const [collapseT, setCollapseT] = React.useState(0);
  const onContentScroll = React.useCallback((e) => {
    const y = e.currentTarget.scrollTop || 0;
    const t = Math.max(0, Math.min(1, y / 90));
    setCollapseT(prev => (Math.abs(prev - t) < 0.005 ? prev : t));
  }, []);
  // Linear-interp helper for the collapse calcs below
  const lerp = (a, b) => a + (b - a) * collapseT;
  const onPicksScroll = React.useCallback((e) => {
    const el = e.currentTarget;
    const viewportCenter = el.scrollLeft + el.clientWidth / 2;
    const cards = el.querySelectorAll('[data-pick-idx]');
    let best = 0, bestDist = Infinity;
    cards.forEach((card) => {
      const cardCenter = card.offsetLeft + card.offsetWidth / 2;
      const dist = Math.abs(cardCenter - viewportCenter);
      if (dist < bestDist) { bestDist = dist; best = parseInt(card.dataset.pickIdx, 10) || 0; }
    });
    setPicksIdx(best);
  }, []);
  const onPicksDown = React.useCallback((e) => {
    // Mouse-only click-drag-to-scroll. On touch we let the browser handle the
    // gesture natively — intercepting pointermove on touch causes a noticeable
    // delay before scrolling kicks in.
    if (e.pointerType !== 'mouse') return;
    const el = e.currentTarget;
    const startX = e.clientX;
    const startScroll = el.scrollLeft;
    const onMove = (m) => { el.scrollLeft = startScroll - (m.clientX - startX); };
    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  }, []);

  // ── Stat cards — iPhone-style drag-to-reorder with live re-flow ──
  // DOM order never changes; visual position comes from statOrder + transform.
  const STAT_DOM_ORDER = ['week', 'fits', 'best', 'month', 'liked', 'pieces'];
  const STAT_GAP = 10;
  const [statOrder, setStatOrder] = React.useState(() => {
    try {
      const saved = localStorage.getItem('aevum_stats_order');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === STAT_DOM_ORDER.length) return parsed;
      }
    } catch (e) {}
    return ['week', 'fits', 'best', 'month', 'liked', 'pieces'];
  });
  const [draggingStatId, setDraggingStatId] = React.useState(null);
  const [statDrag, setStatDrag] = React.useState({ x: 0, y: 0 });
  const [statCardSize, setStatCardSize] = React.useState({ w: 0, h: 0 });
  const [statTargetSlot, setStatTargetSlot] = React.useState(null);
  const statDragStartRef = React.useRef({ x: 0, y: 0 });
  const statsGridRef = React.useRef(null);

  React.useLayoutEffect(() => {
    const measure = () => {
      if (!statsGridRef.current) return;
      const card = statsGridRef.current.querySelector('[data-stat-card]');
      if (card) setStatCardSize({ w: card.offsetWidth, h: card.offsetHeight });
    };
    measure();
    window.addEventListener('resize', measure);
    window.addEventListener('archive:resize', measure);
    return () => {
      window.removeEventListener('resize', measure);
      window.removeEventListener('archive:resize', measure);
    };
  }, []);

  const STAT_COL_W = statCardSize.w + STAT_GAP;
  const STAT_ROW_H = statCardSize.h + STAT_GAP;

  // Convert a logical position (0..N-1) to grid (col, row)
  const slotToGrid = (slot) => ({ col: slot % 2, row: Math.floor(slot / 2) });

  const onStatGripDown = (id, e) => {
    e.stopPropagation();
    try { e.target.setPointerCapture(e.pointerId); } catch (err) {}
    statDragStartRef.current = { x: e.clientX, y: e.clientY };
    setDraggingStatId(id);
    setStatDrag({ x: 0, y: 0 });
    setStatTargetSlot(statOrder.indexOf(id));
  };
  const onStatGripMove = (e) => {
    if (!draggingStatId) return;
    const dx = e.clientX - statDragStartRef.current.x;
    const dy = e.clientY - statDragStartRef.current.y;
    setStatDrag({ x: dx, y: dy });
    if (!STAT_COL_W || !STAT_ROW_H) return;
    // Compute the slot the dragged card's center is hovering over
    const origSlot = statOrder.indexOf(draggingStatId);
    const orig = slotToGrid(origSlot);
    // Round to nearest col/row based on drag delta
    const newCol = Math.max(0, Math.min(1, Math.round(orig.col + dx / STAT_COL_W)));
    const newRow = Math.max(0, Math.min(Math.floor((STAT_DOM_ORDER.length - 1) / 2),
                                          orig.row + Math.round(dy / STAT_ROW_H)));
    const newSlot = Math.min(STAT_DOM_ORDER.length - 1, newRow * 2 + newCol);
    setStatTargetSlot(newSlot);
  };
  const onStatGripUp = () => {
    if (!draggingStatId) return;
    const origSlot = statOrder.indexOf(draggingStatId);
    if (statTargetSlot != null && statTargetSlot !== origSlot) {
      setStatOrder(o => {
        const next = [...o];
        const [moved] = next.splice(origSlot, 1);
        next.splice(statTargetSlot, 0, moved);
        try { localStorage.setItem('aevum_stats_order', JSON.stringify(next)); } catch (e) {}
        return next;
      });
    }
    setDraggingStatId(null);
    setStatDrag({ x: 0, y: 0 });
    setStatTargetSlot(null);
  };
  return (
    <div style={{
      width: '100%', height: '100%', position: 'relative', overflow: 'hidden',
      background: bgColor(),
      fontFamily: 'DM Sans, -apple-system, system-ui, sans-serif',
      color: fgColor()
    }}>
      <LiquidMesh seed={0} intensity={1.2} />
      <div style={{
        position: 'absolute', top: -180, left: '50%', transform: 'translateX(-50%)',
        width: 520, height: 520, borderRadius: '50%',
        background: `radial-gradient(circle, rgba(${accentRgba},0.32) 0%, rgba(${accentRgba},0.12) 30%, transparent 60%)`,
        filter: 'blur(40px)', pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute', top: 380, left: '50%', transform: 'translateX(-50%)',
        width: 420, height: 240, borderRadius: '50%',
        background: `radial-gradient(ellipse, rgba(${accentRgba},0.16) 0%, transparent 70%)`,
        filter: 'blur(30px)', pointerEvents: 'none'
      }} />

      <StatusBar />

      <div ref={scrollRef} onScroll={onContentScroll} style={{ position: 'absolute', zIndex: 2, top: 'var(--archive-safe-top, 54px)', left: 0, right: 0, bottom: 0, padding: '0 28px calc(120px + var(--archive-safe-bottom, 0px))', overflow: 'auto', boxSizing: 'border-box' }}>
        {/* ── Top bar — hamburger (left) · TODAY pill (absolute-centered) · streak (right) ──
            Sticky so it stays pinned at the top while the content scrolls. Pill +
            streak shrink with `collapseT` (driven by onContentScroll). */}
        <div style={{
          position: 'sticky', top: 0, zIndex: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          paddingTop: lerp(12, 6), paddingBottom: lerp(10, 6),
          marginBottom: 8,
          // Glass backdrop fades in as the bar pins so scrolled content
          // doesn't bleed through behind hamburger / TODAY pill / streak.
          background: `rgba(0,0,0,${0.32 * collapseT})`,
          backdropFilter: `blur(${14 * collapseT}px) saturate(${1 + 0.4 * collapseT})`,
          WebkitBackdropFilter: `blur(${14 * collapseT}px) saturate(${1 + 0.4 * collapseT})`,
          marginLeft: -28, marginRight: -28, paddingLeft: 28, paddingRight: 28,
          transition: 'background .15s linear',
        }}>
          {/* Hamburger */}
          <div
            onClick={() => window.__archiveToggleNav && window.__archiveToggleNav()}
            className="archive-pressable"
            style={{
              width: lerp(24, 20), height: lerp(22, 18),
              display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: lerp(5, 3.5),
              cursor: 'pointer', flexShrink: 0,
            }}>
            <div style={{ width: lerp(22, 18), height: lerp(2.5, 2), borderRadius: 1.5, background: 'var(--text-primary)' }} />
            <div style={{ width: lerp(22, 18), height: lerp(2.5, 2), borderRadius: 1.5, background: 'var(--text-primary)' }} />
            <div style={{ width: lerp(22, 18), height: lerp(2.5, 2), borderRadius: 1.5, background: 'var(--text-primary)' }} />
          </div>

          {/* TODAY pill — rounded-rectangle outer with a raised inner button.
              Absolute-centered so hamburger/streak widths don't shift it. */}
          <div style={{
            position: 'absolute', left: '50%', top: '50%',
            transform: 'translate(-50%, -50%)',
            display: 'flex', alignItems: 'center',
            padding: `${lerp(4, 2)}px ${lerp(6, 4)}px`, borderRadius: lerp(14, 12),
            background: 'rgba(18,16,14,0.72)',
            border: '0.5px solid rgba(255,255,255,0.08)',
            boxShadow:
              'inset 0 1px 0 rgba(255,255,255,0.06), ' +
              '0 2px 6px rgba(0,0,0,0.30)',
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
          }}>
            {/* Prev — yesterday */}
            <div onClick={goPrevDay} className="archive-pressable" style={{
              width: lerp(20, 16), height: lerp(28, 22),
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
            }}>
              <svg width={lerp(14, 11)} height={lerp(14, 11)} viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 6l-6 6 6 6"/>
              </svg>
            </div>
            {/* TODAY — raised, slightly-rounded button */}
            <div onClick={() => setCalOpen(o => !o)} className="archive-pressable" style={{
              padding: `${lerp(7, 5)}px ${lerp(14, 10)}px`, borderRadius: lerp(10, 8),
              margin: `0 ${lerp(4, 3)}px`,
              background: 'linear-gradient(180deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.06) 100%)',
              boxShadow:
                'inset 0 0.5px 0 rgba(255,255,255,0.30), ' +
                'inset 0 -0.5px 0 rgba(0,0,0,0.20), ' +
                '0 1px 2px rgba(0,0,0,0.35)',
              fontSize: lerp(11, 9.5), fontWeight: 700, letterSpacing: lerp(1.4, 1.1), color: '#fff',
              cursor: 'pointer',
            }}>
              TODAY
            </div>
            {/* Next — disabled */}
            <div style={{
              width: lerp(20, 16), height: lerp(28, 22),
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              opacity: 0.4, cursor: 'default',
            }}>
              <svg width={lerp(14, 11)} height={lerp(14, 11)} viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 6l6 6-6 6"/>
              </svg>
            </div>
          </div>

          {/* Streak — flame + count */}
          <div
            onClick={() => window.__archiveGo && window.__archiveGo('streak')}
            className="archive-pressable"
            style={{
              display: 'flex', alignItems: 'center', gap: lerp(6, 4),
              padding: `${lerp(5, 3)}px ${lerp(14, 11)}px ${lerp(5, 3)}px ${lerp(11, 9)}px`,
              borderRadius: 999,
              background: 'rgba(0,0,0,0.35)',
              border: '1px solid rgba(255,255,255,0.10)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              cursor: 'pointer', flexShrink: 0,
            }}>
            <svg width={lerp(18, 14)} height={lerp(18, 14)} viewBox="0 0 24 24" fill="#FFFFFF"
              style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.35))' }}>
              <path d="M12 2c1 4-3 6-3 10a5 5 0 0 0 10 0c0-2-1-4-2-5 0 2-1 3-2 3 0-3-1-5-3-8z"/>
            </svg>
            <span style={{ fontSize: lerp(18, 14), color: '#FFFFFF', letterSpacing: '-0.04em', lineHeight: 1, fontWeight: 600 }}>
              {computeStreak()}
            </span>
          </div>

          {/* Calendar dropdown — slides in below the pill */}
          {calOpen && (
            <div onClick={() => setCalOpen(false)} style={{
              position: 'fixed', inset: 0, zIndex: 40, background: 'transparent',
            }} />
          )}
          <div className="lg-sheet" style={{
            position: 'absolute', top: 'calc(100% + 10px)', left: -4, right: -4,
            zIndex: 41,
            borderRadius: 22, padding: 16,
            transformOrigin: 'top center',
            transform: calOpen ? 'translateY(0) scaleY(1)' : 'translateY(-12px) scaleY(0.96)',
            opacity: calOpen ? 1 : 0,
            pointerEvents: calOpen ? 'auto' : 'none',
            transition:
              'transform .42s cubic-bezier(.16,1,.3,1), ' +
              'opacity .25s ease',
            boxShadow: '0 24px 60px -10px rgba(0,0,0,0.55)',
          }}
            onClick={(e) => e.stopPropagation()}
          >
            {(() => {
              const { year, month } = calCursor;
              const monthName = ['January','February','March','April','May','June','July','August','September','October','November','December'][month];
              const today = new Date();
              const todayY = today.getFullYear(), todayM = today.getMonth(), todayD = today.getDate();
              // First day of month + day-of-week offset (Monday = 0)
              const first = new Date(year, month, 1);
              const dow = (first.getDay() + 6) % 7;
              const daysInMonth = new Date(year, month + 1, 0).getDate();
              const cells = [];
              for (let i = 0; i < dow; i++) cells.push(null);
              for (let d = 1; d <= daysInMonth; d++) cells.push(d);
              // pad to multiple of 7
              while (cells.length % 7 !== 0) cells.push(null);
              const logged = new Set(readLoggedDays());

              return (
                <>
                  {/* Month header with prev / next */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div onClick={() => stepMonth(-1)} className="archive-pressable" style={{
                      width: 30, height: 30, borderRadius: 15,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: 'rgba(255,255,255,0.06)', cursor: 'pointer',
                    }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 6l-6 6 6 6"/>
                      </svg>
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 500, color: '#fff', letterSpacing: -0.2 }}>
                      {monthName} {year}
                    </div>
                    <div onClick={() => stepMonth(1)} className="archive-pressable" style={{
                      width: 30, height: 30, borderRadius: 15,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: 'rgba(255,255,255,0.06)', cursor: 'pointer',
                    }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 6l6 6-6 6"/>
                      </svg>
                    </div>
                  </div>

                  {/* Day-of-week header */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 6 }}>
                    {['M','T','W','T','F','S','S'].map((l, i) => (
                      <div key={i} style={{
                        textAlign: 'center', fontSize: 10, fontWeight: 500,
                        color: 'rgba(255,255,255,0.4)', letterSpacing: 0.5,
                      }}>{l}</div>
                    ))}
                  </div>

                  {/* Date grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
                    {cells.map((d, i) => {
                      if (d == null) return <div key={i} />;
                      const cellDate = new Date(year, month, d);
                      const dateKey = ymd(cellDate);
                      const isToday = year === todayY && month === todayM && d === todayD;
                      const isFuture = cellDate > today && !isToday;
                      const hasFit = logged.has(dateKey);
                      const tappable = !isToday && !isFuture;
                      const onTap = () => {
                        if (!tappable) return;
                        setCalOpen(false);
                        if (typeof window !== 'undefined') window.__archiveDetailKey = dateKey;
                        window.__archiveGo && window.__archiveGo('detail');
                      };
                      return (
                        <div key={i}
                          onClick={onTap}
                          className={tappable ? 'archive-pressable' : ''}
                          style={{
                            aspectRatio: '1/1',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            borderRadius: 10,
                            cursor: tappable ? 'pointer' : 'default',
                            background: isToday
                              ? `rgba(${accentRgba}, 0.22)`
                              : (hasFit ? 'rgba(255,255,255,0.06)' : 'transparent'),
                            boxShadow: isToday ? `inset 0 0 0 1px rgba(${accentRgba}, 0.55)` : 'none',
                            color: isFuture ? 'rgba(255,255,255,0.25)' : (isToday ? accent : '#fff'),
                            fontSize: 13,
                            fontWeight: isToday ? 600 : 400,
                            position: 'relative',
                          }}>
                          {d}
                          {hasFit && !isToday && (
                            <div style={{
                              position: 'absolute', bottom: 4, left: '50%', transform: 'translateX(-50%)',
                              width: 3, height: 3, borderRadius: 1.5,
                              background: accent,
                            }} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
              );
            })()}
          </div>
        </div>

        {(() => {
          const streak = computeStreak();
          const weekDays = getThisWeekDays();
          const todayDate = new Date();
          const dayName = todayDate.toLocaleDateString('en-US', { weekday: 'long' });
          const dateNum = todayDate.getDate();
          const daysThisWeekLogged = weekDays.filter(d => d.hasFit).length;
          const weekProgress = daysThisWeekLogged / 7;

          // Streak ring sizing
          const ringSize = 36;
          const ringStroke = 1.5;
          const ringR = (ringSize - ringStroke) / 2;
          const ringC = 2 * Math.PI * ringR;
          const ringDash = Math.max(0, Math.min(1, weekProgress)) * ringC;

          return (
            <React.Fragment>
              {/* Weather + compact This-week chip on one row */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                gap: 12, marginBottom: 14,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <WeatherIcon type={weather.icon} size={18} color="#F5F0E8" />
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                    <span style={{
                      fontSize: 22, color: 'var(--text-primary)',
                      letterSpacing: '-0.05em', lineHeight: 1,
                    }}>
                      {weather.temp}°
                    </span>
                    <span style={{
                      fontSize: 13, color: 'var(--text-secondary)',
                      letterSpacing: '-0.02em',
                    }}>
                      {weather.condition}
                    </span>
                  </div>
                </div>
                {(() => {
                  // Compact this-week chip: stack of mini photo previews + count.
                  const wkDays = getThisWeekDays().filter(d => !d.isFuture);
                  const wkPhotos = wkDays.flatMap(d => getSavedFitPhotos(d.dateKey));
                  if (wkPhotos.length === 0) return null;
                  const preview = wkPhotos.slice(-3);
                  const TILE = 22;
                  const STRIDE = 13;
                  return (
                    <div
                      onClick={() => window.__archiveGo && window.__archiveGo('story')}
                      className="archive-pressable"
                      style={{
                        display: 'flex', alignItems: 'center', gap: 7,
                        padding: '4px 11px 4px 5px', borderRadius: 999,
                        background: 'rgba(255,240,220,0.04)',
                        border: '1px solid rgba(255,240,220,0.07)',
                        cursor: 'pointer',
                      }}>
                      <div style={{
                        position: 'relative',
                        width: 5 + preview.length * STRIDE + (TILE - STRIDE),
                        height: TILE, flexShrink: 0,
                      }}>
                        {preview.map((p, i) => (
                          <div key={i} style={{
                            position: 'absolute', left: 5 + i * STRIDE, top: 0,
                            width: TILE, height: TILE, borderRadius: 6,
                            overflow: 'hidden',
                            boxShadow:
                              'inset 0 0 0 1px rgba(0,0,0,0.6), ' +
                              'inset 0 0 0 1.5px rgba(255,255,255,0.18)',
                            zIndex: preview.length - i,
                          }}>
                            <img src={p} alt="" style={{
                              width: '100%', height: '100%', objectFit: 'cover', display: 'block',
                            }} />
                          </div>
                        ))}
                      </div>
                      <span style={{
                        fontSize: 12, color: '#fff', fontWeight: 500, letterSpacing: -0.1,
                      }}>
                        {wkPhotos.length} {wkPhotos.length === 1 ? 'fit' : 'fits'}
                      </span>
                    </div>
                  );
                })()}
              </div>

              {/* (week strip removed — replaced by the TODAY date selector + calendar dropdown at the top of the screen) */}
              <div style={{ display: 'none' }}>
                <div style={{
                  display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)',
                }}>
                  {weekDays.map((d, i) => {
                    // The current day isn't tappable (you're already on Today).
                    // Every other day jumps to the Detail screen pre-loaded
                    // with that date's photo.
                    const tappable = !d.isToday;
                    const onTap = (e) => {
                      if (!tappable) return;
                      e.stopPropagation();
                      if (typeof window !== 'undefined') window.__archiveDetailKey = d.dateKey;
                      window.__archiveGo && window.__archiveGo('detail');
                    };
                    return (
                      <div key={i}
                        onClick={onTap}
                        className={tappable ? 'archive-pressable' : ''}
                        style={{
                          display: 'flex', flexDirection: 'column',
                          alignItems: 'center',
                          cursor: tappable ? 'pointer' : 'default',
                          opacity: d.isFuture ? 0.5 : 1,
                          padding: '4px 0',
                        }}>
                        {/* Compact pill — letter + date stacked tight */}
                        <div style={{
                          background: d.isToday ? `rgba(${accentRgba}, 0.22)` : 'transparent',
                          borderRadius: 11,
                          padding: '3px 0',
                          width: 26,
                          display: 'flex', flexDirection: 'column',
                          alignItems: 'center', gap: 0,
                        }}>
                          <span style={{
                            fontSize: 10,
                            color: d.isToday ? accent : '#B5A89A',
                            letterSpacing: '0.05em',
                            lineHeight: 1.1,
                          }}>
                            {d.letter}
                          </span>
                          <span style={{
                            fontSize: 13,
                            color: d.isToday ? accent : '#D4C8B8',
                            letterSpacing: '-0.02em',
                            lineHeight: 1.1,
                          }}>
                            {d.dateNum}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </React.Fragment>
          );
        })()}


        {/* Log today's fit — primary CTA */}
        {(() => {
          const todayLogged = new Set(readLoggedDays()).has(ymd(new Date()));
          if (todayLogged) return null;
          return (
            <div
              onClick={() => window.__archiveGo && window.__archiveGo('rating')}
              className="archive-pressable"
              style={{
                marginTop: 4, marginBottom: 8,
                padding: '13px 18px', borderRadius: 14,
                background: `linear-gradient(135deg, rgba(${accentRgba},0.22) 0%, rgba(${accentRgba},0.08) 100%)`,
                border: `1px solid rgba(${accentRgba},0.35)`,
                boxShadow: `inset 0 1px 0 rgba(255,255,255,0.08), 0 4px 14px rgba(${accentRgba},0.18)`,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                cursor: 'pointer',
              }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 30, height: 30, borderRadius: 15,
                  background: `linear-gradient(135deg, ${accent} 0%, ${accentHot} 100%)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" strokeWidth="2.6" strokeLinecap="round">
                    <path d="M12 5v14M5 12h14"/>
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: 14, color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                    Log today's fit
                  </div>
                </div>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 6l6 6-6 6"/>
              </svg>
            </div>
          );
        })()}

        {/* This Week — relocated as a compact chip next to weather. The
            standalone bar below is suppressed; everything still renders the
            current week so the IIFE stays around but returns null. */}
        {false && (() => {
          const allDays = getThisWeekDays();
          // Drop future days from the strip entirely.
          const days = allDays.filter(d => !d.isFuture);
          const loggedCount = days.filter(d => d.hasFit).length;

          // Empty-state: no logged days yet this week → no tile row, just one prompt.
          if (loggedCount === 0) {
            return (
              <div
                onClick={() => window.__archiveGo && window.__archiveGo('rating')}
                className="archive-pressable"
                style={{
                  marginTop: 22, marginBottom: 22,
                  padding: '16px 18px', borderRadius: 18,
                  background: 'rgba(255,240,220,0.04)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,240,220,0.07)',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.22)',
                  display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer',
                }}>
                <div style={{
                  width: 42, height: 42, borderRadius: 12,
                  background: `linear-gradient(135deg, ${accent} 0%, ${accentHot} 100%)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: `0 6px 16px -2px rgba(${accentRgba},0.5)`,
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" strokeWidth="2.6" strokeLinecap="round">
                    <path d="M12 5v14M5 12h14"/>
                  </svg>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 500, color: '#fff', letterSpacing: -0.2, marginBottom: 2 }}>
                    This week starts here
                  </div>
                  <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    Log a fit and it shows up across the week.
                  </div>
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 6l6 6-6 6"/>
                </svg>
              </div>
            );
          }

          // Flatten ALL fits this week (multiple per day) into one list,
          // most recent at the end, then preview the last 3 in the stack.
          const weekPhotos = days.flatMap(d =>
            getSavedFitPhotos(d.dateKey).map(p => ({ photo: p, dateKey: d.dateKey }))
          );
          const totalFits = weekPhotos.length;
          const previewItems = weekPhotos.slice(-3);
          return (
            <div
              onClick={() => window.__archiveGo && window.__archiveGo('story')}
              className="archive-pressable"
              style={{
                marginTop: 22, marginBottom: 22,
                padding: '12px 16px 12px 14px', borderRadius: 18,
                background: 'rgba(255,240,220,0.04)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,240,220,0.07)',
                boxShadow: '0 4px 16px rgba(0,0,0,0.22)',
                display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer',
              }}>
              {/* Stacked photo previews — every fit, most recent on top */}
              <div style={{
                position: 'relative',
                width: 18 + previewItems.length * 22,
                height: 50, flexShrink: 0,
              }}>
                {previewItems.map((item, i) => {
                  const left = i * 22;
                  const z = previewItems.length - i;
                  return (
                    <div key={i} style={{
                      position: 'absolute', left, top: 0,
                      width: 40, height: 50, borderRadius: 10,
                      overflow: 'hidden',
                      background: '#0a0a0a',
                      boxShadow:
                        'inset 0 0 0 1.5px rgba(0,0,0,0.6), ' +
                        'inset 0 0 0 2.5px rgba(255,255,255,0.16)',
                      zIndex: z,
                    }}>
                      <img src={item.photo} alt="" style={{
                        width: '100%', height: '100%', objectFit: 'cover', display: 'block',
                      }} />
                    </div>
                  );
                })}
              </div>

              {/* Right side: title + count */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 15, fontWeight: 500, color: '#fff',
                  letterSpacing: -0.2, marginBottom: 2,
                }}>
                  This week
                </div>
                <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', letterSpacing: 0.2 }}>
                  {totalFits} {totalFits === 1 ? 'fit' : 'fits'} · {days.length} {days.length === 1 ? 'day' : 'days'} so far
                </div>
              </div>

              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 6l6 6-6 6"/>
              </svg>
            </div>
          );
        })()}

        {typeof window !== 'undefined' && window.__archiveEmpty &&
          <div style={{
            marginTop: 30, marginBottom: 8,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8
          }}>
            <div style={{
              fontFamily: 'Inter, sans-serif', fontWeight: 300,
              fontSize: 14, color: 'var(--text-primary)', letterSpacing: 0.1
            }}>Your archive starts here.</div>
            <div style={{
              fontFamily: 'Inter, sans-serif', fontWeight: 300,
              fontSize: 12, color: 'var(--text-muted)', letterSpacing: 0.1
            }}>Log your first fit to get started.</div>
            <button onClick={() => window.__archiveGo && window.__archiveGo('rating')} style={{
              marginTop: 8,
              padding: '9px 18px', borderRadius: 100,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.18)',
              color: 'var(--text-primary)',
              fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 400,
              letterSpacing: 0.1, cursor: 'pointer',
              backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)'
            }}>+ Log fit</button>
          </div>
        }

        {/* ── Fit Score gauge — compact, no card wrapper ── */}
        {(() => {
          const score = fitScore.score;
          const R = 58, STROKE = 11;
          const PAD = STROKE / 2 + 3;
          const cx = R + PAD;
          const cy = R + PAD;
          const vbW = cx * 2;
          const vbH = cy + STROKE / 2 + 2;
          const fullLen = Math.PI * R;
          const p = gaugeProgress;
          const angle = Math.PI * (1 - p);
          const dotX = cx + R * Math.cos(angle);
          const dotY = cy - R * Math.sin(angle);
          const arcD = `M ${cx - R} ${cy} A ${R} ${R} 0 0 1 ${cx + R} ${cy}`;
          const ease = 'cubic-bezier(0.34, 1.56, 0.64, 1)';
          return (
            <div
              onClick={() => window.__archiveGo && window.__archiveGo('fitscore')}
              className="archive-pressable"
              style={{
                marginTop: 10, marginBottom: 6,
                cursor: 'pointer',
              }}>
              <div style={{ position: 'relative', width: 170, margin: '0 auto' }}>
                <svg viewBox={`0 0 ${vbW} ${vbH}`} style={{ width: '100%', display: 'block', overflow: 'visible' }}>
                  <defs>
                    <linearGradient id="fit-gauge-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%"  stopColor="rgba(255,255,255,0.22)" />
                      <stop offset="55%" stopColor={accent} stopOpacity="0.85" />
                      <stop offset="100%" stopColor={accent} />
                    </linearGradient>
                  </defs>
                  <path
                    d={arcD}
                    stroke="rgba(255,255,255,0.10)"
                    strokeWidth={STROKE}
                    strokeLinecap="round"
                    fill="none"
                  />
                  <path
                    d={arcD}
                    stroke="url(#fit-gauge-grad)"
                    strokeWidth={STROKE}
                    strokeLinecap="round"
                    fill="none"
                    strokeDasharray={fullLen}
                    strokeDashoffset={fullLen - fullLen * p}
                    style={{
                      filter: `drop-shadow(0 0 4px ${accent})`,
                      transition: `stroke-dashoffset 1200ms ${ease}`,
                    }}
                  />
                  <circle
                    cx={dotX}
                    cy={dotY}
                    r={STROKE / 2 - 1.5}
                    fill="#fff"
                    style={{
                      filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.35))',
                      transition: `cx 1200ms ${ease}, cy 1200ms ${ease}`,
                    }}
                  />
                </svg>
                <div style={{
                  position: 'absolute',
                  left: 0, right: 0,
                  top: `${(cy - 8) / vbH * 100}%`,
                  transform: 'translateY(-50%)',
                  textAlign: 'center',
                  pointerEvents: 'none',
                }}>
                  <div style={{
                    fontSize: 28, fontWeight: 700, color: '#fff',
                    letterSpacing: -1, lineHeight: 1,
                    fontFamily: '"DM Sans", -apple-system, system-ui, sans-serif',
                  }}>
                    {score}
                  </div>
                  <div style={{
                    fontSize: 8.5, color: 'rgba(255,255,255,0.55)',
                    letterSpacing: 2, fontWeight: 500, marginTop: 3,
                    fontFamily: '"DM Sans", sans-serif',
                  }}>
                    FIT SCORE
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        <div style={{
          marginTop: 22, marginBottom: 8,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill={accent} aria-hidden="true">
              <path d="M12 2l1.7 5.4L19 9l-5.3 1.6L12 16l-1.7-5.4L5 9l5.3-1.6z"/>
            </svg>
            <span style={{ fontSize: 16, color: 'var(--text-primary)', fontWeight: 500, letterSpacing: -0.1 }}>
              {(() => {
                const d = new Date();
                const weekday = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][d.getDay()];
                const month = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.getMonth()];
                return `${weekday}, ${month} ${d.getDate()}`;
              })()}
            </span>
          </div>
        </div>

        {(() => {
          // One card per saved photo today. If nothing logged yet, show one
          // placeholder so the carousel still has a visible "today" tile.
          const todayPhotos = getSavedFitPhotos(todayKey);
          const picks = todayPhotos.length
            ? todayPhotos.map((p, i) => ({ photo: p, index: i }))
            : [{ photo: null, index: null }];
          return (
            <>
            <div className="picks-row"
              ref={picksRowRef}
              onScroll={onPicksScroll}
              onPointerDown={onPicksDown}
              style={{
              display: 'flex',
              gap: 12,
              overflowX: 'auto',
              overflowY: 'hidden',
              scrollSnapType: 'x mandatory',
              WebkitOverflowScrolling: 'touch',
              scrollbarWidth: 'none',
              margin: '0 -24px',
              paddingBottom: 6,
              cursor: 'grab',
            }}>
              <style>{`.picks-row::-webkit-scrollbar{display:none}`}</style>
              {/* Leading spacer — keeps first card centered when scrollLeft=0 */}
              <div aria-hidden="true" style={{ flex: '0 0 8%' }} />
              {picks.map((p, i) => (
                <div key={`pick-${i}-${p.photo ? p.photo.slice(-12) : 'placeholder'}`}
                  data-pick-idx={i}
                  style={{
                    flex: '0 0 84%',
                    scrollSnapAlign: 'center',
                    borderRadius: 24, position: 'relative',
                  }}>
                  <div onClick={() => {
                    // Tap an existing card → edit that index. Empty placeholder → add new.
                    if (typeof window !== 'undefined') {
                      window.__archiveRatingIndex = p.index;
                    }
                    window.__archiveGo && window.__archiveGo('rating');
                  }}
                    style={{ position: 'relative', padding: 0, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', cursor: 'pointer', gap: 12 }}>
                    <div style={{ borderRadius: 18, overflow: 'hidden', position: 'relative' }}>
                      {p.photo ? (
                        <img src={p.photo} alt="" style={{
                          display: 'block', width: '100%', height: 'auto',
                          borderRadius: 18,
                        }} />
                      ) : (
                        <PhotoPlaceholder ratio="4/5" radius={18} photoId={3} noBorder />
                      )}
                      {/* Heart — top-left. Like is tied to THIS photo, not the day. */}
                      {p.index != null && (
                        <div className="archive-pressable"
                          onPointerDown={(e) => e.stopPropagation()}
                          onClick={(e) => { e.stopPropagation(); togglePhotoLike(p.index); }}
                          style={{
                            position: 'absolute', top: 14, left: 14,
                            width: 40, height: 40,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer',
                            filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.5))',
                          }}>
                          {(() => { const liked = isPhotoLiked(p.index); return (
                          <svg width="22" height="22" viewBox="0 0 24 24"
                            fill={liked ? '#F08AB0' : 'none'}
                            stroke={liked ? '#F08AB0' : '#fff'}
                            strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                          </svg>
                          ); })()}
                        </div>
                      )}
                      <div className="liquid-glass archive-pressable" onClick={(e) => { e.stopPropagation(); window.__archiveGo && window.__archiveGo('share'); }} style={{
                        position: 'absolute', bottom: 12, right: 12,
                        width: 32, height: 32, borderRadius: 16,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer'
                      }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7M16 6l-4-4-4 4M12 2v14" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {/* + Add fit — trailing card; opens Rating in "add new" mode */}
              <div
                onClick={() => {
                  if (typeof window !== 'undefined') window.__archiveRatingIndex = null;
                  window.__archiveGo && window.__archiveGo('rating');
                }}
                className="archive-pressable"
                data-pick-idx={picks.length}
                style={{
                  flex: '0 0 84%',
                  scrollSnapAlign: 'center',
                  borderRadius: 24,
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer',
                  minHeight: 360,
                }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 28,
                  background: `linear-gradient(135deg, ${accent} 0%, ${accentHot} 100%)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: `0 8px 22px -4px rgba(${accentRgba},0.55)`,
                  marginBottom: 14,
                }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" strokeWidth="2.8" strokeLinecap="round">
                    <path d="M12 5v14M5 12h14"/>
                  </svg>
                </div>
                <div style={{ fontSize: 15, color: '#fff', fontWeight: 600, letterSpacing: '-0.01em' }}>
                  Add a fit
                </div>
                <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.6)', marginTop: 4, letterSpacing: 0.3 }}>
                  Log today's outfit
                </div>
              </div>
              {/* Trailing spacer — keeps the last card centered when scrolled to end */}
              <div aria-hidden="true" style={{ flex: '0 0 8%' }} />
            </div>
            {/* Page indicator dots — tap to jump to that card */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 14, marginBottom: 4 }}>
              {[...picks, 'add'].map((_, i) => (
                <div key={i}
                  onClick={() => {
                    const row = picksRowRef.current;
                    if (!row) return;
                    const target = row.querySelector(`[data-pick-idx="${i}"]`);
                    if (!target) return;
                    const left = target.offsetLeft - (row.clientWidth - target.offsetWidth) / 2;
                    row.scrollTo({ left, behavior: 'smooth' });
                  }}
                  className="archive-pressable"
                  style={{
                    width: i === picksIdx ? 28 : 8, height: 8, borderRadius: 4,
                    background: i === picksIdx ? '#fff' : 'rgba(255,255,255,0.35)',
                    cursor: 'pointer',
                    // Larger invisible hit target without changing visual size
                    boxShadow: '0 0 0 6px transparent',
                    transition: 'width .25s ease, background .25s ease',
                  }} />
              ))}
            </div>
            </>
          );
        })()}

        {(() => {
          const allLogged = readLoggedDays();
          const weekDaysHere = getThisWeekDays();
          const fitsThisWeek = weekDaysHere.filter(d => d.hasFit).length;
          // Aggregate stat data for all 6 cards
          const sortedLogged = [...allLogged].sort();
          let bestStreak = 0, run = 0, prev = null;
          for (const day of sortedLogged) {
            const d = new Date(day);
            if (prev && (d - prev) === 86400000) run++;
            else run = 1;
            bestStreak = Math.max(bestStreak, run);
            prev = d;
          }
          let likedCount = 0;
          try { likedCount = JSON.parse(localStorage.getItem('aevum_liked_fits') || '[]').length; } catch (e) {}
          let piecesCount = 0;
          try { piecesCount = JSON.parse(localStorage.getItem('aevum_pieces') || '[]').length; } catch (e) {}
          const wardrobe = getWardrobeCompletion();
          const now = new Date();
          const thisMonthCount = allLogged.filter(d => {
            const dd = new Date(d);
            return dd.getFullYear() === now.getFullYear() && dd.getMonth() === now.getMonth();
          }).length;

          const statsById = {
            week:   { value: String(fitsThisWeek),             unit: '/ 7 days',                       label: 'THIS WEEK',   nav: 'streak' },
            fits:   { value: String(allLogged.length || 312),  unit: 'total',                          label: 'FITS LOGGED', nav: 'archive' },
            best:   { value: String(bestStreak || 47),         unit: (bestStreak || 47) === 1 ? 'day' : 'days', label: 'BEST STREAK', nav: 'streak' },
            month:  { value: String(thisMonthCount || 23),     unit: '/ 30 days',                      label: 'THIS MONTH',  nav: 'calendar' },
            liked:  { value: String(likedCount || 8),          unit: (likedCount || 8) === 1 ? 'fit' : 'fits', label: 'LIKED',       nav: 'archive' },
            pieces: { value: wardrobe.target ? `${wardrobe.percent}%` : String(piecesCount || 0),
                      unit:  wardrobe.target ? 'cataloged' : (piecesCount === 1 ? 'piece' : 'pieces'),
                      label: 'WARDROBE',    nav: 'pieces' },
          };

          // While dragging, compute each non-dragged card's "live" position as if
          // the dragged card has already been inserted at statTargetSlot
          const liveOrder = (() => {
            if (!draggingStatId || statTargetSlot == null) return statOrder;
            const fromIdx = statOrder.indexOf(draggingStatId);
            if (fromIdx === statTargetSlot) return statOrder;
            const next = [...statOrder];
            const [moved] = next.splice(fromIdx, 1);
            next.splice(statTargetSlot, 0, moved);
            return next;
          })();

          return (
            <div
              ref={statsGridRef}
              style={{ marginTop: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: STAT_GAP, position: 'relative' }}>
              {STAT_DOM_ORDER.map((id) => {
                const stat = statsById[id];
                const isDragging = draggingStatId === id;
                const domSlot = STAT_DOM_ORDER.indexOf(id);
                const logicalSlot = (isDragging ? statOrder : liveOrder).indexOf(id);
                const dom = slotToGrid(domSlot);
                const logical = slotToGrid(logicalSlot);
                const shiftX = (logical.col - dom.col) * STAT_COL_W + (isDragging ? statDrag.x : 0);
                const shiftY = (logical.row - dom.row) * STAT_ROW_H + (isDragging ? statDrag.y : 0);
                return (
                  <div key={id} data-stat-card
                    onClick={() => { if (!isDragging) window.__archiveGo && window.__archiveGo(stat.nav); }}
                    className="archive-pressable" style={{
                    /* Match the Streak screen card treatment — softer cream-tinted glass */
                    background: 'rgba(255,240,220,0.04)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,240,220,0.07)',
                    boxShadow: isDragging
                      ? '0 16px 40px rgba(0,0,0,0.55)'
                      : '0 4px 16px rgba(0,0,0,0.22)',
                    borderRadius: 16, padding: 14, aspectRatio: '1.45',
                    display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                    transform: `translate(${shiftX}px, ${shiftY}px) scale(${isDragging ? 1.05 : 1})`,
                    transition: isDragging
                      ? 'none'
                      : 'transform .55s cubic-bezier(.32,.72,0,1), box-shadow .3s ease',
                    zIndex: isDragging ? 10 : 1,
                    cursor: isDragging ? 'grabbing' : 'pointer',
                  }}>
                    {/* Label at top + small drag grip in the top-right corner */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                      <div style={{
                        fontSize: 10, color: 'var(--text-secondary)',
                        letterSpacing: 1.3, fontWeight: 500,
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      }}>
                        {stat.label}
                      </div>
                      <div
                        onClick={(e) => e.stopPropagation()}
                        onPointerDown={(e) => onStatGripDown(id, e)}
                        onPointerMove={onStatGripMove}
                        onPointerUp={onStatGripUp}
                        onPointerCancel={onStatGripUp}
                        style={{
                          padding: 6, margin: -6, flexShrink: 0,
                          touchAction: 'none',
                          cursor: 'grab',
                          display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 3,
                          opacity: 0.5,
                        }}>
                        <div style={{ width: 12, height: 1.5, borderRadius: 1, background: 'rgba(255,255,255,0.7)', pointerEvents: 'none' }} />
                        <div style={{ width: 12, height: 1.5, borderRadius: 1, background: 'rgba(255,255,255,0.7)', pointerEvents: 'none' }} />
                      </div>
                    </div>
                    {/* Big number + inline unit, like the Streak screen */}
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                      <div style={{ fontSize: 36, fontWeight: 700, letterSpacing: -1.4, lineHeight: 1, color: 'var(--text-primary)' }}>{stat.value}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 500, letterSpacing: 0.2 }}>{stat.unit}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })()}

        {(() => {
          const todayStr = ymd(new Date());
          const recent = readLoggedDays()
            .filter(d => d !== todayStr)
            .sort((a, b) => b.localeCompare(a))
            .slice(0, 6);

          // Empty (first-load) state — one inviting prompt instead of six
          // rainbow-bordered placeholders.
          if (recent.length === 0) {
            return (
              <>
                <div style={{ marginTop: 28, display: 'flex', alignItems: 'baseline', marginBottom: 14 }}>
                  <span style={{ fontSize: 16, color: 'var(--text-primary)', fontWeight: 500, letterSpacing: -0.1 }}>
                    Recent
                  </span>
                </div>
                <div
                  onClick={() => window.__archiveGo && window.__archiveGo('rating')}
                  className="archive-pressable"
                  style={{
                    padding: '20px 18px', borderRadius: 18,
                    background: 'rgba(255,240,220,0.04)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,240,220,0.07)',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.22)',
                    display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer',
                  }}>
                  <div style={{
                    width: 46, height: 46, borderRadius: 14,
                    background: `linear-gradient(135deg, ${accent} 0%, ${accentHot} 100%)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                    boxShadow: `0 6px 16px -2px rgba(${accentRgba},0.5)`,
                  }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" strokeWidth="2.4" strokeLinecap="round">
                      <path d="M12 5v14M5 12h14"/>
                    </svg>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 500, color: '#fff', letterSpacing: -0.2, marginBottom: 2 }}>
                      Start your archive
                    </div>
                    <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                      Log a fit and the last six days fill in here.
                    </div>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 6l6 6-6 6"/>
                  </svg>
                </div>
              </>
            );
          }

          // Has logged days — show real photos only, no rainbow placeholders.
          function relativeLabel(dateStr) {
            const d = new Date(dateStr);
            const today = new Date();
            const diff = Math.round((today - d) / 86400000);
            if (diff === 1) return 'Yesterday';
            if (diff < 7) return ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.getDay()];
            return `${d.getMonth() + 1}/${d.getDate()}`;
          }
          return (
            <>
              <div style={{ marginTop: 28, display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
                <span style={{ fontSize: 16, color: 'var(--text-primary)', fontWeight: 500, letterSpacing: -0.1 }}>
                  Recent
                </span>
                <span onClick={() => window.__archiveGo && window.__archiveGo('archive')} style={{ fontSize: 15, color: accent, fontWeight: 500, cursor: 'pointer' }}>See all</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {recent.map((dateStr, idx) => (
                  <div key={dateStr} onClick={() => {
                    if (typeof window !== 'undefined') window.__archiveDetailKey = dateStr;
                    window.__archiveGo && window.__archiveGo('detail');
                  }} style={{ cursor: 'pointer', position: 'relative' }}>
                    <PhotoPlaceholder ratio="3/4" radius={12} photoId={idx + 5} photoKey={dateStr} noBorder />
                    <div style={{
                      position: 'absolute', bottom: 7, left: 9,
                      fontSize: 14, color: 'var(--text-primary)',
                      fontWeight: 500, letterSpacing: -0.1,
                      textShadow: '0 1px 4px rgba(0,0,0,0.6)'
                    }}>{relativeLabel(dateStr)}</div>
                  </div>
                ))}
              </div>
            </>
          );
        })()}

        <div style={{ marginTop: 32, display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div style={{ width: 3, height: 14, borderRadius: 1.5, background: accent }} />
          <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', letterSpacing: -0.4, fontFamily: '"DM Sans", sans-serif' }}>
            WARDROBE PULSE
          </span>
        </div>
        <div style={{
          borderRadius: 20, padding: 18,
          background: 'rgba(255,240,220,0.04)',
          backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,240,220,0.07)',
          boxShadow: '0 4px 16px rgba(0,0,0,0.22)',
        }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
            <span style={{ fontSize: 18, fontWeight: 500, letterSpacing: -0.3 }}>Most worn this month</span>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>Apr</span>
          </div>
          {[
            { name: 'Cream knit', count: 12, pct: 100 },
            { name: 'Rust suede jacket', count: 9, pct: 75 },
            { name: 'Black trousers', count: 7, pct: 58 }
          ].map((item, i) =>
            <div key={i} style={{ marginBottom: i === 2 ? 0 : 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: 500 }}>{item.name}</span>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>{item.count}×</span>
              </div>
              <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                <div style={{
                  width: `${item.pct}%`, height: '100%',
                  background: `linear-gradient(90deg, ${accent} 0%, ${accentHot} 100%)`,
                }} />
              </div>
            </div>
          )}
        </div>

        <div style={{ marginTop: 24, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 3, height: 14, borderRadius: 1.5, background: accent }} />
          <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', letterSpacing: -0.4, fontFamily: '"DM Sans", sans-serif' }}>
            STYLE INSIGHT
          </span>
        </div>
        <div style={{
          borderRadius: 20,
          background: 'rgba(255,240,220,0.04)',
          backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,240,220,0.07)',
          boxShadow: '0 4px 16px rgba(0,0,0,0.22)',
        }}>
          <div style={{ padding: 18 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 18, flexShrink: 0,
                background: `radial-gradient(circle at 30% 30%, ${accentHot}, ${accentDeep})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 16.8l-6.2 4.5 2.4-7.4L2 9.4h7.6z" />
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <div className="h-display" style={{ fontSize: 22, lineHeight: 1.15, marginBottom: 6, letterSpacing: -0.4 }}>
                  You wear <em>warm tones</em> 3× more on weekends.
                </div>
                <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5, fontWeight: 500 }}>
                  Try a navy or sage piece this Saturday for contrast.
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 24, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 3, height: 14, borderRadius: 1.5, background: accent }} />
          <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', letterSpacing: -0.4, fontFamily: '"DM Sans", sans-serif' }}>
            GOALS · APRIL
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
          {[
            { label: 'No-repeat days', value: '23', total: '/30', pct: 76 },
            { label: 'New combos', value: '8', total: '/12', pct: 66 },
            { label: 'Vintage worn', value: '4×', total: ' this wk', pct: 100 },
            { label: 'Closet rotated', value: '67', total: '%', pct: 67 }
          ].map((g, i) =>
            <div key={i} style={{
              borderRadius: 16, padding: 14,
              background: 'rgba(255,240,220,0.04)',
              backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,240,220,0.07)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.22)',
            }}>
              <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', letterSpacing: -0.2, textTransform: 'uppercase', marginBottom: 8 }}>{g.label}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 2, marginBottom: 8 }}>
                <span className="h-display" style={{ fontSize: 28, lineHeight: 1, color: 'var(--text-primary)', letterSpacing: -0.6 }}>{g.value}</span>
                <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>{g.total}</span>
              </div>
              <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                <div style={{
                  width: `${g.pct}%`, height: '100%',
                  background: `linear-gradient(90deg, ${accent} 0%, ${accentHot} 100%)`
                }} />
              </div>
            </div>
          )}
        </div>

        <div style={{ marginTop: 24, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 3, height: 14, borderRadius: 1.5, background: accent }} />
          <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', letterSpacing: -0.4, fontFamily: '"DM Sans", sans-serif' }}>
            DAILY PROMPT
          </span>
        </div>
        <div style={{
          borderRadius: 20, padding: 20, marginBottom: 8,
          background: 'rgba(255,240,220,0.04)',
          backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,240,220,0.07)',
          boxShadow: '0 4px 16px rgba(0,0,0,0.22)',
        }}>
          <div className="h-display" style={{ fontSize: 26, lineHeight: 1.15, color: 'var(--text-primary)', marginBottom: 12, letterSpacing: -0.4 }}>
            Style something you <em>haven't worn</em> in 30 days.
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
            <button onClick={() => window.__archiveGo && window.__archiveGo('mix')} style={{
              flex: 1, border: 'none', cursor: 'pointer',
              padding: '12px 16px', borderRadius: 12,
              background: `linear-gradient(135deg, ${accent} 0%, ${accentHot} 100%)`,
              color: '#1a0d2e', fontSize: 14, fontWeight: 500, letterSpacing: -0.2
            }}>Show me ideas</button>
            <button style={{
              border: '1px solid rgba(255,255,255,0.12)', cursor: 'pointer',
              padding: '12px 16px', borderRadius: 12,
              background: 'rgba(255,255,255,0.04)',
              color: 'var(--text-primary)', fontSize: 14, fontWeight: 500, letterSpacing: -0.2
            }}>Skip</button>
          </div>
        </div>
      </div>

      <TabBar active="today" />
    </div>
  );
}
