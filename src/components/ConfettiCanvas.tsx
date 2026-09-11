'use client';

import React, { useEffect, useRef } from 'react';
import { confettiEngine } from '@/utils/confetti';

export const ConfettiCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      confettiEngine.init(canvasRef.current);
    }
  }, []);

  return <canvas id="confetti-canvas" ref={canvasRef} />;
};
