// Achievement system — evaluates conditions against current user data and
// returns which achievements are unlocked. Newly-unlocked ones are detected
// by diffing against the previously-persisted set in localStorage.

import { getSavedFitPhotos, getSavedFitMeta } from './shared.jsx';
import { calculateWeeklyScore } from './fitScore.js';

const STORAGE_KEY = 'aevum_achievements';

export const ACHIEVEMENTS = [
  // Logging milestones
  { id: 'log-1',       group: 'logging', title: 'First Step',      desc: 'Log your first fit',  icon: '✦', threshold: 1 },
  { id: 'log-10',      group: 'logging', title: 'Getting Started', desc: 'Log 10 fits',         icon: '◆', threshold: 10 },
  { id: 'log-50',      group: 'logging', title: 'Committed',       desc: 'Log 50 fits',         icon: '✸', threshold: 50 },
  { id: 'log-100',     group: 'logging', title: 'Century',         desc: 'Log 100 fits',        icon: '✺', threshold: 100 },
  { id: 'log-365',     group: 'logging', title: 'Archive',         desc: 'Log 365 fits',        icon: '❖', threshold: 365 },
  { id: 'log-1000',    group: 'logging', title: 'Legendary',       desc: 'Log 1000 fits',       icon: '✦', threshold: 1000 },
  // Streak milestones
  { id: 'streak-3',    group: 'streak',  title: 'Spark',           desc: '3-day streak',        icon: '🔥', threshold: 3 },
  { id: 'streak-7',    group: 'streak',  title: 'Ember',           desc: '7-day streak',        icon: '🔥', threshold: 7 },
  { id: 'streak-14',   group: 'streak',  title: 'Steady',          desc: '14-day streak',       icon: '🔥', threshold: 14 },
  { id: 'streak-30',   group: 'streak',  title: 'Devoted',         desc: '30-day streak',       icon: '🔥', threshold: 30 },
  { id: 'streak-60',   group: 'streak',  title: 'Iconic',          desc: '60-day streak',       icon: '🔥', threshold: 60 },
  { id: 'streak-100',  group: 'streak',  title: 'Mythic',          desc: '100-day streak',      icon: '🔥', threshold: 100 },
  // Style milestones
  { id: 'rate-first',  group: 'style',   title: 'First Rate',      desc: 'Rate your first fit',  icon: '★' },
  { id: 'mood-10',     group: 'style',   title: 'Mood Logger',     desc: 'Tag mood on 10 fits',  icon: '◐' },
  { id: 'pieces-20',   group: 'style',   title: 'Versatile',       desc: 'Wear 20 different pieces', icon: '◇' },
  { id: 'score-80',    group: 'style',   title: 'Sharp',           desc: 'Reach a fit score of 80+', icon: '⬢' },
  { id: 'week-7',      group: 'style',   title: 'Perfect Week',    desc: 'Log all 7 days in a week', icon: '✓' },
  { id: 'ctx-night-5', group: 'style',   title: 'Night Out',       desc: 'Tag Night Out 5 times', icon: '✶' },
  { id: 'ctx-work-10', group: 'style',   title: 'Work Ready',      desc: 'Tag Work 10 times',     icon: '▣' },
];

function readLoggedDays() {
  try { return JSON.parse(localStorage.getItem('aevum_fits_logged') || '[]'); }
  catch (e) { return []; }
}
function computeCurrentStreak() {
  const set = new Set(readLoggedDays());
  const today = new Date();
  let streak = 0;
  for (let i = 0; i < 366; i++) {
    const d = new Date(today); d.setDate(today.getDate() - i);
    const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    if (set.has(k)) streak++;
    else if (i > 0) break;
  }
  return streak;
}

function gatherAllMeta() {
  const days = readLoggedDays();
  const all = [];
  for (const d of days) {
    const metas = getSavedFitMeta(d);
    metas.forEach(m => all.push(m || {}));
    // Also count un-metadata-ed photos as raw fits so counts line up
    const photos = getSavedFitPhotos(d);
    for (let i = metas.length; i < photos.length; i++) all.push({});
  }
  return all;
}

/** Returns an array of unlocked achievement ids based on current state. */
export function evaluateAchievements() {
  if (typeof window === 'undefined') return [];
  const days = readLoggedDays();
  const allMeta = gatherAllMeta();
  const totalFits = allMeta.length;
  const streak = computeCurrentStreak();
  const moodCount = allMeta.filter(m => m && m.mood).length;
  const ratedCount = allMeta.filter(m => m && typeof m.stars === 'number').length;
  const ctxCounts = {};
  for (const m of allMeta) {
    if (m && m.ctx) ctxCounts[m.ctx] = (ctxCounts[m.ctx] || 0) + 1;
  }
  const piecesUnique = (() => {
    try {
      const stored = JSON.parse(localStorage.getItem('aevum_pieces') || '[]');
      return Array.isArray(stored) ? stored.length : 0;
    } catch (e) { return 0; }
  })();
  let bestScore = 0;
  try {
    const hist = JSON.parse(localStorage.getItem('aevum_weekly_scores') || '[]');
    if (Array.isArray(hist)) bestScore = hist.reduce((m, e) => Math.max(m, e.score || 0), 0);
  } catch (e) {}
  bestScore = Math.max(bestScore, calculateWeeklyScore().score || 0);
  // Perfect week: any week with 7 days logged
  const perfectWeek = (() => {
    const set = new Set(days);
    for (const d of days) {
      const dt = new Date(d);
      const dow = (dt.getDay() + 6) % 7;
      const monday = new Date(dt); monday.setDate(dt.getDate() - dow);
      let ok = true;
      for (let i = 0; i < 7; i++) {
        const wk = new Date(monday); wk.setDate(monday.getDate() + i);
        const k = `${wk.getFullYear()}-${String(wk.getMonth()+1).padStart(2,'0')}-${String(wk.getDate()).padStart(2,'0')}`;
        if (!set.has(k)) { ok = false; break; }
      }
      if (ok) return true;
    }
    return false;
  })();

  const unlocked = [];
  for (const a of ACHIEVEMENTS) {
    let isOn = false;
    if (a.group === 'logging') isOn = totalFits >= a.threshold;
    else if (a.group === 'streak') isOn = streak >= a.threshold;
    else if (a.id === 'rate-first')  isOn = ratedCount >= 1;
    else if (a.id === 'mood-10')     isOn = moodCount >= 10;
    else if (a.id === 'pieces-20')   isOn = piecesUnique >= 20;
    else if (a.id === 'score-80')    isOn = bestScore >= 80;
    else if (a.id === 'week-7')      isOn = perfectWeek;
    else if (a.id === 'ctx-night-5') isOn = (ctxCounts['Night out'] || 0) >= 5;
    else if (a.id === 'ctx-work-10') isOn = (ctxCounts['Work'] || 0) >= 10;
    if (isOn) unlocked.push(a.id);
  }
  return unlocked;
}

export function getStoredUnlocked() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch (e) { return []; }
}
export function setStoredUnlocked(ids) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(ids)); } catch (e) {}
}

// Diff current vs stored, persist current, return the freshly-unlocked ones.
export function syncAchievementsAndGetNew() {
  const current = evaluateAchievements();
  const prev = new Set(getStoredUnlocked());
  const fresh = current.filter(id => !prev.has(id));
  setStoredUnlocked(current);
  return { unlocked: current, fresh };
}
