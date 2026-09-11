'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MoodKey, Plushie } from '@/types/plushie';
import { MOOD_MAP, PLUSHIES } from '@/data/plushies';
import { useSound } from '@/context/SoundContext';

interface MoodMatcherProps {
  onQuickView: (product: Plushie) => void;
}

export const MoodMatcher: React.FC<MoodMatcherProps> = ({ onQuickView }) => {
  const [selectedMood, setSelectedMood] = useState<MoodKey>('sleepy');
  const { playPop } = useSound();

  const mood = MOOD_MAP[selectedMood];
  const matchedPlushie = PLUSHIES.find(p => p.id === mood.id) || PLUSHIES[0];

  const handleMoodSelect = (key: MoodKey) => {
    playPop();
    setSelectedMood(key);
  };

  return (
    <section className="mood-matcher-section" id="mood-section">
      <div className="container">
        <div className="section-header">
          <span className="section-subtitle-pill">✨ Instant Soulmate Quiz</span>
          <h2 className="section-title">What’s Your Vibe Today? 🧸</h2>
          <p className="section-desc">
            Pick your current feeling and let our magical cuddle radar match you with your ideal emotional support companion.
          </p>
        </div>

        <div className="mood-card-box">
          {/* Mood Buttons */}
          <div className="mood-pills-row">
            <button
              className={`mood-btn ${selectedMood === 'sleepy' ? 'active' : ''}`}
              onClick={() => handleMoodSelect('sleepy')}
              type="button"
            >
              <span>😴</span> Sleepy & Cozy
            </button>
            <button
              className={`mood-btn ${selectedMood === 'hug' ? 'active' : ''}`}
              onClick={() => handleMoodSelect('hug')}
              type="button"
            >
              <span>🥺</span> Needs A Big Hug
            </button>
            <button
              className={`mood-btn ${selectedMood === 'zen' ? 'active' : ''}`}
              onClick={() => handleMoodSelect('zen')}
              type="button"
            >
              <span>🍵</span> Chill & Zen
            </button>
            <button
              className={`mood-btn ${selectedMood === 'chaotic' ? 'active' : ''}`}
              onClick={() => handleMoodSelect('chaotic')}
              type="button"
            >
              <span>⚡</span> Chaotic Sweetheart
            </button>
            <button
              className={`mood-btn ${selectedMood === 'dreamy' ? 'active' : ''}`}
              onClick={() => handleMoodSelect('dreamy')}
              type="button"
            >
              <span>🍓</span> Sweet & Dreamy
            </button>
          </div>

          {/* Dynamic Result Card */}
          <div className="mood-result-display" id="mood-result-display">
            <Link
              href={`/product/${matchedPlushie.id}`}
              className="mood-result-img-wrap"
              title={`View ${matchedPlushie.name} details`}
            >
              <Image
                src={matchedPlushie.image}
                alt={matchedPlushie.name}
                width={300}
                height={280}
              />
            </Link>
            <div className="mood-result-info">
              <span className="match-tag">✨ 100% Soulmate Match for {mood.moodName}</span>
              <h3 className="mood-plushie-name">
                <Link href={`/product/${matchedPlushie.id}`} title={`View ${matchedPlushie.name}`}>
                  {matchedPlushie.name}
                </Link>
              </h3>
              <p className="mood-plushie-quote">{mood.quote}</p>
              <p className="mood-plushie-desc">{mood.blurb}</p>
              <div className="mood-meta-row">
                <div className="mood-meta-item">
                  Squish Factor: <span>{matchedPlushie.squishFactor}</span>
                </div>
                <div className="mood-meta-item">
                  Adoption Fee: <span>${matchedPlushie.price.toFixed(2)}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                <Link
                  href={`/product/${matchedPlushie.id}`}
                  className="btn-primary"
                  onClick={playPop}
                  style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  Adopt {matchedPlushie.name.split(' ')[0]} 💖
                </Link>
                <button
                  className="quick-view-btn"
                  onClick={() => onQuickView(matchedPlushie)}
                  type="button"
                  style={{ padding: '0.7rem 1.1rem' }}
                >
                  Quick Peek 👀
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
