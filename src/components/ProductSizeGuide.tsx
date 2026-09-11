'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Plushie } from '@/types/plushie';
import { useSound } from '@/context/SoundContext';

interface ProductSizeGuideProps {
  plushie: Plushie;
}

type PlushieScale = 'mini' | 'classic' | 'jumbo';
type ComparisonItem = 'pillow' | 'cat' | 'laptop' | 'switch' | 'mug';

export const ProductSizeGuide: React.FC<ProductSizeGuideProps> = ({ plushie }) => {
  const { playPop, playSquish } = useSound();
  const [plushieScale, setPlushieScale] = useState<PlushieScale>('classic');
  const [comparisonItem, setComparisonItem] = useState<ComparisonItem>('pillow');

  const scaleSpecs = {
    mini: {
      name: 'Mini Pocket',
      inches: 6,
      cm: 15,
      weight: '140g',
      hugLevel: 'Palm Hold 🖐️',
      pixelHeight: 85,
      sittingInches: '4.5"',
      recommendedFor: 'Tote bags, car dashboard, desk cheerleader',
      description: 'Compact pocket friend you can take anywhere without weighing down your bag.',
    },
    classic: {
      name: 'Classic Cuddle',
      inches: 11.5,
      cm: 29,
      weight: '380g',
      hugLevel: 'Chest Hug 🤗',
      pixelHeight: 145,
      sittingInches: '9.0"',
      recommendedFor: 'Bedtime reading, chest snuggles, couch movie nights',
      description: 'The golden standard hug size. Ergonomically shaped to fit right between your arms.',
    },
    jumbo: {
      name: 'Jumbo Chonk',
      inches: 22,
      cm: 56,
      weight: '1,200g',
      hugLevel: 'Full Torso 🛌',
      pixelHeight: 220,
      sittingInches: '17.5"',
      recommendedFor: 'Body pillow hugs, reading backrest, giant cozy lap cushion',
      description: 'Mega-sized cuddle cloud! Completely covers your chest and doubles as a luxury pillow.',
    },
  };

  const comparisonObjects = {
    pillow: {
      id: 'pillow',
      name: 'Bed Sleep Pillow',
      inches: 20.0,
      cm: 50,
      pixelHeight: 205,
      icon: '🛏️',
      desc: 'Standard queen bed pillow',
      renderIllustration: () => (
        <div className="guide-illust-pillow">
          <div className="pillow-crease"></div>
          <span className="pillow-mark">🛏️</span>
          <span className="pillow-text">Sleep Pillow</span>
        </div>
      ),
    },
    cat: {
      id: 'cat',
      name: 'Sleeping House Cat',
      inches: 18.0,
      cm: 45,
      pixelHeight: 185,
      icon: '🐱',
      desc: 'Standard curled-up pet',
      renderIllustration: () => (
        <div className="guide-illust-cat">
          <div className="cat-ears-row">
            <span>▲</span><span>▲</span>
          </div>
          <div className="cat-body-sphere">
            <span className="cat-sleeping-face">(=^-ω-^=)</span>
          </div>
        </div>
      ),
    },
    laptop: {
      id: 'laptop',
      name: '13" MacBook / Laptop',
      inches: 12.0,
      cm: 30,
      pixelHeight: 150,
      icon: '💻',
      desc: 'Everyday portable laptop',
      renderIllustration: () => (
        <div className="guide-illust-laptop">
          <div className="laptop-screen-display">
            <span>💻</span>
          </div>
          <div className="laptop-keyboard-base"></div>
        </div>
      ),
    },
    switch: {
      id: 'switch',
      name: 'Nintendo Switch',
      inches: 9.4,
      cm: 24,
      pixelHeight: 120,
      icon: '🎮',
      desc: 'Console with Joy-Cons',
      renderIllustration: () => (
        <div className="guide-illust-switch">
          <div className="joycon left"></div>
          <div className="switch-screen">
            <span>🎮</span>
          </div>
          <div className="joycon right"></div>
        </div>
      ),
    },
    mug: {
      id: 'mug',
      name: 'Morning Coffee Mug',
      inches: 4.0,
      cm: 10,
      pixelHeight: 65,
      icon: '☕',
      desc: 'Standard ceramic beverage mug',
      renderIllustration: () => (
        <div className="guide-illust-mug">
          <div className="mug-body">
            <span className="mug-icon">☕</span>
            <div className="mug-handle"></div>
          </div>
        </div>
      ),
    },
  };

  const currentScale = scaleSpecs[plushieScale];
  const currentObject = comparisonObjects[comparisonItem];

  const diffInches = Math.abs(currentScale.inches - currentObject.inches);
  const isPlushieTaller = currentScale.inches >= currentObject.inches;

  return (
    <section id="size-guide-section" className="pdp-size-guide-container">
      {/* Section Header */}
      <div className="guide-header-box">
        <div className="guide-pill-badge">📏 Companion Size & Hug-Scale Guide</div>
        <h2 className="guide-title">How Big Is {plushie.name} in Real Life?</h2>
        <p className="guide-subtitle">
          Compare {plushie.name} side-by-side with familiar everyday items and see exactly how it will look and feel in your arms.
        </p>
      </div>

      {/* Control Strip */}
      <div className="guide-controls-panel">
        {/* Plushie Size Scale Picker */}
        <div className="guide-control-block">
          <label className="guide-control-label">
            <span>1. Choose {plushie.name}&apos;s Edition Scale:</span>
          </label>
          <div className="scale-segmented-selector">
            {(['mini', 'classic', 'jumbo'] as PlushieScale[]).map((key) => {
              const item = scaleSpecs[key];
              const isSelected = plushieScale === key;
              return (
                <button
                  key={key}
                  type="button"
                  className={`scale-pick-button ${isSelected ? 'selected' : ''}`}
                  onClick={() => {
                    playSquish();
                    setPlushieScale(key);
                  }}
                >
                  <div className="scale-name">{item.name}</div>
                  <div className="scale-dimension">{item.inches}&quot; ({item.cm} cm)</div>
                  <span className="scale-hug-tag">{item.hugLevel}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Everyday Object Picker */}
        <div className="guide-control-block">
          <label className="guide-control-label">
            <span>2. Compare Against Everyday Household Object:</span>
          </label>
          <div className="objects-picker-row">
            {(Object.keys(comparisonObjects) as ComparisonItem[]).map((key) => {
              const item = comparisonObjects[key];
              const isSelected = comparisonItem === key;
              return (
                <button
                  key={key}
                  type="button"
                  className={`object-pick-button ${isSelected ? 'selected' : ''}`}
                  onClick={() => {
                    playPop();
                    setComparisonItem(key);
                  }}
                >
                  <span className="object-icon">{item.icon}</span>
                  <span className="object-name">{item.name}</span>
                  <span className="object-dimension">{item.inches}&quot;</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Interactive Height Stage */}
      <div className="guide-visual-stage">
        {/* Dynamic Comparison Ribbon */}
        <div className="guide-diff-banner">
          {isPlushieTaller ? (
            <span>
              ✨ <strong>{plushie.name} ({currentScale.name})</strong> is <strong>+{diffInches.toFixed(1)}&quot; taller</strong> than a {currentObject.name}!
            </span>
          ) : (
            <span>
              📏 A {currentObject.name} is <strong>+{diffInches.toFixed(1)}&quot; taller</strong> than <strong>{plushie.name} ({currentScale.name})</strong>.
            </span>
          )}
        </div>

        <div className="stage-arena-wrapper">
          {/* Height Ruler Guidelines */}
          <div className="stage-ruler-grid" aria-hidden="true">
            <div className="stage-ruler-level level-24">
              <span className="ruler-number">24&quot; (60 cm)</span>
              <div className="ruler-line"></div>
            </div>
            <div className="stage-ruler-level level-18">
              <span className="ruler-number">18&quot; (45 cm)</span>
              <div className="ruler-line"></div>
            </div>
            <div className="stage-ruler-level level-12">
              <span className="ruler-number">12&quot; (30 cm)</span>
              <div className="ruler-line"></div>
            </div>
            <div className="stage-ruler-level level-6">
              <span className="ruler-number">6&quot; (15 cm)</span>
              <div className="ruler-line"></div>
            </div>
            <div className="stage-ruler-level level-0">
              <span className="ruler-number">0&quot; Baseline</span>
              <div className="ruler-line floor"></div>
            </div>
          </div>

          {/* Standing Figures */}
          <div className="stage-standing-figures">
            {/* Object Figure */}
            <div className="stage-figure-item object-figure">
              <div
                className="figure-graphic-wrap"
                style={{ height: `${currentObject.pixelHeight}px` }}
              >
                <div className="figure-height-badge">
                  {currentObject.inches}&quot; ({currentObject.cm} cm)
                </div>
                {currentObject.renderIllustration()}
              </div>
              <div className="figure-meta-card">
                <strong>{currentObject.name}</strong>
                <span>{currentObject.desc}</span>
              </div>
            </div>

            {/* VS Badge */}
            <div className="stage-vs-circle">VS</div>

            {/* Plushie Figure */}
            <div className="stage-figure-item plushie-figure">
              <div
                className="figure-graphic-wrap plushie-graphic"
                style={{ height: `${currentScale.pixelHeight}px` }}
              >
                <div className="figure-height-badge plushie-badge">
                  {currentScale.inches}&quot; ({currentScale.cm} cm)
                </div>
                <div className="plushie-image-container">
                  <Image
                    src={plushie.image}
                    alt={plushie.name}
                    width={220}
                    height={220}
                    className="guide-plushie-img"
                    priority
                  />
                  <div className="guide-squish-pill">{currentScale.hugLevel}</div>
                </div>
              </div>
              <div className="figure-meta-card">
                <strong>{plushie.name} ({currentScale.name})</strong>
                <span>Squish Factor: {plushie.squishFactor}</span>
              </div>
            </div>
          </div>

          {/* Shared Floor Baseline */}
          <div className="stage-ground-board">
            <span>🌸 Shared Ground Baseline</span>
          </div>
        </div>
      </div>

      {/* Cuddle Ergonomics & Fit Verdict */}
      <div className="guide-verdict-card">
        <div className="verdict-icon-box">🧸</div>
        <div className="verdict-content">
          <h4 className="verdict-title">Cuddle & Ergonomics Verdict</h4>
          <p className="verdict-text">
            {currentScale.description}
          </p>
          <div className="verdict-perks-row">
            <span className="verdict-perk-tag">🎯 Best for: {currentScale.recommendedFor}</span>
            <span className="verdict-perk-tag">⚖️ Weight: {currentScale.weight}</span>
            <span className="verdict-perk-tag">📐 Sitting height: {currentScale.sittingInches}</span>
          </div>
        </div>
      </div>

      {/* Size Specs Comparison Table */}
      <div className="guide-specs-table-box">
        <h4 className="specs-table-title">Full Cloud Edition Specifications</h4>
        <div className="specs-table-wrap">
          <table className="guide-table">
            <thead>
              <tr>
                <th>Edition Size</th>
                <th>Standing Height</th>
                <th>Sitting Height</th>
                <th>Weight</th>
                <th>Hug Rating</th>
                <th>Recommended Space</th>
              </tr>
            </thead>
            <tbody>
              {(['mini', 'classic', 'jumbo'] as PlushieScale[]).map((key) => {
                const item = scaleSpecs[key];
                const isSelected = plushieScale === key;
                return (
                  <tr
                    key={key}
                    className={`guide-table-row ${isSelected ? 'active-row' : ''}`}
                    onClick={() => {
                      playPop();
                      setPlushieScale(key);
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    <td>
                      <strong>{item.name}</strong> {isSelected ? '← Selected' : ''}
                    </td>
                    <td>{item.inches}&quot; ({item.cm} cm)</td>
                    <td>{item.sittingInches}</td>
                    <td>{item.weight}</td>
                    <td>{item.hugLevel}</td>
                    <td>{item.recommendedFor}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
