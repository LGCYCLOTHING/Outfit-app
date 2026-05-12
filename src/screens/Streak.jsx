import React from 'react';
import { useTheme, bgColor, fgColor, StatusBar } from '../lib/shared.jsx';
import LiquidMesh from '../lib/liquid-mesh.jsx';

// Local helpers — same logic as Today's streak so numbers stay in sync
function readLoggedDays() {
  try { return JSON.parse(localStorage.getItem('aevum_fits_logged') || '[]'); }
  catch (e) { return []; }
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
    const d = new Date(today); d.setDate(today.getDate() - i);
    if (set.has(ymd(d))) streak++;
    else if (i > 0) break;
  }
  return streak;
}
function computeBestStreak() {
  // Find longest consecutive run in the logged-days set
  const days = readLoggedDays().sort();
  if (!days.length) return 0;
  let best = 1, run = 1;
  for (let i = 1; i < days.length; i++) {
    const a = new Date(days[i - 1]);
    const b = new Date(days[i]);
    const diff = Math.round((b - a) / (1000 * 60 * 60 * 24));
    if (diff === 1) { run++; best = Math.max(best, run); }
    else { run = 1; }
  }
  return best;
}
function getThisWeekDays() {
  const today = new Date();
  const dow = (today.getDay() + 6) % 7;
  const monday = new Date(today); monday.setDate(today.getDate() - dow);
  const logged = new Set(readLoggedDays());
  const letters = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday); d.setDate(monday.getDate() + i);
    return {
      letter: letters[i],
      dateNum: d.getDate(),
      isToday: d.toDateString() === today.toDateString(),
      hasFit: logged.has(ymd(d)),
    };
  });
}
function getLast30Days() {
  const today = new Date();
  const logged = new Set(readLoggedDays());
  return Array.from({ length: 30 }, (_, i) => {
    const d = new Date(today); d.setDate(today.getDate() - (29 - i));
    return { dateNum: d.getDate(), hasFit: logged.has(ymd(d)), isToday: d.toDateString() === today.toDateString() };
  });
}

// Milestones — visual badges for achievement levels
const MILESTONES = [
  { days: 3,   label: 'Spark',     icon: '✦' },
  { days: 7,   label: 'Ember',     icon: '◉' },
  { days: 14,  label: 'Steady',    icon: '◈' },
  { days: 30,  label: 'Devoted',   icon: '✺' },
  { days: 60,  label: 'Iconic',    icon: '◆' },
  { days: 100, label: 'Mythic',    icon: '⬢' },
];

