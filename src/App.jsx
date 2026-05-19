import React from 'react';
import { useTheme, THEMES } from './lib/shared.jsx';
import ScreenToday from './screens/Today.jsx';
import ScreenArchive from './screens/Archive.jsx';
import ScreenMix from './screens/Mix.jsx';
import ScreenYou from './screens/You.jsx';
import ScreenPaywall from './screens/Paywall.jsx';
import ScreenRating from './screens/Rating.jsx';
import ScreenDetail from './screens/Detail.jsx';
import ScreenCalendar from './screens/Calendar.jsx';
import ScreenShare from './screens/Share.jsx';
import ScreenStory from './screens/Story.jsx';
import ScreenSplash from './screens/Splash.jsx';
import ScreenOnboarding from './screens/Onboarding.jsx';
import ScreenAuth from './screens/Auth.jsx';
import ScreenSettings from './screens/Settings.jsx';
import ScreenStreak from './screens/Streak.jsx';
import ScreenPieces from './screens/Pieces.jsx';
import ScreenFitScore from './screens/FitScore.jsx';
import ScreenStyleDNA from './screens/StyleDNA.jsx';

const VALID_SCREENS = ['today','archive','mix','you','paywall','rating','detail','calendar','share','story','splash','onboarding','auth','settings','pieces','streak','fitscore','styledna'];

const ONBOARDED_KEY = 'aevum_onboarded';
function isOnboarded() {
  try { return !!localStorage.getItem(ONBOARDED_KEY); } catch (e) { return false; }
}
function markOnboarded() {
  try { localStorage.setItem(ONBOARDED_KEY, '1'); } catch (e) {}
}

function AppWordmark() {
  return <div className="archive-wordmark">AĒVUM</div>;
}

