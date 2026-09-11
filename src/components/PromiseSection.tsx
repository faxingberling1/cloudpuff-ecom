import React from 'react';

export const PromiseSection: React.FC = () => {
  return (
    <section className="promise-section" id="promise-section">
      <div className="container">
        <div className="section-header">
          <span className="section-subtitle-pill">🛡️ The Cuddle Standard</span>
          <h2 className="section-title">Why CloudPuff Plushies?</h2>
          <p className="section-desc">
            We spent two years perfecting the exact ratio of fluffiness, bounce-back resilience, and velvet texture.
          </p>
        </div>

        <div className="promise-grid">
          <div className="promise-card">
            <div className="promise-icon-wrap icon-pink">☁️</div>
            <h3 className="promise-title">Never-Go-Flat Polyfill</h3>
            <p className="promise-desc">
              Custom high-density memory cloud-fill that bounces back to perfect round plumpness every single cuddle.
            </p>
          </div>
          <div className="promise-card">
            <div className="promise-icon-wrap icon-yellow">🧼</div>
            <h3 className="promise-title">Machine Washable Fluff</h3>
            <p className="promise-desc">
              Accidents happen! Pop them into a gentle cold wash and dry on air fluff, and they emerge just as soft as day one.
            </p>
          </div>
          <div className="promise-card">
            <div className="promise-icon-wrap icon-mint">🪡</div>
            <h3 className="promise-title">Double-Stitched Seams</h3>
            <p className="promise-desc">
              Reinforced internal stitching ensures ears, tails, and paws withstand years of tight emotional support squeezes.
            </p>
          </div>
          <div className="promise-card">
            <div className="promise-icon-wrap icon-lavender">🌿</div>
            <h3 className="promise-title">100% Hypoallergenic</h3>
            <p className="promise-desc">
              Ultra-safe, non-toxic microfibers that are gentle on sensitive skin and safe for cuddlers of all ages.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