export default function ScreenStreak() {
  const t = useTheme();
  const accent = t.light;
  const accentRgba = t.softRgba;

  const streak = computeStreak();
  const bestStreak = computeBestStreak();
  const weekDays = getThisWeekDays();
  const last30 = getLast30Days();
  const loggedCount = readLoggedDays().length;
  const weekProgress = weekDays.filter(d => d.hasFit).length;
  const monthLogged = last30.filter(d => d.hasFit).length;

  // Find next milestone
  const nextMilestone = MILESTONES.find(m => m.days > streak) || MILESTONES[MILESTONES.length - 1];
  const prevMilestone = [...MILESTONES].reverse().find(m => m.days <= streak);
  const milestoneProgress = nextMilestone
    ? Math.min(1, (streak - (prevMilestone?.days || 0)) / (nextMilestone.days - (prevMilestone?.days || 0)))
    : 1;

  const goBack = () => window.__archiveGo && window.__archiveGo('today');

  // Big ring sizing
  const bigRingSize = 180;
  const bigStroke = 6;
  const bigR = (bigRingSize - bigStroke) / 2;
  const bigC = 2 * Math.PI * bigR;
  const bigDash = (weekProgress / 7) * bigC;

  return (
    <div style={{
      width: '100%', height: '100%', position: 'relative', overflow: 'hidden',
      background: bgColor(),
      fontFamily: 'Inter, -apple-system, system-ui, sans-serif',
      color: fgColor(),
    }}>
      <LiquidMesh seed={5} intensity={0.9} />
      <StatusBar />

      <div style={{
        position: 'relative', zIndex: 2,
        padding: 'calc(8px + var(--archive-safe-top, 54px)) 22px calc(60px + var(--archive-safe-bottom, 0px))',
        height: '100%', overflow: 'auto', boxSizing: 'border-box',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <div onClick={goBack} className="archive-pressable" style={{
            width: 36, height: 36, borderRadius: 18,
            background: 'rgba(255,240,220,0.05)',
            border: '1px solid rgba(255,240,220,0.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', flexShrink: 0,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F5F0E8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 6l-6 6 6 6"/>
            </svg>
          </div>
          <div style={{ fontSize: 24, color: 'var(--text-primary)', letterSpacing: '-0.05em', lineHeight: 1 }}>
            Streak
          </div>
        </div>

        {/* Hero — big animated flame in progress ring */}
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          marginBottom: 32, marginTop: 12,
        }}>
          <div style={{ position: 'relative', width: bigRingSize, height: bigRingSize }}>
            {/* Ring SVG */}
            <svg width={bigRingSize} height={bigRingSize} style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)' }}>
              <circle cx={bigRingSize/2} cy={bigRingSize/2} r={bigR}
                fill="none" stroke="rgba(245,240,232,0.10)" strokeWidth={bigStroke} />
              <circle cx={bigRingSize/2} cy={bigRingSize/2} r={bigR}
                fill="none" stroke={accent} strokeWidth={bigStroke} strokeLinecap="round"
                strokeDasharray={`${bigDash} ${bigC}`} />
            </svg>
            {/* Animated flame center */}
            <div className="archive-flame" style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              filter: `drop-shadow(0 0 24px ${accent}) drop-shadow(0 0 8px ${accent})`,
            }}>
              <svg width="72" height="72" viewBox="0 0 24 24" fill={accent}>
                <path d="M12 2c1 4-3 6-3 10a5 5 0 0 0 10 0c0-2-1-4-2-5 0 2-1 3-2 3 0-3-1-5-3-8z"/>
              </svg>
            </div>
          </div>
          <div style={{
            fontSize: 64, color: 'var(--text-primary)', letterSpacing: '-0.06em', lineHeight: 1,
            marginTop: 22,
          }}>
            {streak}
          </div>
          <div style={{
            fontSize: 11, color: 'var(--text-secondary)', letterSpacing: 1.6,
            textTransform: 'uppercase', marginTop: 8,
          }}>
            {streak === 1 ? 'day · keep going' : 'days · keep going'}
          </div>
        </div>

        {/* Week glass card */}
        <div style={{
          background: 'rgba(255,240,220,0.04)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,240,220,0.07)',
          borderRadius: 16,
          padding: 16, marginBottom: 14,
          boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)', letterSpacing: 1.4, textTransform: 'uppercase' }}>
              This week
            </span>
            <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>
              {weekProgress}/7
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
            {weekDays.map((d, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <span style={{ fontSize: 10, color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>{d.letter}</span>
                <div style={{
                  width: 32, height: 32, borderRadius: 10,
                  background: d.hasFit ? `rgba(${accentRgba}, 0.25)` : 'rgba(245,240,232,0.04)',
                  border: d.isToday ? `1px solid ${accent}` : '1px solid transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {d.hasFit ? (
                    <svg width="13" height="13" viewBox="0 0 24 24" fill={accent}>
                      <path d="M12 2c1 4-3 6-3 10a5 5 0 0 0 10 0c0-2-1-4-2-5 0 2-1 3-2 3 0-3-1-5-3-8z"/>
                    </svg>
                  ) : (
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{d.dateNum}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats grid — 4 small glass cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 14 }}>
          {[
            { label: 'BEST STREAK', value: bestStreak, sub: bestStreak === 1 ? 'day' : 'days' },
            { label: 'THIS WEEK',   value: weekProgress, sub: '/ 7 days' },
            { label: 'LAST 30',     value: monthLogged, sub: '/ 30 days' },
            { label: 'ALL TIME',    value: loggedCount, sub: 'fits logged' },
          ].map((s, i) => (
            <div key={i} style={{
              background: 'rgba(255,240,220,0.04)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,240,220,0.07)',
              borderRadius: 14, padding: 16,
              boxShadow: '0 4px 16px rgba(0,0,0,0.22)',
            }}>
              <div style={{ fontSize: 10, color: 'var(--text-secondary)', letterSpacing: 1.4, marginBottom: 8 }}>
                {s.label}
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                <span style={{ fontSize: 32, color: 'var(--text-primary)', letterSpacing: '-0.05em', lineHeight: 1 }}>
                  {s.value}
                </span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.sub}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Next milestone */}
        {nextMilestone && nextMilestone.days > streak && (
          <div style={{
            background: 'rgba(255,240,220,0.04)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,240,220,0.07)',
            borderRadius: 16, padding: 18, marginBottom: 14,
            boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: 10, color: 'var(--text-secondary)', letterSpacing: 1.4, marginBottom: 4 }}>
                  NEXT MILESTONE
                </div>
                <div style={{ fontSize: 22, color: 'var(--text-primary)', letterSpacing: '-0.04em' }}>
                  {nextMilestone.label}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
                  {nextMilestone.days - streak} more {nextMilestone.days - streak === 1 ? 'day' : 'days'} to go
                </div>
              </div>
              <div style={{
                width: 56, height: 56, borderRadius: 28,
                background: `rgba(${accentRgba}, 0.18)`,
                border: `1px solid rgba(${accentRgba}, 0.4)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 26, color: accent,
              }}>
                {nextMilestone.icon}
              </div>
            </div>
            {/* Progress bar */}
            <div style={{
              height: 6, borderRadius: 3, background: 'rgba(245,240,232,0.07)',
              overflow: 'hidden',
            }}>
              <div style={{
                width: `${milestoneProgress * 100}%`, height: '100%',
                background: accent, borderRadius: 3,
                transition: 'width 400ms ease',
              }} />
            </div>
          </div>
        )}

        {/* Last 30 days heat strip */}
        <div style={{
          background: 'rgba(255,240,220,0.04)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,240,220,0.07)',
          borderRadius: 16, padding: 18, marginBottom: 14,
          boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
        }}>
          <div style={{ fontSize: 10, color: 'var(--text-secondary)', letterSpacing: 1.4, marginBottom: 12 }}>
            LAST 30 DAYS
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: 5 }}>
            {last30.map((d, i) => (
              <div key={i} style={{
                aspectRatio: '1',
                borderRadius: 4,
                background: d.hasFit ? `rgba(${accentRgba}, ${0.35 + 0.5 * (d.isToday ? 1 : 0)})` : 'rgba(245,240,232,0.05)',
                border: d.isToday ? `1px solid ${accent}` : '1px solid transparent',
              }} />
            ))}
          </div>
        </div>

        {/* Milestone badges row — all earned + locked */}
        <div className="lg-card no-scroll" style={{ marginBottom: 14, padding: '14px 14px 12px', borderRadius: 18 }}>
          <div style={{ fontSize: 10, color: 'var(--text-secondary)', letterSpacing: 1.4, marginBottom: 12, paddingLeft: 4 }}>
            MILESTONES
          </div>
          <div className="no-scroll" style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 }}>
            <style>{`.no-scroll::-webkit-scrollbar{display:none}`}</style>
            {MILESTONES.map((m, i) => {
              const earned = streak >= m.days;
              return (
                <div key={i} style={{
                  flex: '0 0 auto',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                  opacity: earned ? 1 : 0.55,
                }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: 26,
                    background: earned ? `rgba(${accentRgba}, 0.22)` : 'rgba(255,255,255,0.08)',
                    border: earned ? `1px solid ${accent}` : '1px dashed rgba(255,255,255,0.25)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 22, color: earned ? accent : 'var(--text-secondary)',
                  }}>
                    {m.icon}
                  </div>
                  <div style={{
                    fontSize: 9, letterSpacing: 1, textTransform: 'uppercase',
                    color: earned ? 'var(--text-primary)' : 'var(--text-muted)',
                  }}>
                    {m.label}
                  </div>
                  <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>
                    {m.days}d
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA — log today's fit if not logged yet */}
        {!weekDays.find(d => d.isToday)?.hasFit && (
          <button
            onClick={() => window.__archiveGo && window.__archiveGo('rating')}
            className="archive-pressable"
            style={{
              width: '100%', height: 52, borderRadius: 26,
              background: accent, color: '#0a0a0a',
              border: 'none', cursor: 'pointer',
              fontSize: 15, fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              marginTop: 6,
            }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#0a0a0a">
              <path d="M12 2c1 4-3 6-3 10a5 5 0 0 0 10 0c0-2-1-4-2-5 0 2-1 3-2 3 0-3-1-5-3-8z"/>
            </svg>
            Log today's fit to keep the streak
          </button>
        )}
      </div>
    </div>
  );
}
