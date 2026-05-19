import React from 'react';
import { useTheme, bgColor, fgColor, StatusBar } from '../lib/shared.jsx';
import LiquidMesh from '../lib/liquid-mesh.jsx';
import {
  calculateWeeklyScore, scoreLabel, scoreTier, isoWeekLabel,
  getWeeklyScoreHistory, persistWeeklyScore,
} from '../lib/fitScore.js';
import { ACHIEVEMENTS, syncAchievementsAndGetNew } from '../lib/achievements.js';

// Read user-tracked pieces + per-fit piece refs to compute most-worn.
// When piece tracking isn't yet populated, returns a small mock so the UI
// remains visible (the AI-tagging flow can replace this when it ships).
function readMostWornPieces() {
  let pieces = [];
  try { pieces = JSON.parse(localStorage.getItem('aevum_pieces') || '[]'); } catch (e) {}
  let logged = [];
  try { logged = JSON.parse(localStorage.getItem('aevum_fits_logged') || '[]'); } catch (e) {}
  const counts = {};
  const lastWorn = {};
  for (const dateKey of logged) {
    try {
      const ids = JSON.parse(localStorage.getItem(`aevum_fit_pieces_${dateKey}`) || '[]');
      for (const pid of ids) {
        counts[pid] = (counts[pid] || 0) + 1;
        if (!lastWorn[pid] || dateKey > lastWorn[pid]) lastWorn[pid] = dateKey;
      }
    } catch (e) {}
  }
  const ranked = (Array.isArray(pieces) ? pieces : [])
    .map(p => ({ ...p, count: counts[p.id] || 0, lastWorn: lastWorn[p.id] }))
    .filter(p => p.count > 0)
    .sort((a, b) => b.count - a.count);
  if (ranked.length > 0) return ranked;
  // Mock fallback so the section reads as designed.
  return [
    { id: 'mock-1', name: 'Cream Knit Sweater', count: 12, photo: null, lastWorn: null, mock: true },
    { id: 'mock-2', name: 'Black Cargo Pants',  count: 9,  photo: null, lastWorn: null, mock: true },
    { id: 'mock-3', name: 'White Air Force 1s', count: 7,  photo: null, lastWorn: null, mock: true },
  ];
}

function daysAgo(dateKey) {
  if (!dateKey) return null;
  try {
    const d = new Date(dateKey);
    const today = new Date(); today.setHours(0,0,0,0);
    const diff = Math.round((today - d) / 86400000);
    if (diff < 0) return 'in the future';
    if (diff === 0) return 'today';
    if (diff === 1) return '1 day ago';
    return `${diff} days ago`;
  } catch (e) { return null; }
}

const LEVELS = [
  { min: 0,  label: 'Getting started' },
  { min: 21, label: 'Building momentum' },
  { min: 41, label: 'Consistent' },
  { min: 61, label: 'Sharp' },
  { min: 81, label: 'Iconic' },
  { min: 96, label: 'Mythic' },
];

function levelIndexFor(score) {
  let idx = 0;
  LEVELS.forEach((l, i) => { if (score >= l.min) idx = i; });
  return idx;
}

// Lightweight one-line insight that adapts to what the user has actually done.
function aiInsight(result, history) {
  const { score, totalFits, breakdown, daysLogged } = result;
  if (totalFits === 0) {
    return "Log your first fit of the week — your score starts as soon as you do.";
  }
  // Compare to previous week if we have it
  const prevEntry = history && history.length >= 2 ? history[history.length - 2] : null;
  const delta = prevEntry ? score - prevEntry.score : null;
  const bits = [];
  bits.push(`You logged ${totalFits} ${totalFits === 1 ? 'fit' : 'fits'} this week`);
  if (breakdown && breakdown.feel >= 24) bits.push('with strong feel ratings');
  if (delta != null) {
    if (delta > 4)  bits.push(`— up ${delta} pts from last week`);
    else if (delta < -4) bits.push(`— down ${Math.abs(delta)} pts from last week`);
    else            bits.push('— roughly flat vs last week');
  } else {
    bits.push(`across ${daysLogged} ${daysLogged === 1 ? 'day' : 'days'}`);
  }
  return bits.join(' ') + '.';
}

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function currentWeekHeader() {
  const d = new Date();
  const weekRaw = isoWeekLabel(d).split('-W')[1];
  const weekNum = parseInt(weekRaw, 10);
  return `WEEK ${weekNum} · ${MONTH_NAMES[d.getMonth()].toUpperCase()} ${d.getFullYear()}`;
}

