'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useSound } from '@/context/SoundContext';
import { confettiEngine } from '@/utils/confetti';

const normalizeImageSrc = (src?: string) => {
  if (!src) return '/assets/hero.jpg';
  if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('/')) {
    return src;
  }
  return `/${src}`;
};

export const CartDrawer: React.FC = () => {
  const {
    items,
    isCartOpen,
    setIsCartOpen,
    updateQty,
    removeItem,
    clearCart,
    subtotal,
    shippingThreshold,
    totalCount
  } = useCart();
  const { playChime } = useSound();

  // Handle body scroll lock & Escape key
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setIsCartOpen(false);
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [isCartOpen, setIsCartOpen]);

  const isFreeShipping = subtotal >= shippingThreshold;
  const shippingCost = subtotal === 0 ? 0 : (isFreeShipping ? 0 : 4.99);
  const total = subtotal + shippingCost;
  const progressPercent = Math.min(100, Math.round((subtotal / shippingThreshold) * 100));
  const remaining = (shippingThreshold - subtotal).toFixed(2);

  const [showCheckoutSuccess, setShowCheckoutSuccess] = useState(false);
  const [adoptedCount, setAdoptedCount] = useState(0);

  const handleCheckout = () => {
    if (items.length === 0) return;
    playChime();
    confettiEngine.burst();
    setAdoptedCount(totalCount);
    setShowCheckoutSuccess(true);
    clearCart();
  };

  const handleCloseSuccess = () => {
    setShowCheckoutSuccess(false);
    setIsCartOpen(false);
  };

  const scrollToShop = () => {
    setIsCartOpen(false);
    document.getElementById('shop-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div
      className={`cart-backdrop ${isCartOpen ? 'open' : ''}`}
      id="cart-drawer-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) setIsCartOpen(false);
      }}
      aria-hidden={!isCartOpen}
    >
      <aside className="cart-drawer">
        {/* Drawer Header */}
        <div className="cart-header">
          <h3 className="cart-title">
            <span>🛒 Your Cuddle Basket</span>
          </h3>
          <button
            className="close-btn"
            onClick={() => setIsCartOpen(false)}
            aria-label="Close cart"
            type="button"
          >
            ✕
          </button>
        </div>

        {/* Free Shipping Tracker */}
        <div className="cart-shipping-bar">
          <div className="shipping-msg">
            {isFreeShipping ? (
              <span>🎉 <strong>Hooray!</strong> You unlocked FREE cuddly shipping!</span>
            ) : subtotal > 0 ? (
              <span>Add <strong>${remaining}</strong> more for <strong>FREE Cuddle Delivery!</strong></span>
            ) : (
              <span>Add <strong>$45.00</strong> to get <strong>FREE Cuddle Delivery!</strong></span>
            )}
          </div>
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Cart Items */}
        <div className="cart-items-wrap" id="cart-items-wrap">
          {items.length === 0 ? (
            <div className="cart-empty-state">
              <div className="cart-empty-icon">🧸</div>
              <h3>Your cart is feeling lonely!</h3>
              <p style={{ marginTop: '0.5rem', fontSize: '0.95rem' }}>
                Adopt a fluffy friend to warm up this basket.
              </p>
              <button
                className="btn-primary"
                style={{ marginTop: '1.5rem', fontSize: '0.95rem', padding: '0.65rem 1.4rem' }}
                onClick={scrollToShop}
                type="button"
              >
                Explore Cuties 🍓
              </button>
            </div>
          ) : (
            items.map(item => (
              <div key={item.id} className="cart-item">
                <Image
                  src={normalizeImageSrc(item.image)}
                  alt={item.name}
                  width={75}
                  height={75}
                  className="cart-item-img"
                />
                <div className="cart-item-details">
                  <h4>{item.name}</h4>
                  <div className="cart-item-price">
                    ${(item.price * item.qty).toFixed(2)}
                  </div>
                  <div className="cart-item-qty">
                    <button
                      className="qty-btn"
                      onClick={() => updateQty(item.id, -1)}
                      type="button"
                    >
                      -
                    </button>
                    <span>{item.qty}</span>
                    <button
                      className="qty-btn"
                      onClick={() => updateQty(item.id, 1)}
                      type="button"
                    >
                      +
                    </button>
                  </div>
                </div>
                <button
                  className="remove-item-btn"
                  title="Remove"
                  onClick={() => removeItem(item.id)}
                  type="button"
                >
                  ✕
                </button>
              </div>
            ))
          )}
        </div>

        {/* Cart Summary & Checkout */}
        <div className="cart-footer">
          <div className="cart-summary-row">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="cart-summary-row">
            <span>Shipping</span>
            <span>
              {subtotal === 0 ? '$0.00' : (isFreeShipping ? 'FREE ✨' : '$4.99')}
            </span>
          </div>
          <div className="cart-total-row">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
          <Link
            href="/checkout"
            className="checkout-btn"
            onClick={() => setIsCartOpen(false)}
            style={{
              opacity: items.length === 0 ? 0.6 : 1,
              pointerEvents: items.length === 0 ? 'none' : 'auto',
              textDecoration: 'none'
            }}
          >
            <span>Proceed to Adoption Checkout 💖</span>
          </Link>
        </div>
      </aside>

      {/* Theme-based Adoption Celebration Modal */}
      {showCheckoutSuccess && (
        <div
          className="modal-backdrop open"
          style={{ zIndex: 130 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) handleCloseSuccess();
          }}
        >
          <div className="popup-dialog">
            <button
              className="modal-close-btn"
              onClick={handleCloseSuccess}
              aria-label="Close"
              type="button"
            >
              ✕
            </button>
            <div className="popup-icon-badge">☁️</div>
            <span className="card-pill-tag new-cutie" style={{ position: 'static', display: 'inline-block', marginBottom: '0.8rem' }}>
              Order Confirmed 🎉
            </span>
            <h3 className="popup-title">Adoption In Progress! 📦</h3>
            <p className="popup-desc">
              Thank you for adopting <strong>{adoptedCount}</strong> plush friends! They are being gently tucked into cloud boxes with lavender tissue paper and strawberry scent right now!
            </p>
            <div style={{ background: 'var(--pink-soft)', borderRadius: '18px', padding: '0.9rem', marginBottom: '1.5rem', fontSize: '0.9rem', fontWeight: '700', color: 'var(--pink-primary)' }}>
              🚚 Estimated Cuddle Arrival: 2 to 3 Days
            </div>
            <button
              className="popup-btn"
              onClick={handleCloseSuccess}
              type="button"
            >
              Hooray! Back to CloudPuff 💖
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
