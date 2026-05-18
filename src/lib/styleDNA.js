// Style DNA — classify the user's logged fits into 5 archetypes based on
// mood + context + piece-category frequencies + rating average.

import { getSavedFitMeta, getSavedFitPhotos } from './shared.jsx';

export const UNLOCK_THRESHOLD = 20;

export const CATEGORIES = [
  { id: 'minimal',     label: 'Minimal',      color: '#8B9E8B' },
  { id: 'streetwear',  label: 'Streetwear',   color: '#C8956C' },
  { id: 'smartcasual', label: 'Smart Casual', color: '#8BA7B8' },
  { id: 'formal',      label: 'Formal',       color: '#7C6E9E' },
  { id: 'expressive',  label: 'Expressive',   color: '#C4856A' },
];

const NEUTRAL_PIECE_KEYWORDS = ['black','white','cream','grey','gray','beige','tan','navy','olive','khaki','stone','ivory','charcoal'];

function readLoggedDays() {
  try { return JSON.parse(localStorage.getItem('aevum_fits_logged') || '[]'); }
  catch (e) { return []; }
}
function readPieces() {
  try { return JSON.parse(localStorage.getItem('aevum_pieces') || '[]'); }
  catch (e) { return []; }
}

export function getTotalFitCount() {
  let total = 0;
  for (const k of readLoggedDays()) total += getSavedFitPhotos(k).length;
  return total;
}

export function computeStyleDNA() {
  const days = readLoggedDays();
  const allMeta = [];
  for (const k of days) {
    const metas = getSavedFitMeta(k);
    const photos = getSavedFitPhotos(k);
    metas.forEach(m => allMeta.push(m || {}));
    for (let i = metas.length; i < photos.length; i++) allMeta.push({});
  }
  const total = allMeta.length;
  const pieces = readPieces();
  // Tag tallies
  const moods = {};
  const ctxs = {};
  let ratingSum = 0, ratingCount = 0;
  for (const m of allMeta) {
    if (m.mood) moods[m.mood] = (moods[m.mood] || 0) + 1;
    if (m.ctx)  ctxs[m.ctx]   = (ctxs[m.ctx] || 0) + 1;
    if (typeof m.stars === 'number') { ratingSum += m.stars; ratingCount++; }
  }
  const ratingAvg = ratingCount ? ratingSum / ratingCount : 0;

  // Piece signals
  const totalPieces = pieces.length;
  const neutralPieces = pieces.filter(p =>
    NEUTRAL_PIECE_KEYWORDS.some(k =>
      (p.color || '').toLowerCase().includes(k) || (p.name || '').toLowerCase().includes(k)
    )
  ).length;
  const neutralRatio = totalPieces ? neutralPieces / totalPieces : 0.5;
  const categoryDistinct = new Set(pieces.map(p => p.category || '')).size;
  const categoryVariety = Math.min(1, categoryDistinct / 5);

  const moodPct = (label) => total ? (moods[label] || 0) / total : 0;
  const ctxPct  = (label) => total ? (ctxs[label] || 0) / total : 0;

  // Raw scores per category (higher = stronger fit)
  const raw = {
    minimal:     ctxPct('Casual') * 1.2 + moodPct('Confident') * 0.8 + neutralRatio * 1.0,
    streetwear:  ctxPct('Night out') * 1.4 + moodPct('Confident') * 0.5 + categoryVariety * 0.9,
    smartcasual: ctxPct('Work') * 1.0 + (ratingAvg / 5) * 0.9 + (1 - Math.abs(0.5 - neutralRatio) * 2) * 0.4,
    formal:      ctxPct('Work') * 0.9 + moodPct('Overdressed') * 1.6 + (1 - neutralRatio) * 0.2,
    expressive:  categoryVariety * 1.2 + moodPct('Underdressed') * 0.6 + (1 - neutralRatio) * 0.7,
  };
  // Smooth so they aren't all 0 with no signal
  for (const k of Object.keys(raw)) raw[k] = Math.max(0.05, raw[k]);

  // Normalize to percentages
  const sum = Object.values(raw).reduce((a, b) => a + b, 0) || 1;
  const percents = {};
  for (const k of Object.keys(raw)) percents[k] = (raw[k] / sum) * 100;
  // Round and adjust so they sum to 100
  const ordered = CATEGORIES.map(c => ({ ...c, pct: percents[c.id], raw: raw[c.id] }));
  let rounded = ordered.map(o => ({ ...o, pct: Math.round(o.pct) }));
  let diff = 100 - rounded.reduce((a, b) => a + b.pct, 0);
  // Push diff to the largest until sum = 100
  while (diff !== 0) {
    rounded.sort((a, b) => b.pct - a.pct);
    rounded[0].pct += diff > 0 ? 1 : -1;
    diff += diff > 0 ? -1 : 1;
  }
  // Re-sort by percent for display order
  rounded.sort((a, b) => b.pct - a.pct);

  const primary = rounded[0];
  const secondary = rounded[1];
  return { rounded, primary, secondary, totalFits: total };
}

const PRIMARY_DESCRIPTIONS = {
  minimal:     'You favor clean, unfussy combinations that let quality speak for itself.',
  streetwear:  'Your style is expressive and culture-forward. You dress for the moment.',
  smartcasual: 'You strike the balance between polished and relaxed with natural ease.',
  formal:      'You default to structure and intention. Every outfit is considered.',
  expressive:  'Your wardrobe is a mood board. No two fits tell the same story.',
};

export function describeStyle(primary, secondary) {
  if (!primary) return '';
  const main = PRIMARY_DESCRIPTIONS[primary.id] || '';
  if (!secondary || secondary.pct < 10) return main;
  return `${main} With a ${secondary.label} influence.`;
}
