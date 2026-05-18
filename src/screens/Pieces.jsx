import React from 'react';
import {
  useTheme, bgColor, fgColor,
  ArchiveBurger, StatusBar, TabBar,
} from '../lib/shared.jsx';
import LiquidMesh from '../lib/liquid-mesh.jsx';
import {
  TARGET_OPTIONS, getWardrobeTarget, setWardrobeTarget, getWardrobeCompletion,
} from '../lib/wardrobe.js';
import { syncAchievementsAndGetNew, ACHIEVEMENTS } from '../lib/achievements.js';

const CATEGORIES = ['Tops', 'Bottoms', 'Shoes', 'Accessories', 'Outerwear'];

function readPieces() {
  try { return JSON.parse(localStorage.getItem('aevum_pieces') || '[]'); }
  catch (e) { return []; }
}
function writePieces(arr) {
  try { localStorage.setItem('aevum_pieces', JSON.stringify(arr)); } catch (e) {}
}
function isPro() {
  try { return !!localStorage.getItem('aevum_pro'); } catch (e) { return false; }
}

function CategoryIcon({ cat, size = 18, color = 'rgba(245,240,232,0.55)' }) {
  const sw = 1.5;
  if (cat === 'Tops') return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 7l4-3h8l4 3-3 4-2-1v11H7V10L5 11 4 7z"/>
    </svg>
  );
  if (cat === 'Bottoms') return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 3h12l-1 18h-4l-1-10-1 10H7L6 3z"/>
    </svg>
  );
  if (cat === 'Shoes') return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 17c0 2 1 3 3 3h11c2 0 4-1 4-3v-1c0-2-3-2-5-4l-3-3-4 1-2 4-4 1v2z"/>
    </svg>
  );
  if (cat === 'Accessories') return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="14" r="6"/><path d="M9 8V5h6v3"/>
    </svg>
  );
  // Outerwear
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 7l4-4 3 3 3-3 4 4-3 3v11h-8V10L5 7z"/>
    </svg>
  );
}