function Gauge({ score, accent, accentRgba, size = 'large' }) {
  const R = size === 'large' ? 130 : 96;
  const STROKE = size === 'large' ? 22 : 18;
  const PAD = STROKE / 2 + 6;
  const cx = R + PAD;
  const cy = R + PAD;
  const vbW = cx * 2;
  const vbH = cy + STROKE / 2 + 4;
  const fullLen = Math.PI * R;
  const [progress, setProgress] = React.useState(0);
  React.useEffect(() => {
    const target = Math.max(0, Math.min(1, score / 100));
    const r = requestAnimationFrame(() => setProgress(target));
    return () => cancelAnimationFrame(r);
  }, [score]);
  const angle = Math.PI * (1 - progress);
  const dotX = cx + R * Math.cos(angle);
  const dotY = cy - R * Math.sin(angle);
  const arcD = `M ${cx - R} ${cy} A ${R} ${R} 0 0 1 ${cx + R} ${cy}`;
  const ease = 'cubic-bezier(0.34, 1.56, 0.64, 1)';
  const numberSize = size === 'large' ? 76 : 48;
  const labelSize = size === 'large' ? 11 : 10;
  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: size === 'large' ? 360 : 300, margin: '0 auto' }}>
      <svg viewBox={`0 0 ${vbW} ${vbH}`} style={{ width: '100%', display: 'block', overflow: 'visible' }}>
        <defs>
          <linearGradient id={`fitg-${size}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"  stopColor="rgba(255,255,255,0.22)" />
            <stop offset="55%" stopColor={accent} stopOpacity="0.85" />
            <stop offset="100%" stopColor={accent} />
          </linearGradient>
        </defs>
        <path d={arcD} stroke="rgba(255,255,255,0.10)" strokeWidth={STROKE} strokeLinecap="round" fill="none" />
        <path
          d={arcD}
          stroke={`url(#fitg-${size})`}
          strokeWidth={STROKE}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={fullLen}
          strokeDashoffset={fullLen - fullLen * progress}
          style={{
            filter: `drop-shadow(0 0 ${size === 'large' ? 10 : 6}px ${accent})`,
            transition: `stroke-dashoffset 1200ms ${ease}`,
          }}
        />
        <circle
          cx={dotX} cy={dotY} r={STROKE / 2 - 2} fill="#fff"
          style={{
            filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.35))',
            transition: `cx 1200ms ${ease}, cy 1200ms ${ease}`,
          }}
        />
      </svg>
      <div style={{
        position: 'absolute', left: 0, right: 0,
        top: `${(cy - (size === 'large' ? 20 : 14)) / vbH * 100}%`,
        transform: 'translateY(-50%)',
        textAlign: 'center', pointerEvents: 'none',
      }}>
        <div style={{
          fontSize: numberSize, fontWeight: 700, color: '#fff',
          letterSpacing: -2.6, lineHeight: 1,
          fontFamily: '"DM Sans", -apple-system, system-ui, sans-serif',
        }}>{score}</div>
        <div style={{
          fontSize: labelSize, color: 'rgba(255,255,255,0.55)',
          letterSpacing: 2.4, fontWeight: 500, marginTop: 8,
          fontFamily: '"DM Sans", sans-serif',
        }}>FIT SCORE</div>
      </div>
    </div>
  );
}

