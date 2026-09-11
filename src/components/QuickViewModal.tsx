'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Plushie } from '@/types/plushie';
import { useCart } from '@/context/CartContext';
import { useSound } from '@/context/SoundContext';
import { confettiEngine } from '@/utils/confetti';

interface QuickViewModalProps {
  product: Plushie | null;
  onClose: () => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({ product, onClose }) => {
  const [qty, setQty] = useState(1);
  const { addItem } = useCart();
  const { playPop } = useSound();

  if (!product) return null;

  const handleQtyChange = (delta: number) => {
    playPop();
    setQty(prev => Math.max(1, prev + delta));
  };

  const handleAdopt = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    confettiEngine.burst(rect.left + rect.width / 2, rect.top + rect.height / 2);
    addItem(product.id, qty);
    onClose();
  };

  return (
    <div
      className="modal-backdrop open"
      id="quick-view-modal"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-dialog">
        <button
          className="modal-close-btn"
          onClick={onClose}
          aria-label="Close quick view"
          type="button"
        >
          ✕
        </button>

        <div className="modal-grid">
          <Link
            href={`/product/${product.id}`}
            onClick={onClose}
            className="modal-img-wrap"
            title={`View full details for ${product.name}`}
            style={{ display: 'block', cursor: 'pointer' }}
          >
            <Image
              src={product.image.startsWith('/') || product.image.startsWith('http') ? product.image : `/${product.image}`}
              alt={product.name}
              fill
              style={{ objectFit: 'cover' }}
              className="modal-img"
            />
          </Link>
          <div className="modal-body">
            <span className="modal-badge">{product.badge}</span>
            <h2 className="modal-title">
              <Link
                href={`/product/${product.id}`}
                onClick={onClose}
                style={{ textDecoration: 'none', color: 'inherit' }}
                title={`View ${product.name} product page`}
              >
                {product.name}
              </Link>
            </h2>
            <div className="modal-price">
              ${product.price.toFixed(2)}{' '}
              <span className="original-price" style={{ fontSize: '1.1rem', marginLeft: '0.5rem' }}>
                ${product.originalPrice.toFixed(2)}
              </span>
            </div>
            <p className="modal-desc">{product.description}</p>

            <div className="modal-specs-list">
              <div className="spec-item">
                <strong>Squish Score</strong>
                <span>☁️ {product.squishFactor}</span>
              </div>
              <div className="spec-item">
                <strong>Dimensions</strong>
                <span>{product.dimensions}</span>
              </div>
              <div className="spec-item">
                <strong>Outer Material</strong>
                <span>{product.material}</span>
              </div>
              <div className="spec-item">
                <strong>Care Instructions</strong>
                <span>{product.care}</span>
              </div>
            </div>

            <div className="modal-actions">
              <div className="modal-qty-selector">
                <button
                  className="modal-qty-btn"
                  onClick={() => handleQtyChange(-1)}
                  type="button"
                >
                  -
                </button>
                <span className="modal-qty-val">{qty}</span>
                <button
                  className="modal-qty-btn"
                  onClick={() => handleQtyChange(1)}
                  type="button"
                >
                  +
                </button>
              </div>
              <button
                className="btn-primary"
                style={{ flex: 1 }}
                onClick={handleAdopt}
                type="button"
              >
                Adopt & Cuddle (${(product.price * qty).toFixed(2)}) 💖
              </button>
            </div>

            <div style={{ marginTop: '0.75rem', textAlign: 'center' }}>
              <Link
                href={`/product/${product.id}`}
                onClick={onClose}
                className="btn-secondary"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%',
                  textDecoration: 'none',
                  padding: '0.65rem 1rem',
                  fontSize: '0.9rem',
                }}
              >
                View Full Product Page & Story 📖 →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
