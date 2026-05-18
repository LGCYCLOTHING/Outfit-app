import React from 'react';
import { useTheme, bgColor, fgColor, StatusBar, getActiveIconId } from '../lib/shared.jsx';
import LiquidMesh from '../lib/liquid-mesh.jsx';
import {
  CATEGORIES, UNLOCK_THRESHOLD,
  getTotalFitCount, computeStyleDNA, describeStyle,
} from '../lib/styleDNA.js';

function Donut({ segments, size = 220, stroke = 28 }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: 'block' }}>
      {/* Track */}
      <circle cx={size/2} cy={size/2} r={r}
        stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} fill="none" />
      {segments.map((seg, i) => {
        const dash = (seg.pct / 100) * c;
        const el = (
          <circle key={seg.id}
            cx={size/2} cy={size/2} r={r}
            stroke={seg.color} strokeWidth={stroke} fill="none"
            strokeDasharray={`${dash} ${c - dash}`}
            strokeDashoffset={-offset}
            transform={`rotate(-90 ${size/2} ${size/2})`}
            style={{
              transition: 'stroke-dasharray .8s cubic-bezier(.34,1.56,.64,1)',
            }}
          />
        );
        offset += dash;
        return el;
      })}
    </svg>
  );
}

export default function ScreenStyleDNA() {
  const t = useTheme();
  const accent = t.light;
  const accentHot = t.hot;
  const accentRgba = t.softRgba;

  const totalFits = getTotalFitCount();
  const unlocked = totalFits >= UNLOCK_THRESHOLD;
  const result = unlocked ? computeStyleDNA() : null;

  const goBack = () => {
    const prev = (typeof window !== 'undefined' && window.__archivePrevScreen) || 'you';
    window.__archiveGo && window.__archiveGo(prev);
  };

  // Share — render the styled card to canvas (1080x1350) and use Web Share API.
  const [sharing, setSharing] = React.useState(false);
  const onShare = async () => {
    if (!unlocked || sharing) return;
    setSharing(true);
    try {
      const blob = await composeStyleCard(result, accent, accentRgba);
      if (!blob) throw new Error('compose-failed');
      const file = new File([blob], 'aevum-style-dna.jpg', { type: 'image/jpeg' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try { await navigator.share({ files: [file], title: 'My Style DNA · AĒVUM' }); return; }
        catch (e) {}
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'aevum-style-dna.jpg';
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 4000);
    } catch (e) {} finally { setSharing(false); }
  };

  return (
    <div style={{
      width: '100%', height: '100%', position: 'relative', overflow: 'hidden',
      background: bgColor(),
      fontFamily: 'DM Sans, -apple-system, system-ui, sans-serif',
      color: fgColor(),
    }}>
      <LiquidMesh seed={6} intensity={0.9} />
      <StatusBar />
      <div style={{
        position: 'relative', zIndex: 2,
        padding: 'calc(16px + var(--archive-safe-top, 54px)) 22px calc(40px + var(--archive-safe-bottom, 0px))',
        height: '100%', overflow: 'auto', boxSizing: 'border-box',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 6,
        }}>
          <div onClick={goBack} className="archive-pressable" style={{
            width: 36, height: 36, borderRadius: 18,
            background: 'rgba(255,255,255,0.06)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 6l-6 6 6 6"/>
            </svg>
          </div>
          <div style={{
            fontSize: 11, color: '#fff', fontWeight: 600, letterSpacing: 2.4,
          }}>YOUR STYLE DNA</div>
          <div onClick={unlocked ? onShare : undefined}
            className={unlocked ? 'archive-pressable' : ''}
            style={{
              width: 36, height: 36, borderRadius: 18,
              background: unlocked ? 'rgba(255,255,255,0.06)' : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: unlocked ? 'pointer' : 'default',
              opacity: unlocked ? 1 : 0.25,
            }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7M16 6l-4-4-4 4M12 2v14"/>
            </svg>
          </div>
        </div>
        <div style={{
          textAlign: 'center', fontSize: 10.5, color: 'rgba(255,255,255,0.5)',
          letterSpacing: 2, fontWeight: 500, marginBottom: 24,
        }}>
          {unlocked ? `BASED ON ${totalFits} LOGGED FITS` : `LOCKED · ${totalFits}/${UNLOCK_THRESHOLD} FITS`}
        </div>

        {!unlocked ? (
          // Locked state
          <div style={{
            padding: '28px 22px', borderRadius: 22,
            background: 'rgba(255,240,220,0.04)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,240,220,0.07)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.22)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: 28,
              background: 'rgba(255,255,255,0.06)',
              boxShadow: 'inset 0 0 0 0.5px rgba(255,255,255,0.10)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <rect x="5" y="11" width="14" height="10" rx="2"/>
                <path d="M8 11V8a4 4 0 0 1 8 0v3"/>
              </svg>
            </div>
            <div className="h-display" style={{
              fontSize: 26, color: '#fff', textAlign: 'center', lineHeight: 1.15,
              maxWidth: 260,
            }}>
              Log <em>{UNLOCK_THRESHOLD} fits</em> to unlock your Style DNA
            </div>
            <div style={{
              fontSize: 12.5, color: 'var(--text-secondary)', textAlign: 'center',
              maxWidth: 280, lineHeight: 1.5,
            }}>
              We need a baseline of logged fits to map your style — keep going.
            </div>
            <div style={{
              width: '100%', maxWidth: 280, marginTop: 10,
              padding: '8px 14px', borderRadius: 12,
              background: 'rgba(255,255,255,0.04)',
              boxShadow: 'inset 0 0 0 0.5px rgba(255,255,255,0.08)',
            }}>
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                fontSize: 11, color: 'var(--text-secondary)', letterSpacing: 0.4, marginBottom: 6,
              }}>
                <span>PROGRESS</span><span>{totalFits} / {UNLOCK_THRESHOLD}</span>
              </div>
              <div style={{
                height: 4, borderRadius: 2,
                background: 'rgba(255,255,255,0.08)', overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%',
                  width: `${Math.min(100, (totalFits / UNLOCK_THRESHOLD) * 100)}%`,
                  background: `linear-gradient(90deg, ${accent} 0%, ${accentHot} 100%)`,
                  boxShadow: `0 0 12px -2px rgba(${accentRgba},0.55)`,
                  transition: 'width .5s ease',
                }} />
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Donut chart + primary callout */}
            <div style={{
              padding: '24px 18px 22px', borderRadius: 22,
              background: 'rgba(255,240,220,0.04)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,240,220,0.07)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.22)',
              marginBottom: 16, display: 'flex', flexDirection: 'column', alignItems: 'center',
            }}>
              <div style={{ position: 'relative', width: 220, height: 220 }}>
                <Donut segments={result.rounded} />
                <div style={{
                  position: 'absolute', inset: 0,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  pointerEvents: 'none',
                }}>
                  <div style={{
                    fontSize: 11, color: 'rgba(255,255,255,0.55)',
                    letterSpacing: 2, fontWeight: 500, marginBottom: 6,
                  }}>PRIMARY</div>
                  <div style={{
                    fontSize: 22, fontWeight: 600, color: '#fff', letterSpacing: -0.3,
                    fontFamily: '"DM Sans", sans-serif', textAlign: 'center', padding: '0 12px',
                  }}>{result.primary.label}</div>
                  <div style={{
                    marginTop: 4, fontSize: 14, color: result.primary.color, fontWeight: 600,
                  }}>{result.primary.pct}%</div>
                </div>
              </div>
            </div>

            {/* Category rows */}
            <div style={{
              padding: '14px 16px', borderRadius: 18,
              background: 'rgba(255,240,220,0.04)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,240,220,0.07)',
              marginBottom: 16,
              display: 'flex', flexDirection: 'column', gap: 12,
            }}>
              {result.rounded.map(cat => (
                <div key={cat.id}>
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    marginBottom: 6,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{
                        width: 8, height: 8, borderRadius: 4, background: cat.color,
                      }} />
                      <span style={{
                        fontSize: 13.5, fontWeight: 500, color: '#fff', letterSpacing: -0.1,
                      }}>{cat.label}</span>
                    </div>
                    <span style={{
                      fontSize: 12.5, color: 'rgba(255,255,255,0.65)', fontWeight: 500,
                    }}>{cat.pct}%</span>
                  </div>
                  <div style={{
                    height: 3, borderRadius: 2,
                    background: 'rgba(255,255,255,0.08)', overflow: 'hidden',
                  }}>
                    <div style={{
                      height: '100%', width: `${cat.pct}%`,
                      background: cat.color, opacity: 0.85,
                      transition: 'width .5s ease',
                    }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Generated description */}
            <div style={{
              padding: '16px 18px', borderRadius: 18,
              background: `linear-gradient(135deg, rgba(${accentRgba},0.10) 0%, rgba(0,0,0,0.10) 100%)`,
              border: `1px solid rgba(${accentRgba},0.25)`,
              marginBottom: 18,
            }}>
              <div style={{
                fontSize: 9.5, color: accent, letterSpacing: 1.5,
                fontWeight: 500, marginBottom: 6,
              }}>SIGNATURE</div>
              <div style={{
                fontSize: 15, lineHeight: 1.5, color: '#fff', letterSpacing: -0.1,
              }}>{describeStyle(result.primary, result.secondary)}</div>
            </div>

            {/* Share CTA */}
            <button onClick={onShare} disabled={sharing}
              className="archive-pressable"
              style={{
                width: '100%', padding: '14px 22px', borderRadius: 100,
                border: 'none', cursor: sharing ? 'wait' : 'pointer',
                background: `linear-gradient(135deg, ${accent} 0%, ${accentHot} 100%)`,
                color: '#0a0a0a', fontSize: 14, fontWeight: 600,
                letterSpacing: -0.1, fontFamily: 'inherit',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                boxShadow: `0 10px 28px -6px rgba(${accentRgba}, 0.55)`,
                opacity: sharing ? 0.7 : 1,
              }}>
              {sharing ? 'Preparing…' : 'Share your Style DNA'}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7M16 6l-4-4-4 4M12 2v14"/>
              </svg>
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Shareable card composition (canvas → blob) ──────────────────────────
async function composeStyleCard(result, accent, accentRgba) {
  const W = 1080, H = 1350;
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');
  // BG
  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, '#1a1612');
  grad.addColorStop(1, '#0a0708');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Wordmark
  ctx.fillStyle = '#fff';
  ctx.font = '600 38px "DM Sans", Helvetica, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('AĒVUM', 70, 100);
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.font = '500 26px "DM Sans", Helvetica, sans-serif';
  ctx.fillText('MY STYLE DNA', 70, 142);

  // Donut
  const cx = W / 2, cy = 560, R = 220, stroke = 60;
  // Background ring
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, Math.PI * 2);
  ctx.lineWidth = stroke;
  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.stroke();
  // Segments
  let start = -Math.PI / 2;
  for (const seg of result.rounded) {
    const arc = (seg.pct / 100) * Math.PI * 2;
    ctx.beginPath();
    ctx.arc(cx, cy, R, start, start + arc);
    ctx.lineWidth = stroke;
    ctx.strokeStyle = seg.color;
    ctx.stroke();
    start += arc;
  }
  // Center label
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.font = '500 22px "DM Sans", Helvetica, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('PRIMARY', cx, cy - 30);
  ctx.fillStyle = '#fff';
  ctx.font = '600 56px "DM Sans", Helvetica, sans-serif';
  ctx.fillText(result.primary.label, cx, cy + 20);
  ctx.fillStyle = result.primary.color;
  ctx.font = '600 36px "DM Sans", Helvetica, sans-serif';
  ctx.fillText(`${result.primary.pct}%`, cx, cy + 70);

  // Description (wrap)
  ctx.fillStyle = 'rgba(255,255,255,0.92)';
  ctx.font = 'italic 30px "Cormorant Garamond", Georgia, serif';
  ctx.textAlign = 'center';
  const desc = (function describe(p, s) {
    const map = {
      minimal: 'You favor clean, unfussy combinations that let quality speak for itself.',
      streetwear: 'Your style is expressive and culture-forward. You dress for the moment.',
      smartcasual: 'You strike the balance between polished and relaxed with natural ease.',
      formal: 'You default to structure and intention. Every outfit is considered.',
      expressive: 'Your wardrobe is a mood board. No two fits tell the same story.',
    };
    const base = map[p.id] || '';
    if (!s || s.pct < 10) return base;
    return `${base} With a ${s.label} influence.`;
  })(result.primary, result.secondary);
  // Word wrap
  const words = desc.split(' ');
  const maxWidth = W - 160;
  let line = ''; let y = 920;
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxWidth) {
      ctx.fillText(line, cx, y);
      y += 42;
      line = w;
    } else {
      line = test;
    }
  }
  if (line) ctx.fillText(line, cx, y);

  // Footer
  let totalFitsLabel = '';
  try { totalFitsLabel = `${result.totalFits} fits logged`; } catch (e) {}
  ctx.fillStyle = 'rgba(255,255,255,0.45)';
  ctx.font = '500 24px "DM Sans", Helvetica, sans-serif';
  ctx.fillText(`@aevum · ${totalFitsLabel}`, cx, H - 80);

  return new Promise(res => canvas.toBlob(res, 'image/jpeg', 0.92));
}
