'use client';

import React, { useState } from 'react';
import { useSound } from '@/context/SoundContext';
import { useCart } from '@/context/CartContext';
import { confettiEngine } from '@/utils/confetti';

interface MysteryReward {
  code: string;
  badge: string;
  title: string;
  description: string;
}

const REWARDS: MysteryReward[] = [
  {
    code: 'SNUGGLE15',
    badge: '🎁 15% OFF + Free Gift',
    title: 'Secret Snuggle Perk!',
    description: 'Enjoy 15% off your entire order plus a complimentary Pip & Peaches holographic sticker pack with your plushie.'
  },
  {
    code: 'BOBABUDDY',
    badge: '🧋 Free Mystery Keyring',
    title: 'Lucky Boba Pull!',
    description: 'Get a free micro plushie Boba Keyring tucked into your package on all adoption orders over $40.'
  },
  {
    code: 'MATCHALOVE',
    badge: '🍵 $5 Adoption Credit',
    title: 'Zen Matcha Surprise!',
    description: 'Instant $5 discount applied to your next cuddle friend adoption. Spread the softest calm energy.'
  }
];

export const MysteryBox: React.FC = () => {
  const { playSquish, playChime } = useSound();
  const { showToast } = useCart();
  const [activeReward, setActiveReward] = useState<MysteryReward | null>(null);
  const [copied, setCopied] = useState(false);

  const handleMysteryClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    playSquish();
    const rect = e.currentTarget.getBoundingClientRect();
    confettiEngine.burst(rect.left + rect.width / 2, rect.top + rect.height / 2);

    const randomReward = REWARDS[Math.floor(Math.random() * REWARDS.length)];
    setActiveReward(randomReward);
    setCopied(false);
  };

  const handleCopyCode = () => {
    if (!activeReward) return;
    navigator.clipboard?.writeText(activeReward.code);
    playChime();
    setCopied(true);
    showToast(`✨ Code ${activeReward.code} copied to cuddle heart! 💌`);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleClose = () => {
    setActiveReward(null);
  };

  return (
    <>
      <section className="mystery-section">
        <div className="container">
          <div className="mystery-banner">
            <div className="mystery-content">
              <span style={{ fontSize: '3.5rem', display: 'block', marginBottom: '0.8rem', animation: 'softWiggle 3s infinite' }}>
                🎁
              </span>
              <h2 className="mystery-title">Unbox a Mystery Cutie Treat!</h2>
              <p className="mystery-desc">
                Click the magic gift box below to reveal an instant surprise perk, free sticker code, or secret adoption bonus!
              </p>
              <button className="gacha-btn" onClick={handleMysteryClick} type="button">
                <span>✨ Crack Open Mystery Box! ✨</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Theme-based Mystery Reward Modal */}
      {activeReward && (
        <div
          className="modal-backdrop open"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleClose();
          }}
        >
          <div className="popup-dialog">
            <button
              className="modal-close-btn"
              onClick={handleClose}
              aria-label="Close reward modal"
              type="button"
            >
              ✕
            </button>

            <div className="popup-icon-badge">✨</div>
            <span className="card-pill-tag best-seller" style={{ position: 'static', display: 'inline-block', marginBottom: '0.8rem' }}>
              {activeReward.badge}
            </span>
            <h3 className="popup-title">{activeReward.title}</h3>
            <p className="popup-desc">{activeReward.description}</p>

            <div className="coupon-box">
              <span className="coupon-code">{activeReward.code}</span>
              <button className="copy-btn" onClick={handleCopyCode} type="button">
                {copied ? 'Copied! ✨' : 'Copy Code 📋'}
              </button>
            </div>

            <button className="popup-btn" onClick={handleClose} type="button">
              Claim & Snuggle In 💖
            </button>
          </div>
        </div>
      )}
    </>
  );
};
