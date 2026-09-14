'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useSound } from '@/context/SoundContext';
import { PLUSHIES } from '@/data/plushies';
import { confettiEngine } from '@/utils/confetti';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export default function WishlistPage() {
  const { wishlist, toggleWishlist, clearWishlist, addItem, showToast, setIsCartOpen } = useCart();
  const { user, isLoggedIn } = useAuth();
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
        {/* Public vs Authenticated Synchronization Notice */}
        <div style={{
          marginBottom: '1.5rem',
          padding: '1rem 1.4rem',
          borderRadius: '16px',
          background: isLoggedIn
            ? 'linear-gradient(135deg, rgba(236, 253, 245, 0.95), rgba(240, 253, 250, 0.9))'
            : 'linear-gradient(135deg, rgba(254, 243, 199, 0.95), rgba(255, 237, 213, 0.9))',
          border: isLoggedIn ? '1.5px solid #A7F3D0' : '1.5px solid #FDE68A',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          boxShadow: '0 4px 15px rgba(0,0,0,0.03)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <span style={{ fontSize: '1.6rem' }}>{isLoggedIn ? '✨' : '💡'}</span>
            <div>
              <strong style={{ display: 'block', fontSize: '0.95rem', color: isLoggedIn ? '#065F46' : '#92400E' }}>
                {isLoggedIn ? `Cloud Parent Sanctuary Linked (${user?.email})` : 'Public Guest Wishlist Active'}
              </strong>
              <span style={{ fontSize: '0.85rem', color: isLoggedIn ? '#047857' : '#B45309' }}>
                {isLoggedIn
                  ? 'Your saved cuddle buddies are permanently stored and integrated with your User Dashboard.'
                  : 'Add plushies freely as a guest! Once you create an account, these same items will appear directly in your User Dashboard.'}
              </span>
            </div>
          </div>

          <div>
            {isLoggedIn ? (
              <Link
                href="/dashboard?tab=wishlist"
                className="btn-secondary"
                style={{ fontSize: '0.85rem', padding: '0.45rem 0.9rem', whiteSpace: 'nowrap' }}
                onClick={playPop}
              >
                🧸 View in Dashboard Sanctuary →
              </Link>
            ) : (
              <Link
                href="/login"
                className="btn-primary"
                style={{ fontSize: '0.85rem', padding: '0.45rem 0.9rem', whiteSpace: 'nowrap' }}
                onClick={playPop}
              >
                Create Account & Sync Buddies ✨
              </Link>
            )}
          </div>
        </div>

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
              <button
                className="btn-secondary"
                style={{ padding: '0.6rem 0.9rem', color: '#EF4444', borderColor: '#FCA5A5' }}
                onClick={() => {
                  if (window.confirm('Clear all buddies from your wishlist?')) {
                    clearWishlist();
                  }
                }}
                type="button"
              >
                Clear All 🗑️
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
