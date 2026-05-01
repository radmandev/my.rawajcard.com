import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const PARTICLES = [
  { x: 4, y: 88, s: 2, d: 13, l: -2 },
  { x: 8, y: 72, s: 1, d: 11, l: -6 },
  { x: 13, y: 94, s: 2, d: 15, l: -4 },
  { x: 18, y: 79, s: 1, d: 12, l: -1 },
  { x: 22, y: 90, s: 2, d: 14, l: -8 },
  { x: 27, y: 84, s: 1, d: 10, l: -3 },
  { x: 31, y: 96, s: 2, d: 16, l: -7 },
  { x: 36, y: 75, s: 1, d: 13, l: -5 },
  { x: 40, y: 89, s: 2, d: 11, l: -2 },
  { x: 44, y: 82, s: 1, d: 12, l: -9 },
  { x: 49, y: 95, s: 2, d: 14, l: -1 },
  { x: 54, y: 78, s: 1, d: 15, l: -6 },
  { x: 58, y: 92, s: 2, d: 13, l: -4 },
  { x: 62, y: 85, s: 1, d: 10, l: -8 },
  { x: 67, y: 98, s: 2, d: 16, l: -3 },
  { x: 71, y: 80, s: 1, d: 11, l: -5 },
  { x: 76, y: 93, s: 2, d: 13, l: -7 },
  { x: 81, y: 86, s: 1, d: 12, l: -2 },
  { x: 85, y: 97, s: 2, d: 15, l: -9 },
  { x: 89, y: 76, s: 1, d: 11, l: -4 },
  { x: 92, y: 91, s: 2, d: 14, l: -6 },
  { x: 95, y: 83, s: 1, d: 10, l: -1 },
  { x: 97, y: 99, s: 2, d: 16, l: -8 },
  { x: 99, y: 74, s: 1, d: 12, l: -3 },
];

