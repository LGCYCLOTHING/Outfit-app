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

const VALID_SCREENS = ['today','archive','mix','you','paywall','rating','detail','calendar','share','story','splash','onboarding','auth'];

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
        zIndex: 100,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        padding: 'calc(60px + var(--archive-safe-top, 0px)) 28px calc(32px + var(--archive-safe-bottom, 0px))',
        boxSizing: 'border-box',
        transform: open ? 'translateY(0)' : 'translateY(-100%)',
        transition: 'transform .28s ease-out',
        overflow: 'hidden',
      }}>
        <div
          className="archive-pressable"
          onClick={() => setOpen(false)}
          style={{
            position: 'absolute',
            top: 'calc(20px + var(--archive-safe-top, 0px))',
            right: 22,
            width: 28, height: 28,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
          }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="1" strokeLinecap="round">
            <path d="M5 5l14 14M19 5L5 19"/>
          </svg>
        </div>

        <div style={{
          fontFamily: '"DM Sans", sans-serif',
          fontSize: 10, fontWeight: 500, letterSpacing: 3,
          color: 'rgba(255,255,255,0.45)',
          textTransform: 'uppercase',
          marginBottom: 22,
        }}>
          Navigate
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginBottom: 28 }}>
          {[
            { id: 'today',   label: 'Today' },
            { id: 'archive', label: 'Archive' },
            { id: 'mix',     label: 'Mix & Match' },
            { id: 'you',     label: 'You' },
          ].map((it, i) => {
            const active = current === it.id;
            return (
              <div
                key={it.id}
                className="archive-pressable"
                onClick={() => { go(it.id); setOpen(false); }}
                style={{
                  fontFamily: '"DM Sans", -apple-system, system-ui, sans-serif',
                  fontSize: 36,
                  fontWeight: 700,
                  lineHeight: 1,
                  letterSpacing: -0.5,
                  color: active ? accent : 'rgba(255,255,255,0.95)',
                  cursor: 'pointer',
                  opacity: open ? 1 : 0,
                  transform: open ? 'translateY(0)' : 'translateY(-8px)',
                  transition: `opacity .3s ease ${0.05 + i * 0.04}s, transform .35s cubic-bezier(.2,.8,.2,1) ${0.05 + i * 0.04}s`,
                }}>
                {it.label}
              </div>
            );
          })}
        </div>

        <div style={{
          height: 1,
          background: 'rgba(255,255,255,0.08)',
          marginBottom: 22,
        }} />

        <div style={{
          fontFamily: '"DM Sans", sans-serif',
          fontSize: 10, fontWeight: 500, letterSpacing: 3,
          color: 'rgba(255,255,255,0.45)',
          textTransform: 'uppercase',
          marginBottom: 16,
        }}>
          Account
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
          {[
            { id: 'paywall',  label: 'Go Pro', badge: true },
            { id: 'settings', label: 'Settings' },
            { id: 'help',     label: 'Help' },
          ].map((it, i) => (
            <div
              key={it.id}
              className="archive-pressable"
              onClick={() => { if (it.id === 'paywall') { go('paywall'); setOpen(false); } else { setOpen(false); } }}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                fontFamily: '"DM Sans", -apple-system, system-ui, sans-serif',
                fontSize: 22, fontWeight: 600,
                lineHeight: 1.1, letterSpacing: -0.3,
                color: 'rgba(255,255,255,0.85)',
                cursor: 'pointer',
                opacity: open ? 1 : 0,
                transform: open ? 'translateY(0)' : 'translateY(-6px)',
                transition: `opacity .3s ease ${0.22 + i * 0.04}s, transform .35s cubic-bezier(.2,.8,.2,1) ${0.22 + i * 0.04}s`,
              }}>
              {it.label}
              {it.badge && (
                <span style={{
                  fontFamily: '"DM Sans", sans-serif',
                  fontSize: 9, fontWeight: 500, letterSpacing: 1,
                  padding: '3px 7px', borderRadius: 4,
                  background: `linear-gradient(135deg, ${accent} 0%, ${tt.hot || accent} 100%)`,
                  color: '#0a0a0a',
                }}>PRO</span>
              )}
            </div>
          ))}
        </div>

        <div style={{
          fontFamily: '"DM Sans", sans-serif',
          fontSize: 10.5, color: 'rgba(255,255,255,0.4)',
          letterSpacing: 0.3, lineHeight: 1.6,
          opacity: open ? 1 : 0,
          transition: 'opacity .3s ease .35s',
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
    today:    <ScreenToday />,
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
