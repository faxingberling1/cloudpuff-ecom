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
  const { user, isLoggedIn, login, register, logout, loginAsUserDemo, loginAsAdminDemo } = useAuth();
  const { playPop, playChime, playSquish } = useSound();
  const { showToast } = useCart();

  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [signInRole, setSignInRole] = useState<'user' | 'admin'>('user');
  const [mascotState, setMascotState] = useState<'idle' | 'watching' | 'peek' | 'celebrate'>('idle');

  // Sign In Form States
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Forgot Password Flow States
  const [forgotStep, setForgotStep] = useState<'email' | 'code' | 'reset' | 'success'>('email');
  const [forgotEmail, setForgotEmail] = useState('');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [showRecoveryCode, setShowRecoveryCode] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

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
  const newPassStrength = getPasswordStrength(newPassword);

  // Cooldown countdown effect
  React.useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Forgot Password Handlers
  const handleStartForgotPassword = () => {
    playPop();
    setMode('forgot');
    setForgotStep('email');
    setForgotEmail(loginEmail.trim() || 'arsalan@cloudpuff.haven');
    setMascotState('watching');
  };

  const handleSendRecoveryCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      playSquish();
      showToast('⚠️ Please enter your email address.');
      return;
    }
    playChime();
    setMascotState('watching');
    setForgotStep('code');
    setResendCooldown(45);
    showToast(`💌 6-digit recovery code dispatched to ${forgotEmail}!`);
  };

  const handleResendRecoveryCode = () => {
    if (resendCooldown > 0) return;
    playChime();
    setResendCooldown(45);
    showToast(`🕊️ Fresh recovery code resent to ${forgotEmail}!`);
  };

  const handleRecoveryCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (showRecoveryCode) {
      setRecoveryCode(val.replace(/\D/g, '').slice(0, 6));
      return;
    }

    if (!val) {
      setRecoveryCode('');
      return;
    }

    if (val.length < recoveryCode.length) {
      setRecoveryCode(recoveryCode.slice(0, val.length));
      return;
    }

    const digitsOnly = val.replace(/[^0-9]/g, '');
    if (digitsOnly.length > 0) {
      setRecoveryCode((recoveryCode + digitsOnly).slice(0, 6));
    }
  };

  const handleRecoveryCodeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showRecoveryCode) {
      if (e.key === 'Backspace' || e.key === 'Delete') {
        e.preventDefault();
        setRecoveryCode((prev) => prev.slice(0, -1));
      } else if (/^[0-9]$/.test(e.key)) {
        e.preventDefault();
        if (recoveryCode.length < 6) {
          setRecoveryCode((prev) => prev + e.key);
        }
      }
    }
  };

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryCode.trim() || recoveryCode.trim().length < 4) {
      playSquish();
      showToast('⚠️ Please enter the recovery code (e.g. 777202).');
      return;
    }
    playChime();
    setMascotState('peek');
    setForgotStep('reset');
    showToast('✨ Code verified! Create your new fluffy password.');
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 4) {
      playSquish();
      showToast('⚠️ Password must be at least 4 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      playSquish();
      showToast('⚠️ Passwords do not match. Please verify both fields.');
      return;
    }

    playChime();
    confettiEngine.burst();
    login(forgotEmail, newPassword);
    setMascotState('celebrate');
    setForgotStep('success');
    showToast('🎉 Password reset successfully! You are securely signed in.');
  };

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim() || !loginPassword.trim()) {
      playSquish();
      showToast('⚠️ Please enter your email and password.');
      return;
    }

    const isTargetAdmin = signInRole === 'admin' || loginEmail.toLowerCase().includes('admin');
    login(loginEmail, loginPassword, isTargetAdmin ? 'admin' : 'user');
    playChime();
    confettiEngine.burst();
    setMascotState('celebrate');
    showToast(
      isTargetAdmin
        ? '🛡️ Signed in as Sanctuary Administrator!'
        : '🌸 Welcome back to CloudPuff Sanctuary!'
    );
    setTimeout(() => {
      router.push('/dashboard');
    }, 850);
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

  const handleQuickUserDemoLogin = () => {
    playChime();
    confettiEngine.burst();
    loginAsUserDemo();
    setMascotState('celebrate');
    showToast('✨ Signed in as Arsalan Abbas (Verified Cloud Parent)!');
    setTimeout(() => {
      router.push('/dashboard');
    }, 800);
  };

  const handleQuickAdminDemoLogin = () => {
    playChime();
    confettiEngine.burst();
    loginAsAdminDemo();
    setMascotState('celebrate');
    showToast('🛡️ Signed in as Cloud Warden (Sanctuary Administrator)!');
    setTimeout(() => {
      router.push('/dashboard');
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
              <Link href="/dashboard?tab=overview" className="btn-primary">
                Open Sanctuary Dashboard 📊
              </Link>
              <Link href="/dashboard?tab=orders" className="btn-secondary">
                View Adoption Album 📖
              </Link>
              <Link href="/wishlist" className="btn-secondary">
                My Wishlist 💖
              </Link>
              <Link href="/shop" className="btn-secondary">
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
                {mode === 'forgot'
                  ? forgotStep === 'email'
                    ? 'Lost your cloud key? No worries, I will help you! 🔑'
                    : forgotStep === 'code'
                    ? 'Checking the sky mailbox for your 6-digit code! 🕊️'
                    : forgotStep === 'reset'
                    ? 'Pick a super fluffy secret password! 🙈'
                    : 'Hooray! Password restored, ready for hugs! 🥳'
                  : mascotState === 'peek'
                  ? 'I won’t peek at your secret password! 🙈'
                  : mascotState === 'watching'
                  ? 'Ooh, typing your cloud details! ☁️✨'
                  : mascotState === 'celebrate'
                  ? 'Yay! More hugs on the way! 🎉'
                  : 'Welcome to our cozy cloud haven! 🌸'}
              </p>
            </div>

            {/* Mode Switcher Tabs (Only shown when not in Forgot Password flow) */}
            {mode !== 'forgot' ? (
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
            ) : (
              <div className="forgot-header-bar">
                <button
                  type="button"
                  className="btn-back-to-signin"
                  onClick={() => {
                    playPop();
                    setMode('signin');
                    setForgotStep('email');
                    setMascotState('idle');
                  }}
                >
                  ← Back to Sign In
                </button>
                <span className="forgot-stage-badge">
                  {forgotStep === 'email' && 'Step 1 of 3: Verification'}
                  {forgotStep === 'code' && 'Step 2 of 3: Code'}
                  {forgotStep === 'reset' && 'Step 3 of 3: New Password'}
                  {forgotStep === 'success' && '✨ All Done!'}
                </span>
              </div>
            )}

            {/* ========================================================= */}
            {/* SIGN IN FORM */}
            {/* ========================================================= */}
            {mode === 'signin' && (
              <form className="auth-form" onSubmit={handleSignIn}>
                {/* Account Type Selector: Parent vs Admin */}
                <div className="login-role-selector">
                  <button
                    type="button"
                    className={`login-role-btn ${signInRole === 'user' ? 'active' : ''}`}
                    onClick={() => {
                      playPop();
                      setSignInRole('user');
                      if (loginEmail === 'admin@cloudpuff.haven') setLoginEmail('');
                    }}
                  >
                    <span className="role-btn-icon">🧸</span>
                    <span className="role-btn-text">Customer / Parent</span>
                  </button>
                  <button
                    type="button"
                    className={`login-role-btn ${signInRole === 'admin' ? 'active' : ''}`}
                    onClick={() => {
                      playPop();
                      setSignInRole('admin');
                      if (!loginEmail || loginEmail === 'arsalan@cloudpuff.haven') {
                        setLoginEmail('admin@cloudpuff.haven');
                      }
                    }}
                  >
                    <span className="role-btn-icon">🛡️</span>
                    <span className="role-btn-text">Sanctuary Admin</span>
                  </button>
                </div>

                <div className="form-group">
                  <label htmlFor="login-email" className="form-label">
                    {signInRole === 'admin' ? 'Administrator Email 🛡️' : 'Registered Email Address ✉️'}
                  </label>
                  <input
                    type="email"
                    id="login-email"
                    className="auth-input"
                    placeholder={signInRole === 'admin' ? 'admin@cloudpuff.haven' : 'e.g. arsalan@cloudpuff.haven'}
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
                      onClick={handleStartForgotPassword}
                    >
                      Forgot Password?
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
                    <span>Remember my sanctuary session on this device</span>
                  </label>
                </div>

                <button type="submit" className="btn-primary auth-submit-btn">
                  {signInRole === 'admin'
                    ? 'Enter Sanctuary Command 🛡️ →'
                    : 'Sign In with Snuggles 🌸 →'}
                </button>

                {/* Separated 1-Click Demo Logins for Both User and Admin */}
                <div className="auth-demo-shortcut">
                  <span className="demo-shortcut-heading">⚡ Instant 1-Click Demo Accounts</span>
                  <div className="auth-demo-grid">
                    <button
                      type="button"
                      className="btn-demo-card user-demo-card"
                      onClick={handleQuickUserDemoLogin}
                    >
                      <span className="demo-card-icon">🧸</span>
                      <div className="demo-card-body">
                        <strong>Demo Parent Sign In</strong>
                        <small>Customer Cuddle Hub (Arsalan)</small>
                      </div>
                      <span className="demo-card-pill user">Parent</span>
                    </button>

                    <button
                      type="button"
                      className="btn-demo-card admin-demo-card"
                      onClick={handleQuickAdminDemoLogin}
                    >
                      <span className="demo-card-icon">🛡️</span>
                      <div className="demo-card-body">
                        <strong>Demo Admin Sign In</strong>
                        <small>Store Manager & Command (Admin)</small>
                      </div>
                      <span className="demo-card-pill admin">Admin</span>
                    </button>
                  </div>
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
            {/* FORGOT PASSWORD FLOW */}
            {/* ========================================================= */}
            {mode === 'forgot' && (
              <div className="forgot-flow-container">
                {/* STEP 1: ENTER EMAIL */}
                {forgotStep === 'email' && (
                  <form className="auth-form" onSubmit={handleSendRecoveryCode}>
                    <div className="forgot-card-intro">
                      <h2 className="forgot-form-title">Forgot Password? 🔑</h2>
                      <p className="forgot-form-subtitle">
                        Enter your registered email address and we will dispatch a 6-digit recovery code to restore your sanctuary account.
                      </p>
                    </div>

                    <div className="form-group">
                      <label htmlFor="forgot-email" className="form-label">
                        Registered Email Address ✉️
                      </label>
                      <input
                        type="email"
                        id="forgot-email"
                        className="auth-input"
                        placeholder="e.g. arsalan@cloudpuff.haven"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        onFocus={() => setMascotState('watching')}
                        onBlur={() => setMascotState('idle')}
                        required
                      />
                    </div>

                    <div className="auth-demo-shortcut">
                      <button
                        type="button"
                        className="btn-demo-quick"
                        onClick={() => {
                          playPop();
                          setForgotEmail('arsalan@cloudpuff.haven');
                        }}
                      >
                        ⚡ Use Demo Account (arsalan@cloudpuff.haven)
                      </button>
                    </div>

                    <button type="submit" className="btn-primary auth-submit-btn">
                      Send Recovery Code 🕊️ →
                    </button>

                    <button
                      type="button"
                      className="btn-cancel-flat"
                      onClick={() => {
                        playPop();
                        setMode('signin');
                        setMascotState('idle');
                      }}
                    >
                      Cancel & Return to Sign In
                    </button>
                  </form>
                )}

                {/* STEP 2: VERIFY 6-DIGIT CODE */}
                {forgotStep === 'code' && (
                  <form className="auth-form" onSubmit={handleVerifyCode}>
                    <div className="forgot-card-intro">
                      <h2 className="forgot-form-title">Verify Recovery Code 💌</h2>
                      <p className="forgot-form-subtitle">
                        We sent a 6-digit code to <strong>{forgotEmail}</strong>. Please enter it below.
                      </p>
                    </div>

                    <div className="form-group">
                      <div className="label-row">
                        <label htmlFor="recovery-code" className="form-label">
                          6-Digit Cloud Code 🔒
                        </label>
                        <button
                          type="button"
                          className="btn-toggle-eye-mini"
                          onClick={() => {
                            playPop();
                            setShowRecoveryCode(!showRecoveryCode);
                          }}
                          title={showRecoveryCode ? 'Hide numbers (Show XXXXXX)' : 'Reveal numbers'}
                        >
                          {showRecoveryCode ? '🙈 Show XXXXXX' : '👁️ Reveal Numbers'}
                        </button>
                      </div>

                      <input
                        type="text"
                        id="recovery-code"
                        inputMode="numeric"
                        maxLength={6}
                        className="auth-input recovery-code-input"
                        value={showRecoveryCode ? recoveryCode : (recoveryCode ? 'X'.repeat(recoveryCode.length) : '')}
                        onChange={handleRecoveryCodeChange}
                        onKeyDown={handleRecoveryCodeKeyDown}
                        onFocus={() => setMascotState('watching')}
                        onBlur={() => setMascotState('idle')}
                        placeholder="XXXXXX"
                        autoComplete="off"
                        required
                      />
                    </div>

                    <div className="code-helpers-row">
                      <button
                        type="button"
                        className="btn-demo-quick-mini"
                        onClick={() => {
                          playPop();
                          setRecoveryCode('777202');
                        }}
                      >
                        ⚡ Auto-fill Demo Code (XXXXXX)
                      </button>

                      <button
                        type="button"
                        className="btn-resend-link"
                        onClick={handleResendRecoveryCode}
                        disabled={resendCooldown > 0}
                      >
                        {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend Code 🔄'}
                      </button>
                    </div>

                    <button type="submit" className="btn-primary auth-submit-btn">
                      Verify Code & Continue ✨ →
                    </button>

                    <button
                      type="button"
                      className="btn-cancel-flat"
                      onClick={() => {
                        playPop();
                        setForgotStep('email');
                      }}
                    >
                      ← Change Email Address
                    </button>
                  </form>
                )}

                {/* STEP 3: SET NEW PASSWORD */}
                {forgotStep === 'reset' && (
                  <form className="auth-form" onSubmit={handleResetPassword}>
                    <div className="forgot-card-intro">
                      <h2 className="forgot-form-title">Create New Password 🌸</h2>
                      <p className="forgot-form-subtitle">
                        Choose a fresh fluffy password to secure your sanctuary adoptions.
                      </p>
                    </div>

                    <div className="form-group">
                      <label htmlFor="new-password" className="form-label">
                        New Password 🔑
                      </label>
                      <div className="password-input-wrap">
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          id="new-password"
                          className="auth-input"
                          placeholder="At least 4 characters..."
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          onFocus={() => setMascotState('peek')}
                          onBlur={() => setMascotState('idle')}
                          required
                        />
                        <button
                          type="button"
                          className="btn-toggle-eye"
                          onClick={() => {
                            playPop();
                            setShowNewPassword(!showNewPassword);
                          }}
                          title={showNewPassword ? 'Hide password' : 'Show password'}
                        >
                          {showNewPassword ? '👁️' : '🙈'}
                        </button>
                      </div>

                      {/* Fluff Strength Meter for New Password */}
                      {newPassword.length > 0 && (
                        <div className="fluff-meter-wrap">
                          <div className="fluff-meter-track">
                            <div
                              className="fluff-meter-fill"
                              style={{
                                width: `${(newPassStrength.score / 3) * 100}%`,
                                backgroundColor: newPassStrength.color,
                              }}
                            ></div>
                          </div>
                          <span className="fluff-meter-label" style={{ color: newPassStrength.color }}>
                            {newPassStrength.label}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="form-group">
                      <label htmlFor="confirm-password" className="form-label">
                        Confirm New Password 💖
                      </label>
                      <div className="password-input-wrap">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          id="confirm-password"
                          className="auth-input"
                          placeholder="Repeat new password..."
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          onFocus={() => setMascotState('peek')}
                          onBlur={() => setMascotState('idle')}
                          required
                        />
                        <button
                          type="button"
                          className="btn-toggle-eye"
                          onClick={() => {
                            playPop();
                            setShowConfirmPassword(!showConfirmPassword);
                          }}
                          title={showConfirmPassword ? 'Hide password' : 'Show password'}
                        >
                          {showConfirmPassword ? '👁️' : '🙈'}
                        </button>
                      </div>
                      {confirmPassword.length > 0 && newPassword !== confirmPassword && (
                        <span className="field-hint" style={{ color: '#EF4444' }}>
                          Passwords do not match yet.
                        </span>
                      )}
                      {confirmPassword.length > 0 && newPassword === confirmPassword && (
                        <span className="field-hint" style={{ color: '#10B981' }}>
                          ✓ Passwords match!
                        </span>
                      )}
                    </div>

                    <button type="submit" className="btn-primary auth-submit-btn">
                      Update Password & Sign In 🌸 →
                    </button>
                  </form>
                )}

                {/* STEP 4: SUCCESS CELEBRATION */}
                {forgotStep === 'success' && (
                  <div className="forgot-success-box">
                    <div className="forgot-success-icon">🎉🧸</div>
                    <h2 className="forgot-success-title">Password Restored!</h2>
                    <p className="forgot-success-desc">
                      Your password has been updated and your cuddle credentials are completely secure. You are now logged in as <strong>{forgotEmail}</strong>.
                    </p>

                    <div className="forgot-success-actions">
                      <Link href="/dashboard" className="btn-primary" style={{ width: '100%', textAlign: 'center' }}>
                        Go to Sanctuary Dashboard 📊
                      </Link>
                      <Link href="/" className="btn-secondary" style={{ width: '100%', textAlign: 'center' }}>
                        Explore Plushie Catalog 🍓
                      </Link>
                      <button
                        type="button"
                        className="btn-cancel-flat"
                        onClick={() => {
                          playPop();
                          setMode('signin');
                          setForgotStep('email');
                        }}
                      >
                        Return to Sign In Screen 🧸
                      </button>
                    </div>
                  </div>
                )}
              </div>
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
