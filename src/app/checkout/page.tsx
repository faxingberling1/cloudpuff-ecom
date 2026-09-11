'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { useSound } from '@/context/SoundContext';
import { confettiEngine } from '@/utils/confetti';
import { TrackingModal } from '@/components/TrackingModal';

interface CertificateInfo {
  parentName: string;
  plushieName: string;
  date: string;
  registryNumber: string;
  primaryImage: string;
  totalPlushies: number;
  destination: string;
  estimatedDelivery: string;
}

export default function CheckoutPage() {
  const { items, subtotal, shippingThreshold, clearCart, showToast } = useCart();
  const { playPop, playChime, playSquish } = useSound();

  // Form State
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [apt, setApt] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('United States');

  // Personalization
  const [hasGiftNote, setHasGiftNote] = useState(false);
  const [giftNote, setGiftNote] = useState('');
  const [plushieName, setPlushieName] = useState('');

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'applepay' | 'paypal'>('card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');

  // Coupon
  const [couponInput, setCouponInput] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);

  // Completion State
  const [isCompleted, setIsCompleted] = useState(false);
  const [certificate, setCertificate] = useState<CertificateInfo | null>(null);
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const isFreeShipping = subtotal >= shippingThreshold;
  const shippingCost = subtotal === 0 ? 0 : (isFreeShipping ? 0 : 4.99);
  const finalTotal = Math.max(0, subtotal - discountAmount + shippingCost);

  // Apply Coupon
  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const code = couponInput.trim().toUpperCase();

    if (code === 'SNUGGLE15') {
      const discount = subtotal * 0.15;
      setDiscountAmount(discount);
      setAppliedCoupon(code);
      playChime();
      showToast('🎉 Code SNUGGLE15 applied! 15% off cuddle discount!');
    } else if (code === 'MATCHALOVE') {
      const discount = Math.min(5, subtotal);
      setDiscountAmount(discount);
      setAppliedCoupon(code);
      playChime();
      showToast('🍵 Code MATCHALOVE applied! $5 instant cuddle credit!');
    } else if (code === 'BOBABUDDY') {
      setAppliedCoupon(code);
      playChime();
      showToast('🧋 Code BOBABUDDY applied! Free Micro Boba Keyring included in box!');
    } else if (code) {
      playPop();
      showToast('⚠️ Oops! That code took a nap. Try SNUGGLE15 or MATCHALOVE! 🍓');
    }
  };

  // Submit Order
  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    playSquish();
    confettiEngine.burst();

    const regNum = `CP-${Math.floor(100000 + Math.random() * 900000)}`;
    const today = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const deliveryDateObj = new Date();
    deliveryDateObj.setDate(deliveryDateObj.getDate() + 3);
    const estDelivery = deliveryDateObj.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });

    const fullAddress = [
      streetAddress,
      apt ? `Apt ${apt}` : '',
      city,
      state,
      postalCode,
      country
    ].filter(Boolean).join(', ') || '123 Cuddle Haven Way, Fluff City';

    const chosenName = plushieName.trim() || items[0]?.name || 'Fluffy Cloud Friend';

    setCertificate({
      parentName: fullName.trim() || 'Verified Cloud Parent',
      plushieName: chosenName,
      date: today,
      registryNumber: regNum,
      primaryImage: items[0]?.image || '/assets/hero.jpg',
      totalPlushies: items.reduce((sum, i) => sum + i.qty, 0),
      destination: fullAddress,
      estimatedDelivery: estDelivery
    });

    clearCart();
    setIsCompleted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // If order complete -> Render Adoption Certificate!
  if (isCompleted && certificate) {
    return (
      <div className="checkout-page container">
        <div className="certificate-container">
          <div className="certificate-card" id="adoption-certificate">
            <span className="certificate-badge">★ Official Certificate of Adoption ★</span>
            <h1 className="certificate-title">CloudPuff Adoption Registry</h1>
            <p className="certificate-subtitle">
              This certifies that unconditional love, lifelong snuggles, and cloud-grade comfort have been officially established.
            </p>

            <div className="cert-seal">🧸</div>

            <div className="certificate-details-grid">
              <div className="cert-field">
                <strong>Plushie Official Name</strong>
                <span>{certificate.plushieName}</span>
              </div>
              <div className="cert-field">
                <strong>Certified Parent</strong>
                <span>{certificate.parentName}</span>
              </div>
              <div className="cert-field">
                <strong>Registry Number</strong>
                <span>{certificate.registryNumber}</span>
              </div>
              <div className="cert-field">
                <strong>Adoption Date</strong>
                <span>{certificate.date}</span>
              </div>
            </div>

            {/* Quick Live Delivery Tracker Banner */}
            <div
              className="cert-delivery-tracker-bar"
              onClick={() => {
                playPop();
                setShowTrackingModal(true);
              }}
              role="button"
              tabIndex={0}
            >
              <div className="tracker-bar-left">
                <span className="live-pulsing-dot"></span>
                <span className="tracker-bar-text">
                  <strong>Delivery Status:</strong> In Snuggle Transit • Arriving ~ {certificate.estimatedDelivery}
                </span>
              </div>
              <span className="tracker-bar-arrow">Track Journey 🚚 →</span>
            </div>

            <div className="cert-vow-box">
              🍓 <strong>Plushie Vow:</strong> To always provide comfort during hard days, cozy hugs while sleeping, and never judge bedtime snack choices.
            </div>

            <div className="certificate-actions">
              <button
                className="btn-primary"
                onClick={() => window.print()}
                type="button"
              >
                Print / Save Certificate 🖨️
              </button>
              <button
                className="btn-tracking"
                onClick={() => {
                  playPop();
                  setShowTrackingModal(true);
                }}
                type="button"
              >
                Track My Delivery 🚚✨
              </button>
              <Link href="/" className="btn-secondary">
                Back to CloudPuff Haven 🌸
              </Link>
            </div>
          </div>
        </div>

        {/* Live Delivery Tracking Modal */}
        <TrackingModal
          isOpen={showTrackingModal}
          onClose={() => setShowTrackingModal(false)}
          trackingNumber={certificate.registryNumber}
          plushieName={certificate.plushieName}
          parentName={certificate.parentName}
          destination={certificate.destination}
          plushieImage={certificate.primaryImage}
          adoptionDate={certificate.date}
          estimatedDelivery={certificate.estimatedDelivery}
        />
      </div>
    );
  }

  // Loading state while localStorage hydrates
  if (!isMounted) {
    return (
      <div className="checkout-page container" style={{ textAlign: 'center', padding: '8rem 1.5rem' }}>
        <div style={{ fontSize: '3rem', animation: 'softWiggle 2s infinite' }}>🧸</div>
        <h3 style={{ fontFamily: 'var(--font-heading)', marginTop: '1rem', color: 'var(--text-muted)' }}>
          Preparing your cuddle basket...
        </h3>
      </div>
    );
  }

  // If cart is empty
  if (items.length === 0 && !isCompleted) {
    return (
      <div className="checkout-page container" style={{ textAlign: 'center', padding: '6rem 1.5rem' }}>
        <div className="cart-empty-icon" style={{ fontSize: '4.5rem', marginBottom: '1.2rem' }}>🧸</div>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.2rem', marginBottom: '0.8rem' }}>
          Your cuddle basket is currently empty!
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '2rem' }}>
          Adopt an adorable plushie friend before proceeding to checkout.
        </p>
        <Link href="/#shop-section" className="btn-primary">
          Explore Cuddle Squad 🍓
        </Link>
      </div>
    );
  }

  return (
    <div className="checkout-page container">
      {/* Top Bar */}
      <div className="checkout-header-bar">
        <Link href="/" className="return-link">
          ← Return to CloudPuff Haven
        </Link>
        <div className="checkout-security-pill">
          <span>🔒 256-Bit Snuggle-Grade Secure Checkout</span>
        </div>
      </div>

      <form onSubmit={handleSubmitOrder} className="checkout-layout">
        {/* Left Column: Information Forms */}
        <div className="checkout-forms-column">
          {/* Step 1: Parent & Delivery Address */}
          <div className="checkout-card">
            <div className="checkout-step-header">
              <span className="step-number-badge">1</span>
              <h2 className="step-title">Delivery & Parent Details 🚚</h2>
            </div>

            <div className="form-grid">
              <div className="form-group full-width">
                <label className="form-label">Email Address (for adoption papers & updates)</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="name@example.com"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>

              <div className="form-group full-width">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Arsalan Abbas"
                  required
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                />
              </div>

              <div className="form-group full-width">
                <label className="form-label">Street Address</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="123 Cozy Cloud Lane"
                  required
                  value={streetAddress}
                  onChange={e => setStreetAddress(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Apt, Suite (optional)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Apt 4B"
                  value={apt}
                  onChange={e => setApt(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">City</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="San Francisco"
                  required
                  value={city}
                  onChange={e => setCity(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">State / Province</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="CA"
                  required
                  value={state}
                  onChange={e => setState(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Postal Code</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="94105"
                  required
                  value={postalCode}
                  onChange={e => setPostalCode(e.target.value)}
                />
              </div>

              <div className="form-group full-width">
                <label className="form-label">Country</label>
                <select
                  className="form-select"
                  value={country}
                  onChange={e => setCountry(e.target.value)}
                >
                  <option value="United States">United States</option>
                  <option value="Canada">Canada</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Australia">Australia</option>
                  <option value="Germany">Germany</option>
                  <option value="Japan">Japan</option>
                </select>
              </div>
            </div>
          </div>

          {/* Step 2: Plushie Personalization */}
          <div className="checkout-card">
            <div className="checkout-step-header">
              <span className="step-number-badge">2</span>
              <h2 className="step-title">Plushie Personalization 🎀</h2>
            </div>

            <div className="form-group" style={{ marginBottom: '1.2rem' }}>
              <label className="form-label">
                Name your plushie (Printed on your official Adoption Certificate!)
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Sir Fluffington, Mochi Jr., Princess Peaches"
                value={plushieName}
                onChange={e => setPlushieName(e.target.value)}
              />
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontWeight: 700, fontSize: '0.95rem' }}>
              <input
                type="checkbox"
                checked={hasGiftNote}
                onChange={e => setHasGiftNote(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: 'var(--pink-primary)' }}
              />
              <span>Add a free handwritten gift note from Pip the Bunny 🍓</span>
            </label>

            {hasGiftNote && (
              <div className="form-group" style={{ marginTop: '1rem' }}>
                <textarea
                  className="form-textarea"
                  placeholder="Write your sweet message here..."
                  value={giftNote}
                  onChange={e => setGiftNote(e.target.value)}
                />
              </div>
            )}
          </div>

          {/* Step 3: Payment Details */}
          <div className="checkout-card">
            <div className="checkout-step-header">
              <span className="step-number-badge">3</span>
              <h2 className="step-title">Payment Method 💳</h2>
            </div>

            <div className="payment-methods-grid">
              <button
                type="button"
                className={`payment-method-btn ${paymentMethod === 'card' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('card')}
              >
                <span>💳 Card</span>
                <span>Credit / Debit</span>
              </button>
              <button
                type="button"
                className={`payment-method-btn ${paymentMethod === 'applepay' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('applepay')}
              >
                <span>🍎 CloudPay</span>
                <span>Apple / Google</span>
              </button>
              <button
                type="button"
                className={`payment-method-btn ${paymentMethod === 'paypal' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('paypal')}
              >
                <span>🅿️ PayPal</span>
                <span>Express</span>
              </button>
            </div>

            {paymentMethod === 'card' && (
              <div className="form-grid">
                <div className="form-group full-width">
                  <label className="form-label">Card Number</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="4242 •••• •••• 4242"
                    required
                    value={cardNumber}
                    onChange={e => setCardNumber(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Expiry Date</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="MM / YY"
                    required
                    value={cardExpiry}
                    onChange={e => setCardExpiry(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">CVC / CVV</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="123"
                    required
                    value={cardCvc}
                    onChange={e => setCardCvc(e.target.value)}
                  />
                </div>
              </div>
            )}

            {paymentMethod !== 'card' && (
              <div style={{ background: 'var(--pink-soft)', borderRadius: '18px', padding: '1.2rem', textAlign: 'center', color: 'var(--text-dark)', fontWeight: 600 }}>
                You will be seamlessly connected to complete payment when clicking Complete Adoption! ✨
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="order-summary-sidebar">
          <div className="checkout-card">
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.35rem', marginBottom: '1.2rem' }}>
              Your Cuddle Basket ({items.reduce((s, i) => s + i.qty, 0)}) 🧺
            </h3>

            {/* Item Thumbnails */}
            <div className="summary-items-list">
              {items.map(item => (
                <div key={item.id} className="summary-item-row">
                  <Image
                    src={item.image.startsWith('/') ? item.image : `/${item.image}`}
                    alt={item.name}
                    width={55}
                    height={55}
                    className="summary-item-img"
                  />
                  <div>
                    <h4 className="summary-item-title">{item.name}</h4>
                    <span className="summary-item-meta">Qty: {item.qty}</span>
                  </div>
                  <span className="summary-item-price">
                    ${(item.price * item.qty).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Coupon Code Input */}
            <div className="checkout-coupon-row">
              <input
                type="text"
                className="coupon-input"
                placeholder="Discount Code"
                value={couponInput}
                onChange={e => setCouponInput(e.target.value)}
              />
              <button
                type="button"
                className="coupon-apply-btn"
                onClick={handleApplyCoupon}
              >
                Apply
              </button>
            </div>

            {appliedCoupon && (
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--mint-dark)', marginBottom: '1rem' }}>
                ✓ Coupon {appliedCoupon} active!
              </div>
            )}

            {/* Pricing Breakdown */}
            <div className="summary-calculations">
              <div className="calc-row">
                <span>Plushie Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="calc-row discount">
                  <span>Snuggle Discount</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="calc-row">
                <span>Cuddle Delivery</span>
                <span>{isFreeShipping ? 'FREE ✨' : '$4.99'}</span>
              </div>
              <div className="calc-row final-total">
                <span>Final Total</span>
                <span>${finalTotal.toFixed(2)}</span>
              </div>
            </div>

            <button type="submit" className="complete-order-btn">
              <span>Complete Adoption & Seal With Love 💖</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
