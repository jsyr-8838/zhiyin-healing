'use client';

import React, { useState, useEffect, useRef } from 'react';

/**
 * CSS-based essential oil bottle — 1:1 faithful reproduction from 色彩能量精油疗愈 reference project.
 * Renders a realistic glass bottle with two-layer liquid, chrome cap, glass refractions,
 * and hover spring animation — entirely with CSS divs, no Three.js/WebGL needed.
 */

export interface EssentialOilBottleProps {
  /** Hex color for upper liquid layer (e.g., '#9B59B6') */
  upperColor: string;
  /** Hex color for lower liquid layer (e.g., '#00BCD4') */
  lowerColor: string;
  /** Chinese name of upper color (e.g., '紫色') */
  upperColorName?: string;
  /** Chinese name of lower color (e.g., '青色') */
  lowerColorName?: string;
  /** Oil name (displayed below bottle) */
  name?: string;
  /** Meridian name (displayed below bottle) */
  meridian?: string;
  /** Wuxing element character (木/火/土/金/水) */
  wuxing?: string;
  /** Bottle size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Click handler */
  onClick?: () => void;
  /** Enable wave animation on liquid surface */
  animate?: boolean;
  /** Show name/labels below bottle */
  showLabels?: boolean;
}

const sizeMap = {
  sm: { width: 56, height: 112, fontSize: 10, labelFs: 8 },
  md: { width: 72, height: 148, fontSize: 12, labelFs: 9 },
  lg: { width: 92, height: 188, fontSize: 14, labelFs: 10 },
};

const wuxingIcons: Record<string, string> = {
  '金': '⚔',
  '木': '🌿',
  '水': '💧',
  '火': '🔥',
  '土': '🏔',
};

const hexToRgb = (hex: string) => {
  const h = hex.startsWith('#') ? hex : '#C8A880';
  const r = parseInt(h.slice(1, 3), 16) || 200;
  const g = parseInt(h.slice(3, 5), 16) || 168;
  const b = parseInt(h.slice(5, 7), 16) || 128;
  return { r, g, b };
};

