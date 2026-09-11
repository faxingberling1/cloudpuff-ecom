'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { CartItem, Plushie } from '@/types/plushie';
import { PLUSHIES } from '@/data/plushies';
import { useSound } from '@/context/SoundContext';

interface Toast {
  id: string;
  message: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (productId: string, qty?: number) => void;
  updateQty: (productId: string, delta: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  totalCount: number;
  subtotal: number;
  shippingThreshold: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  toasts: Toast[];
  showToast: (msg: string) => void;
  wishlist: string[];
  toggleWishlist: (id: string) => void;
}

const CartContext = createContext<CartContextType>({
  items: [],
  addItem: () => {},
  updateQty: () => {},
  removeItem: () => {},
  clearCart: () => {},
  totalCount: 0,
  subtotal: 0,
  shippingThreshold: 45.0,
  isCartOpen: false,
  setIsCartOpen: () => {},
  toasts: [],
  showToast: () => {},
  wishlist: [],
  toggleWishlist: () => {},
});

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const { playPop, playChime } = useSound();

  const shippingThreshold = 45.00;

  const normalizeImageSrc = (src?: string) => {
    if (!src) return '/assets/hero.jpg';
    if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('/')) {
      return src;
    }
    return `/${src}`;
  };

  // Load from localStorage on mount and normalize legacy paths
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('cloudpuff_cart');
      if (savedCart) {
        const parsed: CartItem[] = JSON.parse(savedCart);
        const normalized = parsed.map(item => ({
          ...item,
          image: normalizeImageSrc(item.image)
        }));
        setItems(normalized);
        localStorage.setItem('cloudpuff_cart', JSON.stringify(normalized));
      }
      const savedWishlist = localStorage.getItem('cloudpuff_wishlist');
      if (savedWishlist) {
        setWishlist(JSON.parse(savedWishlist));
      }
    } catch {}
  }, []);

  // Sync cart to localStorage
  const saveCart = (newItems: CartItem[]) => {
    const normalized = newItems.map(item => ({
      ...item,
      image: normalizeImageSrc(item.image)
    }));
    setItems(normalized);
    localStorage.setItem('cloudpuff_cart', JSON.stringify(normalized));
  };

  const showToast = (message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  const addItem = (productId: string, qty: number = 1) => {
    const product = PLUSHIES.find(p => p.id === productId);
    if (!product) return;

    let updated: CartItem[];
    const existing = items.find(i => i.id === productId);
    if (existing) {
      updated = items.map(i => i.id === productId ? { ...i, qty: i.qty + qty } : i);
    } else {
      updated = [...items, {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        qty: qty
      }];
    }

    saveCart(updated);
    playChime();
    showToast(`✨ ${product.name} hopped into your cart! 💖`);
  };

  const updateQty = (productId: string, delta: number) => {
    const existing = items.find(i => i.id === productId);
    if (!existing) return;

    if (existing.qty + delta <= 0) {
      removeItem(productId);
      return;
    }

    const updated = items.map(i => i.id === productId ? { ...i, qty: i.qty + delta } : i);
    playPop();
    saveCart(updated);
  };

  const removeItem = (productId: string) => {
    const item = items.find(i => i.id === productId);
    const updated = items.filter(i => i.id !== productId);
    playPop();
    saveCart(updated);
    if (item) {
      showToast(`👋 ${item.name} went back to cuddle cloud`);
    }
  };

  const clearCart = () => {
    saveCart([]);
  };

  const toggleWishlist = (id: string) => {
    playPop();
    setWishlist(prev => {
      let updated: string[];
      if (prev.includes(id)) {
        updated = prev.filter(item => item !== id);
      } else {
        updated = [...prev, id];
        showToast('Added to your Love Wishlist! 🎀');
      }
      localStorage.setItem('cloudpuff_wishlist', JSON.stringify(updated));
      return updated;
    });
  };

  const totalCount = items.reduce((sum, item) => sum + item.qty, 0);
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.qty), 0);

  return (
    <CartContext.Provider value={{
      items,
      addItem,
      updateQty,
      removeItem,
      clearCart,
      totalCount,
      subtotal,
      shippingThreshold,
      isCartOpen,
      setIsCartOpen,
      toasts,
      showToast,
      wishlist,
      toggleWishlist
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
