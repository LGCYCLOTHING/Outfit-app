import React from 'react';
import { useTheme, bgColor, fgColor, StatusBar, THEMES } from '../lib/shared.jsx';
import LiquidMesh from '../lib/liquid-mesh.jsx';

// iOS-style toggle switch
function Toggle({ on, onChange, accent }) {
  return (
    <div
      onClick={(e) => { e.stopPropagation(); onChange(!on); }}
      className="archive-pressable"
      style={{
        width: 36, height: 22, borderRadius: 11,
        background: on ? accent : 'rgba(255,240,220,0.10)',
        position: 'relative', cursor: 'pointer',
        transition: 'background .25s ease',
        flexShrink: 0,
      }}>
      <div style={{
        position: 'absolute', top: 2, left: on ? 16 : 2,
        width: 18, height: 18, borderRadius: 9,
        background: '#F5F0E8',
        boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
        transition: 'left .25s cubic-bezier(.2,.8,.2,1)',
      }} />
    </div>
  );
}

const Chevron = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5C5248" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 6l6 6-6 6"/>
  </svg>
);

// Glass row — icon + title + subtitle + right-slot
function SettingsRow({ icon, title, subtitle, right, onClick, disabled, dangerText }) {
  return (
    <div
      onClick={disabled ? undefined : onClick}
      className={disabled ? '' : 'archive-pressable'}
      style={{
        background: 'rgba(255, 240, 220, 0.04)',
        border: '1px solid rgba(255, 240, 220, 0.07)',
        borderRadius: 14,
        padding: '14px 16px',
        marginBottom: 4,
        display: 'flex', alignItems: 'center', gap: 14,
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.45 : 1,
      }}>
      {/* Icon container */}
      <div style={{
        width: 32, height: 32, borderRadius: 8,
        background: 'rgba(255, 240, 220, 0.06)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        {icon}
      </div>

      {/* Title + subtitle */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 14, color: dangerText ? '#D4856A' : '#F5F0E8',
          lineHeight: 1.2, letterSpacing: '-0.02em',
        }}>
          {title}
        </div>
        {subtitle && (
          <div style={{
            fontSize: 12, color: 'var(--text-muted)', marginTop: 3, lineHeight: 1.3,
            letterSpacing: '-0.01em',
          }}>
            {subtitle}
          </div>
        )}
      </div>

      {/* Right slot */}
      {right !== null && (right || <Chevron />)}
    </div>
  );
}

const SectionLabel = ({ children, danger }) => (
  <div style={{
    fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase',
    color: danger ? '#D4856A' : '#5C5248',
    margin: '20px 0 8px 4px',
  }}>
    {children}
  </div>
);

// Stroke style shared by all icons
const ICONS = (accent) => ({
  bell: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10 21a2 2 0 0 0 4 0"/>
    </svg>
  ),
  calendar: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>
    </svg>
  ),
  sparkle: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3"/><path d="M12 8.5l1.5 2.5L16 12.5 13.5 14 12 16.5 10.5 14 8 12.5l2.5-1.5z"/>
    </svg>
  ),
  sunmoon: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 13a9 9 0 1 1-10-10 7 7 0 0 0 10 10z"/>
    </svg>
  ),
  palette: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22c5.5 0 10-4 10-9 0-5-4-9-10-9S2 8 2 13c0 3 2 5 4 5h2a2 2 0 0 1 2 2 2 2 0 0 0 2 2z"/>
      <circle cx="7.5" cy="11" r="1"/><circle cx="11" cy="7" r="1"/><circle cx="16" cy="9" r="1"/><circle cx="17" cy="14" r="1"/>
    </svg>
  ),
  phone: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="6" y="2" width="12" height="20" rx="2"/><path d="M11 18h2"/>
    </svg>
  ),
  cloud: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 16.5a4.5 4.5 0 0 0-1.5-8.7 6 6 0 0 0-11.6 1.5A4 4 0 0 0 7 17h13"/>
    </svg>
  ),
  download: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v12M7 10l5 5 5-5M5 21h14"/>
    </svg>
  ),
  trash: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M5 6l1 14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-14"/>
    </svg>
  ),
  lock: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>
    </svg>
  ),
  star: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l3 6 6 1-4.5 4.5L17.5 19 12 16l-5.5 3L7.5 13.5 3 9l6-1z"/>
    </svg>
  ),
  person: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4"/><path d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6"/>
    </svg>
  ),
  share: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
      <path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/>
    </svg>
  ),
  info: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>
    </svg>
  ),
  warning: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D4856A" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.3 3.5L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.5a2 2 0 0 0-3.4 0z"/>
      <path d="M12 9v4M12 17h.01"/>
    </svg>
  ),
  exit: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D4856A" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
    </svg>
  ),
});

