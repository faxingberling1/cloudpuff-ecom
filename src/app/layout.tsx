import type { Metadata } from 'next';
import { Fredoka, Nunito } from 'next/font/google';
import './globals.css';
import { SoundProvider } from '@/context/SoundContext';
import { CartProvider } from '@/context/CartContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { ConfettiCanvas } from '@/components/ConfettiCanvas';
import { ToastContainer } from '@/components/ToastContainer';
import { CartDrawer } from '@/components/CartDrawer';

const fredoka = Fredoka({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-fredoka',
  display: 'swap',
});

const nunito = Nunito({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800', '900'],
  variable: '--font-nunito',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'CloudPuff Plushies ✨ • Super Squishy Emotional Support Friends',
  description: 'Adopt hyper-squishable, handcrafted emotional support plushies designed to melt away stress. 100% cuddle-ready with cloud-grade softness!',
  icons: {
    icon: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🧸</text></svg>',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${fredoka.variable} ${nunito.variable}`}>
      <body>
        <ThemeProvider>
          <SoundProvider>
            <CartProvider>
              {/* Floating Background Ambient Particles */}
              <div className="floating-decor" aria-hidden="true">
                <div className="decor-item decor-star-1">✨</div>
                <div className="decor-item decor-star-2">🌸</div>
                <div className="decor-item decor-star-3">⭐</div>
                <div className="decor-item decor-star-4">💖</div>
                <div className="decor-item decor-cloud-1">☁️</div>
                <div className="decor-item decor-cloud-2">☁️</div>
              </div>

              {children}

              <ToastContainer />
              <ConfettiCanvas />
              <CartDrawer />
            </CartProvider>
          </SoundProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