function FloatingNav({ current, go }) {
  const [open, setOpen] = React.useState(false);
  const [dragOffset, setDragOffset] = React.useState(0);
  const [isDragging, setIsDragging] = React.useState(false);
  const dragStartY = React.useRef(0);
  const tt = (window.THEMES && window.THEMES[window.__archiveTheme || 'dusk']) || THEMES[window.__archiveTheme || 'dusk'] || { light: '#9ec4d8', softRgba: '122,166,196', deep: '#1a2630', hot: '#7aa6c4' };
  const accent = tt.light;

  React.useEffect(() => {
    if (open) {
      const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
      document.addEventListener('keydown', onKey);
      return () => document.removeEventListener('keydown', onKey);
    }
  }, [open]);

  React.useEffect(() => {
    window.__archiveToggleNav = () => setOpen(o => !o);
    window.__archiveNavOpen = open;
  }, [open]);

  // Drag-to-dismiss: hold the bottom handle and drag UP to close. Drawer
  // follows the finger upward; release past 120px → close, otherwise snap back.
  const onHandleDown = (e) => {
    e.target.setPointerCapture(e.pointerId);
    dragStartY.current = e.clientY;
    setIsDragging(true);
  };
  const onHandleMove = (e) => {
    if (!isDragging) return;
    const delta = e.clientY - dragStartY.current;
    // Only allow upward drag (negative). Block downward motion past origin.
    setDragOffset(Math.min(0, delta));
  };
  const onHandleUp = (e) => {
    if (!isDragging) return;
    setIsDragging(false);
    if (dragOffset < -120) {
      setOpen(false);
    }
    setDragOffset(0);
  };

  return (
    <>
      <div
        onClick={() => setOpen(false)}
        style={{
          position: 'absolute', inset: 0, zIndex: 95,
          background: 'transparent',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transition: 'opacity .28s ease-out',
        }}
      />

      <div className="liquid-glass" style={{
        position: 'absolute',
        top: 0, left: 0, right: 0,
        height: '65%',
        zIndex: 100,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        padding: 'calc(24px + var(--archive-safe-top, 0px)) 26px 36px',
        boxSizing: 'border-box',
        transform: open
          ? `translateY(${dragOffset}px)`
          : 'translateY(-100%)',
        transition: isDragging
          ? 'none'
          : open
            ? 'transform .9s cubic-bezier(.16,1,.3,1)'
            : 'transform 1.2s cubic-bezier(.16,1,.3,1)',
        overflow: 'hidden',
      }}>
        <div style={{
          fontFamily: '"DM Sans", sans-serif',
          fontSize: 9, fontWeight: 500, letterSpacing: 2.5,
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          marginBottom: 12,
        }}>
          Navigate
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 16 }}>
          {[
            { id: 'today',    label: 'Today' },
            { id: 'archive',  label: 'Archive' },
            { id: 'mix',      label: 'Mix & Match' },
            { id: 'pieces',   label: 'Pieces' },
            { id: 'calendar', label: 'Calendar' },
            { id: 'streak',   label: 'Streak' },
            { id: 'you',      label: 'You' },
          ].map((it) => {
            const active = current === it.id;
            return (
              <div
                key={it.id}
                className="archive-pressable"
                onClick={() => { go(it.id); setOpen(false); }}
                style={{
                  fontFamily: '"DM Sans", -apple-system, system-ui, sans-serif',
                  fontSize: 22,
                  fontWeight: 700,
                  lineHeight: 1,
                  letterSpacing: -0.4,
                  color: active ? accent : 'rgba(255,255,255,0.95)',
                  cursor: 'pointer',
                }}>
                {it.label}
              </div>
            );
          })}
        </div>

        <div style={{
          height: 1,
          background: 'rgba(255,255,255,0.08)',
          marginBottom: 12,
        }} />

        <div style={{
          fontFamily: '"DM Sans", sans-serif',
          fontSize: 9, fontWeight: 500, letterSpacing: 2.5,
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          marginBottom: 10,
        }}>
          Account
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 14 }}>
          {[
            { id: 'paywall',  label: 'Go Pro', badge: true },
            { id: 'settings', label: 'Settings' },
            { id: 'rating',   label: 'Log fit' },
            { id: 'share',    label: 'Share' },
          ].map((it) => (
            <div
              key={it.id}
              className="archive-pressable"
              onClick={() => { go(it.id); setOpen(false); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                fontFamily: '"DM Sans", -apple-system, system-ui, sans-serif',
                fontSize: 15, fontWeight: 600,
                lineHeight: 1.1, letterSpacing: -0.2,
                color: 'var(--text-primary)',
                cursor: 'pointer',
              }}>
              {it.label}
              {it.badge && (
                <span style={{
                  fontFamily: '"DM Sans", sans-serif',
                  fontSize: 8, fontWeight: 500, letterSpacing: 1,
                  padding: '2px 6px', borderRadius: 3,
                  background: `linear-gradient(135deg, ${accent} 0%, ${tt.hot || accent} 100%)`,
                  color: '#0a0a0a',
                }}>PRO</span>
              )}
            </div>
          ))}
        </div>

        <div style={{
          fontFamily: '"DM Sans", sans-serif',
          fontSize: 9, color: 'var(--text-muted)',
          letterSpacing: 0.3, lineHeight: 1.5,
        }}>
          AĒVUM · Daily outfit tracker<br/>
          Version 0.1.0 · Edition Noire
        </div>

        {/* Drag handle — small iOS-style pill at bottom-center. Drag up to close;
            drag back down to cancel. */}
        <div
          onPointerDown={onHandleDown}
          onPointerMove={onHandleMove}
          onPointerUp={onHandleUp}
          onPointerCancel={onHandleUp}
          style={{
            position: 'absolute',
            bottom: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 80, height: 24,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'grab',
            touchAction: 'none',
            zIndex: 5,
          }}>
          <div style={{
            width: 40, height: 4, borderRadius: 2,
            background: 'rgba(255,255,255,0.45)',
          }} />
        </div>
      </div>
    </>
  );
}

