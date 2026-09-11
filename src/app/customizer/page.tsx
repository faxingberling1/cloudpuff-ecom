'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { useSound } from '@/context/SoundContext';
import { confettiEngine } from '@/utils/confetti';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

interface CustomBase {
  id: string;
  name: string;
  species: string;
  basePrice: number;
  image: string;
  defaultBio: string;
}

const BASES: CustomBase[] = [
  {
    id: 'pip-bunny',
    name: 'Bunny Base',
    species: 'Strawberry Bunny',
    basePrice: 34.0,
    image: '/assets/hero.jpg',
    defaultBio: 'Long floppy ears, rosy cheeks, and ideal cuddle proportions.',
  },
  {
    id: 'boba-bear',
    name: 'Bear Base',
    species: 'Sleepy Bear',
    basePrice: 36.0,
    image: '/assets/bear.jpg',
    defaultBio: 'Chonky round tummy with high-density memory squish.',
  },
  {
    id: 'matcha-dino',
    name: 'Dino Base',
    species: 'Baby Stegosaurus',
    basePrice: 32.0,
    image: '/assets/dino.jpg',
    defaultBio: 'Pillowy dorsal plates and peaceful zen demeanor.',
  },
  {
    id: 'panko-axolotl',
    name: 'Axolotl Base',
    species: 'Bubble Axolotl',
    basePrice: 34.0,
    image: '/assets/axolotl.jpg',
    defaultBio: 'Frilly plush gills and aquatic dream smile.',
  },
  {
    id: 'mochi-seal',
    name: 'Seal Base',
    species: 'Round Mochi Seal',
    basePrice: 30.0,
    image: '/assets/seal.jpg',
    defaultBio: 'Aerodynamic cylindrical loaf of pure happiness.',
  },
];

const FUR_SHADES = [
  { id: 'sakura', name: 'Sakura Blush', color: '#FFB7C5', filter: 'hue-rotate(0deg)' },
  { id: 'matcha', name: 'Matcha Cream', color: '#B7E4C7', filter: 'hue-rotate(85deg) saturate(1.2)' },
  { id: 'blueberry', name: 'Blueberry Swirl', color: '#A0C4FF', filter: 'hue-rotate(185deg) saturate(1.1)' },
  { id: 'honey', name: 'Honey Peach', color: '#FFD166', filter: 'hue-rotate(35deg) saturate(1.3)' },
  { id: 'lavender', name: 'Twilight Lavender', color: '#D8B4FE', filter: 'hue-rotate(240deg) saturate(1.2)' },
];

const SCENTS = [
  { id: 'none', name: 'Natural Cloud (Unscented)', price: 0, icon: '☁️' },
  { id: 'strawberry', name: 'Warm Wild Strawberry', price: 4.0, icon: '🍓' },
  { id: 'vanilla', name: 'Vanilla Marshmallow', price: 4.0, icon: '🍦' },
  { id: 'matcha', name: 'Zen Garden Matcha', price: 4.0, icon: '🍵' },
  { id: 'lavender', name: 'Bedtime Lavender Calm', price: 4.0, icon: '🌿' },
];

const ACCESSORIES = [
  { id: 'none', name: 'Au Naturel (None)', price: 0, icon: '✨' },
  { id: 'beret', name: 'Strawberry Beret', price: 6.0, icon: '🍓' },
  { id: 'boba', name: 'Micro Boba Backpack', price: 6.0, icon: '🧋' },
  { id: 'wings', name: 'Fluffy Angel Wings', price: 6.0, icon: '👼' },
  { id: 'scarf', name: 'Cozy Knitted Scarf', price: 6.0, icon: '🧣' },
  { id: 'crown', name: 'Petal Flower Crown', price: 6.0, icon: '👑' },
];

