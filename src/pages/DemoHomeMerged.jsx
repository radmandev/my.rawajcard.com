import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { createPageUrl } from '@/utils';
import Navbar from '@/components/landing/Navbar';
import LoginModal from '@/components/auth/LoginModal';
import { useLanguage } from '@/components/shared/LanguageContext';
import { useAuth } from '@/lib/AuthContext';
import { Wifi, ShoppingCart, ChevronLeft, ChevronRight, LogIn } from 'lucide-react';

const CYCLING_WORDS_AR = ['بنفسك', 'بشركتك', 'بفكرتك'];
const CYCLING_WORDS_EN = ['yourself', 'your business', 'your idea'];

const HERO_PRODUCT_TYPES = [
  {
    labelAr: 'بطاقة NFC معدنية',
    labelEn: 'Metal NFC Card',
    icon: '💳',
  },
  {
    labelAr: 'بطاقة NFC خشبية',
    labelEn: 'Wooden NFC Card',
    icon: '🪵',
  },
  {
    labelAr: 'تعليقة مفاتيح NFC',
    labelEn: 'NFC Keychain',
    icon: '🔑',
  },
  {
    labelAr: 'ستاند طاولة NFC',
    labelEn: 'NFC Table Stand',
    icon: '🪧',
  },
];

const MENU_ITEMS = [
  { name: 'Truffle Pasta', price: '$18', tag: 'Chef pick' },
  { name: 'Grilled Salmon', price: '$24', tag: 'Fresh daily' },
  { name: 'Matcha Tiramisu', price: '$9', tag: 'Dessert' },
];

