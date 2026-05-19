import React from 'react';
import { useTheme, bgColor, fgColor, StatusBar, getSavedFitPhoto, getActiveIconId } from '../lib/shared.jsx';
import LiquidMesh from '../lib/liquid-mesh.jsx';

function ymd(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
function prettyDate(d) {
  const m = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  return `${m[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

export default function ScreenShare() {
  const t = useTheme();
  const accent = t.light;
  const accentHot = t.hot;
  const accentDeep = t.deep;
  const accentRgba = t.softRgba;

  const [variant, setVariant] = React.useState('editorial');
  const [sharing, setSharing] = React.useState(false);

  const today = new Date();
  const todayKey = ymd(today);

  // Pull today's logged photo and stay in sync if the user logs one while this
  // screen is open (Rating dispatches archive:fitschanged on save).
  const [photoData, setPhotoData] = React.useState(() => getSavedFitPhoto(todayKey));
  React.useEffect(() => {
    const refresh = () => setPhotoData(getSavedFitPhoto(todayKey));
    window.addEventListener('archive:fitschanged', refresh);
    return () => window.removeEventListener('archive:fitschanged', refresh);
  }, [todayKey]);

  // Branded mark — uses whichever app icon the user picked (theme-tied),
  // refreshes when they change theme/icon.
  const [iconId, setIconId] = React.useState(() => getActiveIconId());
  React.useEffect(() => {
    const refresh = () => setIconId(getActiveIconId());
    window.addEventListener('archive:themechange', refresh);
    window.addEventListener('archive:iconchange', refresh);
    return () => {
      window.removeEventListener('archive:themechange', refresh);
      window.removeEventListener('archive:iconchange', refresh);
    };
  }, []);
  const iconSrc = `/icons/icon-${iconId}.png`;
  const dateLabel = prettyDate(today);
  const fitNumber = '023';
  const fitTotal = '312';
  const moodLabel = 'Sharp';
  const weather = '61° · CLEAR · BROOKLYN';

  function ShareCard({ variant: v = 'editorial', size = 'large' }) {
    const isLarge = size === 'large';
    const scale = isLarge ? 1 : 0.42;
    const px = (n) => Math.max(1, Math.round(n * scale));

    if (v === 'polaroid') {
      return (
        <div style={{
          position: 'relative', width: '100%', aspectRatio: '4/5',
          borderRadius: px(10),
          background: '#f6f0e2',
          boxShadow: isLarge
            ? `0 30px 60px -15px rgba(0,0,0,0.7), 0 0 40px rgba(${accentRgba},0.18)`
            : '0 8px 20px -6px rgba(0,0,0,0.6)',
          overflow: 'hidden',
          padding: px(28),
          boxSizing: 'border-box',
          display: 'flex', flexDirection: 'column',
        }}>
          <div style={{
            flex: '0 0 auto', width: '100%', aspectRatio: '1/1',
            borderRadius: px(4), overflow: 'hidden',
            background: '#0a0a0a',
            position: 'relative',
          }}>
            {photoData ? (
              <img src={photoData} alt="" style={{
                width: '100%', height: '100%', objectFit: 'contain', display: 'block',
              }} />
            ) : (
              <div style={{
                width: '100%', height: '100%',
                background: `linear-gradient(140deg, rgba(${accentRgba},0.35), rgba(0,0,0,0.85))`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{
                  fontSize: px(11), letterSpacing: px(2.6),
                  color: 'rgba(255,255,255,0.55)',
                  fontFamily: '"DM Sans", sans-serif',
                }}>NO FIT LOGGED</span>
              </div>
            )}
          </div>
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            paddingTop: px(14),
          }}>
            <div style={{
              fontSize: px(28),
              fontFamily: 'Cormorant Garamond, serif',
              fontStyle: 'italic', color: '#1a1612',
              lineHeight: 1.1, textAlign: 'center',
            }}>{dateLabel.split(',')[0]}</div>
            <div style={{
              marginTop: px(6),
              display: 'flex', alignItems: 'center', gap: px(7),
            }}>
              <img src={iconSrc} alt="" style={{
                width: px(18), height: px(18),
                borderRadius: px(4),
                objectFit: 'cover',
                boxShadow: '0 1px 3px rgba(0,0,0,0.18)',
              }} />
              <span style={{
                fontSize: px(11),
                letterSpacing: px(2.4),
                fontFamily: '"DM Sans", sans-serif', color: 'rgba(26,22,18,0.62)',
                textTransform: 'uppercase',
              }}>{`AĒVUM · #${fitNumber}`}</span>
            </div>
          </div>
        </div>
      );
    }

    // editorial — theme-tinted gradient frame, photo center, magazine-feel typography
    return (
      <div style={{
        position: 'relative', width: '100%', aspectRatio: '4/5',
        borderRadius: px(20),
        overflow: 'hidden',
        background: `linear-gradient(155deg, ${accentDeep} 0%, #0a0708 75%)`,
        boxShadow: isLarge
          ? `0 30px 60px -15px rgba(0,0,0,0.7), 0 0 40px rgba(${accentRgba},0.28)`
          : '0 8px 20px -6px rgba(0,0,0,0.6)',
      }}>
        {/* Top-left wordmark + app icon */}
        <div style={{
          position: 'absolute', top: px(26), left: px(30),
          display: 'flex', alignItems: 'center', gap: px(9),
        }}>
          <img src={iconSrc} alt="" style={{
            width: px(22), height: px(22),
            borderRadius: px(5),
            objectFit: 'cover',
            boxShadow: '0 2px 6px rgba(0,0,0,0.35)',
          }} />
          <span style={{
            fontSize: px(14), fontWeight: 600,
            letterSpacing: px(4),
            fontFamily: '"DM Sans", sans-serif', color: '#fff',
          }}>AĒVUM</span>
        </div>

        {/* Top-right fit code */}
        <div style={{
          position: 'absolute', top: px(28), right: px(30),
          fontSize: px(11),
          letterSpacing: px(2),
          fontFamily: '"DM Sans", sans-serif',
          color: 'rgba(255,255,255,0.55)',
        }}>{`FIT ${fitNumber}`}</div>

        {/* Photo plate — centered, slight accent glow */}
        <div style={{
          position: 'absolute',
          top: px(76), left: px(36), right: px(36), bottom: px(112),
          borderRadius: px(10), overflow: 'hidden',
          boxShadow: `0 ${px(20)}px ${px(40)}px -${px(10)}px rgba(0,0,0,0.6), inset 0 0 0 ${px(0.5)}px rgba(${accentRgba},0.4)`,
          background: '#0a0a0a',
        }}>
          {photoData ? (
            <img src={photoData} alt="" style={{
              width: '100%', height: '100%', objectFit: 'contain', display: 'block',
            }} />
          ) : (
            <div style={{
              width: '100%', height: '100%',
              background: `linear-gradient(155deg, rgba(${accentRgba},0.30), rgba(0,0,0,0.75))`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{
                fontSize: px(11), letterSpacing: px(2.6),
                color: 'rgba(255,255,255,0.55)',
                fontFamily: '"DM Sans", sans-serif',
              }}>NO FIT LOGGED</span>
            </div>
          )}
        </div>

        {/* Bottom-left date + weather */}
        <div style={{ position: 'absolute', bottom: px(28), left: px(30) }}>
          <div style={{
            fontSize: px(20), fontWeight: 400,
            color: '#fff',
            fontFamily: 'Cormorant Garamond, serif',
            fontStyle: 'italic', lineHeight: 1.1,
          }}>{dateLabel}</div>
          <div style={{
            fontSize: px(10),
            letterSpacing: px(1.2),
            color: 'rgba(255,255,255,0.55)',
            fontFamily: '"DM Sans", sans-serif',
            marginTop: px(5),
          }}>{weather}</div>
        </div>

        {/* Bottom-right fit number / stars */}
        <div style={{
          position: 'absolute', bottom: px(28), right: px(30), textAlign: 'right',
        }}>
          <div style={{
            fontSize: px(32), letterSpacing: px(-0.6),
            fontFamily: 'Cormorant Garamond, serif',
            fontStyle: 'italic',
            color: accent, lineHeight: 1,
          }}>{fitNumber}</div>
          <div style={{
            display: 'flex', gap: px(2), justifyContent: 'flex-end', marginTop: px(6),
          }}>
            {[1,2,3,4,5].map(n => (
              <svg key={n} width={px(10)} height={px(10)} viewBox="0 0 24 24"
                fill={n <= 4 ? accent : 'transparent'}
                stroke={n <= 4 ? accent : 'rgba(255,255,255,0.35)'}
                strokeWidth="1.8" strokeLinejoin="round">
                <path d="M12 2.5l3 6.4 7 .9-5.2 4.7L18 21l-6-3.5L6 21l1.2-6.5L2 9.8l7-.9z"/>
              </svg>
            ))}
          </div>
          <div style={{
            fontSize: px(9),
            letterSpacing: px(1),
            color: 'rgba(255,255,255,0.45)',
            fontFamily: '"DM Sans", sans-serif',
            marginTop: px(4),
          }}>{`OF ${fitTotal} · ${moodLabel.toUpperCase()}`}</div>
        </div>
      </div>
    );
  }

  /* ── Real share: render the selected card to a canvas, then use the Web
     Share API (file share) with a download fallback. Card is composed with
     plain Canvas2D so it works offline and on iOS Safari. ────────────────── */
  async function composeImage(v) {
    const W = 1080, H = 1350;
    const canvas = document.createElement('canvas');
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext('2d');

    const photoSrc = getSavedFitPhoto(todayKey);
    let photoImg = null;
    if (photoSrc) {
      photoImg = await new Promise((res) => {
        const i = new Image();
        i.onload = () => res(i);
        i.onerror = () => res(null);
        i.src = photoSrc;
      });
    }

    function drawContain(img, x, y, w, h) {
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(x, y, w, h);
      if (!img) return;
      const r = Math.min(w / img.width, h / img.height);
      const dw = img.width * r, dh = img.height * r;
      ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
    }

    function roundedRectPath(x, y, w, h, r) {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
    }

    // Brand icon — current themed app icon
    const iconImg = await new Promise((res) => {
      const i = new Image();
      i.onload = () => res(i);
      i.onerror = () => res(null);
      i.src = iconSrc;
    });
    function drawIcon(x, y, size, radius) {
      if (!iconImg) return;
      ctx.save();
      roundedRectPath(x, y, size, size, radius);
      ctx.clip();
      const r = Math.max(size / iconImg.width, size / iconImg.height);
      const dw = iconImg.width * r, dh = iconImg.height * r;
      ctx.drawImage(iconImg, x + (size - dw) / 2, y + (size - dh) / 2, dw, dh);
      ctx.restore();
    }

    if (v === 'polaroid') {
      // Cream paper
      ctx.fillStyle = '#f6f0e2';
      ctx.fillRect(0, 0, W, H);
      // Photo (square) at top
      const m = 76;
      const ps = W - m * 2;
      drawContain(photoImg, m, m, ps, ps);
      // Caption block — date on top
      ctx.fillStyle = '#1a1612';
      ctx.textAlign = 'center';
      ctx.font = 'italic 72px "Cormorant Garamond", Georgia, serif';
      ctx.fillText(dateLabel.split(',')[0], W / 2, m + ps + 130);
      // Icon + AĒVUM caption inline
      const subText = `AĒVUM · #${fitNumber}`;
      ctx.font = '500 28px "DM Sans", Helvetica, sans-serif';
      const subWidth = ctx.measureText(subText).width;
      const iconSize = 36, gap = 14;
      const rowWidth = iconSize + gap + subWidth;
      const rowX = (W - rowWidth) / 2;
      const rowY = m + ps + 158;
      drawIcon(rowX, rowY, iconSize, 9);
      ctx.fillStyle = 'rgba(26,22,18,0.62)';
      ctx.textAlign = 'left';
      ctx.fillText(subText, rowX + iconSize + gap, rowY + iconSize - 11);
    } else {
      // Editorial — dark accent gradient
      const grad = ctx.createLinearGradient(0, 0, W, H);
      grad.addColorStop(0, accentDeep);
      grad.addColorStop(1, '#0a0708');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // Icon + wordmark — branded mark in the corner
      drawIcon(80, 56, 56, 14);
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'left';
      ctx.font = '600 36px "DM Sans", Helvetica, sans-serif';
      ctx.fillText('AĒVUM', 80 + 56 + 18, 96);

      ctx.textAlign = 'right';
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      ctx.font = '500 28px "DM Sans", Helvetica, sans-serif';
      ctx.fillText(`FIT ${fitNumber}`, W - 80, 92);

      // Photo plate
      const px2 = 100, py = 200, pw = W - px2 * 2, ph = 820;
      drawContain(photoImg, px2, py, pw, ph);
      ctx.strokeStyle = `rgba(${accentRgba},0.4)`;
      ctx.lineWidth = 2;
      ctx.strokeRect(px2, py, pw, ph);

      // Bottom-left date + weather
      ctx.textAlign = 'left';
      ctx.fillStyle = '#fff';
      ctx.font = 'italic 52px "Cormorant Garamond", Georgia, serif';
      ctx.fillText(dateLabel, 80, H - 140);
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      ctx.font = '500 24px "DM Sans", Helvetica, sans-serif';
      ctx.fillText(weather, 80, H - 90);

      // Bottom-right fit number + meta
      ctx.textAlign = 'right';
      ctx.fillStyle = accent;
      ctx.font = 'italic 88px "Cormorant Garamond", Georgia, serif';
      ctx.fillText(fitNumber, W - 80, H - 110);
      ctx.fillStyle = 'rgba(255,255,255,0.45)';
      ctx.font = '500 22px "DM Sans", Helvetica, sans-serif';
      ctx.fillText(`OF ${fitTotal} · ${moodLabel.toUpperCase()}`, W - 80, H - 70);
    }

    return new Promise((res) => canvas.toBlob(res, 'image/jpeg', 0.92));
  }

  async function onShare() {
    if (sharing) return;
    setSharing(true);
    try {
      const blob = await composeImage(variant);
      if (!blob) throw new Error('compose failed');
      const file = new File([blob], `aevum-fit-${fitNumber}.jpg`, { type: 'image/jpeg' });

      // Web Share API on iOS Safari, Android Chrome, etc.
      if (typeof navigator !== 'undefined' && navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({ files: [file], title: `AĒVUM · FIT ${fitNumber}` });
          return;
        } catch (e) { /* user canceled — fall through */ }
      }

      // Fallback — download
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `aevum-fit-${fitNumber}.jpg`;
      document.body.appendChild(a); a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    } catch (e) {
      // No-op on error; keep the UI clean.
    } finally {
      setSharing(false);
    }
  }

  return (
    <div style={{
      width: '100%', height: '100%', position: 'relative', overflow: 'hidden',
      background: bgColor(),
      fontFamily: 'DM Sans, -apple-system, system-ui, sans-serif',
      color: fgColor(),
    }}>
      <div style={{
        position: 'absolute', top: -180, left: '50%', transform: 'translateX(-50%)',
        width: 480, height: 480, borderRadius: '50%',
        background: `radial-gradient(circle, rgba(${accentRgba},0.20) 0%, transparent 60%)`,
        filter: 'blur(40px)', pointerEvents: 'none',
      }} />
      <LiquidMesh seed={8} intensity={1} />
      <StatusBar />

      <div style={{ position: 'relative', zIndex: 2, padding: 'calc(36px + var(--archive-safe-top, 54px)) 24px calc(40px + var(--archive-safe-bottom, 0px))', height: '100%', overflow: 'auto', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
          <div className="liquid-glass archive-pressable" onClick={() => window.__archiveGo && window.__archiveGo('today')} style={{
            width: 36, height: 36, borderRadius: 18,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 6l12 12M18 6L6 18"/>
            </svg>
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-primary)', letterSpacing: -0.40, fontFamily: '"DM Sans", sans-serif' }}>
            SHARE CARD
          </div>
          <div style={{ width: 36 }} />
        </div>

        <div style={{ marginBottom: 26 }}>
          <ShareCard variant={variant} size="large" />
        </div>

        <div style={{ marginBottom: 22 }}>
          <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', letterSpacing: -0.4, fontFamily: '"DM Sans", sans-serif', marginBottom: 12 }}>
            STYLE
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            {/* Editorial */}
            <div onClick={() => setVariant('editorial')}
              className="archive-pressable"
              style={{
                flex: 1, cursor: 'pointer',
                padding: 10, borderRadius: 16,
                background: variant === 'editorial' ? `rgba(${accentRgba},0.14)` : 'rgba(255,255,255,0.03)',
                boxShadow: variant === 'editorial'
                  ? `inset 0 0 0 1px rgba(${accentRgba},0.55)`
                  : 'inset 0 0 0 0.5px rgba(255,255,255,0.06)',
              }}>
              <div style={{ width: '70%', margin: '0 auto' }}>
                <ShareCard variant="editorial" size="small" />
              </div>
              <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 14, fontWeight: 500 }}>Editorial</span>
                {variant === 'editorial' && (
                  <div style={{
                    width: 16, height: 16, borderRadius: 8, background: accent,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12l5 5L20 7"/>
                    </svg>
                  </div>
                )}
              </div>
            </div>

            {/* Polaroid */}
            <div onClick={() => setVariant('polaroid')}
              className="archive-pressable"
              style={{
                flex: 1, cursor: 'pointer', position: 'relative',
                padding: 10, borderRadius: 16,
                background: variant === 'polaroid' ? `rgba(${accentRgba},0.14)` : 'rgba(255,255,255,0.03)',
                boxShadow: variant === 'polaroid'
                  ? `inset 0 0 0 1px rgba(${accentRgba},0.55)`
                  : 'inset 0 0 0 0.5px rgba(255,255,255,0.06)',
              }}>
              <div style={{ width: '70%', margin: '0 auto' }}>
                <ShareCard variant="polaroid" size="small" />
              </div>
              <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 14, fontWeight: 500 }}>Polaroid</span>
                {variant === 'polaroid' && (
                  <div style={{
                    width: 16, height: 16, borderRadius: 8, background: accent,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12l5 5L20 7"/>
                    </svg>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={onShare}
          disabled={sharing}
          className="archive-pressable"
          style={{
            width: '100%', border: 'none', cursor: sharing ? 'wait' : 'pointer',
            padding: '15px 22px', borderRadius: 100,
            background: `linear-gradient(135deg, ${accent} 0%, ${accentHot} 100%)`,
            color: '#0a0a0a', fontSize: 15, fontWeight: 600,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            opacity: sharing ? 0.7 : 1,
            boxShadow: `0 10px 28px -6px rgba(${accentRgba}, 0.55)`,
          }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7M16 6l-4-4-4 4M12 2v14"/>
          </svg>
          {sharing ? 'Preparing…' : 'Share fit'}
        </button>

        <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-secondary)', marginTop: 12 }}>
          Saves to camera roll · share to anywhere
        </div>
      </div>
    </div>
  );
}
