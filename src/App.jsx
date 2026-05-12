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

function NavIcon({ id, color = '#F5F0E8' }) {
  const sw = 1.6;
  const common = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth: sw, strokeLinecap: 'round', strokeLinejoin: 'round' };
  if (id === 'today')    return <svg {...common}><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>;
  if (id === 'archive')  return <svg {...common}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>;
  if (id === 'mix')      return <svg {...common}><path d="M16 3h5v5M4 20l16-16M21 16v5h-5M14 14l7 7M3 4l5 5"/></svg>;
  if (id === 'pieces')   return <svg {...common}><path d="M12 4l-4 4 4 2 4-2-4-4zM4 14l8 4 8-4M4 14l8-4 8 4"/></svg>;
  if (id === 'calendar') return <svg {...common}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>;
  if (id === 'streak')   return <svg {...common} fill={color} stroke="none"><path d="M12 2c1 4-3 6-3 10a5 5 0 0 0 10 0c0-2-1-4-2-5 0 2-1 3-2 3 0-3-1-5-3-8z"/></svg>;
  if (id === 'you')      return <svg {...common}><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-7 8-7s8 3 8 7"/></svg>;
  if (id === 'settings') return <svg {...common}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1 1.55V21a2 2 0 0 1-4 0v-.09a1.7 1.7 0 0 0-1.11-1.55 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.55-1H3a2 2 0 0 1 0-4h.09a1.7 1.7 0 0 0 1.55-1.11 1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.34h.05a1.7 1.7 0 0 0 1-1.55V3a2 2 0 0 1 4 0v.09a1.7 1.7 0 0 0 1 1.55h.05a1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87v.05a1.7 1.7 0 0 0 1.55 1H21a2 2 0 0 1 0 4h-.09a1.7 1.7 0 0 0-1.55 1z"/></svg>;
  if (id === 'help')     return <svg {...common}><circle cx="12" cy="12" r="10"/><path d="M9.1 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><circle cx="12" cy="17" r="0.6" fill={color}/></svg>;
  if (id === 'paywall')  return <svg {...common} fill={color} stroke="none"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 16.8l-6.2 4.5 2.4-7.4L2 9.4h7.6z"/></svg>;
  return null;
}

function readLoggedCount() {
  try { return (JSON.parse(localStorage.getItem('archive_fits_logged') || '[]')).length; }
  catch (e) { return 0; }
}
function computeMenuStreak() {
  try {
    const set = new Set(JSON.parse(localStorage.getItem('archive_fits_logged') || '[]'));
    const today = new Date();
    let streak = 0;
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const key = `${y}-${m}-${day}`;
      if (set.has(key)) streak++;
      else if (i > 0) break;
    }
    return streak;
  } catch (e) { return 0; }
}

function NavRow({ id, label, sublabel, accent, accentRgba, hot, current, go, setOpen, badge, highlight, delay = 0, open }) {
  const active = current === id;
  return (
    <div
      className="lg-card archive-pressable"
      onClick={() => { go(id); setOpen(false); }}
      style={{
        padding: '12px 14px',
        borderRadius: 14,
        display: 'flex', alignItems: 'center', gap: 12,
        cursor: 'pointer',
        opacity: open ? 1 : 0,
        transform: open ? 'translateY(0)' : 'translateY(-6px)',
        transition: `opacity .3s ease ${delay}s, transform .35s cubic-bezier(.2,.8,.2,1) ${delay}s`,
        ...(highlight ? {
          background: `linear-gradient(135deg, rgba(${accentRgba},0.22) 0%, rgba(${accentRgba},0.06) 100%)`,
          border: `1px solid rgba(${accentRgba},0.40)`,
        } : {}),
        ...(active ? { boxShadow: `inset 0 0 0 1px rgba(${accentRgba},0.5), 0 0 24px -8px rgba(${accentRgba},0.4)` } : {}),
      }}>
      <div style={{
        width: 34, height: 34, borderRadius: 10, flexShrink: 0,
        background: highlight
          ? `linear-gradient(135deg, ${accent} 0%, ${hot} 100%)`
          : (active ? `rgba(${accentRgba},0.20)` : 'rgba(255,255,255,0.06)'),
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: highlight ? `0 4px 14px -2px rgba(${accentRgba},0.45)` : 'none',
      }}>
        <NavIcon id={id} color={highlight ? '#0a0a0a' : (active ? accent : '#F5F0E8')} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 16, lineHeight: 1.2, letterSpacing: '-0.02em',
          color: active ? accent : '#F5F0E8',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          {label}
          {badge && (
            <span style={{
              fontSize: 9, letterSpacing: 1.4,
              padding: '2px 7px', borderRadius: 4,
              background: `linear-gradient(135deg, ${accent} 0%, ${hot} 100%)`,
              color: '#0a0a0a',
            }}>PRO</span>
          )}
        </div>
        {sublabel && (
          <div style={{ fontSize: 11, color: 'rgba(245,240,232,0.55)', marginTop: 2, letterSpacing: 0.3 }}>
            {sublabel}
          </div>
        )}
      </div>
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(245,240,232,0.5)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 6l6 6-6 6"/>
      </svg>
    </div>
  );
}

