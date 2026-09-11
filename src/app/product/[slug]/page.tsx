'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { PLUSHIES } from '@/data/plushies';
import { useCart } from '@/context/CartContext';
import { useSound } from '@/context/SoundContext';
import { confettiEngine } from '@/utils/confetti';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ProductSizeGuide } from '@/components/ProductSizeGuide';

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = use(params);
  const { slug } = resolvedParams;

  const plushie = PLUSHIES.find((p) => p.id === slug);

  const { addItem, wishlist, toggleWishlist, showToast, setIsCartOpen } = useCart();
  const { playPop, playSquish } = useSound();

  const [qty, setQty] = useState(1);
  const [selectedAngle, setSelectedAngle] = useState(0);
  const [bundleIncluded, setBundleIncluded] = useState(true);

  if (!plushie) {
    notFound();
  }

  const isWishlisted = wishlist.includes(plushie.id);

  // Suggested bundle companion (picks another plushie from catalog)
  const bundleBuddy = PLUSHIES.find((p) => p.id !== plushie.id) || PLUSHIES[0];
  const bundleDiscount = 8.00;
  const bundleTotal = (plushie.price + bundleBuddy.price) - bundleDiscount;

  const handleAdopt = () => {
    playSquish();
    confettiEngine.burst();
    addItem(plushie.id, qty);
    showToast(`🎉 Adopted ${qty}x ${plushie.name}! Added to your basket.`);
    setIsCartOpen(true);
  };

  const handleAdoptBundle = () => {
    playSquish();
    confettiEngine.burst();
    addItem(plushie.id, 1);
    addItem(bundleBuddy.id, 1);
    showToast(`💖 Adopted the ${plushie.name} + ${bundleBuddy.name} Cuddle Duo! Saved $8.00!`);
    setIsCartOpen(true);
  };

  // Gallery view angles
  const galleryImages = [
    plushie.image,
    plushie.image, // Can be alternate views
    bundleBuddy.image,
  ];

  return (
    <div className="page-wrapper">
      <Navbar />

      <main className="product-detail-page container">
        {/* Breadcrumb Bar */}
        <nav className="pdp-breadcrumbs">
          <Link href="/" className="breadcrumb-link">Home</Link>
          <span className="breadcrumb-sep">›</span>
          <Link href="/#shop-section" className="breadcrumb-link">Shop Squad</Link>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-current">{plushie.name}</span>
        </nav>

        <div className="pdp-layout-grid">
          {/* Left: Gallery Showcase */}
          <div className="pdp-gallery-column">
            <div className="pdp-main-image-wrap">
              <Image
                src={galleryImages[selectedAngle]}
                alt={plushie.name}
                width={560}
                height={560}
                priority
                className="pdp-hero-image"
              />
              <span className={`pdp-badge ${plushie.badgeClass}`}>
                {plushie.badge}
              </span>
              <button
                className={`pdp-wishlist-float-btn ${isWishlisted ? 'active' : ''}`}
                onClick={() => {
                  playPop();
                  toggleWishlist(plushie.id);
                  showToast(isWishlisted ? `Removed from sanctuary` : `Saved ${plushie.name} to sanctuary! 💖`);
                }}
                title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
                type="button"
              >
                {isWishlisted ? '💖' : '🤍'}
              </button>
            </div>

            {/* Thumbnail Carousel */}
            <div className="pdp-thumbnails-row">
              {galleryImages.map((img, idx) => (
                <button
                  key={idx}
                  className={`pdp-thumb-btn ${selectedAngle === idx ? 'active' : ''}`}
                  onClick={() => {
                    playPop();
                    setSelectedAngle(idx);
                  }}
                  type="button"
                >
                  <Image src={img} alt="Thumbnail" width={80} height={80} />
                </button>
              ))}
            </div>

            {/* Squishiness Meter */}
            <div className="pdp-squish-meter-card">
              <div className="squish-label-row">
                <span>☁️ Squishiness Level</span>
                <strong className="squish-val">{plushie.squishFactor}</strong>
              </div>
              <div className="squish-gauge-bar">
                <div className="squish-gauge-fill" style={{ width: '97%' }}></div>
              </div>
              <p className="squish-subnote">
                Tested to spring right back into shape after 1,000 deep bear hugs!
              </p>
            </div>
          </div>

          {/* Right: Details & Purchase Options */}
          <div className="pdp-info-column">
            <div className="pdp-category-pill">{plushie.category.toUpperCase()} EDITION</div>
            <h1 className="pdp-title">{plushie.name}</h1>
            <p className="pdp-subtitle">{plushie.subtitle}</p>

            {/* Rating */}
            <div className="pdp-rating-row">
              <div className="rating-stars">⭐⭐⭐⭐⭐</div>
              <span className="rating-score"><strong>{plushie.rating.toFixed(1)}</strong></span>
              <span className="rating-count">({plushie.reviewsCount} verified cuddle reviews)</span>
            </div>

            {/* Price Row */}
            <div className="pdp-price-row">
              <span className="pdp-current-price">${plushie.price.toFixed(2)}</span>
              <span className="pdp-original-price">${plushie.originalPrice.toFixed(2)}</span>
              <span className="pdp-save-badge">
                Save ${(plushie.originalPrice - plushie.price).toFixed(2)}
              </span>
            </div>

            <p className="pdp-description">{plushie.description}</p>

            {/* Personality Dossier */}
            <div className="pdp-personality-box">
              <h3 className="personality-box-title">🧸 Companion Dossier</h3>
              <div className="personality-grid">
                <div className="personality-item">
                  <span className="pers-icon">🌟</span>
                  <div>
                    <strong>Cuddle Superpower</strong>
                    <p>Instant stress absorption</p>
                  </div>
                </div>
                <div className="personality-item">
                  <span className="pers-icon">🍓</span>
                  <div>
                    <strong>Favorite Snack</strong>
                    <p>Mochi & Strawberry milk</p>
                  </div>
                </div>
                <div className="personality-item">
                  <span className="pers-icon">🌙</span>
                  <div>
                    <strong>Sleep Style</strong>
                    <p>Curled up right by your cheek</p>
                  </div>
                </div>
                <div className="personality-item">
                  <span className="pers-icon">📏</span>
                  <div>
                    <strong>Dimensions</strong>
                    <p>{plushie.dimensions}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sizing & Real-Life Scale Anchor */}
            <div className="pdp-size-guide-row">
              <span>Not sure about {plushie.name}&apos;s size in real life?</span>
              <a
                href="#size-guide-section"
                className="pdp-open-comparator-btn"
                onClick={() => playPop()}
              >
                📏 View In-Page Size &amp; Hug Guide ↓
              </a>
            </div>

            {/* Quantity and Add to Cart */}
            <div className="pdp-purchase-actions">
              <div className="pdp-qty-counter">
                <button
                  type="button"
                  onClick={() => {
                    playPop();
                    setQty(Math.max(1, qty - 1));
                  }}
                  className="qty-btn"
                >
                  -
                </button>
                <span className="qty-display">{qty}</span>
                <button
                  type="button"
                  onClick={() => {
                    playPop();
                    setQty(qty + 1);
                  }}
                  className="qty-btn"
                >
                  +
                </button>
              </div>

              <button
                className="btn-primary pdp-adopt-btn"
                onClick={handleAdopt}
                type="button"
              >
                Adopt {plushie.name} 🍓 (${(plushie.price * qty).toFixed(2)})
              </button>
            </div>

            {/* Adoption Guarantee Perks */}
            <div className="pdp-guarantee-perks">
              <div className="perk-item">
                <span>📦</span>
                <span>Includes Official Printed Adoption Certificate</span>
              </div>
              <div className="perk-item">
                <span>🚚</span>
                <span>Free Priority Cuddle Shipping on orders $45+</span>
              </div>
              <div className="perk-item">
                <span>🧼</span>
                <span>Hypoallergenic • Machine Wash Gentle Cold</span>
              </div>
            </div>

            {/* Frequently Cuddled Together Bundle Card */}
            <div className="pdp-bundle-card">
              <div className="bundle-header">
                <span className="bundle-badge">🎁 Best Cuddle Duo Deal</span>
                <h4>Frequently Cuddled Together</h4>
              </div>

              <div className="bundle-buddies-row">
                <div className="bundle-thumb">
                  <Image src={plushie.image} alt={plushie.name} width={65} height={65} />
                  <span>{plushie.name}</span>
                </div>
                <div className="bundle-plus">+</div>
                <div className="bundle-thumb">
                  <Image src={bundleBuddy.image} alt={bundleBuddy.name} width={65} height={65} />
                  <span>{bundleBuddy.name}</span>
                </div>
              </div>

              <div className="bundle-footer">
                <div className="bundle-pricing">
                  <span className="bundle-total">${bundleTotal.toFixed(2)}</span>
                  <span className="bundle-original">${(plushie.price + bundleBuddy.price).toFixed(2)}</span>
                  <span className="bundle-discount-pill">Save $8.00!</span>
                </div>
                <button
                  className="btn-primary bundle-adopt-btn"
                  onClick={handleAdoptBundle}
                  type="button"
                >
                  Adopt Both Buddies 💖
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Dedicated In-Page Size & Hug-O-Meter Guide Section */}
        <ProductSizeGuide plushie={plushie} />

        {/* Care & Washing Guide Accordion / Card */}
        <section className="pdp-care-section">
          <div className="pdp-care-card">
            <h2 className="care-title">🫧 How to Keep Your Plushie Super Soft Forever</h2>
            <div className="care-grid">
              <div className="care-step">
                <div className="care-icon">🧺</div>
                <h4>Gentle Wash</h4>
                <p>Tuck your plushie into a mesh laundry bag or pillowcase. Wash on delicate cold cycle.</p>
              </div>
              <div className="care-step">
                <div className="care-icon">💨</div>
                <h4>Cloud Air Dry</h4>
                <p>Air dry in a breezy sunny spot, or tumble dry on no-heat delicate to restore ultra-puffiness.</p>
              </div>
              <div className="care-step">
                <div className="care-icon">✨</div>
                <h4>Daily Fluff</h4>
                <p>Give your companion a light squeeze and brush their micro-velvet fur with clean hands.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
