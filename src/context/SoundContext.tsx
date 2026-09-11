'use client';

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';

interface SoundContextType {
  muted: boolean;
  toggleSound: () => void;
  playPop: () => void;
  playChime: () => void;
  playSquish: () => void;
}

const SoundContext = createContext<SoundContextType>({
  muted: false,
  toggleSound: () => {},
  playPop: () => {},
  playChime: () => {},
  playSquish: () => {},
});

export const SoundProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [muted, setMuted] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('cloudpuff_sound');
    if (saved === 'muted') {
      setMuted(true);
    }
  }, []);

  const initContext = () => {
    if (!audioCtxRef.current && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        audioCtxRef.current = new AudioCtx();
      }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  const toggleSound = () => {
    setMuted(prev => {
      const next = !prev;
      localStorage.setItem('cloudpuff_sound', next ? 'muted' : 'active');
      if (!next) {
        initContext();
        playChime();
      }
      return next;
    });
  };

  const playPop = () => {
    if (muted) return;
    initContext();
    const ctx = audioCtxRef.current;
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const now = ctx.currentTime;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(420, now);
      osc.frequency.exponentialRampToValueAtTime(860, now + 0.05);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.12);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.13);
    } catch {
      // Audio context blocked or error
    }
  };

  const playChime = () => {
    if (muted) return;
    initContext();
    const ctx = audioCtxRef.current;
    if (!ctx) return;

    try {
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const startTime = ctx.currentTime + (idx * 0.06);

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.18, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.36);
      });
    } catch {}
  };

  const playSquish = () => {
    if (muted) return;
    initContext();
    const ctx = audioCtxRef.current;
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const now = ctx.currentTime;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(1100, now + 0.08);
      osc.frequency.exponentialRampToValueAtTime(500, now + 0.18);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.18);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.2);
    } catch {}
  };

  return (
    <SoundContext.Provider value={{ muted, toggleSound, playPop, playChime, playSquish }}>
      {children}
    </SoundContext.Provider>
  );
};

export const useSound = () => useContext(SoundContext);