export default function CustomizerPage() {
  const { addItem, showToast, setIsCartOpen } = useCart();
  const { playPop, playSquish, playChime } = useSound();

  const [selectedBase, setSelectedBase] = useState<CustomBase>(BASES[0]);
  const [selectedFur, setSelectedFur] = useState(FUR_SHADES[0]);
  const [selectedScent, setSelectedScent] = useState(SCENTS[1]);
  const [selectedAcc, setSelectedAcc] = useState(ACCESSORIES[1]);
  const [customName, setCustomName] = useState('My Dream Buddy');
  const [isSquishing, setIsSquishing] = useState(false);

  // Price Calculation
  const totalPrice = selectedBase.basePrice + selectedScent.price + selectedAcc.price;

  const handleTestSquish = () => {
    playSquish();
    setIsSquishing(true);
    setTimeout(() => setIsSquishing(false), 800);
  };

  const handleAdoptCustom = () => {
    playSquish();
    playChime();
    confettiEngine.burst();

    // Add base product to cart
    addItem(selectedBase.id, 1);

    showToast(`🎉 Custom creation "${customName}" adopted! Added to cuddle basket.`);
    setIsCartOpen(true);
  };

  return (
    <div className="page-wrapper">
      <Navbar />

      <main className="customizer-page container">
        {/* Studio Banner */}
        <div className="customizer-header-banner">
          <span className="studio-badge">🧸🎨 Build-A-Cloud Studio</span>
          <h1 className="studio-title">Design Your Bespoke Cuddle Friend</h1>
          <p className="studio-subtitle">
            Craft a one-of-a-kind emotional support plushie handcrafted with personalized fur shades, aromatherapy scent, and adorable accessories.
          </p>
        </div>

        <div className="customizer-workbench-grid">
          {/* Left Column: Interactive Live Preview Stage */}
          <div className="studio-preview-card">
            <div className="preview-canvas-wrap">
              <div
                className={`preview-plushie-stage ${isSquishing ? 'squishing-active' : ''}`}
                style={{ filter: selectedFur.filter }}
              >
                <Image
                  src={selectedBase.image}
                  alt={selectedBase.name}
                  width={420}
                  height={420}
                  priority
                  className="preview-plushie-img"
                />
              </div>

              {/* Accessory Overlay Badge */}
              {selectedAcc.id !== 'none' && (
                <div className="acc-floating-badge" title={selectedAcc.name}>
                  <span>{selectedAcc.icon}</span>
                </div>
              )}

              {/* Scent Puff Badge */}
              {selectedScent.id !== 'none' && (
                <div className="scent-floating-badge" title={selectedScent.name}>
                  <span>{selectedScent.icon}</span>
                  <span className="scent-label">{selectedScent.name.split(' ')[0]}</span>
                </div>
              )}

              {/* Engraved Collar Tag */}
              <div className="engraved-tag-badge">
                <span className="tag-ring">💍</span>
                <span className="tag-text">{customName || 'Forever Friend'}</span>
              </div>
            </div>

            {/* Test Squish Button */}
            <div className="preview-action-row">
              <button
                className="btn-test-squish"
                onClick={handleTestSquish}
                type="button"
              >
                ☁️ Test Squish Dynamics
              </button>
            </div>

            {/* Live Spec Summary Card */}
            <div className="studio-spec-summary">
              <div className="spec-row">
                <span>Base Buddy:</span>
                <strong>{selectedBase.species} (${selectedBase.basePrice.toFixed(2)})</strong>
              </div>
              <div className="spec-row">
                <span>Fur Shade:</span>
                <strong style={{ color: selectedFur.color }}>● {selectedFur.name}</strong>
              </div>
              <div className="spec-row">
                <span>Aroma Infusion:</span>
                <strong>{selectedScent.name} (+${selectedScent.price.toFixed(2)})</strong>
              </div>
              <div className="spec-row">
                <span>Mini Accessory:</span>
                <strong>{selectedAcc.name} (+${selectedAcc.price.toFixed(2)})</strong>
              </div>
              <div className="spec-row tag-spec">
                <span>Engraved Tag:</span>
                <strong>&ldquo;{customName || 'Untagged'}&rdquo; (Free)</strong>
              </div>

              <div className="studio-total-row">
                <span>Total Adoption Fee:</span>
                <strong className="studio-final-price">${totalPrice.toFixed(2)}</strong>
              </div>

              <button
                className="btn-primary studio-adopt-btn"
                onClick={handleAdoptCustom}
                type="button"
              >
                Adopt Custom &ldquo;{customName}&rdquo; 💖
              </button>
            </div>
          </div>

          {/* Right Column: Customization Station Controls */}
          <div className="studio-controls-column">
            {/* Step 1: Base Plushie */}
            <div className="studio-control-card">
              <div className="step-header">
                <span className="step-num">1</span>
                <h3>Select Base Species</h3>
              </div>
              <div className="bases-selector-grid">
                {BASES.map((b) => (
                  <button
                    key={b.id}
                    className={`base-select-card ${selectedBase.id === b.id ? 'active' : ''}`}
                    onClick={() => {
                      playPop();
                      setSelectedBase(b);
                    }}
                    type="button"
                  >
                    <Image src={b.image} alt={b.name} width={64} height={64} className="base-thumb" />
                    <strong>{b.name}</strong>
                    <span className="base-price">${b.basePrice.toFixed(2)}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Fur Shade */}
            <div className="studio-control-card">
              <div className="step-header">
                <span className="step-num">2</span>
                <h3>Pick Fur Hue & Mood</h3>
              </div>
              <div className="fur-color-palette">
                {FUR_SHADES.map((fur) => (
                  <button
                    key={fur.id}
                    className={`fur-color-btn ${selectedFur.id === fur.id ? 'active' : ''}`}
                    onClick={() => {
                      playPop();
                      setSelectedFur(fur);
                    }}
                    title={fur.name}
                    type="button"
                  >
                    <span className="swatch" style={{ background: fur.color }}></span>
                    <span className="swatch-label">{fur.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 3: Scent Infusion */}
            <div className="studio-control-card">
              <div className="step-header">
                <span className="step-num">3</span>
                <h3>Aromatherapy Scent Capsule</h3>
              </div>
              <div className="scents-grid">
                {SCENTS.map((scent) => (
                  <button
                    key={scent.id}
                    className={`scent-select-card ${selectedScent.id === scent.id ? 'active' : ''}`}
                    onClick={() => {
                      playPop();
                      setSelectedScent(scent);
                    }}
                    type="button"
                  >
                    <span className="scent-emoji">{scent.icon}</span>
                    <div className="scent-info">
                      <strong>{scent.name}</strong>
                      <span className="scent-cost">
                        {scent.price === 0 ? 'Included' : `+$${scent.price.toFixed(2)}`}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 4: Mini Accessories */}
            <div className="studio-control-card">
              <div className="step-header">
                <span className="step-num">4</span>
                <h3>Dress-Up Miniature Accessories</h3>
              </div>
              <div className="accessories-grid">
                {ACCESSORIES.map((acc) => (
                  <button
                    key={acc.id}
                    className={`acc-select-card ${selectedAcc.id === acc.id ? 'active' : ''}`}
                    onClick={() => {
                      playPop();
                      setSelectedAcc(acc);
                    }}
                    type="button"
                  >
                    <span className="acc-emoji">{acc.icon}</span>
                    <div className="acc-info">
                      <strong>{acc.name}</strong>
                      <span className="acc-cost">
                        {acc.price === 0 ? 'None' : `+$${acc.price.toFixed(2)}`}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 5: Custom Engraved Collar Tag */}
            <div className="studio-control-card">
              <div className="step-header">
                <span className="step-num">5</span>
                <h3>Engraved Metallic Collar Tag</h3>
              </div>
              <p className="tag-instruction">
                Give your companion their official name (printed on their adoption collar & certificate):
              </p>
              <div className="tag-input-wrap">
                <span className="tag-icon">🏷️</span>
                <input
                  type="text"
                  className="tag-input"
                  maxLength={16}
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g. Princess Peaches"
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
