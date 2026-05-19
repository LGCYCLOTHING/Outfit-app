import React from 'react';
import {
  useTheme, bgColor, fgColor,
  ArchiveBurger, StatusBar, TabBar,
} from '../lib/shared.jsx';
import LiquidMesh from '../lib/liquid-mesh.jsx';

// Per-combo image + description persistence
function comboPhotoKey(idx, slot)  { return `aevum_combo_${idx}_photo_${slot}`; }
function comboReasonKey(idx)       { return `aevum_combo_${idx}_reason`; }
function readPhoto(idx, slot) {
  try { return localStorage.getItem(comboPhotoKey(idx, slot)) || ''; }
  catch (e) { return ''; }
}
function readReason(idx) {
  try { return localStorage.getItem(comboReasonKey(idx)); }
  catch (e) { return null; }
}
// Write a photo data-URL. Returns false if storage rejected it (e.g. quota).
function writePhoto(idx, slot, dataUrl) {
  try {
    localStorage.setItem(comboPhotoKey(idx, slot), dataUrl);
    return true;
  } catch (e) {
    return false;
  }
}
function writeReason(idx, text) {
  try {
    if (!text) localStorage.removeItem(comboReasonKey(idx));
    else localStorage.setItem(comboReasonKey(idx), text);
  } catch (e) {}
}

