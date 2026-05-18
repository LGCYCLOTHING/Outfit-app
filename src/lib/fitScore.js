// Weekly Fit Score — 0–100 composite computed from the user's logged fits.
// See AddWeeklyFitScore spec: consistency (40) + feel (30) + variety (20)
// + creativity (10).

import { getSavedFitPhotos, getSavedFitMeta } from './shared.jsx';

function ymd(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// ISO-week label like "2026-W21". Stored alongside scores so we can
// dedupe / replace within the same week without timing collisions.
export function isoWeekLabel(d = new Date()) {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  // Thursday in current week decides the year
  date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
  const firstThursday = new Date(date.getFullYear(), 0, 4);
  const weekNumber = 1 + Math.round(
    ((date - firstThursday) / 86400000 - 3 + (firstThursday.getDay() + 6) % 7) / 7
  );
  return `${date.getFullYear()}-W${String(weekNumber).padStart(2, '0')}`;
}

function weekDays(today = new Date()) {
  const dow = (today.getDay() + 6) % 7; // Mon = 0
  const monday = new Date(today);
  monday.setDate(today.getDate() - dow);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

export function calculateWeeklyScore(today = new Date()) {
  if (typeof window === 'undefined') return { score: 0, daysLogged: 0, totalFits: 0 };

  const days = weekDays(today);
  const dayKeys = days.map(ymd);

  // ── Consistency (40 pts) ───────────────────────────────────────────────
  let loggedSet = new Set();
  try { loggedSet = new Set(JSON.parse(localStorage.getItem('aevum_fits_logged') || '[]')); }
  catch (e) {}
  const daysLogged = dayKeys.filter(k => loggedSet.has(k)).length;
  const consistency = (daysLogged / 7) * 40;

  // Collect every fit this week + its per-photo metadata
  const allFits = [];
  for (const k of dayKeys) {
    const photos = getSavedFitPhotos(k);
    const metas = getSavedFitMeta(k);
    photos.forEach((p, i) => {
      allFits.push({ dateKey: k, idx: i, meta: metas[i] || {} });
    });
  }

  // ── Feel rating (30 pts) ───────────────────────────────────────────────
  const ratings = allFits.map(f => f.meta && f.meta.stars).filter(s => typeof s === 'number');
  let feel;
  if (ratings.length === 0) {
    feel = 15; // spec default when nothing rated yet
  } else {
    const avg = ratings.reduce((a, b) => a + b, 0) / ratings.length;
    feel = (avg / 5) * 30;
  }

  // ── Variety (20 pts) ───────────────────────────────────────────────────
  // Distinct (mood, context) signatures over total fits.
  let variety;
  if (allFits.length === 0) {
    variety = 0;
  } else if (allFits.length === 1) {
    variety = 10; // spec default for a single fit
  } else {
    const sigs = new Set(allFits.map(f => `${f.meta.mood || '?'}::${f.meta.ctx || '?'}`));
    variety = (sigs.size / allFits.length) * 20;
  }

  // ── Creativity (10 pts) ────────────────────────────────────────────────
  // +2 for every (mood, context) combo this week that didn't appear in the
  // 4 prior weeks. Capped at 10.
  const priorCombos = new Set();
  for (let back = 7; back <= 35; back++) {
    const d = new Date(today);
    d.setDate(d.getDate() - back);
    const metas = getSavedFitMeta(ymd(d));
    metas.forEach(m => {
      if (m && m.mood && m.ctx) priorCombos.add(`${m.mood}::${m.ctx}`);
    });
  }
  const weekCombos = new Set(
    allFits
      .map(f => `${f.meta.mood || ''}::${f.meta.ctx || ''}`)
      .filter(c => !c.startsWith('::') && !c.endsWith('::'))
  );
  let newCount = 0;
  for (const c of weekCombos) {
    if (!priorCombos.has(c)) newCount++;
  }
  const creativity = Math.min(10, newCount * 2);

  const total = Math.round(consistency + feel + variety + creativity);
  return {
    score: total,
    breakdown: {
      consistency: Math.round(consistency),
      feel: Math.round(feel),
      variety: Math.round(variety),
      creativity: Math.round(creativity),
    },
    daysLogged,
    totalFits: allFits.length,
  };
}

export function scoreLabel(score) {
  if (score >= 96) return 'Mythic';
  if (score >= 81) return 'Iconic';
  if (score >= 61) return 'Sharp';
  if (score >= 41) return 'Consistent';
  if (score >= 21) return 'Building momentum';
  return 'Getting started';
}

// 0-40 muted · 41-70 normal · 71-100 glowing
export function scoreTier(score) {
  if (score >= 71) return 'glow';
  if (score >= 41) return 'normal';
  return 'muted';
}

// Persist current week's score; trim to last 12 weeks.
export function persistWeeklyScore(score, weekLabel = isoWeekLabel()) {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem('aevum_weekly_scores');
    const arr = raw ? JSON.parse(raw) : [];
    const existing = arr.findIndex(e => e && e.week === weekLabel);
    const entry = { week: weekLabel, score };
    if (existing >= 0) arr[existing] = entry;
    else arr.push(entry);
    const trimmed = arr.slice(-12);
    localStorage.setItem('aevum_weekly_scores', JSON.stringify(trimmed));
  } catch (e) {}
}

export function getWeeklyScoreHistory() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('aevum_weekly_scores');
    return raw ? JSON.parse(raw) : [];
  } catch (e) { return []; }
}

// Convenience: compute + persist + return the score.
export function refreshWeeklyScore() {
  const result = calculateWeeklyScore();
  persistWeeklyScore(result.score);
  return result;
}
