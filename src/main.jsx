import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles.css';
import App from './App.jsx';

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

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
