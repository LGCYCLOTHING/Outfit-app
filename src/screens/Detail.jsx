import React from 'react';
import { useTheme, StatusBar, FitPhoto, getSavedFitPhoto, appendFitPhoto } from '../lib/shared.jsx';

function ymd(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// Resolve which photo key to show. Callers (Today, Archive, Story) stash a key
// on window.__archiveDetailKey before navigating. We honor whatever was stashed
// (even if no photo is saved for it) so the header reflects the day they tapped.
function resolveDetailPhotoKey() {
  const stashed = typeof window !== 'undefined' ? window.__archiveDetailKey : null;
  if (stashed != null) return stashed;
  return 23; // legacy demo
}

const SHORT_MONTHS = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
const LONG_MONTHS  = ['JANUARY','FEBRUARY','MARCH','APRIL','MAY','JUNE','JULY','AUGUST','SEPTEMBER','OCTOBER','NOVEMBER','DECEMBER'];

function isDateKey(v) {
  return typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v);
}
function deriveHeader(key) {
  if (isDateKey(key)) {
    const d = new Date(key);
    const shortLabel = `${SHORT_MONTHS[d.getMonth()]} ${String(d.getDate()).padStart(2, '0')}`;
    const longMonth = LONG_MONTHS[d.getMonth()];
    return {
      topLabel: shortLabel,
      eyebrow: longMonth,
      isDate: true,
    };
  }
  // numeric demo fallback
  const n = typeof key === 'number' ? key : 23;
  return {
    topLabel: `FIT ${String(n).padStart(3, '0')} · MAR 14`,
    eyebrow: 'MARCH · OUTDOOR · DAY',
    isDate: false,
  };
}

