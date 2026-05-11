import React from 'react';

export const ARCHIVE_BG = '#06040F';
export const ARCHIVE_BG_LIGHT = '#f5f0e8';
export const ARCHIVE_AMBER = '#f4a851';
export const ARCHIVE_AMBER_HOT = '#ff8a3d';
export const ARCHIVE_AMBER_DEEP = '#b85a1a';

export function useLight() {
  return typeof window !== 'undefined' && !!window.__archiveLight;
}
export function bgColor() {
  return useLight() ? ARCHIVE_BG_LIGHT : ARCHIVE_BG;
}
export function fgColor() {
  return useLight() ? '#1a1612' : '#fff';
}

export const THEMES = {
  ivory:  { id:'ivory',  name:'Ivory',  sub:'warm cream',     light:'#f5e6c8', hot:'#e8cd95', deep:'#a48a5a', softRgba:'232,205,149', darkBg:'/themes/bg-2.png' },
  slate:  { id:'slate',  name:'Slate',  sub:'cool blue-grey', light:'#9ec4d8', hot:'#7aa6c4', deep:'#3d5d75', softRgba:'122,166,196', darkBg:'/themes/bg-1.png' },
  forest: { id:'forest', name:'Forest', sub:'deep olive',     light:'#9bbf7a', hot:'#6e9a4d', deep:'#3a5826', softRgba:'110,154,77',  darkBg:'/themes/bg-3.png' },
  smoke:  { id:'smoke',  name:'Smoke',  sub:'silver chrome',  light:'#d8d8dc', hot:'#a8aab2', deep:'#5e6068', softRgba:'168,170,178', darkBg:'/themes/bg-4.png' },
  dusk:   { id:'dusk',   name:'Dusk',   sub:'purple aura',    light:'#7C5CDB', hot:'#5B35C4', deep:'#3D1FA8', softRgba:'124,92,219',  darkBg:'/themes/bg-5.png' },
  ember:  { id:'ember',  name:'Ember',  sub:'warm amber',     light:'#ffd28a', hot:'#ff8a3d', deep:'#b85a1a', softRgba:'255,138,61',  darkBg:'/themes/bg-6.png' },
};
export const DEFAULT_THEME = 'dusk';

export function useTheme() {
  return THEMES[(typeof window !== 'undefined' && window.__archiveTheme) || DEFAULT_THEME];
}

const FIT_PALETTES = [
  'radial-gradient(120% 80% at 30% 20%, #d8b48a 0%, #8a6238 35%, #2a1a10 75%, #0c0807 100%)',
  'radial-gradient(110% 90% at 70% 30%, #5c4836 0%, #2e2218 45%, #100b08 80%)',
  'radial-gradient(130% 90% at 40% 70%, #c0683a 0%, #6b3216 40%, #1c0d07 80%)',
  'radial-gradient(110% 80% at 60% 25%, #aaa599 0%, #4f4940 45%, #15110d 85%)',
  'radial-gradient(130% 100% at 80% 80%, #b9722e 0%, #3a1d0c 30%, #0a0605 70%)',
  'radial-gradient(120% 90% at 30% 30%, #e9d4a8 0%, #8d6f44 40%, #261a0e 85%)',
  'radial-gradient(110% 90% at 50% 40%, #8a8050 0%, #3e3820 50%, #100c08 85%)',
  'radial-gradient(120% 90% at 60% 60%, #a8462a 0%, #5b1f12 45%, #1b0805 80%)',
  'radial-gradient(120% 90% at 40% 30%, #6a6c84 0%, #2c2a3a 45%, #0d0c14 80%)',
  'radial-gradient(110% 90% at 50% 50%, #d6995c 0%, #7a4422 40%, #1f100a 80%)',
  'radial-gradient(120% 90% at 70% 30%, #6e4a30 0%, #2b1a10 45%, #0a0604 80%)',
  'radial-gradient(110% 80% at 40% 30%, #b88a78 0%, #5a352a 45%, #170a08 80%)',
];

export function fitGradient(id) {
  const n = typeof id === 'number' ? id : (String(id).split('').reduce((a, c) => a + c.charCodeAt(0), 0));
  return FIT_PALETTES[n % FIT_PALETTES.length];
}

