'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSound } from '@/context/SoundContext';
import { useCart } from '@/context/CartContext';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { TrackingModal } from '@/components/TrackingModal';

interface AdoptedOrder {
  registryNumber: string;
  plushieName: string;
  parentName: string;
  date: string;
  image: string;
  status: string;
  destination: string;
  species: string;
}

const DEFAULT_ORDERS: AdoptedOrder[] = [
  {
    registryNumber: 'CP-534148',
    plushieName: 'Matcha Dino',
    parentName: 'Arsalan Abbas',
    date: 'September 11, 2026',
    image: '/assets/dino.jpg',
    status: 'In Snuggle Transit ☁️',
    destination: '77 Blossom Boulevard, Snuggle Town',
    species: 'Baby Stegosaurus',
  },
  {
    registryNumber: 'CP-884912',
    plushieName: 'Pip & Peaches',
    parentName: 'Certified Cloud Parent',
    date: 'August 18, 2026',
    image: '/assets/hero.jpg',
    status: 'Delivered & Snuggled 🏡',
    destination: '123 Cloud Way, Fluff City',
    species: 'Strawberry Bunny',
  },
];

export default function OrdersPage() {
  const { playPop, playSquish, playChime } = useSound();
  const { showToast } = useCart();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrderForTracking, setSelectedOrderForTracking] = useState<AdoptedOrder | null>(null);
  const [certificateViewOrder, setCertificateViewOrder] = useState<AdoptedOrder | null>(null);
  const [headPatCounts, setHeadPatCounts] = useState<Record<string, number>>({});

  const filteredOrders = DEFAULT_ORDERS.filter((order) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      order.registryNumber.toLowerCase().includes(q) ||
      order.plushieName.toLowerCase().includes(q) ||
      order.parentName.toLowerCase().includes(q)
    );
  });

  const handleHeadPat = (regNum: string, name: string) => {
    playSquish();
    setHeadPatCounts((prev) => ({
      ...prev,
      [regNum]: (prev[regNum] || 0) + 1,
    }));
    showToast(`🧸 *squish* ${name} closed their eyes happily from your head pat!`);
  };

  return (
    <div className="page-wrapper">
      <Navbar />

      <main className="orders-page container">
        {/* Header */}
        <div className="orders-header-banner">
          <span className="orders-badge">📖 Adoption Registry Archive</span>
          <h1 className="orders-title">Cuddle Family Album</h1>
          <p className="orders-subtitle">
            Look up past adoptions, re-print birth certificates, track delivery status, and give your plushies virtual head pats.
          </p>

          {/* Search Input */}
          <div className="orders-search-bar">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="orders-search-input"
              placeholder="Search by Registry # (e.g. CP-534148), Plushie name, or Parent..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                className="clear-search-btn"
                onClick={() => setSearchQuery('')}
                type="button"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="orders-empty-card">
            <div className="empty-icon">🔎</div>
            <h3>No adoptions found matching &ldquo;{searchQuery}&rdquo;</h3>
            <p>Check the registry ID or adopt a new cuddle friend to add to your album!</p>
            <div style={{ marginTop: '1.2rem' }}>
              <Link href="/#shop-section" className="btn-primary">
                Explore Cuddle Squad 🍓
              </Link>
            </div>
          </div>
        ) : (
          <div className="orders-grid">
            {filteredOrders.map((order) => (
              <div key={order.registryNumber} className="order-adoption-card">
                <div className="order-card-top">
                  <div className="order-thumb-wrap">
                    <Image
                      src={order.image}
                      alt={order.plushieName}
                      width={120}
                      height={120}
                      className="order-plushie-img"
                    />
                    <span className="order-species-tag">{order.species}</span>
                  </div>

                  <div className="order-card-meta">
                    <div className="order-id-row">
                      <span className="order-reg-pill">#{order.registryNumber}</span>
                      <span className="order-status-chip">{order.status}</span>
                    </div>

                    <h2 className="order-plushie-name">{order.plushieName}</h2>
                    <p className="order-parent-text">
                      <strong>Certified Parent:</strong> {order.parentName}
                    </p>
                    <p className="order-date-text">
                      <strong>Adoption Date:</strong> {order.date}
                    </p>
                    <p className="order-dest-text">
                      <strong>Delivering To:</strong> {order.destination}
                    </p>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="order-card-actions-bar">
                  <button
                    className="btn-head-pat"
                    onClick={() => handleHeadPat(order.registryNumber, order.plushieName)}
                    type="button"
                  >
                    <span>🤗 Head Pat</span>
                    <span className="pat-count">
                      {headPatCounts[order.registryNumber] || 0}
                    </span>
                  </button>

                  <button
                    className="btn-order-track"
                    onClick={() => {
                      playPop();
                      setSelectedOrderForTracking(order);
                    }}
                    type="button"
                  >
                    Track Package 🚚
                  </button>

                  <button
                    className="btn-order-cert"
                    onClick={() => {
                      playChime();
                      setCertificateViewOrder(order);
                    }}
                    type="button"
                  >
                    Certificate 🖨️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Live Tracking Modal */}
      {selectedOrderForTracking && (
        <TrackingModal
          isOpen={Boolean(selectedOrderForTracking)}
          onClose={() => setSelectedOrderForTracking(null)}
          trackingNumber={selectedOrderForTracking.registryNumber}
          plushieName={selectedOrderForTracking.plushieName}
          parentName={selectedOrderForTracking.parentName}
          destination={selectedOrderForTracking.destination}
          plushieImage={selectedOrderForTracking.image}
          adoptionDate={selectedOrderForTracking.date}
          estimatedDelivery="September 14, 2026"
        />
      )}

      {/* Certificate Print Preview Modal */}
      {certificateViewOrder && (
        <div
          className="modal-backdrop open"
          onClick={() => setCertificateViewOrder(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="certificate-modal-wrapper"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close-btn"
              onClick={() => setCertificateViewOrder(null)}
              type="button"
            >
              ✕
            </button>

            <div className="certificate-card">
              <span className="certificate-badge">★ Official Certificate of Adoption ★</span>
              <h2 className="certificate-title">CloudPuff Adoption Registry</h2>
              <p className="certificate-subtitle">
                This certifies that unconditional love, lifelong snuggles, and cloud-grade comfort have been officially established.
              </p>

              <div className="cert-seal">🧸</div>

              <div className="certificate-details-grid">
                <div className="cert-field">
                  <strong>Plushie Official Name</strong>
                  <span>{certificateViewOrder.plushieName}</span>
                </div>
                <div className="cert-field">
                  <strong>Certified Parent</strong>
                  <span>{certificateViewOrder.parentName}</span>
                </div>
                <div className="cert-field">
                  <strong>Registry Number</strong>
                  <span>{certificateViewOrder.registryNumber}</span>
                </div>
                <div className="cert-field">
                  <strong>Adoption Date</strong>
                  <span>{certificateViewOrder.date}</span>
                </div>
              </div>

              <div className="certificate-actions" style={{ marginTop: '1.5rem' }}>
                <button
                  className="btn-primary"
                  onClick={() => window.print()}
                  type="button"
                >
                  Print Certificate 🖨️
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => setCertificateViewOrder(null)}
                  type="button"
                >
                  Done 🌸
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
