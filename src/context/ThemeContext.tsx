'use client';

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';

interface ThemeContextType {
  isNightMode: boolean;
  toggleNightMode: () => void;
  isLullabyPlaying: boolean;
  toggleLullaby: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  isNightMode: false,
  toggleNightMode: () => {},
  isLullabyPlaying: false,
  toggleLullaby: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isNightMode, setIsNightMode] = useState(false);
  const [isLullabyPlaying, setIsLullabyPlaying] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setIsMounted(true);
    const savedTheme = localStorage.getItem('cloudpuff_night_mode');
    if (savedTheme === 'true') {
      setIsNightMode(true);
      document.documentElement.classList.add('night-theme');
    }
  }, []);

  const toggleNightMode = () => {
    const next = !isNightMode;
    setIsNightMode(next);
    if (next) {
      document.documentElement.classList.add('night-theme');
      localStorage.setItem('cloudpuff_night_mode', 'true');
    } else {
      document.documentElement.classList.remove('night-theme');
      localStorage.setItem('cloudpuff_night_mode', 'false');
      // Stop lullaby if night mode turned off
      if (isLullabyPlaying) {
        stopLullaby();
      }
    }
  };

  // Generative Gentle Web Audio Lullaby
  const startLullaby = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = audioCtxRef.current || new AudioCtx();
      audioCtxRef.current = ctx;

      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      setIsLullabyPlaying(true);

      // Pentatonic soothing chime notes (Hz): C5, D5, E5, G5, A5, C6
      const notes = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50];

      const playChimeNote = () => {
        if (!audioCtxRef.current) return;
        const now = audioCtxRef.current.currentTime;
        const osc = audioCtxRef.current.createOscillator();
        const gain = audioCtxRef.current.createGain();

        // Random note from scale
        const freq = notes[Math.floor(Math.random() * notes.length)];
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.04, now + 0.3);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.5);

        osc.connect(gain);
        gain.connect(audioCtxRef.current.destination);

        osc.start(now);
        osc.stop(now + 2.5);
      };

      playChimeNote();
      intervalRef.current = setInterval(playChimeNote, 1800);
    } catch {
      // Audio not permitted without interaction
    }
  };

  const stopLullaby = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsLullabyPlaying(false);
  };

  const toggleLullaby = () => {
    if (isLullabyPlaying) {
      stopLullaby();
    } else {
      startLullaby();
    }
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <ThemeContext.Provider value={{ isNightMode, toggleNightMode, isLullabyPlaying, toggleLullaby }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
