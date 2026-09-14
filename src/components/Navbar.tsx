'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useSound } from '@/context/SoundContext';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';

export const Navbar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoggedIn, logout, isAdmin } = useAuth();
  const { totalCount, setIsCartOpen, wishlist, showToast } = useCart();
  const { muted, toggleSound, playPop, playChime, playSquish } = useSound();
  const { isNightMode, toggleNightMode, isLullabyPlaying, toggleLullaby } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  const isUserAdmin = isAdmin || user?.role === 'admin';

  // Close mobile menu and dropdown on pathname change
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  }, [pathname]);

  // Close dropdown on outside click or Escape key
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setUserDropdownOpen(false);
      }
    };

    if (userDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [userDropdownOpen]);

  // Close mobile menu on resize > 1024px or Escape key
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1024) {
        setMobileMenuOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const isShopActive = pathname === '/shop' || pathname.startsWith('/product');
  const isStudioActive = pathname === '/customizer';
  const isGameActive = pathname === '/game';
  const isOrdersActive = pathname === '/orders';
  const isDashboardActive = pathname === '/dashboard';
  const isWishlistActive = pathname === '/wishlist';
  const isAuthActive = pathname === '/login';

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

  const handleShopClick = () => {
    setMobileMenuOpen(false);
    playPop();
  };

  return (
    <>
      <header className="navbar">
        <div className="container nav-container">
          {/* Brand Logo */}
          <Link href="/" className="brand-logo" id="nav-brand-logo">
            <span className="logo-icon-wrap">🧸</span>
            <span className="brand-name">CloudPuff</span>
          </Link>

          {/* Navigation Links / Mobile Drawer */}
          <ul
            className={`nav-links ${mobileMenuOpen ? 'mobile-open' : ''}`}
            id="nav-links"
            role="navigation"
          >
            {/* Mobile Header Inside Drawer (only rendered when mobile drawer is open) */}
            {mobileMenuOpen && (
              <li className="mobile-drawer-header">
                <span className="drawer-title">🌸 Cloud Sanctuary Menu</span>
                <button
                  className="drawer-close-btn"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Close menu"
                  type="button"
                >
                  ✕
                </button>
              </li>
            )}

            <li>
              <Link
                href="/shop"
                className={`nav-link ${isShopActive ? 'active' : ''}`}
                onClick={handleShopClick}
              >
                <span>Shop</span>
                <span className="link-icon">🍓</span>
              </Link>
            </li>
            <li>
              <Link
                href="/customizer"
                className={`nav-link ${isStudioActive ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span>Studio</span>
                <span className="link-icon">🎨</span>
              </Link>
            </li>
            <li>
              <Link
                href="/game"
                className={`nav-link ${isGameActive ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span>Cloud Hop</span>
                <span className="link-icon">🎮</span>
              </Link>
            </li>

            {/* Mobile Quick Utility Row Inside Drawer (only rendered when mobile drawer is open) */}
            {mobileMenuOpen && (
              <li className="mobile-drawer-quick-row">
                <button
                  className="mobile-quick-btn"
                  onClick={() => {
                    playPop();
                    toggleNightMode();
                  }}
                  type="button"
                >
                  <span>{isNightMode ? '☀️ Sunny Day' : '🌙 Night Snuggle'}</span>
                </button>

                <button
                  className="mobile-quick-btn"
                  onClick={handleLullabyToggle}
                  type="button"
                >
                  <span>{isLullabyPlaying ? '🎶 Lullaby On' : '💤 Lullaby'}</span>
                </button>

                {isLoggedIn && user ? (
                  <>
                    <Link
                    href="/dashboard?tab=overview"
                    className="mobile-quick-btn full-width"
                    onClick={() => {
                      playPop();
                      setMobileMenuOpen(false);
                    }}
                  >
                    <span>{isUserAdmin ? '🛡️ Sanctuary Admin Command' : `🧸 Parent Cuddle Hub (${user.name.split(' ')[0]})`}</span>
                  </Link>
                  <Link
                    href="/dashboard?tab=orders"
                    className="mobile-quick-btn full-width"
                    onClick={() => {
                      playPop();
                      setMobileMenuOpen(false);
                    }}
                  >
                    <span>{isUserAdmin ? '📦 All Orders & Fulfillment' : '📖 My Orders & Adoptions'}</span>
                  </Link>
                  </>
                ) : (
                  <Link
                    href="/login"
                    className="mobile-quick-btn full-width"
                    onClick={() => {
                      playPop();
                      setMobileMenuOpen(false);
                    }}
                  >
                    <span>👤 Sign In / Register</span>
                  </Link>
                )}
              </li>
            )}
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
              <span className="nav-btn-icon">{isNightMode ? '☀️' : '🌙'}</span>
              <span className="nav-btn-text">{isNightMode ? 'Day' : 'Night'}</span>
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
              <span className="nav-btn-icon">{isLullabyPlaying ? '✨🎶' : muted ? '🔇' : '💤'}</span>
              <span className="nav-btn-text">{isLullabyPlaying ? 'Lullaby On' : muted ? 'Muted' : 'Lullaby'}</span>
            </button>

            {/* Wishlist Button */}
            <Link
              href="/wishlist"
              className={`action-pill-btn wishlist-nav-btn ${isWishlistActive ? 'active' : ''}`}
              title="View your Wishlist"
              onClick={playPop}
            >
              <span className="nav-btn-icon">💖</span>
              <span className="nav-btn-text">Wishlist</span>
              {wishlist.length > 0 && (
                <span className="cart-badge" style={{ background: 'var(--pink-primary)' }}>
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* User Profile / Header Dropdown Menu for Dashboard & Sanctuary Components */}
            {!isLoggedIn || !user ? (
              <Link
                href="/login"
                className={`action-pill-btn user-nav-btn ${isAuthActive ? 'active' : ''}`}
                title="Sign In / Register"
                onClick={playPop}
              >
                <span className="nav-btn-icon">👤</span>
                <span className="nav-btn-text">Sign In</span>
              </Link>
            ) : (
              <div className="user-dropdown-wrapper" ref={userDropdownRef}>
                <button
                  type="button"
                  className={`action-pill-btn user-nav-btn user-dropdown-trigger ${userDropdownOpen ? 'open' : ''} ${isDashboardActive || isOrdersActive ? 'active' : ''}`}
                  onClick={() => {
                    playPop();
                    setUserDropdownOpen(!userDropdownOpen);
                  }}
                  aria-expanded={userDropdownOpen}
                  aria-haspopup="true"
                  title={`Sanctuary Menu: ${user.name}`}
                >
                  <span className="nav-btn-icon">{user.avatar || '🧸'}</span>
                  <span className="nav-btn-text">{user.name.split(' ')[0]}</span>
                  <span className={`dropdown-chevron ${userDropdownOpen ? 'rotated' : ''}`}>▾</span>
                </button>

                {userDropdownOpen && (
                  <div className="user-nav-dropdown-menu" role="menu">
                    {/* User Mini Profile Header */}
                    <div className="dropdown-user-header">
                      <div className="dropdown-avatar-wrap">
                        <span className="dropdown-avatar">{user.avatar || (isUserAdmin ? '🛡️' : '🧸')}</span>
                        <span className="dropdown-online-dot"></span>
                      </div>
                      <div className="dropdown-user-details">
                        <span className={`dropdown-tier-badge ${isUserAdmin ? 'admin-badge' : ''}`}>
                          {isUserAdmin ? '🛡️ Sanctuary Administrator' : '✨ Verified Cloud Parent'}
                        </span>
                        <h4 className="dropdown-user-name">{user.name}</h4>
                        <p className="dropdown-user-email">{user.email}</p>
                      </div>
                    </div>

                    {/* Meta Chips */}
                    <div className="dropdown-meta-chips">
                      {isUserAdmin ? (
                        <>
                          <span>⚡ Full Ops Access</span>
                          <span>📦 Store Command</span>
                        </>
                      ) : (
                        <>
                          <span>🦖 {user.favoriteBuddy || 'Matcha Dino'}</span>
                          <span>✨ 850 Fluff Pts</span>
                        </>
                      )}
                    </div>

                    <div className="dropdown-menu-divider" />

                    {/* Dashboard & Role-Specific Components */}
                    <div className="dropdown-section-title">
                      {isUserAdmin ? 'Sanctuary Shop Command' : 'Parent Cuddle Hub'}
                    </div>
                    <div className="dropdown-nav-items">
                      {isUserAdmin ? (
                        <>
                          <Link
                            href="/dashboard?tab=overview"
                            className={`dropdown-nav-link ${isDashboardActive ? 'active' : ''}`}
                            role="menuitem"
                            onClick={() => {
                              playPop();
                              setUserDropdownOpen(false);
                            }}
                          >
                            <span className="dropdown-link-icon">⚙️</span>
                            <div className="dropdown-link-text">
                              <strong>Store Operations & KPIs</strong>
                              <small>Revenue, stock levels & live dispatch</small>
                            </div>
                            <span className="dropdown-arrow-icon">→</span>
                          </Link>

                          <Link
                            href="/dashboard?tab=orders"
                            className="dropdown-nav-link"
                            role="menuitem"
                            onClick={() => {
                              playPop();
                              setUserDropdownOpen(false);
                            }}
                          >
                            <span className="dropdown-link-icon">📦</span>
                            <div className="dropdown-link-text">
                              <strong>Sanctuary Orders & Fulfillment</strong>
                              <small>Track & manage all store shipments</small>
                            </div>
                            <span className="dropdown-arrow-icon">→</span>
                          </Link>

                          <Link
                            href="/customizer"
                            className={`dropdown-nav-link ${isStudioActive ? 'active' : ''}`}
                            role="menuitem"
                            onClick={() => {
                              playPop();
                              setUserDropdownOpen(false);
                            }}
                          >
                            <span className="dropdown-link-icon">🎨</span>
                            <div className="dropdown-link-text">
                              <strong>Build-A-Cloud Studio</strong>
                              <small>Customizer & wardrobe assets</small>
                            </div>
                            <span className="dropdown-arrow-icon">→</span>
                          </Link>

                          <Link
                            href="/game"
                            className={`dropdown-nav-link ${isGameActive ? 'active' : ''}`}
                            role="menuitem"
                            onClick={() => {
                              playPop();
                              setUserDropdownOpen(false);
                            }}
                          >
                            <span className="dropdown-link-icon">🎮</span>
                            <div className="dropdown-link-text">
                              <strong>Cloud Hop Arcade</strong>
                              <small>Mini-game balance & tester</small>
                            </div>
                            <span className="dropdown-arrow-icon">→</span>
                          </Link>
                        </>
                      ) : (
                        <>
                          <Link
                            href="/dashboard?tab=overview"
                            className={`dropdown-nav-link ${isDashboardActive ? 'active' : ''}`}
                            role="menuitem"
                            onClick={() => {
                              playPop();
                              setUserDropdownOpen(false);
                            }}
                          >
                            <span className="dropdown-link-icon">📊</span>
                            <div className="dropdown-link-text">
                              <strong>Sanctuary Dashboard</strong>
                              <small>Adoptions, cuddle stats & pats</small>
                            </div>
                            <span className="dropdown-arrow-icon">→</span>
                          </Link>

                          <Link
                            href="/dashboard?tab=orders"
                            className="dropdown-nav-link"
                            role="menuitem"
                            onClick={() => {
                              playPop();
                              setUserDropdownOpen(false);
                            }}
                          >
                            <span className="dropdown-link-icon">📖</span>
                            <div className="dropdown-link-text">
                              <strong>Adoptions & Orders</strong>
                              <small>Live 3D tracking & birth certificates</small>
                            </div>
                            <span className="dropdown-arrow-icon">→</span>
                          </Link>

                          <Link
                            href="/wishlist"
                            className={`dropdown-nav-link ${isWishlistActive ? 'active' : ''}`}
                            role="menuitem"
                            onClick={() => {
                              playPop();
                              setUserDropdownOpen(false);
                            }}
                          >
                            <span className="dropdown-link-icon">💖</span>
                            <div className="dropdown-link-text">
                              <strong>Saved Wishlist</strong>
                              <small>{wishlist.length} cuddle friends saved</small>
                            </div>
                            <span className="dropdown-arrow-icon">→</span>
                          </Link>

                          <Link
                            href="/customizer"
                            className={`dropdown-nav-link ${isStudioActive ? 'active' : ''}`}
                            role="menuitem"
                            onClick={() => {
                              playPop();
                              setUserDropdownOpen(false);
                            }}
                          >
                            <span className="dropdown-link-icon">🎨</span>
                            <div className="dropdown-link-text">
                              <strong>Build-A-Cloud Studio</strong>
                              <small>Plushie customizer & wardrobe</small>
                            </div>
                            <span className="dropdown-arrow-icon">→</span>
                          </Link>

                          <Link
                            href="/game"
                            className={`dropdown-nav-link ${isGameActive ? 'active' : ''}`}
                            role="menuitem"
                            onClick={() => {
                              playPop();
                              setUserDropdownOpen(false);
                            }}
                          >
                            <span className="dropdown-link-icon">🎮</span>
                            <div className="dropdown-link-text">
                              <strong>Cloud Hop Arcade</strong>
                              <small>Play mini game & earn fluff</small>
                            </div>
                            <span className="dropdown-arrow-icon">→</span>
                          </Link>
                        </>
                      )}
                    </div>

                    <div className="dropdown-menu-divider" />

                    {/* Sign Out Action */}
                    <button
                      type="button"
                      className="dropdown-signout-action"
                      role="menuitem"
                      onClick={() => {
                        playSquish();
                        logout();
                        setUserDropdownOpen(false);
                        showToast('👋 Signed out safely. Have sweet snuggles!');
                        router.push('/');
                      }}
                    >
                      <span className="signout-action-icon">🚪</span>
                      <span>Sign Out of Haven</span>
                    </button>
                  </div>
                )}
              </div>
            )}

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
              <span className="nav-btn-icon">🛒</span>
              <span className="nav-btn-text">Basket</span>
              <span className="cart-badge" id="cart-badge">
                {totalCount}
              </span>
            </button>

            {/* Mobile Menu Toggle */}
            <button
              className={`mobile-menu-btn ${mobileMenuOpen ? 'open' : ''}`}
              id="mobile-menu-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
              type="button"
            >
              {mobileMenuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>
      </header>

      {/* Backdrop overlay for mobile menu */}
      {mobileMenuOpen && (
        <div
          className="nav-mobile-backdrop"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
};
