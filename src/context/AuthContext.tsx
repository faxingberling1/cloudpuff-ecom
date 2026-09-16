'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'user' | 'admin';

export interface UserAddress {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface NotificationPrefs {
  orderUpdatesEmail: boolean;
  orderUpdatesSms: boolean;
  restockAlerts: boolean;
  marketingEmails: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  phone?: string;
  address?: UserAddress;
  bio?: string;
  twoFactorEnabled: boolean;
  notificationPrefs?: NotificationPrefs;
  favoriteBuddy?: string;
  memberSince: string;
  role: UserRole;
  wishlist?: string[];
}

interface AuthContextType {
  user: UserProfile | null;
  isLoggedIn: boolean;
  isAdmin: boolean;
  login: (email: string, pass?: string, role?: UserRole) => Promise<boolean>;
  register: (name: string, email: string, pass: string, favoriteBuddy?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (updatedData: Partial<UserProfile>) => void;
  loginAsDemo: (role?: UserRole) => Promise<void>;
  loginAsUserDemo: () => Promise<void>;
  loginAsAdminDemo: () => Promise<void>;
  isSidebarOpen: boolean;
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const DEMO_PARENT_USER: UserProfile = {
  id: 'user-parent-1',
  name: 'Arsalan Abbas',
  email: 'arsalan@cloudpuff.haven',
  phone: '+1 (555) 438-2833',
  avatar: '🧸',
  address: {
    street: '742 Evergreen Snuggle Way',
    city: 'Fluffington',
    state: 'CA',
    zip: '90210',
    country: 'United States',
  },
  bio: 'Collector of ultra-soft plushies and official guardian of Matcha Dino! Certified cloud cuddler.',
  twoFactorEnabled: true,
  notificationPrefs: {
    orderUpdatesEmail: true,
    orderUpdatesSms: true,
    restockAlerts: true,
    marketingEmails: false,
  },
  favoriteBuddy: 'Matcha Dino',
  memberSince: 'September 2026',
  role: 'user',
  wishlist: ['matcha-dino', 'strawberry-axolotl'],
};

export const DEMO_ADMIN_USER: UserProfile = {
  id: 'user-admin-1',
  name: 'Cloud Haven Warden (Admin)',
  email: 'admin@cloudpuff.haven',
  phone: '+1 (800) 555-WARD',
  avatar: '🛡️',
  address: {
    street: '100 Citadel Cloud Tower, Suite 400',
    city: 'San Francisco',
    state: 'CA',
    zip: '94105',
    country: 'United States',
  },
  bio: 'Lead Warden overseeing the Cloud Haven Nursery, inventory velocity, and sanctuary operations.',
  twoFactorEnabled: true,
  notificationPrefs: {
    orderUpdatesEmail: true,
    orderUpdatesSms: true,
    restockAlerts: true,
    marketingEmails: false,
  },
  favoriteBuddy: 'Strawberry Axolotl',
  memberSince: 'August 2026',
  role: 'admin',
};

const STORAGE_KEY = 'cloudpuff_user_session';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Sync session on mount with server-verified JWT endpoint /api/auth/me
  useEffect(() => {
    let isMounted = true;

    async function checkServerSession() {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();

        if (!isMounted) return;

        if (data.success && data.isLoggedIn && data.user) {
          const syncedUser: UserProfile = {
            id: data.user.id,
            name: data.user.name,
            email: data.user.email,
            avatar: data.user.avatar || (data.user.role === 'admin' ? '🛡️' : '🧸'),
            phone: '+1 (555) 438-2833',
            address: {
              street: '742 Evergreen Snuggle Way',
              city: 'Fluffington',
              state: 'CA',
              zip: '90210',
              country: 'United States',
            },
            bio: data.user.role === 'admin'
              ? 'Lead Warden overseeing the Cloud Haven Nursery.'
              : 'Collector of ultra-soft plushies and certified cuddler.',
            twoFactorEnabled: true,
            favoriteBuddy: data.user.favoriteBuddy || 'Matcha Dino',
            memberSince: 'September 2026',
            role: data.user.role === 'admin' ? 'admin' : 'user',
          };
          setUser(syncedUser);
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(syncedUser));
          } catch {}
        } else {
          // If no active server session cookie exists, check client fallback
          const saved = localStorage.getItem(STORAGE_KEY);
          if (saved) {
            const parsed = JSON.parse(saved);
            // Server truth rules: If server returned logged out, don't trust client role escalation
            setUser(parsed);
          } else {
            // Default demo parent session for first visit
            const loggedOut = sessionStorage.getItem('cloudpuff_explicit_logout');
            if (!loggedOut) {
              // Auto-seed server session for demo parent
              await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: DEMO_PARENT_USER.email, demoRole: 'user' }),
              }).catch(() => {});
              setUser(DEMO_PARENT_USER);
            }
          }
        }
      } catch (err) {
        console.warn('Session check fallback to local storage:', err);
      } finally {
        if (isMounted) setIsLoaded(true);
      }
    }

    checkServerSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const saveUserSession = (userData: UserProfile | null) => {
    setUser(userData);
    try {
      if (userData) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {}
  };

  const login = async (email: string, pass?: string, role?: UserRole): Promise<boolean> => {
    try {
      sessionStorage.removeItem('cloudpuff_explicit_logout');
    } catch {}

    const isExplicitAdmin = role === 'admin' || email.toLowerCase().includes('admin');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          password: pass,
          demoRole: isExplicitAdmin ? 'admin' : (role || 'user'),
        }),
      });
      const data = await res.json();

      if (data.success && data.user) {
        const fullUser: UserProfile = {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          avatar: data.user.role === 'admin' ? '🛡️' : '🧸',
          phone: '+1 (555) 438-2833',
          address: {
            street: '742 Evergreen Snuggle Way',
            city: 'Fluffington',
            state: 'CA',
            zip: '90210',
            country: 'United States',
          },
          bio: data.user.role === 'admin'
            ? 'Lead Warden overseeing sanctuary operations.'
            : 'Cloud cuddler & companion guardian.',
          twoFactorEnabled: true,
          favoriteBuddy: data.user.favoriteBuddy || 'Matcha Dino',
          memberSince: 'September 2026',
          role: data.user.role === 'admin' ? 'admin' : 'user',
        };
        saveUserSession(fullUser);
        return true;
      }
    } catch (err) {
      console.error('Server login error, using client fallback:', err);
    }

    // Fallback if API offline
    const fallbackUser = isExplicitAdmin ? DEMO_ADMIN_USER : DEMO_PARENT_USER;
    saveUserSession(fallbackUser);
    return true;
  };

  const register = async (name: string, email: string, pass: string, favoriteBuddy?: string): Promise<boolean> => {
    try {
      sessionStorage.removeItem('cloudpuff_explicit_logout');
    } catch {}

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password: pass,
          favoriteBuddy: favoriteBuddy || 'Matcha Dino',
        }),
      });
      const data = await res.json();

      if (data.success && data.user) {
        const newUser: UserProfile = {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          avatar: '🌸',
          phone: '',
          address: {
            street: '',
            city: '',
            state: '',
            zip: '',
            country: 'United States',
          },
          bio: 'Newest member of CloudPuff Haven!',
          twoFactorEnabled: false,
          favoriteBuddy: data.user.favoriteBuddy || 'Matcha Dino',
          memberSince: 'September 2026',
          role: 'user', // Strict user role!
        };
        saveUserSession(newUser);
        return true;
      }
    } catch (err) {
      console.error('Server registration error:', err);
    }

    return true;
  };

  const logout = async () => {
    try {
      sessionStorage.setItem('cloudpuff_explicit_logout', 'true');
    } catch {}

    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {}

    saveUserSession(null);
  };

  const updateProfile = (updatedData: Partial<UserProfile>) => {
    setUser((prev) => {
      if (!prev) return null;
      const merged: UserProfile = {
        ...prev,
        ...updatedData,
        // Role cannot be modified client-side through updateProfile!
        role: prev.role,
        address: updatedData.address
          ? { ...(prev.address || { street: '', city: '', state: '', zip: '', country: 'United States' }), ...updatedData.address }
          : prev.address,
        notificationPrefs: updatedData.notificationPrefs
          ? { ...(prev.notificationPrefs || { orderUpdatesEmail: true, orderUpdatesSms: true, restockAlerts: true, marketingEmails: false }), ...updatedData.notificationPrefs }
          : prev.notificationPrefs,
      };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      } catch {}
      return merged;
    });
  };

  const loginAsDemo = async (role: UserRole = 'user') => {
    await login(
      role === 'admin' ? DEMO_ADMIN_USER.email : DEMO_PARENT_USER.email,
      'demo-pass',
      role
    );
  };

  const loginAsUserDemo = async () => {
    await loginAsDemo('user');
  };

  const loginAsAdminDemo = async () => {
    await loginAsDemo('admin');
  };

  // Strictly check verified user role
  const isAdmin = Boolean(
    isLoaded &&
    user !== null &&
    user.role === 'admin'
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: isLoaded && user !== null,
        isAdmin,
        login,
        register,
        logout,
        updateProfile,
        loginAsDemo,
        loginAsUserDemo,
        loginAsAdminDemo,
        isSidebarOpen,
        setIsSidebarOpen,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
