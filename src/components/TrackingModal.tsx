'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useSound } from '@/context/SoundContext';
import { useCart } from '@/context/CartContext';

interface TrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  trackingNumber?: string;
  plushieName?: string;
  parentName?: string;
  destination?: string;
  plushieImage?: string;
  adoptionDate?: string;
  estimatedDelivery?: string;
}

export const TrackingModal: React.FC<TrackingModalProps> = ({
  isOpen,
  onClose,
  trackingNumber = 'CP-534148',
  plushieName = 'Matcha Dino',
  parentName = 'Arsalan Abbas',
  destination = 'Cuddle Haven, 123 Snuggle Lane',
  plushieImage = '/assets/dino.jpg',
  adoptionDate = 'September 11, 2026',
  estimatedDelivery = 'September 14, 2026',
}) => {
  const { playPop, playChime, playSquish } = useSound();
  const { showToast } = useCart();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'timeline' | 'radar'>('timeline');
  const [radarPulse, setRadarPulse] = useState(false);
  const [smsSubscribed, setSmsSubscribed] = useState(false);

  if (!isOpen) return null;

  // Safe image path
  const safeImage = plushieImage.startsWith('/') ? plushieImage : `/${plushieImage}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(trackingNumber);
    setCopied(true);
    playChime();
    showToast(`📋 Tracking ID #${trackingNumber} copied to clipboard!`);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePingRadar = () => {
    playSquish();
    setRadarPulse(true);
    showToast('📡 Radar pinged! Courier cloud van is cruising smoothly at 25 hugs/hr! ☁️');
    setTimeout(() => setRadarPulse(false), 1200);
  };

  const handleToggleSms = () => {
    playPop();
    const next = !smsSubscribed;
    setSmsSubscribed(next);
    if (next) {
      showToast('📱 SMS Snuggle Updates activated! You will receive a hug ping upon arrival.');
    } else {
      showToast('🔕 SMS updates paused.');
    }
  };

  const milestones = [
    {
      id: 1,
      status: 'completed',
      title: 'Adoption Official & Registered',
      description: 'Official birth certificate issued and stored in CloudPuff Registry.',
      location: 'CloudPuff Nursery Headquarters',
      time: '10:15 AM',
      icon: '📜',
    },
    {
      id: 2,
      status: 'completed',
      title: 'Fluff Checked & Strawberry Scent Sprinkled',
      description: 'Passed 100-point squishiness test with 100% cloud grade rating.',
      location: 'Quality & Hugs Inspection Lab',
      time: '11:40 AM',
      icon: '🍓',
    },
    {
      id: 3,
      status: 'current',
      title: 'Tucked into Cloud Delivery Box',
      description: 'Wrapped in gentle silk tissue with honorary adoption sweets and stickers.',
      location: 'Cloud Distribution Haven',
      time: 'In Progress • Right Now',
      icon: '📦',
    },
    {
      id: 4,
      status: 'upcoming',
      title: 'Boarding Rainbow Express Courier',
      description: 'Temperature-controlled snuggle van cruising along rainbow highways.',
      location: 'Fluffy Express Fleet Hub',
      time: 'Estimated Tomorrow, 8:30 AM',
      icon: '🚚',
    },
    {
      id: 5,
      status: 'upcoming',
      title: 'Safe at Your Doorstep for Cuddles',
      description: 'Doorbell ring & immediate lifelong hugs begin!',
      location: destination,
      time: `Estimated ${estimatedDelivery}`,
      icon: '🏡',
    },
  ];

  return (
    <div className="modal-backdrop open" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="tracking-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          className="modal-close-btn tracking-close-btn"
          onClick={() => {
            playPop();
            onClose();
          }}
          aria-label="Close Tracking Modal"
          type="button"
        >
          ✕
        </button>

        {/* Header Ribbon */}
        <div className="tracking-header">
          <div className="tracking-badge-row">
            <span className="tracking-pill-live">
              <span className="live-pulsing-dot"></span> Live Cuddle Tracking
            </span>
            <span className="carrier-badge">CloudPuff Express 🌈</span>
          </div>
          <h2 className="tracking-title">Track Your Snuggle Buddy 🚚</h2>
          <p className="tracking-subtitle">
            Follow your plushie&apos;s journey from our cloud sanctuary to your warm embrace.
          </p>

          {/* Tracking ID Bar */}
          <div className="tracking-id-bar">
            <div className="tracking-id-info">
              <span className="tracking-id-label">Tracking Number</span>
              <span className="tracking-id-value">#{trackingNumber}</span>
            </div>
            <button
              className="tracking-copy-btn"
              onClick={handleCopy}
              type="button"
              title="Copy tracking number"
            >
              {copied ? '✓ Copied!' : '📋 Copy ID'}
            </button>
          </div>
        </div>

        {/* Adopted Plushie Snapshot Card */}
        <div className="tracking-plushie-card">
          <div className="tracking-thumb-wrap">
            <Image
              src={safeImage}
              alt={plushieName}
              width={76}
              height={76}
              className="tracking-plushie-img"
            />
            <span className="tracking-thumb-badge">🧸</span>
          </div>
          <div className="tracking-plushie-details">
            <div className="tracking-plushie-name-row">
              <h3 className="tracking-plushie-name">{plushieName}</h3>
              <span className="tracking-status-pill">☁️ In Snuggle Transit</span>
            </div>
            <p className="tracking-dest-text">
              <strong>Parent:</strong> {parentName} • <strong>Dest:</strong> {destination}
            </p>
            <div className="tracking-eta-chip">
              <span>📅 Estimated Cuddle Date: <strong>{estimatedDelivery}</strong></span>
            </div>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="tracking-tabs-row">
          <button
            className={`tracking-tab-btn ${activeTab === 'timeline' ? 'active' : ''}`}
            onClick={() => {
              playPop();
              setActiveTab('timeline');
            }}
            type="button"
          >
            📋 Delivery Milestones
          </button>
          <button
            className={`tracking-tab-btn ${activeTab === 'radar' ? 'active' : ''}`}
            onClick={() => {
              playPop();
              setActiveTab('radar');
            }}
            type="button"
          >
            🛰️ Live Cuddle Radar
          </button>
        </div>

        {/* Progress Timeline View */}
        {activeTab === 'timeline' && (
          <div className="tracking-content-area">
            {/* Visual Overall Progress Bar */}
            <div className="tracking-overall-progress">
              <div className="progress-labels-row">
                <span>Journey Progress</span>
                <span className="progress-pct">60% Prepared</span>
              </div>
              <div className="progress-bar-track">
                <div className="progress-bar-fill" style={{ width: '60%' }}></div>
              </div>
            </div>

            {/* Stepper Timeline */}
            <div className="tracking-timeline">
              {milestones.map((step) => (
                <div
                  key={step.id}
                  className={`timeline-item ${step.status}`}
                >
                  <div className="timeline-marker">
                    <div className="timeline-icon-bubble">
                      {step.status === 'completed' ? '✓' : step.icon}
                    </div>
                    <div className="timeline-connector"></div>
                  </div>
                  <div className="timeline-body">
                    <div className="timeline-title-row">
                      <h4 className="timeline-step-title">{step.title}</h4>
                      <span className="timeline-time-tag">{step.time}</span>
                    </div>
                    <p className="timeline-step-desc">{step.description}</p>
                    <span className="timeline-location-tag">📍 {step.location}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Live Radar View */}
        {activeTab === 'radar' && (
          <div className="tracking-radar-view">
            <div className={`radar-simulation-map ${radarPulse ? 'radar-active' : ''}`}>
              <div className="radar-sweep"></div>
              <div className="radar-grid-lines"></div>

              {/* Waypoints */}
              <div className="radar-point hub" title="Cloud Nursery">
                <span className="point-icon">☁️</span>
                <span className="point-label">Sanctuary</span>
              </div>

              <div className="radar-point van pulse" title="Courier Van en route">
                <span className="van-icon">🚚</span>
                <span className="point-label van-label">{plushieName}</span>
              </div>

              <div className="radar-point home" title="Your Home">
                <span className="point-icon">🏡</span>
                <span className="point-label">Your Arms</span>
              </div>
            </div>

            <div className="radar-courier-note">
              <span className="driver-avatar">🦉</span>
              <div className="driver-info">
                <strong>Courier Pilot:</strong> Oliver the Owl
                <p>&ldquo;Cruising above soft clouds at gentle speeds. Maximum fluff integrity guaranteed!&rdquo;</p>
              </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <button
                className="btn-ping-radar"
                onClick={handlePingRadar}
                type="button"
              >
                📡 Ping Cuddle Radar
              </button>
            </div>
          </div>
        )}

        {/* Courier Pledge & Actions Footer */}
        <div className="tracking-footer">
          <div className="delivery-instruction-card">
            <span className="shield-icon">🛡️</span>
            <span>
              <strong>Delivery Instruction:</strong> Handle with extreme sweetness. If package is touched, prepare for instant oxytocin boost.
            </span>
          </div>

          <div className="tracking-footer-actions">
            <button
              className={`btn-sms-alert ${smsSubscribed ? 'subscribed' : ''}`}
              onClick={handleToggleSms}
              type="button"
            >
              {smsSubscribed ? '🔔 SMS Alerts Active' : '📱 Get SMS Delivery Alerts'}
            </button>
            <button
              className="btn-primary tracking-done-btn"
              onClick={() => {
                playPop();
                onClose();
              }}
              type="button"
            >
              Close Tracker 🌸
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
