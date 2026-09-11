'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Plushie } from '@/types/plushie';
import { useCart } from '@/context/CartContext';
import { useSound } from '@/context/SoundContext';

interface ProductCardProps {
  product: Plushie;
  onQuickView: (product: Plushie) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onQuickView }) => {
  const { wishlist, toggleWishlist } = useCart();
  const { playPop } = useSound();

  const isLoved = wishlist.includes(product.id);

  return (
    <article className="product-card" data-id={product.id}>
      <Link href={`/product/${product.id}`} className="product-thumb-wrap">
        <span className={`card-pill-tag ${product.badgeClass}`}>{product.badge}</span>
        <button
          className={`wishlist-heart-btn ${isLoved ? 'loved' : ''}`}
          title="Save to favorites"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          type="button"
        >
          {isLoved ? '❤️' : '♥'}
        </button>
        <Image
          src={product.image}
          alt={`${product.name} Plushie`}
          width={380}
          height={380}
          className="product-thumb"
        />
      </Link>

      <div className="product-info">
        <div className="squish-meter-bar">
          <span>Squish Factor</span>
          <span className="squish-score">☁️ {product.squishFactor}</span>
        </div>
        <h3 className="product-title">
          <Link href={`/product/${product.id}`}>{product.name}</Link>
        </h3>
        <p className="product-bio">
          {product.subtitle} • {product.description.substring(0, 75)}...
        </p>
        <div className="product-price-row">
          <div className="price-box">
            <span className="current-price">${product.price.toFixed(2)}</span>
            <span className="original-price">${product.originalPrice.toFixed(2)}</span>
          </div>
          <span className="shipping-pill">Ready to Ship</span>
        </div>
        <div className="card-actions">
          <button
            className="quick-view-btn"
            onClick={() => onQuickView(product)}
            type="button"
          >
            Quick Peek 👀
          </button>
          <Link
            href={`/product/${product.id}`}
            className="adopt-btn"
            onClick={playPop}
          >
            Adopt Me 💖
          </Link>
        </div>
      </div>
    </article>
  );
};
