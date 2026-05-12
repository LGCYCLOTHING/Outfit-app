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

const VALID_SCREENS = ['today','archive','mix','you','paywall','rating','detail','calendar','share','story','splash','onboarding','auth','settings','pieces','streak'];

const ONBOARDED_KEY = 'archive_onboarded';
function isOnboarded() {
  try { return !!localStorage.getItem(ONBOARDED_KEY); } catch (e) { return false; }
}
function markOnboarded() {
  try { localStorage.setItem(ONBOARDED_KEY, '1'); } catch (e) {}
}

function AppWordmark() {
  return <div className="archive-wordmark">ARCHIVE</div>;
}

function FloatingNav({ current, go }) {
  const [open, setOpen] = React.useState(false);
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
        padding: 'calc(40px + var(--archive-safe-top, 0px)) 26px calc(20px + var(--archive-safe-bottom, 0px))',
        boxSizing: 'border-box',
        transform: open ? 'translateY(0)' : 'translateY(-100%)',
        transition: 'transform .45s cubic-bezier(.16,1,.3,1)',
        overflow: 'hidden',
      }}>
        <div
          className="archive-pressable"
          onClick={() => setOpen(false)}
          style={{
            position: 'absolute',
            top: 'calc(16px + var(--archive-safe-top, 0px))',
            right: 22,
            width: 26, height: 26,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
          }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="1" strokeLinecap="round">
            <path d="M5 5l14 14M19 5L5 19"/>
          </svg>
        </div>

        <div style={{
          fontFamily: '"DM Sans", sans-serif',
          fontSize: 9, fontWeight: 500, letterSpacing: 2.5,
          color: 'rgba(255,255,255,0.45)',
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
          color: 'rgba(255,255,255,0.45)',
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
                color: 'rgba(255,255,255,0.85)',
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
          fontSize: 9, color: 'rgba(255,255,255,0.4)',
          letterSpacing: 0.3, lineHeight: 1.5,
        }}>
          ARCHIVE · Daily outfit tracker<br/>
          Version 0.1.0 · Edition Noire
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
      document.body.classList.toggle('archive-light', !!window.__archiveLight);
      force();
    };
    window.addEventListener('archive:themechange', h);
    window.addEventListener('archive:lightchange', h);
    document.body.classList.toggle('archive-light', !!window.__archiveLight);
    return () => {
      window.removeEventListener('archive:themechange', h);
      window.removeEventListener('archive:lightchange', h);
    };
  }, []);

  const go = React.useCallback((id) => setScreen(id), []);
  React.useEffect(() => { window.__archiveGo = go; }, [go]);

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
    splash:     <ScreenSplash onContinue={goOnboarding} />,
    onboarding: <ScreenOnboarding onComplete={goAuth} />,
    auth:       <ScreenAuth onContinue={goPaywall} onBack={goOnboarding} />,
    settings:   <ScreenSettings />,
    today:    <ScreenToday />,
    pieces:   <ScreenPieces />,
    streak:   <ScreenStreak />,
    archive:  <ScreenArchive />,
    mix:      <ScreenMix />,
    you:      <ScreenYou />,
    paywall:  <ScreenPaywall />,
    rating:   <ScreenRating />,
    detail:   <ScreenDetail />,
    calendar: <ScreenCalendar />,
    share:    <ScreenShare />,
    story:    <ScreenStory />,
  };

  return (
    <>
      <div style={{ position: 'absolute', inset: 0 }}>
        {Object.keys(screens).map(id => (
          <div key={id} className={'screen-wrap archive-screen' + (screen === id ? '' : ' hidden')}>
            {screens[id]}
          </div>
        ))}
      </div>
      <FloatingNav current={screen} go={go} />
    </>
  );
}
