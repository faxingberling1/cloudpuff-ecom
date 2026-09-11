'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useSound } from '@/context/SoundContext';
import { PLUSHIES } from '@/data/plushies';

interface SizeComparatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPlushieName?: string;
}

type ComparisonItem = 'mug' | 'switch' | 'laptop' | 'cat' | 'pillow';
type PlushieScale = 'mini' | 'classic' | 'jumbo';

export const SizeComparatorModal: React.FC<SizeComparatorModalProps> = ({
  isOpen,
  onClose,
  selectedPlushieName = 'Pip & Peaches',
}) => {
  const { playPop, playSquish } = useSound();

  // Find currently selected plushie or default to Pip
  const matchedPlushie = PLUSHIES.find((p) => p.name.toLowerCase().includes(selectedPlushieName.toLowerCase())) || PLUSHIES[0];
  const [activePlushieId, setActivePlushieId] = useState(matchedPlushie.id);
  const [plushieScale, setPlushieScale] = useState<PlushieScale>('classic');
  const [comparisonItem, setComparisonItem] = useState<ComparisonItem>('pillow');

  if (!isOpen) return null;

  const currentPlushieData = PLUSHIES.find((p) => p.id === activePlushieId) || PLUSHIES[0];

  const scaleSpecs = {
    mini: {
      name: 'Mini Pocket',
      inches: 6,
      cm: 15,
      weight: '140g',
      hugLevel: 'Palm Hold 🖐️',
      pixelHeight: 70,
      useCase: 'Compact travel companion or desk ornament.',
    },
    classic: {
      name: 'Classic Cuddle',
      inches: 11.5,
      cm: 29,
      weight: '380g',
      hugLevel: 'Chest Hug 🤗',
      pixelHeight: 125,
      useCase: 'The gold-standard hug! Fits naturally between your arms.',
    },
    jumbo: {
      name: 'Jumbo Chonk',
      inches: 22,
      cm: 56,
      weight: '1.2kg',
      hugLevel: 'Full Torso 🛌',
      pixelHeight: 185,
      useCase: 'Mega body pillow chonk! Completely covers your lap.',
    },
  };

  const comparisonObjects = {
    mug: {
      id: 'mug',
      name: 'Coffee Mug',
      inches: 4.0,
      cm: 10,
      pixelHeight: 48,
      icon: '☕',
      desc: 'Standard morning ceramic mug',
      renderIllustration: () => (
        <div className="illust-mug">
          <div className="mug-cup">
            <span className="mug-face">☕</span>
            <div className="mug-handle"></div>
          </div>
        </div>
      ),
    },
    switch: {
      id: 'switch',
      name: 'Nintendo Switch',
      inches: 9.4,
      cm: 24,
      pixelHeight: 95,
      icon: '🎮',
      desc: 'Console with Joy-Cons',
      renderIllustration: () => (
        <div className="illust-switch">
          <div className="joycon left"></div>
          <div className="switch-screen">
            <span>🎮</span>
          </div>
          <div className="joycon right"></div>
        </div>
      ),
    },
    laptop: {
      id: 'laptop',
      name: '13" MacBook / Laptop',
      inches: 12.0,
      cm: 30,
      pixelHeight: 125,
      icon: '💻',
      desc: 'Standard portable study laptop',
      renderIllustration: () => (
        <div className="illust-laptop">
          <div className="laptop-screen">
            <span>💻</span>
          </div>
          <div className="laptop-base"></div>
        </div>
      ),
    },
    cat: {
      id: 'cat',
      name: 'Sleeping House Cat',
      inches: 18.0,
      cm: 45,
      pixelHeight: 155,
      icon: '🐱',
      desc: 'Curled-up sleeping nap companion',
      renderIllustration: () => (
        <div className="illust-cat">
          <div className="cat-ears">
            <span>▲</span><span>▲</span>
          </div>
          <div className="cat-body">
            <span className="cat-face">(=^-ω-^=)</span>
          </div>
        </div>
      ),
    },
    pillow: {
      id: 'pillow',
      name: 'Bed Sleep Pillow',
      inches: 20.0,
      cm: 50,
      pixelHeight: 175,
      icon: '🛏️',
      desc: 'Standard queen-size sleep pillow',
      renderIllustration: () => (
        <div className="illust-pillow">
          <div className="pillow-crease"></div>
          <span className="pillow-icon">🛏️</span>
          <span className="pillow-label">Cloud Pillow</span>
        </div>
      ),
    },
  };

  const currentScale = scaleSpecs[plushieScale];
  const currentObject = comparisonObjects[comparisonItem];

  const heightDifference = Math.abs(currentScale.inches - currentObject.inches);
  const isPlushieTaller = currentScale.inches >= currentObject.inches;

  return (
    <div className="modal-backdrop open" onClick={onClose} role="dialog" aria-modal="true">
      <div className="size-comparator-modal" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button
          className="modal-close-btn"
          onClick={() => {
            playPop();
            onClose();
          }}
          type="button"
          aria-label="Close size guide"
        >
          ✕
        </button>

        {/* Compact Header */}
        <div className="comparator-header compact">
          <div className="comparator-header-text">
            <span className="comparator-badge">📏 Interactive Hug-O-Meter</span>
            <h2 className="comparator-title">How Big Is Your Plushie?</h2>
          </div>
          <div className="height-diff-ribbon compact">
            {isPlushieTaller ? (
              <span>✨ {currentPlushieData.name} is <strong>+{heightDifference.toFixed(1)}&quot; taller</strong> than {currentObject.name}!</span>
            ) : (
              <span>📏 {currentObject.name} is <strong>+{heightDifference.toFixed(1)}&quot; taller</strong> than {currentPlushieData.name}!</span>
            )}
          </div>
        </div>

        {/* Compact Selection Row 1: Plushie & Scale */}
        <div className="comparator-controls-row">
          <div className="control-group">
            <span className="control-group-title">Plushie:</span>
            <div className="comparator-plushie-picker compact">
              {PLUSHIES.map((p) => (
                <button
                  key={p.id}
                  className={`plushie-pick-pill ${activePlushieId === p.id ? 'active' : ''}`}
                  onClick={() => {
                    playPop();
                    setActivePlushieId(p.id);
                  }}
                  type="button"
                >
                  <Image src={p.image} alt={p.name} width={22} height={22} className="pick-thumb" />
                  <span>{p.name.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="control-group">
            <span className="control-group-title">Edition Scale:</span>
            <div className="scale-pill-row">
              {(['mini', 'classic', 'jumbo'] as PlushieScale[]).map((key) => {
                const scale = scaleSpecs[key];
                return (
                  <button
                    key={key}
                    className={`scale-segmented-btn ${plushieScale === key ? 'active' : ''}`}
                    onClick={() => {
                      playSquish();
                      setPlushieScale(key);
                    }}
                    type="button"
                  >
                    <strong>{scale.name}</strong>
                    <span>{scale.inches}&quot;</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Compact Selection Row 2: Everyday Object */}
        <div className="control-group object-select-group">
          <span className="control-group-title">Compare Against:</span>
          <div className="object-toggle-pills compact">
            {(Object.keys(comparisonObjects) as ComparisonItem[]).map((key) => {
              const item = comparisonObjects[key];
              return (
                <button
                  key={key}
                  className={`object-pill ${comparisonItem === key ? 'active' : ''}`}
                  onClick={() => {
                    playPop();
                    setComparisonItem(key);
                  }}
                  type="button"
                >
                  <span>{item.icon}</span>
                  <span>{item.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Interactive Comparison Stage with Shared Floor Baseline & Height Ruler */}
        <div className="visual-stage-container compact">
          <div className="stage-ruler-arena">
            {/* Background Height Axis Ruler */}
            <div className="stage-ruler-axis" aria-hidden="true">
              <div className="ruler-mark mark-24"><span>24&quot; (60cm)</span><div className="ruler-guideline"></div></div>
              <div className="ruler-mark mark-18"><span>18&quot; (45cm)</span><div className="ruler-guideline"></div></div>
              <div className="ruler-mark mark-12"><span>12&quot; (30cm)</span><div className="ruler-guideline"></div></div>
              <div className="ruler-mark mark-6"><span>6&quot; (15cm)</span><div className="ruler-guideline"></div></div>
              <div className="ruler-mark mark-0"><span>0&quot; Floor</span><div className="ruler-guideline floor-line"></div></div>
            </div>

            {/* Standing Figures on Shared Floor */}
            <div className="stage-figures-row">
              {/* Everyday Object Column */}
              <div className="stage-figure-col object-col">
                <div
                  className="figure-render-wrap object-wrap"
                  style={{ height: `${currentObject.pixelHeight}px` }}
                >
                  <div className="figure-floating-height-tag">
                    {currentObject.inches}&quot; ({currentObject.cm}cm)
                  </div>
                  {currentObject.renderIllustration()}
                </div>
                <div className="figure-caption compact">
                  <strong>{currentObject.name}</strong>
                  <span>{currentObject.inches}&quot; (~{currentObject.cm} cm)</span>
                </div>
              </div>

              {/* VS Marker */}
              <div className="stage-vs-badge">VS</div>

              {/* Plushie Column */}
              <div className="stage-figure-col plushie-col">
                <div
                  className="figure-render-wrap plushie-wrap"
                  style={{ height: `${currentScale.pixelHeight}px` }}
                >
                  <div className="figure-floating-height-tag plushie-tag">
                    {currentScale.inches}&quot; ({currentScale.cm}cm)
                  </div>
                  <div className="plushie-image-box">
                    <Image
                      src={currentPlushieData.image}
                      alt={currentPlushieData.name}
                      width={180}
                      height={180}
                      className="scaled-plushie-photo"
                      priority
                    />
                    <span className="plushie-squish-ribbon">{currentScale.hugLevel}</span>
                  </div>
                </div>
                <div className="figure-caption compact">
                  <strong>{currentPlushieData.name}</strong>
                  <span>{currentScale.name} • {currentScale.inches}&quot; ({currentScale.cm} cm)</span>
                </div>
              </div>
            </div>

            {/* Visual Floor Baseline */}
            <div className="stage-floor-board">
              <span>🌸 Shared Floor Baseline</span>
            </div>
          </div>
        </div>

        {/* Compact Ergonomics Verdict & Close Action */}
        <div className="comparator-bottom-bar">
          <div className="hug-verdict-box compact">
            🍓 <strong>Cuddle Verdict:</strong>{' '}
            {currentScale.inches > currentObject.inches ? (
              <span>
                <strong>{currentPlushieData.name}</strong> is <strong>+{heightDifference.toFixed(1)}&quot; bigger</strong> than a {currentObject.name} • ideal for peaceful chest hugs while sleeping!
              </span>
            ) : (
              <span>
                <strong>{currentPlushieData.name}</strong> is <strong>{heightDifference.toFixed(1)}&quot; more compact</strong> than a {currentObject.name} • portable for backpacks and study desks!
              </span>
            )}
          </div>

          <button
            className="btn-primary compact-done-btn"
            onClick={() => {
              playPop();
              onClose();
            }}
            type="button"
          >
            Done 🌸
          </button>
        </div>
      </div>
    </div>
  );
};
