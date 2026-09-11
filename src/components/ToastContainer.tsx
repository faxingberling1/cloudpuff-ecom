'use client';

import React from 'react';
import { useCart } from '@/context/CartContext';

export const ToastContainer: React.FC = () => {
  const { toasts } = useCart();

  return (
    <div className="toast-container" id="toast-container" aria-live="polite">
      {toasts.map(toast => (
        <div key={toast.id} className="toast">
          {toast.message}
        </div>
      ))}
    </div>
  );
};
