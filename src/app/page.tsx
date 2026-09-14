'use client';

import React, { useState } from 'react';
import { Plushie } from '@/types/plushie';
import { AnnouncementBar } from '@/components/AnnouncementBar';
import { Navbar } from '@/components/Navbar';
import { HeroSection } from '@/components/HeroSection';
import { MoodMatcher } from '@/components/MoodMatcher';
import { ProductCatalog } from '@/components/ProductCatalog';
import { PromiseSection } from '@/components/PromiseSection';
import { MysteryBox } from '@/components/MysteryBox';
import { ReviewsSection } from '@/components/ReviewsSection';
import { NewsletterSection } from '@/components/NewsletterSection';
import { Footer } from '@/components/Footer';
import { QuickViewModal } from '@/components/QuickViewModal';

export default function HomePage() {
  const [quickViewPlushie, setQuickViewPlushie] = useState<Plushie | null>(null);

  const handleOpenQuickView = (plushie: Plushie) => {
    setQuickViewPlushie(plushie);
  };

  const handleCloseQuickView = () => {
    setQuickViewPlushie(null);
  };

  return (
    <>
      {/* Header announcement & navigation */}
      <AnnouncementBar />
      <Navbar />

      <main>
        <HeroSection />
        <MoodMatcher onQuickView={handleOpenQuickView} />
        <ProductCatalog onQuickView={handleOpenQuickView} />
        <PromiseSection />
        <MysteryBox />
        <ReviewsSection />
        <NewsletterSection />
      </main>

      <Footer />


      {/* Quick View Product Modal */}
      <QuickViewModal
        product={quickViewPlushie}
        onClose={handleCloseQuickView}
      />
    </>
  );
}
