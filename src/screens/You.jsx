import React from 'react';
import {
  useTheme, bgColor, fgColor, THEMES,
  ArchiveBurger, StatusBar, GlowCard, Glass, TabBar,
} from '../lib/shared.jsx';
import LiquidMesh from '../lib/liquid-mesh.jsx';
import { calculateWeeklyScore } from '../lib/fitScore.js';
import { getWardrobeCompletion } from '../lib/wardrobe.js';
import { UNLOCK_THRESHOLD, getTotalFitCount, computeStyleDNA } from '../lib/styleDNA.js';
import { pushProfile, useAuthUser } from '../lib/sync.js';

export default function ScreenYou() {
  const t = useTheme();
  const accent = t.light;
  const accentRgba = t.softRgba;
  const accentHot = t.hot;
  const accentDeep = t.deep;
  const activeId = t.id;

  // Live Supabase auth state (null when signed out).
  const authUser = useAuthUser();

  // Weekly Fit Score for the profile stats row (refreshes on save).
  const [fitScore, setFitScore] = React.useState(() => calculateWeeklyScore().score);
  // Wardrobe completion + total fits (for Style DNA preview).
  const [wardrobePct, setWardrobePct] = React.useState(() => getWardrobeCompletion().percent);
  const [totalFitsCount, setTotalFitsCount] = React.useState(() => getTotalFitCount());
  React.useEffect(() => {
    const refresh = () => {
      setFitScore(calculateWeeklyScore().score);
      setWardrobePct(getWardrobeCompletion().percent);
      setTotalFitsCount(getTotalFitCount());
    };
    window.addEventListener('archive:fitschanged', refresh);
    window.addEventListener('archive:scorechanged', refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener('archive:fitschanged', refresh);
      window.removeEventListener('archive:scorechanged', refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);
  const styleUnlocked = totalFitsCount >= UNLOCK_THRESHOLD;
  const stylePrimary = React.useMemo(
    () => styleUnlocked ? computeStyleDNA().primary : null,
    [styleUnlocked, totalFitsCount]
  );

  const swatches = ['ivory', 'slate', 'forest', 'dusk', 'ember', 'noir'].map(id => THEMES[id]);
  // Icon picker uses themes that have actual icon-<id>.png files
  const iconSwatches = swatches.filter(s => !s.darkOnly);

  // Vivid Soft-Horizon gradient stops — brighter highlight + saturated middle + deep edge
  const SUNSET = {
    ember:  { hi: '#FFE0B0', mid1: '#FFAE63', mid2: '#FF6B35', deep: '#C2391F' },
    dusk:   { hi: '#E8C9FF', mid1: '#B093E6', mid2: '#7A52D6', deep: '#3D2380' },
    forest: { hi: '#D6EFC2', mid1: '#9BC78C', mid2: '#5C9762', deep: '#1F4225' },
    slate:  { hi: '#B4F4DC', mid1: '#5BDDB2', mid2: '#1FB58E', deep: '#08221C' },
    smoke:  { hi: '#EAE5DC', mid1: '#B5AFA4', mid2: '#807870', deep: '#3D3833' },
    ivory:  { hi: '#FFEED1', mid1: '#F0CC92', mid2: '#B98D52', deep: '#5A4628' },
    noir:   { hi: '#555555', mid1: '#333333', mid2: '#1a1a1a', deep: '#000000' },
  };

  const setTheme = (id) => {
    window.__archiveTheme = id;
    try { localStorage.setItem('aevum_theme_id', id); } catch (e) {}
    window.dispatchEvent(new CustomEvent('archive:themechange', { detail: id }));
    pushProfile({ theme: id });
  };

  // Manual icon override — null = follow the active theme
  const [iconOverride, setIconOverride] = React.useState(() => {
    try { return localStorage.getItem('aevum_app_icon'); } catch (e) { return null; }
  });
  // Collapsed by default — app icon is a rarely-touched setting, so it lives
  // as a small expander tucked inside the Appearance section
  const [iconPickerOpen, setIconPickerOpen] = React.useState(false);
  const currentIconId = iconOverride || activeId;
  const pickIcon = (id) => {
    try {
      if (id) localStorage.setItem('aevum_app_icon', id);
      else localStorage.removeItem('aevum_app_icon');
    } catch (e) {}
    setIconOverride(id);
    window.dispatchEvent(new CustomEvent('archive:iconchange', { detail: id }));
    pushProfile({ selected_icon: id || null });
  };

  const isLight = !!window.__archiveLight;
  const toggleLight = () => {
    window.__archiveLight = !window.__archiveLight;
    window.dispatchEvent(new CustomEvent('archive:lightchange'));
  };

  return (
    <div style={{
      width: '100%', height: '100%', position: 'relative', overflow: 'hidden',
      background: bgColor(),
      fontFamily: 'DM Sans, -apple-system, system-ui, sans-serif',
      color: fgColor(),
    }}>
      <div style={{
        position: 'absolute', top: -180, left: '50%', transform: 'translateX(-50%)',
        width: 460, height: 460, borderRadius: '50%',
        background: `radial-gradient(circle, rgba(${accentRgba},0.22) 0%, transparent 60%)`,
        filter: 'blur(40px)', pointerEvents: 'none',
      }} />
      <LiquidMesh seed={4} intensity={1} />

      <StatusBar />

      <div style={{ position: 'absolute', zIndex: 2, top: 'var(--archive-safe-top, 54px)', left: 0, right: 0, bottom: 0, padding: '24px 24px calc(120px + var(--archive-safe-bottom, 0px))', overflow: 'auto', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22 }}>
          <ArchiveBurger />
          <div style={{
            width: 64, height: 64, borderRadius: 32,
            background: `radial-gradient(circle at 30% 30%, ${accent} 0%, ${accentHot} 50%, ${accentDeep} 100%)`,
            boxShadow: `inset 0 0 0 0.5px rgba(${accentRgba},0.4)`,
          }} />
          <div>
            <div className="h-display" style={{ fontSize: 26 }}>Your <em>archive</em></div>
            <div style={{ fontSize: 14, color: 'var(--text-primary)', marginTop: 4, letterSpacing: -0.35, fontFamily: '"DM Sans", sans-serif' }}>312 FITS · 47 DAY STREAK · {fitScore} THIS WEEK · {wardrobePct}% CATALOGED</div>
            {authUser ? (
              <div style={{
                fontSize: 11, color: '#5C5248', marginTop: 4,
                fontFamily: '"DM Sans", sans-serif', letterSpacing: -0.05,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                maxWidth: 220,
              }}>
                {authUser.email || authUser.user_metadata?.email || '—'}
              </div>
            ) : (
              <div
                onClick={() => window.__archiveGo && window.__archiveGo('auth')}
                className="archive-pressable liquid-glass"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  marginTop: 8, padding: '5px 11px', borderRadius: 999,
                  fontSize: 11.5, fontWeight: 500, color: '#fff',
                  cursor: 'pointer', letterSpacing: -0.1,
                }}>
                Sign in to sync your data
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 6l6 6-6 6"/>
                </svg>
              </div>
            )}
          </div>
        </div>

        {/* Style DNA preview row */}
        <div
          onClick={() => window.__archiveGo && window.__archiveGo('styledna')}
          className="archive-pressable"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 16px', borderRadius: 14,
            background: 'rgba(255,240,220,0.04)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,240,220,0.07)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.22)',
            marginBottom: 18, cursor: 'pointer',
          }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 12,
              background: stylePrimary ? stylePrimary.color : 'rgba(255,255,255,0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: stylePrimary
                ? `0 0 12px -2px ${stylePrimary.color}`
                : 'inset 0 0 0 0.5px rgba(255,255,255,0.10)',
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3.5"/>
                <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12M4.93 19.07l2.12-2.12M16.95 7.05l2.12-2.12"/>
              </svg>
            </div>
            <div>
              <div style={{
                fontSize: 14, fontWeight: 500, color: '#fff', letterSpacing: -0.2,
              }}>Style DNA</div>
              <div style={{
                fontSize: 11.5, color: 'var(--text-secondary)', marginTop: 2,
              }}>
                {styleUnlocked && stylePrimary
                  ? `${stylePrimary.label} · ${stylePrimary.pct}%`
                  : `Log ${UNLOCK_THRESHOLD - totalFitsCount} more ${UNLOCK_THRESHOLD - totalFitsCount === 1 ? 'fit' : 'fits'} to unlock`}
              </div>
            </div>
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 6l6 6-6 6"/>
          </svg>
        </div>

        {/* ────────── APPEARANCE first ────────── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <div style={{ width: 3, height: 14, borderRadius: 1.5, background: accent }} />
          <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', letterSpacing: -0.4, fontFamily: '"DM Sans", sans-serif' }}>
            APPEARANCE · THEME
          </span>
        </div>

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10,
          marginBottom: 18,
        }}>
          {swatches.map(s => {
            const isActive = s.id === activeId;
            return (
              <div key={s.id}
                onClick={() => setTheme(s.id)}
                className="archive-pressable"
                style={{
                  position: 'relative', aspectRatio: '1', borderRadius: 24, overflow: 'hidden',
                  background: '#0F0D0B',
                  border: isActive ? `1.5px solid ${s.light}` : '1px solid rgba(245,240,232,0.08)',
                  boxShadow: isActive
                    ? `0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(245,240,232,0.08)`
                    : '0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(245,240,232,0.06), inset 0 -1px 0 rgba(0,0,0,0.2)',
                  cursor: 'pointer',
                  transition: 'border-color .25s ease, box-shadow .25s ease',
                }}>
                {/* Per-theme swatch — uses the icon image when available, falls
                   back to the theme's bg image for dark-only themes like noir */}
                <div style={{
                  position: 'absolute', inset: 0,
                  backgroundImage: s.darkOnly
                    ? `url('/backgrounds/bg-${s.id}.png'), radial-gradient(circle at 50% 42%, ${SUNSET[s.id].mid2} 0%, ${SUNSET[s.id].deep} 70%)`
                    : `url('/icons/icon-${s.id}.png'), radial-gradient(circle at 50% 42%, ${SUNSET[s.id].mid2} 0%, ${SUNSET[s.id].deep} 70%)`,
                  backgroundSize: 'cover, cover',
                  backgroundPosition: 'center, center',
                  backgroundRepeat: 'no-repeat, no-repeat',
                }} />

                {/* Bottom darkening for label legibility */}
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(to top, rgba(12,10,8,0.55) 0%, transparent 45%)',
                  pointerEvents: 'none',
                }} />

                {/* Active indicator dot — top-left */}
                {isActive && (
                  <div style={{
                    position: 'absolute', top: 14, left: 14,
                    width: 7, height: 7, borderRadius: 4,
                    background: '#F5F0E8',
                    boxShadow: `inset 0 0 0 1px ${s.light}`,
                  }} />
                )}

                {/* 4-dot grip — top-right */}
                <div style={{
                  position: 'absolute', top: 14, right: 14,
                  display: 'grid', gridTemplateColumns: '3px 3px', gridTemplateRows: '3px 3px', gap: 3,
                }}>
                  {[0,1,2,3].map(k => <div key={k} style={{ width: 3, height: 3, borderRadius: 1.5, background: 'rgba(245,240,232,0.35)' }} />)}
                </div>

                {/* Label — centered bottom, spaced caps */}
                <div style={{
                  position: 'absolute', bottom: 18, left: 0, right: 0,
                  textAlign: 'center',
                  fontSize: 11, letterSpacing: 1.6, fontWeight: 600,
                  color: 'var(--text-primary)',
                  textShadow: '0 1px 6px rgba(0,0,0,0.55)',
                }}>
                  {s.name.toUpperCase()}
                </div>
              </div>
            );
          })}
        </div>

        {/* App icon — tucked into Appearance as a single expandable row, since
           people change theme often but rarely the icon */}
        <div style={{ marginTop: 14, marginBottom: 4 }}>
          <div
            onClick={() => setIconPickerOpen(o => !o)}
            className="archive-pressable"
            style={{
              padding: '10px 14px 10px 10px', borderRadius: 14,
              display: 'flex', alignItems: 'center', gap: 12,
              cursor: 'pointer',
              background: 'rgba(255,240,220,0.04)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,240,220,0.07)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.22)',
            }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              overflow: 'hidden',
              boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
              flexShrink: 0,
              position: 'relative',
            }}>
              <img
                src={`/icons/icon-${currentIconId === 'noir' ? 'ivory' : currentIconId}.png`}
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
              <div className="aevum-wordmark" style={{
                position: 'absolute', inset: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: 5.5, paddingLeft: '0.26em',
                textShadow: '0 1px 3px rgba(0,0,0,0.45)',
                pointerEvents: 'none',
              }}>AĒVUM</div>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, color: 'var(--text-primary)', letterSpacing: '-0.02em', fontWeight: 600 }}>App icon</div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
                {iconOverride ? `Locked to ${currentIconId}` : 'Matches active theme'}
              </div>
            </div>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              style={{ transform: iconPickerOpen ? 'rotate(90deg)' : 'none', transition: 'transform .25s ease' }}>
              <path d="M9 6l6 6-6 6"/>
            </svg>
          </div>

          {/* Expanded picker grid */}
          <div style={{
            overflow: 'hidden',
            maxHeight: iconPickerOpen ? 240 : 0,
            opacity: iconPickerOpen ? 1 : 0,
            transition: 'max-height .35s cubic-bezier(.16,1,.3,1), opacity .25s ease',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
              marginTop: 10, marginBottom: 8,
            }}>
              <div
                onClick={() => pickIcon(null)}
                className="archive-pressable lg-pill"
                style={{
                  padding: '5px 11px', borderRadius: 100, cursor: 'pointer',
                  fontSize: 10.5, color: iconOverride === null ? accent : 'var(--text-secondary)',
                  fontWeight: 500, letterSpacing: 0.3,
                  boxShadow: iconOverride === null ? `inset 0 0 0 1px ${accent}` : undefined,
                }}>
                Match theme
              </div>
            </div>
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 6,
            }}>
              {iconSwatches.map(s => {
                const isPicked = iconOverride === s.id;
                return (
                  <div key={s.id}
                    onClick={() => pickIcon(s.id)}
                    className="archive-pressable"
                    style={{
                      position: 'relative', aspectRatio: '1', borderRadius: 12,
                      overflow: 'hidden', cursor: 'pointer',
                      border: isPicked ? `1.5px solid ${s.light}` : '1px solid rgba(255,255,255,0.08)',
                      boxShadow: isPicked
                        ? `0 0 0 2px rgba(0,0,0,0.4), 0 6px 14px -4px rgba(${s.softRgba},0.45)`
                        : '0 2px 8px rgba(0,0,0,0.3)',
                      transition: 'border-color .2s, box-shadow .2s',
                    }}>
                    <img
                      src={`/icons/icon-${s.id}.png`}
                      alt=""
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                    <div className="aevum-wordmark" style={{
                      position: 'absolute', inset: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontSize: 6, paddingLeft: '0.26em',
                      textShadow: '0 1px 4px rgba(0,0,0,0.45)',
                      pointerEvents: 'none',
                    }}>AĒVUM</div>
                    {isPicked && (
                      <div style={{
                        position: 'absolute', top: 4, right: 4,
                        width: 12, height: 12, borderRadius: 6,
                        background: s.light,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M5 12l5 5L20 7"/>
                        </svg>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ────────── DISPLAY MODE ────────── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, marginTop: 22 }}>
          <div style={{ width: 3, height: 14, borderRadius: 1.5, background: accent }} />
          <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', letterSpacing: -0.4, fontFamily: '"DM Sans", sans-serif' }}>
            DISPLAY MODE
          </span>
        </div>
        <Glass radius={18} style={{ padding: 6, marginBottom: 22, display: 'flex' }}>
          {[
            { id: 'dark', label: 'Dark' },
            { id: 'light', label: 'Light' },
          ].map(opt => {
            const active = (opt.id === 'light') === isLight;
            return (
              <div key={opt.id}
                onClick={() => { if (active) return; toggleLight(); }}
                style={{
                  flex: 1, textAlign: 'center', padding: '12px 0',
                  borderRadius: 13,
                  background: active ? `rgba(${accentRgba},0.16)` : 'transparent',
                  boxShadow: active ? `inset 0 0 0 0.5px rgba(${accentRgba},0.35)` : 'none',
                  fontSize: 15, fontWeight: 500,
                  color: active ? accent : 'rgba(255,255,255,0.65)',
                  cursor: 'pointer',
                  transition: 'all .2s ease',
                }}>
                {opt.label}
              </div>
            );
          })}
        </Glass>

        {/* ────────── QUICK LINKS — feature destinations ────────── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <div style={{ width: 3, height: 14, borderRadius: 1.5, background: accent }} />
          <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', letterSpacing: -0.4, fontFamily: '"DM Sans", sans-serif' }}>
            SHORTCUTS
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
          {[
            { id: 'pieces',   title: 'Pieces',         sub: 'Wardrobe catalog',         icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 8a2 2 0 1 1 2-2"/><path d="M12 8v2"/>
                <path d="M12 10L3 17c-.5.4-.3 1.2.3 1.2h17.4c.6 0 .8-.8.3-1.2L12 10z"/>
              </svg>
            )},
            { id: 'streak',   title: 'Streak',         sub: 'Stats + milestones',       icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2c1 4-3 6-3 10a5 5 0 0 0 10 0c0-2-1-4-2-5 0 2-1 3-2 3 0-3-1-5-3-8z"/>
              </svg>
            )},
            { id: 'calendar', title: 'Calendar',       sub: 'Browse fits by month',     icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>
              </svg>
            )},
            { id: 'share',    title: 'Share archive',  sub: 'Generate a shareable card', icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7M16 6l-4-4-4 4M12 2v14"/>
              </svg>
            )},
          ].map(row => (
            <div key={row.id}
              onClick={() => window.__archiveGo && window.__archiveGo(row.id)}
              className="archive-pressable"
              style={{
                padding: '12px 14px', borderRadius: 14,
                display: 'flex', alignItems: 'center', gap: 12,
                cursor: 'pointer',
                background: 'rgba(255,240,220,0.04)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,240,220,0.07)',
                boxShadow: '0 4px 16px rgba(0,0,0,0.22)',
              }}>
              <div style={{
                width: 30, height: 30, borderRadius: 10,
                background: `rgba(${accentRgba},0.22)`,
                border: `1px solid rgba(${accentRgba},0.4)`,
                color: accent,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                {row.icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, color: 'var(--text-primary)', letterSpacing: '-0.02em', fontWeight: 600 }}>{row.title}</div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>{row.sub}</div>
              </div>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 6l6 6-6 6"/>
              </svg>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, marginTop: 22 }}>
          <svg width="11" height="13" viewBox="0 0 12 14" fill={accent}>
            <path d="M6 0a4 4 0 0 0-4 4v2H1v8h10V6h-1V4a4 4 0 0 0-4-4zm0 2a2 2 0 0 1 2 2v2H4V4a2 2 0 0 1 2-2z"/>
          </svg>
          <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', letterSpacing: -0.4, fontFamily: '"DM Sans", sans-serif' }}>
            PRO · LOCKED
          </span>
        </div>

        <div onClick={() => window.__archiveGo && window.__archiveGo('paywall')} style={{
          cursor: 'pointer',
          borderRadius: 16,
          background: 'rgba(255,240,220,0.04)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,240,220,0.07)',
          boxShadow: '0 4px 16px rgba(0,0,0,0.22)',
        }}>
          <div>
            <div style={{ padding: 18, display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                position: 'relative', width: 52, height: 52, borderRadius: 26, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'conic-gradient(from 0deg, #f5e6c8, #7aa6c4, #6e9a4d, #a8aab2, #9472cf, #ff8a3d, #f5e6c8)',
                boxShadow: `inset 0 0 0 1.5px rgba(255,255,255,0.15)`,
              }}>
                <div style={{
                  width: 38, height: 38, borderRadius: 19,
                  background: 'rgba(10,8,8,0.85)',
                  backdropFilter: 'blur(8px)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: 'inset 0 0 0 0.5px rgba(255,255,255,0.1)',
                }}>
                  <svg width="16" height="18" viewBox="0 0 12 14" fill={accent}>
                    <path d="M6 0a4 4 0 0 0-4 4v2H1v8h10V6h-1V4a4 4 0 0 0-4-4zm0 2a2 2 0 0 1 2 2v2H4V4a2 2 0 0 1 2-2z"/>
                  </svg>
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <div style={{ fontSize: 15, fontWeight: 500, letterSpacing: -0.2 }}>Dynamic Theme</div>
                  <div style={{
                    padding: '2px 7px', borderRadius: 100,
                    background: `linear-gradient(135deg, ${accent} 0%, ${accentHot} 100%)`,
                    fontSize: 9, color: '#0a0a0a', fontWeight: 500, letterSpacing: -0.13,
                  }}>PRO</div>
                </div>
                <div style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.4 }}>
                  App color updates automatically from your outfit photo.
                </div>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="1" strokeLinecap="round">
                <path d="M9 6l6 6-6 6"/>
              </svg>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, marginTop: 26 }}>
          <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', letterSpacing: -0.4, fontFamily: '"DM Sans", sans-serif' }}>
            ACCOUNT
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            {
              label: 'Settings',
              sub: 'Notifications, data, privacy',
              onClick: () => window.__archiveGo && window.__archiveGo('settings'),
              icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F5F0E8" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>
                </svg>
              ),
            },
            {
              label: 'Notifications',
              sub: 'Daily pick at 7:30 am',
              onClick: () => window.__archiveGo && window.__archiveGo('settings'),
              icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F5F0E8" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
                  <path d="M10 21a2 2 0 0 0 4 0"/>
                </svg>
              ),
            },
            {
              label: 'Photo backup',
              sub: 'iCloud · 2.4 GB',
              onClick: () => window.__archiveGo && window.__archiveGo('settings'),
              icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F5F0E8" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 16.5a4.5 4.5 0 0 0-1.5-8.7 6 6 0 0 0-11.6 1.5A4 4 0 0 0 7 17h13"/>
                </svg>
              ),
            },
            {
              label: 'Export archive',
              sub: 'PDF · 312 fits',
              onClick: () => window.__archiveGo && window.__archiveGo('settings'),
              icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F5F0E8" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3v12M7 8l5-5 5 5M5 21h14"/>
                </svg>
              ),
            },
          ].map((row) => (
            <div key={row.label} onClick={row.onClick} className="lg-pill archive-pressable" style={{
              padding: '12px 14px 12px 12px', borderRadius: 100,
              display: 'flex', alignItems: 'center', gap: 14,
              cursor: 'pointer',
            }}>
              {/* Circular icon container — like the reference's chat/info bubbles */}
              <div className="lg-chip" style={{
                width: 40, height: 40, borderRadius: 20,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                {row.icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: -0.2, lineHeight: 1.2 }}>
                  {row.label}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3, lineHeight: 1.2 }}>
                  {row.sub}
                </div>
              </div>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(245,240,232,0.4)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 6l6 6-6 6"/>
              </svg>
            </div>
          ))}
        </div>
      </div>

      <TabBar active="you" />
    </div>
  );
}