export default function DemoHome() {
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    const syncTheme = () => {
      const isDataDark = root.dataset.theme === 'dark';
      const hasDarkClass = root.classList.contains('dark');
      setIsDark(isDataDark || hasDarkClass);
    };

    syncTheme();
    const observer = new MutationObserver(syncTheme);
    observer.observe(root, { attributes: true, attributeFilter: ['data-theme', 'class'] });

    return () => observer.disconnect();
  }, []);

  const particles = useMemo(() => PARTICLES, []);

  return (
    <section className="rc-hero relative min-h-screen w-full overflow-hidden" data-resolved-theme={isDark ? 'dark' : 'light'}>
      <style>{`
        :root {
          --color-bg:          #F7F9F9;
          --color-surface:     #FFFFFF;
          --color-primary:     #1BA098;
          --color-primary-lt:  #4ECDC4;
          --color-secondary:   #7BBFB5;
          --color-accent:      #1A4D48;
          --color-deep:        #0D3330;
          --color-muted:       #6B7A8E;
          --color-text:        #131C2B;
          --color-text-sub:    #3D5A57;
          --color-glow:        rgba(27, 160, 152, 0.18);
          --color-card-bg:     rgba(255, 255, 255, 0.75);
          --color-card-border: rgba(78, 205, 196, 0.25);

          --color-frame:       #E0E8E8;
          --color-frame-dark:  #1C2535;
          --color-white:       #FFFFFF;
          --color-black:       rgba(0, 0, 0, 0.35);
          --color-bloom:       rgba(78, 205, 196, 0.08);
          --color-ring:        rgba(27, 160, 152, 0.09);
          --color-particle:    rgba(27, 160, 152, 0.15);
          --color-shimmer:     rgba(255, 255, 255, 0.12);
          --color-glass-line:  rgba(107, 122, 142, 0.40);
          --reflection-opacity: 0;
        }

        [data-theme="dark"],
        .dark {
          --color-bg:          #131C2B;
          --color-surface:     #0D3330;
          --color-primary:     #4ECDC4;
          --color-primary-lt:  #7BBFB5;
          --color-secondary:   #1BA098;
          --color-accent:      #4ECDC4;
          --color-deep:        #0D3330;
          --color-muted:       #6B7A8E;
          --color-text:        #F0FAFA;
          --color-text-sub:    #7BBFB5;
          --color-glow:        rgba(78, 205, 196, 0.20);
          --color-card-bg:     rgba(13, 51, 48, 0.80);
          --color-card-border: rgba(78, 205, 196, 0.15);

          --color-frame:       var(--color-frame-dark);
          --color-bloom:       rgba(78, 205, 196, 0.10);
          --color-ring:        rgba(78, 205, 196, 0.10);
          --color-particle:    rgba(78, 205, 196, 0.15);
          --reflection-opacity: 1;
        }

        .rc-hero {
          background: var(--color-bg);
        }

        .rc-bloom {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 50% 48%, var(--color-bloom) 0%, transparent 62%);
          pointer-events: none;
        }

        .rc-ring {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 22rem;
          height: 22rem;
          border: 1px solid var(--color-ring);
          border-radius: 9999px;
          transform: translate(-50%, -50%) scale(1);
          animation: rcPulse 6s linear infinite;
          will-change: transform, opacity;
        }

        .rc-ring.r2 { animation-delay: 2s; }
        .rc-ring.r3 { animation-delay: 4s; }

        .rc-particle {
          position: absolute;
          border-radius: 9999px;
          background: var(--color-particle);
          animation-name: rcParticle;
          animation-iteration-count: infinite;
          animation-timing-function: linear;
          will-change: transform, opacity;
        }

        .rc-headline {
          animation: rcFadeUp 0.8s ease-out both;
        }

        .rc-phone-wrap {
          position: absolute;
          top: 14%;
          left: 50%;
          transform: translateX(-50%);
          z-index: 10;
          mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 1) 55%, rgba(0, 0, 0, 0) 80%);
          -webkit-mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 1) 55%, rgba(0, 0, 0, 0) 80%);
          animation: rcFloatPhone 5s ease-in-out infinite;
          will-change: transform;
        }

        .rc-phone-glow {
          position: absolute;
          inset: 0;
          width: 12.5rem;
          height: 18.75rem;
          left: 50%;
          top: 48%;
          transform: translate(-50%, -50%);
          background: var(--color-glow);
          filter: blur(70px);
        }

        .rc-phone {
          position: relative;
          width: 17.5rem;
          height: 35rem;
          border-radius: 2.25rem;
          background: var(--color-frame);
          border: 1px solid var(--color-card-border);
          box-shadow: 0 20px 50px var(--color-black);
          overflow: hidden;
        }

        [data-theme="dark"] .rc-phone,
        .dark .rc-phone {
          background: var(--color-frame-dark);
        }

        .rc-screen {
          position: absolute;
          inset: 0.5rem;
          border-radius: 1.85rem;
          background: var(--color-card-bg);
          border: 1px solid var(--color-card-border);
          backdrop-filter: blur(12px);
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 1.25rem;
          color: var(--color-text);
        }

        .rc-avatar {
          width: 4rem;
          height: 4rem;
          border-radius: 9999px;
          margin-top: 0.65rem;
          background: linear-gradient(135deg, var(--color-primary-lt), var(--color-accent));
        }

        .rc-divider {
          width: 100%;
          height: 1px;
          background: var(--color-card-border);
          margin: 0.9rem 0;
        }

        .rc-icon-row { display: flex; gap: 0.45rem; }

        .rc-icon-pill {
          width: 2.1rem;
          height: 2.1rem;
          border-radius: 9999px;
          background: var(--color-surface);
          color: var(--color-primary);
          border: 1px solid var(--color-card-border);
          display: grid;
          place-items: center;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .rc-save-btn {
          margin-top: auto;
          width: 100%;
          border: none;
          border-radius: 9999px;
          padding: 0.62rem 0.75rem;
          color: var(--color-white);
          background: linear-gradient(135deg, var(--color-primary-lt), var(--color-primary));
          font-size: 0.82rem;
          font-weight: 700;
        }

        .rc-products {
          position: absolute;
          left: 50%;
          bottom: 10%;
          transform: translateX(-50%);
          z-index: 30;
          width: min(92vw, 38rem);
          height: 20rem;
          pointer-events: none;
        }

        .rc-card {
          position: absolute;
          left: 50%;
          bottom: 2.35rem;
          width: min(21.25rem, 82vw);
          aspect-ratio: 1.58 / 1;
          border-radius: 1.05rem;
          border: 1px solid var(--color-card-border);
          background: var(--color-surface);
          transform: translateX(-56%) rotateZ(-8deg) rotateX(12deg);
          box-shadow: 0 24px 60px var(--color-black), 0 0 0 1px var(--color-card-border);
          animation: rcFloatCard 4s ease-in-out infinite;
          animation-delay: -2s;
          overflow: hidden;
          will-change: transform;
        }

        [data-theme="dark"] .rc-card,
        .dark .rc-card {
          background: var(--color-deep);
        }

        .rc-card::before {
          content: '';
          position: absolute;
          inset: 0;
          opacity: 0.22;
          background-image: radial-gradient(var(--color-card-border) 1px, transparent 1px);
          background-size: 6px 6px;
          pointer-events: none;
        }

        .rc-card::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(115deg, transparent 30%, var(--color-shimmer) 50%, transparent 70%);
          background-size: 200% 100%;
          animation: rcShimmer 5s linear infinite;
          pointer-events: none;
        }

        .rc-card-content {
          position: relative;
          z-index: 1;
          width: 100%;
          height: 100%;
          padding: 1rem;
          color: var(--color-text);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .rc-logo-mark {
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--color-primary);
          letter-spacing: 0.08em;
        }

        .rc-nfc-mark {
          align-self: flex-end;
          font-size: 1rem;
          color: var(--color-secondary);
          opacity: 0.6;
        }

        .rc-sticker {
          position: absolute;
          right: 14%;
          top: 2.2rem;
          width: 5rem;
          height: 5rem;
          border-radius: 9999px;
          background: var(--color-surface);
          border: 3px solid var(--color-primary);
          display: grid;
          place-items: center;
          z-index: 40;
          animation: rcFloatSticker 3.5s ease-in-out infinite;
          animation-delay: -1s;
          will-change: transform;
        }

        .rc-sticker::after {
          content: '';
          position: absolute;
          top: 11%;
          left: 12%;
          width: 45%;
          height: 45%;
          border-radius: 9999px;
          background: radial-gradient(circle, var(--color-shimmer) 0%, transparent 72%);
          pointer-events: none;
        }

        .rc-chip-label {
          position: absolute;
          right: -0.8rem;
          top: -1.8rem;
          background: var(--color-surface);
          color: var(--color-muted);
          border: 1px solid var(--color-card-border);
          border-radius: 9999px;
          font-size: 0.62rem;
          line-height: 1;
          padding: 0.35rem 0.5rem;
          white-space: nowrap;
        }

        .rc-chip-label::after {
          content: '';
          position: absolute;
          width: 1px;
          height: 14px;
          left: 50%;
          top: 100%;
          background: var(--color-glass-line);
        }

        .rc-reflection {
          position: absolute;
          left: 50%;
          bottom: -0.2rem;
          width: min(21.25rem, 82vw);
          height: 30%;
          transform: translateX(-56%) scaleY(-1);
          border-radius: 1rem;
          background: linear-gradient(to top, var(--color-card-bg), transparent);
          opacity: var(--reflection-opacity);
          filter: blur(8px);
          mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 0.15), transparent);
          -webkit-mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 0.15), transparent);
        }

        .rc-btn {
          position: absolute;
          z-index: 60;
          border-radius: 9999px;
          padding: 0.9rem 1.75rem;
          font-size: 0.9rem;
          font-weight: 700;
          border: 2px solid transparent;
          transition: transform 200ms ease, box-shadow 200ms ease, background 200ms ease, color 200ms ease;
          will-change: transform;
        }

        .rc-btn-left {
          left: 5%;
          top: 39%;
          color: var(--color-white);
          background: linear-gradient(135deg, var(--color-primary-lt), var(--color-primary));
        }

        .rc-btn-left:hover {
          transform: scale(1.04);
          box-shadow: 0 0 24px var(--color-glow);
        }

        .rc-btn-right {
          right: 5%;
          top: 66%;
          color: var(--color-primary);
          border-color: var(--color-primary);
          background: transparent;
        }

        .rc-btn-right:hover {
          transform: scale(1.04);
          color: var(--color-white);
          background: var(--color-primary);
        }

        .rc-arrow {
          position: absolute;
          z-index: 55;
          overflow: visible;
          animation: rcArrowWiggle 2.5s ease-in-out infinite;
          animation-delay: 1.45s;
          transform-origin: left center;
          will-change: transform;
        }

        .rc-arrow path {
          stroke: var(--color-primary);
          stroke-width: 2;
          fill: none;
          stroke-linecap: round;
        }

        .rc-arrow .draw {
          stroke-dasharray: 1000;
          stroke-dashoffset: 1000;
          animation: rcDraw 1.4s ease-out forwards;
        }

        .rc-arrow-left {
          left: 16%;
          top: 32%;
          width: 30%;
          height: 28%;
        }

        .rc-arrow-head-bounce {
          animation: rcHeadBounce 1s ease-in-out infinite;
          animation-delay: 1.4s;
          will-change: transform;
        }

        .rc-arrow-right {
          right: 16%;
          top: 53%;
          width: 30%;
          height: 30%;
          transform-origin: right center;
          animation-delay: 1.8s;
        }

        .rc-arrow-right .draw {
          animation-delay: 0.4s;
        }

        .rc-sparkle {
          transform-origin: center;
          animation: rcSparkle 1.8s ease-in-out infinite;
          animation-delay: 1.8s;
          fill: var(--color-primary);
        }

        .rc-mobile-ctas,
        .rc-arrow-mobile {
          display: none;
        }

        @media (max-width: 767px) {
          .rc-headline {
            top: 4.5rem;
            width: 92%;
          }

          .rc-phone-wrap {
            top: 14.5%;
            transform: translateX(-50%) scale(0.7);
          }

          .rc-products {
            bottom: 20%;
            transform: translateX(-50%);
          }

          .rc-card {
            transform: translateX(-50%) rotateZ(-3deg) rotateX(8deg);
            left: 50%;
            bottom: 1.1rem;
          }

          .rc-reflection {
            transform: translateX(-50%) scaleY(-1);
          }

          .rc-sticker {
            right: 12%;
            top: 0.3rem;
          }

          .rc-btn,
          .rc-arrow-left,
          .rc-arrow-right {
            display: none;
          }

          .rc-mobile-ctas {
            position: absolute;
            left: 0;
            right: 0;
            bottom: 1.25rem;
            z-index: 70;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.75rem;
          }

          .rc-mobile-ctas .rc-btn-mobile {
            width: min(92vw, 21rem);
            border-radius: 9999px;
            font-size: 0.85rem;
            font-weight: 700;
            padding: 0.82rem 1rem;
            border: 2px solid var(--color-primary);
            transition: transform 200ms ease;
          }

          .rc-mobile-ctas .rc-btn-mobile:active {
            transform: scale(0.98);
          }

          .rc-mobile-ctas .filled {
            color: var(--color-white);
            border-color: transparent;
            background: linear-gradient(135deg, var(--color-primary-lt), var(--color-primary));
          }

          .rc-mobile-ctas .outline {
            color: var(--color-primary);
            background: transparent;
          }

          .rc-arrow-mobile {
            display: block;
            position: absolute;
            z-index: 56;
            width: 10rem;
            height: 4.25rem;
            left: 50%;
            transform: translateX(-50%);
            animation: rcArrowWiggle 2.5s ease-in-out infinite;
            animation-delay: 1.4s;
          }

          .rc-arrow-mobile path {
            stroke: var(--color-primary);
            stroke-width: 2;
            fill: none;
            stroke-linecap: round;
          }

          .rc-arrow-mobile.top {
            bottom: 16.7rem;
          }

          .rc-arrow-mobile.bottom {
            bottom: 12.6rem;
            animation-delay: 1.8s;
          }

          .rc-arrow-mobile .draw {
            stroke-dasharray: 1000;
            stroke-dashoffset: 1000;
            animation: rcDraw 1.1s ease-out forwards;
          }

          .rc-arrow-mobile.bottom .draw {
            animation-delay: 0.4s;
          }
        }

        @keyframes rcPulse {
          0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(2.5); opacity: 0; }
        }

        @keyframes rcParticle {
          0% { transform: translate3d(0, 0, 0); opacity: 0; }
          12% { opacity: 1; }
          100% { transform: translate3d(0, -22vh, 0); opacity: 0; }
        }

        @keyframes rcFadeUp {
          0% { opacity: 0; transform: translateY(12px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        @keyframes rcFloatPhone {
          0%, 100% { transform: translateX(-50%) translateY(-8px); }
          50% { transform: translateX(-50%) translateY(8px); }
        }

        @keyframes rcFloatCard {
          0%, 100% { transform: translateX(-56%) rotateZ(-8deg) rotateX(12deg) translateY(-5px); }
          50% { transform: translateX(-56%) rotateZ(-8deg) rotateX(12deg) translateY(5px); }
        }

        @media (max-width: 767px) {
          @keyframes rcFloatCard {
            0%, 100% { transform: translateX(-50%) rotateZ(-3deg) rotateX(8deg) translateY(-4px); }
            50% { transform: translateX(-50%) rotateZ(-3deg) rotateX(8deg) translateY(4px); }
          }
        }

        @keyframes rcFloatSticker {
          0%, 100% { transform: translateY(-4px); }
          50% { transform: translateY(4px); }
        }

        @keyframes rcShimmer {
          0% { background-position: -100% 0; }
          100% { background-position: 200% 0; }
        }

        @keyframes rcDraw {
          to { stroke-dashoffset: 0; }
        }

        @keyframes rcHeadBounce {
          0%, 100% { transform: translateY(-2px); }
          50% { transform: translateY(2px); }
        }

        @keyframes rcArrowWiggle {
          0%, 100% { transform: rotate(-2deg); }
          50% { transform: rotate(2deg); }
        }

        @keyframes rcSparkle {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.35); }
        }
      `}</style>

      <div className="rc-bloom" aria-hidden="true" />

      <div className="rc-ring" aria-hidden="true" />
      <div className="rc-ring r2" aria-hidden="true" />
      <div className="rc-ring r3" aria-hidden="true" />

      {particles.map((p, idx) => (
        <span
          key={idx}
          className="rc-particle"
          aria-hidden="true"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.s}px`,
            height: `${p.s}px`,
            animationDuration: `${p.d}s`,
            animationDelay: `${p.l}s`,
          }}
        />
      ))}

      <header className="rc-headline absolute left-1/2 top-14 z-50 w-[92%] max-w-3xl -translate-x-1/2 text-center">
        <h1
          className="text-3xl font-light tracking-[0.04em] md:text-5xl"
          style={{ color: 'var(--color-text)' }}
        >
          Your Network. Reimagined.
        </h1>
        <p className="mt-3 text-sm md:text-base" style={{ color: 'var(--color-muted)' }}>
          Digital cards. NFC products. One platform.
        </p>
      </header>

      <button
        type="button"
        className="rc-btn rc-btn-left"
        onClick={() => navigate(createPageUrl('Login'))}
      >
        Get your Free Digital Card
      </button>

      <button
        type="button"
        className="rc-btn rc-btn-right"
        onClick={() => navigate('/customize')}
      >
        Customize your product now
      </button>

      <svg className="rc-arrow rc-arrow-left" viewBox="0 0 420 260" aria-hidden="true">
        <path className="draw" d="M14 60 C 95 40, 140 110, 220 108 C 275 104, 310 84, 360 140" />
        <g className="rc-arrow-head-bounce" transform="translate(360 140)">
          <path d="M 0 0 L -10 -6 L -10 6 Z" fill="var(--color-primary)" />
        </g>
      </svg>

      <svg className="rc-arrow rc-arrow-right" viewBox="0 0 420 280" aria-hidden="true">
        <path className="draw" d="M404 56 C 328 76, 280 130, 220 128 C 154 124, 106 168, 62 230" />
        <g transform="translate(56 234)">
          <path
            className="rc-sparkle"
            d="M 8 0 L 11 6 L 17 8 L 11 11 L 8 17 L 5 11 L -1 8 L 5 6 Z"
          />
        </g>
      </svg>

      <svg className="rc-arrow-mobile top" viewBox="0 0 160 70" aria-hidden="true">
        <path className="draw" d="M 80 2 C 76 20, 84 34, 80 56" />
        <path d="M 80 56 L 74 48 L 86 48 Z" fill="var(--color-primary)" className="rc-arrow-head-bounce" />
      </svg>

      <svg className="rc-arrow-mobile bottom" viewBox="0 0 160 70" aria-hidden="true">
        <path className="draw" d="M 80 2 C 74 24, 86 40, 80 58" />
        <path className="rc-sparkle" d="M 80 49 L 84 56 L 92 58 L 84 61 L 80 68 L 76 61 L 68 58 L 76 56 Z" />
      </svg>

      <div className="rc-phone-wrap" aria-hidden="true">
        <div className="rc-phone-glow" />
        <article className="rc-phone">
          <div className="rc-screen">
            <div className="rc-avatar" />
            <h3 className="mt-3 text-base font-bold" style={{ color: 'var(--color-text)' }}>
              Ahmed Al-Rashidi
            </h3>
            <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
              Marketing Director
            </p>
            <div className="rc-divider" />
            <div className="rc-icon-row">
              <span className="rc-icon-pill">☎</span>
              <span className="rc-icon-pill">✉</span>
              <span className="rc-icon-pill">◎</span>
              <span className="rc-icon-pill">in</span>
            </div>
            <button type="button" className="rc-save-btn">
              Save Contact
            </button>
          </div>
        </article>
      </div>

      <div className="rc-products" aria-hidden="true">
        <div className="rc-card">
          <div className="rc-card-content">
            <div className="rc-logo-mark">RAWAJCARD</div>
            <div>
              <p className="text-[0.72rem]" style={{ color: 'var(--color-text-sub)' }}>
                Ahmed Al-Rashidi
              </p>
            </div>
            <div className="rc-nfc-mark">⟡</div>
          </div>
        </div>

        <div className="rc-sticker">
          <svg width="56" height="56" viewBox="0 0 56 56" aria-hidden="true">
            <circle cx="28" cy="28" r="8" stroke="var(--color-primary)" strokeWidth="2" fill="none" />
            <circle cx="28" cy="28" r="14" stroke="var(--color-primary)" strokeWidth="1.6" fill="none" />
            <circle cx="28" cy="28" r="20" stroke="var(--color-primary)" strokeWidth="1.2" fill="none" />
          </svg>
          <span className="rc-chip-label">NFC Sticker</span>
        </div>

        <div className="rc-reflection" />
      </div>

      <div className="rc-mobile-ctas">
        <button type="button" className="rc-btn-mobile filled" onClick={() => navigate(createPageUrl('Login'))}>
          Get your Free Digital Card
        </button>
        <button type="button" className="rc-btn-mobile outline" onClick={() => navigate('/customize')}>
          Customize your product now
        </button>
      </div>
    </section>
  );
}
