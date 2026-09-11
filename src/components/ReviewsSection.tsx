import React from 'react';

export const ReviewsSection: React.FC = () => {
  return (
    <section className="reviews-section" id="reviews-section">
      <div className="container">
        <div className="section-header">
          <span className="section-subtitle-pill">💌 Warm Fuzzy Letters</span>
          <h2 className="section-title">Loved by 50,000+ Snugglers</h2>
          <p className="section-desc">
            Real stories from people who found their bedtime companion, desk buddy, and panic-attack melter.
          </p>
        </div>

        <div className="reviews-grid">
          {/* Review 1 */}
          <div className="review-card">
            <div className="review-header">
              <div className="review-avatar">🐰</div>
              <div className="reviewer-meta">
                <h4>Hana K.</h4>
                <span className="verified-tag">✓ Verified Snuggler</span>
              </div>
            </div>
            <div className="review-stars">★★★★★</div>
            <p className="review-text">
              &ldquo;Pip the Strawberry Bunny is genuinely the softest thing I have ever touched. The little strawberry on her head is so cute it makes me smile every morning. 10/10 recommend!&rdquo;
            </p>
            <span className="review-plushie-tag">Adopted: Pip & Peaches</span>
          </div>

          {/* Review 2 */}
          <div className="review-card">
            <div className="review-header">
              <div className="review-avatar">🧋</div>
              <div className="reviewer-meta">
                <h4>Marcus T.</h4>
                <span className="verified-tag">✓ Verified Snuggler</span>
              </div>
            </div>
            <div className="review-stars">★★★★★</div>
            <p className="review-text">
              &ldquo;I bought Boba the Bear as a desk buddy during long coding sprints. His round belly is the perfect wrist rest and squishing him helps so much when debugging nasty code.&rdquo;
            </p>
            <span className="review-plushie-tag">Adopted: Boba the Bear</span>
          </div>

          {/* Review 3 */}
          <div className="review-card">
            <div className="review-header">
              <div className="review-avatar">🦭</div>
              <div className="reviewer-meta">
                <h4>Chloe L.</h4>
                <span className="verified-tag">✓ Verified Snuggler</span>
              </div>
            </div>
            <div className="review-stars">★★★★★</div>
            <p className="review-text">
              &ldquo;Mochi the Seal is a literal sphere of purest happiness. I hug him while watching movies and my roommate keeps trying to steal him. Ordering another one today!&rdquo;
            </p>
            <span className="review-plushie-tag">Adopted: Mochi the Seal</span>
          </div>
        </div>
      </div>
    </section>
  );
};
