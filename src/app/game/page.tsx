'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useSound } from '@/context/SoundContext';
import { useCart } from '@/context/CartContext';
import { confettiEngine } from '@/utils/confetti';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { useTheme } from '@/context/ThemeContext';

interface Cloud {
  x: number;
  y: number;
  width: number;
  height: number;
  hasBerry?: boolean;
}

export default function GamePage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { playPop, playSquish, playChime } = useSound();
  const { showToast } = useCart();
  const { isNightMode } = useTheme();
  const isNightModeRef = useRef(isNightMode);

  useEffect(() => {
    isNightModeRef.current = isNightMode;
  }, [isNightMode]);

  const [gameState, setGameState] = useState<'start' | 'playing' | 'gameover'>('start');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [unlockedReward, setUnlockedReward] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('cloudpuff_highscore');
    if (saved) {
      setHighScore(parseInt(saved, 10));
    }
  }, []);

  const handleStartGame = () => {
    playSquish();
    setScore(0);
    setGameState('playing');
  };

  const handleCopyCoupon = () => {
    playChime();
    navigator.clipboard.writeText('CLOUDCHAMP25');
    setCopiedCode(true);
    showToast('🎉 Secret 25% Off Code CLOUDCHAMP25 copied to clipboard!');
    setTimeout(() => setCopiedCode(false), 2500);
  };

  useEffect(() => {
    if (gameState !== 'playing') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    const width = 420;
    const height = 560;
    canvas.width = width;
    canvas.height = height;

    // Pip Player State
    const player = {
      x: width / 2 - 20,
      y: height - 120,
      width: 40,
      height: 40,
      vx: 0,
      vy: -11,
      gravity: 0.38,
      jumpStrength: -11,
    };

    // Keyboard handlers
    const keys: Record<string, boolean> = {};
    const handleKeyDown = (e: KeyboardEvent) => {
      keys[e.key] = true;
      if (['ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keys[e.key] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Generate Initial Clouds
    const clouds: Cloud[] = [];
    const cloudCount = 7;
    for (let i = 0; i < cloudCount; i++) {
      clouds.push({
        x: Math.random() * (width - 90),
        y: (height / cloudCount) * i,
        width: 85,
        height: 18,
        hasBerry: Math.random() > 0.4,
      });
    }

    let currentScore = 0;

    const loop = () => {
      // Clear screen
      ctx.clearRect(0, 0, width, height);

      // Background Sky Gradient
      const isNight = isNightModeRef.current;
      const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
      if (isNight) {
        skyGrad.addColorStop(0, '#0F0C24');
        skyGrad.addColorStop(0.5, '#1C153E');
        skyGrad.addColorStop(1, '#2D1B4E');
      } else {
        skyGrad.addColorStop(0, '#FFE4EC');
        skyGrad.addColorStop(0.5, '#F3E8FF');
        skyGrad.addColorStop(1, '#E0F2FE');
      }
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height);

      // Controls
      if (keys['ArrowLeft'] || keys['KeyA'] || keys['a']) {
        player.vx = -4.5;
      } else if (keys['ArrowRight'] || keys['KeyD'] || keys['d']) {
        player.vx = 4.5;
      } else {
        player.vx *= 0.85;
      }

      // Physics
      player.x += player.vx;
      player.vy += player.gravity;
      player.y += player.vy;

      // Wrap around walls
      if (player.x < -20) player.x = width;
      if (player.x > width) player.x = -20;

      // Camera Scroll Upwards
      if (player.y < height / 2) {
        const diff = height / 2 - player.y;
        player.y = height / 2;
        currentScore += Math.floor(diff / 5);
        setScore(currentScore);

        clouds.forEach((cloud) => {
          cloud.y += diff;
          if (cloud.y > height) {
            cloud.y = 0;
            cloud.x = Math.random() * (width - 90);
            cloud.hasBerry = Math.random() > 0.45;
          }
        });
      }

      // Draw Clouds
      clouds.forEach((cloud) => {
        ctx.fillStyle = isNight ? '#261F48' : '#FFFFFF';
        ctx.beginPath();
        ctx.roundRect(cloud.x, cloud.y, cloud.width, cloud.height, 12);
        ctx.fill();

        // Cloud border
        ctx.strokeStyle = isNight ? '#A78BFA' : '#FBCFE8';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw Strawberry Collectible
        if (cloud.hasBerry) {
          ctx.font = '16px serif';
          ctx.fillText('🍓', cloud.x + cloud.width / 2 - 8, cloud.y - 4);

          // Berry Collision
          if (
            player.x + player.width > cloud.x &&
            player.x < cloud.x + cloud.width &&
            player.y + player.height > cloud.y - 20 &&
            player.y < cloud.y
          ) {
            cloud.hasBerry = false;
            currentScore += 25;
            setScore(currentScore);
            playPop();
          }
        }

        // Jump Collision (only when falling downwards)
        if (
          player.vy > 0 &&
          player.x + player.width - 8 > cloud.x &&
          player.x + 8 < cloud.x + cloud.width &&
          player.y + player.height >= cloud.y &&
          player.y + player.height <= cloud.y + 14
        ) {
          player.vy = player.jumpStrength;
          playSquish();
        }
      });

      // Draw Pip Player
      ctx.font = '32px serif';
      ctx.fillText('🐰', player.x, player.y + player.height);

      // Check Game Over (fell below canvas)
      if (player.y > height + 50) {
        setGameState('gameover');
        if (currentScore > highScore) {
          setHighScore(currentScore);
          localStorage.setItem('cloudpuff_highscore', currentScore.toString());
          playChime();
        }
        if (currentScore >= 100) {
          setUnlockedReward(true);
          confettiEngine.burst();
        }
        return;
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState, highScore, playPop, playSquish, playChime]);

  return (
    <div className="page-wrapper">
      <Navbar />

      <main className="game-page container">
        <div className="game-header-banner">
          <span className="game-badge">🎮 Mini Arcade</span>
          <h1 className="game-title">Pip&apos;s Cloud Hop ☁️</h1>
          <p className="game-subtitle">
            Bounce Pip the Bunny to the stars! Collect strawberries, beat your high score, and score 100+ points to unlock an exclusive 25% discount code!
          </p>
        </div>

        <div className="game-arena-layout">
          {/* Scoreboard */}
          <div className="game-scoreboard">
            <div className="score-pill">
              <span>Score:</span>
              <strong>{score}</strong>
            </div>
            <div className="score-pill highlight">
              <span>High Score:</span>
              <strong>{highScore}</strong>
            </div>
          </div>

          {/* Canvas Wrapper */}
          <div className="canvas-wrapper">
            <canvas ref={canvasRef} className="game-canvas"></canvas>

            {/* Start Screen Overlay */}
            {gameState === 'start' && (
              <div className="game-overlay">
                <div className="overlay-content">
                  <div className="overlay-icon">🐰☁️</div>
                  <h2>Ready to Hop?</h2>
                  <p>Use <strong>← Arrow Keys →</strong> or <strong>A / D</strong> to steer Pip across the clouds!</p>
                  <button className="btn-primary start-btn" onClick={handleStartGame} type="button">
                    Start Bouncing! 🌸
                  </button>
                </div>
              </div>
            )}

            {/* Game Over Overlay */}
            {gameState === 'gameover' && (
              <div className="game-overlay">
                <div className="overlay-content">
                  <div className="overlay-icon">🧸✨</div>
                  <h2>Cuddle Nap Time!</h2>
                  <p>You scored <strong>{score} points</strong>!</p>

                  {unlockedReward && (
                    <div className="game-reward-box">
                      <span className="reward-tag">🎉 WINNER REWARD UNLOCKED!</span>
                      <h3>Secret 25% Off Coupon</h3>
                      <div className="game-coupon-row">
                        <span className="game-code">CLOUDCHAMP25</span>
                        <button className="btn-copy-code" onClick={handleCopyCoupon} type="button">
                          {copiedCode ? '✓ Copied' : '📋 Copy'}
                        </button>
                      </div>
                      <Link href="/#shop-section" className="btn-shop-reward">
                        Use On Cuddle Squad 🍓
                      </Link>
                    </div>
                  )}

                  <button className="btn-primary retry-btn" onClick={handleStartGame} type="button">
                    Play Again 🔄
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Direction Buttons */}
          <div className="mobile-controls-row">
            <button
              className="touch-ctrl-btn"
              onTouchStart={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }))}
              onTouchEnd={() => window.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowLeft' }))}
              type="button"
            >
              ⬅️ Left
            </button>
            <button
              className="touch-ctrl-btn"
              onTouchStart={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }))}
              onTouchEnd={() => window.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowRight' }))}
              type="button"
            >
              Right ➡️
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