function BreakdownTile({ title, earned, max, accent, accentRgba }) {
  const pct = Math.max(0, Math.min(1, earned / max));
  return (
    <div style={{
      padding: '14px 14px 12px', borderRadius: 16,
      background: 'rgba(255,240,220,0.04)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      border: '1px solid rgba(255,240,220,0.07)',
      boxShadow: '0 4px 16px rgba(0,0,0,0.22)',
    }}>
      <div style={{
        fontSize: 9.5, color: 'var(--text-secondary)', letterSpacing: 1.5,
        fontFamily: '"DM Sans", sans-serif', fontWeight: 500, marginBottom: 8,
      }}>{title.toUpperCase()}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 10 }}>
        <span style={{
          fontSize: 28, fontWeight: 700, color: '#fff',
          letterSpacing: -1, lineHeight: 1,
          fontFamily: '"DM Sans", sans-serif',
        }}>{earned}</span>
        <span style={{
          fontSize: 13, color: 'rgba(255,255,255,0.42)', letterSpacing: -0.2,
        }}>/ {max}</span>
      </div>
      <div style={{
        position: 'relative', height: 4, borderRadius: 2,
        background: 'rgba(255,255,255,0.08)', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0,
          width: `${pct * 100}%`,
          background: `linear-gradient(90deg, rgba(255,255,255,0.25), ${accent})`,
          boxShadow: pct > 0.7 ? `0 0 10px -2px rgba(${accentRgba},0.55)` : 'none',
          transition: 'width 800ms cubic-bezier(0.34, 1.56, 0.64, 1)',
        }} />
      </div>
    </div>
  );
}

