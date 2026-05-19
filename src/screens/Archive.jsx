import React from 'react';
import {
  useTheme, bgColor, fgColor,
  ArchiveBurger, StatusBar, TabBar, fitGradient, fitBorder, getSavedFitPhoto, getSavedFitPhotos,
} from '../lib/shared.jsx';
import LiquidMesh from '../lib/liquid-mesh.jsx';

// Pink secondary accent — used for liked + active filter
const SAGE = '#F08AB0';
const SAGE_BG = 'rgba(240, 138, 176, 0.16)';
const SAGE_BORDER = 'rgba(240, 138, 176, 0.45)';
const SAGE_GLOW = 'rgba(240, 138, 176, 0.22)';
const SAGE_RGBA = '240, 138, 176';

function HeartIcon({ size = 14, color = '#F5F0E8', filled = false }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? color : 'none'} stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  );
}

function DotsMenu({ color = 'rgba(245,240,232,0.55)' }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill={color}>
      <circle cx="5" cy="12" r="1.6"/>
      <circle cx="12" cy="12" r="1.6"/>
      <circle cx="19" cy="12" r="1.6"/>
    </svg>
  );
}

const SORT_MODES = ['Latest', 'Oldest', 'Most worn', 'Liked first'];

function readLikedFits() {
  try { return new Set(JSON.parse(localStorage.getItem('aevum_liked_fits') || '[]')); }
  catch (e) { return new Set(); }
}
function writeLikedFits(set) {
  try { localStorage.setItem('aevum_liked_fits', JSON.stringify(Array.from(set))); } catch (e) {}
}

