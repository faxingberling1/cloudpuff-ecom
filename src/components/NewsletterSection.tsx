'use client';

import React, { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useSound } from '@/context/SoundContext';
import { confettiEngine } from '@/utils/confetti';

export const NewsletterSection: React.FC = () => {
  const [email, setEmail] = useState('');
  const { showToast } = useCart();
  const { playChime } = useSound();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email) return;

    playChime();
    confettiEngine.burst();
    showToast('💌 Welcome to the Secret Snuggle Club! Check your inbox for your adoption certificate! ✨');
    setEmail('');
  };

  return (
    <section className="newsletter-section">
      <div className="container">
        <div className="newsletter-card">
          <span style={{ fontSize: '3rem' }}>💌</span>
          <h2 className="section-title" style={{ marginTop: '0.5rem' }}>
            Join the Secret Snuggle Club
          </h2>
          <p className="section-desc" style={{ maxWidth: '500px', margin: '0 auto' }}>
            Get early access to limited edition drops, secret discount codes, and a free printable Adoption Certificate!
          </p>

          <form className="newsletter-form" id="newsletter-form" onSubmit={handleSubmit}>
            <input
              type="email"
              className="newsletter-input"
              placeholder="Enter your cozy email..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit" className="newsletter-btn">
              Join Club 🌸
            </button>
          </form>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            No spam, ever! Only warm cuddly updates and cute illustrations. 🍓
          </span>
        </div>
      </div>
    </section>
  );
};