export default function DemoHomeMerged({ heroOnly = false, onLoginClick }) {
  const navigate = useNavigate();
  const { isRTL } = useLanguage();
  const { isAuthenticated } = useAuth();

  const [wordIdx, setWordIdx] = useState(0);
  const [selectedProductTypeIdx, setSelectedProductTypeIdx] = useState(0);
  const [loginOpen, setLoginOpen] = useState(false);

  const CYCLING_WORDS = isRTL ? CYCLING_WORDS_AR : CYCLING_WORDS_EN;

  useEffect(() => {
    const t = setInterval(() => setWordIdx((i) => (i + 1) % CYCLING_WORDS.length), 2500);
    return () => clearInterval(t);
  }, [CYCLING_WORDS.length]);

  useEffect(() => {
    const t = setInterval(() => {
      setSelectedProductTypeIdx((prev) => (prev + 1) % HERO_PRODUCT_TYPES.length);
    }, 3500);
    return () => clearInterval(t);
  }, []);

  const handleCreateDigital = () => {
    if (isAuthenticated) {
      navigate(createPageUrl('Dashboard'));
      return;
    }

    if (heroOnly) {
      onLoginClick?.();
      return;
    }

    setLoginOpen(true);
  };

  const renderPhoneExperience = () => {
    if (selectedProductTypeIdx === 1) {
      return (
        <>
          <div className="demo-digital-card demo-profile-card">
            <div className="demo-profile-banner" />
            <div className="demo-card-body">
              <div className="demo-avatar demo-avatar-soft" />
              <h3 className="demo-name">Ahmed Al-Rashidi</h3>
              <p className="demo-role">Brand Strategy Consultant</p>
              <div className="demo-profile-stats">
                <div className="demo-profile-stat"><strong>12+</strong><span>Years</span></div>
                <div className="demo-profile-stat"><strong>80</strong><span>Projects</span></div>
                <div className="demo-profile-stat"><strong>4.9</strong><span>Rating</span></div>
              </div>
              <div className="demo-profile-links">
                <div className="demo-contact-row"><span className="demo-row-icon">◎</span><span>rawajcard.com/ahmed</span></div>
                <div className="demo-contact-row"><span className="demo-row-icon">IG</span><span>@ahmed.rawaj</span></div>
              </div>
            </div>
          </div>
          <button type="button" className="demo-save-btn demo-save-btn-soft">View Portfolio</button>
        </>
      );
    }

    if (selectedProductTypeIdx === 2) {
      return (
        <>
          <div className="demo-digital-card demo-wa-card">
            <div className="demo-wa-header">
              <div className="demo-wa-avatar">A</div>
              <div>
                <div className="demo-wa-name">Ahmed Al-Rashidi</div>
                <div className="demo-wa-status">Typically replies instantly</div>
              </div>
            </div>

            <div className="demo-wa-body">
              <div className="demo-wa-bubble demo-wa-bubble-in">Hi Ahmed, I found your NFC keychain.</div>
              <div className="demo-wa-bubble demo-wa-bubble-out">Welcome! Tap below to start chatting on WhatsApp.</div>
              <div className="demo-wa-hint">Business inquiries · quick networking · direct contact</div>
            </div>
          </div>
          <button type="button" className="demo-save-btn demo-save-btn-wa">Start WhatsApp Chat</button>
        </>
      );
    }

    if (selectedProductTypeIdx === 3) {
      return (
        <>
          <div className="demo-digital-card demo-menu-card">
            <div className="demo-menu-top">
              <div>
                <div className="demo-menu-brand">Saffron Bistro</div>
                <div className="demo-menu-subtitle">Digital Menu</div>
              </div>
              <div className="demo-menu-badge">Table 07</div>
            </div>

            <div className="demo-menu-list">
              {MENU_ITEMS.map((item) => (
                <div key={item.name} className="demo-menu-item">
                  <div>
                    <div className="demo-menu-item-name">{item.name}</div>
                    <div className="demo-menu-item-tag">{item.tag}</div>
                  </div>
                  <div className="demo-menu-item-price">{item.price}</div>
                </div>
              ))}
            </div>
          </div>
          <button type="button" className="demo-save-btn demo-save-btn-menu">Open Full Menu</button>
        </>
      );
    }

    return (
      <>
        <div className="demo-digital-card">
          <div className="demo-digital-top" />
          <div className="demo-card-body">
            <div className="demo-avatar" />
            <h3 className="demo-name">Ahmed Al-Rashidi</h3>
            <p className="demo-role">Marketing Director</p>
            <div className="demo-divider" />

            <div className="demo-contact-list">
              <div className="demo-contact-row">
                <span className="demo-row-icon">☎</span>
                <span>+966 53 160 7223</span>
              </div>
              <div className="demo-contact-row">
                <span className="demo-row-icon">✉</span>
                <span>ahmed@rawajcard.com</span>
              </div>
              <div className="demo-contact-row">
                <span className="demo-row-icon">in</span>
                <span>linkedin.com/in/ahmed</span>
              </div>
            </div>

            <div className="demo-meta">
              <div className="flex gap-1.5">
                <span className="demo-chip">NFC</span>
                <span className="demo-chip">vCard</span>
              </div>
              <div className="demo-qr" aria-hidden="true" />
            </div>
          </div>
        </div>
        <button type="button" className="demo-save-btn">Save Contact</button>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-white pb-16 md:pb-0" dir={isRTL ? 'rtl' : 'ltr'} style={{ fontFamily: isRTL ? "'Tajawal', 'Cairo', sans-serif" : "'Inter', 'Segoe UI', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800;900&family=Cairo:wght@400;600;700;800&display=swap');

        .demo-mockup-wrap {
          position: relative;
          width: min(100%, 30rem);
          height: 36rem;
          margin-inline: auto;
        }

        .demo-product-slider {
          position: relative;
          padding: 0;
        }

        .demo-slider-main {
          display: grid;
          grid-template-columns: auto minmax(0, 1fr) auto;
          align-items: end;
          gap: 0.85rem;
        }

        .demo-type-nav {
          width: 1.9rem;
          height: 1.9rem;
          border-radius: 9999px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: none;
          background: transparent;
          color: rgba(203, 213, 225, 0.72);
          transition: color 0.2s ease, opacity 0.2s ease;
          flex-shrink: 0;
          opacity: 0.9;
        }

        .demo-type-nav:hover {
          color: #f8fafc;
          opacity: 1;
        }

        .demo-type-scroll {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 1rem;
          min-width: 0;
        }

        .demo-slider-item {
          position: relative;
          padding: 0 0 0.7rem;
          border: none;
          background: transparent;
          text-align: start;
          transition: opacity 0.2s ease, color 0.2s ease;
          opacity: 0.52;
        }

        .demo-slider-item:hover {
          opacity: 0.82;
        }

        .demo-slider-item.is-active {
          opacity: 1;
        }

        .demo-slider-index {
          font-size: 0.62rem;
          font-weight: 700;
          letter-spacing: 0.14em;
          color: rgba(148, 163, 184, 0.7);
          margin-bottom: 0.22rem;
        }

        .demo-slider-item.is-active .demo-slider-index {
          color: rgba(94, 234, 212, 0.88);
        }

        .demo-slider-label {
          font-size: 0.8rem;
          font-weight: 500;
          color: rgba(226, 232, 240, 0.9);
          line-height: 1.4;
        }

        .demo-slider-indicator-track {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          height: 1px;
          background: rgba(255, 255, 255, 0.08);
        }

        .demo-slider-indicator {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          height: 1.5px;
          background: linear-gradient(90deg, #5eead4, #67e8f9);
          transform-origin: left center;
        }

        .demo-hero-section {
          overflow-x: hidden;
          overflow-y: visible;
        }

        .demo-phone-wrap {
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          z-index: 1;
          mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 1) 55%, rgba(0, 0, 0, 0) 80%);
          -webkit-mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 1) 55%, rgba(0, 0, 0, 0) 80%);
          animation: demoPhoneFloat 5s ease-in-out infinite;
          will-change: transform;
        }

        .demo-phone-rings {
          position: absolute;
          left: 50%;
          top: 46%;
          transform: translate(-50%, -50%);
          width: 27rem;
          height: 27rem;
          pointer-events: none;
          z-index: 0;
        }

        .demo-phone-ring {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 11rem;
          height: 11rem;
          border-radius: 9999px;
          border: 1px solid rgba(78, 205, 196, 0.28);
          transform: translate(-50%, -50%) scale(1);
          animation: demoRingPulse 6s linear infinite;
          opacity: 0;
          will-change: transform, opacity;
        }

        .demo-phone-ring.r2 { animation-delay: 2s; }
        .demo-phone-ring.r3 { animation-delay: 4s; }

        .demo-phone-glow {
          position: absolute;
          width: 14rem;
          height: 18rem;
          left: 50%;
          top: 44%;
          transform: translate(-50%, -50%);
          background: rgba(20, 184, 166, 0.18);
          filter: blur(70px);
          border-radius: 9999px;
        }

        .demo-phone {
          position: relative;
          width: 17.5rem;
          height: 35rem;
          border-radius: 2.2rem;
          background: #1c2535;
          border: 1px solid rgba(78, 205, 196, 0.25);
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.35);
          overflow: hidden;
        }

        .dark .demo-phone {
          background: #1c2535;
          border-color: rgba(78, 205, 196, 0.15);
        }

        html:not(.dark) .demo-phone {
          background: #e0e8e8;
          border-color: rgba(78, 205, 196, 0.25);
        }

        .demo-screen {
          position: absolute;
          inset: 0.5rem;
          border-radius: 1.8rem;
          background: linear-gradient(155deg, rgba(255, 255, 255, 0.96), rgba(240, 248, 248, 0.9));
          border: 1px solid rgba(78, 205, 196, 0.22);
          backdrop-filter: blur(12px);
          padding: 1rem;
          display: flex;
          flex-direction: column;
        }

        .demo-digital-card {
          position: relative;
          width: 100%;
          border-radius: 1.25rem;
          background: #ffffff;
          border: 1px solid rgba(78, 205, 196, 0.22);
          box-shadow: 0 16px 30px rgba(12, 54, 66, 0.14);
          overflow: hidden;
          color: #12313b;
        }

        .demo-digital-top {
          height: 4.2rem;
          background: linear-gradient(120deg, rgba(78, 205, 196, 0.28), rgba(27, 160, 152, 0.35));
        }

        .demo-avatar {
          width: 4rem;
          height: 4rem;
          border-radius: 9999px;
          margin-top: -2rem;
          margin-inline: auto;
          border: 3px solid #ffffff;
          box-shadow: 0 10px 18px rgba(20, 88, 92, 0.2);
          background: linear-gradient(135deg, #4ecdc4, #1a4d48);
        }

        .demo-card-body {
          padding: 0.65rem 0.85rem 0.9rem;
        }

        .demo-name {
          margin-top: 0.55rem;
          text-align: center;
          font-size: 0.9rem;
          font-weight: 800;
          color: #17343f;
        }

        .demo-role {
          text-align: center;
          font-size: 0.72rem;
          color: #5e7a89;
        }

        .demo-divider {
          width: 100%;
          height: 1px;
          background: rgba(78, 205, 196, 0.25);
          margin: 0.7rem 0;
        }

        .demo-contact-list {
          display: grid;
          gap: 0.45rem;
        }

        .demo-contact-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          border-radius: 0.65rem;
          background: #f7fbfc;
          border: 1px solid rgba(78, 205, 196, 0.22);
          padding: 0.42rem 0.5rem;
          font-size: 0.68rem;
          color: #29515d;
        }

        .demo-row-icon {
          width: 1.4rem;
          height: 1.4rem;
          border-radius: 9999px;
          background: #ffffff;
          border: 1px solid rgba(78, 205, 196, 0.25);
          color: #1ba098;
          display: grid;
          place-items: center;
          font-size: 0.66rem;
          font-weight: 700;
          flex-shrink: 0;
        }

        .demo-meta {
          margin-top: 0.65rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.45rem;
        }

        .demo-chip {
          border-radius: 9999px;
          background: #eef8f7;
          border: 1px solid rgba(78, 205, 196, 0.26);
          color: #1f5b63;
          font-size: 0.62rem;
          font-weight: 700;
          padding: 0.25rem 0.52rem;
        }

        .demo-qr {
          width: 2.45rem;
          height: 2.45rem;
          border-radius: 0.45rem;
          border: 1px solid rgba(78, 205, 196, 0.25);
          background:
            linear-gradient(90deg, rgba(27, 160, 152, 0.18) 1px, transparent 1px),
            linear-gradient(rgba(27, 160, 152, 0.18) 1px, transparent 1px),
            #ffffff;
          background-size: 6px 6px, 6px 6px, auto;
        }

        .demo-save-btn {
          margin-top: 0.75rem;
          width: 100%;
          border: none;
          border-radius: 9999px;
          padding: 0.62rem 0.75rem;
          color: #ffffff;
          background: linear-gradient(135deg, #4ecdc4, #1ba098);
          font-size: 0.82rem;
          font-weight: 700;
        }

        .demo-avatar-soft {
          background: linear-gradient(135deg, #e8d7bd, #a77d52);
        }

        .demo-profile-card {
          background: linear-gradient(180deg, #fffdf9, #f7f1e7);
        }

        .demo-profile-banner {
          height: 4rem;
          background: linear-gradient(120deg, rgba(164, 116, 73, 0.24), rgba(219, 188, 146, 0.4));
        }

        .demo-profile-stats {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 0.45rem;
          margin: 0.8rem 0 0.7rem;
        }

        .demo-profile-stat {
          border-radius: 0.8rem;
          background: rgba(255, 255, 255, 0.72);
          border: 1px solid rgba(164, 116, 73, 0.15);
          padding: 0.48rem 0.35rem;
          text-align: center;
        }

        .demo-profile-stat strong {
          display: block;
          font-size: 0.78rem;
          color: #724622;
        }

        .demo-profile-stat span {
          font-size: 0.57rem;
          color: #8a6a4e;
        }

        .demo-profile-links {
          display: grid;
          gap: 0.45rem;
        }

        .demo-save-btn-soft {
          background: linear-gradient(135deg, #a6784d, #815730);
        }

        .demo-wa-card {
          background: linear-gradient(180deg, #f6fffb, #ebfff5);
          display: flex;
          flex-direction: column;
          min-height: 0;
        }

        .demo-wa-header {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          padding: 0.9rem 0.9rem 0.7rem;
          border-bottom: 1px solid rgba(34, 197, 94, 0.14);
          background: linear-gradient(180deg, rgba(34, 197, 94, 0.14), rgba(34, 197, 94, 0.05));
        }

        .demo-wa-avatar {
          width: 2.25rem;
          height: 2.25rem;
          border-radius: 9999px;
          display: grid;
          place-items: center;
          background: linear-gradient(135deg, #22c55e, #16a34a);
          color: white;
          font-weight: 800;
          font-size: 0.8rem;
        }

        .demo-wa-name {
          font-size: 0.82rem;
          font-weight: 700;
          color: #0f3b22;
        }

        .demo-wa-status {
          font-size: 0.6rem;
          color: #4d7d62;
        }

        .demo-wa-body {
          display: grid;
          gap: 0.55rem;
          padding: 0.9rem;
          background:
            radial-gradient(circle at 1px 1px, rgba(34, 197, 94, 0.06) 1px, transparent 0),
            #f7fffb;
          background-size: 12px 12px;
        }

        .demo-wa-bubble {
          max-width: 88%;
          border-radius: 1rem;
          padding: 0.62rem 0.72rem;
          font-size: 0.66rem;
          line-height: 1.45;
          box-shadow: 0 8px 16px rgba(17, 24, 39, 0.06);
        }

        .demo-wa-bubble-in {
          background: #ffffff;
          color: #204132;
          justify-self: start;
          border-top-left-radius: 0.35rem;
        }

        .demo-wa-bubble-out {
          background: #dcfce7;
          color: #14532d;
          justify-self: end;
          border-top-right-radius: 0.35rem;
        }

        .demo-wa-hint {
          margin-top: 0.2rem;
          font-size: 0.58rem;
          color: #5b7d69;
          text-align: center;
        }

        .demo-save-btn-wa {
          background: linear-gradient(135deg, #22c55e, #16a34a);
        }

        .demo-menu-card {
          background: linear-gradient(180deg, #fffdfa, #fff7ee);
          padding: 0.95rem;
        }

        .demo-menu-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 0.6rem;
          margin-bottom: 0.85rem;
        }

        .demo-menu-brand {
          font-size: 0.85rem;
          font-weight: 800;
          color: #6d3a1f;
        }

        .demo-menu-subtitle {
          font-size: 0.62rem;
          color: #9a7157;
        }

        .demo-menu-badge {
          border-radius: 9999px;
          padding: 0.3rem 0.55rem;
          background: #fff0dd;
          border: 1px solid rgba(180, 100, 45, 0.14);
          font-size: 0.58rem;
          font-weight: 700;
          color: #9a582e;
        }

        .demo-menu-list {
          display: grid;
          gap: 0.5rem;
        }

        .demo-menu-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.55rem;
          padding: 0.65rem 0.72rem;
          border-radius: 0.9rem;
          background: #fff;
          border: 1px solid rgba(180, 100, 45, 0.1);
          box-shadow: 0 8px 18px rgba(111, 60, 25, 0.05);
        }

        .demo-menu-item-name {
          font-size: 0.71rem;
          font-weight: 700;
          color: #60361f;
        }

        .demo-menu-item-tag {
          font-size: 0.56rem;
          color: #a07458;
          margin-top: 0.12rem;
        }

        .demo-menu-item-price {
          font-size: 0.7rem;
          font-weight: 800;
          color: #b45309;
          white-space: nowrap;
        }

        .demo-save-btn-menu {
          background: linear-gradient(135deg, #c46a2d, #9a4d1c);
        }

        /* ===== PRODUCT MOCKUP CONTAINER ===== */
        .demo-product-mockup {
          position: absolute;
          left: 50%;
          bottom: 0.8rem;
          transform: translateX(-50%);
          z-index: 3;
          width: min(92vw, 24rem);
          height: 14rem;
          display: flex;
          align-items: flex-end;
          justify-content: center;
        }

        /* ===== METAL GOLD CARD ===== */
        .demo-metal-card {
          position: relative;
          width: min(18.5rem, 78vw);
          aspect-ratio: 1.586;
          border-radius: 1rem;
          background: linear-gradient(135deg,
            #c4933f 0%, #f7e07a 18%, #e8c050 35%,
            #b8820c 52%, #f0d070 68%, #c08830 84%, #b07010 100%
          );
          box-shadow:
            0 20px 48px rgba(0,0,0,0.48),
            0 0 0 1px rgba(255,210,60,0.45),
            inset 0 1px 0 rgba(255,255,255,0.35),
            inset 0 -1px 0 rgba(0,0,0,0.22);
          overflow: hidden;
          transform: rotateZ(-6deg) rotateX(10deg);
          animation: demoCardFloat 4s ease-in-out infinite;
          animation-delay: -2s;
          will-change: transform;
        }
        .demo-metal-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: repeating-linear-gradient(
            88deg,
            transparent 0px,
            rgba(255,255,255,0.058) 1px,
            transparent 2px,
            transparent 5px
          );
          z-index: 1;
        }
        .demo-metal-card::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(115deg, transparent 18%, rgba(255,255,255,0.32) 48%, transparent 78%);
          background-size: 250% 100%;
          animation: demoShimmer 4s linear infinite;
          z-index: 2;
        }
        .demo-metal-card-inner {
          position: absolute;
          inset: 0;
          z-index: 3;
          padding: 1.1rem 1.2rem;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        .demo-chip-block {
          width: 2.4rem;
          height: 1.75rem;
          border-radius: 0.28rem;
          background: linear-gradient(135deg, #e2c040, #f5e080, #c89018);
          border: 1px solid rgba(160,110,8,0.55);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.4), 0 2px 6px rgba(0,0,0,0.35);
          position: relative;
          overflow: hidden;
        }
        .demo-chip-block::before {
          content: '';
          position: absolute;
          inset: 0.22rem;
          border-radius: 0.12rem;
          border: 1px solid rgba(160,110,8,0.45);
          background: linear-gradient(90deg, #cca020, #eed858, #c09010);
        }
        .demo-nfc-symbol { display: flex; flex-direction: column; align-items: flex-end; gap: 3px; }
        .demo-nfc-arc {
          border: 2px solid rgba(255,255,255,0.68);
          border-radius: 9999px;
          border-left: none;
          border-top: none;
          border-bottom: none;
        }
        .demo-nfc-arc:nth-child(1) { width: 0.55rem; height: 0.9rem; }
        .demo-nfc-arc:nth-child(2) { width: 0.9rem;  height: 1.4rem; }
        .demo-nfc-arc:nth-child(3) { width: 1.25rem; height: 1.9rem; }
        .demo-metal-name {
          font-size: 0.78rem; font-weight: 700;
          color: rgba(255,255,255,0.92);
          letter-spacing: 0.12em;
          text-shadow: 0 1px 4px rgba(0,0,0,0.38);
          text-transform: uppercase;
        }
        .demo-metal-brand {
          font-size: 0.65rem; font-weight: 800;
          color: rgba(255,255,255,0.65);
          letter-spacing: 0.2em;
          text-transform: uppercase;
        }

        /* ===== WOODEN CARD ===== */
        .demo-wood-card {
          position: relative;
          width: min(18.5rem, 78vw);
          aspect-ratio: 1.586;
          border-radius: 0.85rem;
          background:
            repeating-linear-gradient(87deg, transparent 0px, rgba(40,10,0,0.07) 1px, transparent 2px, transparent 8px),
            repeating-linear-gradient(91deg, transparent 0px, rgba(20,5,0,0.04) 1px, transparent 2px, transparent 18px),
            linear-gradient(140deg,
              #a06038 0%, #c8793e 14%, #8b4a1c 30%,
              #b5712e 44%, #7a3c18 60%, #c07e3e 74%,
              #8b5230 88%, #a0622a 100%
            );
          box-shadow:
            0 20px 48px rgba(0,0,0,0.42),
            0 0 0 1px rgba(160,110,50,0.4),
            inset 0 1px 0 rgba(255,215,155,0.28);
          overflow: hidden;
          transform: rotateZ(-6deg) rotateX(10deg);
          animation: demoCardFloat 4s ease-in-out infinite;
          animation-delay: -2s;
          will-change: transform;
        }
        .demo-wood-card::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(115deg, transparent 25%, rgba(255,240,200,0.16) 50%, transparent 75%);
          background-size: 250% 100%;
          animation: demoShimmer 5s linear infinite;
        }
        .demo-wood-card-inner {
          position: absolute;
          inset: 0;
          z-index: 1;
          padding: 1.1rem 1.2rem;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        .demo-wood-name {
          font-size: 0.78rem; font-weight: 700;
          color: rgba(255,238,195,0.92);
          letter-spacing: 0.12em;
          text-shadow: 0 1px 5px rgba(0,0,0,0.55);
          text-transform: uppercase;
        }
        .demo-wood-brand {
          font-size: 0.65rem; font-weight: 800;
          color: rgba(255,225,155,0.65);
          letter-spacing: 0.2em;
          text-transform: uppercase;
        }
        .demo-wood-nfc  { display: flex; flex-direction: column; align-items: flex-end; gap: 3px; }
        .demo-wood-arc {
          border: 2px solid rgba(255,230,148,0.58);
          border-radius: 9999px;
          border-left: none; border-top: none; border-bottom: none;
        }
        .demo-wood-arc:nth-child(1) { width: 0.55rem; height: 0.9rem; }
        .demo-wood-arc:nth-child(2) { width: 0.9rem;  height: 1.4rem; }
        .demo-wood-arc:nth-child(3) { width: 1.25rem; height: 1.9rem; }

        /* ===== NFC KEYCHAIN ===== */
        .demo-keychain-outer {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0;
          transform: rotateZ(-3deg);
          animation: demoCardFloat 4s ease-in-out infinite;
          animation-delay: -2s;
        }
        .demo-keychain-ring {
          width: 2rem;
          height: 1.2rem;
          border: 3px solid #7ab4b0;
          border-radius: 9999px 9999px 0 0;
          border-bottom: none;
          background: linear-gradient(90deg, #5a9090, #a0d0c8, #5a9090);
          box-shadow: 0 2px 8px rgba(0,0,0,0.35);
          position: relative;
          z-index: 2;
          margin-bottom: -1px;
        }
        .demo-keychain-tag {
          position: relative;
          width: 9.5rem;
          height: 5.5rem;
          border-radius: 1.3rem;
          background: linear-gradient(148deg, #183838, #0c2828, #1e4040, #102e2e);
          border: 1px solid rgba(78,205,196,0.38);
          box-shadow:
            0 18px 44px rgba(0,0,0,0.55),
            0 0 0 1px rgba(78,205,196,0.18),
            inset 0 1px 0 rgba(78,205,196,0.14);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.48rem;
          overflow: hidden;
        }
        .demo-keychain-tag::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at 50% 30%, rgba(78,205,196,0.14), transparent 68%);
        }
        .demo-keychain-tag::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(115deg, transparent 30%, rgba(78,205,196,0.1) 50%, transparent 70%);
          background-size: 250% 100%;
          animation: demoShimmer 5s linear infinite;
        }
        .demo-keychain-hole {
          width: 1.1rem;
          height: 1.1rem;
          border-radius: 9999px;
          background: #081a1a;
          border: 2px solid rgba(78,205,196,0.32);
          box-shadow: inset 0 2px 5px rgba(0,0,0,0.65);
          position: absolute;
          top: 0.55rem;
          left: 50%;
          transform: translateX(-50%);
        }
        .demo-keychain-nfc-wrap {
          position: relative;
          z-index: 1;
          margin-top: 0.85rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
        }
        .demo-keychain-arc {
          border: 2px solid rgba(78,205,196,0.72);
          border-radius: 9999px;
          border-left: none; border-right: none; border-bottom: none;
        }
        .demo-keychain-arc:nth-child(1) { width: 0.9rem;  height: 0.5rem; }
        .demo-keychain-arc:nth-child(2) { width: 1.45rem; height: 0.8rem; }
        .demo-keychain-arc:nth-child(3) { width: 2rem;    height: 1.1rem; }
        .demo-keychain-dot {
          width: 0.38rem; height: 0.38rem;
          border-radius: 9999px;
          background: rgba(78,205,196,0.95);
          box-shadow: 0 0 7px rgba(78,205,196,0.85);
        }
        .demo-keychain-label {
          font-size: 0.55rem; font-weight: 800;
          letter-spacing: 0.16em;
          color: rgba(78,205,196,0.72);
          text-transform: uppercase;
          position: relative; z-index: 1;
        }

        /* ===== NFC TABLE STAND ===== */
        .demo-stand-outer {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0;
          animation: demoCardFloat 4.5s ease-in-out infinite;
          animation-delay: -2s;
        }
        .demo-stand-card {
          position: relative;
          width: 7.5rem;
          height: 10.2rem;
          border-radius: 0.9rem;
          background: linear-gradient(168deg, #1a2e2e, #0c2020, #1a3636);
          border: 1px solid rgba(78,205,196,0.38);
          box-shadow:
            0 18px 44px rgba(0,0,0,0.55),
            0 0 0 1px rgba(78,205,196,0.14),
            inset 0 1px 0 rgba(78,205,196,0.12);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
          padding: 0.85rem 0.65rem;
        }
        .demo-stand-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at 50% 22%, rgba(78,205,196,0.15), transparent 62%);
        }
        .demo-stand-card::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(115deg, transparent 30%, rgba(78,205,196,0.09) 50%, transparent 70%);
          background-size: 250% 100%;
          animation: demoShimmer 5s linear infinite;
        }
        .demo-stand-brand {
          font-size: 0.62rem; font-weight: 800;
          color: rgba(78,205,196,0.82);
          letter-spacing: 0.16em;
          text-transform: uppercase;
          position: relative; z-index: 1;
        }
        .demo-stand-nfc-wrap {
          position: relative; z-index: 1;
          display: flex; flex-direction: column; align-items: center; gap: 3px;
        }
        .demo-stand-arc {
          border: 2px solid rgba(78,205,196,0.68);
          border-radius: 9999px;
          border-left: none; border-right: none; border-bottom: none;
        }
        .demo-stand-arc:nth-child(1) { width: 1rem;   height: 0.55rem; }
        .demo-stand-arc:nth-child(2) { width: 1.6rem;  height: 0.88rem; }
        .demo-stand-arc:nth-child(3) { width: 2.2rem;  height: 1.2rem;  }
        .demo-stand-dot {
          width: 0.42rem; height: 0.42rem;
          border-radius: 9999px;
          background: rgba(78,205,196,0.95);
          box-shadow: 0 0 9px rgba(78,205,196,0.82);
        }
        .demo-stand-name {
          font-size: 0.6rem;
          color: rgba(255,255,255,0.55);
          letter-spacing: 0.09em;
          position: relative; z-index: 1;
        }
        .demo-stand-base {
          position: relative;
          width: 9.8rem;
          height: 1.6rem;
        }
        .demo-stand-slot {
          position: absolute;
          left: 50%; top: 0;
          transform: translateX(-50%);
          width: 8rem; height: 0.85rem;
          background: linear-gradient(180deg, #182828, #0c1c1c);
          border: 1px solid rgba(78,205,196,0.28);
          border-top: none;
          border-radius: 0 0 0.5rem 0.5rem;
        }
        .demo-stand-foot {
          position: absolute;
          bottom: 0; left: 50%;
          transform: translateX(-50%);
          width: 9.8rem; height: 0.78rem;
          background: linear-gradient(180deg, #1a2828, #0a1818);
          border-radius: 0.32rem;
          border: 1px solid rgba(78,205,196,0.22);
          box-shadow: 0 8px 22px rgba(0,0,0,0.45);
        }

        @media (max-width: 1024px) {
          .demo-hero-content {
            gap: 2.25rem;
          }

          .demo-mockup-col {
            margin-top: 0.5rem;
          }

          .demo-mockup-wrap {
            height: 31.5rem;
            margin-top: 1rem;
          }

          .demo-phone-wrap {
            transform: translateX(-50%) scale(0.86);
            top: -1.25rem;
          }

          .demo-phone-rings {
            width: 23rem;
            height: 23rem;
          }

          .demo-product-mockup {
            bottom: 0;
          }
        }

        @media (max-width: 767px) {
          .demo-hero-content {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }

          .demo-hero-copy {
            text-align: center;
          }

          .demo-hero-title {
            font-size: 2rem !important;
            line-height: 1.3 !important;
            margin-bottom: 1rem !important;
          }

          .demo-hero-subtitle {
            font-size: 1rem !important;
            line-height: 1.7 !important;
            margin-bottom: 1.25rem !important;
            padding-inline: 0.15rem;
          }

          .demo-type-wrap {
            margin-bottom: 1.1rem !important;
          }

          .demo-slider-main {
            grid-template-columns: auto minmax(0, 1fr) auto;
            gap: 0.45rem;
          }

          .demo-type-scroll {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 0.7rem 0.85rem;
          }

          .demo-slider-item {
            padding-bottom: 0.55rem;
          }

          .demo-slider-index {
            font-size: 0.58rem;
          }

          .demo-slider-label {
            font-size: 0.72rem;
          }

          .demo-cta-row {
            flex-direction: column;
            align-items: stretch !important;
            gap: 0.7rem !important;
          }

          .demo-cta-row > span {
            align-self: center;
          }

          .demo-cta-row > button {
            width: 100%;
            justify-content: center;
          }

          .demo-stats {
            justify-content: center;
            gap: 1.1rem;
            margin-top: 1.25rem !important;
            flex-wrap: wrap;
          }

          .demo-mockup-col {
            margin-top: 0.35rem;
          }

          .demo-mockup-wrap {
            height: 24.5rem;
            width: min(100%, 22rem);
          }

          .demo-phone-wrap {
            transform: translateX(-50%) scale(0.65);
            top: -4.6rem;
          }

          .demo-phone-rings {
            width: 18.2rem;
            height: 18.2rem;
            top: 38%;
          }

          .demo-product-mockup {
            bottom: -0.65rem;
            height: 11.5rem;
          }

          .demo-metal-card,
          .demo-wood-card {
            width: min(17rem, 82vw);
          }

          .demo-keychain-tag {
            width: 8.5rem;
            height: 5rem;
          }

          .demo-stand-card {
            width: 6.8rem;
            height: 9.2rem;
          }

          .demo-stand-base {
            width: 8.8rem;
          }

          .demo-stand-foot {
            width: 8.8rem;
          }
        }

        @keyframes demoPhoneFloat {
          0%, 100% { transform: translateX(-50%) translateY(-8px); }
          50% { transform: translateX(-50%) translateY(8px); }
        }

        @keyframes demoCardFloat {
          0%, 100% { transform: translateX(-56%) rotateZ(-8deg) rotateX(12deg) translateY(-5px); }
          50% { transform: translateX(-56%) rotateZ(-8deg) rotateX(12deg) translateY(5px); }
        }


        @keyframes demoShimmer {
          0% { background-position: -100% 0; }
          100% { background-position: 200% 0; }
        }

        @keyframes demoRingPulse {
          0% { transform: translate(-50%, -50%) scale(1); opacity: 0.6; }
          100% { transform: translate(-50%, -50%) scale(2.8); opacity: 0; }
        }
      `}</style>

      {!heroOnly && (
        <div className="bg-[#0f4c3a] text-white text-center py-2.5 text-sm font-medium tracking-wide">
          🚚&nbsp; توصيل مجاني لطلبات 250 ريال فأكثر &nbsp;|&nbsp; اطلب الآن واستلم خلال يومين
        </div>
      )}

      {!heroOnly && <Navbar />}

      <section
        className="demo-hero-section relative min-h-[92vh] flex items-center overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0a0a0a 0%, #0d1b2a 40%, #0a3d2e 100%)' }}
      >
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div
            className="absolute top-[-120px] right-[-80px] w-[500px] h-[500px] rounded-full opacity-20"
            style={{ background: 'radial-gradient(circle, #14b8a6, transparent 70%)' }}
            animate={{ scale: [1, 1.15, 1], opacity: [0.18, 0.28, 0.18] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute bottom-[-100px] left-[-60px] w-[400px] h-[400px] rounded-full opacity-15"
            style={{ background: 'radial-gradient(circle, #6366f1, transparent 70%)' }}
            animate={{ scale: [1, 1.2, 1], opacity: [0.12, 0.22, 0.12] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          />
        </div>

        <div className="container mx-auto px-4 md:px-10 relative z-10 pt-24 md:pt-28 pb-16 md:pb-20">
          <div className="demo-hero-content grid lg:grid-cols-2 gap-14 items-center">
            <div className="demo-hero-copy">
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.1 }}
              >
                <span className="inline-flex items-center gap-2 bg-teal-500/15 text-teal-300 text-sm font-semibold px-4 py-1.5 rounded-full border border-teal-500/30 mb-6">
                  <Wifi className="h-4 w-4" />
                  {isRTL ? 'تقنية NFC الذكية' : 'Smart NFC Technology'}
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="demo-hero-title text-4xl md:text-5xl lg:text-6xl font-black mb-6"
                style={{ fontFamily: isRTL ? "'Cairo', sans-serif" : "'Inter', sans-serif", color: '#fff', lineHeight: '1.55' }}
              >
                <span className="text-white">{isRTL ? 'استعد للتعريف ' : 'Ready to introduce '}</span>
                <AnimatePresence mode="wait">
                  <motion.span
                    key={wordIdx}
                    initial={{ opacity: 0, y: 18, filter: 'blur(6px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, y: -18, filter: 'blur(6px)' }}
                    transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
                    style={{
                      display: 'inline-block',
                      background: 'linear-gradient(to left, #5eead4, #14b8a6)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    {CYCLING_WORDS[wordIdx]}
                  </motion.span>
                </AnimatePresence>
                <br />
                <span
                  style={{
                    background: 'linear-gradient(to left, #5eead4, #14b8a6)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  {isRTL ? 'بطريقة عصرية' : 'the modern way'}
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.35 }}
                className="demo-hero-subtitle text-slate-300 text-lg md:text-xl mb-8 leading-relaxed"
              >
                {isRTL ? 'الجيل الجديد من كروت التعارف في عالم الأعمال' : 'The next generation of business networking cards'}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.5 }}
                className="demo-type-wrap mb-10"
              >
                <div className="demo-product-slider">
                  <div className="demo-slider-main">
                    <button
                      onClick={() => setSelectedProductTypeIdx((prev) => (prev - 1 + HERO_PRODUCT_TYPES.length) % HERO_PRODUCT_TYPES.length)}
                      className="demo-type-nav"
                      aria-label={isRTL ? 'المنتج السابق' : 'Previous product'}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    <div className="demo-type-scroll">
                      {HERO_PRODUCT_TYPES.map((item, i) => (
                        <button
                          key={i}
                          onClick={() => setSelectedProductTypeIdx(i)}
                          className={`demo-slider-item ${selectedProductTypeIdx === i ? 'is-active' : ''}`}
                          aria-pressed={selectedProductTypeIdx === i}
                        >
                          <div className="demo-slider-index">{String(i + 1).padStart(2, '0')}</div>
                          <div className="demo-slider-label">{isRTL ? item.labelAr : item.labelEn}</div>
                          <span className="demo-slider-indicator-track" />
                          <motion.span
                            className="demo-slider-indicator"
                            initial={false}
                            animate={{ scaleX: selectedProductTypeIdx === i ? 1 : 0 }}
                            transition={{ duration: 0.25, ease: 'easeInOut' }}
                            style={{ transformOrigin: isRTL ? 'right center' : 'left center' }}
                          />
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => setSelectedProductTypeIdx((prev) => (prev + 1) % HERO_PRODUCT_TYPES.length)}
                      className="demo-type-nav"
                      aria-label={isRTL ? 'المنتج التالي' : 'Next product'}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.65 }}
                className="demo-cta-row flex flex-wrap items-center gap-3"
              >
                <motion.button
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate('/customize')}
                  className="inline-flex items-center gap-2 bg-gradient-to-l from-teal-600 via-cyan-600 to-teal-500 hover:from-teal-500 hover:via-cyan-500 hover:to-teal-400 text-white font-bold px-8 py-4 rounded-2xl shadow-lg shadow-teal-600/30 transition-all text-base cursor-pointer border border-white/20"
                >
                  <ShoppingCart className="h-5 w-5" />
                  {isRTL ? 'اشتر بطاقة NFC' : 'Buy NFC Card'}
                </motion.button>
                <span className="text-sm font-medium text-slate-400">{isRTL ? 'أو' : 'or'}</span>
                <motion.button
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleCreateDigital}
                  className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold px-8 py-4 rounded-2xl border border-white/20 shadow-lg shadow-slate-900/20 transition-all text-base cursor-pointer backdrop-blur-sm"
                >
                  <LogIn className="h-5 w-5" />
                  {isRTL ? 'أنشئ بطاقة رقمية' : 'Create Digital Card'}
                </motion.button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.9 }}
                className="demo-stats flex gap-8 mt-12"
              >
                {[
                  { value: '+10', labelAr: 'منتجات NFC', labelEn: 'NFC Products' },
                  { value: '+20', labelAr: 'قالب كرت ⭐', labelEn: 'Card Templates' },
                  { value: '2 يوم', labelAr: 'توصيل سريع', labelEn: '2 days Delivery' },
                ].map((stat, i) => (
                  <div key={i} className="text-center">
                    <div className="text-2xl font-black text-teal-400">{stat.value}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{isRTL ? stat.labelAr : stat.labelEn}</div>
                  </div>
                ))}
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.88 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="demo-mockup-col relative flex justify-center"
            >
              <div className="demo-mockup-wrap">
                <div className="demo-phone-rings" aria-hidden="true">
                  <span className="demo-phone-ring" />
                  <span className="demo-phone-ring r2" />
                  <span className="demo-phone-ring r3" />
                </div>

                <div className="demo-phone-wrap">
                  <div className="demo-phone-glow" />
                  <article className="demo-phone">
                    <div className="demo-screen">
                      {renderPhoneExperience()}
                    </div>
                  </article>
                </div>

                <div className="demo-product-mockup">
                  <AnimatePresence mode="wait">
                    {selectedProductTypeIdx === 0 && (
                      <motion.div
                        key="metal"
                        initial={{ opacity: 0, scale: 0.84, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.88, y: -14 }}
                        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                      >
                        <div className="demo-metal-card">
                          <div className="demo-metal-card-inner">
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                              <div className="demo-chip-block" />
                              <div className="demo-nfc-symbol">
                                <span className="demo-nfc-arc" />
                                <span className="demo-nfc-arc" />
                                <span className="demo-nfc-arc" />
                              </div>
                            </div>
                            <div>
                              <div className="demo-metal-name">Ahmed Al-Rashidi</div>
                              <div className="demo-metal-brand">RAWAJCARD · NFC</div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {selectedProductTypeIdx === 1 && (
                      <motion.div
                        key="wood"
                        initial={{ opacity: 0, scale: 0.84, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.88, y: -14 }}
                        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                      >
                        <div className="demo-wood-card">
                          <div className="demo-wood-card-inner">
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                              <div style={{
                                width: '2.4rem', height: '1.75rem', borderRadius: '0.28rem',
                                background: 'linear-gradient(135deg, rgba(255,238,195,0.28), rgba(255,215,130,0.18))',
                                border: '1px solid rgba(255,215,130,0.32)'
                              }} />
                              <div className="demo-wood-nfc">
                                <span className="demo-wood-arc" />
                                <span className="demo-wood-arc" />
                                <span className="demo-wood-arc" />
                              </div>
                            </div>
                            <div>
                              <div className="demo-wood-name">Ahmed Al-Rashidi</div>
                              <div className="demo-wood-brand">RAWAJCARD · NFC</div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {selectedProductTypeIdx === 2 && (
                      <motion.div
                        key="keychain"
                        initial={{ opacity: 0, scale: 0.84, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.88, y: -14 }}
                        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                      >
                        <div className="demo-keychain-outer">
                          <div className="demo-keychain-ring" />
                          <div className="demo-keychain-tag">
                            <div className="demo-keychain-hole" />
                            <div className="demo-keychain-nfc-wrap">
                              <span className="demo-keychain-arc" />
                              <span className="demo-keychain-arc" />
                              <span className="demo-keychain-arc" />
                              <div className="demo-keychain-dot" />
                            </div>
                            <div className="demo-keychain-label">RAWAJCARD</div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {selectedProductTypeIdx === 3 && (
                      <motion.div
                        key="stand"
                        initial={{ opacity: 0, scale: 0.84, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.88, y: -14 }}
                        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                      >
                        <div className="demo-stand-outer">
                          <div className="demo-stand-card">
                            <div className="demo-stand-brand">RAWAJCARD</div>
                            <div className="demo-stand-nfc-wrap">
                              <span className="demo-stand-arc" />
                              <span className="demo-stand-arc" />
                              <span className="demo-stand-arc" />
                              <div className="demo-stand-dot" />
                            </div>
                            <div className="demo-stand-name">Ahmed Al-Rashidi</div>
                          </div>
                          <div className="demo-stand-base">
                            <div className="demo-stand-slot" />
                            <div className="demo-stand-foot" />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {!heroOnly && <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />}
    </div>
  );
}