export default function ScreenDetail() {
  const t = useTheme();
  const accent = t.light;
  const accentHot = t.hot;
  const accentRgba = t.softRgba;

  const [tab, setTab] = React.useState('Pieces');
  const tabs = ['Pieces', 'People', 'Notes'];

  const [photoKey, setPhotoKey] = React.useState(() => resolveDetailPhotoKey());
  const [photo, setPhoto] = React.useState(() => getSavedFitPhoto(photoKey));
  // Refresh when: the user logs a new fit, OR when they re-navigate to detail
  // (different day tapped — App.jsx keeps this screen mounted between visits).
  React.useEffect(() => {
    const refresh = () => {
      const k = resolveDetailPhotoKey();
      setPhotoKey(k);
      setPhoto(getSavedFitPhoto(k));
    };
    const onNav = (e) => { if (e && e.detail === 'detail') refresh(); };
    window.addEventListener('archive:fitschanged', refresh);
    window.addEventListener('archive:navigate', onNav);
    return () => {
      window.removeEventListener('archive:fitschanged', refresh);
      window.removeEventListener('archive:navigate', onNav);
    };
  }, []);
  const header = deriveHeader(photoKey);
  const fileRef = React.useRef(null);
  const onPickFile = (e) => {
    const input = e.target;
    const f = input.files && input.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        // Downscale before persisting (12MP iPhone shot would blow the quota).
        const MAX = 1400;
        let { width, height } = img;
        const scale = Math.min(1, MAX / Math.max(width, height));
        width = Math.round(width * scale);
        height = Math.round(height * scale);
        const canvas = document.createElement('canvas');
        canvas.width = width; canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
        let dataUrl;
        try { dataUrl = canvas.toDataURL('image/jpeg', 0.85); }
        catch (err) { dataUrl = reader.result; }

        // Logs the fit on the date this Detail screen represents. Only
        // date-keyed Details (string ymd) actually persist — numeric demo ids
        // (e.g. archive id 23) keep the old replace-first-photo behavior so
        // mock fits aren't accidentally turned into multi-photo logs.
        const isDate = typeof photoKey === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(photoKey);
        if (isDate) {
          appendFitPhoto(photoKey, dataUrl);
          try {
            const logged = JSON.parse(localStorage.getItem('aevum_fits_logged') || '[]');
            if (!logged.includes(photoKey)) {
              logged.push(photoKey);
              localStorage.setItem('aevum_fits_logged', JSON.stringify(logged));
            }
          } catch (err) {}
        } else {
          try { localStorage.setItem('aevum_fit_photo_' + photoKey, dataUrl); } catch (err) {}
          try { window.dispatchEvent(new CustomEvent('archive:fitschanged', { detail: { key: photoKey } })); } catch (err) {}
        }
        setPhoto(dataUrl);
        try { input.value = ''; } catch (err) {}
      };
      img.onerror = () => { try { input.value = ''; } catch (err) {} };
      img.src = reader.result;
    };
    reader.readAsDataURL(f);
  };

  const people = [
    { id: 1, name: 'Alex',  initials: 'A', tone: '#7aa6c4' },
    { id: 2, name: 'Jules', initials: 'J', tone: '#c4877a' },
    { id: 3, name: 'Sam',   initials: 'S', tone: '#a47ac4' },
  ];

  const pieces = [
    { name: 'Suede field jacket',  brand: 'Stòffa',     tone: 'Rust' },
    { name: 'Cream merino crew',   brand: 'The Row',    tone: 'Cream' },
    { name: 'Pleated wool trouser',brand: 'Lemaire',    tone: 'Olive' },
    { name: 'Vintage Levi\'s belt',brand: 'Vintage',    tone: 'Tan'   },
    { name: 'Suede derby',         brand: 'Hender',     tone: 'Brown' },
  ];

  return (
    <div style={{
      width: '100%', height: '100%', position: 'relative', overflow: 'hidden',
      fontFamily: 'DM Sans, -apple-system, system-ui, sans-serif',
      color: '#1a1410',
      background: `
        radial-gradient(120% 80% at 50% -10%, rgba(${accentRgba},0.55) 0%, transparent 60%),
        radial-gradient(80% 60% at 80% 100%, rgba(${accentRgba},0.40) 0%, transparent 65%),
        linear-gradient(180deg, #f4ebe0 0%, #e6d4be 35%, #c89a78 70%, #6f4733 100%)
      `,
    }}>
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        opacity: 0.18, mixBlendMode: 'multiply',
        backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.4 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>")`,
      }} />

      <StatusBar />

      <div style={{
        position: 'relative', zIndex: 2,
        padding: 'calc(36px + var(--archive-safe-top, 54px)) 0 calc(120px + var(--archive-safe-bottom, 0px))',
        height: '100%', overflow: 'auto', boxSizing: 'border-box',
      }}>
        <div style={{ padding: '0 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div onClick={() => {
            const prev = (typeof window !== 'undefined' && window.__archivePrevScreen) || 'today';
            window.__archiveGo && window.__archiveGo(prev);
          }} style={{
            width: 38, height: 38, borderRadius: 19,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
          }} className="liquid-glass">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1a1410" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 6l-6 6 6 6"/>
            </svg>
          </div>
          <div style={{
            fontSize: 12, color: 'rgba(26,20,16,0.55)',
            letterSpacing: -0.50, fontFamily: '"DM Sans", sans-serif',
          }}>
            {header.topLabel}
          </div>
          <div style={{
            width: 38, height: 38, borderRadius: 19,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
          }} className="liquid-glass">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1a1410" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="1"/>
              <circle cx="19" cy="12" r="1"/>
              <circle cx="5" cy="12" r="1"/>
            </svg>
          </div>
        </div>

        <div style={{
          padding: '0 28px', textAlign: 'center', marginBottom: 10,
          fontSize: 12, letterSpacing: -0.60,
          color: 'rgba(26,20,16,0.55)',
          fontFamily: '"DM Sans", sans-serif',
        }}>
          {header.eyebrow}
        </div>

        <div style={{ padding: '0 30px', textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: 44, fontWeight: 400, lineHeight: 1.05,
            letterSpacing: -0.5, color: '#1a1410',
          }}>
            {header.isDate ? (
              photo ? (
                <>Logged <span style={{ fontStyle: 'italic' }}>fit.</span></>
              ) : (
                <>No fit <span style={{ fontStyle: 'italic' }}>logged.</span></>
              )
            ) : (
              <>Rust suede &<br/><span style={{ fontStyle: 'italic' }}>cream knit.</span></>
            )}
          </div>
          <div style={{
            fontSize: 15, color: 'rgba(26,20,16,0.6)',
            marginTop: 12, lineHeight: 1.55,
            maxWidth: 280, margin: '12px auto 0',
          }}>
            {header.isDate
              ? (photo
                  ? 'Tap the camera to replace this photo, or open Pieces below to add what you wore.'
                  : 'Nothing logged for this day yet. Tap the camera to add a photo.')
              : 'Worn three times. A reliable autumn baseline — tonal, warm, photographs well in low light.'}
          </div>
        </div>

        <div style={{ padding: '0 38px', marginBottom: 32, position: 'relative' }}>
          <div style={{
            position: 'relative', borderRadius: 4, overflow: 'hidden',
            boxShadow: '0 30px 60px -15px rgba(60,30,15,0.45), 0 10px 20px -8px rgba(60,30,15,0.3)',
            aspectRatio: '3/4',
          }}>
            {photo ? (
              <div style={{ width: '100%', height: '100%', borderRadius: 4, overflow: 'hidden', background: '#000' }}>
                <img src={photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              </div>
            ) : (
              <FitPhoto id={23} radius={4} ratio="3/4" photoKey={photoKey} />
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={onPickFile}
              style={{ display: 'none' }}
            />
            <div
              onClick={() => fileRef.current && fileRef.current.click()}
              className="archive-pressable"
              style={{
                position: 'absolute', bottom: 10, right: 10,
                width: 34, height: 34, borderRadius: 17,
                background: 'rgba(26,20,16,0.55)', backdropFilter: 'blur(12px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: 'inset 0 0 0 0.5px rgba(255,255,255,0.18)',
              }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F5F0E8" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 7h3l2-2.5h8L18 7h3a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1z"/>
                <circle cx="12" cy="13" r="3.5"/>
              </svg>
            </div>
          </div>
          <div style={{
            position: 'absolute', top: '50%', right: 14,
            transform: 'translateY(-50%)',
            display: 'flex', flexDirection: 'column', gap: 8,
          }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{
                width: 10, height: 10, borderRadius: 5,
                background: i === 0 ? '#1a1410' : 'rgba(26,20,16,0.25)',
                cursor: 'pointer',
              }} />
            ))}
          </div>
        </div>

        <div style={{
          padding: '0 28px', marginBottom: 22,
          display: 'flex', justifyContent: 'center', gap: 28,
          borderBottom: '0.5px solid rgba(26,20,16,0.15)',
        }}>
          {tabs.map(label => {
            const active = tab === label;
            return (
              <div key={label} onClick={() => setTab(label)} style={{
                position: 'relative',
                padding: '0 0 12px', cursor: 'pointer',
                fontSize: 15, fontWeight: active ? 500 : 400,
                color: active ? '#1a1410' : 'rgba(26,20,16,0.55)',
                letterSpacing: 0.1,
                transition: 'color .2s ease',
              }}>
                {label}
                {active && (
                  <div style={{
                    position: 'absolute', bottom: -0.5, left: 0, right: 0, height: 1.5,
                    background: '#1a1410',
                  }} />
                )}
              </div>
            );
          })}
        </div>

        <div style={{ padding: '0 28px' }}>
          {tab === 'Pieces' && (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {pieces.map((p, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '14px 0',
                  borderBottom: i < pieces.length - 1 ? '0.5px solid rgba(26,20,16,0.10)' : 'none',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{
                      width: 8, height: 8, borderRadius: 4,
                      background: '#1a1410', opacity: 0.6,
                    }} />
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 500, color: '#1a1410', letterSpacing: -0.1 }}>{p.name}</div>
                      <div style={{ fontSize: 13, color: 'rgba(26,20,16,0.55)', marginTop: 2 }}>{p.brand} · {p.tone}</div>
                    </div>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(26,20,16,0.4)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 6l6 6-6 6"/>
                  </svg>
                </div>
              ))}
            </div>
          )}

          {tab === 'People' && (
            <div>
              <div style={{ display: 'flex', gap: 18, alignItems: 'center', marginBottom: 18, flexWrap: 'wrap' }}>
                {people.map(p => (
                  <div key={p.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <div style={{
                      width: 56, height: 56, borderRadius: 28,
                      background: `radial-gradient(circle at 30% 30%, ${p.tone}, ${p.tone}88 60%, ${p.tone}33 100%)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 20, color: '#fff',
                      boxShadow: '0 4px 14px rgba(0,0,0,0.18)',
                      fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic',
                    }}>{p.initials}</div>
                    <div style={{ fontSize: 14, color: 'rgba(26,20,16,0.75)' }}>{p.name}</div>
                  </div>
                ))}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    width: 56, height: 56, borderRadius: 28,
                    border: '1px dashed rgba(26,20,16,0.25)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer',
                  }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(26,20,16,0.55)" strokeWidth="1" strokeLinecap="round">
                      <path d="M12 5v14M5 12h14"/>
                    </svg>
                  </div>
                  <div style={{ fontSize: 14, color: 'rgba(26,20,16,0.5)' }}>Add</div>
                </div>
              </div>
              <div style={{
                display: 'flex', alignItems: 'flex-start', gap: 10,
                padding: '13px 16px', borderRadius: 12,
                background: 'rgba(180,90,40,0.10)',
                boxShadow: 'inset 0 0 0 0.5px rgba(180,90,40,0.25)',
              }}>
                <div style={{ fontSize: 16, lineHeight: 1, marginTop: 1 }}>·</div>
                <div style={{ flex: 1, fontSize: 14, lineHeight: 1.45, color: 'rgba(26,20,16,0.85)' }}>
                  Worn around <strong style={{ fontWeight: 500 }}>Alex</strong> twice this month. A different combination might be welcome.
                </div>
              </div>
            </div>
          )}

          {tab === 'Notes' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {[
                ['Mood',     'Confident'],
                ['Weather',  '58° · Cloudy'],
                ['Location', 'Campus'],
                ['Worn',     '3 times'],
                ['Average rating', '4.5 / 5'],
              ].map(([k, v], i, arr) => (
                <div key={k} style={{
                  display: 'flex', justifyContent: 'space-between',
                  padding: '13px 0',
                  borderBottom: i < arr.length - 1 ? '0.5px solid rgba(26,20,16,0.10)' : 'none',
                }}>
                  <div style={{ fontSize: 15, color: 'rgba(26,20,16,0.6)' }}>{k}</div>
                  <div style={{ fontSize: 15, color: '#1a1410', fontWeight: 500 }}>{v}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <DetailNavBar accent={accent} accentHot={accentHot} accentRgba={accentRgba} />
    </div>
  );
}

function DetailNavBar({ accent, accentHot, accentRgba }) {
  const detailKey = 23;
  const readLiked = () => {
    try { return new Set(JSON.parse(localStorage.getItem('aevum_liked_fits') || '[]')); }
    catch (e) { return new Set(); }
  };
  const [liked, setLiked] = React.useState(() => readLiked().has(detailKey));
  React.useEffect(() => {
    const refresh = () => setLiked(readLiked().has(detailKey));
    window.addEventListener('archive:likeschanged', refresh);
    return () => window.removeEventListener('archive:likeschanged', refresh);
  }, []);
  const toggle = () => {
    const set = readLiked();
    if (set.has(detailKey)) set.delete(detailKey); else set.add(detailKey);
    try { localStorage.setItem('aevum_liked_fits', JSON.stringify(Array.from(set))); } catch (e) {}
    setLiked(set.has(detailKey));
    try { window.dispatchEvent(new CustomEvent('archive:likeschanged')); } catch (e) {}
  };

  const goBack = () => {
    const prev = (typeof window !== 'undefined' && window.__archivePrevScreen) || 'today';
    window.__archiveGo && window.__archiveGo(prev);
  };
  const items = [
    { id: 'archive', icon: <path d="M21 8v13H3V8M1 3h22v5H1zM10 12h4"/>, onClick: () => window.__archiveGo && window.__archiveGo('archive') },
    { id: 'heart',   icon: <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>, accent: true, onClick: toggle },
    { id: 'share',   icon: <path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7M16 6l-4-4-4 4M12 2v14"/>, onClick: () => window.__archiveGo && window.__archiveGo('share') },
    { id: 'close',   icon: <path d="M18 6L6 18M6 6l12 12"/>, onClick: goBack },
  ];

  return (
    <div className="liquid-glass" style={{
      position: 'absolute',
      bottom: 'calc(22px + var(--archive-safe-bottom, 0px))',
      left: '50%', transform: 'translateX(-50%)',
      zIndex: 5,
      display: 'flex', alignItems: 'center', gap: 4,
      padding: 6, borderRadius: 100,
      boxShadow: '0 14px 40px -8px rgba(0,0,0,0.45)',
    }}>
      {items.map(b => {
        const isHeart = b.id === 'heart';
        const heartFill = isHeart && liked;
        return (
          <div key={b.id}
            onClick={(e) => { e.stopPropagation(); b.onClick(); }}
            className="archive-pressable"
            style={{
              width: 44, height: 44, borderRadius: 22,
              background: b.accent ? `linear-gradient(135deg, ${accent}, ${accentHot})` : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: b.accent ? `0 6px 16px -4px rgba(${accentRgba},0.55)` : 'none',
            }}>
            <svg width="17" height="17" viewBox="0 0 24 24"
              fill={isHeart && heartFill ? '#F08AB0' : 'none'}
              stroke={isHeart && heartFill ? '#F08AB0' : (b.accent ? '#1a1410' : '#fff')}
              strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              {b.icon}
            </svg>
          </div>
        );
      })}
    </div>
  );
}
