'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PLUSHIES } from '@/data/plushies';
import { Plushie, Category, MoodKey } from '@/types/plushie';
import { Navbar } from '@/components/Navbar';
import { AnnouncementBar } from '@/components/AnnouncementBar';
import { Footer } from '@/components/Footer';
import { QuickViewModal } from '@/components/QuickViewModal';
import { useCart } from '@/context/CartContext';
import { useSound } from '@/context/SoundContext';
import { confettiEngine } from '@/utils/confetti';

type PriceRange = 'all' | 'under30' | '30to35' | 'above35';
type SquishFilter = 'all' | 'max' | 'ultra';
type SortOption = 'featured' | 'popular' | 'price-asc' | 'price-desc' | 'rating' | 'squish';

const CATEGORY_NAMES: Record<Category, string> = {
  all: 'All Collections',
  kawaii: 'Kawaii Classics 🍓',
  dream: 'Dream Paws 🐾',
  sea: 'Sea Cuties 🌊',
  prehistoric: 'Prehistoric Puffs 🦕',
};

const MOOD_OPTIONS: { id: 'all' | MoodKey; label: string; emoji: string }[] = [
  { id: 'all', label: 'All Moods', emoji: '✨' },
  { id: 'sleepy', label: 'Sleepy Snuggler', emoji: '💤' },
  { id: 'zen', label: 'Zen & Soothing', emoji: '🍵' },
  { id: 'dreamy', label: 'Dreamy Companion', emoji: '🌙' },
  { id: 'chaotic', label: 'Chaotic Cheer', emoji: '🎉' },
];

const RECENT_ADOPTIONS = [
  { name: 'Pip & Peaches 🍓', city: 'Tokyo, Japan', time: '2m ago' },
  { name: 'Matcha Dino 🍵', city: 'Seattle, USA', time: '5m ago' },
  { name: 'Boba the Bear 🧋', city: 'London, UK', time: '8m ago' },
  { name: 'Panko the Axolotl 🌊', city: 'Toronto, Canada', time: '11m ago' },
  { name: 'Cloudia the Kitty ✨', city: 'Paris, France', time: '14m ago' },
];