export default function ScreenSettings() {
  const t = useTheme();
  const accent = '#C8956C';
  const themeAccent = t.light;

  // Toggle states (persisted via localStorage)
  const [dailyPick, setDailyPick] = useLocalToggle('aevum_set_daily_pick', true);
  const [streakReminder, setStreakReminder] = useLocalToggle('aevum_set_streak_reminder', true);
  const [aiCombos, setAiCombos] = useLocalToggle('aevum_set_ai_combos', false);
  const [photoBackup, setPhotoBackup] = useLocalToggle('aevum_set_photo_backup', true);

  const [confirmReset, setConfirmReset] = React.useState(false);

  const isLight = typeof window !== 'undefined' && !!window.__archiveLight;
  const I = ICONS(accent);

  const goBack = () => window.__archiveGo && window.__archiveGo('you');

  const handleReset = () => {
    try {
      Object.keys(localStorage).filter(k => k.startsWith('aevum_')).forEach(k => localStorage.removeItem(k));
    } catch (e) {}
    setConfirmReset(false);
    location.reload();
  };

  const toggleLight = () => {
    window.__archiveLight = !window.__archiveLight;
    window.dispatchEvent(new CustomEvent('archive:lightchange'));
  };

  return (
    <div style={{
      width: '100%', height: '100%', position: 'relative', overflow: 'hidden',
      background: bgColor(),
      fontFamily: 'Inter, -apple-system, system-ui, sans-serif',
      color: fgColor(),
    }}>
      <LiquidMesh seed={6} intensity={0.7} />
      <StatusBar />

      <div style={{
        position: 'relative', zIndex: 2,
        padding: 'calc(8px + var(--archive-safe-top, 54px)) 22px calc(60px + var(--archive-safe-bottom, 0px))',
        height: '100%', overflow: 'auto', boxSizing: 'border-box',
      }}>
        {/* Header — back + "Settings" title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
          <div onClick={goBack} className="archive-pressable" style={{
            width: 36, height: 36, borderRadius: 18,
            background: 'rgba(255,240,220,0.05)',
            border: '1px solid rgba(255,240,220,0.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', flexShrink: 0,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F5F0E8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 6l-6 6 6 6"/>
            </svg>
          </div>
          <div style={{
            fontSize: 28, color: 'var(--text-primary)',
            letterSpacing: '-0.05em', lineHeight: 1,
          }}>
            Settings
          </div>
        </div>

        {/* ─────── NOTIFICATIONS ─────── */}
        <SectionLabel>Notifications</SectionLabel>
        <SettingsRow icon={I.bell}     title="Daily outfit pick" subtitle="Every morning at 7:30 AM"
          right={<Toggle on={dailyPick} onChange={setDailyPick} accent={themeAccent} />} />
        <SettingsRow icon={I.calendar} title="Streak reminder"   subtitle="If you haven't logged by 9 PM"
          right={<Toggle on={streakReminder} onChange={setStreakReminder} accent={themeAccent} />} />
        <SettingsRow icon={I.sparkle}  title="New AI combos"     subtitle="When Mix refreshes daily"
          right={<Toggle on={aiCombos} onChange={setAiCombos} accent={themeAccent} />} />

        {/* ─────── APPEARANCE ─────── */}
        <SectionLabel>Appearance</SectionLabel>
        <SettingsRow icon={I.sunmoon} title="Display mode" subtitle={isLight ? 'Light' : 'Dark'}
          onClick={toggleLight} />
        <SettingsRow icon={I.palette} title="Theme" subtitle={t.name}
          onClick={() => window.__archiveGo && window.__archiveGo('you')} />
        <SettingsRow icon={I.phone}   title="App icon" subtitle="Default" disabled right={<Chevron />} />

        {/* ─────── DATA ─────── */}
        <SectionLabel>Data</SectionLabel>
        <SettingsRow icon={I.cloud}    title="Photo backup"   subtitle="iCloud · 2.4 GB"
          right={<Toggle on={photoBackup} onChange={setPhotoBackup} accent={themeAccent} />} />
        <SettingsRow icon={I.download} title="Export archive" subtitle="PDF · 312 fits"
          onClick={() => alert('Export started')} />
        <SettingsRow icon={I.trash}    title="Clear cache"    subtitle="Free up storage"
          onClick={() => alert('Cache cleared')} />
        <SettingsRow icon={I.lock}     title="Privacy"        subtitle="Data & permissions"
          onClick={() => alert('Privacy details')} />

        {/* ─────── ACCOUNT ─────── */}
        <SectionLabel>Account</SectionLabel>
        <SettingsRow icon={I.star}   title="Archive Pro"     subtitle="Manage subscription"
          onClick={() => window.__archiveGo && window.__archiveGo('paywall')} />
        <SettingsRow icon={I.person} title="Profile"         subtitle="absolutebeta786@gmail.com"
          onClick={() => alert('Profile')} />
        <SettingsRow icon={I.share}  title="Share AĒVUM"     subtitle="Invite friends"
          onClick={() => window.__archiveGo && window.__archiveGo('share')} />
        <SettingsRow icon={I.info}   title="About"           subtitle="Version 1.0.0"
          right={null} />

        {/* ─────── DANGER ZONE ─────── */}
        <SectionLabel danger>Danger zone</SectionLabel>
        <SettingsRow
          icon={I.warning}
          title="Reset all data"
          subtitle="Permanently delete everything"
          dangerText
          onClick={() => setConfirmReset(true)}
        />
        <SettingsRow
          icon={I.exit}
          title="Sign out"
          subtitle=" "
          dangerText
          onClick={() => alert('Signed out')}
        />
      </div>

      {/* Reset confirm sheet */}
      {confirmReset && (
        <>
          <div onClick={() => setConfirmReset(false)} style={{
            position: 'absolute', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.55)',
          }} />
          <div className="lg-sheet" style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 51,
            padding: '22px 24px calc(28px + var(--archive-safe-bottom, 0px))',
            borderTopLeftRadius: 28, borderTopRightRadius: 28,
            animation: 'archive-slide-up .25s cubic-bezier(.2,.8,.2,1)',
          }}>
            <div style={{ width: 38, height: 4, borderRadius: 2, background: 'rgba(245,240,232,0.2)', margin: '0 auto 18px' }} />
            <div style={{ fontSize: 22, color: 'var(--text-primary)', letterSpacing: '-0.04em', marginBottom: 8 }}>
              Reset all data?
            </div>
            <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: 22 }}>
              This will permanently delete every fit, streak, and preference. This cannot be undone.
            </div>
            <button onClick={handleReset} style={{
              width: '100%', height: 50, borderRadius: 25, border: 'none', cursor: 'pointer',
              background: '#D4856A', color: '#0a0a0a',
              fontSize: 15, fontFamily: 'inherit', marginBottom: 10,
            }}>
              Yes, delete everything
            </button>
            <button onClick={() => setConfirmReset(false)} style={{
              width: '100%', height: 50, borderRadius: 25, border: 'none', cursor: 'pointer',
              background: 'transparent', color: 'var(--text-secondary)',
              fontSize: 15, fontFamily: 'inherit',
            }}>
              Cancel
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function useLocalToggle(key, initial) {
  const [val, setVal] = React.useState(() => {
    try {
      const v = localStorage.getItem(key);
      return v == null ? initial : v === '1';
    } catch (e) { return initial; }
  });
  const setter = (v) => {
    setVal(v);
    try { localStorage.setItem(key, v ? '1' : '0'); } catch (e) {}
  };
  return [val, setter];
}