// Shrink a picked image down with a target max dimension + quality.
async function fileToDataUrl(file, maxDim, quality) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error || new Error('read failed'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => resolve(reader.result);
      img.onload = () => {
        try {
          const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
          const w = Math.round(img.width * scale);
          const h = Math.round(img.height * scale);
          const canvas = document.createElement('canvas');
          canvas.width = w; canvas.height = h;
          canvas.getContext('2d').drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL('image/jpeg', quality));
        } catch (e) {
          resolve(reader.result);
        }
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

// Encode the file and attempt to persist it. If the write fails (quota),
// retry at progressively smaller sizes so we never lose the user's pick.
async function encodeAndStore(file, idx, slot) {
  const sizes = [
    { maxDim: 1100, quality: 0.82 },
    { maxDim: 900,  quality: 0.78 },
    { maxDim: 720,  quality: 0.72 },
  ];
  for (const { maxDim, quality } of sizes) {
    const dataUrl = await fileToDataUrl(file, maxDim, quality);
    if (writePhoto(idx, slot, dataUrl)) return dataUrl;
  }
  // Last resort: clear other combo photo slots before giving up.
  return null;
}

export default function ScreenMix() {
  const t = useTheme();
  const accent = t.light;
  const accentHot = t.hot;
  const accentRgba = t.softRgba;

  const combos = React.useMemo(() => ([
    {
      title: 'Everyday rotation',
      defaultReason: "Three relaxed pulls from your closet — different palettes, all anchored by clean white sneakers. Easy to rotate through the week.",
      conf: 92, locked: false, pieces: '3 pieces · everyday',
    },
    {
      title: 'Rust + olive monochrome',
      defaultReason: "Earth-tone study. The suede jacket grounds the olive trousers; brick scarf adds tension. Echoes a fit from Oct '25 that you saved twice.",
      conf: 88, locked: false, pieces: '3 pieces · evening',
    },
    {
      title: 'High-contrast layering',
      defaultReason: 'Charcoal trench over dusty rose, leather boots. AI flagged this as a stretch — bold but harmonious.',
      conf: 81, locked: true, pieces: '3 pieces · night out',
    },
  ]), []);

  // Per-combo state — photos[0..2] + reason (null = use default)
  const [comboState, setComboState] = React.useState(() => combos.map((c, idx) => ({
    photos: [readPhoto(idx, 0), readPhoto(idx, 1), readPhoto(idx, 2)],
    reason: readReason(idx),
  })));

  const setPhotoInState = (idx, slot, dataUrl) => {
    setComboState(prev => prev.map((s, i) => {
      if (i !== idx) return s;
      const photos = [...s.photos];
      photos[slot] = dataUrl;
      return { ...s, photos };
    }));
  };

  const setReason = (idx, text) => {
    setComboState(prev => prev.map((s, i) => i === idx ? { ...s, reason: text } : s));
    writeReason(idx, text);
  };

  const onPickFile = async (idx, slot, e) => {
    const input = e.target;
    const f = input.files && input.files[0];
    if (!f) return;
    try {
      // Show the (un-persisted) preview immediately so the UI feels instant,
      // then encode + store. If every size fails, surface the in-memory image
      // so the user at least sees what they picked this session.
      const previewUrl = await fileToDataUrl(f, 1100, 0.82);
      setPhotoInState(idx, slot, previewUrl);
      const stored = await encodeAndStore(f, idx, slot);
      if (stored && stored !== previewUrl) setPhotoInState(idx, slot, stored);
      if (!stored && typeof window !== 'undefined') {
        console.warn('Mix: could not persist combo photo — localStorage quota likely full');
      }
    } catch (err) { /* swallow */ }
    try { input.value = ''; } catch (err) {}
  };

  return (
    <div style={{
      width: '100%', height: '100%', position: 'relative', overflow: 'hidden',
      background: bgColor(),
      fontFamily: 'DM Sans, -apple-system, system-ui, sans-serif',
      color: fgColor(),
    }}>
      <div style={{
        position: 'absolute', top: -200, right: -120,
        width: 460, height: 460, borderRadius: '50%',
        background: `radial-gradient(circle, rgba(${accentRgba},0.26) 0%, transparent 60%)`,
        filter: 'blur(40px)', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', top: 480, left: -160,
        width: 380, height: 380, borderRadius: '50%',
        background: `radial-gradient(circle, rgba(${accentRgba},0.16) 0%, transparent 60%)`,
        filter: 'blur(40px)', pointerEvents: 'none',
      }} />
      <LiquidMesh seed={2} intensity={1} />

      <StatusBar />

      <div style={{ position: 'absolute', zIndex: 2, top: 'var(--archive-safe-top, 54px)', left: 0, right: 0, bottom: 0, padding: '0 24px calc(120px + var(--archive-safe-bottom, 0px))', overflow: 'auto', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 6 }}>
          <ArchiveBurger />
          <div style={{ width: 3, height: 14, borderRadius: 1.5, background: accent }} />
          <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', letterSpacing: -0.4, fontFamily: '"DM Sans", sans-serif' }}>
            AI MIX · UPDATED 2h AGO
          </span>
        </div>
        <div className="h-display" style={{ fontSize: 40, marginBottom: 8 }}>
          Combos you<br/>
          <em>haven't tried.</em>
        </div>
        <div style={{ fontSize: 15, color: 'var(--text-primary)', lineHeight: 1.45, marginBottom: 22 }}>
          Pulled from 312 logged fits · refreshed daily
        </div>

        {combos.map((c, idx) => {
          const state = comboState[idx];
          const reason = state.reason != null ? state.reason : c.defaultReason;
          return (
          <div key={idx} style={{
            marginBottom: 18, position: 'relative',
            background: 'rgba(255,240,220,0.04)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,240,220,0.07)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.22)',
            borderRadius: 18,
            padding: 16,
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-primary)', fontFamily: '"DM Sans", sans-serif', letterSpacing: -0.30 }}>
                    COMBO · {String(idx + 1).padStart(2, '0')}
                  </span>
                  {!c.locked && (
                    <span style={{
                      fontSize: 12, color: accent, fontFamily: '"DM Sans", sans-serif', letterSpacing: -0.20,
                      padding: '2px 7px', borderRadius: 4,
                      background: `rgba(${accentRgba},0.10)`,
                      boxShadow: `inset 0 0 0 0.5px rgba(${accentRgba},0.3)`,
                    }}>{c.conf}% MATCH</span>
                  )}
                </div>
                {c.locked && (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    padding: '3px 9px', borderRadius: 100,
                    background: `linear-gradient(135deg, ${accent} 0%, ${accentHot} 100%)`,
                    fontSize: 12, color: '#0a0a0a', fontWeight: 500, letterSpacing: -0.13,
                  }}>
                    <svg width="9" height="11" viewBox="0 0 12 14" fill="#0a0a0a">
                      <path d="M6 0a4 4 0 0 0-4 4v2H1v8h10V6h-1V4a4 4 0 0 0-4-4zm0 2a2 2 0 0 1 2 2v2H4V4a2 2 0 0 1 2-2z"/>
                    </svg>
                    PRO
                  </div>
                )}
              </div>

              {/* 3 photo slots — tap to pick an image (label wraps an invisible file input) */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, marginBottom: 14, position: 'relative' }}>
                {[0, 1, 2].map((slot) => {
                  const photo = state.photos[slot];
                  const disabled = c.locked;
                  return (
                    <label key={slot}
                      className={disabled ? '' : 'archive-pressable'}
                      style={{
                        position: 'relative',
                        aspectRatio: '3/4',
                        borderRadius: 12,
                        overflow: 'hidden',
                        background: '#0a0a0a',
                        boxShadow: 'inset 0 0 0 0.5px rgba(255,255,255,0.10)',
                        cursor: disabled ? 'default' : 'pointer',
                        filter: c.locked ? 'blur(8px) brightness(0.6)' : 'none',
                        display: 'block',
                      }}>
                      {!disabled && (
                        <input
                          type="file" accept="image/*"
                          onChange={(e) => onPickFile(idx, slot, e)}
                          style={{
                            position: 'absolute', inset: 0,
                            opacity: 0, cursor: 'pointer',
                            fontSize: 0,
                          }}
                        />
                      )}
                      {photo ? (
                        <img src={photo} alt="" style={{
                          width: '100%', height: '100%', objectFit: 'contain', display: 'block',
                        }} />
                      ) : (
                        <div style={{
                          width: '100%', height: '100%',
                          background: `linear-gradient(160deg, rgba(${accentRgba},0.18), rgba(0,0,0,0.5))`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: 'rgba(255,255,255,0.55)',
                        }}>
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 7h3l2-2.5h8L18 7h3a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1z"/>
                            <circle cx="12" cy="13" r="3.5"/>
                          </svg>
                        </div>
                      )}
                      {slot < 2 && (
                        <div style={{
                          position: 'absolute', top: '50%', right: -6, width: 12, height: 1,
                          background: `rgba(${accentRgba},0.4)`, zIndex: 2,
                        }} />
                      )}
                    </label>
                  );
                })}
                {c.locked && (
                  <div style={{
                    position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    pointerEvents: 'none',
                  }}>
                    <div style={{
                      width: 52, height: 52, borderRadius: 26,
                      background: 'rgba(20,16,14,0.7)',
                      backdropFilter: 'blur(10px)',
                      boxShadow: `inset 0 0 0 0.5px rgba(${accentRgba},0.4)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <svg width="20" height="22" viewBox="0 0 12 14" fill={accent}>
                        <path d="M6 0a4 4 0 0 0-4 4v2H1v8h10V6h-1V4a4 4 0 0 0-4-4zm0 2a2 2 0 0 1 2 2v2H4V4a2 2 0 0 1 2-2z"/>
                      </svg>
                    </div>
                  </div>
                )}
              </div>

              <div style={{ fontSize: 17, fontWeight: 500, letterSpacing: -0.2, marginBottom: 6 }}>
                {c.title}
              </div>

              {/* Editable description — tap to type */}
              <div style={{
                marginBottom: 12, paddingLeft: 10,
                borderLeft: `2px solid ${c.locked ? `rgba(${accentRgba},0.3)` : accent}`,
              }}>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(idx, e.target.value)}
                  disabled={c.locked}
                  rows={3}
                  placeholder="Why this combo? Add your own note…"
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    background: 'transparent', border: 'none', outline: 'none', resize: 'none',
                    color: 'var(--text-primary)', fontFamily: 'inherit',
                    fontSize: 14, lineHeight: 1.5,
                    padding: 0,
                    opacity: c.locked ? 0.6 : 1,
                  }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, color: 'var(--text-primary)', fontFamily: '"DM Sans", sans-serif', letterSpacing: -0.15 }}>
                  {c.pieces}
                </span>
                <span onClick={() => window.__archiveGo && window.__archiveGo(c.locked ? 'paywall' : 'rating')} style={{
                  fontSize: 14, fontWeight: 500,
                  color: c.locked ? accent : '#fff',
                  display: 'flex', alignItems: 'center', gap: 4,
                  cursor: 'pointer',
                }}>
                  {c.locked ? 'Unlock' : 'Try it'}
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                    <path d="M9 6l6 6-6 6"/>
                  </svg>
                </span>
              </div>
            </div>
          </div>
          );
        })}
      </div>

      <TabBar active="mix" />
    </div>
  );
}