export default function App() {
  const [screen, setScreen] = React.useState(() => {
    try {
      const h = (location.hash || '').replace(/^#/, '');
      if (VALID_SCREENS.includes(h)) return h;
      // Skip onboarding if URL has ?clean=1 (used by the secondary preview iPhone)
      const params = new URLSearchParams(location.search);
      if (params.get('clean') === '1') return 'today';
    } catch (e) {}
    // First-time user → splash → onboarding carousel → auth → paywall → today
    if (!isOnboarded()) return 'splash';
    return 'today';
  });
  const [, force] = React.useReducer(x => x + 1, 0);

  React.useEffect(() => {
    const h = () => {
      const clean = window.__archiveDynamicThemes === false;
      document.body.classList.toggle('archive-light', !!window.__archiveLight && !clean);
      document.body.classList.toggle('aevum-clean', clean);
      document.body.classList.toggle('aevum-clean-light', clean && !!window.__archiveLight);
      document.body.dataset.theme = clean
        ? (window.__archiveLight ? 'clean-light' : 'clean-dark')
        : (window.__archiveTheme || 'dusk');
      force();
    };
    window.addEventListener('archive:themechange', h);
    window.addEventListener('archive:lightchange', h);
    window.addEventListener('archive:cleanchange', h);
    h();
    return () => {
      window.removeEventListener('archive:themechange', h);
      window.removeEventListener('archive:lightchange', h);
      window.removeEventListener('archive:cleanchange', h);
    };
  }, []);

  // Toggle a body class while the Rating modal is open so the bottom nav can
  // CSS-fade out of the way (.nav-bar has the transition; see styles.css).
  React.useEffect(() => {
    document.body.classList.toggle('aevum-modal-open', screen === 'rating');
  }, [screen]);

  // Bump key for any screen that needs a fresh mount on each visit (e.g. the
  // Rating slide-up sheet relies on a clean state to animate up correctly).
  const [ratingVisit, setRatingVisit] = React.useState(0);
  // When the Rating modal is open, keep the previous screen visible behind it.
  const [modalBgScreen, setModalBgScreen] = React.useState(null);
  // One-shot flag — set by callers (e.g. the bottom nav bar) that want the
  // next navigation to skip the slide-in/out animation. Cleared after the
  // render commits.
  const noSlideOnceRef = React.useRef(false);
  // Push/pop transition state. `outgoing` keeps the prior screen rendered for
  // the duration of the slide so the user can see the destination underneath
  // (forward) or watch the current screen slide off-stage (back).
  const [outgoing, setOutgoing] = React.useState(null);
  const [direction, setDirection] = React.useState('forward'); // 'forward' | 'back'
  const transitionTimerRef = React.useRef(null);
  // Real navigation stack — robust back detection. Forward = push; visiting a
  // screen already in the stack = pop back to it. Tab switches (noSlide)
  // replace the top of the stack so cross-tab → drill-in → close still pops
  // back to the right tab.
  const navStackRef = React.useRef([screen]);

  const go = React.useCallback((id, opts) => {
    const noSlide = !!(opts && opts.noSlide);
    if (noSlide) noSlideOnceRef.current = true;

    const prev = (typeof window !== 'undefined') ? window.__archiveScreen : null;
    const stack = navStackRef.current;
    let dir = 'forward';
    const top = stack[stack.length - 1];
    if (id === top) {
      // re-navigating to current screen — no stack change
    } else if (noSlide) {
      // Tab-bar switch: replace top of stack instead of pushing
      stack[stack.length - 1] = id;
    } else if (stack.includes(id)) {
      // Back pop — pop every entry above the target
      while (stack[stack.length - 1] !== id) stack.pop();
      dir = 'back';
    } else {
      // Forward push
      stack.push(id);
    }

    if (prev && prev !== id && !noSlide) {
      setDirection(dir);
      setOutgoing(prev);
      clearTimeout(transitionTimerRef.current);
      transitionTimerRef.current = setTimeout(() => setOutgoing(null), 540);
    } else {
      // No animation — clear any in-flight outgoing immediately.
      setOutgoing(null);
      clearTimeout(transitionTimerRef.current);
    }

    if (id === 'rating') {
      setRatingVisit(v => v + 1);
      // Remember whatever screen we came from so it stays visible underneath
      setModalBgScreen(prev2 => prev2 || (typeof window !== 'undefined' ? (window.__archiveScreen || 'today') : 'today'));
    } else {
      setModalBgScreen(null);
    }
    setScreen(id);
    if (typeof window !== 'undefined') {
      // Track previous screen so close buttons can return where the user came from.
      // Don't overwrite when re-navigating to the same screen (avoids prev=self).
      if (window.__archiveScreen && window.__archiveScreen !== id) {
        window.__archivePrevScreen = window.__archiveScreen;
      }
      window.__archiveScreen = id;
      window.dispatchEvent(new CustomEvent('archive:navigate', { detail: id }));
    }
  }, []);
  React.useEffect(() => { window.__archiveGo = go; }, [go]);

  // Clear the one-shot no-slide flag after the screen change has rendered, so
  // the next navigation gets the slide unless it explicitly opts out again.
  React.useEffect(() => {
    noSlideOnceRef.current = false;
  }, [screen]);

  // Multi-step onboarding flow: splash → onboarding → auth → paywall → today (empty)
  const goOnboarding = React.useCallback(() => setScreen('onboarding'), []);
  const goAuth = React.useCallback(() => setScreen('auth'), []);
  const goPaywall = React.useCallback(() => setScreen('paywall'), []);
  const finishOnboarding = React.useCallback(() => {
    markOnboarded();
    // Show the first-install empty state on the Today screen for new users
    if (typeof window !== 'undefined') window.__archiveEmpty = true;
    setScreen('today');
  }, []);
  React.useEffect(() => { window.__archiveFinishOnboarding = finishOnboarding; }, [finishOnboarding]);

  const screens = {
    splash:     <ScreenSplash onContinue={goOnboarding} onSkip={finishOnboarding} />,
    onboarding: <ScreenOnboarding onComplete={goAuth} onSkip={finishOnboarding} />,
    auth:       <ScreenAuth onContinue={goPaywall} onBack={goOnboarding} onSkip={finishOnboarding} />,
    settings:   <ScreenSettings />,
    today:    <ScreenToday />,
    pieces:   <ScreenPieces />,
    streak:   <ScreenStreak />,
    fitscore: <ScreenFitScore />,
    styledna: <ScreenStyleDNA />,
    archive:  <ScreenArchive />,
    mix:      <ScreenMix />,
    you:      <ScreenYou />,
    paywall:  <ScreenPaywall />,
    rating:   <ScreenRating key={`rating-${ratingVisit}`} />,
    detail:   <ScreenDetail />,
    calendar: <ScreenCalendar />,
    share:    <ScreenShare />,
    story:    <ScreenStory />,
  };

  return (
    <>
      <div style={{ position: 'absolute', inset: 0 }}>
        {Object.keys(screens).map(id => {
          const isActive = screen === id;
          const isOutgoing = !isActive && outgoing === id;
          const isModalBg = screen === 'rating' && id === 'today';
          const visible = isActive || isOutgoing || isModalBg;
          // Screens with their own custom entrance/dismiss flow opt out of the
          // global push/pop animations. The bottom tab bar also sets
          // noSlideOnceRef so tab switches don't slide.
          const NO_SLIDE = new Set(['rating', 'story', 'splash', 'onboarding']);
          let slide = 'no';
          if (visible && !NO_SLIDE.has(id) && !noSlideOnceRef.current) {
            if (isActive && direction === 'forward')  slide = 'in-right';
            else if (isOutgoing && direction === 'back') slide = 'out-right';
          }
          return (
            <div key={id}
              data-slide={slide}
              className={'screen-wrap archive-screen' + (visible ? '' : ' hidden')}>
              {screens[id]}
            </div>
          );
        })}
      </div>
      <FloatingNav current={screen} go={go} />
    </>
  );
}
