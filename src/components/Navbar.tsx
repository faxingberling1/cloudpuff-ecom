'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useSound } from '@/context/SoundContext';
import { useTheme } from '@/context/ThemeContext';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { totalCount, setIsCartOpen, wishlist } = useCart();
  const { muted, toggleSound, playPop, playChime } = useSound();
  const { isNightMode, toggleNightMode, isLullabyPlaying, toggleLullaby } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isShopActive = pathname === '/' || pathname.startsWith('/product');
  const isStudioActive = pathname === '/customizer';
  const isGameActive = pathname === '/game';
  const isOrdersActive = pathname === '/orders';
  const isWishlistActive = pathname === '/wishlist';

  const handleLullabyToggle = () => {
    if (isLullabyPlaying) {
      toggleLullaby();
      if (!muted) {
        toggleSound();
      }
      playPop();
    } else if (muted) {
      toggleSound();
      toggleLullaby();
      playChime();
    } else {
      toggleLullaby();
      playChime();
    }
  };

  return (
    <header className="navbar">
      <div className="container nav-container">
        {/* Brand Logo */}
        <Link href="/" className="brand-logo" id="nav-brand-logo">
          <span className="logo-icon-wrap">🧸</span>
          <span className="brand-name">CloudPuff</span>
        </Link>

        {/* Navigation Links */}
        <ul className={`nav-links ${mobileMenuOpen ? 'mobile-open' : ''}`} id="nav-links">
          <li>
            <Link
              href="/#shop-section"
              className={`nav-link ${isShopActive ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <span>Shop</span>
              <span>🍓</span>
            </Link>
          </li>
          <li>
            <Link
              href="/customizer"
              className={`nav-link ${isStudioActive ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <span>Studio</span>
              <span>🎨</span>
            </Link>
          </li>
          <li>
            <Link
              href="/game"
              className={`nav-link ${isGameActive ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <span>Cloud Hop</span>
              <span>🎮</span>
            </Link>
          </li>
          <li>
            <Link
              href="/orders"
              className={`nav-link ${isOrdersActive ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <span>Orders</span>
              <span>📖</span>
            </Link>
          </li>
          <li>
            <Link
              href="/wishlist"
              className={`nav-link ${isWishlistActive ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <span>Wishlist</span>
              <span>💖 {wishlist.length > 0 ? `(${wishlist.length})` : ''}</span>
            </Link>
          </li>
        </ul>

        {/* Action Buttons */}
        <div className="nav-actions">
          {/* Night Mode Toggle */}
          <button
            className="action-pill-btn night-toggle-btn"
            id="night-toggle-btn"
            onClick={() => {
              playPop();
              toggleNightMode();
            }}
            title={isNightMode ? 'Switch to Sunny Pastel' : 'Switch to Nighttime Snuggle'}
            type="button"
          >
            <span>{isNightMode ? '☀️' : '🌙'}</span>
            <span>{isNightMode ? 'Day' : 'Night'}</span>
          </button>

          {/* Unified Lullaby & Mute/Unmute Audio Toggle */}
          <button
            className={`action-pill-btn lullaby-btn ${isLullabyPlaying ? 'playing' : ''} ${muted ? 'muted' : ''}`}
            id="lullaby-toggle-btn"
            onClick={handleLullabyToggle}
            title={
              isLullabyPlaying
                ? 'Lullaby is playing (Click to Mute & Stop)'
                : muted
                ? 'Audio is Muted (Click to Unmute & Play Lullaby)'
                : 'Click to Play Ambient Lullaby'
            }
            type="button"
          >
            <span>{isLullabyPlaying ? '✨🎶' : muted ? '🔇' : '💤'}</span>
            <span>{isLullabyPlaying ? 'Lullaby On' : muted ? 'Muted' : 'Lullaby'}</span>
          </button>

          {/* Wishlist Button */}
          <Link
            href="/wishlist"
            className={`action-pill-btn wishlist-nav-btn ${isWishlistActive ? 'active' : ''}`}
            title="View saved plushies"
          >
            <span>💖</span>
            <span>Saved</span>
            {wishlist.length > 0 && (
              <span className="cart-badge" style={{ background: 'var(--pink-primary)' }}>
                {wishlist.length}
              </span>
            )}
          </Link>

          {/* Cart Drawer Trigger */}
          <button
            className="action-pill-btn cart-btn"
            id="header-cart-btn"
            onClick={() => {
              playPop();
              setIsCartOpen(true);
            }}
            type="button"
          >
            <span>🛒</span>
            <span>Basket</span>
            <span className="cart-badge" id="cart-badge">
              {totalCount}
            </span>
          </button>

          {/* Mobile Menu Toggle */}
          <button
            className="mobile-menu-btn"
            id="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            type="button"
          >
            ☰
          </button>
        </div>
      </div>
    </header>
  );
};