function FloatingNav({ current, go }) {
  const [open, setOpen] = React.useState(false);
  const tt = (window.THEMES && window.THEMES[window.__archiveTheme || 'dusk']) || THEMES[window.__archiveTheme || 'dusk'] || { light: '#9ec4d8', softRgba: '122,166,196', deep: '#1a2630', hot: '#7aa6c4' };
  const accent = tt.light;
  const hot = tt.hot || accent;
  const accentRgba = tt.softRgba;

  const streak = open ? computeMenuStreak() : 0;
  const fitsLogged = open ? readLoggedCount() : 0;

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

  const navItems = [
    { id: 'today',    label: 'Today',       sublabel: 'Daily pick + log' },
    { id: 'archive',  label: 'Archive',     sublabel: 'Every fit logged' },
    { id: 'mix',      label: 'Mix & Match', sublabel: 'Outfit ideas' },
    { id: 'pieces',   label: 'Pieces',      sublabel: 'Wardrobe catalog' },
    { id: 'calendar', label: 'Calendar',    sublabel: 'Browse by month' },
    { id: 'streak',   label: 'Streak',      sublabel: 'Stats + milestones' },
    { id: 'you',      label: 'You',         sublabel: 'Profile + themes' },
  ];

  return (
    <>
      <div
        onClick={() => setOpen(false)}
        style={{
          position: 'absolute', inset: 0, zIndex: 95,
          background: open ? 'rgba(0,0,0,0.25)' : 'transparent',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transition: 'opacity .28s ease-out, background .28s ease-out',
        }}
      />

      <div className="liquid-glass" style={{
        position: 'absolute',
        top: 0, left: 0, right: 0,
        zIndex: 100,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        padding: 'calc(20px + var(--archive-safe-top, 0px)) 22px 24px',
        boxSizing: 'border-box',
        transform: open ? 'translateY(0)' : 'translateY(-100%)',
        transition: 'transform .28s ease-out',
        overflow: 'hidden',
      }}>
        {/* Top row — wordmark + close */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 22,
        }}>
          <div style={{
            fontFamily: '"DM Sans", sans-serif',
            fontSize: 11, fontWeight: 500, letterSpacing: 4,
            color: 'rgba(255,255,255,0.7)',
          }}>
            ARCHIVE
          </div>
          <div
            className="archive-pressable lg-card"
            onClick={() => setOpen(false)}
            style={{
              width: 34, height: 34, borderRadius: 17,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
            }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="1.8" strokeLinecap="round">
              <path d="M5 5l14 14M19 5L5 19"/>
            </svg>
          </div>
        </div>

        {/* Stats strip */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10,
          marginBottom: 22,
        }}>
          <div
            onClick={() => { go('streak'); setOpen(false); }}
            className="lg-card archive-pressable"
            style={{
              padding: '12px 14px', borderRadius: 14, cursor: 'pointer',
              opacity: open ? 1 : 0,
              transition: 'opacity .3s ease 0.04s',
            }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <svg className="archive-flame" width="13" height="13" viewBox="0 0 24 24" fill={accent}>
                <path d="M12 2c1 4-3 6-3 10a5 5 0 0 0 10 0c0-2-1-4-2-5 0 2-1 3-2 3 0-3-1-5-3-8z"/>
              </svg>
              <span style={{ fontSize: 10, color: 'rgba(245,240,232,0.55)', letterSpacing: 1.2, fontWeight: 500 }}>
                STREAK
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
              <span style={{ fontSize: 24, color: '#F5F0E8', letterSpacing: '-0.04em', lineHeight: 1 }}>
                {streak}
              </span>
              <span style={{ fontSize: 11, color: 'rgba(245,240,232,0.5)' }}>
                {streak === 1 ? 'day' : 'days'}
              </span>
            </div>
          </div>
          <div
            onClick={() => { go('archive'); setOpen(false); }}
            className="lg-card archive-pressable"
            style={{
              padding: '12px 14px', borderRadius: 14, cursor: 'pointer',
              opacity: open ? 1 : 0,
              transition: 'opacity .3s ease 0.08s',
            }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M21 15l-5-5L5 21"/>
              </svg>
              <span style={{ fontSize: 10, color: 'rgba(245,240,232,0.55)', letterSpacing: 1.2, fontWeight: 500 }}>
                FITS LOGGED
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
              <span style={{ fontSize: 24, color: '#F5F0E8', letterSpacing: '-0.04em', lineHeight: 1 }}>
                {fitsLogged}
              </span>
              <span style={{ fontSize: 11, color: 'rgba(245,240,232,0.5)' }}>
                total
              </span>
            </div>
          </div>
        </div>

        {/* NAVIGATE section */}
        <div style={{
          fontFamily: '"DM Sans", sans-serif',
          fontSize: 10, fontWeight: 500, letterSpacing: 3,
          color: 'rgba(255,255,255,0.45)',
          textTransform: 'uppercase',
          marginBottom: 10,
        }}>
          Navigate
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 22 }}>
          {navItems.map((it, i) => (
            <NavRow
              key={it.id}
              id={it.id}
              label={it.label}
              sublabel={it.sublabel}
              accent={accent}
              accentRgba={accentRgba}
              hot={hot}
              current={current}
              go={go}
              setOpen={setOpen}
              open={open}
              delay={0.05 + i * 0.03}
            />
          ))}
        </div>

        {/* ACCOUNT section */}
        <div style={{
          fontFamily: '"DM Sans", sans-serif',
          fontSize: 10, fontWeight: 500, letterSpacing: 3,
          color: 'rgba(255,255,255,0.45)',
          textTransform: 'uppercase',
          marginBottom: 10,
        }}>
          Account
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 22 }}>
          <NavRow
            id="paywall"
            label="Go Pro"
            sublabel="Unlimited pieces + insights"
            badge
            highlight
            accent={accent}
            accentRgba={accentRgba}
            hot={hot}
            current={current}
            go={go}
            setOpen={setOpen}
            open={open}
            delay={0.28}
          />
          <NavRow
            id="settings"
            label="Settings"
            sublabel="Notifications, theme, data"
            accent={accent}
            accentRgba={accentRgba}
            hot={hot}
            current={current}
            go={go}
            setOpen={setOpen}
            open={open}
            delay={0.32}
          />
        </div>

        {/* Footer */}
        <div style={{
          fontFamily: '"DM Sans", sans-serif',
          fontSize: 10.5, color: 'rgba(255,255,255,0.4)',
          letterSpacing: 0.3, lineHeight: 1.6,
          textAlign: 'center',
          paddingTop: 8,
          borderTop: '1px solid rgba(255,255,255,0.06)',
          opacity: open ? 1 : 0,
          transition: 'opacity .3s ease .4s',
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
