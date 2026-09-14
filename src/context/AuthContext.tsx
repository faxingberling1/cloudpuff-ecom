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
}

interface AuthContextType {
  user: UserProfile | null;
  isLoggedIn: boolean;
  isAdmin: boolean;
  login: (email: string, pass: string, role?: UserRole) => boolean;
  register: (name: string, email: string, pass: string, favoriteBuddy?: string) => boolean;
  logout: () => void;
  updateProfile: (updatedData: Partial<UserProfile>) => void;
  loginAsDemo: (role?: UserRole) => void;
  loginAsUserDemo: () => void;
  loginAsAdminDemo: () => void;
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

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // ensure role is present
        if (!parsed.role) {
          parsed.role = parsed.email?.toLowerCase().includes('admin') ? 'admin' : 'user';
        }
        setUser(parsed);
      } else {
        const loggedOut = sessionStorage.getItem('cloudpuff_explicit_logout');
        if (!loggedOut) {
          setUser(DEMO_PARENT_USER);
        }
      }
    } catch {
      setUser(DEMO_PARENT_USER);
    }
    setIsLoaded(true);
  }, []);

  const saveUserSession = (userData: UserProfile | null) => {
    setUser(userData);
    try {
      if (userData) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // Ignore storage errors
    }
  };

  const login = (email: string, _pass: string, role?: UserRole): boolean => {
    try {
      sessionStorage.removeItem('cloudpuff_explicit_logout');
    } catch {}

    const isExplicitAdmin = role === 'admin' || email.toLowerCase().includes('admin');
    
    if (isExplicitAdmin) {
      saveUserSession(DEMO_ADMIN_USER);
      return true;
    }

    if (email.toLowerCase() === DEMO_PARENT_USER.email.toLowerCase()) {
      saveUserSession(DEMO_PARENT_USER);
      return true;
    }

    const existingName = email.includes('@') ? email.split('@')[0] : 'Cloud Parent';
    const capitalized = existingName.charAt(0).toUpperCase() + existingName.slice(1);
    
    const loggedUser: UserProfile = {
      id: `user-${Date.now()}`,
      name: capitalized,
      email: email,
      avatar: '🧸',
      phone: '+1 (555) 438-2833',
      address: {
        street: '742 Evergreen Snuggle Way',
        city: 'Fluffington',
        state: 'CA',
        zip: '90210',
        country: 'United States',
      },
      bio: 'Cloud cuddler & companion guardian.',
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
    };
    saveUserSession(loggedUser);
    return true;
  };

  const register = (name: string, email: string, _pass: string, favoriteBuddy?: string): boolean => {
    try {
      sessionStorage.removeItem('cloudpuff_explicit_logout');
    } catch {}

    const newUser: UserProfile = {
      id: `user-${Date.now()}`,
      name: name.trim() || 'Verified Cloud Parent',
      email: email.trim(),
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
      notificationPrefs: {
        orderUpdatesEmail: true,
        orderUpdatesSms: true,
        restockAlerts: true,
        marketingEmails: false,
      },
      favoriteBuddy: favoriteBuddy || 'Strawberry Axolotl',
      memberSince: 'September 2026',
      role: email.toLowerCase().includes('admin') ? 'admin' : 'user',
    };
    saveUserSession(newUser);
    return true;
  };

  const logout = () => {
    try {
      sessionStorage.setItem('cloudpuff_explicit_logout', 'true');
    } catch {}
    saveUserSession(null);
  };

  const updateProfile = (updatedData: Partial<UserProfile>) => {
    setUser((prev) => {
      if (!prev) return null;
      const merged: UserProfile = {
        ...prev,
        ...updatedData,
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

  const loginAsDemo = (role: UserRole = 'user') => {
    try {
      sessionStorage.removeItem('cloudpuff_explicit_logout');
    } catch {}
    saveUserSession(role === 'admin' ? DEMO_ADMIN_USER : DEMO_PARENT_USER);
  };

  const loginAsUserDemo = () => {
    loginAsDemo('user');
  };

  const loginAsAdminDemo = () => {
    loginAsDemo('admin');
  };

  const isAdmin = Boolean(
    isLoaded &&
    user !== null &&
    (user.role === 'admin' || user.email.toLowerCase().includes('admin'))
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