export default function ScreenPieces() {
  const t = useTheme();
  const accent = t.light;
  const accentHot = t.hot;
  const accentRgba = t.softRgba;

  const [pieces, setPieces] = React.useState(() => readPieces());
  const [adding, setAdding] = React.useState(false);
  const [pro, setPro] = React.useState(() => isPro());

  // Wardrobe target — show a one-time prompt if it hasn't been set yet.
  const [target, setTargetState] = React.useState(() => getWardrobeTarget());
  const [askTarget, setAskTarget] = React.useState(() => getWardrobeTarget() == null);
  const chooseTarget = (n) => {
    setWardrobeTarget(n);
    setTargetState(n);
    setAskTarget(false);
  };

  // Toast for any newly-unlocked wardrobe milestone.
  const [toast, setToast] = React.useState(null);
  React.useEffect(() => {
    const { fresh } = syncAchievementsAndGetNew();
    const wardrobeFresh = fresh.filter(id => id.startsWith('wardrobe-'));
    if (wardrobeFresh.length) {
      const newest = ACHIEVEMENTS.find(a => a.id === wardrobeFresh[wardrobeFresh.length - 1]);
      if (newest) {
        const toastMap = {
          'wardrobe-25':  'Quarter of your wardrobe cataloged ✦',
          'wardrobe-50':  'Halfway there. Keep going ✦',
          'wardrobe-75':  'Almost complete ✦',
          'wardrobe-100': "Wardrobe complete. You're a legend ✦",
        };
        setToast(toastMap[newest.id] || `Achievement unlocked · ${newest.title}`);
        const t = setTimeout(() => setToast(null), 3000);
        return () => clearTimeout(t);
      }
    }
  }, [pieces.length]);

  const completion = (() => {
    if (!target) return { count: pieces.length, target: null, percent: 0 };
    const percent = Math.min(100, Math.round((pieces.length / target) * 100));
    return { count: pieces.length, target, percent };
  })();

  // form state
  const [name, setName] = React.useState('');
  const [color, setColor] = React.useState('');
  const [category, setCategory] = React.useState('Tops');
  const [photo, setPhoto] = React.useState(null);
  const fileRef = React.useRef(null);

  const onPickFile = (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setPhoto(reader.result);
    reader.readAsDataURL(f);
  };

  const resetForm = () => {
    setName(''); setColor(''); setCategory('Tops'); setPhoto(null); setAdding(false);
  };

  const savePiece = () => {
    if (!name.trim()) return;
    const next = [...pieces, {
      id: Date.now(),
      name: name.trim(),
      color: color.trim(),
      category,
      photo: photo || null,
      createdAt: Date.now(),
    }];
    setPieces(next);
    writePieces(next);
    resetForm();
  };

  const removePiece = (id) => {
    const next = pieces.filter(p => p.id !== id);
    setPieces(next);
    writePieces(next);
  };

  // Paywall lock
  if (!pro) {
    return (
      <div style={{
        width: '100%', height: '100%', position: 'relative', overflow: 'hidden',
        background: bgColor(),
        fontFamily: 'DM Sans, -apple-system, system-ui, sans-serif',
        color: fgColor(),
      }}>
        <LiquidMesh seed={4} intensity={1} />
        <StatusBar />

        <div style={{
          position: 'relative', zIndex: 2,
          padding: 'calc(20px + var(--archive-safe-top, 54px)) 24px calc(120px + var(--archive-safe-bottom, 0px))',
          height: '100%', overflow: 'auto', boxSizing: 'border-box',
          display: 'flex', flexDirection: 'column',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <ArchiveBurger />
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500, letterSpacing: 0.8 }}>
              YOUR WARDROBE CATALOG
            </div>
          </div>

          <div className="h-display" style={{ fontSize: 48, color: 'var(--text-primary)', lineHeight: 1, marginBottom: 14 }}>
            <em>Pieces</em>
          </div>
          <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 32, maxWidth: 280 }}>
            Catalog every garment you own — track wear, color, and category.
          </div>

          <div style={{
            margin: '12px 0 28px', padding: 22, borderRadius: 20,
            background: `linear-gradient(135deg, rgba(${accentRgba},0.18) 0%, rgba(${accentRgba},0.04) 100%)`,
            border: `1px solid rgba(${accentRgba},0.30)`,
            boxShadow: `inset 0 1px 0 rgba(255,255,255,0.08), 0 8px 24px rgba(${accentRgba},0.15)`,
          }}>
            <div style={{
              display: 'inline-block',
              fontSize: 9, fontWeight: 500, letterSpacing: 2,
              padding: '4px 10px', borderRadius: 4,
              background: `linear-gradient(135deg, ${accent} 0%, ${accentHot} 100%)`,
              color: '#0a0a0a', marginBottom: 14,
            }}>PRO FEATURE</div>
            <div className="h-display" style={{ fontSize: 26, color: 'var(--text-primary)', lineHeight: 1.15, marginBottom: 10 }}>
              Build your wardrobe library.
            </div>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', lineHeight: 1.5, marginBottom: 18, textShadow: '0 1px 4px rgba(0,0,0,0.4)' }}>
              Unlock unlimited pieces, smart matching, and wear analytics with AĒVUM Pro.
            </div>
            <button
              onClick={() => window.__archiveGo && window.__archiveGo('paywall')}
              style={{
                border: 'none', cursor: 'pointer',
                padding: '13px 22px', borderRadius: 100,
                background: `linear-gradient(135deg, ${accent} 0%, ${accentHot} 100%)`,
                color: '#0a0a0a', fontSize: 15, fontWeight: 500,
                fontFamily: 'inherit',
              }}>
              Go Pro
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { t: 'Unlimited pieces', s: 'Catalog every garment without limits' },
              { t: 'Smart matching', s: 'See which pieces work together' },
              { t: 'Wear analytics', s: 'Track cost-per-wear and rotation' },
            ].map((row, i) => (
              <div key={i} className="lg-card" style={{
                padding: '14px 16px', borderRadius: 14,
                display: 'flex', alignItems: 'center', gap: 14,
              }}>
                <div style={{
                  width: 30, height: 30, borderRadius: 15,
                  background: `rgba(${accentRgba},0.28)`,
                  border: `1px solid rgba(${accentRgba},0.5)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12l5 5L20 7"/>
                  </svg>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, color: '#FFFFFF', letterSpacing: '-0.02em', textShadow: '0 1px 4px rgba(0,0,0,0.4)' }}>{row.t}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 2, textShadow: '0 1px 4px rgba(0,0,0,0.4)' }}>{row.s}</div>
                </div>
              </div>
            ))}
          </div>

          <div
            onClick={() => { try { localStorage.setItem('aevum_pro', '1'); } catch (e) {} setPro(true); }}
            className="archive-pressable"
            style={{
              marginTop: 18, alignSelf: 'center', cursor: 'pointer', textAlign: 'center',
              fontSize: 12, color: 'rgba(255,255,255,0.75)', letterSpacing: 0.4,
              textShadow: '0 1px 4px rgba(0,0,0,0.4)',
              textDecoration: 'underline', textUnderlineOffset: 3,
            }}>
            Preview as Pro
          </div>
        </div>

        <TabBar active="pieces" />
      </div>
    );
  }

  // Grouped catalog
  const grouped = CATEGORIES.map(cat => ({
    cat,
    items: pieces.filter(p => p.category === cat),
  }));

  return (
    <div style={{
      width: '100%', height: '100%', position: 'relative', overflow: 'hidden',
      background: bgColor(),
      fontFamily: 'DM Sans, -apple-system, system-ui, sans-serif',
      color: fgColor(),
    }}>
      <LiquidMesh seed={4} intensity={1} />
      <StatusBar />

      <div style={{
        position: 'relative', zIndex: 2,
        padding: 'calc(20px + var(--archive-safe-top, 54px)) 0 calc(120px + var(--archive-safe-bottom, 0px))',
        height: '100%', overflow: 'auto', boxSizing: 'border-box',
      }}>
        {/* Header */}
        <div style={{ padding: '0 24px', marginBottom: 22, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <ArchiveBurger />
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500, letterSpacing: 0.8 }}>
                {pieces.length} piece{pieces.length === 1 ? '' : 's'}
              </div>
            </div>
            <div className="h-display" style={{ fontSize: 48, color: 'var(--text-primary)', lineHeight: 1 }}>
              Your <em>pieces</em>
            </div>
          </div>
          <div
            onClick={() => setAdding(true)}
            className="archive-pressable lg-card"
            style={{
              marginTop: 28, padding: '8px 14px 8px 12px', borderRadius: 100,
              display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer',
            }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F5F0E8" strokeWidth="2" strokeLinecap="round">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            <span style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>Add</span>
          </div>
        </div>

        {/* ── Wardrobe completion ring (or target prompt the first time) ── */}
        {askTarget ? (
          <div style={{
            margin: '0 24px 24px', padding: '18px 18px 14px',
            borderRadius: 18,
            background: 'rgba(255,240,220,0.04)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,240,220,0.07)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.22)',
          }}>
            <div style={{
              fontSize: 9.5, color: 'var(--text-secondary)', letterSpacing: 1.5,
              fontWeight: 500, marginBottom: 8,
            }}>WARDROBE SETUP</div>
            <div style={{
              fontSize: 16, color: '#fff', fontWeight: 500, letterSpacing: -0.2,
              marginBottom: 12,
            }}>How many pieces do you own, roughly?</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {TARGET_OPTIONS.map(o => (
                <div key={o.value}
                  onClick={() => chooseTarget(o.value)}
                  className="archive-pressable lg-pill"
                  style={{
                    padding: '8px 14px', borderRadius: 100, cursor: 'pointer',
                    fontSize: 13, fontWeight: 500, color: '#fff', letterSpacing: -0.1,
                  }}>
                  {o.label}
                </div>
              ))}
            </div>
          </div>
        ) : target && (() => {
          // Big SVG ring
          const size = 140, stroke = 14;
          const r = (size - stroke) / 2;
          const c = 2 * Math.PI * r;
          const dash = Math.max(0, Math.min(1, completion.percent / 100)) * c;
          return (
            <div style={{
              margin: '0 24px 22px', padding: '20px 16px 16px',
              borderRadius: 20,
              background: 'rgba(255,240,220,0.04)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,240,220,0.07)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.22)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
            }}>
              <div style={{ position: 'relative', width: size, height: size }}>
                <svg width={size} height={size} style={{ display: 'block' }}>
                  <circle cx={size/2} cy={size/2} r={r}
                    stroke="rgba(255,255,255,0.10)" strokeWidth={stroke} fill="none" />
                  <circle cx={size/2} cy={size/2} r={r}
                    stroke={accent} strokeWidth={stroke} fill="none"
                    strokeLinecap="round"
                    strokeDasharray={`${dash} ${c}`}
                    transform={`rotate(-90 ${size/2} ${size/2})`}
                    style={{
                      filter: `drop-shadow(0 0 6px ${accent})`,
                      transition: 'stroke-dasharray .6s cubic-bezier(.34,1.56,.64,1)',
                    }}
                  />
                </svg>
                <div style={{
                  position: 'absolute', inset: 0,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                }}>
                  <div style={{
                    fontSize: 32, fontWeight: 700, color: '#fff',
                    letterSpacing: -1, lineHeight: 1,
                    fontFamily: '"DM Sans", sans-serif',
                  }}>{completion.percent}%</div>
                  <div style={{
                    fontSize: 10, color: 'rgba(255,255,255,0.55)',
                    letterSpacing: 2, fontWeight: 500, marginTop: 4,
                  }}>WARDROBE CATALOGED</div>
                </div>
              </div>
              <div style={{
                fontSize: 12, color: 'var(--text-secondary)',
              }}>
                {completion.count} of {completion.target} pieces
              </div>
            </div>
          );
        })()}

        {pieces.length === 0 ? (
          // Empty state
          <div style={{ padding: '40px 24px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 88, height: 88, borderRadius: 24,
              background: 'rgba(255, 240, 220, 0.04)',
              border: '1px dashed rgba(255, 240, 220, 0.18)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="rgba(245,240,232,0.4)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 7l4-3h8l4 3-3 4-2-1v11H7V10L5 11 4 7z"/>
              </svg>
            </div>
            <div className="h-display" style={{ fontSize: 28, color: 'var(--text-primary)', marginTop: 8 }}>
              Add your first <em>piece</em>
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', maxWidth: 260, lineHeight: 1.5 }}>
              Catalog garments to see them paired with your fits.
            </div>
            <button
              onClick={() => setAdding(true)}
              style={{
                marginTop: 10, border: 'none', cursor: 'pointer',
                padding: '11px 22px', borderRadius: 100,
                background: `linear-gradient(135deg, ${accent} 0%, ${accentHot} 100%)`,
                color: '#0a0a0a', fontSize: 14, fontWeight: 500,
                fontFamily: 'inherit',
              }}>
              + Add piece
            </button>
          </div>
        ) : (
          grouped.filter(g => g.items.length > 0).map(g => (
            <div key={g.cat} style={{ marginBottom: 28 }}>
              <div style={{ padding: '0 24px', marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CategoryIcon cat={g.cat} size={14} color={accent} />
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500, letterSpacing: 1.5 }}>
                    {g.cat.toUpperCase()}
                  </span>
                </div>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500, letterSpacing: 1 }}>
                  {String(g.items.length).padStart(2, '0')}
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, padding: '0 24px' }}>
                {g.items.map(p => (
                  <div key={p.id} style={{
                    position: 'relative', aspectRatio: '3/4', borderRadius: 14, overflow: 'hidden',
                    background: 'linear-gradient(180deg, #1c1a1a 0%, #100e0e 100%)',
                    boxShadow: 'inset 0 0 0 0.5px rgba(255,240,220,0.06), inset 0 -40px 60px rgba(0,0,0,0.35)',
                  }}>
                    {p.photo ? (
                      <img src={p.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    ) : (
                      <div style={{
                        position: 'absolute', inset: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <CategoryIcon cat={p.category} size={36} color="rgba(245,240,232,0.22)" />
                      </div>
                    )}
                    <div style={{
                      position: 'absolute', inset: 0,
                      background: 'linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.65) 100%)',
                      pointerEvents: 'none',
                    }} />
                    <div style={{
                      position: 'absolute', bottom: 10, left: 12, right: 12,
                    }}>
                      <div style={{
                        fontSize: 13, color: 'var(--text-primary)', fontWeight: 500,
                        letterSpacing: '-0.02em', lineHeight: 1.2,
                        textShadow: '0 1px 4px rgba(0,0,0,0.6)',
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      }}>{p.name}</div>
                      {p.color && (
                        <div style={{
                          fontSize: 10, color: 'var(--text-secondary)', marginTop: 2, letterSpacing: 0.4,
                          textTransform: 'uppercase',
                        }}>{p.color}</div>
                      )}
                    </div>
                    <div
                      onClick={() => removePiece(p.id)}
                      className="archive-pressable"
                      style={{
                        position: 'absolute', top: 8, right: 8,
                        width: 26, height: 26, borderRadius: 13,
                        background: 'rgba(10,8,6,0.5)', backdropFilter: 'blur(10px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                      }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="2" strokeLinecap="round">
                        <path d="M6 6l12 12M18 6L6 18"/>
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add piece sheet */}
      {adding && (
        <>
          <div onClick={resetForm} style={{
            position: 'absolute', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.55)',
          }} />
          <div className="lg-sheet" style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 51,
            padding: '20px 22px calc(24px + var(--archive-safe-bottom, 0px))',
            borderTopLeftRadius: 28, borderTopRightRadius: 28,
            animation: 'archive-slide-up .25s cubic-bezier(.2,.8,.2,1)',
            maxHeight: '88%', overflow: 'auto',
          }}>
            <div style={{ width: 38, height: 4, borderRadius: 2, background: 'rgba(245,240,232,0.2)', margin: '0 auto 16px' }} />
            <div className="h-display" style={{ fontSize: 24, color: 'var(--text-primary)', marginBottom: 18 }}>
              Add piece
            </div>

            {/* Photo */}
            <div style={{ marginBottom: 14 }}>
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
                  width: '100%', aspectRatio: '3/2', borderRadius: 14,
                  background: photo ? '#000' : 'rgba(255, 240, 220, 0.04)',
                  border: photo ? 'none' : '1px dashed rgba(255, 240, 220, 0.18)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', overflow: 'hidden',
                }}>
                {photo ? (
                  <img src={photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="rgba(245,240,232,0.5)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 7h3l2-2.5h8L18 7h3a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1z"/>
                      <circle cx="12" cy="13" r="3.5"/>
                    </svg>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)', letterSpacing: 0.4 }}>Tap to add photo</span>
                  </div>
                )}
              </div>
            </div>

            {/* Name */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: 1.2, marginBottom: 6, fontWeight: 500 }}>
                NAME
              </div>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Cream merino crew"
                style={{
                  width: '100%', padding: '12px 14px', borderRadius: 12,
                  background: 'rgba(255, 240, 220, 0.04)',
                  border: '1px solid rgba(255, 240, 220, 0.10)',
                  color: 'var(--text-primary)', fontSize: 14,
                  fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Color */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: 1.2, marginBottom: 6, fontWeight: 500 }}>
                COLOR
              </div>
              <input
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="e.g. Cream"
                style={{
                  width: '100%', padding: '12px 14px', borderRadius: 12,
                  background: 'rgba(255, 240, 220, 0.04)',
                  border: '1px solid rgba(255, 240, 220, 0.10)',
                  color: 'var(--text-primary)', fontSize: 14,
                  fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Category */}
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: 1.2, marginBottom: 8, fontWeight: 500 }}>
                CATEGORY
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                {CATEGORIES.map(c => {
                  const active = c === category;
                  return (
                    <div key={c} onClick={() => setCategory(c)} className="archive-pressable" style={{
                      cursor: 'pointer',
                      padding: '8px 14px', borderRadius: 100,
                      fontSize: 13, fontWeight: 500,
                      background: active ? `rgba(${accentRgba},0.18)` : 'rgba(255,255,255,0.04)',
                      color: active ? accent : 'rgba(255,255,255,0.7)',
                      boxShadow: active
                        ? `inset 0 0 0 0.5px rgba(${accentRgba},0.5)`
                        : 'inset 0 0 0 0.5px rgba(255,255,255,0.06)',
                    }}>{c}</div>
                  );
                })}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={resetForm} style={{
                flex: 1, border: '1px solid rgba(255,255,255,0.12)', cursor: 'pointer',
                padding: '13px 16px', borderRadius: 100,
                background: 'rgba(255,255,255,0.04)',
                color: 'var(--text-primary)', fontSize: 14, fontWeight: 500,
                fontFamily: 'inherit',
              }}>Cancel</button>
              <button onClick={savePiece} disabled={!name.trim()} style={{
                flex: 1, border: 'none', cursor: name.trim() ? 'pointer' : 'default',
                padding: '13px 16px', borderRadius: 100,
                background: name.trim() ? `linear-gradient(135deg, ${accent} 0%, ${accentHot} 100%)` : 'rgba(255,255,255,0.08)',
                color: name.trim() ? '#0a0a0a' : 'rgba(255,255,255,0.4)',
                fontSize: 14, fontWeight: 500, fontFamily: 'inherit',
              }}>Save piece</button>
            </div>
          </div>
        </>
      )}

      <TabBar active="pieces" />

      {toast && (
        <div style={{
          position: 'absolute', left: '50%', bottom: 'calc(100px + var(--archive-safe-bottom, 0px))',
          transform: 'translateX(-50%)',
          padding: '10px 18px', borderRadius: 999,
          background: `linear-gradient(135deg, rgba(${accentRgba},0.95), rgba(${accentRgba},0.75))`,
          color: '#0a0a0a', fontSize: 13, fontWeight: 600, letterSpacing: -0.1,
          boxShadow: `0 14px 40px -6px rgba(${accentRgba},0.7), 0 0 28px -4px rgba(${accentRgba},0.6)`,
          zIndex: 60,
          animation: 'archive-toast 3s ease forwards',
          pointerEvents: 'none',
        }}>{toast}</div>
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
