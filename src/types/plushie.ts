export type Category = 'all' | 'kawaii' | 'dream' | 'sea' | 'prehistoric';

export type MoodKey = 'sleepy' | 'hug' | 'zen' | 'chaotic' | 'dreamy';

export interface Plushie {
  id: string;
  name: string;
  subtitle: string;
  price: number;
  originalPrice: number;
  rating: number;
  reviewsCount: number;
  squishFactor: string;
  image: string;
  badge: string;
  badgeClass: 'best-seller' | 'staff-pick' | 'new-cutie';
  category: 'kawaii' | 'dream' | 'sea' | 'prehistoric';
  mood: MoodKey;
  description: string;
  dimensions: string;
  material: string;
  filling: string;
  care: string;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  qty: number;
}

export interface MoodProfile {
  id: string;
  moodName: string;
  quote: string;
  blurb: string;
}
