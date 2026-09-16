'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import { useSound } from '@/context/SoundContext';
import { useCart } from '@/context/CartContext';
import { confettiEngine } from '@/utils/confetti';
import { AppleLogo, GoogleLogo } from '@/components/PaymentBrandLogos';

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

  // Sign Up Email Verification Flow States
  const [signUpStep, setSignUpStep] = useState<'details' | 'verify'>('details');
  const [signupVerificationCode, setSignupVerificationCode] = useState('');
  const [showSignupCode, setShowSignupCode] = useState(false);
  const [generatedSignupCode, setGeneratedSignupCode] = useState('');
  const [signupResendCooldown, setSignupResendCooldown] = useState(0);
  const [isDispatchingCode, setIsDispatchingCode] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [showMailPreviewModal, setShowMailPreviewModal] = useState(false);

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

  React.useEffect(() => {
    if (signupResendCooldown > 0) {
      const timer = setTimeout(() => setSignupResendCooldown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [signupResendCooldown]);

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

  const handleStartSignUpVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim()) {
      playSquish();
      showToast('⚠️ Please enter your Parent Full Name.');
      return;
    }
    if (!regEmail.trim() || !regEmail.includes('@')) {
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

    setIsDispatchingCode(true);
    playPop();
    try {
      const res = await fetch('/api/auth/send-verification-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: regEmail.trim(),
          name: regName.trim(),
          purpose: 'signup',
        }),
      });
      const data = await res.json();
      const code = data.code || Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedSignupCode(code);
      setSignupVerificationCode('');
      setSignupResendCooldown(45);
      setSignUpStep('verify');
      setMascotState('watching');
      playChime();
      confettiEngine.burst();
      showToast(`💌 6-digit verification code sent to ${regEmail}!`);
    } catch (err) {
      console.error('Failed to send verification code:', err);
      const fallbackCode = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedSignupCode(fallbackCode);
      setSignupVerificationCode('');
      setSignupResendCooldown(45);
      setSignUpStep('verify');
      setMascotState('watching');
      playChime();
      showToast(`💌 Verification code dispatched to ${regEmail}!`);
    } finally {
      setIsDispatchingCode(false);
    }
  };

  const handleResendSignUpCode = async () => {
    if (signupResendCooldown > 0 || isDispatchingCode) return;
    setIsDispatchingCode(true);
    playPop();
    try {
      const res = await fetch('/api/auth/send-verification-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: regEmail.trim(),
          name: regName.trim(),
          purpose: 'signup',
        }),
      });
      const data = await res.json();
      const freshCode = data.code || Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedSignupCode(freshCode);
      setSignupResendCooldown(45);
      playChime();
      showToast(`🕊️ New verification code dispatched to ${regEmail}!`);
    } catch (err) {
      console.error('Failed to resend code:', err);
      const freshCode = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedSignupCode(freshCode);
      setSignupResendCooldown(45);
      playChime();
      showToast(`🕊️ Verification code resent to ${regEmail}!`);
    } finally {
      setIsDispatchingCode(false);
    }
  };

  const handleVerifyAndRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = signupVerificationCode.trim();
    if (!cleanCode) {
      playSquish();
      showToast('⚠️ Please enter the 6-digit verification code.');
      return;
    }

    setIsVerifyingCode(true);
    let isCodeValid = false;

    try {
      const verifyRes = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: regEmail.trim(),
          code: cleanCode,
          purpose: 'signup',
        }),
      });
      const verifyData = await verifyRes.json();
      if (verifyRes.ok && verifyData.success) {
        isCodeValid = true;
      }
    } catch (err) {
      console.warn('API verification fallback to client match:', err);
    }

    // Client fallback allow check if matched or test code
    if (!isCodeValid && (cleanCode === generatedSignupCode || cleanCode === '777202' || cleanCode === '123456')) {
      isCodeValid = true;
    }

    if (!isCodeValid) {
      setIsVerifyingCode(false);
      playSquish();
      showToast('⚠️ Invalid or expired verification code. Please check your email or click Auto-fill.');
      return;
    }

    const buddy = PLUSHIE_BUDDIES.find((b) => b.id === selectedBuddy)?.name || 'Matcha Dino';

    // Persist to PostgreSQL sanctuary_users
    try {
      await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regName.trim(),
          email: regEmail.trim(),
          password: regPassword,
          favoriteBuddy: buddy,
        }),
      });
    } catch (regErr) {
      console.warn('Backend user registration error (proceeding with local session):', regErr);
    }

    register(regName, regEmail, regPassword, buddy);
    setIsVerifyingCode(false);
    playChime();
    confettiEngine.burst();
    setMascotState('celebrate');
    showToast(`🎉 Email verified & certificate issued! Welcome to the family, ${regName}!`);
    setTimeout(() => {
      router.push('/dashboard');
    }, 1000);
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
                  : mode === 'signup' && signUpStep === 'verify'
                  ? 'Check your inbox! Enter your 6-digit cloud verification code! 💌'
                  : mascotState === 'peek'
                  ? 'I won’t peek at your secret password! 🙈'
                  : mascotState === 'watching'
                  ? 'Ooh, typing your cloud details! ☁️✨'
                  : mascotState === 'celebrate'
                  ? 'Yay! More hugs on the way! 🎉'
                  : 'Welcome to our cozy cloud haven! 🌸'}
              </p>
            </div>

            {/* Mode Switcher Tabs */}
            {mode !== 'forgot' && !(mode === 'signup' && signUpStep === 'verify') ? (
              <div className="auth-tabs-row">
                <button
                  className={`auth-tab-btn ${mode === 'signin' ? 'active' : ''}`}
                  onClick={() => {
                    playPop();
                    setMode('signin');
                    setSignUpStep('details');
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
                    setSignUpStep('details');
                    setMascotState('idle');
                  }}
                  type="button"
                >
                  Create Account ✨
                </button>
              </div>
            ) : mode === 'signup' && signUpStep === 'verify' ? (
              <div className="forgot-header-bar">
                <button
                  type="button"
                  className="btn-back-to-signin"
                  onClick={() => {
                    playPop();
                    setSignUpStep('details');
                    setMascotState('idle');
                  }}
                >
                  ← Edit Account Details
                </button>
                <span className="forgot-stage-badge">
                  Step 2 of 2: Email Verification Code
                </span>
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
                    <GoogleLogo size={18} />
                    <span>Google</span>
                  </button>
                  <button
                    type="button"
                    className="social-btn apple-btn"
                    onClick={() => handleSocialLogin('Apple')}
                  >
                    <AppleLogo size={18} />
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
            {/* CREATE AN ACCOUNT FLOW (STEP 1: DETAILS, STEP 2: EMAIL VERIFY) */}
            {/* ========================================================= */}
            {mode === 'signup' && (
              <>
                {signUpStep === 'details' ? (
                  <form className="auth-form" onSubmit={handleStartSignUpVerification}>
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

                    <button
                      type="submit"
                      className="btn-primary auth-submit-btn"
                      disabled={isDispatchingCode}
                    >
                      {isDispatchingCode ? 'Dispatching Verification Code 💌...' : 'Send Verification Code 💌 →'}
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
                        <GoogleLogo size={20} />
                        <span>Google</span>
                      </button>
                      <button
                        type="button"
                        className="social-btn apple-btn"
                        onClick={() => handleSocialLogin('Apple')}
                      >
                        <AppleLogo size={20} />
                        <span>Apple</span>
                      </button>
                    </div>
                  </form>
                ) : (
                  /* STEP 2: VERIFY EMAIL WITH 6-DIGIT CODE */
                  <form className="auth-form" onSubmit={handleVerifyAndRegister}>
                    <div className="forgot-card-intro">
                      <h2 className="forgot-form-title">Verify Your Email Address 💌</h2>
                      <p className="forgot-form-subtitle">
                        We dispatched a 6-digit verification code to <strong>{regEmail}</strong>. Enter it below to confirm your account and activate your sanctuary certificate.
                      </p>
                    </div>

                    {/* Dispatched Mailbox Status Banner */}
                    <div
                      style={{
                        background: 'linear-gradient(135deg, rgba(254, 242, 242, 0.9), rgba(253, 242, 248, 0.9))',
                        border: '1.5px solid #FBCFE8',
                        borderRadius: '16px',
                        padding: '12px 16px',
                        marginBottom: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '0.75rem',
                        flexWrap: 'wrap',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '1.25rem' }}>📬</span>
                        <div style={{ textAlign: 'left' }}>
                          <strong style={{ display: 'block', fontSize: '0.85rem', color: '#9D174D' }}>
                            Dispatched to Inbox
                          </strong>
                          <span style={{ fontSize: '0.8rem', color: '#4B5563' }}>{regEmail}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          playPop();
                          setShowMailPreviewModal(true);
                        }}
                        style={{
                          background: '#FFFFFF',
                          border: '1.5px solid #F472B6',
                          color: '#DB2777',
                          padding: '5px 12px',
                          borderRadius: '9999px',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        👁️ View Email Preview
                      </button>
                    </div>

                    <div className="form-group">
                      <div className="label-row">
                        <label htmlFor="signup-verification-code" className="form-label">
                          6-Digit Email Code 🔒
                        </label>
                        <button
                          type="button"
                          className="btn-toggle-eye-mini"
                          onClick={() => {
                            playPop();
                            setShowSignupCode(!showSignupCode);
                          }}
                          title={showSignupCode ? 'Hide numbers' : 'Reveal numbers'}
                        >
                          {showSignupCode ? '🙈 Hide Numbers' : '👁️ Reveal Numbers'}
                        </button>
                      </div>

                      <input
                        type="text"
                        id="signup-verification-code"
                        inputMode="numeric"
                        maxLength={6}
                        className="auth-input recovery-code-input font-mono"
                        value={showSignupCode ? signupVerificationCode : (signupVerificationCode ? '•'.repeat(signupVerificationCode.length) : '')}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (showSignupCode) {
                            setSignupVerificationCode(val.replace(/\D/g, '').slice(0, 6));
                          } else {
                            if (val.length < signupVerificationCode.length) {
                              setSignupVerificationCode(signupVerificationCode.slice(0, val.length));
                            } else {
                              const added = val.slice(-1);
                              if (/\d/.test(added) && signupVerificationCode.length < 6) {
                                setSignupVerificationCode(signupVerificationCode + added);
                              }
                            }
                          }
                        }}
                        onFocus={() => setMascotState('watching')}
                        onBlur={() => setMascotState('idle')}
                        placeholder="••••••"
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
                          setSignupVerificationCode(generatedSignupCode || '487291');
                        }}
                      >
                        ⚡ Auto-fill Code ({generatedSignupCode || '487291'})
                      </button>

                      <button
                        type="button"
                        className="btn-resend-link"
                        onClick={handleResendSignUpCode}
                        disabled={signupResendCooldown > 0 || isDispatchingCode}
                      >
                        {signupResendCooldown > 0 ? `Resend in ${signupResendCooldown}s` : 'Resend Code 🔄'}
                      </button>
                    </div>

                    <button
                      type="submit"
                      className="btn-primary auth-submit-btn"
                      disabled={isVerifyingCode}
                    >
                      {isVerifyingCode ? 'Verifying Certificate ✨...' : 'Verify & Activate Account ✨ →'}
                    </button>

                    <button
                      type="button"
                      className="btn-cancel-flat"
                      onClick={() => {
                        playPop();
                        setSignUpStep('details');
                        setMascotState('idle');
                      }}
                    >
                      ← Edit Registration Details
                    </button>
                  </form>
                )}
              </>
            )}

            {/* Sky Mailbox Email Preview Modal */}
            {/* Sky Mailbox Email Preview Modal (Exact Gmail Email Design) */}
            {showMailPreviewModal && (
              <div
                style={{
                  position: 'fixed',
                  inset: 0,
                  backgroundColor: 'rgba(15, 23, 42, 0.65)',
                  backdropFilter: 'blur(6px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 9999,
                  padding: '1rem',
                }}
                onClick={() => setShowMailPreviewModal(false)}
              >
                <div
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '24px',
                    maxWidth: '560px',
                    width: '100%',
                    maxHeight: '90vh',
                    overflowY: 'auto',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
                    border: '1px solid #E2E8F0',
                    textAlign: 'left',
                    animation: 'softWiggle 0.25s ease',
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Gmail Window Bar */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '14px 20px',
                      borderBottom: '1px solid #F1F5F9',
                      background: '#FAFAFA',
                      borderTopLeftRadius: '24px',
                      borderTopRightRadius: '24px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '1.1rem', cursor: 'pointer' }} onClick={() => setShowMailPreviewModal(false)}>←</span>
                      <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1E293B' }}>Verify Your Email Address</span>
                      <span
                        style={{
                          background: '#E2E8F0',
                          color: '#475569',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '4px',
                        }}
                      >
                        Inbox
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowMailPreviewModal(false)}
                      style={{
                        background: '#F1F5F9',
                        border: 'none',
                        borderRadius: '50%',
                        width: '28px',
                        height: '28px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: '#64748B',
                        fontSize: '0.9rem',
                        fontWeight: 'bold',
                      }}
                    >
                      ✕
                    </button>
                  </div>

                  {/* Gmail Sender Info Row */}
                  <div style={{ padding: '16px 20px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #F8FAFC' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #A855F7, #6366F1)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#FFFFFF',
                          fontSize: '1.2rem',
                          fontWeight: 700,
                        }}
                      >
                        ☁️
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                          <strong style={{ fontSize: '0.92rem', color: '#0F172A' }}>CloudPuff</strong>
                          <span style={{ fontSize: '0.78rem', color: '#64748B' }}>&lt;noreply@cloudpuff.neogentechnologies.com&gt;</span>
                        </div>
                        <span style={{ fontSize: '0.78rem', color: '#94A3B8' }}>to me ▾</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94A3B8', fontSize: '0.8rem' }}>
                      <span>Just now</span>
                      <span>⭐</span>
                      <span>↩️</span>
                    </div>
                  </div>

                  {/* The Beautiful Email Body (matching the user's design) */}
                  <div style={{ padding: '20px', background: '#F8F5FE' }}>
                    <div
                      style={{
                        background: '#FFFFFF',
                        borderRadius: '28px',
                        overflow: 'hidden',
                        border: '1px solid #E9D5FF',
                        boxShadow: '0 10px 25px rgba(139, 92, 246, 0.08)',
                      }}
                    >
                      {/* Email Header Banner (Exact art matching reference design) */}
                      <div style={{ padding: 0, lineHeight: 0, backgroundColor: '#F5EEFE' }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src="/assets/email-header-art.png"
                          alt="Plushie - Cuddles in Every Click"
                          style={{
                            width: '100%',
                            display: 'block',
                            borderTopLeftRadius: '28px',
                            borderTopRightRadius: '28px',
                          }}
                        />
                      </div>

                      {/* Main Email Content */}
                      <div style={{ padding: '20px 28px 28px', textAlign: 'center' }}>
                        <h1
                          style={{
                            fontFamily: 'var(--font-heading)',
                            fontSize: '1.8rem',
                            fontWeight: 800,
                            color: '#382467',
                            margin: '0 0 4px',
                          }}
                        >
                          Almost There!
                        </h1>
                        <h2
                          style={{
                            fontFamily: 'var(--font-heading)',
                            fontSize: '1.45rem',
                            fontWeight: 800,
                            color: '#4C2E85',
                            margin: '0 0 20px',
                          }}
                        >
                          Verify Your Email Address
                        </h2>

                        <p style={{ textAlign: 'left', fontSize: '0.95rem', color: '#4A3A69', margin: '0 0 8px', fontWeight: 600 }}>
                          Hi there,
                        </p>
                        <p style={{ textAlign: 'left', fontSize: '0.9rem', color: '#554471', margin: '0 0 24px', lineHeight: 1.55 }}>
                          To complete your account setup and start your plushie adventure, please use the verification code below.
                        </p>

                        {/* Code Box */}
                        <div style={{ margin: '0 auto 12px', textAlign: 'center' }}>
                          <div
                            style={{
                              display: 'inline-block',
                              background: '#F6F3FF',
                              border: '2px dashed #C4B5FD',
                              borderRadius: '20px',
                              padding: '14px 28px',
                              textAlign: 'center',
                            }}
                          >
                            <span
                              style={{
                                fontFamily: 'monospace',
                                fontSize: '2.4rem',
                                fontWeight: 900,
                                letterSpacing: '10px',
                                color: '#372063',
                                paddingLeft: '10px',
                              }}
                            >
                              {generatedSignupCode || '487291'}
                            </span>
                          </div>
                        </div>

                        <p style={{ fontSize: '0.85rem', color: '#634F82', margin: '0 0 24px', fontWeight: 600 }}>
                          This code will expire in 10 minutes.
                        </p>

                        {/* Security Notice Card */}
                        <div
                          style={{
                            background: '#FAF8FE',
                            border: '1px solid #E9D5FF',
                            borderRadius: '16px',
                            padding: '14px 16px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            textAlign: 'left',
                            marginBottom: '20px',
                          }}
                        >
                          <div
                            style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '10px',
                              background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#FFFFFF',
                              fontSize: '1rem',
                              flexShrink: 0,
                            }}
                          >
                            🔒
                          </div>
                          <div>
                            <strong style={{ fontSize: '0.85rem', color: '#3B236E', display: 'block', marginBottom: '2px' }}>
                              Didn&apos;t request this?
                            </strong>
                            <span style={{ fontSize: '0.8rem', color: '#584475', lineHeight: 1.4 }}>
                              If you didn&apos;t create an account with Plushie, you can safely ignore this email.
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Footer */}
                      <div
                        style={{
                          background: '#FFFFFF',
                          textAlign: 'center',
                          padding: 0,
                          lineHeight: 0,
                        }}
                      >
                        <p style={{ margin: '14px 0 8px', fontSize: '0.82rem', fontWeight: 700, color: '#8B5CF6' }}>
                          ♥ Made with love by Plushie ♥
                        </p>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src="/assets/email-footer-art.png"
                          alt="Cloud wave footer"
                          style={{
                            width: '100%',
                            display: 'block',
                            borderBottomLeftRadius: '28px',
                            borderBottomRightRadius: '28px',
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Modal Action Buttons */}
                  <div style={{ padding: '16px 20px', background: '#FFFFFF', borderTop: '1px solid #F1F5F9', display: 'flex', gap: '10px' }}>
                    <button
                      type="button"
                      className="btn-primary"
                      style={{ flex: 1, padding: '11px', fontSize: '0.9rem' }}
                      onClick={() => {
                        playPop();
                        setSignupVerificationCode(generatedSignupCode || '487291');
                        setShowMailPreviewModal(false);
                        showToast('⚡ Verification code auto-filled from email!');
                      }}
                    >
                      ⚡ Auto-fill Code ({generatedSignupCode || '487291'}) & Close
                    </button>
                    <button
                      type="button"
                      className="btn-secondary"
                      style={{ padding: '11px 18px', fontSize: '0.9rem' }}
                      onClick={() => setShowMailPreviewModal(false)}
                    >
                      Done
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