export default function EssentialOilBottle({
  upperColor,
  lowerColor,
  upperColorName,
  lowerColorName,
  name,
  meridian,
  wuxing,
  size = 'md',
  onClick,
  animate = false,
  showLabels = true,
}: EssentialOilBottleProps) {
  const [hovered, setHovered] = useState(false);
  const s = sizeMap[size];
  const [scale, setScale] = useState(1);
  const [glowIntensity, setGlowIntensity] = useState(0);

  useEffect(() => {
    const targetScale = hovered ? 1.06 : 1;
    const targetGlow = hovered ? 1 : 0;
    const EPS = 0.001;
    let raf: number;
    let curScale = 1;
    let curGlow = 0;
    const tick = () => {
      const ns = curScale + (targetScale - curScale) * 0.12;
      const ng = curGlow + (targetGlow - curGlow) * 0.1;
      curScale = ns;
      curGlow = ng;
      setScale(ns);
      setGlowIntensity(ng);
      if (Math.abs(ns - targetScale) > EPS || Math.abs(ng - targetGlow) > EPS) {
        raf = requestAnimationFrame(tick);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [hovered]);

  const upperRgb = hexToRgb(upperColor);
  const lowerRgb = hexToRgb(lowerColor);

  const bottleW = s.width;
  const bottleH = s.height;
  const capH = Math.round(bottleH * 0.17);
  const capW = Math.round(bottleW * 0.5);
  const neckH = Math.round(bottleH * 0.06);
  const neckW = Math.round(bottleW * 0.52);
  const shoulderH = Math.round(bottleH * 0.06);
  const bodyTop = capH + neckH + shoulderH;
  const bodyH = bottleH - bodyTop;
  const bodyR = Math.round(bottleW * 0.1);
  const cornerR = Math.round(bottleW * 0.08);

  return (
    <div
      className="flex flex-col items-center cursor-pointer select-none"
      style={{ perspective: 600 }}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Subtle golden glow */}
      <div style={{
        position: 'absolute',
        top: '40%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: bottleW * 2,
        height: bottleW * 2,
        borderRadius: '50%',
        background: `radial-gradient(ellipse, rgba(${upperRgb.r},${upperRgb.g},${upperRgb.b},${0.06 * glowIntensity}), rgba(${lowerRgb.r},${lowerRgb.g},${lowerRgb.b},${0.04 * glowIntensity}), transparent 70%)`,
        filter: `blur(${6 + glowIntensity * 8}px)`,
        pointerEvents: 'none',
        opacity: 0.5 + glowIntensity * 0.5,
        zIndex: 0,
      }} />

      <div style={{
        transformStyle: 'preserve-3d',
        transform: `scale(${scale})`,
        position: 'relative',
        width: bottleW,
        height: bottleH,
        zIndex: 1,
      }}>
        {/* Drop shadow */}
        <div style={{
          position: 'absolute',
          bottom: -3,
          left: '50%',
          transform: 'translateX(-50%)',
          width: bottleW * 0.8,
          height: 6,
          borderRadius: '50%',
          background: 'rgba(139,97,55,0.08)',
          filter: 'blur(4px)',
          zIndex: 0,
        }} />

        {/* === CAP === */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: capW,
          height: capH,
          borderRadius: `${Math.max(2, capH * 0.18)}px ${Math.max(2, capH * 0.18)}px 1px 1px`,
          background: `linear-gradient(90deg,
            #C0C0C0 0%,
            #D8D8D8 10%,
            #F0F0F0 20%,
            #E8E8E8 30%,
            #A8A8A8 42%,
            #888888 47%,
            #7A7A7A 50%,
            #888888 53%,
            #A8A8A8 58%,
            #E8E8E8 70%,
            #F0F0F0 80%,
            #D8D8D8 90%,
            #C0C0C0 100%
          )`,
          boxShadow: `
            0 1px 2px rgba(0,0,0,0.12),
            inset 0 1px 0 rgba(255,255,255,0.9),
            inset 0 -1px 0 rgba(0,0,0,0.08),
            inset 1px 0 0 rgba(255,255,255,0.5),
            inset -1px 0 0 rgba(255,255,255,0.5)
          `,
          zIndex: 5,
        }}>
          {/* Top edge highlight */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: capW * 0.15,
            right: capW * 0.15,
            height: 1,
            background: 'rgba(255,255,255,0.95)',
            borderRadius: 1,
          }} />
          {/* Bottom edge highlight */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: capW * 0.1,
            right: capW * 0.1,
            height: 0.5,
            background: 'rgba(255,255,255,0.5)',
            borderRadius: 1,
          }} />
          {/* Vertical dark reflection band in center */}
          <div style={{
            position: 'absolute',
            top: '10%',
            bottom: '10%',
            left: '43%',
            width: '14%',
            background: 'linear-gradient(90deg, transparent, rgba(60,60,60,0.25) 30%, rgba(60,60,60,0.3) 50%, rgba(60,60,60,0.25) 70%, transparent)',
            borderRadius: 2,
          }} />
        </div>

        {/* === NECK === */}
        <div style={{
          position: 'absolute',
          top: capH - 1,
          left: '50%',
          transform: 'translateX(-50%)',
          width: neckW,
          height: neckH + 1,
          background: `linear-gradient(90deg,
            rgba(200,215,225,0.25) 0%,
            rgba(240,245,250,0.12) 25%,
            rgba(255,255,255,0.08) 50%,
            rgba(240,245,250,0.12) 75%,
            rgba(200,215,225,0.25) 100%
          )`,
          borderLeft: '1px solid rgba(200,215,230,0.25)',
          borderRight: '1px solid rgba(200,215,230,0.25)',
          borderBottom: 'none',
          zIndex: 4,
        }}>
          {/* Neck left edge highlight */}
          <div style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            width: 1,
            background: 'rgba(255,255,255,0.5)',
          }} />
          {/* Neck right edge highlight */}
          <div style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            right: 0,
            width: 1,
            background: 'rgba(255,255,255,0.35)',
          }} />
        </div>

        {/* === SHOULDER (taper from neck to body) === */}
        <div style={{
          position: 'absolute',
          top: capH + neckH - 1,
          left: '50%',
          transform: 'translateX(-50%)',
          width: bottleW,
          height: shoulderH + 2,
          background: `linear-gradient(90deg,
            rgba(200,215,225,0.2) 0%,
            rgba(240,245,250,0.08) 30%,
            rgba(255,255,255,0.05) 50%,
            rgba(240,245,250,0.08) 70%,
            rgba(200,215,225,0.2) 100%
          )`,
          clipPath: `polygon(30% 0%, 70% 0%, 100% 100%, 0% 100%)`,
          zIndex: 3,
        }}>
          {/* Shoulder glass edge highlights */}
          <div style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: '30%',
            width: 1,
            background: 'linear-gradient(to bottom, rgba(255,255,255,0.45), rgba(255,255,255,0.15))',
            transformOrigin: 'top left',
            transform: 'skewX(12deg)',
          }} />
          <div style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            right: '30%',
            width: 1,
            background: 'linear-gradient(to bottom, rgba(255,255,255,0.3), rgba(255,255,255,0.1))',
            transformOrigin: 'top right',
            transform: 'skewX(-12deg)',
          }} />
        </div>

        {/* === BOTTLE BODY === */}
        <div style={{
          position: 'absolute',
          top: bodyTop - 1,
          left: '50%',
          transform: 'translateX(-50%)',
          width: bottleW,
          height: bodyH + 1,
          borderRadius: `${cornerR}px ${cornerR}px ${bodyR}px ${bodyR}px`,
          background: `linear-gradient(90deg,
            rgba(190,210,225,0.22) 0%,
            rgba(230,240,248,0.08) 12%,
            rgba(255,255,255,0.03) 30%,
            rgba(255,255,255,0.03) 70%,
            rgba(230,240,248,0.08) 88%,
            rgba(190,210,225,0.22) 100%
          )`,
          border: '1px solid rgba(190,210,225,0.2)',
          boxShadow: `
            0 2px 8px rgba(139,97,55,0.06),
            inset 0 0 ${4 + glowIntensity * 8}px rgba(${upperRgb.r},${upperRgb.g},${upperRgb.b},${0.04 + glowIntensity * 0.08})
          `,
          overflow: 'hidden',
          zIndex: 2,
        }}>
          {/* Four vertical edge highlights */}
          <div style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: '7%',
            width: 1,
            background: 'linear-gradient(to bottom, rgba(255,255,255,0.55), rgba(255,255,255,0.12) 40%, rgba(255,255,255,0.08) 60%, rgba(255,255,255,0.35))',
            pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: '24%',
            width: 1,
            background: 'linear-gradient(to bottom, rgba(255,255,255,0.25), rgba(255,255,255,0.04) 40%, rgba(255,255,255,0.03) 60%, rgba(255,255,255,0.15))',
            pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: '75%',
            width: 1,
            background: 'linear-gradient(to bottom, rgba(255,255,255,0.2), rgba(255,255,255,0.03) 40%, rgba(255,255,255,0.02) 60%, rgba(255,255,255,0.12))',
            pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: '91%',
            width: 1,
            background: 'linear-gradient(to bottom, rgba(255,255,255,0.45), rgba(255,255,255,0.08) 40%, rgba(255,255,255,0.06) 60%, rgba(255,255,255,0.25))',
            pointerEvents: 'none',
          }} />

          {/* Upper liquid */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 1,
            right: 1,
            height: '50%',
            background: `linear-gradient(180deg,
              ${upperColor}e6 0%,
              ${upperColor}d9 50%,
              ${upperColor}cc 100%
            )`,
            opacity: 0.9,
          }}>
            {/* Upper liquid surface highlight */}
            <div style={{
              position: 'absolute',
              top: 2,
              left: '15%',
              right: '15%',
              height: 1,
              background: 'rgba(255,255,255,0.6)',
              borderRadius: 1,
            }} />
            {/* Upper liquid top refraction shimmer */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '30%',
              background: 'linear-gradient(to bottom, rgba(255,255,255,0.1), transparent)',
              pointerEvents: 'none',
            }} />
          </div>

          {/* Lower liquid */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 1,
            right: 1,
            height: '50%',
            background: `linear-gradient(180deg,
              ${lowerColor}cc 0%,
              ${lowerColor}d9 50%,
              ${lowerColor}e6 100%
            )`,
            opacity: 0.9,
          }}>
            {/* Lower liquid bottom glass refraction tint */}
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '25%',
              background: `linear-gradient(to top, rgba(${lowerRgb.r},${lowerRgb.g},${lowerRgb.b},0.15), transparent)`,
              pointerEvents: 'none',
            }} />
          </div>

          {/* Interface line + white highlight */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: 1,
            right: 1,
            height: 1,
            transform: 'translateY(-0.5px)',
            background: `linear-gradient(90deg,
              rgba(${upperRgb.r},${upperRgb.g},${upperRgb.b},0.4),
              rgba(${lowerRgb.r},${lowerRgb.g},${lowerRgb.b},0.5) 50%,
              rgba(${upperRgb.r},${upperRgb.g},${upperRgb.b},0.4)
            )`,
            pointerEvents: 'none',
            zIndex: 2,
          }}>
            {/* White highlight on top edge of interface */}
            <div style={{
              position: 'absolute',
              top: -1,
              left: '5%',
              right: '5%',
              height: 1,
              background: 'linear-gradient(90deg, transparent 5%, rgba(255,255,255,0.55) 30%, rgba(255,255,255,0.7) 50%, rgba(255,255,255,0.55) 70%, transparent 95%)',
            }} />
          </div>

          {/* Wave overlay (only visible when animate) */}
          {animate && (
            <div
              className="bottle-wave-line"
              style={{
                position: 'absolute',
                top: '50%',
                left: 1,
                right: 1,
                height: 3,
                transform: 'translateY(-1.5px)',
                background: `linear-gradient(90deg,
                  transparent 0%,
                  rgba(${upperRgb.r},${upperRgb.g},${upperRgb.b},0.25) 15%,
                  rgba(255,255,255,0.4) 50%,
                  rgba(${lowerRgb.r},${lowerRgb.g},${lowerRgb.b},0.25) 85%,
                  transparent 100%
                )`,
                pointerEvents: 'none',
                zIndex: 3,
              }}
            />
          )}

          {/* Glass body left interior edge refraction */}
          <div style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            width: 2,
            background: 'linear-gradient(to right, rgba(180,200,220,0.18), transparent)',
            pointerEvents: 'none',
          }} />
          {/* Glass body right interior edge refraction */}
          <div style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            right: 0,
            width: 2,
            background: 'linear-gradient(to left, rgba(180,200,220,0.12), transparent)',
            pointerEvents: 'none',
          }} />

          {/* Bottom edge color refraction (liquid light through glass) */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: '10%',
            right: '10%',
            height: 3,
            background: `linear-gradient(to top, rgba(${lowerRgb.r},${lowerRgb.g},${lowerRgb.b},0.2), transparent)`,
            borderRadius: '0 0 2px 2px',
            pointerEvents: 'none',
            zIndex: 4,
          }} />

          {/* Concave side shadows (bottle side curve) */}
          <div style={{
            position: 'absolute',
            top: '15%',
            bottom: '10%',
            left: 0,
            width: '4%',
            background: 'linear-gradient(to right, rgba(0,0,0,0.04), transparent)',
            pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute',
            top: '15%',
            bottom: '10%',
            right: 0,
            width: '4%',
            background: 'linear-gradient(to left, rgba(0,0,0,0.03), transparent)',
            pointerEvents: 'none',
          }} />

          {/* Color name labels inside bottle */}
          {upperColorName && (
            <div style={{
              position: 'absolute',
              top: '18%',
              left: '50%',
              transform: 'translateX(-50%)',
              fontSize: Math.max(6, s.labelFs - 2),
              color: 'rgba(61,43,31,0.85)',
              textShadow: '0 0 3px rgba(255,255,255,0.7), 0 1px 2px rgba(255,255,255,0.5)',
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
              zIndex: 5,
              fontWeight: 500,
            }}>
              {upperColorName}
            </div>
          )}
          {lowerColorName && (
            <div style={{
              position: 'absolute',
              top: '68%',
              left: '50%',
              transform: 'translateX(-50%)',
              fontSize: Math.max(6, s.labelFs - 2),
              color: 'rgba(61,43,31,0.85)',
              textShadow: '0 0 3px rgba(255,255,255,0.7), 0 1px 2px rgba(255,255,255,0.5)',
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
              zIndex: 5,
              fontWeight: 500,
            }}>
              {lowerColorName}
            </div>
          )}
        </div>
      </div>

      {/* Name & labels below bottle */}
      {showLabels && name && (
        <div className="mt-2 text-center" style={{ maxWidth: bottleW + 20 }}>
          <div style={{
            fontSize: s.fontSize,
            color: 'rgba(61,43,31,0.9)',
            fontWeight: 600,
            lineHeight: 1.3,
          }}>
            {name}
          </div>
          <div className="flex items-center justify-center gap-1 mt-0.5">
            {wuxing && (
              <span style={{
                fontSize: s.labelFs,
                color: '#B8845A',
                background: 'rgba(184,132,90,0.12)',
                padding: '1px 6px',
                borderRadius: 4,
              }}>
                {wuxingIcons[wuxing] || ''}{wuxing}
              </span>
            )}
            {meridian && (
              <span style={{
                fontSize: s.labelFs,
                color: '#5BA88C',
                background: 'rgba(91,168,140,0.08)',
                padding: '1px 6px',
                borderRadius: 4,
              }}>
                {meridian}
              </span>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes bottleWaveLine {
          0% {
            transform: translateY(-1.5px) scaleX(1);
            opacity: 1;
          }
          25% {
            transform: translateY(-2px) scaleX(0.96);
            opacity: 0.8;
          }
          50% {
            transform: translateY(-1px) scaleX(1.02);
            opacity: 1;
          }
          75% {
            transform: translateY(-1.8px) scaleX(0.98);
            opacity: 0.9;
          }
          100% {
            transform: translateY(-1.5px) scaleX(1);
            opacity: 1;
          }
        }
        .bottle-wave-line {
          animation: bottleWaveLine 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