export default function ShopPage() {
  const router = useRouter();
  const { wishlist, toggleWishlist, addItem, setIsCartOpen, showToast, subtotal } = useCart();
  const { playPop, playChime, playSquish } = useSound();

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState<Category>('all');
  const [priceRange, setPriceRange] = useState<PriceRange>('all');
  const [squishFilter, setSquishFilter] = useState<SquishFilter>('all');
  const [moodFilter, setMoodFilter] = useState<'all' | MoodKey>('all');
  const [badgeFilter, setBadgeFilter] = useState<string>('all');
  const [inStockOnly, setInStockOnly] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [quickViewPlushie, setQuickViewPlushie] = useState<Plushie | null>(null);

  // Social Proof Ticker State
  const [tickerIndex, setTickerIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % RECENT_ADOPTIONS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  // Filter logic
  const filteredPlushies = useMemo(() => {
    return PLUSHIES.filter((p) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matches =
          p.name.toLowerCase().includes(q) ||
          p.subtitle.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.material.toLowerCase().includes(q);
        if (!matches) return false;
      }

      // Category
      if (category !== 'all' && p.category !== category) {
        return false;
      }

      // Price Range
      if (priceRange === 'under30' && p.price >= 30) return false;
      if (priceRange === '30to35' && (p.price < 30 || p.price > 35)) return false;
      if (priceRange === 'above35' && p.price <= 35) return false;

      // Squish Factor
      if (squishFilter === 'max') {
        if (!p.squishFactor.includes('10')) return false;
      } else if (squishFilter === 'ultra') {
        const val = parseFloat(p.squishFactor);
        if (isNaN(val) || val < 9.8) return false;
      }

      // Mood
      if (moodFilter !== 'all' && p.mood !== moodFilter) {
        return false;
      }

      // Badge / Tag
      if (badgeFilter !== 'all' && p.badgeClass !== badgeFilter) {
        return false;
      }

      return true;
    });
  }, [searchQuery, category, priceRange, squishFilter, moodFilter, badgeFilter]);

  // Sort logic
  const sortedPlushies = useMemo(() => {
    const list = [...filteredPlushies];
    switch (sortBy) {
      case 'popular':
        return list.sort((a, b) => b.reviewsCount - a.reviewsCount);
      case 'price-asc':
        return list.sort((a, b) => a.price - b.price);
      case 'price-desc':
        return list.sort((a, b) => b.price - a.price);
      case 'rating':
        return list.sort((a, b) => b.rating - a.rating);
      case 'squish':
        return list.sort((a, b) => {
          const sA = parseFloat(a.squishFactor) || 9.5;
          const sB = parseFloat(b.squishFactor) || 9.5;
          return sB - sA;
        });
      case 'featured':
      default:
        return list;
    }
  }, [filteredPlushies, sortBy]);

  // Active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (category !== 'all') count++;
    if (priceRange !== 'all') count++;
    if (squishFilter !== 'all') count++;
    if (moodFilter !== 'all') count++;
    if (badgeFilter !== 'all') count++;
    if (!inStockOnly) count++;
    if (searchQuery.trim()) count++;
    return count;
  }, [category, priceRange, squishFilter, moodFilter, badgeFilter, inStockOnly, searchQuery]);

  const handleResetFilters = () => {
    playPop();
    setSearchQuery('');
    setCategory('all');
    setPriceRange('all');
    setSquishFilter('all');
    setMoodFilter('all');
    setBadgeFilter('all');
    setInStockOnly(true);
    setSortBy('featured');
    showToast('🌸 Filters reset to default catalog view');
  };

  // Instant 1-Click Adopt & Checkout
  const handleInstantCheckout = (e: React.MouseEvent, plushie: Plushie) => {
    e.preventDefault();
    e.stopPropagation();
    playChime();
    addItem(plushie.id);
    showToast(`⚡ ${plushie.name} ready! Fast-routing to checkout...`);
    router.push('/checkout');
  };

  const handleStandardAddToCart = (e: React.MouseEvent, plushie: Plushie) => {
    e.preventDefault();
    e.stopPropagation();
    playSquish();
    confettiEngine.burst(e.clientX, e.clientY);
    addItem(plushie.id);
    showToast(`💖 ${plushie.name} snuggled safely into your basket!`);
    setIsCartOpen(true);
  };

  // Free shipping threshold calculations
  const freeShippingThreshold = 45;
  const amountToFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const freeShippingPercent = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  return (
    <div className="page-wrapper shop-page-root">
      <AnnouncementBar />
      <Navbar />

      <main className="shop-main-content">
        {/* Breadcrumb & Shop Header Banner */}
        <section className="shop-header-banner">
          <div className="container">
            <nav className="shop-breadcrumbs" aria-label="Breadcrumb">
              <Link href="/">Home</Link>
              <span className="breadcrumb-separator">/</span>
              <span className="breadcrumb-current">Sanctuary Catalog</span>
            </nav>

            <div className="shop-header-intro">
              <div className="shop-title-col">
                <span className="shop-eyebrow-tag">🍓 Official Adoption Haven</span>
                <h1 className="shop-main-title">
                  Browse & Adopt Your <span className="highlight-text">Dream Plushie</span>
                </h1>
                <p className="shop-main-desc">
                  Every hand-stitched companion comes packed in a cloud-cushioned gift box with their official Birth & Adoption Certificate, squish-care guide, and scented sticker pack.
                </p>
              </div>

              {/* Social Proof Live Ticker */}
              <div className="shop-live-ticker-card">
                <div className="ticker-badge">
                  <span className="live-pulsing-dot"></span> Live Adoption Feed
                </div>
                <div className="ticker-text">
                  <strong>{RECENT_ADOPTIONS[tickerIndex].name}</strong> was just adopted in{' '}
                  <span className="ticker-city">{RECENT_ADOPTIONS[tickerIndex].city}</span>!
                </div>
                <span className="ticker-time">{RECENT_ADOPTIONS[tickerIndex].time}</span>
              </div>
            </div>

            {/* Free Shipping & Snuggle Progress Bar */}
            <div className="shop-shipping-progress-card">
              <div className="shipping-progress-info">
                <span className="shipping-icon">🚚✨</span>
                <div className="shipping-text">
                  {amountToFreeShipping > 0 ? (
                    <p>
                      Add <strong>${amountToFreeShipping.toFixed(2)}</strong> more to unlock{' '}
                      <span className="accent-highlight">Free Express Snuggle Shipping</span>!
                    </p>
                  ) : (
                    <p>
                      🎉 <strong>Hooray!</strong> You unlocked <strong>Free Express Snuggle Shipping</strong>!
                    </p>
                  )}
                </div>
                <span className="shipping-pct-tag">{Math.round(freeShippingPercent)}%</span>
              </div>
              <div className="shipping-bar-track">
                <div
                  className="shipping-bar-fill"
                  style={{ width: `${freeShippingPercent}%` }}
                />
              </div>
            </div>
          </div>
        </section>

        <div className="container shop-body-container">
          {/* Controls Bar: Search, Sorting, Layout Toggles & Mobile Filter Button */}
          <div className="shop-controls-bar">
            {/* Search Input */}
            <div className="shop-search-wrapper">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                className="shop-search-input"
                placeholder="Search companions, materials, moods..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search plushies"
              />
              {searchQuery && (
                <button
                  type="button"
                  className="search-clear-btn"
                  onClick={() => setSearchQuery('')}
                  title="Clear search"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Right Controls */}
            <div className="shop-controls-right">
              {/* Mobile Filter Trigger */}
              <button
                type="button"
                className="mobile-filter-drawer-btn"
                onClick={() => setMobileFiltersOpen(true)}
              >
                <span>🎛️ Filters</span>
                {activeFiltersCount > 0 && (
                  <span className="filter-count-badge">{activeFiltersCount}</span>
                )}
              </button>

              {/* Sorting Selector */}
              <div className="shop-sort-wrapper">
                <label htmlFor="shop-sort-select" className="sort-label">Sort By:</label>
                <select
                  id="shop-sort-select"
                  className="shop-sort-select"
                  value={sortBy}
                  onChange={(e) => {
                    playPop();
                    setSortBy(e.target.value as SortOption);
                  }}
                >
                  <option value="featured">✨ Featured & Staff Picks</option>
                  <option value="popular">🔥 Most Popular (Adoption Velocity)</option>
                  <option value="price-asc">💵 Price: Sweet to Splurge ($ → $$$)</option>
                  <option value="price-desc">💎 Price: Splurge to Sweet ($$$ → $)</option>
                  <option value="rating">⭐ Customer Rating (5★ First)</option>
                  <option value="squish">☁️ Squish Factor (Fluffiest First)</option>
                </select>
              </div>

              {/* View Mode Toggle */}
              <div className="view-mode-toggle-group">
                <button
                  type="button"
                  className={`view-mode-btn ${viewMode === 'grid' ? 'active' : ''}`}
                  onClick={() => {
                    playPop();
                    setViewMode('grid');
                  }}
                  title="Grid View"
                  aria-label="Grid view"
                >
                  ⊞
                </button>
                <button
                  type="button"
                  className={`view-mode-btn ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => {
                    playPop();
                    setViewMode('list');
                  }}
                  title="Detailed Snuggle List View"
                  aria-label="Detailed list view"
                >
                  ☰
                </button>
              </div>
            </div>
          </div>

          {/* Active Filter Chips Row */}
          {activeFiltersCount > 0 && (
            <div className="active-filter-chips-row">
              <span className="active-filter-label">Active Filters ({activeFiltersCount}):</span>

              {category !== 'all' && (
                <button
                  type="button"
                  className="filter-chip"
                  onClick={() => setCategory('all')}
                >
                  {CATEGORY_NAMES[category]} ✕
                </button>
              )}

              {priceRange !== 'all' && (
                <button
                  type="button"
                  className="filter-chip"
                  onClick={() => setPriceRange('all')}
                >
                  {priceRange === 'under30'
                    ? 'Under $30 ✕'
                    : priceRange === '30to35'
                    ? '$30 - $35 ✕'
                    : 'Over $35 ✕'}
                </button>
              )}

              {squishFilter !== 'all' && (
                <button
                  type="button"
                  className="filter-chip"
                  onClick={() => setSquishFilter('all')}
                >
                  {squishFilter === 'max' ? '10/10 Max Squish ✕' : '9.8+ Ultra Soft ✕'}
                </button>
              )}

              {moodFilter !== 'all' && (
                <button
                  type="button"
                  className="filter-chip"
                  onClick={() => setMoodFilter('all')}
                >
                  Mood: {moodFilter} ✕
                </button>
              )}

              {badgeFilter !== 'all' && (
                <button
                  type="button"
                  className="filter-chip"
                  onClick={() => setBadgeFilter('all')}
                >
                  Badge: {badgeFilter} ✕
                </button>
              )}

              {searchQuery && (
                <button
                  type="button"
                  className="filter-chip"
                  onClick={() => setSearchQuery('')}
                >
                  "{searchQuery}" ✕
                </button>
              )}

              <button
                type="button"
                className="clear-all-filters-btn"
                onClick={handleResetFilters}
              >
                Reset All ↺
              </button>
            </div>
          )}

          {/* 2-Column E-Commerce Layout: Sticky Filter Sidebar + Product Grid */}
          <div className="shop-layout-grid">
            {/* Desktop Filter Sidebar */}
            <aside className="shop-filter-sidebar" aria-label="Catalog Filters">
              <div className="sidebar-filter-header">
                <span className="filter-panel-title">Filter Squad</span>
                {activeFiltersCount > 0 && (
                  <button
                    type="button"
                    className="sidebar-reset-btn"
                    onClick={handleResetFilters}
                  >
                    Reset ({activeFiltersCount})
                  </button>
                )}
              </div>

              {/* 1. Category Filter Group */}
              <div className="filter-group-box">
                <h4 className="filter-group-title">Collections</h4>
                <div className="filter-options-vertical">
                  {(['all', 'kawaii', 'dream', 'sea', 'prehistoric'] as Category[]).map((catKey) => {
                    const count =
                      catKey === 'all'
                        ? PLUSHIES.length
                        : PLUSHIES.filter((p) => p.category === catKey).length;
                    return (
                      <button
                        key={catKey}
                        type="button"
                        className={`filter-option-btn ${category === catKey ? 'active' : ''}`}
                        onClick={() => {
                          playPop();
                          setCategory(catKey);
                        }}
                      >
                        <span className="option-label">{CATEGORY_NAMES[catKey]}</span>
                        <span className="option-count">{count}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Price Range Group */}
              <div className="filter-group-box">
                <h4 className="filter-group-title">Price Range</h4>
                <div className="filter-options-pills">
                  <button
                    type="button"
                    className={`filter-pill-btn ${priceRange === 'all' ? 'active' : ''}`}
                    onClick={() => {
                      playPop();
                      setPriceRange('all');
                    }}
                  >
                    All Prices
                  </button>
                  <button
                    type="button"
                    className={`filter-pill-btn ${priceRange === 'under30' ? 'active' : ''}`}
                    onClick={() => {
                      playPop();
                      setPriceRange('under30');
                    }}
                  >
                    Under $30
                  </button>
                  <button
                    type="button"
                    className={`filter-pill-btn ${priceRange === '30to35' ? 'active' : ''}`}
                    onClick={() => {
                      playPop();
                      setPriceRange('30to35');
                    }}
                  >
                    $30 - $35
                  </button>
                  <button
                    type="button"
                    className={`filter-pill-btn ${priceRange === 'above35' ? 'active' : ''}`}
                    onClick={() => {
                      playPop();
                      setPriceRange('above35');
                    }}
                  >
                    $35+
                  </button>
                </div>
              </div>

              {/* 3. Squish Factor Level */}
              <div className="filter-group-box">
                <h4 className="filter-group-title">Squish Factor</h4>
                <div className="filter-options-vertical">
                  <button
                    type="button"
                    className={`filter-option-btn ${squishFilter === 'all' ? 'active' : ''}`}
                    onClick={() => {
                      playPop();
                      setSquishFilter('all');
                    }}
                  >
                    <span className="option-label">☁️ All Fluff Levels</span>
                  </button>
                  <button
                    type="button"
                    className={`filter-option-btn ${squishFilter === 'max' ? 'active' : ''}`}
                    onClick={() => {
                      playPop();
                      setSquishFilter('max');
                    }}
                  >
                    <span className="option-label">🌟 10 / 10 Max Chonk</span>
                    <span className="option-badge-soft">Ultra Squish</span>
                  </button>
                  <button
                    type="button"
                    className={`filter-option-btn ${squishFilter === 'ultra' ? 'active' : ''}`}
                    onClick={() => {
                      playPop();
                      setSquishFilter('ultra');
                    }}
                  >
                    <span className="option-label">💖 9.8+ Cloud Grade</span>
                  </button>
                </div>
              </div>

              {/* 4. Companion Mood Filter */}
              <div className="filter-group-box">
                <h4 className="filter-group-title">Companion Mood</h4>
                <div className="filter-mood-grid">
                  {MOOD_OPTIONS.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      className={`mood-chip-btn ${moodFilter === m.id ? 'active' : ''}`}
                      onClick={() => {
                        playPop();
                        setMoodFilter(m.id);
                      }}
                    >
                      <span>{m.emoji}</span>
                      <span>{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 5. Special Badges */}
              <div className="filter-group-box">
                <h4 className="filter-group-title">Special Editions</h4>
                <div className="filter-options-pills">
                  <button
                    type="button"
                    className={`filter-pill-btn ${badgeFilter === 'all' ? 'active' : ''}`}
                    onClick={() => {
                      playPop();
                      setBadgeFilter('all');
                    }}
                  >
                    All Badges
                  </button>
                  <button
                    type="button"
                    className={`filter-pill-btn ${badgeFilter === 'best-seller' ? 'active' : ''}`}
                    onClick={() => {
                      playPop();
                      setBadgeFilter('best-seller');
                    }}
                  >
                    Best Sellers ⭐
                  </button>
                  <button
                    type="button"
                    className={`filter-pill-btn ${badgeFilter === 'staff-pick' ? 'active' : ''}`}
                    onClick={() => {
                      playPop();
                      setBadgeFilter('staff-pick');
                    }}
                  >
                    Staff Pick 🍵
                  </button>
                  <button
                    type="button"
                    className={`filter-pill-btn ${badgeFilter === 'new-cutie' ? 'active' : ''}`}
                    onClick={() => {
                      playPop();
                      setBadgeFilter('new-cutie');
                    }}
                  >
                    New Arrivals ✨
                  </button>
                </div>
              </div>

              {/* 6. In-Stock Availability Toggle */}
              <div className="filter-group-box availability-box">
                <label className="toggle-label-row">
                  <span>Ready to Ship Only 📦</span>
                  <input
                    type="checkbox"
                    className="shop-toggle-checkbox"
                    checked={inStockOnly}
                    onChange={(e) => {
                      playPop();
                      setInStockOnly(e.target.checked);
                    }}
                  />
                </label>
              </div>

              {/* Fast Checkout Promise Card */}
              <div className="sidebar-promise-box">
                <div className="promise-bubble-icon">🎀✨</div>
                <h4>Cloud Haven Guarantee</h4>
                <p>Official Adoption Papers, sticker set, and 30-day cuddle return policy included with every order.</p>
              </div>
            </aside>

            {/* Product Display Column */}
            <section className="shop-products-column" aria-label="Plushie Catalog Items">
              {/* Results summary bar */}
              <div className="products-summary-bar">
                <span className="results-count-text">
                  Showing <strong>{sortedPlushies.length}</strong> of {PLUSHIES.length} cuddle companions
                </span>
                <span className="fast-shipping-hint">⚡ All plushies ship within 24 hours</span>
              </div>

              {/* Product Listing */}
              {sortedPlushies.length === 0 ? (
                /* Empty state when filters return zero results */
                <div className="shop-empty-state-card">
                  <div className="empty-mascot-icon">🥺🧸</div>
                  <h3 className="empty-title">No Cuddle Buddies Found</h3>
                  <p className="empty-desc">
                    We couldn't find any plushies matching your current search or filter combination.
                  </p>
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={handleResetFilters}
                  >
                    Reset Filters & View All Friends 🌸
                  </button>
                </div>
              ) : (
                <div className={`shop-catalog-list ${viewMode === 'list' ? 'list-view-mode' : 'grid-view-mode'}`}>
                  {sortedPlushies.map((product) => {
                    const isLoved = wishlist.includes(product.id);
                    return (
                      <article
                        key={product.id}
                        className="shop-product-card"
                        data-id={product.id}
                      >
                        {/* Thumbnail & Badges */}
                        <div className="shop-card-thumb-wrap">
                          <Link href={`/product/${product.id}`} className="thumb-link">
                            <Image
                              src={product.image}
                              alt={`${product.name} Plushie`}
                              width={400}
                              height={400}
                              className="shop-card-img"
                              priority={product.id === 'pip-bunny'}
                            />
                          </Link>

                          <span className={`card-pill-tag ${product.badgeClass}`}>
                            {product.badge}
                          </span>

                          <button
                            type="button"
                            className={`shop-wishlist-btn ${isLoved ? 'loved' : ''}`}
                            title={isLoved ? 'Remove from wishlist' : 'Save to wishlist'}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              playPop();
                              toggleWishlist(product.id);
                              showToast(isLoved ? '💔 Removed from saved wishlist' : '💖 Saved to your wishlist!');
                            }}
                          >
                            {isLoved ? '❤️' : '♥'}
                          </button>

                          <button
                            type="button"
                            className="shop-quick-peek-overlay-btn"
                            onClick={() => {
                              playPop();
                              setQuickViewPlushie(product);
                            }}
                          >
                            <span>Quick Peek 👀</span>
                          </button>
                        </div>

                        {/* Product Info */}
                        <div className="shop-card-body">
                          <div className="card-squish-row">
                            <span className="squish-tag">☁️ Squish: {product.squishFactor}</span>
                            <span className="card-rating-tag">⭐ {product.rating} ({product.reviewsCount})</span>
                          </div>

                          <h3 className="shop-card-title">
                            <Link href={`/product/${product.id}`}>{product.name}</Link>
                          </h3>
                          <p className="shop-card-subtitle">{product.subtitle}</p>

                          {viewMode === 'list' && (
                            <p className="shop-card-desc">{product.description}</p>
                          )}

                          <div className="shop-card-price-row">
                            <div className="price-display-group">
                              <span className="shop-current-price">${product.price.toFixed(2)}</span>
                              <span className="shop-original-price">${product.originalPrice.toFixed(2)}</span>
                            </div>
                            <span className="shop-stock-status">Ready to Snuggle</span>
                          </div>

                          {/* Accelerated Fast Checkout Actions */}
                          <div className="shop-card-actions-grid">
                            <button
                              type="button"
                              className="btn-shop-adopt"
                              onClick={(e) => handleStandardAddToCart(e, product)}
                            >
                              <span>Adopt Me 💖</span>
                            </button>

                            <button
                              type="button"
                              className="btn-shop-instant-checkout"
                              title="Instant Checkout: Add to basket and proceed immediately to checkout"
                              onClick={(e) => handleInstantCheckout(e, product)}
                            >
                              <span>⚡ Instant Order</span>
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        </div>

        {/* Sanctuary Trust & Peace-of-Mind Badges */}
        <section className="shop-trust-section">
          <div className="container">
            <div className="trust-badges-grid">
              <div className="trust-card">
                <span className="trust-icon">📜</span>
                <h4>Personalized Certificate</h4>
                <p>Every plushie arrives with an official hand-stamped adoption certificate.</p>
              </div>
              <div className="trust-card">
                <span className="trust-icon">☁️</span>
                <h4>100% Cloud Polyfill</h4>
                <p>Hyper-resilient, hypoallergenic, and never clumps after hugs or washing.</p>
              </div>
              <div className="trust-card">
                <span className="trust-icon">✨</span>
                <h4>30-Day Hug Guarantee</h4>
                <p>Not 100% in love? Sweet and effortless returns within 30 days.</p>
              </div>
              <div className="trust-card">
                <span className="trust-icon">🎁</span>
                <h4>Secret Sticker Sheet</h4>
                <p>Complimentary collectible pastel stickers included in every parcel.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewPlushie}
        onClose={() => setQuickViewPlushie(null)}
      />

      {/* Mobile Filter Drawer Overlay */}
      {mobileFiltersOpen && (
        <div className="mobile-filter-drawer-backdrop" onClick={() => setMobileFiltersOpen(false)}>
          <div className="mobile-filter-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-filter-drawer-header">
              <h3>Filter Sanctuary Squad</h3>
              <button
                type="button"
                className="mobile-filter-drawer-close"
                onClick={() => setMobileFiltersOpen(false)}
              >
                ✕
              </button>
            </div>

            <div className="mobile-filter-drawer-content">
              {/* Category */}
              <div className="filter-group-box">
                <h4 className="filter-group-title">Collections</h4>
                <div className="filter-options-vertical">
                  {(['all', 'kawaii', 'dream', 'sea', 'prehistoric'] as Category[]).map((catKey) => (
                    <button
                      key={catKey}
                      type="button"
                      className={`filter-option-btn ${category === catKey ? 'active' : ''}`}
                      onClick={() => {
                        playPop();
                        setCategory(catKey);
                      }}
                    >
                      <span>{CATEGORY_NAMES[catKey]}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div className="filter-group-box">
                <h4 className="filter-group-title">Price Range</h4>
                <div className="filter-options-pills">
                  {(['all', 'under30', '30to35', 'above35'] as PriceRange[]).map((p) => (
                    <button
                      key={p}
                      type="button"
                      className={`filter-pill-btn ${priceRange === p ? 'active' : ''}`}
                      onClick={() => {
                        playPop();
                        setPriceRange(p);
                      }}
                    >
                      {p === 'all' ? 'All' : p === 'under30' ? '< $30' : p === '30to35' ? '$30-$35' : '$35+'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mood */}
              <div className="filter-group-box">
                <h4 className="filter-group-title">Mood</h4>
                <div className="filter-mood-grid">
                  {MOOD_OPTIONS.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      className={`mood-chip-btn ${moodFilter === m.id ? 'active' : ''}`}
                      onClick={() => {
                        playPop();
                        setMoodFilter(m.id);
                      }}
                    >
                      <span>{m.emoji}</span>
                      <span>{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mobile-filter-drawer-footer">
              <button
                type="button"
                className="btn-secondary"
                onClick={handleResetFilters}
              >
                Reset All
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={() => setMobileFiltersOpen(false)}
              >
                Show Results ({sortedPlushies.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
