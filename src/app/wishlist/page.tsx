'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { useSound } from '@/context/SoundContext';
import { PLUSHIES } from '@/data/plushies';
import { confettiEngine } from '@/utils/confetti';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export default function WishlistPage() {
  const { wishlist, toggleWishlist, addItem, showToast, setIsCartOpen } = useCart();
  const { playPop, playSquish, playChime } = useSound();
  const [copiedLink, setCopiedLink] = useState(false);

  // Find plushie objects that match wishlist IDs
  const wishlistedPlushies = PLUSHIES.filter((p) => wishlist.includes(p.id));

  const handleShareWishlist = () => {
    playChime();
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    showToast('💌 Wishlist link copied! Send it to someone who owes you a cuddle gift!');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleAdoptAll = () => {
    if (wishlistedPlushies.length === 0) return;
    playSquish();
    confettiEngine.burst();

    wishlistedPlushies.forEach((p) => {
      addItem(p.id, 1);
    });

    showToast(`🎉 Added all ${wishlistedPlushies.length} saved plushies to your cuddle basket!`);
    setIsCartOpen(true);
  };

  return (
    <div className="page-wrapper">
      <Navbar />

      <main className="wishlist-page container">
        {/* Top Header */}
        <div className="wishlist-header-banner">
          <div className="wishlist-title-wrap">
            <span className="wishlist-badge">💖 My Cuddle Sanctuary</span>
            <h1 className="wishlist-page-title">Wishlist Dream Buddies</h1>
            <p className="wishlist-page-subtitle">
              Your personal dream sanctuary of future cuddle buddies waiting for their forever home.
            </p>
          </div>

          {wishlistedPlushies.length > 0 && (
            <div className="wishlist-actions-bar">
              <button
                className="btn-primary adopt-all-btn"
                onClick={handleAdoptAll}
                type="button"
              >
                Adopt Whole Squad ({wishlistedPlushies.length}) 💖
              </button>
              <button
                className="btn-secondary share-wishlist-btn"
                onClick={handleShareWishlist}
                type="button"
              >
                {copiedLink ? '✓ Link Copied!' : '💌 Share Wishlist'}
              </button>
            </div>
          )}
        </div>

        {/* Empty State */}
        {wishlistedPlushies.length === 0 ? (
          <div className="wishlist-empty-card">
            <div className="empty-plushie-icon">🧸</div>
            <h2 className="empty-title">Your sanctuary is waiting for buddies!</h2>
            <p className="empty-subtitle">
              Tap the little heart 💖 on any plushie card across our shop to save your dream cuddle friends right here.
            </p>
            <div style={{ marginTop: '1.8rem' }}>
              <Link href="/#shop-section" className="btn-primary">
                Explore Cuddle Squad 🍓
              </Link>
            </div>
          </div>
        ) : (
          /* Wishlist Grid */
          <div className="wishlist-grid">
            {wishlistedPlushies.map((plushie) => (
              <div key={plushie.id} className="wishlist-card">
                {/* Image */}
                <div className="wishlist-card-thumb">
                  <Link href={`/product/${plushie.id}`} title={`View ${plushie.name}`}>
                    <Image
                      src={plushie.image}
                      alt={plushie.name}
                      width={320}
                      height={320}
                      className="wishlist-thumb-img"
                    />
                  </Link>
                  <button
                    className="wishlist-remove-btn"
                    onClick={() => {
                      playPop();
                      toggleWishlist(plushie.id);
                      showToast(`Removed ${plushie.name} from your sanctuary.`);
                    }}
                    title="Remove from wishlist"
                    type="button"
                  >
                    ✕
                  </button>
                  <span className="squish-pill-badge">☁️ {plushie.squishFactor} Squish</span>
                </div>

                {/* Content */}
                <div className="wishlist-card-body">
                  <div className="wishlist-category-tag">{plushie.category.toUpperCase()}</div>
                  <h3 className="wishlist-item-name">
                    <Link href={`/product/${plushie.id}`}>{plushie.name}</Link>
                  </h3>
                  <p className="wishlist-item-subtitle">{plushie.subtitle}</p>

                  <div className="wishlist-item-pricing">
                    <span className="current-price">${plushie.price.toFixed(2)}</span>
                    <span className="original-price">${plushie.originalPrice.toFixed(2)}</span>
                  </div>

                  <div className="wishlist-card-actions">
                    <button
                      className="btn-primary wishlist-adopt-btn"
                      onClick={() => {
                        playSquish();
                        addItem(plushie.id, 1);
                        showToast(`🧸 Adopted ${plushie.name}! Added to basket.`);
                        setIsCartOpen(true);
                      }}
                      type="button"
                    >
                      Adopt Now 🍓
                    </button>
                    <Link
                      href={`/product/${plushie.id}`}
                      className="btn-secondary wishlist-details-btn"
                    >
                      View Bio ✨
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
