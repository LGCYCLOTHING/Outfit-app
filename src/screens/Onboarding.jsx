import React from 'react';

const SLIDES = [
  {
    eyebrow: 'TRACK',
    title: 'Every fit,\nremembered',
    body: 'Log outfits with a tap.\nOne photo a day.',
    bg: 'linear-gradient(180deg, #1a2032 0%, #0f1420 50%, #050810 100%)',
    accent: '#8BA7B8',
    glow: 'rgba(139, 167, 184, 0.30)',
  },
  {
    eyebrow: 'DISCOVER',
    title: 'AI Mix &\nMatch',
    body: 'Smart combinations\nfrom your own closet.',
    bg: 'linear-gradient(180deg, #1a2818 0%, #0f1a0e 50%, #050a05 100%)',
    accent: '#9BB89F',
    glow: 'rgba(155, 184, 159, 0.30)',
  },
  {
    eyebrow: 'INSIGHTS',
    title: 'Style insights\nat a glance',
    body: 'Wardrobe pulse, color trends,\ndaily prompts.',
    bg: 'linear-gradient(180deg, #1f1828 0%, #14101e 50%, #08060e 100%)',
    accent: '#C8B6FF',
    glow: 'rgba(200, 182, 255, 0.30)',
  },
];

export default function ScreenOnboarding({ onComplete }) {
  const [idx, setIdx] = React.useState(0);
  const scrollRef = React.useRef(null);

  const isLast = idx === SLIDES.length - 1;

  const goNext = () => {
    if (isLast) {
      onComplete();
      return;
    }
    const el = scrollRef.current;
    if (el) {
      el.scrollTo({ left: (idx + 1) * el.clientWidth, behavior: 'smooth' });
    } else {
      setIdx(idx + 1);
    }
  };

  const onScroll = (e) => {
    const w = e.currentTarget.clientWidth;
    if (!w) return;
    const newIdx = Math.round(e.currentTarget.scrollLeft / w);
    if (newIdx !== idx && newIdx >= 0 && newIdx < SLIDES.length) setIdx(newIdx);
  };

  const current = SLIDES[idx];

  return (
    <div style={{
      width: '100%', height: '100%', position: 'relative', overflow: 'hidden',
      background: '#050507',
      fontFamily: 'Inter, -apple-system, system-ui, sans-serif',
    }}>
      {/* Swipeable slides */}
      <div
        ref={scrollRef}
        onScroll={onScroll}
        style={{
          position: 'absolute', inset: 0,
          display: 'flex',
          overflowX: 'auto', overflowY: 'hidden',
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
        }}
      >
        <style>{`.onb-scroll::-webkit-scrollbar{display:none}`}</style>
        {SLIDES.map((s, i) => (
          <div key={i} className="onb-scroll" style={{
            flex: '0 0 100%', height: '100%', position: 'relative',
            scrollSnapAlign: 'start',
            background: s.bg,
          }}>
            {/* Top atmospheric glow */}
            <div style={{
              position: 'absolute', top: '-15%', left: '50%', transform: 'translateX(-50%)',
              width: '110%', height: '60%',
              background: `radial-gradient(ellipse at center, ${s.glow} 0%, transparent 70%)`,
              filter: 'blur(50px)',
              pointerEvents: 'none',
            }} />

            {/* Film grain */}
            <div style={{
              position: 'absolute', inset: 0,
              backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.6 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")`,
              backgroundSize: '220px 220px',
              opacity: 0.06,
              mixBlendMode: 'overlay',
            }} />

            {/* Bottom dark anchor for content legibility */}
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0, height: '45%',
              background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 100%)',
              pointerEvents: 'none',
            }} />

            {/* Content — bottom-left aligned per Saudi reference */}
            <div style={{
              position: 'absolute', inset: 0,
              padding: 'calc(60px + var(--archive-safe-top, 54px)) 30px calc(220px + var(--archive-safe-bottom, 0px))',
              display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
              pointerEvents: 'none',
            }}>
              <div style={{
                fontSize: 11, letterSpacing: 2.4, color: s.accent,
                fontWeight: 500, marginBottom: 14,
              }}>
                {s.eyebrow}
              </div>
              <div style={{
                fontFamily: '"Inter", sans-serif',
                fontSize: 44, fontWeight: 700, color: '#F5F0E8',
                lineHeight: 1.02, letterSpacing: '-0.04em',
                whiteSpace: 'pre-line', marginBottom: 18,
              }}>
                {s.title}
              </div>
              <div style={{
                fontSize: 15, color: 'rgba(245,240,232,0.72)',
                lineHeight: 1.5, letterSpacing: '-0.01em',
                whiteSpace: 'pre-line', maxWidth: 320,
              }}>
                {s.body}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Skip — top right */}
      <div
        onClick={onComplete}
        className="archive-pressable"
        style={{
          position: 'absolute',
          top: 'calc(22px + var(--archive-safe-top, 54px))',
          right: 26,
          fontSize: 13, color: 'rgba(245,240,232,0.65)', fontWeight: 500,
          cursor: 'pointer', zIndex: 10, padding: '6px 4px',
        }}
      >
        Skip
      </div>

      {/* Page dots — animated active */}
      <div style={{
        position: 'absolute',
        bottom: 'calc(118px + var(--archive-safe-bottom, 0px))',
        left: 0, right: 0,
        display: 'flex', justifyContent: 'center', gap: 8,
        zIndex: 10, pointerEvents: 'none',
      }}>
        {SLIDES.map((_, i) => (
          <div key={i} style={{
            width: i === idx ? 26 : 6,
            height: 6, borderRadius: 3,
            background: i === idx ? '#F5F0E8' : 'rgba(245,240,232,0.28)',
            transition: 'width .3s ease, background .3s ease',
          }} />
        ))}
      </div>

      {/* Get Started button */}
      <button
        onClick={goNext}
        className="archive-pressable"
        style={{
          position: 'absolute',
          bottom: 'calc(54px + var(--archive-safe-bottom, 0px))',
          left: 24, right: 24,
          height: 54, borderRadius: 27,
          background: '#F5F0E8', color: '#0a0a0a',
          fontSize: 15, fontWeight: 600,
          letterSpacing: '-0.01em',
          border: 'none', cursor: 'pointer',
          fontFamily: 'inherit',
          boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
          zIndex: 10,
        }}
      >
        {isLast ? 'Get Started' : 'Continue'}
      </button>

      {/* Terms footer */}
      <div style={{
        position: 'absolute',
        bottom: 'calc(20px + var(--archive-safe-bottom, 0px))',
        left: 0, right: 0,
        textAlign: 'center',
        fontSize: 11, color: 'rgba(245,240,232,0.45)',
        letterSpacing: '-0.01em',
        zIndex: 10, pointerEvents: 'none',
      }}>
        By continuing, you agree to <span style={{ textDecoration: 'underline' }}>Terms</span> & <span style={{ textDecoration: 'underline' }}>Conditions</span>
      </div>
    </div>
  );
}