export default function ScreenFitScore() {
  const t = useTheme();
  const accent = t.light;
  const accentHot = t.hot;
  const accentRgba = t.softRgba;

  const [result, setResult] = React.useState(() => calculateWeeklyScore());
  // Make sure this week's score is in history before reading it back
  React.useEffect(() => {
    try { persistWeeklyScore(calculateWeeklyScore().score, isoWeekLabel()); } catch (e) {}
  }, []);
  React.useEffect(() => {
    const refresh = () => {
      const r = calculateWeeklyScore();
      setResult(r);
      try { persistWeeklyScore(r.score, isoWeekLabel()); } catch (e) {}
    };
    window.addEventListener('archive:fitschanged', refresh);
    window.addEventListener('archive:scorechanged', refresh);
    return () => {
      window.removeEventListener('archive:fitschanged', refresh);
      window.removeEventListener('archive:scorechanged', refresh);
    };
  }, []);

  const { score, breakdown } = result;
  const label = scoreLabel(score);
  const tier = scoreTier(score);
  const currentLevelIdx = levelIndexFor(score);
  const history = getWeeklyScoreHistory();
  const last6 = history.slice(-6);
  while (last6.length < 6) last6.unshift({ week: '—', score: 0, placeholder: true });
  const maxBar = Math.max(100, ...last6.map(e => e.score || 0));

  const goBack = () => {
    const prev = (typeof window !== 'undefined' && window.__archivePrevScreen) || 'today';
    window.__archiveGo && window.__archiveGo(prev);
  };

  // Sync achievements on mount; show a toast for any newly-unlocked one.
  const [unlockedSet, setUnlockedSet] = React.useState(() => new Set());
  const [toast, setToast] = React.useState(null);
  React.useEffect(() => {
    const { unlocked, fresh } = syncAchievementsAndGetNew();
    setUnlockedSet(new Set(unlocked));
    if (fresh.length) {
      const newest = ACHIEVEMENTS.find(a => a.id === fresh[fresh.length - 1]);
      if (newest) {
        setToast({ title: newest.title, icon: newest.icon });
        const t = setTimeout(() => setToast(null), 3000);
        return () => clearTimeout(t);
      }
    }
  }, [result.score, result.totalFits]);

  const mostWorn = readMostWornPieces();
  const top = mostWorn[0];
  const top3 = mostWorn.slice(0, 3);
  // For the "vs average" bar: top piece count vs mean of the rest
  const restAvg = mostWorn.length > 1
    ? mostWorn.slice(1).reduce((s, p) => s + p.count, 0) / (mostWorn.length - 1)
    : Math.max(1, (top && top.count ? top.count / 2 : 1));
  const topVsAvg = top ? Math.min(2.5, top.count / Math.max(1, restAvg)) : 1;

  const ctaLabel = score < 41
    ? 'Log today’s fit to boost your score'
    : 'Keep the momentum going';
  const ctaIcon = score < 41
    ? (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12h14M13 6l6 6-6 6"/>
      </svg>
    ) : (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2l1.7 5.4L19 9l-5.3 1.6L12 16l-1.7-5.4L5 9l5.3-1.6z"/>
      </svg>
    );

  return (
    <div style={{
      width: '100%', height: '100%', position: 'relative', overflow: 'hidden',
      background: bgColor(),
      fontFamily: 'DM Sans, -apple-system, system-ui, sans-serif',
      color: fgColor(),
    }}>
      <LiquidMesh seed={4} intensity={0.9} />
      <StatusBar />
      <div style={{
        position: 'absolute', zIndex: 2,
        top: 'var(--archive-safe-top, 54px)', left: 0, right: 0, bottom: 0,
        padding: '16px 22px calc(40px + var(--archive-safe-bottom, 0px))',
        overflow: 'auto', boxSizing: 'border-box',
      }}>
        {/* Header — back · FIT SCORE · spacer */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 6,
        }}>
          <div onClick={goBack} className="archive-pressable" style={{
            width: 36, height: 36, borderRadius: 18,
            background: 'rgba(255,255,255,0.06)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 6l-6 6 6 6"/>
            </svg>
          </div>
          <div style={{
            fontSize: 11, color: '#fff', fontWeight: 600, letterSpacing: 2.4,
          }}>FIT SCORE</div>
          <div style={{ width: 36 }} />
        </div>
        <div style={{
          textAlign: 'center', fontSize: 10.5, color: 'rgba(255,255,255,0.5)',
          letterSpacing: 2, fontWeight: 500, marginBottom: 18,
        }}>{currentWeekHeader()}</div>

        {/* Hero gauge */}
        <div style={{
          padding: '28px 18px 22px', borderRadius: 24,
          background: 'rgba(255,240,220,0.04)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,240,220,0.07)',
          boxShadow: tier === 'glow'
            ? `0 4px 16px rgba(0,0,0,0.22), 0 0 40px -4px rgba(${accentRgba},0.30)`
            : '0 4px 16px rgba(0,0,0,0.22)',
          marginBottom: 16,
        }}>
          <Gauge score={score} accent={accent} accentRgba={accentRgba} size="large" />
          <div style={{
            textAlign: 'center', marginTop: 10,
            fontSize: 22, fontWeight: 500, letterSpacing: -0.3,
            color: tier === 'muted' ? 'var(--text-secondary)' : accent,
            textShadow: tier === 'glow' ? `0 0 18px rgba(${accentRgba},0.55)` : 'none',
            fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic',
          }}>{label}</div>
          <div style={{
            marginTop: 12, padding: '10px 14px', borderRadius: 12,
            background: 'rgba(255,255,255,0.04)',
            boxShadow: 'inset 0 0 0 0.5px rgba(255,255,255,0.06)',
            fontSize: 13, lineHeight: 1.45, color: 'var(--text-primary)',
            textAlign: 'left',
          }}>
            <div style={{
              fontSize: 9.5, letterSpacing: 1.6, fontWeight: 500,
              color: accent, marginBottom: 4,
            }}>INSIGHT</div>
            {aiInsight(result, history)}
          </div>
        </div>

        {/* Breakdown — 2×2 grid */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10,
          marginBottom: 18,
        }}>
          <BreakdownTile title="Consistency"  earned={breakdown.consistency} max={40} accent={accent} accentRgba={accentRgba} />
          <BreakdownTile title="Feel rating"  earned={breakdown.feel}        max={30} accent={accent} accentRgba={accentRgba} />
          <BreakdownTile title="Variety"      earned={breakdown.variety}     max={20} accent={accent} accentRgba={accentRgba} />
          <BreakdownTile title="Creativity"   earned={breakdown.creativity}  max={10} accent={accent} accentRgba={accentRgba} />
        </div>

        {/* Weekly history bar chart — last 6 weeks */}
        <div style={{
          padding: '14px 16px 16px', borderRadius: 18,
          background: 'rgba(255,240,220,0.04)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,240,220,0.07)',
          boxShadow: '0 4px 16px rgba(0,0,0,0.22)',
          marginBottom: 18,
        }}>
          <div style={{
            fontSize: 9.5, color: 'var(--text-secondary)', letterSpacing: 1.5,
            fontWeight: 500, marginBottom: 14,
          }}>LAST 6 WEEKS</div>
          <div style={{
            display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
            gap: 10, height: 110, padding: '0 2px',
          }}>
            {last6.map((entry, i) => {
              const isCurrent = i === last6.length - 1 && !entry.placeholder;
              const s = entry.score || 0;
              const heightPct = Math.max(4, (s / maxBar) * 100);
              const isHigh = s >= 61;
              const barColor = isCurrent
                ? `linear-gradient(180deg, ${accent} 0%, ${accentHot} 100%)`
                : isHigh
                  ? `rgba(${accentRgba}, 0.55)`
                  : 'rgba(255,255,255,0.18)';
              return (
                <div key={i} style={{
                  flex: 1, display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'flex-end', height: '100%', gap: 6,
                }}>
                  <span style={{
                    fontSize: 10, color: isCurrent ? '#fff' : 'rgba(255,255,255,0.55)',
                    fontWeight: 500,
                  }}>{entry.placeholder ? '' : s}</span>
                  <div style={{
                    width: '100%', maxWidth: 32,
                    height: `${heightPct}%`,
                    borderRadius: 6,
                    background: barColor,
                    boxShadow: isCurrent ? `0 0 18px -4px rgba(${accentRgba}, 0.65)` : 'none',
                    transition: 'height .5s ease',
                  }} />
                  <span style={{
                    fontSize: 9.5, color: 'rgba(255,255,255,0.45)', letterSpacing: 0.4,
                  }}>
                    {entry.placeholder ? '' : (entry.week.split('-W')[1] ? `W${entry.week.split('-W')[1]}` : '—')}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── MOST WORN ── */}
        {top && (
          <div style={{
            padding: '14px 14px 12px', borderRadius: 18,
            background: 'rgba(255,240,220,0.04)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,240,220,0.07)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.22)',
            marginBottom: 18,
          }}>
            <div style={{
              fontSize: 9.5, color: 'var(--text-secondary)', letterSpacing: 1.5,
              fontWeight: 500, marginBottom: 12,
            }}>MOST WORN</div>

            {/* Top piece feature row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
              <div style={{
                width: 56, height: 70, borderRadius: 10, overflow: 'hidden',
                background: top.photo
                  ? '#000'
                  : `linear-gradient(150deg, rgba(${accentRgba},0.35), rgba(0,0,0,0.6))`,
                flexShrink: 0,
                boxShadow: 'inset 0 0 0 0.5px rgba(255,255,255,0.10)',
              }}>
                {top.photo && (
                  <img src={top.photo} alt="" style={{
                    width: '100%', height: '100%', objectFit: 'cover', display: 'block',
                  }} />
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 15, fontWeight: 500, color: '#fff', letterSpacing: -0.2,
                }}>{top.name}</div>
                <div style={{
                  fontSize: 12, color: 'var(--text-secondary)', marginTop: 2,
                }}>Worn {top.count} {top.count === 1 ? 'time' : 'times'}</div>
                {top.lastWorn && (
                  <div style={{
                    fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 2,
                  }}>Last worn {daysAgo(top.lastWorn)}</div>
                )}
                <div style={{
                  marginTop: 8, position: 'relative',
                  height: 4, borderRadius: 2,
                  background: 'rgba(255,255,255,0.08)', overflow: 'hidden',
                }}>
                  <div style={{
                    position: 'absolute', left: 0, top: 0, bottom: 0,
                    width: `${Math.min(100, topVsAvg / 2.5 * 100)}%`,
                    background: `linear-gradient(90deg, rgba(255,255,255,0.25), ${accent})`,
                    boxShadow: `0 0 10px -2px rgba(${accentRgba},0.55)`,
                    transition: 'width 800ms cubic-bezier(0.34, 1.56, 0.64, 1)',
                  }} />
                </div>
                <div style={{
                  marginTop: 4, fontSize: 10, color: 'rgba(255,255,255,0.45)',
                }}>{topVsAvg >= 1.5 ? `${topVsAvg.toFixed(1)}× your average wear` : 'around your average wear'}</div>
              </div>
            </div>

            {/* Top 3 ranked list */}
            <div style={{
              borderTop: '0.5px solid rgba(255,255,255,0.08)', paddingTop: 10,
              display: 'flex', flexDirection: 'column', gap: 8,
            }}>
              {top3.map((p, i) => (
                <div key={p.id} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  fontSize: 13, color: 'var(--text-primary)',
                }}>
                  <span style={{
                    width: 22, fontSize: 11, fontWeight: 600,
                    color: i === 0 ? accent : 'rgba(255,255,255,0.55)',
                    letterSpacing: -0.1,
                  }}>#{i + 1}</span>
                  <span style={{ flex: 1, letterSpacing: -0.1 }}>{p.name}</span>
                  <span style={{
                    fontSize: 12, color: 'rgba(255,255,255,0.55)',
                  }}>{p.count} {p.count === 1 ? 'time' : 'times'}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Score labels explained */}
        <div style={{
          padding: '16px', borderRadius: 18,
          background: 'rgba(255,240,220,0.04)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,240,220,0.07)',
          boxShadow: '0 4px 16px rgba(0,0,0,0.22)',
          marginBottom: 18,
        }}>
          <div style={{
            fontSize: 9.5, color: 'var(--text-secondary)', letterSpacing: 1.5,
            fontWeight: 500, marginBottom: 12,
          }}>LEVELS</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {LEVELS.map((lvl, i) => {
              const isCurrent = i === currentLevelIdx;
              const isUnlocked = i <= currentLevelIdx;
              const nextMin = LEVELS[i + 1] ? LEVELS[i + 1].min - 1 : 100;
              return (
                <div key={lvl.label} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '8px 4px',
                  opacity: isUnlocked ? 1 : 0.42,
                }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: 4,
                    background: isCurrent ? accent : (isUnlocked ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.18)'),
                    boxShadow: isCurrent ? `0 0 10px rgba(${accentRgba}, 0.7)` : 'none',
                    flexShrink: 0,
                  }} />
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: 14, fontWeight: isCurrent ? 600 : 500,
                      color: isCurrent ? '#fff' : 'var(--text-primary)',
                      letterSpacing: -0.2,
                    }}>{lvl.label}</div>
                  </div>
                  <div style={{
                    fontSize: 11, color: isCurrent ? accent : 'rgba(255,255,255,0.45)',
                    letterSpacing: 0.3, fontWeight: 500,
                  }}>{lvl.min}–{nextMin}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── ACHIEVEMENTS ── */}
        <div style={{
          padding: '14px 0 14px 16px', borderRadius: 18,
          background: 'rgba(255,240,220,0.04)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,240,220,0.07)',
          boxShadow: '0 4px 16px rgba(0,0,0,0.22)',
          marginBottom: 18,
        }}>
          <div style={{
            fontSize: 9.5, color: 'var(--text-secondary)', letterSpacing: 1.5,
            fontWeight: 500, marginBottom: 12, paddingRight: 16,
          }}>ACHIEVEMENTS · {unlockedSet.size} / {ACHIEVEMENTS.length}</div>
          <div className="no-scroll" style={{
            display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4, paddingRight: 16,
          }}>
            <style>{`.no-scroll::-webkit-scrollbar{display:none}`}</style>
            {ACHIEVEMENTS.map(a => {
              const unlocked = unlockedSet.has(a.id);
              return (
                <div key={a.id} style={{
                  flex: '0 0 auto', width: 120, padding: '12px 10px 11px',
                  borderRadius: 14,
                  background: unlocked ? `rgba(${accentRgba},0.10)` : 'rgba(255,255,255,0.03)',
                  border: unlocked
                    ? `1px solid rgba(${accentRgba},0.55)`
                    : '1px dashed rgba(255,255,255,0.16)',
                  boxShadow: unlocked
                    ? `0 0 18px -4px rgba(${accentRgba},0.55)`
                    : 'none',
                  opacity: unlocked ? 1 : 0.32,
                  textAlign: 'center',
                }}>
                  <div style={{
                    fontSize: 24, marginBottom: 6,
                    filter: unlocked ? 'none' : 'blur(1.5px)',
                    color: unlocked ? accent : '#fff',
                  }}>{a.icon}</div>
                  <div style={{
                    fontSize: 12, fontWeight: 600, color: '#fff',
                    letterSpacing: -0.1, lineHeight: 1.1, marginBottom: 4,
                  }}>{a.title}</div>
                  <div style={{
                    fontSize: 10, color: 'rgba(255,255,255,0.55)',
                    lineHeight: 1.3,
                  }}>{a.desc}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom CTA */}
        <button
          onClick={() => {
            if (score < 41) {
              if (typeof window !== 'undefined') window.__archiveRatingIndex = null;
              window.__archiveGo && window.__archiveGo('rating');
            } else {
              window.__archiveGo && window.__archiveGo('today');
            }
          }}
          className="archive-pressable"
          style={{
            width: '100%', padding: '14px 22px', borderRadius: 100,
            border: 'none', cursor: 'pointer',
            background: `linear-gradient(135deg, ${accent} 0%, ${accentHot} 100%)`,
            color: '#0a0a0a', fontSize: 14, fontWeight: 600,
            letterSpacing: -0.1, fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            boxShadow: `0 10px 28px -6px rgba(${accentRgba}, 0.55)`,
          }}>
          {ctaLabel}
          {ctaIcon}
        </button>
      </div>

      {/* Achievement-unlocked toast — fades over 3 seconds */}
      {toast && (
        <div style={{
          position: 'absolute', left: '50%', bottom: 'calc(40px + var(--archive-safe-bottom, 0px))',
          transform: 'translateX(-50%)',
          padding: '10px 18px', borderRadius: 999,
          background: `linear-gradient(135deg, rgba(${accentRgba},0.95), rgba(${accentRgba},0.75))`,
          color: '#0a0a0a', fontSize: 13, fontWeight: 600, letterSpacing: -0.1,
          boxShadow: `0 14px 40px -6px rgba(${accentRgba},0.7), 0 0 28px -4px rgba(${accentRgba},0.6)`,
          display: 'flex', alignItems: 'center', gap: 8,
          zIndex: 60,
          animation: 'archive-toast 3s ease forwards',
          pointerEvents: 'none',
        }}>
          <span style={{ fontSize: 16 }}>{toast.icon}</span>
          <span>Achievement unlocked · {toast.title}</span>
        </div>
      )}
      <style>{`
        @keyframes archive-toast {
          0%   { opacity: 0; transform: translate(-50%, 14px); }
          15%  { opacity: 1; transform: translate(-50%, 0); }
          85%  { opacity: 1; transform: translate(-50%, 0); }
          100% { opacity: 0; transform: translate(-50%, 14px); }
        }
      `}</style>
    </div>
  );
}
