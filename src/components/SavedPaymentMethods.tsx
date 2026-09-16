'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSound } from '@/context/SoundContext';
import { useCart } from '@/context/CartContext';
import { confettiEngine } from '@/utils/confetti';
import {
  BrandIconRenderer,
  AppleLogo,
  GoogleLogo,
  PayPalLogo,
} from '@/components/PaymentBrandLogos';

export interface PaymentMethodItem {
  id: string;
  brand: string;
  cardholderName?: string | null;
  last4: string;
  exp: string;
  isDefault: boolean;
  icon: string;
  rawBrand?: string;
}

const DEFAULT_FALLBACK_CARDS: PaymentMethodItem[] = [
  {
    id: 'card-1',
    brand: 'CloudPay / Apple Pay',
    cardholderName: 'Arsalan Abbas',
    last4: 'Apple Wallet',
    exp: 'Synced',
    isDefault: false,
    icon: '🍎',
  },
  {
    id: 'card-2',
    brand: 'Visa Snuggle Card',
    cardholderName: 'Arsalan Abbas',
    last4: '4242',
    exp: '08/29',
    isDefault: true,
    icon: '💳',
  },
  {
    id: 'card-3',
    brand: 'Mastercard Fluff',
    cardholderName: 'Arsalan Abbas',
    last4: '8819',
    exp: '12/27',
    isDefault: false,
    icon: '💳',
  },
];

interface SavedPaymentMethodsProps {
  idPrefix?: string;
  onMethodsChange?: (methods: PaymentMethodItem[]) => void;
}

