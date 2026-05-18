import React from 'react';
import {
  useTheme, bgColor, fgColor,
  ArchiveBurger, StatusBar, GlowCard, Glass, TabBar, PhotoPlaceholder, fitGradient, fitBorder,
} from '../lib/shared.jsx';
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
    return {
      letter: letters[i],
      dateNum: d.getDate(),
      isToday: d.toDateString() === today.toDateString(),
      hasFit: logged.has(ymd(d)),
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

  // ── Today's fit carousel — scroll-driven active dot ──
  const [picksIdx, setPicksIdx] = React.useState(0);
  const picksRowRef = React.useRef(null);
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

      <div style={{ position: 'relative', zIndex: 2, padding: 'calc(12px + var(--archive-safe-top, 54px)) 28px calc(120px + var(--archive-safe-bottom, 0px))', height: '100%', overflow: 'auto', boxSizing: 'border-box' }}>
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
              {/* Header — hamburger + "12 Tuesday" clustered LEFT, streak RIGHT */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginTop: 8, marginBottom: 12,
              }}>
                {/* LEFT GROUP — hamburger menu, then weather right next to it */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div
                    onClick={() => window.__archiveToggleNav && window.__archiveToggleNav()}
                    className="archive-pressable"
                    style={{
                      width: 24, height: 22,
                      display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 6,
                      cursor: 'pointer',
                    }}>
                    <div style={{ width: 22, height: 2.5, borderRadius: 1.5, background: 'var(--text-primary)' }} />
                    <div style={{ width: 22, height: 2.5, borderRadius: 1.5, background: 'var(--text-primary)' }} />
                    <div style={{ width: 22, height: 2.5, borderRadius: 1.5, background: 'var(--text-primary)' }} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <WeatherIcon type={weather.icon} size={22} color="#F5F0E8" />
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                      <span style={{
                        fontSize: 32, color: 'var(--text-primary)',
                        letterSpacing: '-0.05em', lineHeight: 1,
                      }}>
                        {weather.temp}°
                      </span>
                      <span style={{
                        fontSize: 16, color: 'var(--text-secondary)',
                        letterSpacing: '-0.02em',
                      }}>
                        {weather.condition}
                      </span>
                    </div>
                  </div>
                </div>

                {/* RIGHT — flame + streak number inside a darkened pill */}
                <div
                  onClick={() => window.__archiveGo && window.__archiveGo('streak')}
                  className="archive-pressable"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '6px 12px 6px 10px',
                    borderRadius: 999,
                    background: 'rgba(0,0,0,0.35)',
                    border: '1px solid rgba(255,255,255,0.10)',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    cursor: 'pointer',
                  }}>
                  <div className="archive-flame" style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.4))',
                  }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="#FFFFFF">
                      <path d="M12 2c1 4-3 6-3 10a5 5 0 0 0 10 0c0-2-1-4-2-5 0 2-1 3-2 3 0-3-1-5-3-8z"/>
                    </svg>
                  </div>
                  <span style={{
                    fontSize: 22, color: '#FFFFFF',
                    letterSpacing: '-0.05em', lineHeight: 1,
                  }}>
                    {streak}
                  </span>
                </div>
              </div>

              {/* Week strip — compact glass card */}
              <div style={{
                borderRadius: 14,
                padding: '6px 14px',
                margin: '10px 0 18px',
                background: 'rgba(255,240,220,0.04)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,240,220,0.07)',
                boxShadow: '0 4px 16px rgba(0,0,0,0.22)',
              }}>
                <div style={{
                  display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)',
                }}>
                  {weekDays.map((d, i) => (
                    <div key={i} style={{
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', gap: 2,
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
                      {/* Logged fit indicator */}
                      <div style={{
                        width: 3, height: 3, borderRadius: 1.5,
                        background: d.hasFit ? accent : 'transparent',
                      }} />
                    </div>
                  ))}
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

        {/* Simplified "This week" — single compact pill that opens story mode */}
        <div
          onClick={() => window.__archiveGo && window.__archiveGo('story')}
          className="archive-pressable"
          style={{
            marginTop: 22, marginBottom: 22,
            padding: '14px 16px', borderRadius: 14,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            cursor: 'pointer',
            background: 'rgba(255,240,220,0.04)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,240,220,0.07)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.22)',
          }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Mini stacked story-glimpse indicator */}
            <div style={{ position: 'relative', width: 40, height: 28 }}>
              {[2, 1, 0].map((i) => (
                <div key={i} style={{
                  position: 'absolute', top: 0, left: i * 8,
                  width: 24, height: 28, borderRadius: 6,
                  background: 'linear-gradient(180deg, #1c1a1a 0%, #100e0e 100%)',
                  border: '1px solid rgba(245,240,232,0.08)',
                  zIndex: 3 - i,
                  opacity: 1 - i * 0.18,
                }} />
              ))}
            </div>
            <div>
              <div style={{
                fontSize: 14, color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: 1.2,
              }}>
                This week's stories
              </div>
              <div style={{
                fontSize: 11, color: 'var(--text-secondary)', marginTop: 3, letterSpacing: 0.4,
                textTransform: 'uppercase',
              }}>
                6 fits · tap to view
              </div>
            </div>
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#A89880" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 6l6 6-6 6"/>
          </svg>
        </div>

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

        <div style={{
          marginTop: 22, marginBottom: 8,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill={accent} aria-hidden="true">
              <path d="M12 2l1.7 5.4L19 9l-5.3 1.6L12 16l-1.7-5.4L5 9l5.3-1.6z"/>
            </svg>
            <span style={{ fontSize: 16, color: 'var(--text-primary)', fontWeight: 500, letterSpacing: -0.1 }}>
              Today's fit
            </span>
          </div>
        </div>

        {(() => {
          const picks = [
            { id: 3, num: '023', tag: 'Today', title: "Today's fit", sub: 'Tap to log or edit your photo', pct: '94%' },
          ];
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
                <div key={p.id}
                  data-pick-idx={i}
                  style={{
                    flex: '0 0 84%',
                    scrollSnapAlign: 'center',
                    borderRadius: 24, position: 'relative',
                  }}>
                  <div onClick={() => window.__archiveGo && window.__archiveGo('rating')}
                    style={{ position: 'relative', padding: 0, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', cursor: 'pointer', gap: 12 }}>
                    <div style={{ borderRadius: 18, overflow: 'hidden', position: 'relative' }}>
                      <PhotoPlaceholder ratio="4/5" radius={18} photoId={p.id} photoKey={i === 0 ? ymd(new Date()) : undefined} noBorder />
                      <div className="liquid-glass" onClick={(e) => { e.stopPropagation(); window.__archiveGo && window.__archiveGo('share'); }} style={{
                        position: 'absolute', bottom: 12, right: 12,
                        width: 32, height: 32, borderRadius: 16,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer'
                      }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7M16 6l-4-4-4 4M12 2v14" />
                        </svg>
                      </div>
                    </div>
                    <div style={{
                      padding: '14px 18px',
                      borderRadius: 20,
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
                      background: 'rgba(255,240,220,0.04)',
                      backdropFilter: 'blur(20px)',
                      WebkitBackdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255,240,220,0.07)',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.22)',
                    }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontSize: 18, fontWeight: 500, lineHeight: 1.2, marginBottom: 4, letterSpacing: -0.2,
                          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                        }}>
                          {p.title}
                        </div>
                        <div style={{
                          fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4,
                          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                        }}>
                          {p.sub}
                        </div>
                      </div>
                      <button className="liquid-glass" onClick={(e) => { e.stopPropagation(); window.__archiveGo && window.__archiveGo('rating'); }} style={{
                        border: 'none', cursor: 'pointer',
                        width: 40, height: 40, borderRadius: 20, flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'var(--text-primary)'
                      }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M5 12h14M13 6l6 6-6 6" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {/* + Add fit — trailing card */}
              <div
                onClick={() => window.__archiveGo && window.__archiveGo('rating')}
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
            {/* Page indicator dots — tracks the actual scroll position */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 5, marginTop: 10, marginBottom: 4 }}>
              {[...picks, 'add'].map((_, i) => (
                <div key={i} style={{
                  width: i === picksIdx ? 16 : 5, height: 5, borderRadius: 3,
                  background: i === picksIdx ? accent : 'rgba(255,255,255,0.25)',
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
            pieces: { value: String(piecesCount || 0),         unit: piecesCount === 1 ? 'piece' : 'pieces', label: 'PIECES',      nav: 'pieces' },
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

        <div style={{ marginTop: 28, display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
          <span style={{ fontSize: 16, color: 'var(--text-primary)', fontWeight: 500, letterSpacing: -0.1 }}>
            Recent
          </span>
          <span onClick={() => window.__archiveGo && window.__archiveGo('archive')} style={{ fontSize: 15, color: accent, fontWeight: 500, cursor: 'pointer' }}>See all</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {[0, 1, 2, 3, 4, 5].map((idx) => {
            const d = new Date();
            d.setDate(d.getDate() - (idx + 1));
            return (
              <div key={idx} onClick={() => window.__archiveGo && window.__archiveGo('detail')} style={{ cursor: 'pointer', position: 'relative' }}>
                <PhotoPlaceholder ratio="3/4" radius={12} photoId={idx + 5} photoKey={ymd(d)} />
                <div style={{
                  position: 'absolute', bottom: 7, left: 9,
                  fontSize: 14, color: 'var(--text-primary)',
                  fontWeight: 500, letterSpacing: -0.1,
                  textShadow: '0 1px 4px rgba(0,0,0,0.6)'
                }}>{['Yesterday', 'Sat', 'Fri', 'Thu', 'Wed', 'Tue'][idx]}</div>
              </div>
            );
          })}
        </div>

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
