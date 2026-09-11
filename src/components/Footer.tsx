'use client';

import React from 'react';
import Link from 'next/link';

export const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand Summary */}
          <div className="footer-brand">
            <Link href="/" className="brand-logo">
              <span className="logo-icon-wrap">🧸</span>
              <span className="brand-name">CloudPuff</span>
            </Link>
            <p>
              Crafting premium, hyper-squishable emotional support plushies to make the universe a softer, happier place one hug at a time.
            </p>
          </div>

          {/* Quick Links 1: Squad & Studio */}
          <div className="footer-col">
            <h4>Adopt & Create</h4>
            <ul className="footer-links">
              <li><Link href="/#shop-section" className="footer-link">Cuddle Squad 🍓</Link></li>
              <li><Link href="/customizer" className="footer-link">Build-A-Cloud Studio 🎨</Link></li>
              <li><Link href="/wishlist" className="footer-link">Saved Sanctuary 💖</Link></li>
              <li><Link href="/game" className="footer-link">Cloud Hop Arcade 🎮</Link></li>
            </ul>
          </div>

          {/* Quick Links 2: Support & History */}
          <div className="footer-col">
            <h4>Snuggle Support</h4>
            <ul className="footer-links">
              <li><Link href="/orders" className="footer-link">Adoption Family Album 📖</Link></li>
              <li><Link href="/orders" className="footer-link">Track Delivery 🚚</Link></li>
              <li><Link href="/#promise-section" className="footer-link">Plushie Care Guide 🫧</Link></li>
              <li><Link href="/#reviews-section" className="footer-link">100% Cuddle Guarantee ✨</Link></li>
            </ul>
          </div>

          {/* Quick Links 3: Community */}
          <div className="footer-col">
            <h4>Social & Community</h4>
            <ul className="footer-links">
              <li><a href="#" className="footer-link">Instagram 📸 @CloudPuff</a></li>
              <li><a href="#" className="footer-link">TikTok 🎵 @CloudPuffPlush</a></li>
              <li><a href="#" className="footer-link">Discord 💬 Snuggle Club</a></li>
              <li><a href="#" className="footer-link">Pinterest 📌 Cozy Room Inspo</a></li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <span>© 2026 CloudPuff Plushies Inc. All hugs reserved. Design made by Arsalan Abbas 💖</span>
          <button className="back-to-top-btn" onClick={scrollToTop} type="button">
            Back to Top ☁️ ↑
          </button>
        </div>
      </div>
    </footer>
  );
};
