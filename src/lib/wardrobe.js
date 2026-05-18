// Wardrobe completion %.
// Target is set once via a one-time prompt on the Pieces screen.

const TARGET_KEY = 'aevum_wardrobe_target';

export const TARGET_OPTIONS = [
  { label: 'Under 20', value: 20 },
  { label: '20–40',   value: 40 },
  { label: '40–60',   value: 60 },
  { label: '60+',     value: 80 },
];

export function getWardrobeTarget() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(TARGET_KEY);
    if (!raw) return null;
    const n = parseInt(raw, 10);
    return Number.isFinite(n) && n > 0 ? n : null;
  } catch (e) { return null; }
}
export function setWardrobeTarget(n) {
  try { localStorage.setItem(TARGET_KEY, String(n)); } catch (e) {}
}
export function clearWardrobeTarget() {
  try { localStorage.removeItem(TARGET_KEY); } catch (e) {}
}

function readPieces() {
  try { return JSON.parse(localStorage.getItem('aevum_pieces') || '[]'); }
  catch (e) { return []; }
}

export function getWardrobeCompletion() {
  const target = getWardrobeTarget();
  const count = readPieces().length;
  if (!target) return { count, target: null, percent: 0 };
  const percent = Math.min(100, Math.round((count / target) * 100));
  return { count, target, percent };
}

// Milestone achievement ids (kept in sync with achievements.js list).
export const WARDROBE_MILESTONES = [
  { id: 'wardrobe-25',  pct: 25,  title: 'Quarter cataloged',  toast: 'Quarter of your wardrobe cataloged ✦' },
  { id: 'wardrobe-50',  pct: 50,  title: 'Halfway',             toast: 'Halfway there. Keep going ✦' },
  { id: 'wardrobe-75',  pct: 75,  title: 'Almost complete',     toast: 'Almost complete ✦' },
  { id: 'wardrobe-100', pct: 100, title: 'Wardrobe complete',   toast: "Wardrobe complete. You're a legend ✦" },
];

export function checkWardrobeMilestones(percent) {
  return WARDROBE_MILESTONES.filter(m => percent >= m.pct);
}