export function SavedPaymentMethods({
  idPrefix = 'wallet',
  onMethodsChange,
}: SavedPaymentMethodsProps) {
  const { playPop, playChime, playSquish } = useSound();
  const { showToast } = useCart();

  const [cards, setCards] = useState<PaymentMethodItem[]>(DEFAULT_FALLBACK_CARDS);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDbConnected, setIsDbConnected] = useState<boolean>(false);

  // Modals state
  const [isAddCardOpen, setIsAddCardOpen] = useState<boolean>(false);
  const [cardToDelete, setCardToDelete] = useState<PaymentMethodItem | null>(null);
  const [cardToEdit, setCardToEdit] = useState<PaymentMethodItem | null>(null);

  // Add Card Form State
  const [newCardNumber, setNewCardNumber] = useState('');
  const [newCardholderName, setNewCardholderName] = useState('');
  const [newCardExp, setNewCardExp] = useState('');
  const [newCardCvc, setNewCardCvc] = useState('');
  const [newCardNickname, setNewCardNickname] = useState('');
  const [newCardIsDefault, setNewCardIsDefault] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit Card Form State
  const [editNickname, setEditNickname] = useState('');
  const [editExp, setEditExp] = useState('');

  // Load cards from PostgreSQL API with localStorage cache fallback
  const fetchPaymentMethods = useCallback(async () => {
    // 1. Check local cache first for instant render
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('cloudpuff_saved_cards');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setCards(parsed);
          }
        } catch {
          // ignore cache parse error
        }
      }
    }

    try {
      const res = await fetch('/api/payment-methods');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.methods) && data.methods.length > 0) {
          setCards(data.methods);
          setIsDbConnected(true);
          if (typeof window !== 'undefined') {
            localStorage.setItem('cloudpuff_saved_cards', JSON.stringify(data.methods));
          }
          if (onMethodsChange) onMethodsChange(data.methods);
        }
      }
    } catch (err) {
      console.warn('Database offline or unreachable, using local store:', err);
    } finally {
      setIsLoading(false);
    }
  }, [onMethodsChange]);

  useEffect(() => {
    fetchPaymentMethods();

    const handleOpenExternal = () => {
      setIsAddCardOpen(true);
    };

    window.addEventListener('cloudpuff_open_add_card', handleOpenExternal);
    return () => {
      window.removeEventListener('cloudpuff_open_add_card', handleOpenExternal);
    };
  }, [fetchPaymentMethods]);

  // Sync to localStorage and dispatch update event whenever cards change
  const updateLocalState = (updatedList: PaymentMethodItem[]) => {
    setCards(updatedList);
    if (typeof window !== 'undefined') {
      localStorage.setItem('cloudpuff_saved_cards', JSON.stringify(updatedList));
      window.dispatchEvent(
        new CustomEvent('cloudpuff_payment_methods_updated', { detail: updatedList })
      );
    }
    if (onMethodsChange) onMethodsChange(updatedList);
  };

  // Detect Brand from card number
  const detectBrand = (num: string) => {
    const clean = num.replace(/\D/g, '');
    if (clean.startsWith('4')) return { brand: 'Visa', icon: '💳' };
    if (/^(5[1-5]|2[2-7])/.test(clean)) return { brand: 'Mastercard', icon: '💳' };
    if (/^3[47]/.test(clean)) return { brand: 'American Express', icon: '✨' };
    if (/^6(011|5)/.test(clean)) return { brand: 'Discover', icon: '🌟' };
    return { brand: 'Credit Card', icon: '💳' };
  };

  // Set Default Method
  const handleSetDefault = async (cardId: string) => {
    playPop();
    const targetCard = cards.find((c) => c.id === cardId);

    // Optimistic UI update
    const updated = cards.map((c) => ({
      ...c,
      isDefault: c.id === cardId,
    }));
    updateLocalState(updated);
    playChime();
    confettiEngine.burst();
    showToast(`💳 "${targetCard?.brand || 'Card'}" is now your default payment method!`);

    // Sync to PostgreSQL DB
    try {
      await fetch('/api/payment-methods', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: cardId, action: 'set_default' }),
      });
      setIsDbConnected(true);
    } catch (err) {
      console.warn('Failed to sync default card to database:', err);
    }
  };

  // Trigger delete confirmation modal
  const handlePromptDelete = (card: PaymentMethodItem) => {
    if (card.isDefault) {
      showToast('⚠️ Default Method / Primary card cannot be removed. Designate another card as default first.');
      return;
    }
    playSquish();
    setCardToDelete(card);
  };

  // Confirm Card Deletion
  const handleConfirmDelete = async () => {
    if (!cardToDelete || cardToDelete.isDefault) {
      showToast('⚠️ Default Method / Primary card cannot be removed.');
      setCardToDelete(null);
      return;
    }
    playSquish();

    const idToRemove = cardToDelete.id;
    const updated = cards.filter((c) => c.id !== idToRemove);

    updateLocalState(updated);
    setCardToDelete(null);
    showToast('🗑️ Payment card removed from your wallet.');

    // Sync to PostgreSQL DB
    try {
      await fetch(`/api/payment-methods?id=${encodeURIComponent(idToRemove)}`, {
        method: 'DELETE',
      });
      setIsDbConnected(true);
    } catch (err) {
      console.warn('Failed to sync deletion to database:', err);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (card: PaymentMethodItem) => {
    playPop();
    setCardToEdit(card);
    setEditNickname(card.brand);
    setEditExp(card.exp === 'Synced' ? '' : card.exp);
  };

  // Confirm Edit
  const handleConfirmEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardToEdit) return;

    const trimmedNickname = editNickname.trim() || cardToEdit.brand;
    const newExp = editExp.trim() || cardToEdit.exp;

    const updated = cards.map((c) =>
      c.id === cardToEdit.id ? { ...c, brand: trimmedNickname, exp: newExp } : c
    );
    updateLocalState(updated);
    setCardToEdit(null);
    playChime();
    showToast(`✨ Updated "${trimmedNickname}" details!`);

    // Sync to PostgreSQL DB
    try {
      await fetch('/api/payment-methods', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: cardToEdit.id,
          action: 'update_card',
          cardNickname: trimmedNickname,
          exp: newExp,
        }),
      });
      setIsDbConnected(true);
    } catch (err) {
      console.warn('Failed to sync edit to database:', err);
    }
  };

  // Quick 1-Click Wallet Add
  const handleQuickAddWallet = async (type: 'applepay' | 'googlepay' | 'paypal') => {
    playPop();
    setIsSubmitting(true);

    const configs = {
      applepay: {
        brand: 'CloudPay / Apple Pay',
        last4: 'Apple Wallet',
        exp: 'Synced',
        icon: '🍎',
      },
      googlepay: {
        brand: 'Google Pay Fluff',
        last4: 'Google Wallet',
        exp: 'Synced',
        icon: '🌐',
      },
      paypal: {
        brand: 'PayPal Snuggle Account',
        last4: 'PayPal Express',
        exp: 'Connected',
        icon: '🅿️',
      },
    };

    const config = configs[type];
    const newId = `card-${Date.now()}`;
    const newCard: PaymentMethodItem = {
      id: newId,
      brand: config.brand,
      cardholderName: 'Arsalan Abbas',
      last4: config.last4,
      exp: config.exp,
      isDefault: cards.length === 0,
      icon: config.icon,
    };

    const updated = [...cards, newCard];
    updateLocalState(updated);
    setIsAddCardOpen(false);
    setIsSubmitting(false);
    playChime();
    confettiEngine.burst();
    showToast(`✨ Connected ${config.brand} to your sanctuary wallet!`);

    // Sync to PostgreSQL DB
    try {
      await fetch('/api/payment-methods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand: config.brand,
          cardholderName: 'Arsalan Abbas',
          last4: config.last4,
          exp: config.exp,
          isDefault: newCard.isDefault,
          icon: config.icon,
          cardNickname: config.brand,
        }),
      });
      setIsDbConnected(true);
    } catch (err) {
      console.warn('Failed to sync new wallet method to database:', err);
    }
  };

  // Submit Add Card Form
  const handleAddCardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanDigits = newCardNumber.replace(/\D/g, '');

    if (cleanDigits.length < 15) {
      showToast('⚠️ Please enter a valid 15 or 16-digit card number');
      return;
    }

    if (!newCardExp || !/^\d{2}\/\d{2}$/.test(newCardExp)) {
      showToast('⚠️ Please enter expiration in MM/YY format');
      return;
    }

    const [expMonth, expYear] = newCardExp.split('/').map((s) => parseInt(s, 10));
    if (expMonth < 1 || expMonth > 12) {
      showToast('⚠️ Expiration month must be between 01 and 12');
      return;
    }

    const currentYear = new Date().getFullYear() % 100;
    const currentMonth = new Date().getMonth() + 1;
    if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
      showToast('⚠️ Card has expired. Please enter a valid expiration date');
      return;
    }

    if (newCardCvc.length < 3) {
      showToast('⚠️ Please enter a 3 or 4-digit CVC code');
      return;
    }

    setIsSubmitting(true);
    const { brand: detectedBrand, icon: detectedIcon } = detectBrand(cleanDigits);
    const finalBrandName =
      newCardNickname.trim() || `${detectedBrand} ${cleanDigits.startsWith('4') ? 'Snuggle' : 'Fluff'} Card`;

    const shouldBeDefault = newCardIsDefault || cards.length === 0;
    const newId = `card-${Date.now()}`;

    const newCard: PaymentMethodItem = {
      id: newId,
      brand: finalBrandName,
      cardholderName: newCardholderName.trim() || 'Arsalan Abbas',
      last4: cleanDigits.slice(-4),
      exp: newCardExp,
      isDefault: shouldBeDefault,
      icon: detectedIcon,
    };

    let updated = [...cards];
    if (shouldBeDefault) {
      updated = updated.map((c) => ({ ...c, isDefault: false }));
    }
    updated.push(newCard);

    updateLocalState(updated);
    setIsAddCardOpen(false);
    setNewCardNumber('');
    setNewCardholderName('');
    setNewCardExp('');
    setNewCardCvc('');
    setNewCardNickname('');
    setNewCardIsDefault(false);
    setIsSubmitting(false);

    playChime();
    confettiEngine.burst();
    showToast(`💳 Added ${finalBrandName} to your sanctuary wallet!`);

    // Sync to PostgreSQL DB
    try {
      await fetch('/api/payment-methods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand: detectedBrand,
          cardholderName: newCard.cardholderName,
          last4: newCard.last4,
          exp: newCard.exp,
          isDefault: shouldBeDefault,
          icon: detectedIcon,
          cardNickname: finalBrandName,
        }),
      });
      setIsDbConnected(true);
    } catch (err) {
      console.warn('Failed to sync new card to database:', err);
    }
  };

  const detectedInfo = detectBrand(newCardNumber);

  return (
    <div className="dash-box preferences-card-box" id={`${idPrefix}-wallet-section`}>
      <div className="dash-box-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
            <span className="dash-box-pill">💳 WALLET</span>
            {isDbConnected && (
              <span
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  color: '#10B981',
                  background: 'rgba(16, 185, 129, 0.12)',
                  padding: '0.1rem 0.5rem',
                  borderRadius: '9999px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                }}
                title="Connected to PostgreSQL Database"
              >
                ● Cloud Sync
              </span>
            )}
          </div>
          <h3 className="dash-box-title">Saved Payment Methods</h3>
        </div>
        <button
          type="button"
          className="admin-action-btn-small"
          onClick={() => {
            playPop();
            setIsAddCardOpen(true);
          }}
        >
          + Add Card 💳
        </button>
      </div>

      <p className="preferences-sub-desc">
        Your payment credentials are encrypted using AES-256 cloud tokenization. We never store raw CVV numbers.
      </p>

      {/* Cards List */}
      <div className="saved-cards-list">
        {cards.length === 0 && !isLoading ? (
          <div
            style={{
              padding: '2.5rem 1rem',
              textAlign: 'center',
              background: 'rgba(0, 0, 0, 0.02)',
              borderRadius: '16px',
              border: '2px dashed rgba(0, 0, 0, 0.08)',
            }}
          >
            <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.5rem' }}>💳</span>
            <strong style={{ display: 'block', fontSize: '1rem', color: 'var(--text-dark)' }}>
              No payment methods saved yet
            </strong>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.3rem', marginBottom: '1.2rem' }}>
              Add a credit card or connect Apple Pay for instant 1-click plushie adoptions!
            </p>
            <button
              type="button"
              className="btn-primary"
              style={{ fontSize: '0.85rem', padding: '0.5rem 1.2rem' }}
              onClick={() => {
                playPop();
                setIsAddCardOpen(true);
              }}
            >
              + Add First Card 💳
            </button>
          </div>
        ) : (
          cards.map((card) => (
            <div
              key={card.id}
              className={`payment-card-chip ${card.isDefault ? 'default-card' : ''}`}
            >
              <div className="card-chip-top">
                <span className="card-chip-icon">
                  <BrandIconRenderer brand={card.brand} icon={card.icon} size={24} />
                </span>
                {card.isDefault && <span className="default-pill">★ Default Method</span>}
              </div>

              <div
                className="card-chip-brand"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              >
                <span>{card.brand}</span>
                <button
                  type="button"
                  onClick={() => handleOpenEdit(card)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'rgba(255, 255, 255, 0.65)',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    padding: '0.1rem 0.3rem',
                  }}
                  title="Edit card nickname / expiry"
                >
                  ✏️ Edit
                </button>
              </div>

              <div className="card-chip-number">•••• •••• •••• {card.last4}</div>

              <div className="card-chip-bottom">
                <span className="card-exp">Expires: {card.exp}</span>
                <div className="card-actions-group">
                  {!card.isDefault && (
                    <button
                      type="button"
                      className="btn-card-action"
                      onClick={() => handleSetDefault(card.id)}
                    >
                      Set Default
                    </button>
                  )}
                  {!card.isDefault ? (
                    <button
                      type="button"
                      className="btn-card-action delete"
                      onClick={() => handlePromptDelete(card)}
                      title="Remove payment card"
                    >
                      Remove
                    </button>
                  ) : (
                    <span
                      style={{
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        color: '#F472B6',
                        background: 'rgba(244, 114, 182, 0.15)',
                        border: '1px solid rgba(244, 114, 182, 0.35)',
                        padding: '0.2rem 0.65rem',
                        borderRadius: '9999px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        userSelect: 'none',
                      }}
                      title="Default Method / Primary card cannot be removed. Designate another card as default first."
                    >
                      🔒 Primary Method
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {cardToDelete && (
        <div
          className="modal-backdrop open"
          onClick={() => setCardToDelete(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="dashboard-modal-card"
            style={{ maxWidth: '420px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="two-factor-modal-header">
              <span className="modal-top-pill" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#EF4444' }}>
                ⚠️ Confirm Removal
              </span>
              <h3 className="modal-title">Remove Payment Method?</h3>
              <p className="modal-subtitle">
                Are you sure you want to remove <strong>{cardToDelete.brand}</strong> (•••• {cardToDelete.last4}) from your sanctuary wallet?
              </p>
            </div>

            {cardToDelete.isDefault && cards.length > 1 && (
              <div
                style={{
                  background: 'rgba(244, 114, 182, 0.15)',
                  border: '1px solid rgba(244, 114, 182, 0.3)',
                  borderRadius: '12px',
                  padding: '0.75rem 1rem',
                  fontSize: '0.82rem',
                  color: 'var(--text-dark)',
                  margin: '1rem 0',
                }}
              >
                ★ <strong>Note:</strong> This is currently your default payment method. Removing it will automatically designate another card as default.
              </div>
            )}

            <div className="modal-actions-row" style={{ marginTop: '1.5rem', display: 'flex', gap: '0.8rem' }}>
              <button
                type="button"
                className="btn-primary"
                style={{ background: '#EF4444', borderColor: '#DC2626' }}
                onClick={handleConfirmDelete}
              >
                Yes, Remove Card 🗑️
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setCardToDelete(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Card Modal */}
      {cardToEdit && (
        <div
          className="modal-backdrop open"
          onClick={() => setCardToEdit(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="dashboard-modal-card"
            style={{ maxWidth: '440px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close-btn"
              onClick={() => setCardToEdit(null)}
              type="button"
            >
              ✕
            </button>
            <div className="two-factor-modal-header">
              <span className="modal-top-pill">✏️ Edit Payment Method</span>
              <h3 className="modal-title">Edit Card Details</h3>
              <p className="modal-subtitle">
                Update card nickname or expiration date for (•••• {cardToEdit.last4}).
              </p>
            </div>

            <form onSubmit={handleConfirmEdit} className="modal-form" style={{ marginTop: '1.2rem' }}>
              <div className="form-field-group">
                <label className="field-label">Card Nickname / Label</label>
                <input
                  type="text"
                  className="form-input"
                  value={editNickname}
                  onChange={(e) => setEditNickname(e.target.value)}
                  placeholder="e.g. Visa Snuggle Card"
                  required
                />
              </div>

              {cardToEdit.exp !== 'Synced' && (
                <div className="form-field-group" style={{ marginTop: '1rem' }}>
                  <label className="field-label">Expiration Date (MM/YY)</label>
                  <input
                    type="text"
                    className="form-input font-mono"
                    value={editExp}
                    maxLength={5}
                    onChange={(e) => {
                      let v = e.target.value.replace(/\D/g, '').slice(0, 4);
                      if (v.length > 2) v = v.slice(0, 2) + '/' + v.slice(2);
                      setEditExp(v);
                    }}
                    placeholder="MM/YY"
                  />
                </div>
              )}

              <div className="modal-actions-row" style={{ marginTop: '1.5rem', display: 'flex', gap: '0.8rem' }}>
                <button type="submit" className="btn-primary">
                  Save Changes ✨
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setCardToEdit(null)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Payment Method Modal with Live Card Preview */}
      {isAddCardOpen && (
        <div
          className="modal-backdrop open"
          onClick={() => setIsAddCardOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="dashboard-modal-card add-card-modal-card"
            style={{ maxWidth: '520px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close-btn"
              onClick={() => setIsAddCardOpen(false)}
              type="button"
            >
              ✕
            </button>

            <div className="two-factor-modal-header">
              <span className="modal-top-pill">💳 Encrypted Sanctuary Wallet</span>
              <h3 className="modal-title">Add Payment Method</h3>
              <p className="modal-subtitle">
                Add a credit or debit card for 1-click plushie adoptions and nursery supplies.
              </p>
            </div>

            {/* Quick 1-Click Connect Buttons */}
            <div style={{ margin: '1rem 0' }}>
              <span style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Fast Express Connect:
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.6rem', marginTop: '0.4rem' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  style={{ fontSize: '0.82rem', padding: '0.55rem 0.5rem', justifyContent: 'center', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}
                  onClick={() => handleQuickAddWallet('applepay')}
                >
                  <AppleLogo size={16} /> Apple Pay
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  style={{ fontSize: '0.82rem', padding: '0.55rem 0.5rem', justifyContent: 'center', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}
                  onClick={() => handleQuickAddWallet('googlepay')}
                >
                  <GoogleLogo size={16} /> Google Pay
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  style={{ fontSize: '0.82rem', padding: '0.55rem 0.5rem', justifyContent: 'center', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}
                  onClick={() => handleQuickAddWallet('paypal')}
                >
                  <PayPalLogo size={16} /> PayPal
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', margin: '1rem 0' }}>
              <div style={{ flex: 1, height: '1px', background: 'rgba(0, 0, 0, 0.08)' }} />
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>OR ENTER CARD DETAILS</span>
              <div style={{ flex: 1, height: '1px', background: 'rgba(0, 0, 0, 0.08)' }} />
            </div>

            {/* Live Interactive Card Preview */}
            <div
              className="payment-card-chip"
              style={{
                marginBottom: '1.2rem',
                transform: 'scale(0.98)',
                boxShadow: '0 12px 30px rgba(0, 0, 0, 0.25)',
              }}
            >
              <div className="card-chip-top">
                <span className="card-chip-icon">
                  <BrandIconRenderer brand={detectedInfo.brand} size={24} />
                </span>
                <span className="default-pill" style={{ background: 'rgba(255, 255, 255, 0.2)' }}>
                  {detectedInfo.brand}
                </span>
              </div>

              <div className="card-chip-brand">
                {newCardNickname.trim() || newCardholderName.trim() || 'Plushie Guardian'}
              </div>

              <div className="card-chip-number">
                {newCardNumber
                  ? (newCardNumber + ' •••• •••• •••• ••••').slice(0, 19)
                  : '•••• •••• •••• ••••'}
              </div>

              <div className="card-chip-bottom">
                <span className="card-exp">
                  Expires: {newCardExp || 'MM/YY'}
                </span>
                <span style={{ fontFamily: 'monospace', fontSize: '0.76rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                  CVC: {newCardCvc ? '•••' : '•••'}
                </span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleAddCardSubmit} className="modal-form">
              <div className="form-field-group">
                <label className="field-label">Cardholder Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Arsalan Abbas"
                  value={newCardholderName}
                  onChange={(e) => setNewCardholderName(e.target.value)}
                  required
                />
              </div>

              <div className="form-field-group" style={{ marginTop: '0.8rem' }}>
                <label className="field-label">
                  Card Number <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>({detectedInfo.brand})</span>
                </label>
                <input
                  type="text"
                  className="form-input font-mono"
                  placeholder="4000 1234 5678 9010"
                  maxLength={19}
                  value={newCardNumber}
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, '').slice(0, 16);
                    const formatted = v.match(/.{1,4}/g)?.join(' ') || v;
                    setNewCardNumber(formatted);
                  }}
                  required
                />
              </div>

              <div className="form-grid-two" style={{ marginTop: '0.8rem' }}>
                <div className="form-field-group">
                  <label className="field-label">Expiration (MM/YY)</label>
                  <input
                    type="text"
                    className="form-input font-mono"
                    placeholder="08/29"
                    maxLength={5}
                    value={newCardExp}
                    onChange={(e) => {
                      let v = e.target.value.replace(/\D/g, '').slice(0, 4);
                      if (v.length > 2) v = v.slice(0, 2) + '/' + v.slice(2);
                      setNewCardExp(v);
                    }}
                    required
                  />
                </div>

                <div className="form-field-group">
                  <label className="field-label">CVC / Security Code</label>
                  <input
                    type="password"
                    className="form-input font-mono"
                    placeholder="123"
                    maxLength={4}
                    value={newCardCvc}
                    onChange={(e) => setNewCardCvc(e.target.value.replace(/\D/g, ''))}
                    required
                  />
                </div>
              </div>

              <div className="form-field-group" style={{ marginTop: '0.8rem' }}>
                <label className="field-label">
                  Card Nickname <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>(Optional)</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Visa Snuggle Card, Everyday Fluff"
                  value={newCardNickname}
                  onChange={(e) => setNewCardNickname(e.target.value)}
                />
              </div>

              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  cursor: 'pointer',
                  margin: '1.2rem 0',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  color: 'var(--text-dark)',
                }}
              >
                <input
                  type="checkbox"
                  checked={newCardIsDefault}
                  onChange={(e) => setNewCardIsDefault(e.target.checked)}
                  style={{ width: '18px', height: '18px', accentColor: '#F472B6' }}
                />
                <span>Set as default payment method ★</span>
              </label>

              <div className="modal-actions-row">
                <button type="submit" className="btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Securing...' : 'Save Card Securely 💳'}
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setIsAddCardOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