export default function ScreenArchive() {
  const t = useTheme();

  const [activeTag, setActiveTag] = React.useState('All');
  const [favorited, setFavorited] = React.useState(() => {
    const stored = readLikedFits();
    if (stored.size === 0) {
      const seed = new Set([23, 21]);
      writeLikedFits(seed);
      return seed;
    }
    return stored;
  });
  const [sortMode, setSortMode] = React.useState('Latest');
  const [searchFocused, setSearchFocused] = React.useState(false);
  const [menuFor, setMenuFor] = React.useState(null);
  const searchInputRef = React.useRef(null);

  const toggleFav = (id) => {
    setFavorited(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      writeLikedFits(n);
      try { window.dispatchEvent(new CustomEvent('archive:likeschanged')); } catch (e) {}
      return n;
    });
  };

  // Stay in sync when Today (or any other screen) flips a like.
  React.useEffect(() => {
    const refresh = () => setFavorited(readLikedFits());
    window.addEventListener('archive:likeschanged', refresh);
    return () => window.removeEventListener('archive:likeschanged', refresh);
  }, []);

  const cycleSort = () => {
    const i = SORT_MODES.indexOf(sortMode);
    setSortMode(SORT_MODES[(i + 1) % SORT_MODES.length]);
  };

  // Each fit now carries a category + sortable timestamp + wear count
  const months = [
    { label: 'APRIL / 2026', count: '06', fits: [
      { id: 24, n: '024', d: 'APR 26', ts: 20260426, worn: 1, cat: 'Knit' },
      { id: 23, n: '023', d: 'APR 25', ts: 20260425, worn: 3, cat: 'Suede' },
      { id: 22, n: '022', d: 'APR 23', ts: 20260423, worn: 2, cat: 'Outerwear' },
      { id: 21, n: '021', d: 'APR 21', ts: 20260421, worn: 4, cat: 'Denim' },
      { id: 20, n: '020', d: 'APR 19', ts: 20260419, worn: 1, cat: 'Vintage' },
      { id: 19, n: '019', d: 'APR 17', ts: 20260417, worn: 2, cat: 'Knit' },
    ]},
    { label: 'MARCH / 2026', count: '09', fits: [
      { id: 18, n: '018', d: 'MAR 30', ts: 20260330, worn: 5, cat: 'Outerwear' },
      { id: 17, n: '017', d: 'MAR 28', ts: 20260328, worn: 2, cat: 'Suede' },
      { id: 16, n: '016', d: 'MAR 24', ts: 20260324, worn: 1, cat: 'Denim' },
      { id: 15, n: '015', d: 'MAR 19', ts: 20260319, worn: 3, cat: 'Knit' },
      { id: 14, n: '014', d: 'MAR 14', ts: 20260314, worn: 6, cat: 'Vintage' },
      { id: 13, n: '013', d: 'MAR 11', ts: 20260311, worn: 2, cat: 'Outerwear' },
      { id: 12, n: '012', d: 'MAR 07', ts: 20260307, worn: 1, cat: 'Denim' },
      { id: 11, n: '011', d: 'MAR 02', ts: 20260302, worn: 4, cat: 'Suede' },
      { id: 10, n: '010', d: 'MAR 01', ts: 20260301, worn: 2, cat: 'Knit' },
    ]},
  ];

  const tags = ['All', 'Knit', 'Outerwear', 'Suede', 'Vintage', 'Denim'];

  // Apply filter + sort to each month's fits before render
  const sortFits = (fits) => {
    const arr = [...fits];
    if (sortMode === 'Latest') arr.sort((a, b) => b.ts - a.ts);
    else if (sortMode === 'Oldest') arr.sort((a, b) => a.ts - b.ts);
    else if (sortMode === 'Most worn') arr.sort((a, b) => b.worn - a.worn);
    else if (sortMode === 'Liked first') arr.sort((a, b) => {
      const af = favorited.has(a.id) ? 1 : 0;
      const bf = favorited.has(b.id) ? 1 : 0;
      if (af !== bf) return bf - af;
      return b.ts - a.ts;
    });
    return arr;
  };
  const filteredMonths = months.map(m => {
    const filtered = m.fits.filter(f => activeTag === 'All' || f.cat === activeTag);
    return { ...m, fits: sortFits(filtered), count: String(filtered.length).padStart(2, '0') };
  }).filter(m => m.fits.length > 0);

  // Liked set is a mix of:
  //   - numeric archive ids (legacy demo fits)
  //   - "YYYY-MM-DD" — legacy day-level like (photo idx 0)
  //   - "YYYY-MM-DD#N" — composite per-photo like (photo idx N)
  // Daily entries render with the user's actual saved photo for that slot.
  const parseLiked = (v) => {
    if (typeof v === 'number') return { kind: 'archive', id: v };
    if (typeof v === 'string') {
      if (v.includes('#')) {
        const [d, i] = v.split('#');
        if (/^\d{4}-\d{2}-\d{2}$/.test(d)) {
          return { kind: 'daily', dateKey: d, photoIdx: parseInt(i, 10) || 0, raw: v };
        }
      } else if (/^\d{4}-\d{2}-\d{2}$/.test(v)) {
        return { kind: 'daily', dateKey: v, photoIdx: 0, raw: v };
      }
    }
    return null;
  };
  const allFits = months.flatMap(m => m.fits);
  const likedArchiveFits = allFits.filter(f => favorited.has(f.id));
  const likedDailyFits = Array.from(favorited)
    .map(parseLiked)
    .filter(p => p && p.kind === 'daily')
    .sort((a, b) => (b.dateKey === a.dateKey ? b.photoIdx - a.photoIdx : b.dateKey.localeCompare(a.dateKey)))
    .map(({ dateKey, photoIdx, raw }) => {
      const photos = getSavedFitPhotos(dateKey);
      const photo = photos[photoIdx] || null;
      // Skip if the user deleted the underlying photo
      if (!photo && photos.length === 0) return null;
      const d = new Date(dateKey);
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      return {
        isDaily: true,
        id: raw,
        dateStr: dateKey,
        photoIdx,
        photo,
        n: `${mm}/${dd}`,
      };
    })
    .filter(Boolean);
  const likedFits = [...likedDailyFits, ...likedArchiveFits];

  return (
    <div style={{
      width: '100%', height: '100%', position: 'relative', overflow: 'hidden',
      background: bgColor(),
      fontFamily: 'DM Sans, -apple-system, system-ui, sans-serif',
      color: fgColor(),
    }}>
      <LiquidMesh seed={1} intensity={1} />
      <StatusBar />

      <div style={{ position: 'absolute', zIndex: 2, top: 'var(--archive-safe-top, 54px)', left: 0, right: 0, bottom: 0, padding: '0 0 calc(120px + var(--archive-safe-bottom, 0px))', overflow: 'auto', boxSizing: 'border-box' }}>
        {(typeof window !== 'undefined' && window.__archiveEmpty) ? (
          <div style={{ padding: '0 24px', display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 30 }}>
              <ArchiveBurger />
              <div style={{ fontSize: 15, color: 'var(--text-muted)', fontWeight: 400 }}>0 fits</div>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, marginTop: -40 }}>
              <div className="h-display" style={{ fontSize: 44, color: 'var(--text-primary)' }}>The <em>archive</em></div>
              <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>312 fits start with 1.</div>
              <button onClick={() => window.__archiveGo && window.__archiveGo('rating')} className="liquid-glass" style={{
                marginTop: 12, padding: '11px 22px', borderRadius: 100,
                color: 'var(--text-primary)', fontFamily: 'inherit', fontSize: 14, fontWeight: 500, cursor: 'pointer',
              }}>+ Log fit</button>
            </div>
          </div>
        ) : (
        <React.Fragment>

        {/* ─── Modern header — magazine-style stat hero ─── */}
        <div style={{ padding: '0 24px', marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <ArchiveBurger />
              <div style={{ fontSize: 11, color: '#fff', fontWeight: 600, letterSpacing: 2.2 }}>
                ARCHIVE
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div onClick={() => {}} className="archive-pressable" style={{
                width: 42, height: 42, borderRadius: 12,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: SAGE_BG, boxShadow: `inset 0 0 0 1px ${SAGE_BORDER}`,
                cursor: 'pointer',
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={SAGE} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>
                </svg>
              </div>
              <div onClick={() => window.__archiveGo && window.__archiveGo('calendar')} className="archive-pressable" style={{
                width: 42, height: 42, borderRadius: 12,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(255,255,255,0.05)',
                boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.10)',
                cursor: 'pointer',
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Big stat block — replaces "The archive" headline */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, marginBottom: 6 }}>
            <div style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: 80, fontWeight: 300, lineHeight: 0.9,
              letterSpacing: -2.5, color: '#fff',
            }}>312</div>
            <div style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: 32, fontWeight: 300, fontStyle: 'italic',
              color: 'rgba(255,255,255,0.5)', lineHeight: 1, marginBottom: 8,
            }}>fits</div>
          </div>
          <div style={{ height: 22 }} />

          {/* Search — pill with embedded sort selector on the right */}
          <div onClick={() => searchInputRef.current?.focus()}
            className="lg-card"
            style={{
              borderRadius: 100, padding: '6px 6px 6px 18px',
              display: 'flex', alignItems: 'center', gap: 10,
              cursor: 'text',
              boxShadow: searchFocused
                ? `0 4px 24px rgba(0,0,0,0.4), inset 0 0 0 1px ${SAGE_BORDER}`
                : undefined,
            }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={searchFocused ? SAGE : 'rgba(255,255,255,0.55)'} strokeWidth="1.8" strokeLinecap="round">
              <circle cx="11" cy="11" r="7"/><path d="M21 21l-4-4"/>
            </svg>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search by piece, color, mood…"
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              style={{
                flex: 1, fontSize: 14, color: '#fff',
                background: 'transparent', border: 'none', outline: 'none',
                fontFamily: 'inherit', padding: '8px 0',
              }}
            />
            <div onClick={(e) => { e.stopPropagation(); cycleSort(); }}
              className="archive-pressable"
              title={sortMode}
              style={{
                width: 34, height: 34, borderRadius: 17,
                background: 'rgba(255,255,255,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', flexShrink: 0,
              }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h13M3 12h9M3 18h5"/><path d="M17 9l4-4-4-4M21 5h-9"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Filter labels — fits all on one row (no overflow), evenly spaced */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '0 24px 6px',
          marginBottom: 24, marginTop: 18,
        }}>
          {tags.map((tag) => {
            const active = tag === activeTag;
            return (
              <div key={tag}
                onClick={() => setActiveTag(tag)}
                className="archive-pressable"
                style={{
                  position: 'relative',
                  padding: '6px 0', whiteSpace: 'nowrap',
                  fontSize: 13, fontWeight: active ? 600 : 400,
                  cursor: 'pointer',
                  color: '#fff',
                  opacity: active ? 1 : 0.55,
                  letterSpacing: -0.1,
                  transition: 'opacity .18s ease, font-weight .18s ease',
                }}>
                {tag}
                {active && (
                  <div style={{
                    position: 'absolute', bottom: 0, left: -4, right: -4,
                    height: 2, borderRadius: 2,
                    background: SAGE,
                  }} />
                )}
              </div>
            );
          })}
        </div>

        {/* Featured Fit banner — same color-gradient treatment as the grid cards */}
        <div style={{ padding: '0 24px', marginBottom: 28 }}>
          <div onClick={() => window.__archiveGo && window.__archiveGo('detail')}
            style={{
              position: 'relative', borderRadius: 22, padding: 6,
              background: '#0a0a0a', cursor: 'pointer',
            }}>
            <div className="archive-pressable lg-border-gradient"
              style={{
                position: 'relative', borderRadius: 17, overflow: 'hidden',
                minHeight: 200,
                background: fitBorder(23),
                '--grad-border': fitBorder(23),
                boxShadow: 'inset 0 -50px 80px rgba(0,0,0,0.55), inset 0 30px 60px rgba(0,0,0,0.30)',
              }}>
              {/* Left-side darken so the title reads */}
              <div style={{ position: 'absolute', inset: 0,
                background: 'linear-gradient(90deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.2) 55%, transparent 100%)',
                pointerEvents: 'none',
              }} />
              <div style={{
                position: 'absolute', inset: 0,
                backgroundImage: 'url("data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22120%22 height=%22120%22><filter id=%22n%22><feTurbulence baseFrequency=%220.9%22 numOctaves=%222%22 stitchTiles=%22stitch%22/><feColorMatrix values=%220 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.45 0%22/></filter><rect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/></svg>")',
                opacity: 0.3, mixBlendMode: 'overlay', pointerEvents: 'none',
              }} />

              <div style={{ position: 'relative', padding: '22px 22px 20px', zIndex: 1 }}>
                <div style={{ fontSize: 10, letterSpacing: 1.6, color: '#fff', fontWeight: 500, marginBottom: 14 }}>
                  FEATURED FIT
                </div>
                <div className="h-display" style={{ fontSize: 30, color: 'var(--text-primary)', lineHeight: 1, marginBottom: 10 }}>
                  Soft Structure
                </div>
                <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.4, maxWidth: 200, marginBottom: 28 }}>
                  Layered neutrals with<br/>textured contrast.
                </div>
                <div style={{ fontSize: 10, letterSpacing: 1.4, color: '#fff', fontWeight: 500 }}>
                  APR 26, 2026
                </div>
              </div>

              {/* Heart — top-right, no circle */}
              <div className="archive-pressable" onClick={(e) => { e.stopPropagation(); toggleFav(23); }} style={{
                position: 'absolute', top: 16, right: 16,
                width: 38, height: 38,
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.5))',
              }}>
                <HeartIcon size={22} color={favorited.has(23) ? SAGE : '#fff'} filled={favorited.has(23)} />
              </div>

              {/* Arrow — bottom-right, no circle, plain glyph */}
              <div className="archive-pressable" onClick={(e) => { e.stopPropagation(); window.__archiveGo && window.__archiveGo('detail'); }} style={{
                position: 'absolute', bottom: 14, right: 16,
                width: 38, height: 38,
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.5))',
              }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M13 6l6 6-6 6"/>
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* NEW Liked section — appears when there are favorites */}
        {likedFits.length > 0 && (
          <div style={{ marginBottom: 32 }}>
            <div style={{ padding: '0 24px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
              <HeartIcon size={12} color={SAGE} filled />
              <span style={{ fontSize: 11, color: SAGE, fontWeight: 500, letterSpacing: 1.5 }}>
                LIKED
              </span>
              <span style={{ fontSize: 11, color: '#fff', fontWeight: 500, letterSpacing: 1 }}>
                · {String(likedFits.length).padStart(2, '0')}
              </span>
            </div>
            <div className="chip-row" style={{
              padding: '0 24px 4px', display: 'flex', gap: 10, overflowX: 'auto',
            }}>
              {likedFits.map(f => {
                const photo = f.isDaily ? f.photo : null;
                const seed = typeof f.id === 'number' ? f.id : 7;
                return (
                  <div key={String(f.id)} onClick={(e) => {
                    e.stopPropagation();
                    if (f.isDaily) window.__archiveGo && window.__archiveGo('today');
                    else window.__archiveGo && window.__archiveGo('detail');
                  }}
                    style={{
                      flex: '0 0 auto', width: 110, aspectRatio: '3/4',
                      borderRadius: 14, padding: 5,
                      background: '#0a0a0a', cursor: 'pointer',
                    }}>
                  <div className="lg-border-gradient" style={{
                    position: 'relative', width: '100%', height: '100%',
                    borderRadius: 9, overflow: 'hidden',
                    background: photo ? '#000' : fitBorder(seed),
                    boxShadow: photo ? 'none' : 'inset 0 -40px 60px rgba(0,0,0,0.5), inset 0 20px 40px rgba(0,0,0,0.30)',
                    '--grad-border': fitBorder(seed),
                  }}>
                    {photo && (
                      <img src={photo} alt="" style={{
                        position: 'absolute', inset: 0,
                        width: '100%', height: '100%',
                        objectFit: 'cover', display: 'block',
                      }} />
                    )}
                    <div onClick={(e) => { e.stopPropagation(); toggleFav(f.id); }}
                      className="archive-pressable"
                      style={{
                        position: 'absolute', top: 6, right: 6,
                        width: 22, height: 22,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer',
                      }}>
                      <HeartIcon size={14} color={SAGE} filled />
                    </div>
                    <div style={{
                      position: 'absolute', bottom: 8, left: 10,
                      fontSize: 10, color: '#fff', letterSpacing: 0.8, fontWeight: 500,
                      textShadow: '0 1px 3px rgba(0,0,0,0.6)',
                    }}>
                      {f.isDaily ? f.n : `#${f.n}`}
                    </div>
                  </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty filter state */}
        {filteredMonths.length === 0 && (
          <div style={{ padding: '40px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', letterSpacing: 0.4 }}>
              No fits match "{activeTag}". Try a different filter.
            </div>
          </div>
        )}

        {/* Months */}
        {filteredMonths.map((m) => (
          <div key={m.label} style={{ marginBottom: 32 }}>
            <div style={{
              padding: '0 24px', marginBottom: 14,
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <span style={{ fontSize: 11, color: '#fff', fontWeight: 500, letterSpacing: 1.5 }}>
                {m.label}
              </span>
              <span style={{ fontSize: 11, color: '#fff', fontWeight: 500, letterSpacing: 1 }}>
                · {m.count}
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, padding: '0 24px' }}>
              {m.fits.map(f => {
                const isFav = favorited.has(f.id);
                return (
                  <div key={f.id} onClick={() => window.__archiveGo && window.__archiveGo('detail')}
                    style={{
                      position: 'relative', aspectRatio: '4/3', borderRadius: 16,
                      padding: 6, background: '#0a0a0a', cursor: 'pointer',
                    }}>
                  <div className="lg-border-gradient" style={{
                    position: 'relative', width: '100%', height: '100%',
                    borderRadius: 11, overflow: 'hidden',
                    background: fitBorder(f.id),
                    boxShadow: 'inset 0 -50px 70px rgba(0,0,0,0.55), inset 0 30px 60px rgba(0,0,0,0.30)',
                    '--grad-border': fitBorder(f.id),
                  }}>
                    <div style={{
                      position: 'absolute', inset: 0,
                      backgroundImage: 'url("data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22120%22 height=%22120%22><filter id=%22n%22><feTurbulence baseFrequency=%220.9%22 numOctaves=%222%22 stitchTiles=%22stitch%22/><feColorMatrix values=%220 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.5 0%22/></filter><rect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/></svg>")',
                      opacity: 0.3, mixBlendMode: 'overlay', pointerEvents: 'none',
                    }} />

                    <div style={{ position: 'absolute', top: 12, left: 14, fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>
                      #{f.n}
                    </div>

                    <div className="archive-pressable" onClick={(e) => { e.stopPropagation(); toggleFav(f.id); }} style={{
                      position: 'absolute', top: 8, right: 8,
                      width: 32, height: 32,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                    }}>
                      <HeartIcon size={17} color={isFav ? SAGE : '#F5F0E8'} filled={isFav} />
                    </div>

                    <div style={{
                      position: 'absolute', bottom: 12, left: 14,
                      fontSize: 11, color: 'var(--text-primary)', letterSpacing: 1, fontWeight: 500,
                    }}>
                      {f.d}
                    </div>

                    <div onClick={(e) => { e.stopPropagation(); setMenuFor(menuFor === f.id ? null : f.id); }} className="archive-pressable" style={{
                      position: 'absolute', bottom: 8, right: 10,
                      width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                    }}>
                      <DotsMenu color="rgba(245,240,232,0.75)" />
                    </div>
                  </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        </React.Fragment>
        )}
      </div>

      {/* Card action menu sheet — opens when ··· is tapped */}
      {menuFor !== null && (
        <>
          <div onClick={() => setMenuFor(null)} style={{
            position: 'absolute', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.4)',
          }} />
          <div className="lg-sheet lg-spotlight" style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 51,
            padding: 'calc(28px + 0px) 24px calc(28px + var(--archive-safe-bottom, 0px))',
            borderTopLeftRadius: 28, borderTopRightRadius: 28,
            animation: 'archive-slide-up .25s cubic-bezier(.2,.8,.2,1)',
            overflow: 'hidden',
          }}>
            <div style={{ width: 38, height: 4, borderRadius: 2, background: 'rgba(245,240,232,0.2)', margin: '0 auto 18px' }} />
            <div style={{ fontSize: 10, letterSpacing: 1.5, color: 'var(--text-muted)', fontWeight: 500, marginBottom: 4 }}>
              FIT #{String(menuFor).padStart(3, '0')}
            </div>
            <div className="h-display" style={{ fontSize: 22, color: 'var(--text-primary)', marginBottom: 18 }}>
              Quick actions
            </div>
            {[
              { label: favorited.has(menuFor) ? 'Remove from liked' : 'Add to liked', action: () => { toggleFav(menuFor); setMenuFor(null); } },
              { label: 'Open fit', action: () => { setMenuFor(null); window.__archiveGo && window.__archiveGo('detail'); } },
              { label: 'Share', action: () => { setMenuFor(null); window.__archiveGo && window.__archiveGo('share'); } },
              { label: 'Cancel', action: () => setMenuFor(null), muted: true },
            ].map((row, i) => (
              <div key={i} onClick={row.action} className="archive-pressable" style={{
                padding: '14px 4px', borderTop: '0.5px solid rgba(245,240,232,0.08)',
                fontSize: 16, fontWeight: 500, cursor: 'pointer',
                color: row.muted ? 'rgba(245,240,232,0.5)' : '#F5F0E8',
              }}>
                {row.label}
              </div>
            ))}
          </div>
        </>
      )}

      <TabBar active="archive" />
    </div>
  );
}
