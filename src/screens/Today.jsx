import React from 'react';
import {
  useTheme, bgColor, fgColor,
  ArchiveBurger, StatusBar, GlowCard, Glass, TabBar, PhotoPlaceholder, fitGradient, fitBorder,
} from '../lib/shared.jsx';
import LiquidMesh from '../lib/liquid-mesh.jsx';

// ─────────── Streak / week helpers (read from localStorage) ───────────
function readLoggedDays() {
  try {
    return JSON.parse(localStorage.getItem('archive_fits_logged') || '[]');
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
          fontSize: 14, fontWeight: 700, color: '#F5F0E8',
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
        color: '#5C5248', textTransform: 'uppercase',
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

      <div style={{ position: 'relative', zIndex: 2, padding: 'calc(12px + var(--archive-safe-top, 0px)) 22px calc(120px + var(--archive-safe-bottom, 0px))', height: '100%', overflow: 'auto', boxSizing: 'border-box' }}>
        {(() => {
          const streak = computeStreak();
          const weekDays = getThisWeekDays();
          const todayDate = new Date();
          const dayName = todayDate.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
          const dateNum = todayDate.getDate();
          const daysThisWeekLogged = weekDays.filter(d => d.hasFit).length;
          const weekProgress = daysThisWeekLogged / 7;

          return (
            <React.Fragment>
              {/* Header row — hamburger left, date center, streak right */}
              <div style={{
                display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
                marginBottom: 18,
              }}>
                <div
                  onClick={() => window.__archiveToggleNav && window.__archiveToggleNav()}
                  className="archive-pressable"
                  style={{
                    width: 28, height: 22, marginTop: 8,
                    display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 5,
                    cursor: 'pointer',
                  }}>
                  <div style={{ width: 22, height: 1.5, borderRadius: 1, background: '#F5F0E8' }} />
                  <div style={{ width: 22, height: 1.5, borderRadius: 1, background: '#F5F0E8' }} />
                  <div style={{ width: 22, height: 1.5, borderRadius: 1, background: '#F5F0E8' }} />
                </div>

                <div style={{
                  display: 'flex', alignItems: 'baseline', gap: 10,
                  paddingTop: 4, fontFamily: '"DM Sans", "Inter", sans-serif',
                }}>
                  <span style={{
                    fontSize: 11, fontWeight: 500, letterSpacing: 1.5,
                    color: '#A89880',
                  }}>
                    {dayName}
                  </span>
                  <span style={{ color: '#5C5248', fontSize: 14 }}>·</span>
                  <span style={{
                    fontSize: 32, fontWeight: 700, color: '#F5F0E8',
                    letterSpacing: '-0.04em', lineHeight: 1,
                  }}>
                    {dateNum}
                  </span>
                </div>

                <StreakRing
                  streak={streak}
                  weekProgress={weekProgress}
                  accent={accent}
                  onClick={() => window.__archiveGo && window.__archiveGo('you')}
                />
              </div>

              {/* Week strip — 7 day columns, M T W T F S S */}
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)',
                marginBottom: 16, paddingBottom: 14,
                borderBottom: '1px solid rgba(255,240,220,0.06)',
              }}>
                {weekDays.map((d, i) => (
                  <div key={i} style={{
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', gap: 6,
                  }}>
                    <span style={{
                      fontSize: 10, fontWeight: 500,
                      color: '#5C5248', letterSpacing: '0.05em',
                    }}>
                      {d.letter}
                    </span>
                    <div style={{
                      width: 28, height: 28, borderRadius: 14,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: d.isToday ? accent : 'transparent',
                    }}>
                      <span style={{
                        fontSize: 13, fontWeight: 600,
                        color: d.isToday ? '#0a0a0a' : '#5C5248',
                        letterSpacing: '-0.02em',
                      }}>
                        {d.dateNum}
                      </span>
                    </div>
                    <div style={{
                      width: 4, height: 4, borderRadius: 2,
                      background: d.hasFit ? accent : 'transparent',
                      marginTop: 2,
                    }} />
                  </div>
                ))}
              </div>
            </React.Fragment>
          );
        })()}

        <div style={{ marginTop: 36, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {[
            { label: 'Earth tones', primary: true },
            { label: 'Layered' },
            { label: 'Studio · Dinner' },
          ].map((tag, i) =>
            <span key={i} className={tag.primary ? 'lg-active' : 'lg-pill'} style={{
              fontSize: 13, fontWeight: 500, letterSpacing: -0.2,
              padding: '7px 14px', borderRadius: 100,
              color: tag.primary ? '#9BB89F' : 'rgba(245,240,232,0.62)',
            }}>{tag.label}</span>
          )}
        </div>

        <div style={{ marginTop: 36, marginBottom: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, paddingRight: 4 }}>
            <span style={{
              fontSize: 20, color: '#F5F0E8', fontWeight: 600, letterSpacing: '-0.03em',
            }}>
              This week
            </span>
            <span
              onClick={() => window.__archiveGo && window.__archiveGo('archive')}
              className="archive-pressable"
              style={{
                fontSize: 12, color: 'rgba(245,240,232,0.55)', fontWeight: 500,
                cursor: 'pointer', letterSpacing: '-0.01em',
                display: 'flex', alignItems: 'center', gap: 4,
              }}>
              See all
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 6l6 6-6 6"/>
              </svg>
            </span>
          </div>

          <div
            ref={(el) => {
              if (el && !el.__wheelBound) {
                el.__wheelBound = true;
                el.addEventListener('wheel', (e) => {
                  if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
                    e.preventDefault();
                    el.scrollLeft += e.deltaY;
                  }
                }, { passive: false });
              }
            }}
            className="story-row"
            style={{
              margin: '0 -24px', padding: '6px 24px 10px',
              display: 'flex', gap: 14, overflowX: 'auto', overflowY: 'hidden',
              WebkitOverflowScrolling: 'touch',
              scrollbarWidth: 'none',
            }}>
            <style>{`.story-row::-webkit-scrollbar{display:none}`}</style>
            {[
              { day: 'Mon', date: '27', isToday: true, empty: false, photoIdx: 0 },
              { day: 'Sun', date: '26', isToday: false, empty: false, photoIdx: 4 },
              { day: 'Sat', date: '25', isToday: false, empty: false, photoIdx: 9 },
              { day: 'Fri', date: '24', isToday: false, empty: true,  photoIdx: 13 },
              { day: 'Thu', date: '23', isToday: false, empty: false, photoIdx: 2 },
              { day: 'Wed', date: '22', isToday: false, empty: false, photoIdx: 7 },
              { day: 'Tue', date: '21', isToday: false, empty: false, photoIdx: 11 },
            ].map((d) => {
              const ringSize = d.isToday ? 78 : 66;
              const innerSize = ringSize - 8;
              return (
                <div
                  key={d.day}
                  onClick={() => window.__archiveGo && window.__archiveGo('story')}
                  className="archive-pressable"
                  style={{
                    flex: '0 0 auto',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
                    cursor: 'pointer',
                  }}>
                  {/* Story ring — circular w/ gradient outline (or dashed if empty) */}
                  {d.empty ? (
                    <div style={{
                      width: ringSize, height: ringSize, borderRadius: '50%',
                      border: '1.5px dashed rgba(245,240,232,0.22)',
                      background: 'rgba(255,255,255,0.02)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <svg width="22%" viewBox="0 0 24 24" fill="none"
                        stroke="rgba(245,240,232,0.35)" strokeWidth="1.5" strokeLinecap="round">
                        <path d="M12 5v14M5 12h14"/>
                      </svg>
                    </div>
                  ) : (
                    <div className="lg-border-gradient" style={{
                      position: 'relative',
                      width: ringSize, height: ringSize, borderRadius: '50%',
                      background: fitGradient(d.photoIdx),
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      overflow: 'hidden',
                      '--grad-border': d.isToday
                        ? 'linear-gradient(135deg, #C8E0C9 0%, #9BB89F 50%, #4A6A4F 100%)'
                        : fitBorder(d.photoIdx),
                    }}>
                      {/* Inner placeholder icon */}
                      <svg style={{ width: '36%', opacity: 0.28, position: 'relative', zIndex: 1 }}
                        viewBox="0 0 24 24" fill="none"
                        stroke="rgba(245,240,232,0.95)" strokeWidth="1.2"
                        strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="5" width="18" height="14" rx="2"/>
                        <circle cx="8.5" cy="10" r="1.4"/>
                        <path d="M21 15l-5-5-9 9"/>
                      </svg>
                      {/* Active day pulse dot */}
                      {d.isToday && (
                        <div style={{
                          position: 'absolute', bottom: 5, right: 5,
                          width: 9, height: 9, borderRadius: '50%',
                          background: '#9BB89F',
                          boxShadow: '0 0 0 2px #0a0807',
                          zIndex: 2,
                        }} />
                      )}
                    </div>
                  )}
                  {/* Day label */}
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      fontSize: 9, letterSpacing: 1.4, fontWeight: 600,
                      color: d.isToday ? '#9BB89F' : 'rgba(245,240,232,0.45)',
                    }}>
                      {d.isToday ? 'TODAY' : d.day.toUpperCase()}
                    </div>
                    <div style={{
                      fontSize: 13, fontWeight: 500, marginTop: 2,
                      color: d.isToday ? '#F5F0E8' : 'rgba(245,240,232,0.7)',
                      letterSpacing: '-0.02em',
                    }}>
                      {d.date}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {typeof window !== 'undefined' && window.__archiveEmpty &&
          <div style={{
            marginTop: 30, marginBottom: 8,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8
          }}>
            <div style={{
              fontFamily: 'Inter, sans-serif', fontWeight: 300,
              fontSize: 14, color: 'rgba(255,255,255,0.78)', letterSpacing: 0.1
            }}>Your archive starts here.</div>
            <div style={{
              fontFamily: 'Inter, sans-serif', fontWeight: 300,
              fontSize: 12, color: 'rgba(255,255,255,0.4)', letterSpacing: 0.1
            }}>Log your first fit to get started.</div>
            <button onClick={() => window.__archiveGo && window.__archiveGo('rating')} style={{
              marginTop: 8,
              padding: '9px 18px', borderRadius: 100,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.18)',
              color: 'rgba(255,255,255,0.92)',
              fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 400,
              letterSpacing: 0.1, cursor: 'pointer',
              backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)'
            }}>+ Log fit</button>
          </div>
        }

        <div style={{
          marginTop: 22, marginBottom: 8,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 7, height: 7, borderRadius: 3.5, background: accent,
            }} />
            <span style={{ fontSize: 16, color: 'rgba(255,255,255,0.85)', fontWeight: 500, letterSpacing: -0.1 }}>
              Today's pick
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 14, color: accent, fontWeight: 500,
              padding: '4px 10px', borderRadius: 100, background: `rgba(${accentRgba},0.12)`,
              boxShadow: `inset 0 0 0 0.5px rgba(${accentRgba},0.35)` }}>
              {t.name}
            </span>
            <span style={{ fontSize: 15, color: 'rgba(255,255,255,0.92)', fontFamily: '"DM Sans", sans-serif', fontWeight: 500 }}>94%</span>
          </div>
        </div>

        <div className="lg-active lg-spotlight" style={{ borderRadius: 24, overflow: 'hidden', position: 'relative' }}>
          <div onClick={() => window.__archiveGo && window.__archiveGo('detail')} style={{ position: 'relative', padding: 18, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', cursor: 'pointer' }}>
            <div style={{ borderRadius: 18, overflow: 'hidden', position: 'relative' }}>
              <PhotoPlaceholder ratio="4/5" radius={18} photoId={3} />
              {typeof window !== 'undefined' && window.__archiveEmpty &&
                <div style={{
                  position: 'absolute', inset: 0,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12,
                  pointerEvents: 'none'
                }}>
                  <div style={{
                    fontFamily: 'Inter, sans-serif', fontWeight: 300,
                    fontSize: 12, color: 'rgba(255,255,255,0.4)', letterSpacing: 0.2
                  }}>Log today's fit →</div>
                </div>
              }
              <div style={{
                position: 'absolute', top: 12, left: 12,
                padding: '6px 11px', borderRadius: 100,
                background: 'rgba(10,8,6,0.55)', backdropFilter: 'blur(10px)',
                fontSize: 14, color: accent, fontWeight: 500,
                boxShadow: `inset 0 0 0 0.5px rgba(${accentRgba},0.35)`
              }}>Fit 023 · Recycled</div>
              <div className="liquid-glass" onClick={(e) => { e.stopPropagation(); window.__archiveGo && window.__archiveGo('share'); }} style={{
                position: 'absolute', top: 12, right: 12,
                width: 32, height: 32, borderRadius: 16,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer'
              }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7M16 6l-4-4-4 4M12 2v14" />
                </svg>
              </div>
            </div>
            <div style={{ marginTop: 16, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 22, fontWeight: 500, lineHeight: 1.2, marginBottom: 6, letterSpacing: -0.2 }}>
                  Rust suede + cream knit
                </div>
                <div style={{ fontSize: 16, color: 'rgba(255,255,255,0.75)', lineHeight: 1.4 }}>
                  Last worn Mar 14 · matches 61° clear
                </div>
              </div>
              <button className="liquid-glass" onClick={(e) => { e.stopPropagation(); window.__archiveGo && window.__archiveGo('rating'); }} style={{
                border: 'none', cursor: 'pointer',
                width: 48, height: 48, borderRadius: 24,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#F5F0E8'
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[
            { value: '47', label: 'DAY STREAK', icon: (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(245,240,232,0.45)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2c1 4-3 6-3 10a5 5 0 0 0 10 0c0-2-1-4-2-5 0 2-1 3-2 3 0-3-1-5-3-8z" />
              </svg>
            )},
            { value: '312', label: 'FITS LOGGED', icon: (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(245,240,232,0.45)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="3" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" />
              </svg>
            )},
          ].map((stat, i) => (
            <div key={i} className="lg-card" style={{
              borderRadius: 20, padding: 18, aspectRatio: '1.15',
              display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                {stat.icon}
                <div style={{ display: 'grid', gridTemplateColumns: '3px 3px', gridTemplateRows: '3px 3px', gap: 3 }}>
                  {[0,1,2,3].map(k => <div key={k} style={{ width: 3, height: 3, borderRadius: 1.5, background: 'rgba(245,240,232,0.3)' }} />)}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 44, fontWeight: 700, letterSpacing: -1.5, lineHeight: 1, color: '#F5F0E8' }}>{stat.value}</div>
                <div style={{ fontSize: 10, color: 'rgba(245,240,232,0.4)', marginTop: 6, letterSpacing: 1.2, fontWeight: 500 }}>{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 28, display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
          <span style={{ fontSize: 16, color: 'rgba(255,255,255,0.85)', fontWeight: 500, letterSpacing: -0.1 }}>
            Recent
          </span>
          <span onClick={() => window.__archiveGo && window.__archiveGo('archive')} style={{ fontSize: 15, color: accent, fontWeight: 500, cursor: 'pointer' }}>See all</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {[0, 1, 2, 3, 4, 5].map((idx) =>
            <div key={idx} onClick={() => window.__archiveGo && window.__archiveGo('detail')} style={{ cursor: 'pointer', position: 'relative' }}>
              <PhotoPlaceholder ratio="3/4" radius={12} photoId={idx + 5} />
              <div style={{
                position: 'absolute', bottom: 7, left: 9,
                fontSize: 14, color: '#F5F0E8',
                fontWeight: 500, letterSpacing: -0.1,
                textShadow: '0 1px 4px rgba(0,0,0,0.6)'
              }}>{['Yesterday', 'Sat', 'Fri', 'Thu', 'Wed', 'Tue'][idx]}</div>
            </div>
          )}
        </div>

        <div style={{ marginTop: 32, display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div style={{ width: 3, height: 14, borderRadius: 1.5, background: accent }} />
          <span style={{ fontSize: 14, fontWeight: 500, color: 'rgba(255,255,255,0.95)', letterSpacing: -0.4, fontFamily: '"DM Sans", sans-serif' }}>
            WARDROBE PULSE
          </span>
        </div>
        <Glass radius={20} style={{ padding: 18 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
            <span style={{ fontSize: 18, fontWeight: 500, letterSpacing: -0.3 }}>Most worn this month</span>
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>Apr</span>
          </div>
          {[
            { name: 'Cream knit', count: 12, pct: 100 },
            { name: 'Rust suede jacket', count: 9, pct: 75 },
            { name: 'Black trousers', count: 7, pct: 58 }
          ].map((item, i) =>
            <div key={i} style={{ marginBottom: i === 2 ? 0 : 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.88)', fontWeight: 500 }}>{item.name}</span>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>{item.count}×</span>
              </div>
              <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                <div style={{
                  width: `${item.pct}%`, height: '100%',
                  background: `linear-gradient(90deg, ${accent} 0%, ${accentHot} 100%)`,
                }} />
              </div>
            </div>
          )}
        </Glass>

        <div style={{ marginTop: 24, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 3, height: 14, borderRadius: 1.5, background: accent }} />
          <span style={{ fontSize: 14, fontWeight: 500, color: 'rgba(255,255,255,0.95)', letterSpacing: -0.4, fontFamily: '"DM Sans", sans-serif' }}>
            STYLE INSIGHT
          </span>
        </div>
        <GlowCard glow="tl" active={false}>
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
                <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', lineHeight: 1.5, fontWeight: 500 }}>
                  Try a navy or sage piece this Saturday for contrast.
                </div>
              </div>
            </div>
          </div>
        </GlowCard>

        <div style={{ marginTop: 24, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 3, height: 14, borderRadius: 1.5, background: accent }} />
          <span style={{ fontSize: 14, fontWeight: 500, color: 'rgba(255,255,255,0.95)', letterSpacing: -0.4, fontFamily: '"DM Sans", sans-serif' }}>
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
            <Glass key={i} radius={16} style={{ padding: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.6)', letterSpacing: -0.2, textTransform: 'uppercase', marginBottom: 8 }}>{g.label}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 2, marginBottom: 8 }}>
                <span className="h-display" style={{ fontSize: 28, lineHeight: 1, color: '#F5F0E8', letterSpacing: -0.6 }}>{g.value}</span>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>{g.total}</span>
              </div>
              <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                <div style={{
                  width: `${g.pct}%`, height: '100%',
                  background: `linear-gradient(90deg, ${accent} 0%, ${accentHot} 100%)`
                }} />
              </div>
            </Glass>
          )}
        </div>

        <div style={{ marginTop: 24, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 3, height: 14, borderRadius: 1.5, background: accent }} />
          <span style={{ fontSize: 14, fontWeight: 500, color: 'rgba(255,255,255,0.95)', letterSpacing: -0.4, fontFamily: '"DM Sans", sans-serif' }}>
            DAILY PROMPT
          </span>
        </div>
        <Glass radius={20} style={{ padding: 20, marginBottom: 8 }}>
          <div className="h-display" style={{ fontSize: 26, lineHeight: 1.15, color: '#F5F0E8', marginBottom: 12, letterSpacing: -0.4 }}>
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
              color: 'rgba(255,255,255,0.85)', fontSize: 14, fontWeight: 500, letterSpacing: -0.2
            }}>Skip</button>
          </div>
        </Glass>
      </div>

      <TabBar active="today" />
    </div>
  );
}
