import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="container" style={{ textAlign: 'center', padding: '8rem 1.5rem', minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontSize: '5rem', marginBottom: '1rem', animation: 'softWiggle 3s infinite' }}>☁️🧸</div>
      <span className="section-subtitle-pill">404 • Lost In The Clouds</span>
      <h1 className="section-title" style={{ marginTop: '0.5rem', marginBottom: '1rem' }}>
        Oops! This plushie hopped away!
      </h1>
      <p className="section-desc" style={{ maxWidth: '500px', marginBottom: '2rem' }}>
        The page you are looking for might have drifted away like a warm morning cloud. Let’s head back to our fluffy friends!
      </p>
      <Link href="/" className="btn-primary">
        Back to CloudPuff Haven 🍓
      </Link>
    </div>
  );
}