const STOCK_PHOTOS = [
  'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=600&q=80',
  'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=600&q=80',
  'https://images.unsplash.com/photo-1520975954732-35dd22299614?w=600&q=80',
  'https://images.unsplash.com/photo-1488161628813-04466f872be2?w=600&q=80',
  'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=600&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80',
  'https://images.unsplash.com/photo-1492447166138-50c3889fccb1?w=600&q=80',
  'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80',
  'https://images.unsplash.com/photo-1542327897-d73f4005b533?w=600&q=80',
  'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=600&q=80',
  'https://images.unsplash.com/photo-1531891437562-4301cf35b7e4?w=600&q=80',
  'https://images.unsplash.com/photo-1543132220-3ec99c6094dc?w=600&q=80',
  'https://images.unsplash.com/photo-1578932750294-f5075e85f44a?w=600&q=80',
  'https://images.unsplash.com/photo-1495105787522-5334e3ffa0ef?w=600&q=80',
  'https://images.unsplash.com/photo-1593032465175-481ac7f401a0?w=600&q=80',
  'https://images.unsplash.com/photo-1516826957135-700dedea698c?w=600&q=80',
];
export function stockPhoto(id) {
  const n = typeof id === 'number' ? id : (String(id).split('').reduce((a, c) => a + c.charCodeAt(0), 0));
  return STOCK_PHOTOS[Math.abs(n) % STOCK_PHOTOS.length];
}

export function FitPhoto({ id = 1, label, date, ratio = '3/4', radius = 18, showNumber = true, placeholder = false, onAdd, style = {} }) {
  if (placeholder) {
    return <PhotoPlaceholder ratio={ratio} radius={radius} onAdd={onAdd} style={style} />;
  }
  return (
    <div style={{
      position: 'relative', width: '100%', aspectRatio: ratio,
      borderRadius: radius, overflow: 'hidden',
      background: fitGradient(id),
      boxShadow: 'inset 0 0 0 0.5px rgba(255,255,255,0.06), inset 0 -40px 60px rgba(0,0,0,0.35)',
      ...style,
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'url("data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22120%22 height=%22120%22><filter id=%22n%22><feTurbulence baseFrequency=%220.9%22 numOctaves=%222%22 stitchTiles=%22stitch%22/><feColorMatrix values=%220 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.5 0%22/></filter><rect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22 opacity=%220.5%22/></svg>")',
        mixBlendMode: 'overlay', opacity: 0.35, pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(60% 40% at 50% 0%, rgba(255,210,160,0.12) 0%, transparent 60%)',
        pointerEvents: 'none',
      }} />
      {showNumber && (
        <div style={{
          position: 'absolute', top: 10, left: 12, display: 'flex', flexDirection: 'column', gap: 1,
          fontFamily: '"DM Sans", sans-serif',
          fontSize: 9.5, color: 'rgba(255,255,255,0.92)', letterSpacing: -0.40,
          textShadow: '0 1px 2px rgba(0,0,0,0.6)',
        }}>
          <span>FIT</span>
          <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12, letterSpacing: -0.30 }}>
            #{String(id).padStart(3, '0')}
          </span>
        </div>
      )}
      {date && (
        <div style={{
          position: 'absolute', bottom: 8, left: 12,
          fontFamily: '"DM Sans", sans-serif',
          fontSize: 9, color: 'rgba(255,255,255,0.7)', letterSpacing: -0.20,
          textShadow: '0 1px 2px rgba(0,0,0,0.6)',
        }}>{date}</div>
      )}
      {label && (
        <div style={{
          position: 'absolute', bottom: 10, right: 12,
          fontFamily: 'DM Sans, system-ui, sans-serif',
          fontSize: 12, color: 'rgba(255,255,255,0.85)', fontWeight: 500,
          textShadow: '0 1px 2px rgba(0,0,0,0.7)',
        }}>{label}</div>
      )}
    </div>
  );
}

