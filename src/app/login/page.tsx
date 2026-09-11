'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import { useSound } from '@/context/SoundContext';
import { useCart } from '@/context/CartContext';
import { confettiEngine } from '@/utils/confetti';

const PLUSHIE_BUDDIES = [
  { id: 'matcha-dino', name: 'Matcha Dino 🦖' },
  { id: 'strawberry-axolotl', name: 'Strawberry Axolotl 🍓' },
  { id: 'pip-peaches', name: 'Pip & Peaches 🐻' },
  { id: 'marshmallow-seal', name: 'Marshmallow Seal 🦭' },
  { id: 'taro-boba-cat', name: 'Taro Boba Cat 🧋' },
];

export default function LoginPage() {
  const router = useRouter();
  const { user, isLoggedIn, login, register, logout, loginAsDemo } = useAuth();
  const { playPop, playChime, playSquish } = useSound();
  const { showToast } = useCart();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [mascotState, setMascotState] = useState<'idle' | 'watching' | 'peek' | 'celebrate'>('idle');

  // Sign In Form States
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Sign Up Form States
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [selectedBuddy, setSelectedBuddy] = useState('matcha-dino');
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: 'Enter a password', color: '#94A3B8' };
    if (pass.length < 5) return { score: 1, label: 'Too Squishy ☁️', color: '#F87171' };
    if (pass.length < 8) return { score: 2, label: 'Getting Fluffy 🍓', color: '#FBBF24' };
    return { score: 3, label: '100% Cloud Strong 💪✨', color: '#34D399' };
  };

  const strength = getPasswordStrength(regPassword);

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim() || !loginPassword.trim()) {
      playSquish();
      showToast('⚠️ Please enter your email and password.');
      return;
    }

    login(loginEmail, loginPassword);
    playChime();
    setMascotState('celebrate');
    showToast(`🌸 Welcome back to CloudPuff Sanctuary!`);
    setTimeout(() => {
      router.push('/');
    }, 900);
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim()) {
      playSquish();
      showToast('⚠️ Please enter your Parent Full Name.');
      return;
    }
    if (!regEmail.trim()) {
      playSquish();
      showToast('⚠️ Please enter a valid email address.');
      return;
    }
    if (regPassword.length < 4) {
      playSquish();
      showToast('⚠️ Please choose a slightly fluffier password (at least 4 characters).');
      return;
    }
    if (!agreeTerms) {
      playSquish();
      showToast('💖 Please check the snuggle vow promise to proceed!');
      return;
    }

    const buddy = PLUSHIE_BUDDIES.find((b) => b.id === selectedBuddy)?.name || 'Matcha Dino';
    register(regName, regEmail, regPassword, buddy);
    playChime();
    confettiEngine.burst();
    setMascotState('celebrate');
    showToast(`🎉 CloudPuff certificate issued! Welcome to the family, ${regName}!`);
    setTimeout(() => {
      router.push('/');
    }, 1200);
  };

  const handleQuickDemoLogin = () => {
    playChime();
    loginAsDemo();
    setMascotState('celebrate');
    showToast('✨ Signed in as Arsalan Abbas (Verified Cloud Parent)!');
    setTimeout(() => {
      router.push('/');
    }, 800);
  };

  const handleSocialLogin = (provider: string) => {
    playPop();
    login(`cuddle.${provider.toLowerCase()}@cloudpuff.haven`, 'social-pass');
    playChime();
    setMascotState('celebrate');
    showToast(`✨ Connected with ${provider}! Welcome to the sanctuary.`);
    setTimeout(() => {
      router.push('/');
    }, 800);
  };

  return (
    <div className="page-wrapper">
      <Navbar />

      <main className="auth-page-container container">
        {/* If user is already logged in, show their Member Dashboard Card */}
        {isLoggedIn && user ? (
          <div className="auth-card logged-in-card">
            <div className="auth-badge-pill">✨ Verified Cloud Member</div>
            <div className="profile-avatar-bubble">{user.avatar}</div>
            <h1 className="auth-title">Welcome Back, {user.name}! 💖</h1>
            <p className="auth-subtitle">
              You are signed in as <strong>{user.email}</strong>.
            </p>

            <div className="profile-meta-grid">
              <div className="profile-meta-item">
                <span>Member Since</span>
                <strong>{user.memberSince}</strong>
              </div>
              <div className="profile-meta-item">
                <span>Soulmate Buddy</span>
                <strong>{user.favoriteBuddy || 'Matcha Dino'}</strong>
              </div>
              <div className="profile-meta-item">
                <span>Sanctuary Status</span>
                <strong style={{ color: '#10B981' }}>Active Snuggler ☁️</strong>
              </div>
            </div>

            <div className="auth-dashboard-actions">
              <Link href="/orders" className="btn-primary">
                View Adoption Album 📖
              </Link>
              <Link href="/wishlist" className="btn-secondary">
                My Wishlist 💖
              </Link>
              <Link href="/#shop-section" className="btn-secondary">
                Adopt Friends 🍓
              </Link>
              <button
                className="btn-outline-logout"
                onClick={() => {
                  playPop();
                  logout();
                  showToast('👋 Signed out safely. Have sweet snuggles!');
                }}
                type="button"
              >
                Sign Out 🚪
              </button>
            </div>
          </div>
        ) : (
          /* Authentication Card */
          <div className="auth-card">
            {/* Interactive Peek-A-Boo Mascot Header */}
            <div className={`auth-mascot-stage mascot-${mascotState}`}>
              <div className="mascot-face-circle">
                <span className="mascot-ears left"></span>
                <span className="mascot-ears right"></span>
                <div className="mascot-core">
                  {mascotState === 'peek' ? (
                    <span className="mascot-emoji">🙈</span>
                  ) : mascotState === 'watching' ? (
                    <span className="mascot-emoji">👀</span>
                  ) : mascotState === 'celebrate' ? (
                    <span className="mascot-emoji">🥳</span>
                  ) : (
                    <span className="mascot-emoji">🧸</span>
                  )}
                </div>
                {mascotState === 'peek' && (
                  <div className="mascot-paws-overlay">
                    <span className="paw left-paw">🐾</span>
                    <span className="paw right-paw">🐾</span>
                  </div>
                )}
              </div>
              <p className="mascot-speech-bubble">
                {mascotState === 'peek'
                  ? 'I won’t peek at your secret password! 🙈'
                  : mascotState === 'watching'
                  ? 'Ooh, typing your cloud details! ☁️✨'
                  : mascotState === 'celebrate'
                  ? 'Yay! More hugs on the way! 🎉'
                  : 'Welcome to our cozy cloud haven! 🌸'}
              </p>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="auth-tabs-row">
              <button
                className={`auth-tab-btn ${mode === 'signin' ? 'active' : ''}`}
                onClick={() => {
                  playPop();
                  setMode('signin');
                  setMascotState('idle');
                }}
                type="button"
              >
                Sign In 🧸
              </button>
              <button
                className={`auth-tab-btn ${mode === 'signup' ? 'active' : ''}`}
                onClick={() => {
                  playPop();
                  setMode('signup');
                  setMascotState('idle');
                }}
                type="button"
              >
                Create Account ✨
              </button>
            </div>

            {/* ========================================================= */}
            {/* SIGN IN FORM */}
            {/* ========================================================= */}
            {mode === 'signin' && (
              <form className="auth-form" onSubmit={handleSignIn}>
                <div className="form-group">
                  <label htmlFor="login-email" className="form-label">
                    Email Address ✉️
                  </label>
                  <input
                    type="email"
                    id="login-email"
                    className="auth-input"
                    placeholder="e.g. arsalan@cloudpuff.haven"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    onFocus={() => setMascotState('watching')}
                    onBlur={() => setMascotState('idle')}
                    required
                  />
                </div>

                <div className="form-group">
                  <div className="label-row">
                    <label htmlFor="login-password" className="form-label">
                      Password 🔑
                    </label>
                    <button
                      type="button"
                      className="forgot-pass-btn"
                      onClick={() => {
                        playPop();
                        showToast('💌 Password reset owl dispatched! Check your cloud mailbox.');
                      }}
                    >
                      Forgot?
                    </button>
                  </div>
                  <div className="password-input-wrap">
                    <input
                      type={showLoginPassword ? 'text' : 'password'}
                      id="login-password"
                      className="auth-input"
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      onFocus={() => setMascotState('peek')}
                      onBlur={() => setMascotState('idle')}
                      required
                    />
                    <button
                      type="button"
                      className="btn-toggle-eye"
                      onClick={() => {
                        playPop();
                        setShowLoginPassword(!showLoginPassword);
                      }}
                      title={showLoginPassword ? 'Hide password' : 'Show password'}
                    >
                      {showLoginPassword ? '👁️' : '🙈'}
                    </button>
                  </div>
                </div>

                <div className="auth-checkbox-row">
                  <label className="snuggle-checkbox-label">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <span>Remember my snuggle session on this device</span>
                  </label>
                </div>

                <button type="submit" className="btn-primary auth-submit-btn">
                  Sign In with Snuggles 🌸 →
                </button>

                {/* Instant 1-Click Demo Login */}
                <div className="auth-demo-shortcut">
                  <button
                    type="button"
                    className="btn-demo-quick"
                    onClick={handleQuickDemoLogin}
                  >
                    ⚡ Instant 1-Click Demo Sign In (Arsalan Abbas)
                  </button>
                </div>

                {/* Social Login Separator */}
                <div className="auth-divider">
                  <span>or connect with</span>
                </div>

                <div className="social-auth-grid">
                  <button
                    type="button"
                    className="social-btn google-btn"
                    onClick={() => handleSocialLogin('Google')}
                  >
                    <span>🌐</span>
                    <span>Google</span>
                  </button>
                  <button
                    type="button"
                    className="social-btn apple-btn"
                    onClick={() => handleSocialLogin('Apple')}
                  >
                    <span>🍏</span>
                    <span>Apple</span>
                  </button>
                </div>
              </form>
            )}

            {/* ========================================================= */}
            {/* CREATE AN ACCOUNT FORM */}
            {/* ========================================================= */}
            {mode === 'signup' && (
              <form className="auth-form" onSubmit={handleSignUp}>
                <div className="form-group">
                  <label htmlFor="reg-name" className="form-label">
                    Certified Parent Full Name 🏷️
                  </label>
                  <input
                    type="text"
                    id="reg-name"
                    className="auth-input"
                    placeholder="e.g. Arsalan Abbas"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    onFocus={() => setMascotState('watching')}
                    onBlur={() => setMascotState('idle')}
                    required
                  />
                  <span className="field-hint">This name will appear on official adoption certificates.</span>
                </div>

                <div className="form-group">
                  <label htmlFor="reg-email" className="form-label">
                    Email Address ✉️
                  </label>
                  <input
                    type="email"
                    id="reg-email"
                    className="auth-input"
                    placeholder="e.g. yourname@gmail.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    onFocus={() => setMascotState('watching')}
                    onBlur={() => setMascotState('idle')}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="reg-password" className="form-label">
                    Choose a Fluffy Password 🔑
                  </label>
                  <div className="password-input-wrap">
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      id="reg-password"
                      className="auth-input"
                      placeholder="At least 4 sweet characters..."
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      onFocus={() => setMascotState('peek')}
                      onBlur={() => setMascotState('idle')}
                      required
                    />
                    <button
                      type="button"
                      className="btn-toggle-eye"
                      onClick={() => {
                        playPop();
                        setShowRegPassword(!showRegPassword);
                      }}
                      title={showRegPassword ? 'Hide password' : 'Show password'}
                    >
                      {showRegPassword ? '👁️' : '🙈'}
                    </button>
                  </div>

                  {/* Fluff Strength Meter */}
                  {regPassword.length > 0 && (
                    <div className="fluff-meter-wrap">
                      <div className="fluff-meter-track">
                        <div
                          className="fluff-meter-fill"
                          style={{
                            width: `${(strength.score / 3) * 100}%`,
                            backgroundColor: strength.color,
                          }}
                        ></div>
                      </div>
                      <span className="fluff-meter-label" style={{ color: strength.color }}>
                        {strength.label}
                      </span>
                    </div>
                  )}
                </div>

                {/* Favorite Cuddle Buddy Selector */}
                <div className="form-group">
                  <label className="form-label">Favorite Cuddle Buddy 🧸</label>
                  <div className="buddy-chip-grid">
                    {PLUSHIE_BUDDIES.map((b) => (
                      <button
                        key={b.id}
                        type="button"
                        className={`buddy-chip ${selectedBuddy === b.id ? 'selected' : ''}`}
                        onClick={() => {
                          playPop();
                          setSelectedBuddy(b.id);
                        }}
                      >
                        {b.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Snuggle Pledge Agreement */}
                <div className="auth-checkbox-row">
                  <label className="snuggle-checkbox-label">
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                    />
                    <span>
                      I promise to provide unconditional love, warm bedtime cuddles, and sweet hugs forever. 💖
                    </span>
                  </label>
                </div>

                <button type="submit" className="btn-primary auth-submit-btn">
                  Create My Sanctuary Account ✨ →
                </button>

                {/* Social Login */}
                <div className="auth-divider">
                  <span>or register instantly with</span>
                </div>

                <div className="social-auth-grid">
                  <button
                    type="button"
                    className="social-btn google-btn"
                    onClick={() => handleSocialLogin('Google')}
                  >
                    <span>🌐</span>
                    <span>Google</span>
                  </button>
                  <button
                    type="button"
                    className="social-btn apple-btn"
                    onClick={() => handleSocialLogin('Apple')}
                  >
                    <span>🍏</span>
                    <span>Apple</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
