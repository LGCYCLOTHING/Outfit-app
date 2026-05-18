import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles.css';
import App from './App.jsx';

// External icon (rendered outside the bezel by index.html) — sync to active
// theme/override. Also rewrites every <link rel="apple-touch-icon"> + the
// PWA favicon to the corresponding -mark.png so that the NEXT "Add to Home
// Screen" captures whichever icon the user currently has selected.
// Themes that don't have a dedicated icon set — fall back to ivory for the
// preview badge + home-screen icon.
const ICONLESS_THEMES = new Set(['noir']);

function updateExternalAppIcon() {
  if (typeof window === 'undefined') return;
  let id = 'ivory';
  try {
    const override = localStorage.getItem('aevum_app_icon');
    id = override || window.__archiveTheme || 'ivory';
  } catch (e) { id = window.__archiveTheme || 'ivory'; }
  if (ICONLESS_THEMES.has(id)) id = 'ivory';

  // In-app desktop preview badge (uses the no-text variant; wordmark is HTML)
  const img = document.getElementById('external-app-icon-img');
  if (img) img.src = `/icons/icon-${id}.png`;

  // Home-screen icon links — use the -mark.png variant with text baked in
  const markSrc = `/icons/icon-${id}-mark.png`;
  document.querySelectorAll('link[rel="apple-touch-icon"], link[rel="icon"]')
    .forEach(link => { link.href = markSrc; });
}
if (typeof window !== 'undefined') {
  window.addEventListener('archive:themechange', updateExternalAppIcon);
  window.addEventListener('archive:iconchange', updateExternalAppIcon);
  // Hide the external icon inside the secondary preview iframe (clean mode)
  try {
    if (new URLSearchParams(location.search).get('clean') === '1') {
      const el = document.getElementById('external-app-icon');
      if (el) el.style.display = 'none';
    }
  } catch (e) {}
  // Best-effort orientation lock for PWA standalone mode. Chrome/Edge support
  // screen.orientation.lock; Safari ignores it (so we also have a CSS overlay
  // that handles landscape on phones).
  try {
    if (screen && screen.orientation && screen.orientation.lock) {
      screen.orientation.lock('portrait').catch(() => {});
    }
  } catch (e) {}
}

if (typeof window !== 'undefined') {
  // One-shot localStorage migration: archive_* -> aevum_* (preserve user data
  // through the brand rename). Runs once per device, then sets a flag.
  try {
    if (!localStorage.getItem('aevum_migrated_from_archive')) {
      const keys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith('archive_')) keys.push(k);
      }
      keys.forEach(k => {
        const v = localStorage.getItem(k);
        const newKey = 'aevum_' + k.slice('archive_'.length);
        if (v != null && localStorage.getItem(newKey) == null) {
          localStorage.setItem(newKey, v);
        }
        localStorage.removeItem(k);
      });
      localStorage.setItem('aevum_migrated_from_archive', '1');
    }
  } catch (e) {}

  if (new URLSearchParams(location.search).get('light') === '1') {
    window.__archiveLight = true;
  }
  window.__archiveTheme = window.__archiveTheme || 'dusk';
  try {
    if ((location.search + location.hash).match(/[?&#]empty(=1)?\b/)) {
      window.__archiveEmpty = true;
    }
  } catch (e) {}
  updateExternalAppIcon();
}

function fitFrame() {
  const frame = document.getElementById('frame');
  const stage = document.getElementById('stage');
  if (!frame || !stage) return;
  const stageRect = stage.getBoundingClientRect();
  const w = stageRect.width;
  const h = stageRect.height;
  const s = w / 390;
  const cs = getComputedStyle(stage);
  const saTop = parseFloat(cs.getPropertyValue('--sa-top')) || 0;
  const saBottom = parseFloat(cs.getPropertyValue('--sa-bottom')) || 0;
  const designH = Math.ceil(h / s);
  frame.style.height = designH + 'px';
  frame.style.transform = `scale(${s})`;
  window.__archiveSafeTop = Math.round(saTop / s);
  window.__archiveSafeBottom = Math.round(saBottom / s);
  window.__archiveDesignH = designH;
  document.documentElement.style.setProperty('--archive-safe-top', (saTop / s) + 'px');
  document.documentElement.style.setProperty('--archive-safe-bottom', (saBottom / s) + 'px');
  window.dispatchEvent(new CustomEvent('archive:resize'));
}
window.addEventListener('resize', fitFrame);
window.addEventListener('orientationchange', fitFrame);
if (window.visualViewport) {
  window.visualViewport.addEventListener('resize', fitFrame);
}
fitFrame();
queueMicrotask(fitFrame);

// Kick off Supabase session restore + auth listener.
import('./lib/sync.js').then(({ initSupabaseSync }) => {
  try { initSupabaseSync(); } catch (e) {}
}).catch(() => {});

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
