'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { TrackingModal } from '@/components/TrackingModal';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useSound } from '@/context/SoundContext';
import { useTheme } from '@/context/ThemeContext';
import { PLUSHIES } from '@/data/plushies';
import { confettiEngine } from '@/utils/confetti';

interface OrderItem {
  id: string;
  registryNumber: string;
  plushieName: string;
  parentName: string;
  date: string;
  image: string;
  status: 'Processing' | 'In Snuggle Transit ☁️' | 'Delivered & Snuggled 🏡';
  destination: string;
  total: number;
  paymentMethod: string;
  species?: string;
}

interface InventoryItem {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  image: string;
  squishFactor: string;
}

const INITIAL_ORDERS: OrderItem[] = [
  {
    id: 'ord-101',
    registryNumber: 'CP-534148',
    plushieName: 'Matcha Dino',
    parentName: 'Arsalan Abbas',
    date: 'Sep 12, 2026',
    image: '/assets/dino.jpg',
    status: 'In Snuggle Transit ☁️',
    destination: '77 Blossom Blvd, Snuggle Town',
    total: 34.99,
    paymentMethod: 'CloudPay 🍎',
    species: 'Baby Stegosaurus',
  },
  {
    id: 'ord-102',
    registryNumber: 'CP-884912',
    plushieName: 'Pip & Peaches',
    parentName: 'Chloe Bennett',
    date: 'Sep 13, 2026',
    image: '/assets/hero.jpg',
    status: 'Delivered & Snuggled 🏡',
    destination: '123 Cloud Way, Fluff City',
    total: 32.00,
    paymentMethod: 'Credit Card 💳',
    species: 'Strawberry Bunny',
  },
  {
    id: 'ord-103',
    registryNumber: 'CP-219403',
    plushieName: 'Boba the Bear',
    parentName: 'Emily Watson',
    date: 'Sep 14, 2026',
    image: '/assets/bear.jpg',
    status: 'Processing',
    destination: '45 Sweet Honey Lane, Seattle, WA',
    total: 34.00,
    paymentMethod: 'PayPal 🅿️',
    species: 'Honey Cuddle Bear',
  },
  {
    id: 'ord-104',
    registryNumber: 'CP-771239',
    plushieName: 'Cloudia the Kitty',
    parentName: 'Arsalan Abbas',
    date: 'Sep 14, 2026',
    image: '/assets/cat.jpg',
    status: 'In Snuggle Transit ☁️',
    destination: '77 Blossom Blvd, Snuggle Town',
    total: 31.00,
    paymentMethod: 'Credit Card 💳',
    species: 'Angora Cloud Kitten',
  },
  {
    id: 'ord-105',
    registryNumber: 'CP-990145',
    plushieName: 'Mochi the Seal',
    parentName: 'David Kim',
    date: 'Sep 14, 2026',
    image: '/assets/seal.jpg',
    status: 'Processing',
    destination: '89 Ocean Breeze Ave, San Diego, CA',
    total: 28.00,
    paymentMethod: 'CloudPay 🍎',
    species: 'Fluffy Ocean Seal',
  },
];

const WEEKLY_DATA = [
  { day: 'Mon', adoptions: 42, revenue: 1420 },
  { day: 'Tue', adoptions: 58, revenue: 1980 },
  { day: 'Wed', adoptions: 64, revenue: 2150 },
  { day: 'Thu', adoptions: 79, revenue: 2780 },
  { day: 'Fri', adoptions: 95, revenue: 3410 },
  { day: 'Sat', adoptions: 120, revenue: 4320 },
  { day: 'Sun', adoptions: 104, revenue: 3840 },
];

function DashboardInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTabParam = searchParams?.get('tab');

  const { user, isLoggedIn, isAdmin, logout, updateProfile, loginAsUserDemo, loginAsAdminDemo } = useAuth();
  const { wishlist, toggleWishlist, addItem, showToast, setIsCartOpen } = useCart();
  const { playPop, playChime, playSquish } = useSound();
  const { isNightMode, toggleNightMode, isLullabyPlaying, toggleLullaby } = useTheme();

  const isUserAdmin = Boolean(
    isAdmin ||
    user?.role === 'admin' ||
    user?.email?.toLowerCase().includes('admin')
  );

  // Active view: 'parent' (Customer Cuddle Hub) vs 'admin' (Shop Sanctuary Manager)
  const [activeTab, setActiveTab] = useState<'parent' | 'admin'>('parent');
  const isAdminView = isUserAdmin && activeTab === 'admin';

  // Dashboard Sub-section: 'overview' | 'orders' | 'profile' | 'security' | 'billing' | 'notifications' | 'preferences' | 'wishlist'
  type DashboardSection = 'overview' | 'orders' | 'profile' | 'security' | 'billing' | 'notifications' | 'preferences' | 'wishlist';
  const [dashboardSection, setDashboardSection] = useState<DashboardSection>(() => {
    if (initialTabParam === 'orders') return 'orders';
    if (initialTabParam === 'profile') return 'profile';
    if (initialTabParam === 'security') return 'security';
    if (initialTabParam === 'billing') return 'billing';
    if (initialTabParam === 'notifications') return 'notifications';
    if (initialTabParam === 'wishlist') return 'wishlist';
    if (initialTabParam === 'preferences') return isUserAdmin ? 'preferences' : 'billing';
    return 'overview';
  });

  // Sync tab param from URL
  useEffect(() => {
    const tabParam = searchParams?.get('tab');
    if (tabParam && ['overview', 'orders', 'profile', 'security', 'billing', 'notifications', 'preferences', 'wishlist'].includes(tabParam)) {
      if (tabParam === 'preferences' && !isUserAdmin) {
        setDashboardSection('billing');
      } else {
        setDashboardSection(tabParam as DashboardSection);
      }
    }
  }, [searchParams, isUserAdmin]);

  const handleSectionChange = (section: DashboardSection) => {
    playPop();
    setDashboardSection(section);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', section);
      window.history.replaceState({}, '', url.toString());
    }
  };

  // Profile Editor Form State
  const [profileName, setProfileName] = useState(user?.name || 'Arsalan Abbas');
  const [profileEmail, setProfileEmail] = useState(user?.email || 'arsalan@cloudpuff.haven');
  const [profilePhone, setProfilePhone] = useState(user?.phone || '+1 (555) 438-2833');
  const [profileAvatar, setProfileAvatar] = useState(user?.avatar || '🧸');
  const [profileStreet, setProfileStreet] = useState(user?.address?.street || '742 Evergreen Snuggle Way');
  const [profileCity, setProfileCity] = useState(user?.address?.city || 'Fluffington');
  const [profileState, setProfileState] = useState(user?.address?.state || 'CA');
  const [profileZip, setProfileZip] = useState(user?.address?.zip || '90210');
  const [profileCountry, setProfileCountry] = useState(user?.address?.country || 'United States');
  const [profileBio, setProfileBio] = useState(user?.bio || 'Collector of ultra-soft plushies and official guardian of Matcha Dino! Certified cloud cuddler.');
  const [favoriteCompanion, setFavoriteCompanion] = useState(user?.favoriteBuddy || 'Matcha Dino');

  // Sync profile form fields when user object changes
  useEffect(() => {
    if (user) {
      setProfileName(user.name);
      setProfileEmail(user.email);
      setProfileAvatar(user.avatar || (isUserAdmin ? '🛡️' : '🧸'));
      if (user.phone) setProfilePhone(user.phone);
      if (user.bio) setProfileBio(user.bio);
      if (user.address) {
        setProfileStreet(user.address.street);
        setProfileCity(user.address.city);
        setProfileState(user.address.state);
        setProfileZip(user.address.zip);
        setProfileCountry(user.address.country);
      }
      if (user.favoriteBuddy) setFavoriteCompanion(user.favoriteBuddy);
    }
  }, [user, isUserAdmin]);

  // Security & 2FA State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [twoFactorActive, setTwoFactorActive] = useState<boolean>(user?.twoFactorEnabled ?? true);
  const [is2FAModalOpen, setIs2FAModalOpen] = useState<boolean>(false);
  const [totpCode, setTotpCode] = useState<string>('');
  const [backupCodesCopied, setBackupCodesCopied] = useState<boolean>(false);
  const [backupCodes] = useState<string[]>([
    'CP-9941-X1',
    'CP-8240-Y2',
    'CP-3819-Z3',
    'CP-7742-A4',
    'CP-5519-B5',
    'CP-1284-C6',
  ]);

  // Active Login Sessions
  const [sessions, setSessions] = useState([
    {
      id: 'sess-1',
      device: 'Windows 11 PC (Current Device)',
      browser: 'Chrome 128.0 • Desktop',
      location: 'San Jose, CA, United States',
      time: 'Active Now',
      isCurrent: true,
      icon: '💻',
    },
    {
      id: 'sess-2',
      device: 'iPhone 16 Pro',
      browser: 'Mobile Safari 18.0',
      location: 'Snuggle Town, CA, United States',
      time: 'Active 2 hours ago',
      isCurrent: false,
      icon: '📱',
    },
    {
      id: 'sess-3',
      device: 'iPad Pro 12.9"',
      browser: 'Safari Mobile • iPadOS',
      location: 'Fluff City, CA, United States',
      time: 'Active Sep 10, 2026',
      isCurrent: false,
      icon: '📟',
    },
  ]);

  // Security Audit Log
  const [auditLogs] = useState([
    {
      id: 'log-1',
      action: '2FA TOTP Code Verified',
      device: 'Chrome on Windows 11',
      ip: '192.168.1.42',
      time: 'Today, 02:15 AM',
      status: 'success',
    },
    {
      id: 'log-2',
      action: 'Profile Avatar & Address Updated',
      device: 'Chrome on Windows 11',
      ip: '192.168.1.42',
      time: 'Yesterday, 10:30 PM',
      status: 'success',
    },
    {
      id: 'log-3',
      action: 'Login via Authenticator App',
      device: 'Safari on iPhone 16 Pro',
      ip: '10.0.0.15',
      time: 'Sep 13, 2026, 04:12 PM',
      status: 'success',
    },
    {
      id: 'log-4',
      action: 'Unrecognized Location Login Blocked',
      device: 'Unknown Browser / VPN Node',
      ip: '185.220.101.5',
      time: 'Sep 08, 2026, 01:20 AM',
      status: 'blocked',
    },
  ]);

  // Preferences & Billing
  const [savedCards, setSavedCards] = useState([
    {
      id: 'card-1',
      brand: 'CloudPay / Apple Pay',
      last4: 'Apple Wallet',
      exp: 'Synced',
      isDefault: true,
      icon: '🍎',
    },
    {
      id: 'card-2',
      brand: 'Visa Snuggle Card',
      last4: '4242',
      exp: '08/29',
      isDefault: false,
      icon: '💳',
    },
    {
      id: 'card-3',
      brand: 'Mastercard Fluff',
      last4: '8819',
      exp: '12/27',
      isDefault: false,
      icon: '💳',
    },
  ]);

  const [notificationSettings, setNotificationSettings] = useState({
    orderUpdatesEmail: true,
    orderUpdatesSms: true,
    restockAlerts: true,
    marketingEmails: false,
  });

  const [isAddCardOpen, setIsAddCardOpen] = useState(false);
  const [newCardNumber, setNewCardNumber] = useState('');
  const [newCardExp, setNewCardExp] = useState('');
  const [newCardCvc, setNewCardCvc] = useState('');

  // Automatically adapt default view based on role
  useEffect(() => {
    if (isUserAdmin) {
      setActiveTab('admin');
    } else {
      setActiveTab('parent');
    }
  }, [isUserAdmin]);

  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);

  // Head Pat Counter
  const [headPats, setHeadPats] = useState<number>(14);
  const [activeBuddySpeech, setActiveBuddySpeech] = useState<string>(
    'Yay! Thank you for the sweet cuddles today! 🌸'
  );

  // Orders State (Persistable & editable in Admin Mode)
  const [orders, setOrders] = useState<OrderItem[]>(INITIAL_ORDERS);
  const [selectedOrderForTracking, setSelectedOrderForTracking] = useState<OrderItem | null>(null);
  const [certificateViewOrder, setCertificateViewOrder] = useState<OrderItem | null>(null);

  // Admin filter & search
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [orderSearchQuery, setOrderSearchQuery] = useState<string>('');

  // Inventory State with stock adjustment
  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    return PLUSHIES.map((p, idx) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      stock: [24, 18, 9, 32, 14, 5][idx % 6],
      category: p.category,
      image: p.image,
      squishFactor: p.squishFactor,
    }));
  });

  // Store announcement banner state
  const [bannerNotice, setBannerNotice] = useState<string>(
    '🎉 Autumn Snuggle Fest: Free Berry Beret with every Matcha Dino adoption this week!'
  );
  const [noticeDraft, setNoticeDraft] = useState<string>('');
  const [isNoticeEditing, setIsNoticeEditing] = useState<boolean>(false);

  // New Plushie Modal
  const [isAddPlushieOpen, setIsAddPlushieOpen] = useState(false);
  const [newPlushieName, setNewPlushieName] = useState('');
  const [newPlushiePrice, setNewPlushiePrice] = useState('32.00');
  const [newPlushieStock, setNewPlushieStock] = useState('25');
  const [newPlushieCategory, setNewPlushieCategory] = useState('kawaii');

  useEffect(() => {
    const savedPats = localStorage.getItem('cloudpuff_user_pats');
    if (savedPats) {
      setHeadPats(parseInt(savedPats, 10));
    }
  }, []);

  const handleGiveHeadPat = () => {
    playSquish();
    const newCount = headPats + 1;
    setHeadPats(newCount);
    try {
      localStorage.setItem('cloudpuff_user_pats', newCount.toString());
    } catch {
      // Ignore storage errors
    }

    const cheers = [
      '*squishy purrs* You are my favorite human in the whole sky! ☁️✨',
      'My fluff feels 100% softer now! 🍓💖',
      '*happy wiggle* Double squish power unlocked! 🧸',
      'Warm hugs forever and ever! 🌸',
      'Nuzzle mode activated! *zzz cuddle* 💤',
    ];
    setActiveBuddySpeech(cheers[Math.floor(Math.random() * cheers.length)]);
    showToast('🧸 *squish* Virtual head pat delivered! +10 Fluff Love');
  };

  const handleConfirmSignOut = () => {
    playSquish();
    logout();
    setShowSignOutConfirm(false);
    showToast('👋 Signed out safely. Have sweet snuggles!');
    router.push('/');
  };

  const handleUpdateOrderStatus = (orderId: string, newStatus: OrderItem['status']) => {
    playPop();
    setOrders((prev) =>
      prev.map((ord) => (ord.id === orderId ? { ...ord, status: newStatus } : ord))
    );
    showToast(`📦 Order ${orderId} marked as: ${newStatus}`);
  };

  const handleStockChange = (itemId: string, delta: number) => {
    playPop();
    setInventory((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const updatedStock = Math.max(0, item.stock + delta);
          return { ...item, stock: updatedStock };
        }
        return item;
      })
    );
  };

  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: 'Not Entered', color: '#94A3B8', percent: 0 };
    let score = 0;
    if (pwd.length >= 8) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;
    if (pwd.length >= 12) score += 1;
    
    if (score <= 1) return { score: 1, label: 'Weak ☁️', color: '#EF4444', percent: 25 };
    if (score === 2) return { score: 2, label: 'Fair 🌸', color: '#F59E0B', percent: 50 };
    if (score === 3) return { score: 3, label: 'Strong 🧸', color: '#10B981', percent: 75 };
    return { score: 4, label: 'Fluff-Proof 🛡️', color: '#059669', percent: 100 };
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName.trim()) {
      showToast('⚠️ Please provide your cuddler name');
      return;
    }
    updateProfile({
      name: profileName.trim(),
      email: profileEmail.trim(),
      avatar: profileAvatar,
      phone: profilePhone.trim(),
      address: {
        street: profileStreet.trim(),
        city: profileCity.trim(),
        state: profileState.trim(),
        zip: profileZip.trim(),
        country: profileCountry,
      },
      bio: profileBio.trim(),
      favoriteBuddy: favoriteCompanion,
    });
    playChime();
    confettiEngine.burst();
    showToast('✨ Sanctuary Profile saved successfully!');
  };

  const handlePasswordUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      showToast('⚠️ Please enter your current password');
      return;
    }
    if (newPassword.length < 8) {
      showToast('⚠️ New password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('⚠️ Passwords do not match');
      return;
    }
    playChime();
    confettiEngine.burst();
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    showToast('🔑 Password changed securely!');
  };

  const handleToggle2FA = () => {
    if (twoFactorActive) {
      setTwoFactorActive(false);
      updateProfile({ twoFactorEnabled: false });
      playSquish();
      showToast('⚠️ Two-Factor Authentication disabled');
    } else {
      playPop();
      setIs2FAModalOpen(true);
    }
  };

  const handleVerify2FACode = (e: React.FormEvent) => {
    e.preventDefault();
    if (totpCode.trim().length !== 6) {
      showToast('⚠️ Please enter the 6-digit TOTP code');
      return;
    }
    setTwoFactorActive(true);
    updateProfile({ twoFactorEnabled: true });
    setIs2FAModalOpen(false);
    setTotpCode('');
    playChime();
    confettiEngine.burst();
    showToast('🛡️ Two-Factor Authentication enabled and paired!');
  };

  const handleCopyBackupCodes = () => {
    playPop();
    const formatted = backupCodes.join('\n');
    navigator.clipboard?.writeText(formatted);
    setBackupCodesCopied(true);
    setTimeout(() => setBackupCodesCopied(false), 2500);
    showToast('📋 Backup recovery codes copied to clipboard!');
  };

  const handleRevokeSessions = () => {
    playSquish();
    setSessions((prev) => prev.filter((s) => s.isCurrent));
    showToast('🔒 All other active sessions revoked safely!');
  };

  const handleToggleNotification = (key: keyof typeof notificationSettings) => {
    playPop();
    const updated = {
      ...notificationSettings,
      [key]: !notificationSettings[key],
    };
    setNotificationSettings(updated);
    updateProfile({ notificationPrefs: updated });
    showToast('🔔 Notification preferences updated');
  };

  const handleSetDefaultCard = (cardId: string) => {
    playPop();
    setSavedCards((prev) =>
      prev.map((c) => ({
        ...c,
        isDefault: c.id === cardId,
      }))
    );
    showToast('💳 Default payment method updated');
  };

  const handleDeleteCard = (cardId: string) => {
    playSquish();
    setSavedCards((prev) => prev.filter((c) => c.id !== cardId));
    showToast('🗑️ Payment card removed');
  };

  const handleAddCardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanDigits = newCardNumber.replace(/\D/g, '');
    if (cleanDigits.length < 15) {
      showToast('⚠️ Please enter a valid card number');
      return;
    }
    const newCard = {
      id: `card-${Date.now()}`,
      brand: cleanDigits.startsWith('4') ? 'Visa Plush' : 'Mastercard Fluff',
      last4: cleanDigits.slice(-4),
      exp: newCardExp || '12/28',
      isDefault: false,
      icon: '💳',
    };
    setSavedCards((prev) => [...prev, newCard]);
    setIsAddCardOpen(false);
    setNewCardNumber('');
    setNewCardExp('');
    setNewCardCvc('');
    playChime();
    confettiEngine.burst();
    showToast('💳 New card added to your sanctuary wallet!');
  };

  const handleSaveNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeDraft.trim()) return;
    setBannerNotice(noticeDraft.trim());
    setIsNoticeEditing(false);
    playChime();
    confettiEngine.burst();
    showToast('📢 Sanctuary announcement broadcasted successfully!');
  };

  const handleAddPlushieSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlushieName.trim()) return;

    const newItem: InventoryItem = {
      id: `plushie-${Date.now()}`,
      name: newPlushieName.trim(),
      price: parseFloat(newPlushiePrice) || 29.99,
      stock: parseInt(newPlushieStock, 10) || 20,
      category: newPlushieCategory,
      image: '/assets/hero.jpg',
      squishFactor: '10 / 10',
    };

    setInventory((prev) => [newItem, ...prev]);
    setIsAddPlushieOpen(false);
    setNewPlushieName('');
    playChime();
    confettiEngine.burst();
    showToast(`✨ Welcome ${newItem.name} to the CloudPuff catalog!`);
  };

  // Filtered orders for admin view
  const filteredAdminOrders = orders.filter((o) => {
    const matchesFilter =
      orderStatusFilter === 'all'
        ? true
        : orderStatusFilter === 'processing'
        ? o.status === 'Processing'
        : orderStatusFilter === 'transit'
        ? o.status.includes('Transit')
        : o.status.includes('Delivered');

    const q = orderSearchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      o.registryNumber.toLowerCase().includes(q) ||
      o.plushieName.toLowerCase().includes(q) ||
      o.parentName.toLowerCase().includes(q);

    return matchesFilter && matchesSearch;
  });

  // Customer order filter & search
  const [customerOrderFilter, setCustomerOrderFilter] = useState<'all' | 'transit' | 'delivered'>('all');
  const [customerOrderSearch, setCustomerOrderSearch] = useState<string>('');
  const [orderHeadPats, setOrderHeadPats] = useState<Record<string, number>>({});

  const handleOrderHeadPat = (regNum: string, name: string) => {
    playSquish();
    setOrderHeadPats((prev) => ({
      ...prev,
      [regNum]: (prev[regNum] || 0) + 1,
    }));
    showToast(`🧸 *squish* ${name} closed their eyes happily from your head pat!`);
  };

  // User orders for customer view
  const customerOrders = orders.filter(
    (o) =>
      user &&
      (o.parentName.toLowerCase().includes(user.name.toLowerCase()) ||
        o.parentName.toLowerCase().includes('certified') ||
        o.parentName.toLowerCase().includes('arsalan'))
  );

  const filteredCustomerOrders = customerOrders.filter((o) => {
    const matchesFilter =
      customerOrderFilter === 'all'
        ? true
        : customerOrderFilter === 'transit'
        ? o.status.includes('Transit')
        : o.status.includes('Delivered');

    const q = customerOrderSearch.toLowerCase().trim();
    const matchesSearch =
      !q ||
      o.registryNumber.toLowerCase().includes(q) ||
      o.plushieName.toLowerCase().includes(q) ||
      (o.species && o.species.toLowerCase().includes(q)) ||
      o.destination.toLowerCase().includes(q);

    return matchesFilter && matchesSearch;
  });

  const totalStoreRevenue = orders.reduce((sum, ord) => sum + ord.total, 19480);
  const totalStockCount = inventory.reduce((sum, item) => sum + item.stock, 0);

  const handleAdminNavClick = (sectionId: string) => {
    playPop();
    if (activeTab !== 'admin') {
      setActiveTab('admin');
    }
    setTimeout(() => {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 120);
  };

  const handleParentNavClick = (sectionId: string) => {
    playPop();
    if (activeTab !== 'parent') {
      setActiveTab('parent');
    }
    setTimeout(() => {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 120);
  };

  const scrollToSection = (sectionId: string) => {
    playPop();
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const wishlistedPlushies = PLUSHIES.filter((p) => wishlist.includes(p.id));
  const totalWishlistValue = wishlistedPlushies.reduce((sum, p) => sum + p.price, 0);

  const handleAdoptAllWishlist = () => {
    if (wishlistedPlushies.length === 0) return;
    playSquish();
    confettiEngine.burst();
    wishlistedPlushies.forEach((p) => {
      addItem(p.id, 1);
    });
    showToast(`🎉 Adopted all ${wishlistedPlushies.length} saved plushies! Added to basket.`);
    setIsCartOpen(true);
  };

  const handleShareWishlist = () => {
    playChime();
    if (typeof window !== 'undefined') {
      navigator.clipboard?.writeText(`${window.location.origin}/wishlist`);
      showToast('💌 Wishlist link copied! Share it with friends & family.');
    }
  };

  const AVATAR_OPTIONS = ['🧸', '🌸', '🦖', '🍓', '🐱', '🦭', '🥞', '✨', '👑', '🐰', '🐼', '🦊'];

  const renderProfileSection = (isAdminMode: boolean) => (
    <div className="dashboard-subview-wrapper fade-in-section">
      <div className={`orders-header-banner ${isAdminMode ? 'admin-banner' : ''}`}>
        <span className={`orders-badge ${isAdminMode ? 'admin' : ''}`}>
          {isAdminMode ? '🛡️ Sanctuary Staff Profile' : '👤 Cuddle Hub Profile'}
        </span>
        <h2 className="orders-title">
          {isAdminMode ? 'Warden Identity & Sanctuary Credentials' : 'Profile Editor & Cuddler Identity'}
        </h2>
        <p className="orders-subtitle">
          {isAdminMode
            ? 'Manage administrative identity, certified contact channels, operational station dispatch info, and sanctuary role badge.'
            : 'Personalize your verified cloud parent profile, choose your signature plushie avatar, and manage your delivery addresses.'}
        </p>
      </div>

      <div className="profile-editor-layout">
        {/* Left Column: Avatar & Companion Affinity */}
        <div className="profile-left-col">
          <div className="dash-box profile-avatar-box" id="profile-avatar-studio">
            <div className="dash-box-header">
              <div>
                <span className="dash-box-pill">🎨 Identity Studio</span>
                <h3 className="dash-box-title">Signature Avatar</h3>
              </div>
            </div>

            <div className="avatar-preview-display">
              <div className="avatar-preview-halo">
                <span className="avatar-preview-emoji">{profileAvatar}</span>
                <span className="avatar-sparkle-dot">✨</span>
              </div>
              <h4 className="avatar-preview-name">{profileName || 'Cloud Parent'}</h4>
              <span className="avatar-preview-badge">
                {isAdminMode ? '🛡️ Sanctuary Lead Warden' : '✨ Verified Cloud Parent'}
              </span>
              <p className="avatar-preview-note">
                Visible across adoption certificates, gift cards, and nursery records.
              </p>
            </div>

            <div className="avatar-picker-section">
              <label className="field-label">Choose Companion Avatar:</label>
              <div className="avatar-picker-grid">
                {AVATAR_OPTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    className={`avatar-pick-btn ${profileAvatar === emoji ? 'selected' : ''}`}
                    onClick={() => {
                      playPop();
                      setProfileAvatar(emoji);
                    }}
                    title={`Select ${emoji}`}
                  >
                    <span>{emoji}</span>
                    {profileAvatar === emoji && <span className="avatar-check-tick">✓</span>}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-field-group" style={{ marginTop: '1.4rem' }}>
              <label className="field-label">Favorite Plushie Companion:</label>
              <select
                className="form-select"
                value={favoriteCompanion}
                onChange={(e) => {
                  playPop();
                  setFavoriteCompanion(e.target.value);
                }}
              >
                {PLUSHIES.map((p) => (
                  <option key={p.id} value={p.name}>
                    {p.name} ({p.category})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Right Column: Profile Form Details */}
        <div className="profile-right-col">
          <form onSubmit={handleSaveProfile} className="dash-box profile-form-box" id="profile-personal-details">
            <div className="dash-box-header">
              <div>
                <span className="dash-box-pill">📝 Details</span>
                <h3 className="dash-box-title">Personal & Delivery Profile</h3>
              </div>
              <span className="verified-status-tag">✓ Cloud Verified</span>
            </div>

            <div className="form-grid-two">
              <div className="form-field-group">
                <label className="field-label">Full Display Name *</label>
                <input
                  type="text"
                  className="form-input"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  placeholder="e.g. Arsalan Abbas"
                  required
                />
              </div>

              <div className="form-field-group">
                <label className="field-label">Email Address (Login Account)</label>
                <input
                  type="email"
                  className="form-input"
                  value={profileEmail}
                  onChange={(e) => setProfileEmail(e.target.value)}
                  placeholder="name@cloudpuff.haven"
                  required
                />
              </div>
            </div>

            <div className="form-grid-two">
              <div className="form-field-group">
                <label className="field-label">Contact Phone (For Courier Updates)</label>
                <input
                  type="tel"
                  className="form-input"
                  value={profilePhone}
                  onChange={(e) => setProfilePhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                />
              </div>

              <div className="form-field-group">
                <label className="field-label">Sanctuary Role & Privileges</label>
                <input
                  type="text"
                  className="form-input read-only-input"
                  value={isAdminMode ? 'Administrator (Full Access)' : 'Verified Customer (VIP Adopter)'}
                  readOnly
                />
              </div>
            </div>

            <div className="form-divider" id="profile-delivery-address">
              <span>🏡 Snuggle Delivery Sanctuary Address</span>
            </div>

            <div className="form-field-group">
              <label className="field-label">Street Address</label>
              <input
                type="text"
                className="form-input"
                value={profileStreet}
                onChange={(e) => setProfileStreet(e.target.value)}
                placeholder="742 Evergreen Snuggle Way"
              />
            </div>

            <div className="form-grid-three">
              <div className="form-field-group">
                <label className="field-label">City</label>
                <input
                  type="text"
                  className="form-input"
                  value={profileCity}
                  onChange={(e) => setProfileCity(e.target.value)}
                  placeholder="Fluffington"
                />
              </div>

              <div className="form-field-group">
                <label className="field-label">State / Province</label>
                <input
                  type="text"
                  className="form-input"
                  value={profileState}
                  onChange={(e) => setProfileState(e.target.value)}
                  placeholder="CA"
                />
              </div>

              <div className="form-field-group">
                <label className="field-label">ZIP / Postal</label>
                <input
                  type="text"
                  className="form-input"
                  value={profileZip}
                  onChange={(e) => setProfileZip(e.target.value)}
                  placeholder="90210"
                />
              </div>
            </div>

            <div className="form-field-group">
              <label className="field-label">Country / Territory</label>
              <select
                className="form-select"
                value={profileCountry}
                onChange={(e) => setProfileCountry(e.target.value)}
              >
                <option value="United States">United States</option>
                <option value="Canada">Canada</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="Japan">Japan</option>
                <option value="Australia">Australia</option>
                <option value="Germany">Germany</option>
                <option value="France">France</option>
              </select>
            </div>

            <div className="form-divider" id="profile-cuddle-bio">
              <span>🌸 Cuddle Bio & Guardian Notes</span>
            </div>

            <div className="form-field-group">
              <label className="field-label">Cuddler Bio</label>
              <textarea
                className="form-textarea"
                rows={3}
                value={profileBio}
                onChange={(e) => setProfileBio(e.target.value)}
                placeholder="Tell us about your love for plushies, your favorite buddy memories, or custom delivery notes..."
              />
            </div>

            <div className="profile-actions-row">
              <button type="submit" className="btn-primary">
                <span>Save Profile Changes 💾</span>
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  playPop();
                  if (user) {
                    setProfileName(user.name);
                    setProfileEmail(user.email);
                    setProfileAvatar(user.avatar || (isUserAdmin ? '🛡️' : '🧸'));
                    if (user.phone) setProfilePhone(user.phone);
                    if (user.bio) setProfileBio(user.bio);
                    if (user.address) {
                      setProfileStreet(user.address.street);
                      setProfileCity(user.address.city);
                      setProfileState(user.address.state);
                      setProfileZip(user.address.zip);
                      setProfileCountry(user.address.country);
                    }
                  }
                  showToast('Reverted unsaved changes');
                }}
              >
                Revert Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  const renderSecuritySection = (isAdminMode: boolean) => {
    const pwdStrength = getPasswordStrength(newPassword);

    return (
      <div className="dashboard-subview-wrapper fade-in-section">
        <div className={`orders-header-banner ${isAdminMode ? 'admin-banner' : ''}`}>
          <span className={`orders-badge ${isAdminMode ? 'admin' : ''}`}>
            {isAdminMode ? '🛡️ Admin Fort Knox Protocol' : '🔐 Sanctuary Account Shield'}
          </span>
          <h2 className="orders-title">
            {isAdminMode ? 'Admin Authentication, 2FA & Audit Logs' : 'Account Password & Login Security'}
          </h2>
          <p className="orders-subtitle">
            {isAdminMode
              ? 'Enforce administrative multi-factor verification, audit login telemetry, and revoke compromised operational sessions.'
              : 'Manage your login password and active device sessions to keep your cuddle orders and account safe.'}
          </p>
        </div>

        <div className="security-grid-layout">
          {/* Card 1: Two-Factor Authentication (2FA) - Admin Ops Only */}
          {isAdminMode && (
            <div className="dash-box security-card-box highlight-shield" id="security-2fa-section">
              <div className="dash-box-header">
                <div>
                  <span className="dash-box-pill">🛡️ Multi-Factor Auth</span>
                  <h3 className="dash-box-title">Two-Factor Authentication (2FA)</h3>
                </div>
                <span className={`security-status-chip ${twoFactorActive ? 'active' : 'warn'}`}>
                  {twoFactorActive ? '● 2FA Active & Enforced' : '⚠️ 2FA Disabled'}
                </span>
              </div>

              <div className="two-factor-content-wrap">
                <div className="two-factor-icon-row">
                  <div className="two-factor-shield-icon">
                    {twoFactorActive ? '🛡️' : '🔓'}
                  </div>
                  <div className="two-factor-text">
                    <strong>{twoFactorActive ? 'High-Security Plushie Protection Enabled' : 'Account Vulnerable to Unauthorized Access'}</strong>
                    <p>
                      Two-factor authentication adds an extra layer of defense. Whenever you sign in, you will be prompted for an authentic 6-digit TOTP code generated by Google Authenticator, Authy, or Apple Passwords.
                    </p>
                  </div>
                </div>

                <div className="two-factor-actions-bar">
                  <button
                    type="button"
                    className={`btn-2fa-toggle ${twoFactorActive ? 'btn-danger-outline' : 'btn-primary'}`}
                    onClick={handleToggle2FA}
                  >
                    {twoFactorActive ? 'Disable 2FA Protection ⚠️' : 'Activate 2FA Authenticator 🔐'}
                  </button>

                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => {
                      playPop();
                      setIs2FAModalOpen(true);
                    }}
                  >
                    {twoFactorActive ? 'Re-pair Authenticator App 📱' : 'View Setup Guide 📖'}
                  </button>
                </div>

                {/* Backup Recovery Codes Box */}
                <div className="backup-codes-container">
                  <div className="backup-codes-header">
                    <div>
                      <strong>Emergency Backup Recovery Codes</strong>
                      <p>Store these offline in case you lose your phone or authenticator app.</p>
                    </div>
                    <button
                      type="button"
                      className="btn-copy-backup-codes"
                      onClick={handleCopyBackupCodes}
                    >
                      {backupCodesCopied ? '✓ Copied All Codes!' : '📋 Copy All'}
                    </button>
                  </div>

                  <div className="backup-codes-grid">
                    {backupCodes.map((code, idx) => (
                      <div key={code} className="backup-code-pill">
                        <span className="backup-code-index">#{idx + 1}</span>
                        <span className="backup-code-value">{code}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Card 2: Password Manager */}
          <div className="dash-box security-card-box" id="security-password-section">
            <div className="dash-box-header">
              <div>
                <span className="dash-box-pill">🔑 Password Protocols</span>
                <h3 className="dash-box-title">Change Password</h3>
              </div>
            </div>

            <form onSubmit={handlePasswordUpdate} className="password-form-wrap">
              <div className="form-field-group">
                <label className="field-label">Current Password</label>
                <input
                  type="password"
                  className="form-input"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  required
                />
              </div>

              <div className="form-field-group">
                <div className="label-with-strength">
                  <label className="field-label">New Password</label>
                  <span className="strength-label" style={{ color: pwdStrength.color }}>
                    Strength: <strong>{pwdStrength.label}</strong>
                  </span>
                </div>
                <input
                  type="password"
                  className="form-input"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 8 characters with numbers & symbols"
                  required
                />

                {/* Live Strength Bar */}
                <div className="strength-meter-bar">
                  <div
                    className="strength-meter-fill"
                    style={{
                      width: `${pwdStrength.percent}%`,
                      backgroundColor: pwdStrength.color,
                    }}
                  />
                </div>
              </div>

              <div className="form-field-group">
                <label className="field-label">Confirm New Password</label>
                <input
                  type="password"
                  className="form-input"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  required
                />
              </div>

              <button type="submit" className="btn-primary" style={{ marginTop: '0.8rem', width: '100%' }}>
                Update Sanctuary Password 🔑
              </button>
            </form>
          </div>

          {/* Card 3: Active Sessions & Devices */}
          <div className="dash-box security-card-box" id="security-sessions-section">
            <div className="dash-box-header">
              <div>
                <span className="dash-box-pill">💻 Active Devices</span>
                <h3 className="dash-box-title">Logged-in Sessions ({sessions.length})</h3>
              </div>

              {sessions.length > 1 && (
                <button
                  type="button"
                  className="btn-revoke-others"
                  onClick={handleRevokeSessions}
                >
                  Revoke Other Sessions 🚪
                </button>
              )}
            </div>

            <p className="sessions-sub-desc">
              These devices are currently authenticated into your CloudPuff account. If you spot unfamiliar activity, revoke immediately.
            </p>

            <div className="sessions-list">
              {sessions.map((sess) => (
                <div key={sess.id} className={`session-row ${sess.isCurrent ? 'current-device' : ''}`}>
                  <div className="session-icon-box">{sess.icon}</div>
                  <div className="session-info">
                    <div className="session-title-row">
                      <strong>{sess.device}</strong>
                      {sess.isCurrent ? (
                        <span className="current-badge">● This Device (Active)</span>
                      ) : (
                        <span className="inactive-badge">{sess.time}</span>
                      )}
                    </div>
                    <div className="session-meta-row">
                      <span>{sess.browser}</span>
                      <span>•</span>
                      <span>📍 {sess.location}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card 4: Security Audit Log (Admin Sanctuary Only) */}
          {isAdminMode && (
            <div className="dash-box security-card-box" id="security-audit-section">
              <div className="dash-box-header">
                <div>
                  <span className="dash-box-pill">📋 Activity Log</span>
                  <h3 className="dash-box-title">Security & Sign-in Audit Trail</h3>
                </div>
                <span className="audit-sync-badge">🛡️ Real-Time Telemetry</span>
              </div>

              <div className="audit-logs-table-wrap">
                <table className="audit-logs-table">
                  <thead>
                    <tr>
                      <th>Event</th>
                      <th>Client / Device</th>
                      <th>IP Address</th>
                      <th>Time</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.map((log) => (
                      <tr key={log.id}>
                        <td>
                          <strong>{log.action}</strong>
                        </td>
                        <td>{log.device}</td>
                        <td className="font-mono">{log.ip}</td>
                        <td>{log.time}</td>
                        <td>
                          <span className={`audit-pill ${log.status}`}>
                            {log.status === 'success' ? '✓ Allowed' : '🛡️ Blocked'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderPreferencesSection = (isAdminMode: boolean) => (
    <div className="dashboard-subview-wrapper fade-in-section">
      <div className={`orders-header-banner ${isAdminMode ? 'admin-banner' : ''}`}>
        <span className={`orders-badge ${isAdminMode ? 'admin' : ''}`}>
          {isAdminMode ? '⚙️ Sanctuary Store Operations' : '💳 Preferences & Billing'}
        </span>
        <h2 className="orders-title">
          {isAdminMode ? 'Store Policies, Dispatch Rates & Admin Alerts' : 'Payment Methods, Addresses & Notifications'}
        </h2>
        <p className="orders-subtitle">
          {isAdminMode
            ? 'Configure operational thresholds, alert channels, payment gateway credentials, and automated nursery updates.'
            : 'Manage your saved payment cards, default delivery methods, and plushie adoption announcement frequencies.'}
        </p>
      </div>

      <div className="preferences-grid-layout">
        {/* Card 1: Saved Payment Methods */}
        <div className="dash-box preferences-card-box" id="preferences-wallet-section">
          <div className="dash-box-header">
            <div>
              <span className="dash-box-pill">💳 Wallet</span>
              <h3 className="dash-box-title">Saved Payment Methods</h3>
            </div>
            <button
              type="button"
              className="admin-action-btn-small"
              onClick={() => {
                playPop();
                setIsAddCardOpen(true);
              }}
            >
              + Add Card 💳
            </button>
          </div>

          <p className="preferences-sub-desc">
            Your payment credentials are encrypted using AES-256 cloud tokenization. We never store raw CVV numbers.
          </p>

          <div className="saved-cards-list">
            {savedCards.map((card) => (
              <div key={card.id} className={`payment-card-chip ${card.isDefault ? 'default-card' : ''}`}>
                <div className="card-chip-top">
                  <span className="card-chip-icon">{card.icon}</span>
                  {card.isDefault && <span className="default-pill">★ Default Method</span>}
                </div>

                <div className="card-chip-brand">{card.brand}</div>
                <div className="card-chip-number">•••• •••• •••• {card.last4}</div>

                <div className="card-chip-bottom">
                  <span className="card-exp">Expires: {card.exp}</span>
                  <div className="card-actions-group">
                    {!card.isDefault && (
                      <button
                        type="button"
                        className="btn-card-action"
                        onClick={() => handleSetDefaultCard(card.id)}
                      >
                        Set Default
                      </button>
                    )}
                    {savedCards.length > 1 && (
                      <button
                        type="button"
                        className="btn-card-action delete"
                        onClick={() => handleDeleteCard(card.id)}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Card 2: Notification Preferences */}
        <div className="dash-box preferences-card-box" id="preferences-notifications-section">
          <div className="dash-box-header">
            <div>
              <span className="dash-box-pill">🔔 Communications</span>
              <h3 className="dash-box-title">Notification Channels</h3>
            </div>
          </div>

          <p className="preferences-sub-desc">
            Choose what you want to hear from the Cloud Haven Nursery.
          </p>

          <div className="notification-toggles-list">
            <div className="notif-toggle-row">
              <div className="notif-text">
                <strong>📦 Order Delivery & Adoption Updates</strong>
                <p>Receive email confirmation when adoptions are placed and packages depart.</p>
              </div>
              <button
                type="button"
                className={`switch-toggle-btn ${notificationSettings.orderUpdatesEmail ? 'on' : 'off'}`}
                onClick={() => handleToggleNotification('orderUpdatesEmail')}
                aria-label="Toggle Order Email Updates"
              >
                <span className="switch-thumb" />
              </button>
            </div>

            <div className="notif-toggle-row">
              <div className="notif-text">
                <strong>📱 Live Snuggle Transit SMS Updates</strong>
                <p>Receive live text notifications when courier radar enters your neighborhood.</p>
              </div>
              <button
                type="button"
                className={`switch-toggle-btn ${notificationSettings.orderUpdatesSms ? 'on' : 'off'}`}
                onClick={() => handleToggleNotification('orderUpdatesSms')}
                aria-label="Toggle SMS Transit Updates"
              >
                <span className="switch-thumb" />
              </button>
            </div>

            <div className="notif-toggle-row">
              <div className="notif-text">
                <strong>✨ Limited Edition Restock & Vault Drops</strong>
                <p>Get priority 15-minute early access before rare plushies sell out.</p>
              </div>
              <button
                type="button"
                className={`switch-toggle-btn ${notificationSettings.restockAlerts ? 'on' : 'off'}`}
                onClick={() => handleToggleNotification('restockAlerts')}
                aria-label="Toggle Restock Alerts"
              >
                <span className="switch-thumb" />
              </button>
            </div>

            <div className="notif-toggle-row">
              <div className="notif-text">
                <strong>💌 Weekly Cloud Haven Cuddle Digest</strong>
                <p>Fun coloring pages, plushie maintenance tips, and community cuddle stories.</p>
              </div>
              <button
                type="button"
                className={`switch-toggle-btn ${notificationSettings.marketingEmails ? 'on' : 'off'}`}
                onClick={() => handleToggleNotification('marketingEmails')}
                aria-label="Toggle Newsletter"
              >
                <span className="switch-thumb" />
              </button>
            </div>
          </div>
        </div>

        {/* Card 3: Account Data & Privacy Governance */}
        <div className="dash-box preferences-card-box full-width-card" id="preferences-data-section">
          <div className="dash-box-header">
            <div>
              <span className="dash-box-pill">📦 Privacy & Data</span>
              <h3 className="dash-box-title">Sanctuary Account Governance</h3>
            </div>
          </div>

          <div className="account-governance-row">
            <div className="governance-info">
              <strong>Export Your Full Adoption History</strong>
              <p>Download a machine-readable JSON/CSV archive of all orders, certificates, and head pat records.</p>
            </div>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                playChime();
                confettiEngine.burst();
                showToast('📦 Adoption archive exported successfully!');
              }}
            >
              Export Archive 📥
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderBillingSection = () => (
    <div className="dashboard-subview-wrapper fade-in-section">
      <div className="orders-header-banner">
        <span className="orders-badge">💳 Payment & Invoicing</span>
        <h2 className="orders-title">Saved Cards & Billing Archive</h2>
        <p className="orders-subtitle">
          Manage your saved payment cards, default checkout method, and download past adoption receipts.
        </p>
      </div>

      <div className="preferences-grid-layout">
        {/* Card 1: Saved Payment Methods */}
        <div className="dash-box preferences-card-box" id="billing-wallet-section">
          <div className="dash-box-header">
            <div>
              <span className="dash-box-pill">💳 Wallet</span>
              <h3 className="dash-box-title">Saved Payment Methods</h3>
            </div>
            <button
              type="button"
              className="admin-action-btn-small"
              onClick={() => {
                playPop();
                setIsAddCardOpen(true);
              }}
            >
              + Add Card 💳
            </button>
          </div>

          <p className="preferences-sub-desc">
            Your payment credentials are encrypted using AES-256 cloud tokenization. We never store raw CVV numbers.
          </p>

          <div className="saved-cards-list">
            {savedCards.map((card) => (
              <div key={card.id} className={`payment-card-chip ${card.isDefault ? 'default-card' : ''}`}>
                <div className="card-chip-top">
                  <span className="card-chip-icon">{card.icon}</span>
                  {card.isDefault && <span className="default-pill">★ Default Method</span>}
                </div>

                <div className="card-chip-brand">{card.brand}</div>
                <div className="card-chip-number">•••• •••• •••• {card.last4}</div>

                <div className="card-chip-bottom">
                  <span className="card-exp">Expires: {card.exp}</span>
                  <div className="card-actions-group">
                    {!card.isDefault && (
                      <button
                        type="button"
                        className="btn-card-action"
                        onClick={() => handleSetDefaultCard(card.id)}
                      >
                        Set Default
                      </button>
                    )}
                    {savedCards.length > 1 && (
                      <button
                        type="button"
                        className="btn-card-action delete"
                        onClick={() => handleDeleteCard(card.id)}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Card 2: Billing Invoices & Receipts */}
        <div className="dash-box preferences-card-box" id="billing-archive-section">
          <div className="dash-box-header">
            <div>
              <span className="dash-box-pill">📄 Invoices</span>
              <h3 className="dash-box-title">Adoption Invoices & Receipts</h3>
            </div>
            <span className="verified-status-tag">✓ Tax Paid</span>
          </div>

          <p className="preferences-sub-desc">
            Official billing invoices for your plushie adoption packages and merchandise.
          </p>

          <div className="billing-invoices-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {customerOrders.length > 0 ? (
              customerOrders.map((ord) => (
                <div
                  key={ord.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.85rem 1rem',
                    background: 'var(--color-bg-subtle, #fdf6f7)',
                    borderRadius: '12px',
                    border: '1px solid var(--color-border-subtle, #f0e6e8)',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>
                      Invoice #{ord.registryNumber} • {ord.plushieName}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#6B7280', marginTop: '0.2rem' }}>
                      Date: {ord.date} • Paid via Default Card
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '1rem', color: '#1F2937' }}>
                      ${ord.total.toFixed(2)}
                    </span>
                    <button
                      type="button"
                      className="btn-cert-mini"
                      style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                      onClick={() => {
                        playChime();
                        showToast(`📄 Downloaded receipt #${ord.registryNumber}`);
                      }}
                    >
                      Receipt PDF 📄
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ color: '#6B7280', fontSize: '0.88rem' }}>No billing receipts recorded yet.</p>
            )}
          </div>
        </div>

        {/* Card 3: Account Data & Privacy Governance */}
        <div className="dash-box preferences-card-box full-width-card" id="billing-data-section">
          <div className="dash-box-header">
            <div>
              <span className="dash-box-pill">📦 Privacy & Data</span>
              <h3 className="dash-box-title">Sanctuary Account Governance</h3>
            </div>
          </div>

          <div className="account-governance-row">
            <div className="governance-info">
              <strong>Export Your Full Adoption History</strong>
              <p>Download a machine-readable JSON/CSV archive of all orders, certificates, and head pat records.</p>
            </div>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                playChime();
                confettiEngine.burst();
                showToast('📦 Adoption archive exported successfully!');
              }}
            >
              Export Archive 📥
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotificationsSection = () => (
    <div className="dashboard-subview-wrapper fade-in-section">
      <div className="orders-header-banner">
        <span className="orders-badge">🔔 Communication Preferences</span>
        <h2 className="orders-title">Notification Channels & Alerts</h2>
        <p className="orders-subtitle">
          Configure real-time alerts for adoption tracking, SMS transit radar, restock notifications, and newsletters.
        </p>
      </div>

      <div className="preferences-grid-layout">
        {/* Card 1: Notification Preferences */}
        <div className="dash-box preferences-card-box full-width-card" id="preferences-notifications-section">
          <div className="dash-box-header">
            <div>
              <span className="dash-box-pill">🔔 Channels</span>
              <h3 className="dash-box-title">Notification Channels</h3>
            </div>
            <span className="audit-sync-badge">
              Active Sync: {profileEmail}
            </span>
          </div>

          <p className="preferences-sub-desc">
            Choose what you want to hear from the Cloud Haven Nursery.
          </p>

          <div className="notification-toggles-list">
            <div className="notif-toggle-row" id="notif-orders">
              <div className="notif-text">
                <strong>📦 Order Delivery & Adoption Updates</strong>
                <p>Receive email confirmation when adoptions are placed and packages depart.</p>
              </div>
              <button
                type="button"
                className={`switch-toggle-btn ${notificationSettings.orderUpdatesEmail ? 'on' : 'off'}`}
                onClick={() => handleToggleNotification('orderUpdatesEmail')}
                aria-label="Toggle Order Email Updates"
              >
                <span className="switch-thumb" />
              </button>
            </div>

            <div className="notif-toggle-row" id="notif-sms">
              <div className="notif-text">
                <strong>📱 Live Snuggle Transit SMS Updates</strong>
                <p>Receive live text notifications when courier radar enters your neighborhood ({profilePhone || 'SMS Enabled'}).</p>
              </div>
              <button
                type="button"
                className={`switch-toggle-btn ${notificationSettings.orderUpdatesSms ? 'on' : 'off'}`}
                onClick={() => handleToggleNotification('orderUpdatesSms')}
                aria-label="Toggle SMS Transit Updates"
              >
                <span className="switch-thumb" />
              </button>
            </div>

            <div className="notif-toggle-row" id="notif-drops">
              <div className="notif-text">
                <strong>✨ Limited Edition Restock & Vault Drops</strong>
                <p>Get priority 15-minute early access before rare plushies sell out.</p>
              </div>
              <button
                type="button"
                className={`switch-toggle-btn ${notificationSettings.restockAlerts ? 'on' : 'off'}`}
                onClick={() => handleToggleNotification('restockAlerts')}
                aria-label="Toggle Restock Alerts"
              >
                <span className="switch-thumb" />
              </button>
            </div>

            <div className="notif-toggle-row" id="notif-newsletter">
              <div className="notif-text">
                <strong>💌 Weekly Cloud Haven Cuddle Digest</strong>
                <p>Fun coloring pages, plushie maintenance tips, and community cuddle stories.</p>
              </div>
              <button
                type="button"
                className={`switch-toggle-btn ${notificationSettings.marketingEmails ? 'on' : 'off'}`}
                onClick={() => handleToggleNotification('marketingEmails')}
                aria-label="Toggle Newsletter"
              >
                <span className="switch-thumb" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderWishlistSection = () => (
    <div className="dashboard-subview-wrapper fade-in-section">
      <div className="orders-header-banner">
        <span className="orders-badge">💖 Dream Sanctuary Album</span>
        <h2 className="orders-title">Saved Wishlist Buddies</h2>
        <p className="orders-subtitle">
          Future cuddle companions nestled in your cloud nursery waiting for their forever adoption.
        </p>

        <div className="orders-summary-chips-row">
          <span className="summary-chip pink">🧸 {wishlistedPlushies.length} Saved Friends</span>
          <span className="summary-chip yellow">💰 Total Value: ${totalWishlistValue.toFixed(2)}</span>
          <span className="summary-chip transit">✨ Synced to {user?.email}</span>
        </div>

        {wishlistedPlushies.length > 0 && (
          <div className="wishlist-actions-bar" style={{ marginTop: '1.2rem', display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
            <button
              className="btn-primary"
              onClick={handleAdoptAllWishlist}
              type="button"
            >
              Adopt Whole Squad ({wishlistedPlushies.length}) 💖
            </button>
            <button
              className="btn-secondary"
              onClick={handleShareWishlist}
              type="button"
            >
              💌 Share Wishlist
            </button>
            <Link href="/wishlist" className="btn-secondary" style={{ color: '#4B5563' }} onClick={playPop}>
              Public Share View ↗
            </Link>
          </div>
        )}
      </div>

      <div id="dashboard-wishlist-cards" style={{ marginTop: '1.5rem' }}>
        {wishlistedPlushies.length === 0 ? (
          <div className="wishlist-empty-card" style={{ background: 'white', padding: '3.5rem 2rem', borderRadius: '24px', textAlign: 'center', border: '1.5px dashed #FBCFE8' }}>
            <div className="empty-plushie-icon" style={{ fontSize: '3.5rem', marginBottom: '0.8rem' }}>🧸</div>
            <h2 className="empty-title" style={{ fontSize: '1.4rem', fontWeight: 700, color: '#1F2937' }}>
              Your Wishlist sanctuary is currently empty!
            </h2>
            <p className="empty-subtitle" style={{ color: '#6B7280', maxWidth: '440px', margin: '0.6rem auto 1.5rem', fontSize: '0.95rem' }}>
              Tap the heart 💖 on any plushie companion across the shop to nestle them in your dashboard sanctuary.
            </p>
            <Link href="/#shop-section" className="btn-primary" onClick={playPop}>
              Explore Cuddle Squad 🍓
            </Link>
          </div>
        ) : (
          <div className="wishlist-grid">
            {wishlistedPlushies.map((plushie) => (
              <div key={plushie.id} className="wishlist-card">
                <div className="wishlist-card-thumb">
                  <Link href={`/product/${plushie.id}`} title={`View ${plushie.name}`}>
                    <Image
                      src={plushie.image}
                      alt={plushie.name}
                      width={320}
                      height={320}
                      className="wishlist-thumb-img"
                    />
                  </Link>
                  <button
                    className="wishlist-remove-btn"
                    onClick={() => {
                      playPop();
                      toggleWishlist(plushie.id);
                      showToast(`Removed ${plushie.name} from your sanctuary.`);
                    }}
                    title="Remove from wishlist"
                    type="button"
                  >
                    ✕
                  </button>
                  <span className="squish-pill-badge">☁️ {plushie.squishFactor} Squish</span>
                </div>

                <div className="wishlist-card-body">
                  <div className="wishlist-category-tag">{plushie.category.toUpperCase()}</div>
                  <h3 className="wishlist-item-name">
                    <Link href={`/product/${plushie.id}`}>{plushie.name}</Link>
                  </h3>
                  <p className="wishlist-item-subtitle">{plushie.subtitle}</p>

                  <div className="wishlist-item-pricing">
                    <span className="current-price">${plushie.price.toFixed(2)}</span>
                    <span className="original-price">${plushie.originalPrice.toFixed(2)}</span>
                  </div>

                  <div className="wishlist-card-actions">
                    <button
                      className="btn-primary wishlist-adopt-btn"
                      onClick={() => {
                        playSquish();
                        addItem(plushie.id, 1);
                        showToast(`🧸 Adopted ${plushie.name}! Added to basket.`);
                        setIsCartOpen(true);
                      }}
                      type="button"
                    >
                      Adopt Now 🍓
                    </button>
                    <Link
                      href={`/product/${plushie.id}`}
                      className="btn-secondary wishlist-details-btn"
                    >
                      View Bio ✨
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="page-wrapper dashboard-page-root">
      <Navbar />

      <main className="dashboard-container container">
        <div className="dashboard-inpage-layout">
          {/* ========================================================================= */}
          {/* PERMANENT IN-PAGE LEFT SIDEBAR WITH SIGN OUT FLOW */}
          {/* ========================================================================= */}
          <aside className="dashboard-inpage-sidebar" aria-label="Sanctuary Account Sidebar">
            {isLoggedIn && user ? (
              <div className="inpage-sidebar-card inpage-profile-card">
                <div className="inpage-avatar-wrap">
                  <span className="inpage-avatar-emoji">{user.avatar || (isUserAdmin ? '🛡️' : '🧸')}</span>
                  <span className="inpage-avatar-dot" title={isUserAdmin ? "Sanctuary Admin Online" : "Active Snuggler"}></span>
                </div>
                <span className="inpage-tier-tag">
                  {isUserAdmin ? '🛡️ Sanctuary Administrator' : '✨ Verified Cloud Parent'}
                </span>
                <h2 className="inpage-user-name">{user.name}</h2>
                <p className="inpage-user-email">{user.email}</p>

                <div className="inpage-meta-pills">
                  <span>🗓️ Since {user.memberSince}</span>
                  <span>{isUserAdmin ? '⚡ Full Ops Control' : `🦖 ${user.favoriteBuddy || 'Matcha Dino'}`}</span>
                </div>

                {/* Mini Stats Grid: Distinct for Admin vs Parent */}
                {isUserAdmin ? (
                  <div className="inpage-stats-grid admin-stats-grid">
                    <div className="inpage-stat-item">
                      <strong>{orders.length}</strong>
                      <span>All Orders</span>
                    </div>
                    <div className="inpage-stat-item">
                      <strong>{inventory.length}</strong>
                      <span>Catalog</span>
                    </div>
                    <div className="inpage-stat-item">
                      <strong>{totalStockCount}</strong>
                      <span>Warehouse</span>
                    </div>
                    <div className="inpage-stat-item">
                      <strong>${(totalStoreRevenue / 1000).toFixed(1)}k</strong>
                      <span>Revenue</span>
                    </div>
                  </div>
                ) : (
                  <div className="inpage-stats-grid">
                    <div className="inpage-stat-item">
                      <strong>{customerOrders.length}</strong>
                      <span>Adoptions</span>
                    </div>
                    <div className="inpage-stat-item">
                      <strong>{wishlist.length}</strong>
                      <span>Wishlist</span>
                    </div>
                    <div className="inpage-stat-item">
                      <strong>850</strong>
                      <span>Fluff Pts</span>
                    </div>
                    <div className="inpage-stat-item">
                      <strong>{headPats}</strong>
                      <span>Pats Given</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="inpage-sidebar-card inpage-guest-card">
                <div className="guest-bubble-icon">🧸✨</div>
                <h2 className="inpage-user-name">Welcome to Haven</h2>
                <p className="inpage-user-email">Sign in as a Customer or Admin to unlock features!</p>
                <div className="sidebar-demo-buttons">
                  <button
                    type="button"
                    className="btn-quick-demo-sidebar"
                    onClick={() => {
                      playChime();
                      loginAsUserDemo();
                      showToast('✨ Signed in as Arsalan Abbas (Verified Cloud Parent)!');
                    }}
                  >
                    ⚡ Demo Parent Sign In
                  </button>
                  <button
                    type="button"
                    className="btn-quick-demo-sidebar admin-demo"
                    onClick={() => {
                      playChime();
                      loginAsAdminDemo();
                      showToast('🛡️ Signed in as Cloud Warden (Sanctuary Administrator)!');
                    }}
                  >
                    🛡️ Demo Admin Sign In
                  </button>
                </div>
                <Link href="/login" className="btn-primary" style={{ width: '100%', marginTop: '0.6rem', textAlign: 'center' }}>
                  Sign In / Register →
                </Link>
              </div>
            )}

            {/* In-Page Sanctuary View Switcher (Only for Admins) */}
            {isLoggedIn && user && isUserAdmin && (
              <div className="inpage-sidebar-card inpage-modes-card">
                <span className="inpage-section-heading">Sanctuary View</span>
                <div className="inpage-mode-buttons">
                  <button
                    className={`inpage-mode-btn ${activeTab === 'parent' ? 'active' : ''}`}
                    onClick={() => {
                      playPop();
                      setActiveTab('parent');
                      if (dashboardSection === 'preferences') {
                        setDashboardSection('billing');
                      }
                    }}
                    type="button"
                  >
                    <span>🧸 Parent Cuddle Hub</span>
                    {activeTab === 'parent' && <span className="active-dot">●</span>}
                  </button>
                  <button
                    className={`inpage-mode-btn ${activeTab === 'admin' ? 'active' : ''}`}
                    onClick={() => {
                      playChime();
                      setActiveTab('admin');
                      if (dashboardSection === 'billing' || dashboardSection === 'notifications') {
                        setDashboardSection('preferences');
                      }
                    }}
                    type="button"
                  >
                    <span>⚙️ Shop Manager</span>
                    {activeTab === 'admin' && <span className="active-dot">●</span>}
                  </button>
                </div>
              </div>
            )}

            {/* Navigation / Platform Quick Links: Tailored for Admin vs Parent */}
            <div className={`inpage-sidebar-card inpage-nav-card ${isAdminView ? 'admin-nav-card' : 'user-nav-card'}`}>
              <div className="inpage-section-heading-row">
                <span className="inpage-section-heading">
                  {isAdminView ? 'Admin Quick Links' : 'Parent Quick Links'}
                </span>
                <span className={`inpage-heading-tag ${isAdminView ? 'admin' : 'user'}`}>
                  {isAdminView ? 'Staff Ops' : 'Cuddle Hub'}
                </span>
              </div>

              <ul className="inpage-links-list">
                {isAdminView ? (
                  <>
                    <li>
                      <button
                        type="button"
                        className={`inpage-link-item inpage-link-btn admin-link ${dashboardSection === 'overview' ? 'active-link' : ''}`}
                        onClick={() => handleSectionChange('overview')}
                      >
                        <span className="inpage-link-label">📊 Dashboard</span>
                        <span className="inpage-arrow">→</span>
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        className={`inpage-link-item inpage-link-btn admin-link ${dashboardSection === 'orders' ? 'active-link' : ''}`}
                        onClick={() => handleSectionChange('orders')}
                      >
                        <span className="inpage-link-label">📮 Orders & Dispatch</span>
                        <span className="inpage-link-badge admin">{orders.length}</span>
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        className={`inpage-link-item inpage-link-btn admin-link ${dashboardSection === 'profile' ? 'active-link' : ''}`}
                        onClick={() => handleSectionChange('profile')}
                      >
                        <span className="inpage-link-label">👤 Warden Profile & Access</span>
                        <span className="inpage-arrow">→</span>
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        className={`inpage-link-item inpage-link-btn admin-link ${dashboardSection === 'security' ? 'active-link' : ''}`}
                        onClick={() => handleSectionChange('security')}
                      >
                        <span className="inpage-link-label">🛡️ Admin Security & 2FA</span>
                        <span className="inpage-link-badge admin">{twoFactorActive ? '2FA ON' : '2FA OFF'}</span>
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        className={`inpage-link-item inpage-link-btn admin-link ${dashboardSection === 'preferences' ? 'active-link' : ''}`}
                        onClick={() => handleSectionChange('preferences')}
                      >
                        <span className="inpage-link-label">⚙️ Store Policies & Alerts</span>
                        <span className="inpage-arrow">→</span>
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        className="inpage-link-item inpage-link-btn admin-link"
                        onClick={() => {
                          if (dashboardSection !== 'overview') {
                            handleSectionChange('overview');
                          }
                          handleAdminNavClick('admin-inventory-section');
                        }}
                      >
                        <span className="inpage-link-label">🧸 Warehouse Stock</span>
                        <span className="inpage-link-badge admin">{totalStockCount} pcs</span>
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        className="inpage-link-item inpage-link-btn admin-link"
                        onClick={() => {
                          if (dashboardSection !== 'overview') {
                            handleSectionChange('overview');
                          }
                          handleAdminNavClick('admin-analytics-section');
                        }}
                      >
                        <span className="inpage-link-label">📊 Financials & Velocity</span>
                        <span className="inpage-arrow">→</span>
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        className="inpage-link-item inpage-link-btn admin-link"
                        onClick={() => {
                          playPop();
                          setNoticeDraft(bannerNotice);
                          setIsNoticeEditing(true);
                        }}
                      >
                        <span className="inpage-link-label">📢 Broadcast Notice</span>
                        <span className="inpage-arrow">✏️</span>
                      </button>
                    </li>
                  </>
                ) : (
                  <>
                    <li>
                      <button
                        type="button"
                        className={`inpage-link-item inpage-link-btn ${dashboardSection === 'overview' ? 'active-link' : ''}`}
                        onClick={() => handleSectionChange('overview')}
                      >
                        <span className="inpage-link-label">🧸 Dashboard</span>
                        <span className="inpage-arrow">→</span>
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        className={`inpage-link-item inpage-link-btn ${dashboardSection === 'orders' ? 'active-link' : ''}`}
                        onClick={() => handleSectionChange('orders')}
                      >
                        <span className="inpage-link-label">📖 My Adoptions & Papers</span>
                        <span className="inpage-link-badge">{customerOrders.length}</span>
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        className={`inpage-link-item inpage-link-btn ${dashboardSection === 'profile' ? 'active-link' : ''}`}
                        onClick={() => handleSectionChange('profile')}
                      >
                        <span className="inpage-link-label">👤 Edit Profile & Avatar</span>
                        <span className="inpage-arrow">→</span>
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        className={`inpage-link-item inpage-link-btn ${dashboardSection === 'security' ? 'active-link' : ''}`}
                        onClick={() => handleSectionChange('security')}
                      >
                        <span className="inpage-link-label">🔐 Password & Login Security</span>
                        <span className="inpage-arrow">→</span>
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        className={`inpage-link-item inpage-link-btn ${dashboardSection === 'billing' ? 'active-link' : ''}`}
                        onClick={() => handleSectionChange('billing')}
                      >
                        <span className="inpage-link-label">💳 Saved Cards & Billing</span>
                        <span className="inpage-arrow">→</span>
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        className={`inpage-link-item inpage-link-btn ${dashboardSection === 'notifications' ? 'active-link' : ''}`}
                        onClick={() => handleSectionChange('notifications')}
                      >
                        <span className="inpage-link-label">🔔 Notification Preferences</span>
                        <span className="inpage-arrow">→</span>
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        className={`inpage-link-item inpage-link-btn ${dashboardSection === 'wishlist' ? 'active-link' : ''}`}
                        onClick={() => handleSectionChange('wishlist')}
                      >
                        <span className="inpage-link-label">💖 Saved Wishlist</span>
                        <span className="inpage-link-badge">{wishlist.length}</span>
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        className="inpage-link-item inpage-link-btn"
                        onClick={() => {
                          if (dashboardSection !== 'overview') {
                            handleSectionChange('overview');
                          }
                          handleParentNavClick('soulmate-station');
                        }}
                      >
                        <span className="inpage-link-label">✨ Soulmate Care Station</span>
                        <span className="inpage-arrow">→</span>
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        className="inpage-link-item inpage-link-btn"
                        onClick={() => handleSectionChange('orders')}
                      >
                        <span className="inpage-link-label">🚚 Live Snuggle Tracking</span>
                        <span className="inpage-arrow">→</span>
                      </button>
                    </li>
                  </>
                )}
              </ul>
            </div>

            {/* Atmosphere Preferences */}
            <div className="inpage-sidebar-card inpage-atmosphere-card">
              <span className="inpage-section-heading">Atmosphere</span>
              <div className="inpage-control-row">
                <button
                  className="inpage-control-btn"
                  onClick={() => {
                    playPop();
                    toggleNightMode();
                  }}
                  type="button"
                >
                  <span>{isNightMode ? '☀️ Sunny Day Mode' : '🌙 Night Snuggle'}</span>
                  <span className="inpage-toggle-pill">{isNightMode ? 'Night' : 'Day'}</span>
                </button>

                <button
                  className="inpage-control-btn"
                  onClick={() => {
                    if (isLullabyPlaying) playPop(); else playChime();
                    toggleLullaby();
                  }}
                  type="button"
                >
                  <span>{isLullabyPlaying ? '🎶 Ambient Lullaby' : '💤 Play Lullaby'}</span>
                  <span className={`inpage-toggle-pill ${isLullabyPlaying ? 'active' : ''}`}>
                    {isLullabyPlaying ? 'Playing' : 'Off'}
                  </span>
                </button>
              </div>
            </div>

            {/* SIGN OUT FLOW SECTION (Interactive In-Page Confirmation) */}
            {isLoggedIn && (
              <div className="inpage-sidebar-card inpage-signout-card">
                {!showSignOutConfirm ? (
                  <button
                    className="btn-inpage-signout"
                    onClick={() => {
                      playPop();
                      setShowSignOutConfirm(true);
                    }}
                    type="button"
                  >
                    <span>🚪 Sign Out of Haven</span>
                  </button>
                ) : (
                  <div className="inpage-signout-confirm-box">
                    <div className="inpage-signout-mascot">
                      <span className="sad-mascot-emoji">🥺🧸</span>
                      <div>
                        <strong className="signout-confirm-title">Leaving Sanctuary?</strong>
                        <p className="signout-confirm-desc">
                          Your cuddle buddies will miss you dearly, {user?.name.split(' ')[0]}!
                        </p>
                      </div>
                    </div>
                    <div className="inpage-signout-buttons">
                      <button
                        className="btn-stay-snuggled"
                        onClick={() => {
                          playPop();
                          setShowSignOutConfirm(false);
                        }}
                        type="button"
                      >
                        🌸 Stay Snuggled
                      </button>
                      <button
                        className="btn-confirm-signout"
                        onClick={handleConfirmSignOut}
                        type="button"
                      >
                        🚪 Yes, Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </aside>

          {/* ========================================================================= */}
          {/* RIGHT SIDE MAIN DASHBOARD CONTENT */}
          {/* ========================================================================= */}
          <div className="dashboard-inpage-main">
            {isLoggedIn && user ? (
              <>
                {/* Top Header Banner Card */}
                <div className="dashboard-header-card">
              <div className="dashboard-header-left">
                <div className="dashboard-avatar-wrap">
                  <span className="dashboard-avatar-emoji">{user?.avatar || (isUserAdmin ? '🛡️' : '🧸')}</span>
                  <span className="dashboard-status-indicator" title="Cloud Sanctuary Live"></span>
                </div>
                <div className="dashboard-user-info">
                  <div className="dashboard-badge-row">
                    <span className="dashboard-tier-badge">
                      {isUserAdmin
                        ? '🛡️ Sanctuary Shop Administrator'
                        : '✨ VIP Snuggler Tier'}
                    </span>
                    <span className="dashboard-date-chip">
                      September 2026 • Live Sanctuary Sync
                    </span>
                  </div>
                  <h1 className="dashboard-welcome-title">
                    {isUserAdmin
                      ? (activeTab === 'admin'
                          ? `Sanctuary Operations Command 🛡️`
                          : `Customer Cuddle Hub Preview 🌸`)
                      : `Welcome to your Haven, ${user?.name || 'Cloud Parent'}! 🌸`}
                  </h1>
                  <p className="dashboard-welcome-desc">
                    {isUserAdmin
                      ? (activeTab === 'admin'
                          ? `Real-time adoption volume, warehouse stock inventory, dispatch tracking, and live catalog controls.`
                          : `Previewing the parent experience and cuddle buddy certificates.`)
                      : `Your cuddle companions are happy, well-fluffed, and resting cozily in Snuggle Town.`}
                  </p>
                </div>
              </div>

              {/* Mode Switcher Tabs (Only Accessible to Sanctuary Administrators) */}
              {isUserAdmin && (
                <div className="dashboard-mode-switcher" role="tablist">
                  <button
                    className={`dashboard-mode-btn ${activeTab === 'admin' ? 'active' : ''}`}
                    onClick={() => {
                      playChime();
                      setActiveTab('admin');
                    }}
                    type="button"
                    role="tab"
                    aria-selected={activeTab === 'admin'}
                  >
                    <span>⚙️ Shop Manager</span>
                  </button>
                  <button
                    className={`dashboard-mode-btn ${activeTab === 'parent' ? 'active' : ''}`}
                    onClick={() => {
                      playPop();
                      setActiveTab('parent');
                    }}
                    type="button"
                    role="tab"
                    aria-selected={activeTab === 'parent'}
                  >
                    <span>🧸 Parent Preview</span>
                  </button>
                </div>
              )}
            </div>

        {/* Global Live Store Announcement Banner */}
        <div className="dashboard-announcement-banner">
          <div className="banner-left-content">
            <span className="banner-pulse-icon">📢</span>
            <span className="banner-text">
              <strong>Sanctuary Broadcast:</strong> {bannerNotice}
            </span>
          </div>
          {activeTab === 'admin' && (
            <button
              className="banner-edit-btn"
              onClick={() => {
                playPop();
                setNoticeDraft(bannerNotice);
                setIsNoticeEditing(true);
              }}
              type="button"
            >
              Edit Broadcast ✏️
            </button>
          )}
        </div>

        {/* Contextual Dashboard Sub-navigation Bar */}
        <div className="dashboard-subnav-bar">
          <div className="subnav-tabs" role="tablist">
            {/* Page Context Badge / Indicator */}
            <span className="subnav-context-label">
              {dashboardSection === 'overview' && (activeTab === 'admin' ? '🛡️ Command & Stock' : '🧸 Cuddle Sanctuary')}
              {dashboardSection === 'orders' && (activeTab === 'admin' ? '📮 Dispatch Queue' : '📖 Adoption Registry')}
              {dashboardSection === 'profile' && (activeTab === 'admin' ? '🛡️ Warden Identity' : '👤 Identity Studio')}
              {dashboardSection === 'security' && (activeTab === 'admin' ? '🛡️ Admin Fort Knox' : '🔐 Account Security')}
              {dashboardSection === 'billing' && '💳 Saved Cards & Billing'}
              {dashboardSection === 'notifications' && '🔔 Notification Channels'}
              {dashboardSection === 'preferences' && (activeTab === 'admin' ? '⚙️ Store Policies' : '💳 Wallet & Alerts')}
              {dashboardSection === 'wishlist' && '💖 Saved Wishlist'}
            </span>

            {/* --- SECTION 1: OVERVIEW SUB-NAV --- */}
            {dashboardSection === 'overview' && (
              <>
                {activeTab === 'admin' ? (
                  <>
                    <button
                      type="button"
                      className="subnav-tab-btn subnav-subitem"
                      onClick={() => scrollToSection('admin-kpis-section')}
                    >
                      <span>💰 KPIs & Revenue</span>
                    </button>
                    <button
                      type="button"
                      className="subnav-tab-btn subnav-subitem"
                      onClick={() => scrollToSection('admin-analytics-section')}
                    >
                      <span>📈 Analytics</span>
                    </button>
                    <button
                      type="button"
                      className="subnav-tab-btn subnav-subitem"
                      onClick={() => scrollToSection('admin-inventory-section')}
                    >
                      <span>📦 Inventory Stock</span>
                      <span className="subnav-tab-counter admin">{inventory.length}</span>
                    </button>
                    <button
                      type="button"
                      className="subnav-tab-btn subnav-subitem"
                      onClick={() => scrollToSection('admin-fulfillment-section')}
                    >
                      <span>📮 Dispatch Stream</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      className="subnav-tab-btn subnav-subitem"
                      onClick={() => scrollToSection('parent-overview-stats')}
                    >
                      <span>📊 Cuddle Stats</span>
                    </button>
                    <button
                      type="button"
                      className="subnav-tab-btn subnav-subitem"
                      onClick={() => scrollToSection('soulmate-station')}
                    >
                      <span>🌟 Soulmate Care</span>
                    </button>
                    <button
                      type="button"
                      className="subnav-tab-btn subnav-subitem"
                      onClick={() => scrollToSection('parent-orders-section')}
                    >
                      <span>🚚 Snuggle Deliveries</span>
                      <span className="subnav-tab-counter">
                        {customerOrders.filter((o) => o.status.includes('Transit')).length}
                      </span>
                    </button>
                    <button
                      type="button"
                      className="subnav-tab-btn subnav-subitem"
                      onClick={() => scrollToSection('parent-shortcuts-section')}
                    >
                      <span>⚡ Quick Studios</span>
                    </button>
                  </>
                )}
              </>
            )}

            {/* --- SECTION 2: ORDERS SUB-NAV (FILTERS SPECIFIC TO ORDERS PAGE) --- */}
            {dashboardSection === 'orders' && (
              <>
                {activeTab === 'admin' ? (
                  <>
                    <button
                      type="button"
                      className={`subnav-tab-btn ${orderStatusFilter === 'all' ? 'active' : ''}`}
                      onClick={() => {
                        playPop();
                        setOrderStatusFilter('all');
                      }}
                    >
                      <span>All Shipments</span>
                      <span className="subnav-tab-counter admin">{orders.length}</span>
                    </button>
                    <button
                      type="button"
                      className={`subnav-tab-btn ${orderStatusFilter === 'processing' ? 'active' : ''}`}
                      onClick={() => {
                        playPop();
                        setOrderStatusFilter('processing');
                      }}
                    >
                      <span>⏳ Processing</span>
                      <span className="subnav-tab-counter admin">
                        {orders.filter((o) => o.status === 'Processing').length}
                      </span>
                    </button>
                    <button
                      type="button"
                      className={`subnav-tab-btn ${orderStatusFilter === 'transit' ? 'active' : ''}`}
                      onClick={() => {
                        playPop();
                        setOrderStatusFilter('transit');
                      }}
                    >
                      <span>☁️ In Transit</span>
                      <span className="subnav-tab-counter admin">
                        {orders.filter((o) => o.status.includes('Transit')).length}
                      </span>
                    </button>
                    <button
                      type="button"
                      className={`subnav-tab-btn ${orderStatusFilter === 'delivered' ? 'active' : ''}`}
                      onClick={() => {
                        playPop();
                        setOrderStatusFilter('delivered');
                      }}
                    >
                      <span>🏡 Delivered</span>
                      <span className="subnav-tab-counter admin">
                        {orders.filter((o) => o.status.includes('Delivered')).length}
                      </span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      className={`subnav-tab-btn ${customerOrderFilter === 'all' ? 'active' : ''}`}
                      onClick={() => {
                        playPop();
                        setCustomerOrderFilter('all');
                      }}
                    >
                      <span>All Adoptions</span>
                      <span className="subnav-tab-counter">{customerOrders.length}</span>
                    </button>
                    <button
                      type="button"
                      className={`subnav-tab-btn ${customerOrderFilter === 'transit' ? 'active' : ''}`}
                      onClick={() => {
                        playPop();
                        setCustomerOrderFilter('transit');
                      }}
                    >
                      <span>☁️ In Transit</span>
                      <span className="subnav-tab-counter">
                        {customerOrders.filter((o) => o.status.includes('Transit')).length}
                      </span>
                    </button>
                    <button
                      type="button"
                      className={`subnav-tab-btn ${customerOrderFilter === 'delivered' ? 'active' : ''}`}
                      onClick={() => {
                        playPop();
                        setCustomerOrderFilter('delivered');
                      }}
                    >
                      <span>🏡 Safely Snuggled</span>
                      <span className="subnav-tab-counter">
                        {customerOrders.filter((o) => o.status.includes('Delivered')).length}
                      </span>
                    </button>
                  </>
                )}
              </>
            )}

            {/* --- SECTION 3: PROFILE SUB-NAV (COMPONENTS OF PROFILE PAGE) --- */}
            {dashboardSection === 'profile' && (
              <>
                <button
                  type="button"
                  className="subnav-tab-btn subnav-subitem"
                  onClick={() => scrollToSection('profile-avatar-studio')}
                >
                  <span>🎨 Signature Avatar</span>
                </button>
                <button
                  type="button"
                  className="subnav-tab-btn subnav-subitem"
                  onClick={() => scrollToSection('profile-personal-details')}
                >
                  <span>📝 Personal Details</span>
                </button>
                <button
                  type="button"
                  className="subnav-tab-btn subnav-subitem"
                  onClick={() => scrollToSection('profile-delivery-address')}
                >
                  <span>🏡 Delivery Address</span>
                </button>
                <button
                  type="button"
                  className="subnav-tab-btn subnav-subitem"
                  onClick={() => scrollToSection('profile-cuddle-bio')}
                >
                  <span>🌸 Cuddle Bio</span>
                </button>
              </>
            )}

            {/* --- SECTION 4: SECURITY SUB-NAV (COMPONENTS OF SECURITY PAGE) --- */}
            {dashboardSection === 'security' && (
              <>
                {activeTab === 'admin' && (
                  <button
                    type="button"
                    className="subnav-tab-btn subnav-subitem"
                    onClick={() => scrollToSection('security-2fa-section')}
                  >
                    <span>🛡️ Two-Factor (2FA)</span>
                    <span
                      className="subnav-tab-counter"
                      style={{
                        background: twoFactorActive ? '#D1FAE5' : '#FEE2E2',
                        color: twoFactorActive ? '#047857' : '#B91C1C',
                      }}
                    >
                      {twoFactorActive ? 'ON' : 'OFF'}
                    </span>
                  </button>
                )}
                <button
                  type="button"
                  className="subnav-tab-btn subnav-subitem"
                  onClick={() => scrollToSection('security-password-section')}
                >
                  <span>🔑 Password Protocols</span>
                </button>
                <button
                  type="button"
                  className="subnav-tab-btn subnav-subitem"
                  onClick={() => scrollToSection('security-sessions-section')}
                >
                  <span>💻 Active Sessions</span>
                  <span className="subnav-tab-counter">{sessions.length}</span>
                </button>
                {activeTab === 'admin' && (
                  <button
                    type="button"
                    className="subnav-tab-btn subnav-subitem"
                    onClick={() => scrollToSection('security-audit-section')}
                  >
                    <span>📋 Audit Trail</span>
                  </button>
                )}
              </>
            )}

            {/* --- SECTION: BILLING SUB-NAV --- */}
            {dashboardSection === 'billing' && (
              <>
                <button
                  type="button"
                  className="subnav-tab-btn subnav-subitem"
                  onClick={() => scrollToSection('billing-wallet-section')}
                >
                  <span>💳 Saved Cards</span>
                  <span className="subnav-tab-counter">{savedCards.length}</span>
                </button>
                <button
                  type="button"
                  className="subnav-tab-btn subnav-subitem"
                  onClick={() => scrollToSection('billing-archive-section')}
                >
                  <span>📦 Billing Archive</span>
                </button>
                <button
                  type="button"
                  className="subnav-tab-btn subnav-subitem"
                  onClick={() => {
                    playPop();
                    setIsAddCardOpen(true);
                  }}
                >
                  <span>+ Add Card 💳</span>
                </button>
              </>
            )}

            {/* --- SECTION: NOTIFICATIONS SUB-NAV --- */}
            {dashboardSection === 'notifications' && (
              <>
                <button
                  type="button"
                  className="subnav-tab-btn subnav-subitem"
                  onClick={() => scrollToSection('notif-orders')}
                >
                  <span>📦 Order Updates</span>
                </button>
                <button
                  type="button"
                  className="subnav-tab-btn subnav-subitem"
                  onClick={() => scrollToSection('notif-sms')}
                >
                  <span>📱 SMS Radar</span>
                </button>
                <button
                  type="button"
                  className="subnav-tab-btn subnav-subitem"
                  onClick={() => scrollToSection('notif-drops')}
                >
                  <span>✨ Restock Drops</span>
                </button>
                <button
                  type="button"
                  className="subnav-tab-btn subnav-subitem"
                  onClick={() => scrollToSection('notif-newsletter')}
                >
                  <span>💌 Newsletter</span>
                </button>
              </>
            )}

            {/* --- SECTION 5: PREFERENCES SUB-NAV (STORE POLICIES & ALERTS) --- */}
            {dashboardSection === 'preferences' && (
              <>
                <button
                  type="button"
                  className="subnav-tab-btn subnav-subitem"
                  onClick={() => scrollToSection('preferences-wallet-section')}
                >
                  <span>💳 Payment Gateway</span>
                  <span className="subnav-tab-counter">{savedCards.length}</span>
                </button>
                <button
                  type="button"
                  className="subnav-tab-btn subnav-subitem"
                  onClick={() => scrollToSection('preferences-notifications-section')}
                >
                  <span>🔔 Dispatch Alerts</span>
                </button>
                <button
                  type="button"
                  className="subnav-tab-btn subnav-subitem"
                  onClick={() => scrollToSection('preferences-data-section')}
                >
                  <span>📦 Store Governance</span>
                </button>
              </>
            )}

            {/* --- SECTION 6: WISHLIST SUB-NAV --- */}
            {dashboardSection === 'wishlist' && (
              <>
                <button
                  type="button"
                  className="subnav-tab-btn subnav-subitem"
                  onClick={() => scrollToSection('dashboard-wishlist-cards')}
                >
                  <span>💖 Saved Buddies</span>
                  <span className="subnav-tab-counter">{wishlist.length}</span>
                </button>
                {wishlist.length > 0 && (
                  <button
                    type="button"
                    className="subnav-tab-btn subnav-subitem"
                    onClick={handleAdoptAllWishlist}
                  >
                    <span>🛍️ Adopt Whole Squad</span>
                  </button>
                )}
                <button
                  type="button"
                  className="subnav-tab-btn subnav-subitem"
                  onClick={handleShareWishlist}
                >
                  <span>💌 Share Wishlist</span>
                </button>
                <Link href="/#shop-section" className="subnav-tab-btn subnav-subitem" onClick={playPop}>
                  <span>🍓 Explore Shop</span>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: PARENT CUDDLE HUB (CUSTOMER PERSPECTIVE) */}
        {/* ========================================================================= */}
        {activeTab === 'parent' && (
          <div className="dashboard-tab-content fade-in-section">
            {dashboardSection === 'overview' && (
              <>
                {/* KPI Stats Grid */}
                <div className="dashboard-stats-grid" id="parent-overview-stats">
                  <div className="dash-stat-card card-pink">
                    <div className="stat-icon-wrap">🧸</div>
                    <div className="stat-content">
                      <span className="stat-label">Adopted Plushies</span>
                      <div className="stat-value-row">
                        <span className="stat-value">{customerOrders.length}</span>
                        <span className="stat-subtag">All Loved 💖</span>
                      </div>
                    </div>
                  </div>

                  <div className="dash-stat-card card-lavender">
                    <div className="stat-icon-wrap">☁️</div>
                    <div className="stat-content">
                      <span className="stat-label">Cloud Fluff Points</span>
                      <div className="stat-value-row">
                        <span className="stat-value">850</span>
                        <span className="stat-subtag">Tier 3 VIP</span>
                      </div>
                    </div>
                  </div>

                  <div className="dash-stat-card card-mint">
                    <div className="stat-icon-wrap">💖</div>
                    <div className="stat-content">
                      <span className="stat-label">Saved on Wishlist</span>
                      <div className="stat-value-row">
                        <span className="stat-value">{wishlist.length}</span>
                        <span className="stat-subtag">
                          <Link href="/wishlist">View Wishlist →</Link>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="dash-stat-card card-butter">
                    <div className="stat-icon-wrap">🤗</div>
                    <div className="stat-content">
                      <span className="stat-label">Virtual Head Pats</span>
                      <div className="stat-value-row">
                        <span className="stat-value">{headPats}</span>
                        <span className="stat-subtag">+10% Squish Level</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Middle Section: Virtual Pet Care Station & Active Orders */}
                <div className="dashboard-parent-grid">
                  {/* Virtual Companion Pet Care Card */}
                  <div className="dash-box companion-care-card" id="soulmate-station">
                    <div className="dash-box-header">
                      <div>
                        <span className="dash-box-pill">🌟 Fluff Companion Hub</span>
                        <h3 className="dash-box-title">Soulmate Cuddle Buddy</h3>
                      </div>
                      <span className="companion-status-chip">
                        <span className="live-pulsing-dot"></span> In Deep Snuggles
                      </span>
                    </div>

                    <div className="companion-stage">
                      <div className="companion-avatar-wrap">
                        <Image
                          src="/assets/dino.jpg"
                          alt="Matcha Dino"
                          width={180}
                          height={180}
                          className="companion-mascot-img"
                        />
                        <button
                          className="heart-reaction-bubble"
                          onClick={handleGiveHeadPat}
                          title="Give a head pat"
                          type="button"
                        >
                          💖
                        </button>
                      </div>

                      <div className="companion-dialogue-bubble">
                        <p className="bubble-quote">“{activeBuddySpeech}”</p>
                        <span className="bubble-speaker">— Matcha Dino (Baby Stegosaurus)</span>
                      </div>
                    </div>

                    <div className="companion-care-controls">
                      <button
                        className="btn-pet-action"
                        onClick={handleGiveHeadPat}
                        type="button"
                      >
                        <span>🤗 Pat Head</span>
                        <span className="pat-badge">+{headPats} pats</span>
                      </button>

                      <button
                        className="btn-pet-action"
                        onClick={() => {
                          playSquish();
                          showToast('🍓 Fed a juicy sky-berry to Matcha Dino! So tasty!');
                        }}
                        type="button"
                      >
                        <span>🍓 Feed Berry</span>
                      </button>

                      <button
                        className="btn-pet-action"
                        onClick={() => {
                          playChime();
                          confettiEngine.burst();
                          showToast('✨ Brushed fluff! Matcha Dino is glowing with happiness!');
                        }}
                        type="button"
                      >
                        <span>✨ Brush Fluff</span>
                      </button>
                    </div>

                    <div className="companion-vitals-row">
                      <div className="vital-item">
                        <span className="vital-label">Fluff Warmth</span>
                        <div className="vital-bar-track">
                          <div className="vital-bar-fill" style={{ width: '96%', backgroundColor: 'var(--accent-mint)' }}></div>
                        </div>
                        <span className="vital-num">96% Cozy</span>
                      </div>

                      <div className="vital-item">
                        <span className="vital-label">Cheerfulness Meter</span>
                        <div className="vital-bar-track">
                          <div className="vital-bar-fill" style={{ width: '100%', backgroundColor: 'var(--pink-primary)' }}></div>
                        </div>
                        <span className="vital-num">100% Bliss</span>
                      </div>
                    </div>
                  </div>

                  {/* Active Deliveries & Registry Track */}
                  <div className="dash-box active-deliveries-card" id="parent-orders-section">
                    <div className="dash-box-header">
                      <div>
                        <span className="dash-box-pill">🚚 Live Snuggle Dispatch</span>
                        <h3 className="dash-box-title">Active Adoptions & Deliveries</h3>
                      </div>
                      <button
                        type="button"
                        className="dash-see-all-link dash-see-all-btn"
                        onClick={() => handleSectionChange('orders')}
                      >
                        View All in Orders Tab →
                      </button>
                    </div>

                    <div className="deliveries-list">
                      {customerOrders.length === 0 ? (
                        <div className="deliveries-empty-state">
                          <span>🧸</span>
                          <p>No active plushies currently in transit.</p>
                          <Link href="/shop" className="btn-primary" style={{ marginTop: '0.8rem' }}>
                            Adopt a Cuddle Buddy 🍓
                          </Link>
                        </div>
                      ) : (
                        customerOrders.slice(0, 3).map((ord) => (
                          <div key={ord.id} className="delivery-card-item">
                            <div className="delivery-item-thumb">
                              <Image
                                src={ord.image}
                                alt={ord.plushieName}
                                width={75}
                                height={75}
                                className="delivery-plushie-img"
                              />
                            </div>

                            <div className="delivery-item-info">
                              <div className="delivery-item-header">
                                <h4 className="delivery-item-name">{ord.plushieName}</h4>
                                <span className={`delivery-status-pill ${ord.status.includes('Delivered') ? 'delivered' : 'transit'}`}>
                                  {ord.status}
                                </span>
                              </div>

                              <p className="delivery-item-meta">
                                <strong>Registry:</strong> #{ord.registryNumber} • <strong>Date:</strong> {ord.date}
                              </p>
                              <p className="delivery-dest-text">
                                <strong>Destination:</strong> {ord.destination}
                              </p>

                              <div className="delivery-actions-bar">
                                <button
                                  className="btn-track-mini"
                                  onClick={() => {
                                    playPop();
                                    setSelectedOrderForTracking(ord);
                                  }}
                                  type="button"
                                >
                                  Track Journey 🚚
                                </button>

                                <button
                                  className="btn-cert-mini"
                                  onClick={() => {
                                    playChime();
                                    setCertificateViewOrder(ord);
                                  }}
                                  type="button"
                                >
                                  Adoption Papers 🖨️
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Quick Action Shortcuts Grid */}
                <div className="dashboard-shortcuts-row" id="parent-shortcuts-section">
                  <Link href="/customizer" className="shortcut-card card-studio">
                    <div className="shortcut-emoji">🎨</div>
                    <div className="shortcut-meta">
                      <h4>Plushie Studio</h4>
                      <p>Design custom outfits & embroidered badges</p>
                    </div>
                    <span className="shortcut-arrow">→</span>
                  </Link>

                  <Link href="/game" className="shortcut-card card-game">
                    <div className="shortcut-emoji">🎮</div>
                    <div className="shortcut-meta">
                      <h4>Cloud Hop Arcade</h4>
                      <p>Play & earn extra Fluff Reward points</p>
                    </div>
                    <span className="shortcut-arrow">→</span>
                  </Link>

                  <Link href="/shop" className="shortcut-card card-shop">
                    <div className="shortcut-emoji">🍓</div>
                    <div className="shortcut-meta">
                      <h4>Cuddle Catalog</h4>
                      <p>Explore newly hatched plushie companions</p>
                    </div>
                    <span className="shortcut-arrow">→</span>
                  </Link>
                </div>
              </>
            )}

            {/* Full Customer Adoption Family Album & Orders */}
            {dashboardSection === 'orders' && (
              <div className="dashboard-orders-tab-view fade-in-section">
                {/* Header Banner */}
                <div className="orders-header-banner">
                  <span className="orders-badge">📖 Adoption Registry Archive</span>
                  <h2 className="orders-title">Cuddle Family Album & Orders</h2>
                  <p className="orders-subtitle">
                    Look up past adoptions, print official birth certificates, track delivery journeys, and give your plushies virtual head pats.
                  </p>

                  {/* Summary Chips */}
                  <div className="orders-summary-chips-row">
                    <span className="summary-chip pink">🧸 Total Adopted: {customerOrders.length}</span>
                    <span className="summary-chip transit">☁️ In Transit: {customerOrders.filter(o => o.status.includes('Transit')).length}</span>
                    <span className="summary-chip delivered">🏡 Safely Snuggled: {customerOrders.filter(o => o.status.includes('Delivered')).length}</span>
                  </div>

                  {/* Filter and Search Bar */}
                  <div className="orders-controls-wrapper">
                    <div className="orders-filter-pills">
                      <button
                        type="button"
                        className={`filter-pill-btn ${customerOrderFilter === 'all' ? 'active' : ''}`}
                        onClick={() => {
                          playPop();
                          setCustomerOrderFilter('all');
                        }}
                      >
                        All ({customerOrders.length})
                      </button>
                      <button
                        type="button"
                        className={`filter-pill-btn ${customerOrderFilter === 'transit' ? 'active' : ''}`}
                        onClick={() => {
                          playPop();
                          setCustomerOrderFilter('transit');
                        }}
                      >
                        In Transit ☁️ ({customerOrders.filter((o) => o.status.includes('Transit')).length})
                      </button>
                      <button
                        type="button"
                        className={`filter-pill-btn ${customerOrderFilter === 'delivered' ? 'active' : ''}`}
                        onClick={() => {
                          playPop();
                          setCustomerOrderFilter('delivered');
                        }}
                      >
                        Delivered 🏡 ({customerOrders.filter((o) => o.status.includes('Delivered')).length})
                      </button>
                    </div>

                    <div className="orders-search-bar">
                      <span className="search-icon">🔍</span>
                      <input
                        type="text"
                        className="orders-search-input"
                        placeholder="Search by plushie, registry #, or destination..."
                        value={customerOrderSearch}
                        onChange={(e) => setCustomerOrderSearch(e.target.value)}
                      />
                      {customerOrderSearch && (
                        <button
                          className="clear-search-btn"
                          onClick={() => setCustomerOrderSearch('')}
                          type="button"
                          aria-label="Clear search"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Adoption Cards Grid */}
                {filteredCustomerOrders.length === 0 ? (
                  <div className="orders-empty-state">
                    <span className="empty-emoji">🧸</span>
                    <h3>No adoptions matching your criteria</h3>
                    <p>Try clearing your search or filter to see your cuddle buddies.</p>
                    <div className="empty-actions">
                      {customerOrderSearch && (
                        <button
                          type="button"
                          className="btn-secondary"
                          onClick={() => setCustomerOrderSearch('')}
                        >
                          Clear Search
                        </button>
                      )}
                      <Link href="/shop" className="btn-primary" onClick={playPop}>
                        Adopt a New Companion 🍓
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="orders-grid">
                    {filteredCustomerOrders.map((ord) => {
                      const pats = orderHeadPats[ord.registryNumber] || 0;
                      return (
                        <div key={ord.id} className="order-adoption-card">
                          <div className="order-card-top">
                            <div className="order-thumb-wrap">
                              <Image
                                src={ord.image}
                                alt={ord.plushieName}
                                width={110}
                                height={110}
                                className="order-plushie-img"
                              />
                              {ord.species && (
                                <span className="order-species-tag">{ord.species}</span>
                              )}
                            </div>

                            <div className="order-card-meta">
                              <div className="order-id-row">
                                <span className="order-reg-pill">#{ord.registryNumber}</span>
                                <span
                                  className={`order-status-chip ${
                                    ord.status.includes('Delivered')
                                      ? 'delivered'
                                      : ord.status.includes('Transit')
                                      ? 'transit'
                                      : 'processing'
                                  }`}
                                >
                                  {ord.status}
                                </span>
                              </div>

                              <h3 className="order-plushie-name">{ord.plushieName}</h3>
                              <p className="order-parent-text">
                                <strong>Parent:</strong> {ord.parentName}
                              </p>
                              <p className="order-date-text">
                                <strong>Adopted:</strong> {ord.date}
                              </p>
                              <p className="order-dest-text">
                                <strong>Destination:</strong> {ord.destination}
                              </p>
                              <p className="order-payment-text">
                                <strong>Total:</strong> ${ord.total.toFixed(2)} via {ord.paymentMethod}
                              </p>
                            </div>
                          </div>

                          <div className="order-card-actions-bar">
                            <button
                              type="button"
                              className="btn-head-pat"
                              onClick={() => handleOrderHeadPat(ord.registryNumber, ord.plushieName)}
                            >
                              <span>🧸 Pat</span>
                              {pats > 0 && <span className="pat-count">{pats}</span>}
                            </button>

                            <button
                              type="button"
                              className="btn-order-track"
                              onClick={() => {
                                playPop();
                                setSelectedOrderForTracking(ord);
                              }}
                            >
                              Track Journey 🚚
                            </button>

                            <button
                              type="button"
                              className="btn-order-cert"
                              onClick={() => {
                                playChime();
                                setCertificateViewOrder(ord);
                              }}
                            >
                              Adoption Papers 🖨️
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: SANCTUARY COMMAND CENTER (ADMIN & STORE OPERATIONS) */}
        {/* ========================================================================= */}
        {activeTab === 'admin' && (
          <div className="dashboard-tab-content fade-in-section">
            {dashboardSection === 'overview' && (
              <>
                {/* Admin Financial & Operational KPIs */}
                <div className="dashboard-stats-grid admin-kpis" id="admin-kpis-section">
                  <div className="dash-stat-card card-pink">
                    <div className="stat-icon-wrap">💰</div>
                    <div className="stat-content">
                      <span className="stat-label">Total Store Revenue</span>
                      <div className="stat-value-row">
                        <span className="stat-value">${totalStoreRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                        <span className="stat-growth-tag">▲ +18.4% this mo</span>
                      </div>
                    </div>
                  </div>

                  <div className="dash-stat-card card-lavender">
                    <div className="stat-icon-wrap">📦</div>
                    <div className="stat-content">
                      <span className="stat-label">Plushies Dispatched</span>
                      <div className="stat-value-row">
                        <span className="stat-value">648</span>
                        <span className="stat-subtag">99.8% On-Time</span>
                      </div>
                    </div>
                  </div>

                  <div className="dash-stat-card card-mint">
                    <div className="stat-icon-wrap">🧸</div>
                    <div className="stat-content">
                      <span className="stat-label">Active Warehouse Stock</span>
                      <div className="stat-value-row">
                        <span className="stat-value">{totalStockCount} units</span>
                        <span className="stat-subtag">{inventory.length} designs</span>
                      </div>
                    </div>
                  </div>

                  <div className="dash-stat-card card-butter">
                    <div className="stat-icon-wrap">⭐</div>
                    <div className="stat-content">
                      <span className="stat-label">Snuggle Satisfaction</span>
                      <div className="stat-value-row">
                        <span className="stat-value">99.6%</span>
                        <span className="stat-subtag">5.0 / 5.0 Rating</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Weekly Adoption Trend Chart + Quick Actions */}
                <div className="dashboard-analytics-row" id="admin-analytics-section">
                  {/* Adoption Volume Interactive Chart */}
                  <div className="dash-box chart-box">
                    <div className="dash-box-header">
                      <div>
                        <span className="dash-box-pill">📊 7-Day Performance</span>
                        <h3 className="dash-box-title">Weekly Adoption & Revenue Pace</h3>
                      </div>
                      <span className="chart-legend-badge">
                        <span className="legend-dot"></span> Cuddle Adoptions
                      </span>
                    </div>

                    <div className="trend-chart-visual">
                      {WEEKLY_DATA.map((item) => {
                        const heightPercent = (item.adoptions / 130) * 100;
                        return (
                          <div key={item.day} className="chart-bar-col">
                            <span className="bar-tooltip">
                              <strong>{item.adoptions} Plushies</strong>
                              <br />${item.revenue} Revenue
                            </span>
                            <div className="bar-fill-track">
                              <div
                                className="bar-fill"
                                style={{ height: `${heightPercent}%` }}
                              ></div>
                            </div>
                            <span className="bar-day-label">{item.day}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Warehouse Quick Actions Card */}
                  <div className="dash-box admin-quick-actions-card">
                    <div className="dash-box-header">
                      <div>
                        <span className="dash-box-pill">⚡ Operations</span>
                        <h3 className="dash-box-title">Store Management</h3>
                      </div>
                    </div>

                    <div className="admin-actions-vertical-list">
                      <button
                        className="admin-action-btn primary-action"
                        onClick={() => {
                          playPop();
                          setIsAddPlushieOpen(true);
                        }}
                        type="button"
                      >
                        <span>➕ Add New Plushie Companion</span>
                        <span className="btn-hint">Create catalog entry</span>
                      </button>

                      <button
                        className="admin-action-btn"
                        onClick={() => handleSectionChange('orders')}
                        type="button"
                      >
                        <span>📮 Orders & Fulfillment Console</span>
                        <span className="btn-hint">{orders.length} orders in queue</span>
                      </button>

                  <button
                    className="admin-action-btn"
                    onClick={() => {
                      playChime();
                      confettiEngine.burst();
                      showToast('🏷️ Seasonal coupon LOVEPUFF (-20%) dispatched to subscribers!');
                    }}
                    type="button"
                  >
                    <span>🎟️ Generate Promo Coupon</span>
                    <span className="btn-hint">Blast code LOVEPUFF</span>
                  </button>

                  <button
                    className="admin-action-btn"
                    onClick={() => {
                      playPop();
                      setNoticeDraft(bannerNotice);
                      setIsNoticeEditing(true);
                    }}
                    type="button"
                  >
                    <span>📢 Update Announcement Banner</span>
                    <span className="btn-hint">Edit site-wide notice</span>
                  </button>

                  <button
                    className="admin-action-btn"
                    onClick={() => {
                      playChime();
                      showToast('📄 Adoption Registry CSV exported successfully!');
                    }}
                    type="button"
                  >
                    <span>📥 Export Orders Registry</span>
                    <span className="btn-hint">CSV archive download</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Inventory & Stock Management Section */}
            <div className="dash-box inventory-management-box" id="admin-inventory-section">
              <div className="dash-box-header">
                <div>
                  <span className="dash-box-pill">📦 Real-Time Warehouse</span>
                  <h3 className="dash-box-title">Plushie Stock & Fluff Inventory</h3>
                </div>
                <button
                  className="btn-primary btn-add-plushie-trigger"
                  onClick={() => setIsAddPlushieOpen(true)}
                  type="button"
                >
                  + Add Plushie 🧸
                </button>
              </div>

              <div className="inventory-table-wrapper">
                <table className="inventory-table">
                  <thead>
                    <tr>
                      <th>Companion</th>
                      <th>Category</th>
                      <th>Adoption Price</th>
                      <th>Stock Level</th>
                      <th>Status</th>
                      <th>Quick Stock Modifier</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventory.map((item) => {
                      const isLow = item.stock <= 10;
                      return (
                        <tr key={item.id}>
                          <td>
                            <div className="table-plushie-cell">
                              <Image
                                src={item.image}
                                alt={item.name}
                                width={44}
                                height={44}
                                className="table-plushie-thumb"
                              />
                              <div>
                                <strong className="table-plushie-name">{item.name}</strong>
                                <span className="table-plushie-id">ID: {item.id}</span>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className="category-pill">{item.category}</span>
                          </td>
                          <td>
                            <strong>${item.price.toFixed(2)}</strong>
                          </td>
                          <td>
                            <span className={`stock-number ${isLow ? 'stock-low' : 'stock-good'}`}>
                              {item.stock} in sanctuary
                            </span>
                          </td>
                          <td>
                            {item.stock === 0 ? (
                              <span className="stock-badge out-of-stock">Out of Hugs ❌</span>
                            ) : isLow ? (
                              <span className="stock-badge low-stock">Low Stock ⚠️</span>
                            ) : (
                              <span className="stock-badge in-stock">Ready to Snuggle ✅</span>
                            )}
                          </td>
                          <td>
                            <div className="stock-adjust-group">
                              <button
                                className="btn-stock-adjust minus"
                                onClick={() => handleStockChange(item.id, -1)}
                                title="Decrease stock"
                                type="button"
                              >
                                -
                              </button>
                              <span className="stock-count-display">{item.stock}</span>
                              <button
                                className="btn-stock-adjust plus"
                                onClick={() => handleStockChange(item.id, 1)}
                                title="Increase stock"
                                type="button"
                              >
                                +
                              </button>
                              <button
                                className="btn-stock-restock"
                                onClick={() => handleStockChange(item.id, 15)}
                                title="Add 15 batch restock"
                                type="button"
                              >
                                +15 Restock 🚚
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Order Fulfillment & Dispatch Management Console Preview */}
            <div className="dash-box orders-fulfillment-box" id="admin-fulfillment-section">
              <div className="dash-box-header">
                <div>
                  <span className="dash-box-pill">📮 Dispatch Console Preview</span>
                  <h3 className="dash-box-title">Recent Order Fulfillment</h3>
                </div>

                <button
                  type="button"
                  className="dash-see-all-link dash-see-all-btn"
                  onClick={() => handleSectionChange('orders')}
                >
                  Open Full Orders Console →
                </button>
              </div>

              <div className="fulfillment-table-wrapper">
                <table className="fulfillment-table">
                  <thead>
                    <tr>
                      <th>Registry #</th>
                      <th>Plushie Friend</th>
                      <th>Certified Parent</th>
                      <th>Destination</th>
                      <th>Total</th>
                      <th>Current Status</th>
                      <th>Status Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAdminOrders.slice(0, 4).map((ord) => (
                      <tr key={ord.id}>
                        <td>
                          <span className="registry-number-chip">#{ord.registryNumber}</span>
                        </td>
                        <td>
                          <div className="table-plushie-cell">
                            <Image
                              src={ord.image}
                              alt={ord.plushieName}
                              width={38}
                              height={38}
                              className="table-plushie-thumb"
                            />
                            <span>{ord.plushieName}</span>
                          </div>
                        </td>
                        <td>
                          <strong>{ord.parentName}</strong>
                        </td>
                        <td>
                          <span className="dest-cell">{ord.destination}</span>
                        </td>
                        <td>
                          <strong>${ord.total.toFixed(2)}</strong>
                        </td>
                        <td>
                          <span
                            className={`fulfillment-status-tag ${
                              ord.status === 'Processing'
                                ? 'status-processing'
                                : ord.status.includes('Transit')
                                ? 'status-transit'
                                : 'status-delivered'
                            }`}
                          >
                            {ord.status}
                          </span>
                        </td>
                        <td>
                          <select
                            className="order-status-select"
                            value={ord.status}
                            onChange={(e) =>
                              handleUpdateOrderStatus(ord.id, e.target.value as OrderItem['status'])
                            }
                          >
                            <option value="Processing">Processing</option>
                            <option value="In Snuggle Transit ☁️">In Snuggle Transit ☁️</option>
                            <option value="Delivered & Snuggled 🏡">Delivered & Snuggled 🏡</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Full Admin Orders Fulfillment & Dispatch Console Tab Content */}
        {dashboardSection === 'orders' && (
          <div className="dashboard-orders-tab-view fade-in-section">
            <div className="orders-header-banner admin-banner">
              <span className="orders-badge admin">📮 Dispatch & Fulfillment Console</span>
              <h2 className="orders-title">Sanctuary Orders & Live Dispatch Queue</h2>
              <p className="orders-subtitle">
                Inspect store-wide customer orders, update shipment statuses in real time, generate live courier radar tracking, and export adoption manifests.
              </p>

              {/* Operational Summary Chips */}
              <div className="orders-summary-chips-row admin-row">
                <span className="summary-chip pink">📦 All Orders: {orders.length}</span>
                <span className="summary-chip yellow">⏳ Processing: {orders.filter((o) => o.status === 'Processing').length}</span>
                <span className="summary-chip transit">☁️ In Transit: {orders.filter((o) => o.status.includes('Transit')).length}</span>
                <span className="summary-chip delivered">🏡 Delivered: {orders.filter((o) => o.status.includes('Delivered')).length}</span>
              </div>
            </div>

            {/* Order Fulfillment & Dispatch Management Console */}
            <div className="dash-box orders-fulfillment-box full-orders-box">
              <div className="dash-box-header">
                <div>
                  <span className="dash-box-pill">📮 Live Registry Stream</span>
                  <h3 className="dash-box-title">All Customer Shipments ({filteredAdminOrders.length})</h3>
                </div>

                <div className="orders-control-bar">
                  {/* Status Filter Tabs */}
                  <div className="order-filter-pills">
                    {['all', 'processing', 'transit', 'delivered'].map((filterKey) => (
                      <button
                        key={filterKey}
                        className={`filter-pill-btn ${orderStatusFilter === filterKey ? 'active' : ''}`}
                        onClick={() => {
                          playPop();
                          setOrderStatusFilter(filterKey);
                        }}
                        type="button"
                      >
                        {filterKey.charAt(0).toUpperCase() + filterKey.slice(1)}
                      </button>
                    ))}
                  </div>

                  {/* Search Input */}
                  <input
                    type="text"
                    className="orders-console-search"
                    placeholder="Search by ID, plushie, or parent..."
                    value={orderSearchQuery}
                    onChange={(e) => setOrderSearchQuery(e.target.value)}
                  />

                  <button
                    className="admin-action-btn-small"
                    onClick={() => {
                      playChime();
                      confettiEngine.burst();
                      showToast('📄 Orders registry exported as CSV!');
                    }}
                    type="button"
                  >
                    📥 Export CSV
                  </button>
                </div>
              </div>

              <div className="fulfillment-table-wrapper">
                <table className="fulfillment-table">
                  <thead>
                    <tr>
                      <th>Registry #</th>
                      <th>Plushie Friend</th>
                      <th>Certified Parent</th>
                      <th>Destination</th>
                      <th>Date</th>
                      <th>Total</th>
                      <th>Current Status</th>
                      <th>Live Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAdminOrders.map((ord) => (
                      <tr key={ord.id}>
                        <td>
                          <span className="registry-number-chip">#{ord.registryNumber}</span>
                        </td>
                        <td>
                          <div className="table-plushie-cell">
                            <Image
                              src={ord.image}
                              alt={ord.plushieName}
                              width={38}
                              height={38}
                              className="table-plushie-thumb"
                            />
                            <span>{ord.plushieName}</span>
                          </div>
                        </td>
                        <td>
                          <strong>{ord.parentName}</strong>
                        </td>
                        <td>
                          <span className="dest-cell">{ord.destination}</span>
                        </td>
                        <td>
                          <span className="date-cell">{ord.date}</span>
                        </td>
                        <td>
                          <strong>${ord.total.toFixed(2)}</strong>
                        </td>
                        <td>
                          <span
                            className={`fulfillment-status-tag ${
                              ord.status === 'Processing'
                                ? 'status-processing'
                                : ord.status.includes('Transit')
                                ? 'status-transit'
                                : 'status-delivered'
                            }`}
                          >
                            {ord.status}
                          </span>
                        </td>
                        <td>
                          <div className="admin-order-action-cell">
                            <select
                              className="order-status-select"
                              value={ord.status}
                              onChange={(e) =>
                                handleUpdateOrderStatus(ord.id, e.target.value as OrderItem['status'])
                              }
                            >
                              <option value="Processing">Processing</option>
                              <option value="In Snuggle Transit ☁️">In Snuggle Transit ☁️</option>
                              <option value="Delivered & Snuggled 🏡">Delivered & Snuggled 🏡</option>
                            </select>

                            <button
                              type="button"
                              className="btn-track-mini"
                              onClick={() => {
                                playPop();
                                setSelectedOrderForTracking(ord);
                              }}
                              title="Inspect Live Tracking"
                            >
                              🚚
                            </button>

                            <button
                              type="button"
                              className="btn-cert-mini"
                              onClick={() => {
                                playChime();
                                setCertificateViewOrder(ord);
                              }}
                              title="Inspect Certificate"
                            >
                              🖨️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    )}
      </>
    ) : (
              <div className="dashboard-locked-card">
                <div className="locked-mascot-circle">
                  <span className="locked-mascot-emoji">🧸🔒</span>
                </div>
                <div className="locked-badge-pill">🔒 Sanctuary Member Access Only</div>
                <h1 className="locked-title">Sanctuary Dashboard is Resting</h1>
                <p className="locked-subtitle">
                  You are currently signed out. Sign in to view your cuddle stats, adoption certificates, live delivery tracking, and sanctuary controls.
                </p>

                <div className="locked-actions-row">
                  <button
                    type="button"
                    className="btn-demo-quick user-btn"
                    onClick={() => {
                      playChime();
                      loginAsUserDemo();
                      showToast('✨ Signed in as Arsalan Abbas (Verified Cloud Parent)!');
                    }}
                  >
                    ⚡ Demo Parent Sign In (Customer Hub)
                  </button>

                  <button
                    type="button"
                    className="btn-demo-quick admin-btn"
                    onClick={() => {
                      playChime();
                      loginAsAdminDemo();
                      showToast('🛡️ Signed in as Cloud Warden (Sanctuary Administrator)!');
                    }}
                  >
                    🛡️ Demo Admin Sign In (Shop Manager)
                  </button>

                  <Link href="/login" className="btn-primary" onClick={playPop}>
                    Sign In with Email & Password ✨ →
                  </Link>

                  <Link href="/#shop-section" className="btn-secondary" onClick={playPop}>
                    Explore Cuddle Squad 🍓
                  </Link>
                </div>
              </div>
            )}

            {isLoggedIn && user && (
              <>
                {dashboardSection === 'profile' && renderProfileSection(isAdminView)}
                {dashboardSection === 'security' && renderSecuritySection(isAdminView)}
                {dashboardSection === 'billing' && renderBillingSection()}
                {dashboardSection === 'notifications' && renderNotificationsSection()}
                {dashboardSection === 'preferences' && renderPreferencesSection(isAdminView)}
                {dashboardSection === 'wishlist' && renderWishlistSection()}
              </>
            )}
          </div>
        </div>
      </main>

      {/* Edit Announcement Modal */}
      {isNoticeEditing && (
        <div
          className="modal-backdrop open"
          onClick={() => setIsNoticeEditing(false)}
          role="dialog"
          aria-modal="true"
        >
          <div className="dashboard-modal-card" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close-btn"
              onClick={() => setIsNoticeEditing(false)}
              type="button"
            >
              ✕
            </button>
            <h3 className="modal-title">Broadcast Sanctuary Announcement 📢</h3>
            <p className="modal-subtitle">
              This message will immediately appear at the top of the dashboard and sanctuary banners.
            </p>

            <form onSubmit={handleSaveNotice} className="modal-form">
              <textarea
                className="form-textarea modal-textarea"
                rows={3}
                value={noticeDraft}
                onChange={(e) => setNoticeDraft(e.target.value)}
                placeholder="Enter sanctuary announcement..."
                required
              />
              <div className="modal-actions-row">
                <button type="submit" className="btn-primary">
                  Broadcast Notice ✨
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setIsNoticeEditing(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New Plushie Modal */}
      {isAddPlushieOpen && (
        <div
          className="modal-backdrop open"
          onClick={() => setIsAddPlushieOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div className="dashboard-modal-card" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close-btn"
              onClick={() => setIsAddPlushieOpen(false)}
              type="button"
            >
              ✕
            </button>
            <h3 className="modal-title">Introduce New Plushie Companion 🧸</h3>
            <p className="modal-subtitle">
              Add a new friend into the CloudPuff sanctuary catalog and warehouse stock.
            </p>

            <form onSubmit={handleAddPlushieSubmit} className="modal-form">
              <div className="form-group">
                <label className="form-label">Plushie Official Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Taro Mochi Panda"
                  value={newPlushieName}
                  onChange={(e) => setNewPlushieName(e.target.value)}
                  required
                />
              </div>

              <div className="form-grid-modal">
                <div className="form-group">
                  <label className="form-label">Price ($ USD)</label>
                  <input
                    type="number"
                    step="0.5"
                    className="form-input"
                    value={newPlushiePrice}
                    onChange={(e) => setNewPlushiePrice(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Initial Stock</label>
                  <input
                    type="number"
                    className="form-input"
                    value={newPlushieStock}
                    onChange={(e) => setNewPlushieStock(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Sanctuary Habitat Category</label>
                <select
                  className="form-select"
                  value={newPlushieCategory}
                  onChange={(e) => setNewPlushieCategory(e.target.value)}
                >
                  <option value="kawaii">Kawaii Treats 🍓</option>
                  <option value="dream">Dream & Sky ☁️</option>
                  <option value="sea">Ocean Sweethearts 🌊</option>
                  <option value="prehistoric">Prehistoric Cuties 🦖</option>
                </select>
              </div>

              <div className="modal-actions-row">
                <button type="submit" className="btn-primary">
                  Admit to Sanctuary 🌸
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setIsAddPlushieOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Live Tracking Modal Integration */}
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
          estimatedDelivery="September 15, 2026"
        />
      )}

      {/* Official Certificate Preview Modal */}
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

      {/* Interactive Two-Factor Authentication (2FA) Pairing Modal */}
      {is2FAModalOpen && (
        <div
          className="modal-backdrop open"
          onClick={() => setIs2FAModalOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div className="dashboard-modal-card two-factor-modal-card" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close-btn"
              onClick={() => setIs2FAModalOpen(false)}
              type="button"
            >
              ✕
            </button>

            <div className="two-factor-modal-header">
              <span className="modal-top-pill">🔐 Military-Grade Plushie Security</span>
              <h3 className="modal-title">Pair Two-Factor Authenticator (TOTP)</h3>
              <p className="modal-subtitle">
                Scan this QR code with Google Authenticator, Authy, or Apple Passwords to pair your sanctuary account.
              </p>
            </div>

            <div className="two-factor-modal-body">
              {/* Step 1: QR Code & Secret */}
              <div className="totp-setup-step">
                <div className="totp-step-badge">Step 1</div>
                <div className="totp-step-content">
                  <p className="totp-step-title">Scan QR code or enter secret manual key:</p>

                  <div className="totp-qr-wrapper">
                    <svg
                      className="totp-qr-code-svg"
                      viewBox="0 0 160 160"
                      width="160"
                      height="160"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      {/* Realistic Authentic QR Code SVG pattern */}
                      <rect width="160" height="160" fill="#FFFFFF" rx="12" />
                      {/* Corner locator top-left */}
                      <rect x="14" y="14" width="40" height="40" fill="#2D2B38" rx="6" />
                      <rect x="22" y="22" width="24" height="24" fill="#FFFFFF" rx="3" />
                      <rect x="28" y="28" width="12" height="12" fill="#FF7597" rx="2" />
                      {/* Corner locator top-right */}
                      <rect x="106" y="14" width="40" height="40" fill="#2D2B38" rx="6" />
                      <rect x="114" y="22" width="24" height="24" fill="#FFFFFF" rx="3" />
                      <rect x="120" y="28" width="12" height="12" fill="#FF7597" rx="2" />
                      {/* Corner locator bottom-left */}
                      <rect x="14" y="106" width="40" height="40" fill="#2D2B38" rx="6" />
                      <rect x="22" y="114" width="24" height="24" fill="#FFFFFF" rx="3" />
                      <rect x="28" y="120" width="12" height="12" fill="#FF7597" rx="2" />
                      {/* Data dots pattern */}
                      <rect x="62" y="16" width="8" height="8" fill="#2D2B38" rx="2" />
                      <rect x="76" y="16" width="8" height="8" fill="#2D2B38" rx="2" />
                      <rect x="90" y="16" width="8" height="8" fill="#2D2B38" rx="2" />
                      <rect x="62" y="30" width="8" height="8" fill="#2D2B38" rx="2" />
                      <rect x="76" y="44" width="8" height="8" fill="#2D2B38" rx="2" />
                      <rect x="90" y="30" width="8" height="8" fill="#2D2B38" rx="2" />
                      <rect x="16" y="62" width="8" height="8" fill="#2D2B38" rx="2" />
                      <rect x="30" y="76" width="8" height="8" fill="#2D2B38" rx="2" />
                      <rect x="44" y="62" width="8" height="8" fill="#2D2B38" rx="2" />
                      <rect x="62" y="62" width="8" height="8" fill="#2D2B38" rx="2" />
                      <rect x="90" y="62" width="8" height="8" fill="#2D2B38" rx="2" />
                      <rect x="104" y="76" width="8" height="8" fill="#2D2B38" rx="2" />
                      <rect x="118" y="62" width="8" height="8" fill="#2D2B38" rx="2" />
                      <rect x="132" y="76" width="8" height="8" fill="#2D2B38" rx="2" />
                      {/* Center mascot icon */}
                      <circle cx="80" cy="80" r="16" fill="#FFF0F5" stroke="#FF7597" strokeWidth="2" />
                      <text x="80" y="85" textAnchor="middle" fontSize="14">🧸</text>
                      {/* Lower patterns */}
                      <rect x="62" y="104" width="8" height="8" fill="#2D2B38" rx="2" />
                      <rect x="76" y="118" width="8" height="8" fill="#2D2B38" rx="2" />
                      <rect x="90" y="104" width="8" height="8" fill="#2D2B38" rx="2" />
                      <rect x="104" y="118" width="8" height="8" fill="#2D2B38" rx="2" />
                      <rect x="118" y="104" width="8" height="8" fill="#2D2B38" rx="2" />
                      <rect x="132" y="118" width="8" height="8" fill="#2D2B38" rx="2" />
                      <rect x="62" y="132" width="8" height="8" fill="#2D2B38" rx="2" />
                      <rect x="76" y="132" width="8" height="8" fill="#2D2B38" rx="2" />
                      <rect x="104" y="132" width="8" height="8" fill="#2D2B38" rx="2" />
                      <rect x="132" y="132" width="8" height="8" fill="#2D2B38" rx="2" />
                    </svg>

                    <div className="totp-secret-key-card">
                      <span className="key-sublabel">Can&apos;t scan? Enter manually:</span>
                      <div className="key-copy-row">
                        <code className="totp-code-string">CLOU-DPUF-F2FA-SEC9-9481</code>
                        <button
                          type="button"
                          className="btn-copy-secret"
                          onClick={() => {
                            navigator.clipboard?.writeText('CLOU-DPUF-F2FA-SEC9-9481');
                            showToast('📋 Secret key copied!');
                          }}
                        >
                          Copy Key
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2: Verification Code Input */}
              <form onSubmit={handleVerify2FACode} className="totp-setup-step" style={{ marginTop: '1.2rem' }}>
                <div className="totp-step-badge">Step 2</div>
                <div className="totp-step-content">
                  <p className="totp-step-title">Enter the 6-digit TOTP code from your app:</p>
                  <div className="totp-input-row">
                    <input
                      type="text"
                      className="totp-verify-input"
                      maxLength={6}
                      pattern="[0-9]{6}"
                      inputMode="numeric"
                      placeholder="• • • • • •"
                      value={totpCode}
                      onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                      autoFocus
                      required
                    />
                    <button type="submit" className="btn-primary">
                      Verify & Activate 2FA 🛡️
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Add Payment Method Modal */}
      {isAddCardOpen && (
        <div
          className="modal-backdrop open"
          onClick={() => setIsAddCardOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div className="dashboard-modal-card add-card-modal-card" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close-btn"
              onClick={() => setIsAddCardOpen(false)}
              type="button"
            >
              ✕
            </button>

            <div className="two-factor-modal-header">
              <span className="modal-top-pill">💳 Encrypted Wallet</span>
              <h3 className="modal-title">Add Payment Card</h3>
              <p className="modal-subtitle">
                Add a credit or debit card for 1-click plushie adoptions and nursery supplies.
              </p>
            </div>

            <form onSubmit={handleAddCardSubmit} className="modal-form">
              <div className="form-field-group">
                <label className="field-label">Card Number</label>
                <input
                  type="text"
                  className="form-input font-mono"
                  placeholder="4000 1234 5678 9010"
                  maxLength={19}
                  value={newCardNumber}
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, '').slice(0, 16);
                    const formatted = v.match(/.{1,4}/g)?.join(' ') || v;
                    setNewCardNumber(formatted);
                  }}
                  required
                />
              </div>

              <div className="form-grid-two">
                <div className="form-field-group">
                  <label className="field-label">Expiration (MM/YY)</label>
                  <input
                    type="text"
                    className="form-input font-mono"
                    placeholder="08/29"
                    maxLength={5}
                    value={newCardExp}
                    onChange={(e) => {
                      let v = e.target.value.replace(/\D/g, '').slice(0, 4);
                      if (v.length > 2) v = v.slice(0, 2) + '/' + v.slice(2);
                      setNewCardExp(v);
                    }}
                    required
                  />
                </div>

                <div className="form-field-group">
                  <label className="field-label">CVC / Security Code</label>
                  <input
                    type="password"
                    className="form-input font-mono"
                    placeholder="•••"
                    maxLength={4}
                    value={newCardCvc}
                    onChange={(e) => setNewCardCvc(e.target.value.replace(/\D/g, ''))}
                    required
                  />
                </div>
              </div>

              <div className="modal-actions-row">
                <button type="submit" className="btn-primary">
                  Save Card Securely 💳
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setIsAddCardOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function DashboardLoading() {
  return (
    <div className="page-wrapper dashboard-page-root">
      <Navbar />
      <main className="dashboard-main-container container">
        <div style={{ textAlign: 'center', padding: '5rem 1rem', fontFamily: 'var(--font-heading)' }}>
          <p style={{ fontSize: '1.2rem', color: 'var(--pink-primary)' }}>🌸 Syncing with Sanctuary Cuddle Cloud...</p>
        </div>
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <DashboardInner />
    </Suspense>
  );
}
