import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { createPageUrl } from '@/utils';
import Navbar from '@/components/landing/Navbar';
import LoginModal from '@/components/auth/LoginModal';
import { useLanguage } from '@/components/shared/LanguageContext';
import { useAuth } from '@/lib/AuthContext';
import {
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  LogIn,
  Gem,
  Shield,
  RectangleHorizontal,
  Monitor,
  KeyRound,
  Smartphone,
  Phone,
  Mail,
  ContactRound,
  MessageCircle,
  Instagram,
} from 'lucide-react';

const CYCLING_WORDS_AR = ['بنفسك', 'بشركتك', 'بفكرتك'];
const CYCLING_WORDS_EN = ['yourself', 'your business', 'your idea'];

const HERO_PRODUCT_TYPES = [
  {
    key: 'gold',
    labelAr: 'معدني ذهبي',
    labelEn: 'Gold Metal',
    icon: Gem,
  },
  {
    key: 'silver',
    labelAr: 'معدني فضي',
    labelEn: 'Silver Metal',
    icon: Gem,
  },
  {
    key: 'black',
    labelAr: 'معدني أسود',
    labelEn: 'Metal Black',
    icon: Shield,
  },
  {
    key: 'wood',
    labelAr: 'بطاقة خشبية',
    labelEn: 'Wooden Card',
    icon: RectangleHorizontal,
  },
  {
    key: 'stand',
    labelAr: 'ستاند',
    labelEn: 'Table Stand',
    icon: Monitor,
  },
  {
    key: 'keychain',
    labelAr: 'تعليقة',
    labelEn: 'Keychain',
    icon: KeyRound,
  },
  {
    key: 'sticker',
    labelAr: 'ملصق جوال',
    labelEn: 'Phone Sticker',
    icon: Smartphone,
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
  const selectedProductType = HERO_PRODUCT_TYPES[selectedProductTypeIdx];

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
    if (selectedProductType?.key === 'wood') {
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

    if (selectedProductType?.key === 'keychain') {
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

    if (selectedProductType?.key === 'stand') {
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
    <div className="min-h-screen bg-slate-50 md:bg-indigo-950/60 pb-16 md:pb-0" dir={isRTL ? 'rtl' : 'ltr'} style={{ fontFamily: "'Tajawal', sans-serif" }}>
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
          grid-template-columns: repeat(7, minmax(0, 1fr));
          gap: 1rem;
          min-width: 0;
        }

        .demo-slider-item {
          position: relative;
          padding: 0 0 0.7rem;
          border: none;
          background: transparent;
          text-align: center;
          transition: opacity 0.2s ease, color 0.2s ease;
          opacity: 0.52;
        }

        .demo-slider-item:hover {
          opacity: 0.82;
        }

        .demo-slider-item.is-active {
          opacity: 1;
        }

        .demo-slider-icon {
          width: 1.9rem;
          height: 1.9rem;
          margin: 0 auto 0.38rem;
          display: grid;
          place-items: center;
          color: #8f7bff;
          background: transparent;
          border: none;
          box-shadow: none;
          filter: drop-shadow(0 0 6px rgba(140, 82, 255, 0.35));
          transition: all 0.25s ease;
        }

        .demo-slider-icon svg {
          stroke: currentColor;
          transition: stroke 0.25s ease, filter 0.25s ease;
        }

        .demo-slider-item:hover .demo-slider-icon {
          color: #a98bff;
          filter: drop-shadow(0 0 10px rgba(168, 85, 247, 0.48));
        }

        .demo-slider-item.is-active .demo-slider-icon {
          color: #bd9fff;
          filter: drop-shadow(0 0 14px rgba(192, 132, 252, 0.6));
        }

        .demo-slider-item.is-active .demo-slider-icon svg {
          stroke: url(#demoSliderGradient);
        }

        .demo-slider-label {
          font-size: 0.8rem;
          font-weight: 500;
          color: rgba(226, 232, 240, 0.9);
          line-height: 1.4;
        }

        .demo-slider-item.is-active .demo-slider-label {
          background: linear-gradient(to right, #38BDF8, #E879F9);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
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
          background: linear-gradient(90deg, #38BDF8, #E879F9);
          transform-origin: left center;
        }

        .demo-hero-section {
          overflow-x: hidden;
          overflow-y: visible;
          scroll-behavior: auto;
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
          width: 29rem;
          height: 29rem;
          pointer-events: none;
          z-index: 0;
        }

        .demo-phone-ring {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 10.5rem;
          height: 10.5rem;
          border-radius: 9999px;
          border: 1px solid rgba(56, 189, 248, 0.34);
          transform: translate(-50%, -50%) scale(1);
          animation: demoRingPulse 6s linear infinite;
          opacity: 0;
          will-change: transform, opacity;
        }

        .demo-phone-ring.r2 { animation-delay: 2s; }
        .demo-phone-ring.r3 { animation-delay: 4s; }
        .demo-phone-ring.r4 { animation-delay: 1s; border-color: rgba(232, 121, 249, 0.34); }

        .demo-ring-orbit {
          position: absolute;
          inset: 10%;
          border-radius: 9999px;
          border: 1px solid rgba(56, 189, 248, 0.2);
          box-shadow: inset 0 0 0 1px rgba(232, 121, 249, 0.08);
        }

        .demo-ring-orbit.o2 {
          inset: 18%;
          border-color: rgba(232, 121, 249, 0.22);
          transform: rotate(22deg);
        }

        .demo-ring-orbit.o3 {
          inset: 26%;
          border-color: rgba(56, 189, 248, 0.18);
          transform: rotate(-16deg);
        }

        .demo-fancy-circles {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 2;
        }

        .demo-fancy-circle {
          position: absolute;
          width: 2.5rem;
          height: 2.5rem;
          border-radius: 9999px;
          display: grid;
          place-items: center;
          color: rgba(225, 243, 255, 0.95);
          background: rgba(30, 27, 75, 0.42);
          border: 1px solid rgba(56, 189, 248, 0.42);
          box-shadow: 0 0 20px rgba(56, 189, 248, 0.2), inset 0 1px 0 rgba(255,255,255,0.16);
          backdrop-filter: blur(10px);
          animation: demoIconFloat 5.5s ease-in-out infinite;
        }

        .demo-fancy-circle.c1 { top: 18%; left: 8%; }
        .demo-fancy-circle.c2 { top: 31%; right: 9%; animation-delay: 0.8s; border-color: rgba(232, 121, 249, 0.44); }
        .demo-fancy-circle.c3 { top: 48%; left: 4%; animation-delay: 1.3s; }
        .demo-fancy-circle.c4 { top: 62%; right: 5%; animation-delay: 1.9s; border-color: rgba(232, 121, 249, 0.44); }
        .demo-fancy-circle.c5 { bottom: 15%; left: 12%; animation-delay: 2.4s; }

        .demo-phone-glow {
          position: absolute;
          width: 14rem;
          height: 18rem;
          left: 50%;
          top: 44%;
          transform: translate(-50%, -50%);
          background: rgba(56, 189, 248, 0.18);
          filter: blur(70px);
          border-radius: 9999px;
        }

        .demo-phone {
          position: relative;
          width: 17.5rem;
          height: 35rem;
          border-radius: 2.2rem;
          background: #1c2535;
          border: 1px solid rgba(56, 189, 248, 0.25);
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.35);
          overflow: hidden;
        }

        .dark .demo-phone {
          background: #1c2535;
          border-color: rgba(56, 189, 248, 0.15);
        }

        html:not(.dark) .demo-phone {
          background: #e0e8e8;
          border-color: rgba(56, 189, 248, 0.25);
        }

        .demo-screen {
          position: absolute;
          inset: 0.5rem;
          border-radius: 1.8rem;
          background: linear-gradient(155deg, rgba(255, 255, 255, 0.96), rgba(240, 248, 248, 0.9));
          border: 1px solid rgba(56, 189, 248, 0.22);
          backdrop-filter: blur(12px);
          padding: 1rem;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .demo-digital-card {
          position: relative;
          width: 100%;
          border-radius: 1.25rem;
          background: #ffffff;
          border: 1px solid rgba(56, 189, 248, 0.22);
          box-shadow: 0 16px 30px rgba(12, 54, 66, 0.14);
          overflow: hidden;
          color: #12313b;
        }

        .demo-digital-top {
          height: 4.2rem;
          background: linear-gradient(120deg, rgba(56, 189, 248, 0.28), rgba(232, 121, 249, 0.35));
        }

        .demo-avatar {
          width: 4rem;
          height: 4rem;
          border-radius: 9999px;
          margin-top: -2rem;
          margin-inline: auto;
          border: 3px solid #ffffff;
          box-shadow: 0 10px 18px rgba(56, 189, 248, 0.2);
          background: linear-gradient(135deg, #38BDF8, #E879F9);
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
          background: rgba(56, 189, 248, 0.25);
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
          border: 1px solid rgba(56, 189, 248, 0.22);
          padding: 0.42rem 0.5rem;
          font-size: 0.68rem;
          color: #29515d;
        }

        .demo-row-icon {
          width: 1.4rem;
          height: 1.4rem;
          border-radius: 9999px;
          background: #ffffff;
          border: 1px solid rgba(56, 189, 248, 0.25);
          color: #38BDF8;
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
          border: 1px solid rgba(56, 189, 248, 0.26);
          color: #38BDF8;
          font-size: 0.62rem;
          font-weight: 700;
          padding: 0.25rem 0.52rem;
        }

        .demo-qr {
          width: 2.45rem;
          height: 2.45rem;
          border-radius: 0.45rem;
          border: 1px solid rgba(56, 189, 248, 0.25);
          background:
            linear-gradient(90deg, rgba(56, 189, 248, 0.18) 1px, transparent 1px),
            linear-gradient(rgba(56, 189, 248, 0.18) 1px, transparent 1px),
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
          background: linear-gradient(135deg, #38BDF8, #E879F9);
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
          height: 15rem;
          display: flex;
          align-items: flex-end;
          justify-content: center;
        }

        /* ===== METAL GOLD CARD ===== */
        .demo-metal-card {
          position: relative;
          --demo-card-base-transform: rotateZ(-6deg) rotateX(10deg);
          width: min(18.5rem, 78vw);
          aspect-ratio: 1.586;
          border-radius: 1rem;
          background: linear-gradient(135deg,
            #8f6422 0%,
            #b88a35 8%,
            #d7af58 26%,
            #e8c872 48%,
            #c99d47 69%,
            #b07f2c 86%,
            #8c6122 100%
          );
          box-shadow:
            0 22px 50px rgba(0,0,0,0.5),
            0 0 0 1px rgba(124, 84, 24, 0.55),
            inset 0 1px 0 rgba(255,230,170,0.4),
            inset 0 -1px 0 rgba(80,55,18,0.45);
          overflow: hidden;
          animation: demoCardFloat 4s ease-in-out infinite;
          animation-delay: -2s;
          will-change: transform;
        }
        .demo-metal-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: repeating-linear-gradient(
            92deg,
            transparent 0px,
            rgba(255,244,212,0.08) 1px,
            transparent 2px,
            transparent 6px
          );
          z-index: 1;
        }
        .demo-metal-card::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(115deg, transparent 15%, rgba(255,245,214,0.36) 48%, transparent 82%);
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
          align-items: center;
          text-align: center;
        }
        .demo-nfc-icon {
          position: relative;
          width: 2.7rem;
          height: 2.7rem;
          border-radius: 9999px;
          display: grid;
          place-items: center;
          color: inherit;
        }
        .demo-nfc-dot {
          width: 0.38rem;
          height: 0.38rem;
          border-radius: 9999px;
          background: currentColor;
          opacity: 0.95;
          position: relative;
          z-index: 2;
        }
        .demo-nfc-wave {
          position: absolute;
          border-radius: 9999px;
          border: 2px solid currentColor;
          border-left: none;
          border-top: none;
          border-bottom: none;
          opacity: 0.92;
        }
        .demo-nfc-wave.w1 { width: 0.8rem; height: 1.2rem; }
        .demo-nfc-wave.w2 { width: 1.35rem; height: 1.85rem; }
        .demo-nfc-wave.w3 { width: 1.9rem; height: 2.45rem; }

        .demo-metal-nfc-badge {
          width: 3.2rem;
          height: 3.2rem;
          border-radius: 0.65rem;
          border: 1px solid rgba(96, 66, 22, 0.4);
          background: linear-gradient(180deg, rgba(247, 223, 155, 0.65), rgba(220, 183, 98, 0.62));
          color: rgba(77, 46, 15, 0.9);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.38), 0 8px 16px rgba(76,53,16,0.2);
          display: grid;
          place-items: center;
        }
        .demo-metal-name {
          font-size: 0.75rem; font-weight: 800;
          color: rgba(77, 46, 15, 0.92);
          letter-spacing: 0.13em;
          text-shadow: 0 1px 0 rgba(255,230,170,0.35);
          text-transform: uppercase;
        }
        .demo-metal-brand {
          font-size: 0.6rem; font-weight: 800;
          color: rgba(90, 60, 22, 0.72);
          letter-spacing: 0.17em;
          text-transform: uppercase;
        }

        /* ===== SILVER METAL CARD ===== */
        .demo-silver-card {
          position: relative;
          --demo-card-base-transform: rotateZ(-5deg) rotateX(10deg);
          width: min(18.5rem, 78vw);
          aspect-ratio: 1.586;
          border-radius: 1rem;
          background: linear-gradient(135deg,
            #7c838a 0%,
            #a8b0b8 14%,
            #d7dde2 34%,
            #b9c1c9 52%,
            #f0f3f6 68%,
            #9fa8b1 86%,
            #767f88 100%
          );
          border: 1px solid rgba(113, 122, 131, 0.55);
          box-shadow:
            0 22px 50px rgba(0,0,0,0.45),
            inset 0 1px 0 rgba(255,255,255,0.55),
            inset 0 -1px 0 rgba(77,86,96,0.45);
          overflow: hidden;
          animation: demoCardFloat 4s ease-in-out infinite;
          animation-delay: -2s;
          will-change: transform;
        }
        .demo-silver-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: repeating-linear-gradient(92deg, transparent 0px, rgba(255,255,255,0.1) 1px, transparent 2px, transparent 6px);
          z-index: 1;
        }
        .demo-silver-card::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(115deg, transparent 15%, rgba(255,255,255,0.46) 48%, transparent 82%);
          background-size: 250% 100%;
          animation: demoShimmer 4s linear infinite;
          z-index: 2;
        }
        .demo-silver-card-inner {
          position: absolute;
          inset: 0;
          z-index: 3;
          padding: 1.1rem 1.2rem;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          align-items: center;
          text-align: center;
        }
        .demo-silver-nfc-badge {
          width: 3.2rem;
          height: 3.2rem;
          border-radius: 0.65rem;
          border: 1px solid rgba(118,128,138,0.45);
          background: linear-gradient(180deg, rgba(236,241,245,0.78), rgba(191,201,210,0.66));
          color: rgba(70,80,90,0.9);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.65), 0 8px 16px rgba(70,80,90,0.2);
          display: grid;
          place-items: center;
        }
        .demo-silver-name {
          font-size: 0.75rem;
          font-weight: 800;
          color: rgba(56,67,78,0.9);
          letter-spacing: 0.13em;
          text-transform: uppercase;
        }
        .demo-silver-brand {
          font-size: 0.6rem;
          font-weight: 800;
          color: rgba(86,98,110,0.78);
          letter-spacing: 0.17em;
          text-transform: uppercase;
        }

        /* ===== METAL BLACK CARD ===== */
        .demo-black-card {
          position: relative;
          --demo-card-base-transform: rotateZ(-5deg) rotateX(10deg);
          width: min(18.5rem, 78vw);
          aspect-ratio: 1.586;
          border-radius: 1rem;
          background: linear-gradient(145deg,
            #05080f 0%,
            #0b1220 22%,
            #101829 45%,
            #090e18 66%,
            #05070c 100%
          );
          border: 1px solid rgba(107, 124, 155, 0.38);
          box-shadow:
            0 24px 52px rgba(0,0,0,0.6),
            inset 0 1px 0 rgba(255,255,255,0.08),
            inset 0 -1px 0 rgba(0,0,0,0.55);
          overflow: hidden;
          animation: demoCardFloat 4s ease-in-out infinite;
          animation-delay: -2s;
          will-change: transform;
        }
        .demo-black-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: repeating-linear-gradient(95deg, transparent 0px, rgba(255,255,255,0.04) 1px, transparent 2px, transparent 6px);
          z-index: 1;
        }
        .demo-black-card::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(110deg, transparent 20%, rgba(56, 189, 248, 0.18) 45%, rgba(232, 121, 249, 0.22) 55%, transparent 82%);
          background-size: 260% 100%;
          animation: demoShimmer 4.8s linear infinite;
          z-index: 2;
        }
        .demo-black-card-inner {
          position: absolute;
          inset: 0;
          z-index: 3;
          padding: 1.1rem 1.2rem;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          align-items: center;
          text-align: center;
        }
        .demo-black-nfc-badge {
          width: 3.2rem;
          height: 3.2rem;
          border-radius: 0.65rem;
          border: 1px solid rgba(91, 108, 140, 0.45);
          background: linear-gradient(180deg, rgba(25, 36, 58, 0.85), rgba(10, 15, 27, 0.92));
          color: rgba(199, 230, 255, 0.92);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.1), 0 8px 16px rgba(0,0,0,0.35);
          display: grid;
          place-items: center;
        }
        .demo-black-name {
          font-size: 0.75rem;
          font-weight: 800;
          color: rgba(225, 241, 255, 0.95);
          letter-spacing: 0.13em;
          text-transform: uppercase;
        }
        .demo-black-brand {
          font-size: 0.6rem;
          font-weight: 800;
          color: rgba(150, 177, 210, 0.8);
          letter-spacing: 0.17em;
          text-transform: uppercase;
        }

        /* ===== RECTANGULAR PHONE STICKER ===== */
        .demo-sticker-card {
          position: relative;
          --demo-card-base-transform: rotateZ(-8deg) rotateX(8deg);
          width: min(16rem, 70vw);
          height: 4.9rem;
          border-radius: 0.9rem;
          background: linear-gradient(135deg, #0f2d2b, #173f3c 45%, #0f2b29 100%);
          border: 1px solid rgba(102, 155, 150, 0.42);
          box-shadow:
            0 18px 38px rgba(0,0,0,0.42),
            inset 0 1px 0 rgba(188,255,247,0.14),
            inset 0 -1px 0 rgba(0,0,0,0.34);
          overflow: hidden;
          animation: demoCardFloat 4s ease-in-out infinite;
          animation-delay: -2s;
          will-change: transform;
        }
        .demo-sticker-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(115deg, transparent 20%, rgba(198,255,245,0.16) 52%, transparent 82%);
          background-size: 220% 100%;
          animation: demoShimmer 5s linear infinite;
        }
        .demo-sticker-card-inner {
          position: absolute;
          inset: 0;
          z-index: 1;
          padding: 0.7rem 0.85rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.6rem;
        }
        .demo-sticker-title {
          color: rgba(208, 247, 241, 0.95);
          font-size: 0.72rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          line-height: 1.2;
        }
        .demo-sticker-sub {
          color: rgba(162, 218, 210, 0.85);
          font-size: 0.56rem;
          margin-top: 0.18rem;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }
        .demo-sticker-nfc-wrap {
          width: 2.4rem;
          height: 2.4rem;
          border-radius: 0.65rem;
          border: 1px solid rgba(126, 191, 184, 0.45);
          background: radial-gradient(circle at 35% 30%, rgba(136,223,211,0.26), rgba(11,46,43,0.52));
          color: rgba(193, 249, 241, 0.94);
          display: grid;
          place-items: center;
          flex-shrink: 0;
        }
        .demo-sticker-tab {
          position: absolute;
          right: 0.7rem;
          bottom: -0.12rem;
          width: 2rem;
          height: 0.3rem;
          border-radius: 9999px;
          background: linear-gradient(90deg, rgba(220,255,250,0.65), rgba(94,194,183,0.45));
          filter: blur(0.2px);
        }

        /* ===== WOODEN CARD ===== */
        .demo-wood-card {
          position: relative;
          --demo-card-base-transform: rotateZ(-6deg) rotateX(10deg);
          width: min(18.5rem, 78vw);
          aspect-ratio: 1.586;
          border-radius: 0.92rem;
          background:
            radial-gradient(120% 110% at 15% 85%, rgba(75, 35, 14, 0.28), transparent 58%),
            radial-gradient(90% 80% at 80% 18%, rgba(255, 210, 140, 0.2), transparent 60%),
            repeating-linear-gradient(7deg, rgba(69,32,12,0.12) 0px, rgba(69,32,12,0.12) 1px, transparent 2px, transparent 9px),
            repeating-linear-gradient(11deg, rgba(255,225,182,0.08) 0px, rgba(255,225,182,0.08) 1px, transparent 3px, transparent 16px),
            linear-gradient(135deg,
              #5f341d 0%, #8b4f2a 12%, #aa6332 28%, #7f4524 48%,
              #b06a38 64%, #744021 82%, #5a311b 100%
            );
          box-shadow:
            0 22px 50px rgba(0,0,0,0.45),
            0 0 0 1px rgba(96, 54, 23, 0.5),
            inset 0 1px 0 rgba(255,220,170,0.26),
            inset 0 -1px 0 rgba(65,33,17,0.4);
          overflow: hidden;
          animation: demoCardFloat 4s ease-in-out infinite;
          animation-delay: -2s;
          will-change: transform;
        }
        .demo-wood-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(42% 34% at 24% 30%, rgba(82,46,22,0.26) 0%, rgba(82,46,22,0.06) 55%, transparent 65%),
            radial-gradient(35% 30% at 74% 68%, rgba(77,42,20,0.2) 0%, rgba(77,42,20,0.04) 55%, transparent 65%);
          z-index: 0;
        }
        .demo-wood-card::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(115deg, transparent 20%, rgba(255,238,198,0.18) 50%, transparent 80%);
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
          align-items: center;
          text-align: center;
        }
        .demo-wood-nfc-badge {
          width: 3rem;
          height: 3rem;
          border-radius: 9999px;
          border: 1px solid rgba(255,215,160,0.34);
          background: radial-gradient(circle at 30% 30%, rgba(255,225,185,0.22), rgba(84,46,23,0.34));
          color: rgba(255,230,185,0.9);
          display: grid;
          place-items: center;
          box-shadow: inset 0 1px 0 rgba(255,235,200,0.2), 0 8px 18px rgba(43,21,10,0.24);
        }
        .demo-wood-seal {
          width: 2.6rem;
          height: 2.6rem;
          border-radius: 9999px;
          display: grid;
          place-items: center;
          font-size: 0.56rem;
          font-weight: 800;
          letter-spacing: 0.09em;
          color: rgba(255,230,192,0.9);
          border: 1px solid rgba(255,210,160,0.32);
          background: radial-gradient(circle at 30% 30%, rgba(255,225,175,0.24), rgba(78,43,21,0.4));
          box-shadow: inset 0 1px 0 rgba(255,230,180,0.2), 0 8px 16px rgba(48,24,11,0.26);
        }
        .demo-wood-name {
          font-size: 0.76rem; font-weight: 700;
          color: rgba(255,235,200,0.96);
          letter-spacing: 0.12em;
          text-shadow: 0 1px 4px rgba(0,0,0,0.45);
          text-transform: uppercase;
        }
        .demo-wood-brand {
          font-size: 0.6rem; font-weight: 800;
          color: rgba(255,214,145,0.72);
          letter-spacing: 0.16em;
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
          --demo-card-base-transform: rotateZ(-2deg);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.22rem;
          animation: demoCardFloat 4s ease-in-out infinite;
          animation-delay: -2s;
        }
        .demo-keychain-ring {
          width: 2.45rem;
          height: 2.45rem;
          border: 3px solid #b5bec3;
          border-radius: 9999px;
          background: radial-gradient(circle at 30% 30%, #f9fbfc, #b2bbc0 72%);
          box-shadow: 0 4px 10px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.55);
          position: relative;
          z-index: 2;
        }
        .demo-keychain-ring::after {
          content: '';
          position: absolute;
          width: 0.62rem;
          height: 0.62rem;
          border-radius: 9999px;
          background: #748188;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.25);
        }
        .demo-keychain-link {
          width: 0.9rem;
          height: 1.28rem;
          border-radius: 9999px;
          border: 2px solid #a6afb4;
          background: linear-gradient(180deg, #f2f5f6, #9fa8ad);
          box-shadow: 0 2px 6px rgba(0,0,0,0.22);
        }
        .demo-keychain-tag {
          position: relative;
          width: 7.6rem;
          height: 7.6rem;
          border-radius: 9999px;
          background: linear-gradient(148deg, #0f2020, #183838 42%, #112828 78%, #0a1717);
          border: 1px solid rgba(121, 132, 136, 0.38);
          box-shadow:
            0 20px 44px rgba(0,0,0,0.52),
            0 0 0 1px rgba(255,255,255,0.05),
            inset 0 1px 0 rgba(255,255,255,0.08);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.28rem;
          overflow: hidden;
        }
        .demo-keychain-cap {
          width: 2.2rem;
          height: 0.72rem;
          border-radius: 9999px;
          background: linear-gradient(180deg, #d4dce0, #9ca8b0);
          border: 1px solid rgba(136, 147, 154, 0.58);
          box-shadow: 0 3px 7px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.55);
          margin-top: -0.1rem;
          position: relative;
          z-index: 1;
        }
        .demo-keychain-tag::after {
          content: '';
          position: absolute;
          inset: 0.36rem;
          border-radius: 9999px;
          border: 1px solid rgba(176, 198, 200, 0.26);
          pointer-events: none;
        }
        .demo-keychain-tag::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at 36% 26%, rgba(255,255,255,0.13), transparent 58%);
        }
        .demo-keychain-shine {
          position: absolute;
          inset: 0;
          pointer-events: none;
          content: '';
          background: linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.12) 50%, transparent 70%);
          background-size: 250% 100%;
          animation: demoShimmer 5s linear infinite;
        }
        .demo-keychain-core {
          width: 1.7rem;
          height: 1.7rem;
          border-radius: 9999px;
          background: radial-gradient(circle at 35% 35%, #d8e2e5, #7f8d95 72%);
          border: 1px solid rgba(160,170,178,0.75);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.6), 0 3px 8px rgba(0,0,0,0.28);
          position: relative;
          z-index: 1;
        }
        .demo-keychain-nfc {
          width: 2.7rem;
          height: 2.7rem;
          border-radius: 9999px;
          display: grid;
          place-items: center;
          color: rgba(209, 241, 239, 0.95);
          background: radial-gradient(circle at 30% 30%, rgba(94, 212, 200, 0.25), rgba(17, 43, 43, 0.34));
          border: 1px solid rgba(94, 212, 200, 0.35);
          z-index: 1;
        }
        .demo-keychain-logo {
          position: relative;
          z-index: 1;
          font-size: 1.2rem;
          font-weight: 900;
          letter-spacing: 0.03em;
          color: rgba(198, 233, 229, 0.96);
          line-height: 1;
        }
        .demo-keychain-label {
          font-size: 0.53rem; font-weight: 800;
          letter-spacing: 0.14em;
          color: rgba(178, 194, 198, 0.8);
          text-transform: uppercase;
          position: relative; z-index: 1;
        }

        /* ===== NFC TABLE STAND ===== */
        .demo-stand-outer {
          --demo-card-base-transform: rotateZ(0deg);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0;
          animation: demoCardFloat 4.5s ease-in-out infinite;
          animation-delay: -2s;
        }
        .demo-stand-card {
          position: relative;
          width: 9.5rem;
          height: 12.8rem;
          border-radius: 1rem;
          background: linear-gradient(168deg, #ffffff, #fff8ef 45%, #fbead9 100%);
          border: 1px solid rgba(181, 118, 69, 0.22);
          box-shadow:
            0 22px 52px rgba(0,0,0,0.45),
            0 0 0 1px rgba(255,255,255,0.75),
            inset 0 1px 0 rgba(255,255,255,0.9);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 0.75rem 0.72rem 0.7rem;
        }
        .demo-stand-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at 50% 18%, rgba(249, 205, 155, 0.25), transparent 62%);
        }
        .demo-stand-card::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.3) 50%, transparent 70%);
          background-size: 250% 100%;
          animation: demoShimmer 5s linear infinite;
        }
        .demo-stand-header {
          position: relative;
          z-index: 1;
          text-align: center;
          margin-bottom: 0.28rem;
        }
        .demo-stand-brand {
          font-size: 0.62rem;
          font-weight: 800;
          color: #7f4625;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .demo-stand-subtitle {
          font-size: 0.5rem;
          color: #b56e3f;
          margin-top: 0.05rem;
        }
        .demo-stand-logo {
          position: relative;
          z-index: 1;
          width: 2.7rem;
          height: 2.7rem;
          border-radius: 9999px;
          margin: 0 auto 0.45rem;
          display: grid;
          place-items: center;
          background: radial-gradient(circle at 30% 30%, #fff9ef, #f1c892 75%);
          border: 1px solid rgba(187, 120, 70, 0.35);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.8), 0 8px 18px rgba(155, 94, 51, 0.2);
        }
        .demo-stand-logo-mark {
          font-size: 0.95rem;
          font-weight: 900;
          color: #8e4c25;
          letter-spacing: 0.04em;
        }
        .demo-stand-menu {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.34rem;
          flex: 1;
          text-align: center;
        }
        .demo-stand-menu-title {
          font-size: 0.72rem;
          font-weight: 800;
          color: #8c4f29;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }
        .demo-stand-menu-sub {
          font-size: 0.53rem;
          color: #b26c3f;
          letter-spacing: 0.04em;
        }
        .demo-stand-menu-action {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.35rem;
          border-radius: 9999px;
          background: rgba(255,255,255,0.9);
          border: 1px solid rgba(188, 117, 62, 0.2);
          padding: 0.33rem 0.65rem;
          color: #995b34;
          font-size: 0.52rem;
          font-weight: 700;
        }
        .demo-stand-cta {
          position: relative;
          z-index: 1;
          text-align: center;
          font-size: 0.53rem;
          font-weight: 700;
          color: #9a5f37;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          margin-top: 0.35rem;
        }
        .demo-stand-base {
          position: relative;
          width: 12rem;
          height: 1.95rem;
        }
        .demo-stand-slot {
          position: absolute;
          left: 50%; top: 0;
          transform: translateX(-50%);
          width: 9.8rem;
          height: 1.02rem;
          background: linear-gradient(180deg, #7a4322, #5c3119);
          border: 1px solid rgba(137, 83, 45, 0.5);
          border-top: none;
          border-radius: 0 0 0.6rem 0.6rem;
        }
        .demo-stand-foot {
          position: absolute;
          bottom: 0; left: 50%;
          transform: translateX(-50%);
          width: 12rem;
          height: 0.95rem;
          background: linear-gradient(180deg, #834724, #5f3319);
          border-radius: 0.38rem;
          border: 1px solid rgba(126, 76, 42, 0.46);
          box-shadow: 0 10px 24px rgba(0,0,0,0.42);
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
            display: none !important;
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
            margin-top: 1.1rem;
            margin-bottom: 0.45rem;
          }

          .demo-mockup-wrap {
            height: 25.2rem;
            width: min(100%, 22rem);
          }

          .demo-phone-wrap {
            transform: translateX(-50%) scale(0.65);
            top: -3.25rem;
          }

          .demo-phone-rings {
            width: 18.2rem;
            height: 18.2rem;
            top: 38%;
          }

          .demo-product-mockup {
            bottom: -0.65rem;
            height: 12.6rem;
          }

          .demo-metal-card,
          .demo-black-card,
          .demo-wood-card {
            width: min(17rem, 82vw);
          }

          .demo-keychain-tag {
            width: 6.8rem;
            height: 6.8rem;
          }

          .demo-keychain-cap {
            width: 2rem;
          }

          .demo-keychain-nfc {
            width: 2.35rem;
            height: 2.35rem;
          }

          .demo-stand-card {
            width: 8.1rem;
            height: 10.9rem;
          }

          .demo-stand-base {
            width: 10.2rem;
          }

          .demo-stand-foot {
            width: 10.2rem;
          }

          .demo-silver-card {
            width: min(17rem, 82vw);
          }

          .demo-sticker-card {
            width: min(14.5rem, 78vw);
            height: 4.5rem;
          }

          .demo-cta-row-mobile {
            margin-top: 0.35rem;
          }
        }

        @keyframes demoPhoneFloat {
          0%, 100% { transform: translateX(-50%) translateY(-8px); }
          50% { transform: translateX(-50%) translateY(8px); }
        }

        @keyframes demoCardFloat {
          0%, 100% { transform: var(--demo-card-base-transform, none) translateY(-5px); }
          50% { transform: var(--demo-card-base-transform, none) translateY(5px); }
        }


        @keyframes demoShimmer {
          0% { background-position: -100% 0; }
          100% { background-position: 200% 0; }
        }

        @keyframes demoRingPulse {
          0% { transform: translate(-50%, -50%) scale(1); opacity: 0.6; }
          100% { transform: translate(-50%, -50%) scale(2.8); opacity: 0; }
        }

        @keyframes demoIconFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-7px); }
        }
      `}</style>

      {!heroOnly && (
        <div className="bg-[#0C1429] text-white text-center py-2.5 text-sm font-medium tracking-wide">
          🚚&nbsp; توصيل مجاني لطلبات 250 ريال فأكثر &nbsp;|&nbsp; اطلب الآن واستلم خلال يومين
        </div>
      )}

      {!heroOnly && <Navbar />}

      <section
        className="demo-hero-section relative min-h-[92vh] flex items-center"
        style={{ background: 'linear-gradient(135deg, #0C1429 0%, #1E1B4B 50%, #0C1429 100%)' }}
      >
        <svg width="0" height="0" aria-hidden="true" focusable="false" style={{ position: 'absolute' }}>
          <defs>
            <linearGradient id="demoSliderGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="100%" stopColor="#E879F9" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div
            className="absolute top-[-120px] right-[-80px] w-[500px] h-[500px] rounded-full opacity-20"
            style={{ background: 'radial-gradient(circle, #38BDF8, transparent 70%)' }}
            animate={{ scale: [1, 1.15, 1], opacity: [0.18, 0.28, 0.18] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute bottom-[-100px] left-[-60px] w-[400px] h-[400px] rounded-full opacity-15"
            style={{ background: 'radial-gradient(circle, #E879F9, transparent 70%)' }}
            animate={{ scale: [1, 1.2, 1], opacity: [0.12, 0.22, 0.12] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          />
        </div>

        <div className="container mx-auto px-4 md:px-10 relative z-10 pt-24 md:pt-28 pb-16 md:pb-20">
          <div className="demo-hero-content grid lg:grid-cols-2 gap-14 items-center">
            <div className="demo-hero-copy">

              {/* Gradient-border badge above headline */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="inline-block mb-5 mt-8"
                style={{
                  padding: '2px',
                  borderRadius: '9999px',
                  background: 'linear-gradient(135deg, #38BDF8, #E879F9)',
                }}
              >
                <span
                  className="block px-5 py-2 text-sm font-semibold rounded-full"
                  style={{
                    background: '#0C1429',
                    color: 'rgba(255,255,255,0.9)',
                    fontFamily: "'Tajawal', sans-serif",
                    letterSpacing: '0.02em',
                  }}
                >
                  {isRTL ? 'الجيل الجديد من كروت التعارف في عالم الأعمال' : 'The next generation of business networking cards'}
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="demo-hero-title text-4xl md:text-5xl lg:text-6xl font-black mb-6"
                style={{ fontFamily: "'Tajawal', sans-serif", color: '#fff', lineHeight: '1.55' }}
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
                      background: 'linear-gradient(to right, #38BDF8, #E879F9)',
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
                    background: 'linear-gradient(to right, #38BDF8, #E879F9)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  {isRTL ? 'بطريقة عصرية' : 'the modern way'}
                </span>
              </motion.h1>

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
                      {HERO_PRODUCT_TYPES.map((item, i) => {
                        const Icon = item.icon;
                        return (
                          <button
                            key={item.key}
                            onClick={() => setSelectedProductTypeIdx(i)}
                            className={`demo-slider-item ${selectedProductTypeIdx === i ? 'is-active' : ''}`}
                            aria-pressed={selectedProductTypeIdx === i}
                          >
                            <span className="demo-slider-icon" aria-hidden="true">
                              <Icon className="w-[1.1rem] h-[1.1rem]" />
                            </span>
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
                        );
                      })}
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
                className="demo-cta-row hidden md:flex flex-wrap items-center gap-3"
              >
                <motion.button
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate('/customize')}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-fuchsia-500 via-purple-500 to-purple-600 hover:from-fuchsia-400 hover:via-purple-400 hover:to-purple-500 text-white font-bold px-8 py-4 rounded-2xl shadow-lg shadow-fuchsia-500/30 transition-all text-base cursor-pointer border border-white/20"
                >
                  <ShoppingCart className="h-5 w-5" />
                  {isRTL ? 'اشتر بطاقة NFC' : 'Buy NFC Card'}
                </motion.button>
                <span className="text-sm font-medium text-slate-400">{isRTL ? 'أو' : 'or'}</span>
                <motion.button
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleCreateDigital}
                  className="inline-flex items-center gap-2 bg-indigo-950/60/10 hover:bg-indigo-950/60/20 text-white font-bold px-8 py-4 rounded-2xl border border-white/20 shadow-lg shadow-slate-900/20 transition-all text-base cursor-pointer backdrop-blur-sm"
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
                    <div className="text-2xl font-black text-cyan-400">{stat.value}</div>
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
                  <span className="demo-ring-orbit" />
                  <span className="demo-ring-orbit o2" />
                  <span className="demo-ring-orbit o3" />
                  <span className="demo-phone-ring" />
                  <span className="demo-phone-ring r2" />
                  <span className="demo-phone-ring r3" />
                  <span className="demo-phone-ring r4" />
                </div>

                <div className="demo-fancy-circles" aria-hidden="true">
                  <span className="demo-fancy-circle c1"><Phone className="w-4 h-4" /></span>
                  <span className="demo-fancy-circle c2"><Mail className="w-4 h-4" /></span>
                  <span className="demo-fancy-circle c3"><ContactRound className="w-4 h-4" /></span>
                  <span className="demo-fancy-circle c4"><MessageCircle className="w-4 h-4" /></span>
                  <span className="demo-fancy-circle c5"><Instagram className="w-4 h-4" /></span>
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
                    {selectedProductType?.key === 'gold' && (
                      <motion.div
                        key="metal"
                        initial={{ opacity: 0, scale: 0.84, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.88, y: -14 }}
                        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                      >
                        <div className="demo-metal-card">
                          <div className="demo-metal-card-inner">
                            <div className="demo-metal-nfc-badge" aria-hidden="true">
                              <div className="demo-nfc-icon">
                                <span className="demo-nfc-dot" />
                                <span className="demo-nfc-wave w1" />
                                <span className="demo-nfc-wave w2" />
                                <span className="demo-nfc-wave w3" />
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

                    {selectedProductType?.key === 'silver' && (
                      <motion.div
                        key="silver"
                        initial={{ opacity: 0, scale: 0.84, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.88, y: -14 }}
                        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                      >
                        <div className="demo-silver-card">
                          <div className="demo-silver-card-inner">
                            <div className="demo-silver-nfc-badge" aria-hidden="true">
                              <div className="demo-nfc-icon">
                                <span className="demo-nfc-dot" />
                                <span className="demo-nfc-wave w1" />
                                <span className="demo-nfc-wave w2" />
                                <span className="demo-nfc-wave w3" />
                              </div>
                            </div>
                            <div>
                              <div className="demo-silver-name">Ahmed Al-Rashidi</div>
                              <div className="demo-silver-brand">RAWAJCARD · NFC</div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {selectedProductType?.key === 'black' && (
                      <motion.div
                        key="black"
                        initial={{ opacity: 0, scale: 0.84, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.88, y: -14 }}
                        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                      >
                        <div className="demo-black-card">
                          <div className="demo-black-card-inner">
                            <div className="demo-black-nfc-badge" aria-hidden="true">
                              <div className="demo-nfc-icon">
                                <span className="demo-nfc-dot" />
                                <span className="demo-nfc-wave w1" />
                                <span className="demo-nfc-wave w2" />
                                <span className="demo-nfc-wave w3" />
                              </div>
                            </div>
                            <div>
                              <div className="demo-black-name">Ahmed Al-Rashidi</div>
                              <div className="demo-black-brand">RAWAJCARD · METAL BLACK</div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {selectedProductType?.key === 'wood' && (
                      <motion.div
                        key="wood"
                        initial={{ opacity: 0, scale: 0.84, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.88, y: -14 }}
                        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                      >
                        <div className="demo-wood-card">
                          <div className="demo-wood-card-inner">
                            <div className="demo-wood-nfc-badge" aria-hidden="true">
                              <div className="demo-nfc-icon">
                                <span className="demo-nfc-dot" />
                                <span className="demo-nfc-wave w1" />
                                <span className="demo-nfc-wave w2" />
                                <span className="demo-nfc-wave w3" />
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

                    {selectedProductType?.key === 'stand' && (
                      <motion.div
                        key="stand"
                        initial={{ opacity: 0, scale: 0.84, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.88, y: -14 }}
                        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                      >
                        <div className="demo-stand-outer">
                          <div className="demo-stand-card">
                            <div className="demo-stand-header">
                              <div className="demo-stand-brand">Urban Plate</div>
                              <div className="demo-stand-subtitle">Restaurant</div>
                            </div>

                            <div className="demo-stand-logo" aria-hidden="true">
                              <div className="demo-stand-logo-mark">UP</div>
                            </div>

                            <div className="demo-stand-menu">
                              <div className="demo-stand-menu-title">Digital Menu</div>
                              <div className="demo-stand-menu-sub">Fresh dishes · quick ordering</div>
                              <div className="demo-stand-menu-action">
                                <div className="demo-nfc-icon" style={{ width: '1.15rem', height: '1.15rem', color: '#b56a3a' }}>
                                  <span className="demo-nfc-dot" />
                                  <span className="demo-nfc-wave w1" />
                                  <span className="demo-nfc-wave w2" />
                                </div>
                                <span>Scan / Tap to order</span>
                              </div>
                            </div>

                            <div className="demo-stand-cta">Menu Access Point</div>
                          </div>
                          <div className="demo-stand-base">
                            <div className="demo-stand-slot" />
                            <div className="demo-stand-foot" />
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {selectedProductType?.key === 'keychain' && (
                      <motion.div
                        key="keychain"
                        initial={{ opacity: 0, scale: 0.84, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.88, y: -14 }}
                        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                      >
                        <div className="demo-keychain-outer">
                          <div className="demo-keychain-ring" />
                          <div className="demo-keychain-link" />
                          <div className="demo-keychain-tag">
                            <div className="demo-keychain-cap" />
                            <div className="demo-keychain-core" />
                            <div className="demo-keychain-nfc" aria-hidden="true">
                              <div className="demo-nfc-icon">
                                <span className="demo-nfc-dot" />
                                <span className="demo-nfc-wave w1" />
                                <span className="demo-nfc-wave w2" />
                                <span className="demo-nfc-wave w3" />
                              </div>
                            </div>
                            <div className="demo-keychain-logo">RC</div>
                            <div className="demo-keychain-label">RAWAJCARD NFC</div>
                            <div className="demo-keychain-shine" aria-hidden="true" />
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {selectedProductType?.key === 'sticker' && (
                      <motion.div
                        key="sticker"
                        initial={{ opacity: 0, scale: 0.84, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.88, y: -14 }}
                        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                      >
                        <div className="demo-sticker-card">
                          <div className="demo-sticker-card-inner">
                            <div>
                              <div className="demo-sticker-title">RAWAJ STICKER</div>
                              <div className="demo-sticker-sub">Tap phone to connect</div>
                            </div>
                            <div className="demo-sticker-nfc-wrap" aria-hidden="true">
                              <div className="demo-nfc-icon">
                                <span className="demo-nfc-dot" />
                                <span className="demo-nfc-wave w1" />
                                <span className="demo-nfc-wave w2" />
                                <span className="demo-nfc-wave w3" />
                              </div>
                            </div>
                          </div>
                          <div className="demo-sticker-tab" aria-hidden="true" />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.65 }}
              className="demo-cta-row demo-cta-row-mobile flex md:hidden flex-wrap items-center gap-3"
            >
              <motion.button
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/customize')}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-fuchsia-500 via-purple-500 to-purple-600 hover:from-fuchsia-400 hover:via-purple-400 hover:to-purple-500 text-white font-bold px-8 py-4 rounded-2xl shadow-lg shadow-fuchsia-500/30 transition-all text-base cursor-pointer border border-white/20"
              >
                <ShoppingCart className="h-5 w-5" />
                {isRTL ? 'اشتر بطاقة NFC' : 'Buy NFC Card'}
              </motion.button>
              <span className="text-sm font-medium text-slate-400">{isRTL ? 'أو' : 'or'}</span>
              <motion.button
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleCreateDigital}
                className="inline-flex items-center gap-2 bg-indigo-950/60/10 hover:bg-indigo-950/60/20 text-white font-bold px-8 py-4 rounded-2xl border border-white/20 shadow-lg shadow-slate-900/20 transition-all text-base cursor-pointer backdrop-blur-sm"
              >
                <LogIn className="h-5 w-5" />
                {isRTL ? 'أنشئ بطاقة رقمية' : 'Create Digital Card'}
              </motion.button>
            </motion.div>
          </div>
        </div>
      </section>

      {!heroOnly && <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />}
    </div>
  );
}
