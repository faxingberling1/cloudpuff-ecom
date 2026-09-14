'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useSound } from '@/context/SoundContext';
import { useTheme } from '@/context/ThemeContext';

export const Sidebar: React.FC = () => {
  const router = useRouter();
  const {
    user,
    isLoggedIn,
    logout,
    loginAsUserDemo,
    loginAsAdminDemo,
    isAdmin,
    isSidebarOpen,
    setIsSidebarOpen,
  } = useAuth();
  const { wishlist, showToast } = useCart();
  const { playPop, playChime, playSquish } = useSound();
  const { isNightMode, toggleNightMode, isLullabyPlaying, toggleLullaby } = useTheme();

  const isUserAdmin = isAdmin || user?.role === 'admin';

  // Sign out confirmation state
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [headPatsCount, setHeadPatsCount] = useState(14);

  // Sync head pats count from localStorage
  useEffect(() => {
    try {
      const savedPats = localStorage.getItem('cloudpuff_user_pats');
      if (savedPats) {
        setHeadPatsCount(parseInt(savedPats, 10));
      }
    } catch {
      // Ignore
    }
  }, [isSidebarOpen]);

  // Handle body scroll lock & Escape key
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          handleClose();
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = '';
      setShowSignOutConfirm(false);
    }
  }, [isSidebarOpen]);

  const handleClose = () => {
    setShowSignOutConfirm(false);
    setIsSidebarOpen(false);
  };

  const handleLinkClick = () => {
    playPop();
    handleClose();
  };

  const handleConfirmSignOut = () => {
    playSquish();
    logout();
    setShowSignOutConfirm(false);
    handleClose();
    showToast('👋 Signed out safely. Have sweet snuggles!');
    router.push('/');
  };

  const handleQuickUserDemoSignIn = () => {
    playChime();
    loginAsUserDemo();
    showToast('✨ Signed in as Arsalan Abbas (Verified Cloud Parent)!');
    handleClose();
  };

  const handleQuickAdminDemoSignIn = () => {
    playChime();
    loginAsAdminDemo();
    showToast('🛡️ Signed in as Cloud Haven Warden (Shop Administrator)!');
    handleClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`sidebar-backdrop ${isSidebarOpen ? 'open' : ''}`}
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Slide-in Drawer */}
      <aside
        className={`sidebar-drawer ${isSidebarOpen ? 'open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Sanctuary Account Sidebar"
      >
        {/* Drawer Header */}
        <div className="sidebar-header">
          <div className="sidebar-brand-title">
            <span className="sidebar-header-icon">🧸</span>
            <span className="sidebar-header-text">Sanctuary Account</span>
          </div>
          <button
            className="sidebar-close-btn"
            onClick={handleClose}
            aria-label="Close sidebar"
            type="button"
          >
            ✕
          </button>
        </div>

        <div className="sidebar-scroll-body">
          {/* USER LOGGED IN VIEW */}
          {isLoggedIn && user ? (
            <>
              {/* Profile Card */}
              <div className="sidebar-profile-card">
                <div className="sidebar-avatar-wrap">
                  <span className="sidebar-avatar">{user.avatar || (isUserAdmin ? '🛡️' : '🧸')}</span>
                  <span className="sidebar-status-dot" title="Active Snuggler"></span>
                </div>

                <div className="sidebar-profile-details">
                  <div className={`sidebar-tier-badge ${isUserAdmin ? 'admin-badge' : ''}`}>
                    {isUserAdmin ? '🛡️ Sanctuary Administrator' : '✨ Verified Cloud Parent'}
                  </div>
                  <h3 className="sidebar-user-name">{user.name}</h3>
                  <p className="sidebar-user-email">{user.email}</p>
                </div>

                <div className="sidebar-profile-meta-chips">
                  <span className="sidebar-meta-chip">
                    {isUserAdmin ? '⚡ Store Operations' : `🗓️ Since ${user.memberSince}`}
                  </span>
                  <span className="sidebar-meta-chip">
                    {isUserAdmin ? '🏬 Full Haven Access' : `🦖 Soulmate: ${user.favoriteBuddy || 'Matcha Dino'}`}
                  </span>
                </div>
              </div>

              {/* Quick Stats Bar */}
              <div className="sidebar-stats-row">
                {isUserAdmin ? (
                  <>
                    <div className="sidebar-stat-box">
                      <span className="stat-num">12</span>
                      <span className="stat-name">Orders</span>
                    </div>
                    <div className="sidebar-stat-box">
                      <span className="stat-num">8</span>
                      <span className="stat-name">Catalog</span>
                    </div>
                    <div className="sidebar-stat-box">
                      <span className="stat-num">1,420</span>
                      <span className="stat-name">In Stock</span>
                    </div>
                    <div className="sidebar-stat-box">
                      <span className="stat-num">$34.8k</span>
                      <span className="stat-name">Revenue</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="sidebar-stat-box">
                      <span className="stat-num">2</span>
                      <span className="stat-name">Adoptions</span>
                    </div>
                    <div className="sidebar-stat-box">
                      <span className="stat-num">{wishlist.length}</span>
                      <span className="stat-name">Wishlist</span>
                    </div>
                    <div className="sidebar-stat-box">
                      <span className="stat-num">850</span>
                      <span className="stat-name">Fluff Pts</span>
                    </div>
                    <div className="sidebar-stat-box">
                      <span className="stat-num">{headPatsCount}</span>
                      <span className="stat-name">Pats Given</span>
                    </div>
                  </>
                )}
              </div>

              {/* Navigation Menu Links */}
              <div className="sidebar-section-title">
                {isUserAdmin ? 'Administrator Command' : 'Navigation Hub'}
              </div>
              <ul className="sidebar-nav-list">
                {isUserAdmin ? (
                  <>
                    <li>
                      <Link href="/dashboard" className="sidebar-nav-item" onClick={handleLinkClick}>
                        <span className="sidebar-item-icon">⚙️</span>
                        <span className="sidebar-item-label">Store Operations & KPIs</span>
                        <span className="sidebar-item-badge admin">Admin</span>
                      </Link>
                    </li>
                    <li>
                      <Link href="/dashboard?tab=orders" className="sidebar-nav-item" onClick={handleLinkClick}>
                        <span className="sidebar-item-icon">📦</span>
                        <span className="sidebar-item-label">All Orders & Fulfillment</span>
                      </Link>
                    </li>
                    <li>
                      <Link href="/wishlist" className="sidebar-nav-item" onClick={handleLinkClick}>
                        <span className="sidebar-item-icon">💖</span>
                        <span className="sidebar-item-label">Saved Wishlist</span>
                      </Link>
                    </li>
                    <li>
                      <Link href="/customizer" className="sidebar-nav-item" onClick={handleLinkClick}>
                        <span className="sidebar-item-icon">🎨</span>
                        <span className="sidebar-item-label">Plushie Studio Customizer</span>
                      </Link>
                    </li>
                    <li>
                      <Link href="/game" className="sidebar-nav-item" onClick={handleLinkClick}>
                        <span className="sidebar-item-icon">🎮</span>
                        <span className="sidebar-item-label">Cloud Hop Mini Arcade</span>
                      </Link>
                    </li>
                    <li>
                      <Link href="/#shop-section" className="sidebar-nav-item" onClick={handleLinkClick}>
                        <span className="sidebar-item-icon">🍓</span>
                        <span className="sidebar-item-label">Sanctuary Plushie Catalog</span>
                      </Link>
                    </li>
                  </>
                ) : (
                  <>
                    <li>
                      <Link href="/dashboard" className="sidebar-nav-item" onClick={handleLinkClick}>
                        <span className="sidebar-item-icon">📊</span>
                        <span className="sidebar-item-label">Sanctuary Dashboard</span>
                        <span className="sidebar-item-badge">Hub</span>
                      </Link>
                    </li>
                    <li>
                      <Link href="/dashboard?tab=orders" className="sidebar-nav-item" onClick={handleLinkClick}>
                        <span className="sidebar-item-icon">📖</span>
                        <span className="sidebar-item-label">Adoption Registry & Tracking</span>
                      </Link>
                    </li>
                    <li>
                      <Link href="/wishlist" className="sidebar-nav-item" onClick={handleLinkClick}>
                        <span className="sidebar-item-icon">💖</span>
                        <span className="sidebar-item-label">Saved Wishlist</span>
                        {wishlist.length > 0 && (
                          <span className="sidebar-item-count">{wishlist.length}</span>
                        )}
                      </Link>
                    </li>
                    <li>
                      <Link href="/customizer" className="sidebar-nav-item" onClick={handleLinkClick}>
                        <span className="sidebar-item-icon">🎨</span>
                        <span className="sidebar-item-label">Plushie Studio Customizer</span>
                      </Link>
                    </li>
                    <li>
                      <Link href="/game" className="sidebar-nav-item" onClick={handleLinkClick}>
                        <span className="sidebar-item-icon">🎮</span>
                        <span className="sidebar-item-label">Cloud Hop Mini Arcade</span>
                      </Link>
                    </li>
                    <li>
                      <Link href="/#shop-section" className="sidebar-nav-item" onClick={handleLinkClick}>
                        <span className="sidebar-item-icon">🍓</span>
                        <span className="sidebar-item-label">Adopt Cuddle Buddies</span>
                      </Link>
                    </li>
                  </>
                )}
              </ul>

              {/* Quick Theme & Sound Preferences */}
              <div className="sidebar-section-title">Sanctuary Atmosphere</div>
              <div className="sidebar-quick-controls">
                <button
                  className="sidebar-control-btn"
                  onClick={() => {
                    playPop();
                    toggleNightMode();
                  }}
                  type="button"
                >
                  <span>{isNightMode ? '☀️ Sunny Day Mode' : '🌙 Nighttime Snuggle'}</span>
                  <span className="control-toggle-pill">{isNightMode ? 'Night' : 'Day'}</span>
                </button>

                <button
                  className="sidebar-control-btn"
                  onClick={() => {
                    if (isLullabyPlaying) {
                      playPop();
                    } else {
                      playChime();
                    }
                    toggleLullaby();
                  }}
                  type="button"
                >
                  <span>{isLullabyPlaying ? '🎶 Ambient Lullaby' : '💤 Gentle Lullaby'}</span>
                  <span className={`control-toggle-pill ${isLullabyPlaying ? 'active' : ''}`}>
                    {isLullabyPlaying ? 'Playing' : 'Off'}
                  </span>
                </button>
              </div>

              {/* SIGN OUT SECTION & CONFIRMATION FLOW */}
              <div className="sidebar-signout-wrapper">
                {!showSignOutConfirm ? (
                  <button
                    className="btn-sidebar-signout"
                    onClick={() => {
                      playPop();
                      setShowSignOutConfirm(true);
                    }}
                    type="button"
                  >
                    <span>🚪 Sign Out of Haven</span>
                  </button>
                ) : (
                  /* Interactive Sign Out Confirmation Card */
                  <div className="signout-confirmation-card">
                    <div className="signout-mascot-row">
                      <span className="signout-mascot-emoji">🥺🧸</span>
                      <div className="signout-mascot-text">
                        <h4>Leaving the Sanctuary?</h4>
                        <p>
                          Your cuddle buddies will miss you dearly, {user.name.split(' ')[0]}! You can return anytime.
                        </p>
                      </div>
                    </div>

                    <div className="signout-action-buttons">
                      <button
                        className="btn-stay-snuggled"
                        onClick={() => {
                          playPop();
                          setShowSignOutConfirm(false);
                        }}
                        type="button"
                      >
                        <span>🌸 Stay Snuggled</span>
                      </button>

                      <button
                        className="btn-confirm-signout"
                        onClick={handleConfirmSignOut}
                        type="button"
                      >
                        <span>🚪 Yes, Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* USER NOT LOGGED IN VIEW */
            <div className="sidebar-guest-view">
              <div className="guest-welcome-card">
                <div className="guest-avatar-bubble">☁️🧸</div>
                <h3 className="guest-welcome-title">Welcome to CloudPuff Haven</h3>
                <p className="guest-welcome-subtitle">
                  Sign in or create an account to adopt sweet friends, track packages in live 3D snuggle transit, and re-print birth certificates!
                </p>

                <div className="guest-action-buttons">
                  <div className="sidebar-demo-buttons-grid">
                    <button
                      className="btn-quick-demo-sidebar user-demo"
                      onClick={handleQuickUserDemoSignIn}
                      type="button"
                    >
                      🧸 Demo Parent (Arsalan)
                    </button>
                    <button
                      className="btn-quick-demo-sidebar admin-demo"
                      onClick={handleQuickAdminDemoSignIn}
                      type="button"
                    >
                      🛡️ Demo Admin (Shop Ops)
                    </button>
                  </div>

                  <Link href="/login" className="btn-primary guest-auth-btn" onClick={handleLinkClick}>
                    Sign In / Create Account ✨ →
                  </Link>

                  <Link href="/#shop-section" className="btn-secondary guest-auth-btn" onClick={handleLinkClick}>
                    Explore Plushies 🍓
                  </Link>
                </div>
              </div>

              {/* Atmosphere Switchers for Guests */}
              <div className="sidebar-section-title" style={{ marginTop: '2rem' }}>
                Sanctuary Atmosphere
              </div>
              <div className="sidebar-quick-controls">
                <button
                  className="sidebar-control-btn"
                  onClick={() => {
                    playPop();
                    toggleNightMode();
                  }}
                  type="button"
                >
                  <span>{isNightMode ? '☀️ Sunny Day Mode' : '🌙 Nighttime Snuggle'}</span>
                  <span className="control-toggle-pill">{isNightMode ? 'Night' : 'Day'}</span>
                </button>

                <button
                  className="sidebar-control-btn"
                  onClick={() => {
                    if (isLullabyPlaying) {
                      playPop();
                    } else {
                      playChime();
                    }
                    toggleLullaby();
                  }}
                  type="button"
                >
                  <span>{isLullabyPlaying ? '🎶 Ambient Lullaby' : '💤 Gentle Lullaby'}</span>
                  <span className={`control-toggle-pill ${isLullabyPlaying ? 'active' : ''}`}>
                    {isLullabyPlaying ? 'Playing' : 'Off'}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