export function GlowCard({ children, glow = 'br', accent, radius = 28, style = {}, intensity = 1, theme, active = false }) {
  const t = theme || useTheme();
  const acc = accent || t.hot;
  const positions = {
    br: '85% 90%', bl: '15% 90%', tr: '85% 10%', tl: '15% 10%', center: '50% 50%',
  };
  if (active) {
    return (
      <div style={{
        position: 'relative', borderRadius: radius, overflow: 'hidden',
        background: `linear-gradient(135deg, ${t.hot} 0%, ${t.deep} 100%)`,
        boxShadow: `0 0 0 1px rgba(${t.softRgba},0.30), 0 8px 32px rgba(${t.softRgba},0.40), 0 30px 60px -20px rgba(0,0,0,0.6)`,
        ...style,
      }}>
        <div style={{
          position: 'absolute', inset: 0, borderRadius: radius,
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.18), inset 0 0 60px rgba(0,0,0,0.20)',
          pointerEvents: 'none',
        }} />
        <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
      </div>
    );
  }
  return (
    <div className="lg-card" style={{
      position: 'relative', borderRadius: radius, overflow: 'hidden',
      ...style,
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(80% 60% at ${positions[glow]}, ${acc} 0%, rgba(${t.softRgba},0.4) 25%, rgba(${t.softRgba},0.12) 45%, transparent 70%)`,
        opacity: intensity * 0.7, mixBlendMode: 'screen',
      }} />
      <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
    </div>
  );
}

export function ArchiveBurger() {
  return (
    <div
      className="archive-pressable"
      onClick={() => typeof window !== 'undefined' && window.__archiveToggleNav && window.__archiveToggleNav()}
      style={{
        width: 28, height: 22,
        display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 5,
        cursor: 'pointer',
        flexShrink: 0,
      }}>
      <div style={{ width: 20, height: 2, borderRadius: 1, background: '#FFFFFF' }} />
      <div style={{ width: 20, height: 2, borderRadius: 1, background: '#FFFFFF' }} />
      <div style={{ width: 20, height: 2, borderRadius: 1, background: '#FFFFFF' }} />
    </div>
  );
}

export function PhotoPlaceholder({ ratio = '3/4', radius = 18, onAdd, photoId, empty = false, style = {} }) {
  const pid = photoId != null ? photoId : Math.floor(Math.random() * STOCK_PHOTOS.length);
  if (typeof window !== 'undefined' && window.__archiveEmpty) {
    return (
      <div style={{
        position: 'relative', width: '100%', aspectRatio: ratio,
        borderRadius: 12, overflow: 'hidden',
        background: 'rgba(255,255,255,0.04)',
        border: '1px dashed rgba(255,255,255,0.08)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        ...style,
      }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
          stroke="rgba(255,255,255,0.15)" strokeWidth="1.4"
          strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 7h3l2-2.5h8L18 7h3a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1z"/>
          <circle cx="12" cy="13" r="3.5"/>
        </svg>
      </div>
    );
  }
  if (empty) {
    return (
      <div onClick={onAdd} style={{
        position: 'relative', width: '100%', aspectRatio: ratio,
        borderRadius: radius, overflow: 'hidden',
        background: 'linear-gradient(160deg, #18181c 0%, #0e0e10 100%)',
        boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: 10,
        cursor: onAdd ? 'pointer' : 'default',
        ...style,
      }}>
        <div style={{
          position: 'relative',
          width: 44, height: 38, borderRadius: 8,
          boxShadow: 'inset 0 0 0 1.5px rgba(255,255,255,0.35)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            width: 18, height: 18, borderRadius: 9,
            boxShadow: 'inset 0 0 0 1.5px rgba(255,255,255,0.35)',
          }} />
          <div style={{
            position: 'absolute', top: -4, left: 12,
            width: 12, height: 4, borderRadius: 2,
            background: 'rgba(255,255,255,0.35)',
          }} />
          <div style={{
            position: 'absolute', bottom: -6, right: -6,
            width: 18, height: 18, borderRadius: 9,
            background: '#fff', color: '#0a0a0a',
            fontSize: 16, fontWeight: 500, lineHeight: 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>+</div>
        </div>
        <div style={{
          fontSize: 13, color: 'rgba(255,255,255,0.92)',
          fontFamily: '"DM Sans", sans-serif', letterSpacing: -0.35,
        }}>ADD PHOTO</div>
      </div>
    );
  }
  return (
    <div style={{
      position: 'relative', width: '100%', aspectRatio: ratio,
      borderRadius: radius, overflow: 'hidden',
      background: '#1a1a1e',
      boxShadow: 'inset 0 0 0 0.5px rgba(255,255,255,0.06)',
      ...style,
    }}>
      <img
        src={stockPhoto(pid)}
        loading="lazy"
        style={{
          width: '100%', height: '100%', objectFit: 'cover',
          display: 'block',
        }}
        alt=""
      />
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, rgba(0,0,0,0) 60%, rgba(0,0,0,0.35) 100%)',
        pointerEvents: 'none',
      }} />
    </div>
  );
}

export function Glass({ children, radius = 20, dark = true, style = {}, glow = false, variant = 'normal' }) {
  const v = variant;
  const cls = v === 'thick' ? 'lg-sheet' : (v === 'thin' || v === 'ultra-thin' ? 'lg-chip' : 'lg-card');
  return (
    <div className={cls} style={{
      position: 'relative', borderRadius: radius, overflow: 'hidden',
      ...style,
    }}>{children}</div>
  );
}

export function liquidGlassProps({ light = false, intensity = 1 } = {}) {
  return light ? {
    background: 'rgba(255,255,255,0.55)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    border: '1px solid rgba(0,0,0,0.06)',
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6), 0 8px 32px rgba(0,0,0,0.06)',
  } : {
    background: `rgba(255,255,255,${0.04 * intensity})`,
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    border: '1px solid rgba(255,255,255,0.07)',
    boxShadow: `inset 0 1px 0 rgba(255,255,255,${0.08 * intensity})`,
  };
}

export function LiquidGlassButton({ children, accent, accentRgba, onClick, style = {}, primary = false }) {
  return (
    <button
      onClick={onClick}
      className={`archive-pressable ${primary ? 'lg-btn-primary' : 'lg-card'}`}
      style={{
        position: 'relative',
        cursor: 'pointer',
        color: '#FFFFFF',
        fontFamily: 'DM Sans, -apple-system, system-ui, sans-serif',
        fontWeight: 500, letterSpacing: -0.1,
        padding: '13px 24px',
        borderRadius: 14,
        overflow: 'hidden',
        ...style,
      }}>
      <span style={{ position: 'relative', zIndex: 1 }}>{children}</span>
    </button>
  );
}

// Luxury tab bar — final iteration from ARCHIVE-mobile.html (hairline icons + always-visible uppercase labels)
export function TabBar({ active = 'today', theme }) {
  const t = theme || useTheme();
  const items = [
    { id: 'today', label: 'Today', icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="4.25"/>
        <circle cx="12" cy="12" r="1.1" fill="currentColor" stroke="none"/>
        <path d="M12 2.4v2.2 M12 19.4v2.2 M2.4 12h2.2 M19.4 12h2.2"/>
        <path d="M5.2 5.2l1.55 1.55 M17.25 17.25l1.55 1.55 M5.2 18.8l1.55-1.55 M17.25 6.75l1.55-1.55" opacity="0.55"/>
      </svg>
    )},
    { id: 'archive', label: 'Archive', icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 7.5a2 2 0 1 1 1.6-3.2"/>
        <path d="M12 7.5v1.6"/>
        <path d="M12 9.1L3.6 14.4a0.6 0.6 0 0 0 0.32 1.1h16.16a0.6 0.6 0 0 0 0.32-1.1L12 9.1z"/>
        <circle cx="12" cy="9.1" r="0.55" fill="currentColor" stroke="none"/>
      </svg>
    )},
    { id: 'mix', label: 'Mix', icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="8.5" cy="12" r="5.25"/>
        <circle cx="15.5" cy="12" r="5.25"/>
        <circle cx="12" cy="12" r="0.9" fill="currentColor" stroke="none"/>
      </svg>
    )},
    { id: 'you', label: 'You', icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="12" cy="7.6" rx="3.1" ry="3.6"/>
        <path d="M6 21c0.6-4.6 3.1-7.4 6-7.4s5.4 2.8 6 7.4"/>
        <path d="M9.4 13.9c0.7 1 1.6 1.5 2.6 1.5s1.9-0.5 2.6-1.5" opacity="0.55"/>
      </svg>
    )},
  ];
  return (
    <div style={{
      position: 'absolute', bottom: 'max(16px, var(--archive-safe-bottom, 16px))', left: 0, right: 0, zIndex: 30,
      display: 'flex', justifyContent: 'center', pointerEvents: 'none',
    }}>
      <div className="nav-bar" style={{
        pointerEvents: 'auto',
        width: '82%',
        padding: '8px 24px',
        borderRadius: 32,
        display: 'flex', alignItems: 'center', justifyContent: 'space-around',
      }}>
        {items.map(it => {
          const isActive = it.id === active;
          return (
            <div key={it.id} onClick={() => typeof window !== 'undefined' && window.__archiveGo && window.__archiveGo(it.id)} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
              color: '#FFFFFF',
              opacity: isActive ? 1 : 0.55,
              padding: '2px 8px',
              transition: 'opacity .2s', cursor: 'pointer', userSelect: 'none',
            }}>
              <div>{it.icon}</div>
              <div style={{
                fontFamily: '"DM Sans", sans-serif',
                fontSize: 9, fontWeight: isActive ? 700 : 500, letterSpacing: 0.5, textTransform: 'uppercase',
                color: '#FFFFFF', opacity: isActive ? 1 : 0.7, lineHeight: 1,
              }}>{it.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function StatusBar() {
  return null;
}
