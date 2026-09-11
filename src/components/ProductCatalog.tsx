'use client';

import React, { useState } from 'react';
import { PLUSHIES } from '@/data/plushies';
import { Category, Plushie } from '@/types/plushie';
import { ProductCard } from '@/components/ProductCard';
import { useSound } from '@/context/SoundContext';

interface ProductCatalogProps {
  onQuickView: (product: Plushie) => void;
}

export const ProductCatalog: React.FC<ProductCatalogProps> = ({ onQuickView }) => {
  const [activeCategory, setActiveCategory] = useState<Category>('all');
  const { playPop } = useSound();

  const handleCategoryChange = (cat: Category) => {
    playPop();
    setActiveCategory(cat);
  };

  const filtered = activeCategory === 'all'
    ? PLUSHIES
    : PLUSHIES.filter(p => p.category === activeCategory);

  return (
    <section className="products-section" id="shop-section">
      <div className="container">
        <div className="section-header">
          <span className="section-subtitle-pill">🌸 Ready For Adoption</span>
          <h2 className="section-title">Meet the CloudPuff Squad</h2>
          <p className="section-desc">
            Each plush friend arrives with their personalized Adoption Certificate, secret collectible sticker sheet, and endless snuggles.
          </p>
        </div>

        {/* Category Filters */}
        <div className="filter-bar">
          <button
            className={`filter-btn ${activeCategory === 'all' ? 'active' : ''}`}
            onClick={() => handleCategoryChange('all')}
            type="button"
          >
            All Cuties (6)
          </button>
          <button
            className={`filter-btn ${activeCategory === 'kawaii' ? 'active' : ''}`}
            onClick={() => handleCategoryChange('kawaii')}
            type="button"
          >
            Kawaii Classics 🍓
          </button>
          <button
            className={`filter-btn ${activeCategory === 'dream' ? 'active' : ''}`}
            onClick={() => handleCategoryChange('dream')}
            type="button"
          >
            Dream Paws 🐾
          </button>
          <button
            className={`filter-btn ${activeCategory === 'sea' ? 'active' : ''}`}
            onClick={() => handleCategoryChange('sea')}
            type="button"
          >
            Sea Cuties 🌊
          </button>
          <button
            className={`filter-btn ${activeCategory === 'prehistoric' ? 'active' : ''}`}
            onClick={() => handleCategoryChange('prehistoric')}
            type="button"
          >
            Prehistoric Puffs 🦕
          </button>
        </div>

        {/* Product Cards Grid */}
        <div className="products-grid" id="products-grid">
          {filtered.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onQuickView={onQuickView}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
