import React from 'react';

const SLIDES = [
  {
    eyebrow: 'TRACK',
    title: 'Every fit,\nremembered',
    body: 'Log outfits with a single tap.\nOne photo a day builds your archive.',
    points: ['Auto-saves date, mood + weather', 'Streaks reward consistency', 'Private by default'],
    bg: '/backgrounds/bg-dusk.png',
  },
  {
    eyebrow: 'DISCOVER',
    title: 'AI Mix\n& Match',
    body: 'Smart combinations pulled\nfrom your own closet.',
    points: ['Suggests fits from your pieces', 'Matches weather + occasion', 'Learns your taste over time'],
    bg: '/backgrounds/bg-forest.png',
  },
  {
    eyebrow: 'INSIGHTS',
    title: 'Style insights\nat a glance',
    body: 'Wardrobe pulse, color trends,\nand daily prompts.',
    points: ['Most-worn pieces + colors', 'Cost-per-wear tracking', 'Monthly style summary'],
    bg: '/backgrounds/bg-ember.png',
  },
];

export default function ScreenOnboarding({ onComplete, onSkip }) {
  const [idx, setIdx] = React.useState(0);
  const scrollRef = React.useRef(null);

  const isLast = idx === SLIDES.length - 1;

  const goNext = () => {
    if (isLast) { onComplete(); return; }
    const el = scrollRef.current;
    if (el) el.scrollTo({ left: (idx + 1) * el.clientWidth, behavior: 'smooth' });
    else setIdx(idx + 1);
  };

  const onScroll = (e) => {
    const w = e.currentTarget.clientWidth;
    if (!w) return;
    const newIdx = Math.round(e.currentTarget.scrollLeft / w);
    if (newIdx !== idx && newIdx >= 0 && newIdx < SLIDES.length) setIdx(newIdx);
  };

  return (
    <div style={{
      width: '100%', height: '100%', position: 'relative', overflow: 'hidden',
      background: '#050507',
      fontFamily: 'Inter, -apple-system, system-ui, sans-serif',
    }}>
      <div
        ref={scrollRef}
        onScroll={onScroll}
        className="onb-scroll"
        style={{
          position: 'absolute', inset: 0,
          display: 'flex',
          overflowX: 'auto', overflowY: 'hidden',
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
        }}>
        <style>{`.onb-scroll::-webkit-scrollbar{display:none}`}</style>
        {SLIDES.map((s, i) => (
          <div key={i} style={{
            flex: '0 0 100%', height: '100%', position: 'relative',
            scrollSnapAlign: 'start',
            backgroundImage: `url('${s.bg}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}>
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.15) 35%, rgba(0,0,0,0.75) 100%)',
              pointerEvents: 'none',
            }} />

            {/* Content */}
            <div style={{
              position: 'absolute', inset: 0,
              padding: 'calc(80px + var(--archive-safe-top, 54px)) 28px calc(240px + var(--archive-safe-bottom, 0px))',
              display: 'flex', flexDirection: 'column', justifyContent: 'flex-start',
            }}>
              <div style={{
                fontSize: 10, letterSpacing: '0.35em', color: 'rgba(255,255,255,0.8)',
                fontWeight: 500, marginBottom: 16, textTransform: 'uppercase',
                textShadow: '0 1px 6px rgba(0,0,0,0.5)',
              }}>
                {s.eyebrow}
              </div>
              <div style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 46, fontWeight: 800, color: '#fff',
                lineHeight: 0.98, letterSpacing: '-0.045em',
                whiteSpace: 'pre-line', marginBottom: 16,
                textShadow: '0 2px 14px rgba(0,0,0,0.5)',
              }}>
                {s.title}
              </div>
              <div style={{
                fontSize: 15, color: 'rgba(255,255,255,0.85)',
                lineHeight: 1.5, letterSpacing: '-0.01em',
                whiteSpace: 'pre-line', maxWidth: 320, marginBottom: 22,
                textShadow: '0 1px 6px rgba(0,0,0,0.4)',
              }}>
                {s.body}
              </div>

              {/* Points list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {s.points.map((p, j) => (
                  <div key={j} className="lg-card" style={{
                    padding: '10px 14px', borderRadius: 12,
                    display: 'flex', alignItems: 'center', gap: 10,
                  }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                      <path d="M5 12l5 5L20 7"/>
                    </svg>
                    <span style={{ fontSize: 12.5, color: '#fff', fontWeight: 500 }}>{p}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Skip → dashboard */}
      <div
        onClick={onSkip}
        className="archive-pressable"
        style={{
          position: 'absolute',
          top: 'calc(20px + var(--archive-safe-top, 54px))',
          right: 22,
          padding: '7px 14px', borderRadius: 100,
          fontSize: 12, fontWeight: 500, color: '#fff',
          background: 'rgba(0,0,0,0.35)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.15)',
          cursor: 'pointer', zIndex: 10,
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
        Skip
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14M13 6l6 6-6 6"/>
        </svg>
      </div>

      {/* Page dots */}
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
            boxShadow: '0 1px 4px rgba(0,0,0,0.4)',
          }} />
        ))}
      </div>

      {/* Continue / Get Started */}
      <button
        onClick={goNext}
        className="archive-pressable"
        style={{
          position: 'absolute',
          bottom: 'calc(54px + var(--archive-safe-bottom, 0px))',
          left: 22, right: 22,
          height: 54, borderRadius: 27,
          background: '#F5F0E8', color: '#0a0a0a',
          fontSize: 15, fontWeight: 600,
          letterSpacing: '-0.01em',
          border: 'none', cursor: 'pointer',
          fontFamily: 'inherit',
          boxShadow: '0 12px 30px rgba(0,0,0,0.5)',
          zIndex: 10,
        }}>
        {isLast ? 'Get Started' : 'Continue'}
      </button>

      {/* Terms */}
      <div style={{
        position: 'absolute',
        bottom: 'calc(22px + var(--archive-safe-bottom, 0px))',
        left: 0, right: 0,
        textAlign: 'center',
        fontSize: 11, color: 'rgba(255,255,255,0.55)',
        letterSpacing: '-0.01em',
        zIndex: 10, pointerEvents: 'none',
        textShadow: '0 1px 4px rgba(0,0,0,0.4)',
      }}>
        By continuing, you agree to <span style={{ textDecoration: 'underline' }}>Terms</span> & <span style={{ textDecoration: 'underline' }}>Conditions</span>
      </div>
    </div>
  );
}
