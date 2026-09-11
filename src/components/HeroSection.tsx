'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useSound } from '@/context/SoundContext';
import { useCart } from '@/context/CartContext';
import { confettiEngine } from '@/utils/confetti';

export const HeroSection: React.FC = () => {
  const { playSquish } = useSound();
  const { showToast } = useCart();
  const [squishing, setSquishing] = useState(false);

  const handleMascotSquish = (e: React.MouseEvent<HTMLDivElement>) => {
    playSquish();
    setSquishing(true);
    confettiEngine.burst(e.clientX, e.clientY);
    showToast('🍓 Squeeeak! Pip loved that cuddle!');
    setTimeout(() => setSquishing(false), 400);
  };

  const scrollToShop = () => {
    document.getElementById('shop-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="hero">
      <div className="container hero-grid">
        {/* Left Content */}
        <div className="hero-content">
          <div className="hero-tag">
            <span>🍓 Hand-Stitched With Pure Love</span>
          </div>
          <h1 className="hero-title">
            Where Every Hug Feels Like <span className="highlight">A Warm Cloud</span> ✨
          </h1>
          <p className="hero-desc">
            Artisan emotional support companions crafted with hyper-resilient cloud polyfill and buttery velvet fabrics. Ready to soothe anxious days and brighten your world.
          </p>

          <div className="hero-cta-group">
            <button className="btn-primary" onClick={scrollToShop} type="button">
              Adopt a Plushie Now 🍓
            </button>
            <a href="#mood-section" className="btn-secondary">
              Find My Soul-Plushie 🔮
            </a>
          </div>

          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-value">50,000+</span>
              <span className="stat-label">Happy Cuddlers</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">4.9 / 5 ⭐</span>
              <span className="stat-label">Average Hug Rating</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">100%</span>
              <span className="stat-label">Hypoallergenic & Safe</span>
            </div>
          </div>
        </div>

        {/* Right Visual Stage */}
        <div className="hero-visual">
          <div className="badge-floating badge-float-1">
            <span>🍓</span>
            <span>Strawberry Scented</span>
          </div>
          <div className="badge-floating badge-float-2">
            <span>⭐</span>
            <span>9.9 / 10 Squish Factor</span>
          </div>
          <div className="badge-floating badge-float-3">
            <span>👑 #1 Best Seller</span>
          </div>

          <div
            className={`hero-card-stage ${squishing ? 'squish-active' : ''}`}
            id="hero-stage-card"
            title="Click to Squish Pip!"
            onClick={handleMascotSquish}
          >
            <div className="hero-img-wrap">
              <Image
                src="/assets/hero.jpg"
                alt="Pip the Strawberry Bunny Plushie"
                width={400}
                height={400}
                priority
                className="hero-img"
              />
              <div className="squish-hint">
                <span>👉 Click to Squish Me!</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
