'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  favoriteBuddy?: string;
  memberSince: string;
}

interface AuthContextType {
  user: UserProfile | null;
  isLoggedIn: boolean;
  login: (email: string, pass: string) => boolean;
  register: (name: string, email: string, pass: string, favoriteBuddy?: string) => boolean;
  logout: () => void;
  loginAsDemo: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USER: UserProfile = {
  id: 'user-cloud-1',
  name: 'Arsalan Abbas',
  email: 'arsalan@cloudpuff.haven',
  avatar: '🧸',
  favoriteBuddy: 'Rosie Paw',
  memberSince: 'September 2026',
};

const STORAGE_KEY = 'cloudpuff_user_session';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setUser(JSON.parse(saved));
      }
    } catch {
      // Fallback if local storage fails
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

  const login = (email: string, _pass: string): boolean => {
    // If logging in as demo or any email, synthesize user
    const existingName = email.includes('@') ? email.split('@')[0] : 'Cloud Parent';
    const capitalized = existingName.charAt(0).toUpperCase() + existingName.slice(1);
    
    const loggedUser: UserProfile = {
      id: `user-${Date.now()}`,
      name: email.toLowerCase() === DEMO_USER.email.toLowerCase() ? DEMO_USER.name : capitalized,
      email: email,
      avatar: '🧸',
      favoriteBuddy: 'Matcha Dino',
      memberSince: 'September 2026',
    };
    saveUserSession(loggedUser);
    return true;
  };

  const register = (name: string, email: string, _pass: string, favoriteBuddy?: string): boolean => {
    const newUser: UserProfile = {
      id: `user-${Date.now()}`,
      name: name.trim() || 'Verified Cloud Parent',
      email: email.trim(),
      avatar: '🌸',
      favoriteBuddy: favoriteBuddy || 'Strawberry Axolotl',
      memberSince: 'September 2026',
    };
    saveUserSession(newUser);
    return true;
  };

  const logout = () => {
    saveUserSession(null);
  };

  const loginAsDemo = () => {
    saveUserSession(DEMO_USER);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: isLoaded && user !== null,
        login,
        register,
        logout,
        loginAsDemo,
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
