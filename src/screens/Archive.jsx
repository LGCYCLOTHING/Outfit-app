import React from 'react';
import {
  useTheme, bgColor, fgColor,
  ArchiveBurger, StatusBar, TabBar, fitGradient,
} from '../lib/shared.jsx';
import LiquidMesh from '../lib/liquid-mesh.jsx';

// Sage green secondary accent — used for liked + active filter
const SAGE = '#9BB89F';
const SAGE_BG = 'rgba(122, 155, 126, 0.14)';
const SAGE_BORDER = 'rgba(122, 155, 126, 0.40)';
const SAGE_GLOW = 'rgba(122, 155, 126, 0.18)';
const SAGE_RGBA = '122, 155, 126';

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
      return n;
    });
  };

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

  // Collect all liked fits across months for the LIKED section
  const allFits = months.flatMap(m => m.fits);
  const likedFits = allFits.filter(f => favorited.has(f.id));

  return (
    <div style={{
      width: '100%', height: '100%', position: 'relative', overflow: 'hidden',
      background: bgColor(),
      fontFamily: 'DM Sans, -apple-system, system-ui, sans-serif',
      color: fgColor(),
    }}>
      <LiquidMesh seed={1} intensity={1} />
      <StatusBar />

      <div style={{ position: 'relative', zIndex: 2, padding: 'calc(20px + var(--archive-safe-top, 54px)) 0 calc(120px + var(--archive-safe-bottom, 0px))', height: '100%', overflow: 'auto', boxSizing: 'border-box' }}>
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

        {/* Header */}
        <div style={{ padding: '0 24px', marginBottom: 22, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <ArchiveBurger />
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500, letterSpacing: 0.8 }}>
                312 fits · 18 months
              </div>
            </div>
            <div className="h-display" style={{ fontSize: 48, color: 'var(--text-primary)', lineHeight: 1 }}>
              The <em>archive</em>
            </div>
          </div>
          <div className="lg-card" style={{
            display: 'flex', padding: 4, borderRadius: 12, gap: 2,
            marginTop: 28,
          }}>
            <div style={{
              width: 34, height: 30, borderRadius: 8,
              background: SAGE_BG,
              boxShadow: `inset 0 0 0 1px ${SAGE_BORDER}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={SAGE} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
              </svg>
            </div>
            <div onClick={() => window.__archiveGo && window.__archiveGo('calendar')} className="archive-pressable" style={{
              width: 34, height: 30, borderRadius: 8, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(245,240,232,0.55)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Search — clickable / focusable */}
        <div style={{ padding: '0 24px', marginBottom: 18 }}>
          <div onClick={() => searchInputRef.current?.focus()} className="lg-card" style={{
            borderRadius: 100, padding: '13px 18px', display: 'flex', alignItems: 'center', gap: 12,
            cursor: 'text',
            boxShadow: searchFocused
              ? `0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,240,220,0.08), inset 0 0 0 1px ${SAGE_BORDER}`
              : undefined,
          }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={searchFocused ? SAGE : 'rgba(245,240,232,0.55)'} strokeWidth="1.7" strokeLinecap="round">
              <circle cx="11" cy="11" r="7"/><path d="M21 21l-4-4"/>
            </svg>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search by piece, color, mood…"
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              style={{
                flex: 1, fontSize: 15, color: 'var(--text-primary)',
                background: 'transparent', border: 'none', outline: 'none',
                fontFamily: 'inherit',
              }}
            />
            <div onClick={cycleSort} className="archive-pressable" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(245,240,232,0.55)" strokeWidth="1.6" strokeLinecap="round">
                <line x1="4" y1="6" x2="11" y2="6"/><line x1="15" y1="6" x2="20" y2="6"/>
                <line x1="4" y1="12" x2="6" y2="12"/><line x1="10" y1="12" x2="20" y2="12"/>
                <line x1="4" y1="18" x2="13" y2="18"/><line x1="17" y1="18" x2="20" y2="18"/>
                <circle cx="13" cy="6" r="2"/><circle cx="8" cy="12" r="2"/><circle cx="15" cy="18" r="2"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Filter chips — functional */}
        <div className="chip-row" style={{ display: 'flex', gap: 8, padding: '0 24px 4px', overflowX: 'auto', marginBottom: 18 }}>
          <style>{`.chip-row::-webkit-scrollbar{display:none}`}</style>
          {tags.map((tag) => {
            const active = tag === activeTag;
            return (
              <div key={tag}
                onClick={() => setActiveTag(tag)}
                className={active ? '' : 'lg-pill archive-pressable'}
                style={{
                  padding: '10px 20px', borderRadius: 100, whiteSpace: 'nowrap',
                  fontSize: 14, fontWeight: 500, cursor: 'pointer',
                  background: active ? SAGE_BG : undefined,
                  border: active ? `1.5px solid ${SAGE_BORDER}` : undefined,
                  boxShadow: active ? `inset 0 1px 0 rgba(255,240,220,0.08)` : undefined,
                  color: active ? SAGE : 'rgba(245,240,232,0.6)',
                  transition: 'all .18s ease',
                }}>{tag}</div>
            );
          })}
        </div>

        {/* NEW Sort row */}
        <div style={{ padding: '0 24px', marginBottom: 22, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: 1.2, fontWeight: 500 }}>
            SORTED BY
          </div>
          <div onClick={cycleSort} className="lg-pill archive-pressable" style={{
            padding: '6px 12px 6px 14px', borderRadius: 100, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 8,
            fontSize: 12, color: 'var(--text-primary)', fontWeight: 500, letterSpacing: 0.3,
          }}>
            {sortMode}
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgba(245,240,232,0.55)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 9l6 6 6-6"/>
            </svg>
          </div>
        </div>

        {/* Featured Fit banner */}
        <div style={{ padding: '0 24px', marginBottom: 28 }}>
          <div className="lg-card archive-pressable" onClick={() => window.__archiveGo && window.__archiveGo('detail')} style={{
            borderRadius: 20, overflow: 'hidden', position: 'relative',
            minHeight: 200, cursor: 'pointer',
          }}>
            <div style={{ position: 'absolute', inset: 0, background: fitGradient(23), opacity: 0.65 }} />
            <div style={{ position: 'absolute', inset: 0,
              background: 'linear-gradient(90deg, rgba(20,18,16,0.85) 0%, rgba(20,18,16,0.3) 55%, transparent 100%)' }} />
            <div style={{
              position: 'absolute', inset: 0,
              backgroundImage: 'url("data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22120%22 height=%22120%22><filter id=%22n%22><feTurbulence baseFrequency=%220.9%22 numOctaves=%222%22 stitchTiles=%22stitch%22/><feColorMatrix values=%220 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.45 0%22/></filter><rect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/></svg>")',
              opacity: 0.3, mixBlendMode: 'overlay', pointerEvents: 'none',
            }} />

            <div style={{ position: 'relative', padding: '22px 22px 20px', zIndex: 1 }}>
              <div style={{ fontSize: 10, letterSpacing: 1.6, color: 'var(--text-muted)', fontWeight: 500, marginBottom: 14 }}>
                FEATURED FIT
              </div>
              <div className="h-display" style={{ fontSize: 30, color: 'var(--text-primary)', lineHeight: 1, marginBottom: 10 }}>
                Soft Structure
              </div>
              <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.4, maxWidth: 200, marginBottom: 28 }}>
                Layered neutrals with<br/>textured contrast.
              </div>
              <div style={{ fontSize: 10, letterSpacing: 1.4, color: 'var(--text-muted)', fontWeight: 500 }}>
                APR 26, 2026
              </div>
            </div>

            <div className="liquid-glass archive-pressable" onClick={(e) => { e.stopPropagation(); toggleFav(23); }} style={{
              position: 'absolute', top: 16, right: 16,
              width: 38, height: 38, borderRadius: 19,
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            }}>
              <HeartIcon size={16} color={favorited.has(23) ? SAGE : '#F5F0E8'} filled={favorited.has(23)} />
            </div>

            <div className="liquid-glass archive-pressable" onClick={(e) => { e.stopPropagation(); window.__archiveGo && window.__archiveGo('detail'); }} style={{
              position: 'absolute', bottom: 16, right: 16,
              width: 44, height: 38, borderRadius: 19,
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            }}>
              <svg width="18" height="14" viewBox="0 0 24 24" fill="none" stroke="#F5F0E8" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M13 6l6 6-6 6"/>
              </svg>
            </div>
          </div>
        </div>

        {/* NEW Liked section — appears when there are favorites */}
        {likedFits.length > 0 && (
          <div style={{ marginBottom: 32 }}>
            <div style={{ padding: '0 24px', marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <HeartIcon size={12} color={SAGE} filled />
                <span style={{ fontSize: 11, color: SAGE, fontWeight: 500, letterSpacing: 1.5 }}>
                  LIKED
                </span>
              </div>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500, letterSpacing: 1 }}>
                {String(likedFits.length).padStart(2, '0')}
              </span>
            </div>
            <div className="chip-row" style={{
              padding: '0 24px 4px', display: 'flex', gap: 10, overflowX: 'auto',
            }}>
              {likedFits.map(f => (
                <div key={f.id} onClick={() => window.__archiveGo && window.__archiveGo('detail')} style={{
                  flex: '0 0 auto', width: 110, aspectRatio: '3/4',
                  borderRadius: 12, overflow: 'hidden', position: 'relative',
                  background: fitGradient(f.id), cursor: 'pointer',
                  boxShadow: 'inset 0 0 0 0.5px rgba(255,240,220,0.08), inset 0 -30px 50px rgba(0,0,0,0.4)',
                }}>
                  <div style={{
                    position: 'absolute', top: 6, right: 6,
                    width: 22, height: 22, borderRadius: 11,
                    background: SAGE_BG, boxShadow: `inset 0 0 0 1px ${SAGE_BORDER}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <HeartIcon size={10} color={SAGE} filled />
                  </div>
                  <div style={{
                    position: 'absolute', bottom: 8, left: 10,
                    fontSize: 10, color: 'var(--text-primary)', letterSpacing: 0.8, fontWeight: 500,
                  }}>
                    #{f.n}
                  </div>
                </div>
              ))}
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
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500, letterSpacing: 1.5 }}>
                {m.label}
              </span>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500, letterSpacing: 1 }}>
                {m.count}
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, padding: '0 24px' }}>
              {m.fits.map(f => {
                const isFav = favorited.has(f.id);
                return (
                  <div key={f.id} onClick={() => window.__archiveGo && window.__archiveGo('detail')} style={{
                    position: 'relative', aspectRatio: '4/3', borderRadius: 14, overflow: 'hidden',
                    background: fitGradient(f.id), cursor: 'pointer',
                    boxShadow: 'inset 0 0 0 0.5px rgba(255,240,220,0.06), inset 0 -40px 60px rgba(0,0,0,0.35)',
                  }}>
                    <div style={{
                      position: 'absolute', inset: 0,
                      backgroundImage: 'url("data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22120%22 height=%22120%22><filter id=%22n%22><feTurbulence baseFrequency=%220.9%22 numOctaves=%222%22 stitchTiles=%22stitch%22/><feColorMatrix values=%220 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.5 0%22/></filter><rect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/></svg>")',
                      opacity: 0.3, mixBlendMode: 'overlay', pointerEvents: 'none',
                    }} />

                    <div style={{ position: 'absolute', top: 12, left: 14, fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>
                      #{f.n}
                    </div>

                    <div className="liquid-glass archive-pressable" onClick={(e) => { e.stopPropagation(); toggleFav(f.id); }} style={{
                      position: 'absolute', top: 8, right: 8,
                      width: 32, height: 32, borderRadius: 16,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                    }}>
                      <HeartIcon size={13} color={isFav ? SAGE : '#F5F0E8'} filled={isFav} />
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
