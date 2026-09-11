import { Plushie, MoodKey, MoodProfile } from '@/types/plushie';

export const PLUSHIES: Plushie[] = [
  {
    id: 'pip-bunny',
    name: 'Pip & Peaches',
    subtitle: 'The Sweet Strawberry Bunny',
    price: 32.00,
    originalPrice: 38.00,
    rating: 5.0,
    reviewsCount: 148,
    squishFactor: '9.9 / 10',
    image: '/assets/hero.jpg',
    badge: 'Best Seller ⭐',
    badgeClass: 'best-seller',
    category: 'kawaii',
    mood: 'dreamy',
    description: 'Pip is crowned with an artisanal hand-stitched strawberry beret and features velvety soft blushing cheeks. Certified 100% stress-melting for study sessions or cozy bedtime cuddles.',
    dimensions: '11" Tall x 8.5" Wide',
    material: 'Cloud-grade Micro-Velvet',
    filling: 'Super-Chonk Polyfill (Eco-Friendly)',
    care: 'Gentle Machine Wash Cold, Air Fluff'
  },
  {
    id: 'boba-bear',
    name: 'Boba the Bear',
    subtitle: 'Sleepy Milk-Tea Companion',
    price: 34.00,
    originalPrice: 42.00,
    rating: 4.9,
    reviewsCount: 210,
    squishFactor: '10 / 10',
    image: '/assets/bear.jpg',
    badge: 'Fan Favorite 🧋',
    badgeClass: 'best-seller',
    category: 'kawaii',
    mood: 'sleepy',
    description: 'Boba never leaves home without his embroidered brown-sugar boba cup. His round belly is engineered with memory-foam resilience for maximum embrace comfort.',
    dimensions: '12" Tall x 10" Wide',
    material: 'Warm Sherpa Fleece & Velvet',
    filling: 'Memory-Foam & Cloud Polyfill',
    care: 'Machine Washable'
  },
  {
    id: 'matcha-dino',
    name: 'Matcha Dino',
    subtitle: 'Zen Baby Stegosaurus',
    price: 29.00,
    originalPrice: 36.00,
    rating: 4.9,
    reviewsCount: 94,
    squishFactor: '9.7 / 10',
    image: '/assets/dino.jpg',
    badge: 'Staff Pick 🍵',
    badgeClass: 'staff-pick',
    category: 'prehistoric',
    mood: 'zen',
    description: 'A soothing pastel-green cutie with pillowy buttercup-yellow dorsal plates. Radiates calm energy to keep anxiety at bay during work or bedtime.',
    dimensions: '10" Tall x 13" Long',
    material: 'Hypoallergenic Minky Fabric',
    filling: 'Anti-Clump Cloud-Fill',
    care: 'Machine Wash Cold / Tumble Low'
  },
  {
    id: 'cloudia-cat',
    name: 'Cloudia the Kitty',
    subtitle: 'Dreamy Lavender Dreamer',
    price: 31.00,
    originalPrice: 37.00,
    rating: 5.0,
    reviewsCount: 165,
    squishFactor: '9.8 / 10',
    image: '/assets/cat.jpg',
    badge: 'New Arrival ✨',
    badgeClass: 'new-cutie',
    category: 'dream',
    mood: 'sleepy',
    description: 'Cloudia sleeps with a gentle smile and a golden star embroidered across her chest. Crafted from whisper-light lilac plush that feels like petting morning mist.',
    dimensions: '10.5" Tall x 9" Wide',
    material: 'Feather-Soft Cloud Fluff',
    filling: '100% Recycled Cotton Polyfill',
    care: 'Spot Clean or Gentle Cycle'
  },
  {
    id: 'panko-axolotl',
    name: 'Panko the Axolotl',
    subtitle: 'Cheerful Water Sweetheart',
    price: 33.00,
    originalPrice: 39.00,
    rating: 4.9,
    reviewsCount: 182,
    squishFactor: '10 / 10',
    image: '/assets/axolotl.jpg',
    badge: 'Viral Cutie 🌊',
    badgeClass: 'best-seller',
    category: 'sea',
    mood: 'chaotic',
    description: 'With ultra-fluffy coral pink gill frills and stubby little arms, Panko is ready to celebrate every small victory with you. Impossible not to grin when hugging him.',
    dimensions: '11" Tall x 11" Wide',
    material: 'Ultra-Fine Peach Skin Velvet',
    filling: 'High-Density Squish Fill',
    care: 'Machine Washable Friendly'
  },
  {
    id: 'mochi-seal',
    name: 'Mochi the Seal',
    subtitle: 'The Perfect Spherical Chonk',
    price: 28.00,
    originalPrice: 35.00,
    rating: 5.0,
    reviewsCount: 320,
    squishFactor: '10 / 10',
    image: '/assets/seal.jpg',
    badge: 'Ultimate Hug 🦭',
    badgeClass: 'staff-pick',
    category: 'sea',
    mood: 'hug',
    description: 'The definitive round boi. Designed like an authentic Japanese mochi bun with cute little flippers and adorable whiskers. Perfectly shaped to lean on as a desk pillow.',
    dimensions: '12" Diameter Round Chonk',
    material: 'Silky Mochi Stretch Velour',
    filling: 'Ultra-Squish Down-Alternative',
    care: 'Machine Washable'
  }
];

export const MOOD_MAP: Record<MoodKey, MoodProfile> = {
  sleepy: {
    id: 'cloudia-cat',
    moodName: 'Sleepy & Cozy',
    quote: '"Let’s wrap up in blankets and dream among the stars..."',
    blurb: 'You need deep relaxation and soft pastel comfort. Cloudia Kitty is scientifically engineered for the sweetest naps.'
  },
  hug: {
    id: 'mochi-seal',
    moodName: 'Needs A Big Hug',
    quote: '"I am round, I am soft, and I will never let you go!"',
    blurb: 'For times when you need unconditional snuggle support. Mochi Seal’s spherical form absorbs 100% of gloomy thoughts.'
  },
  zen: {
    id: 'matcha-dino',
    moodName: 'Chill & Zen',
    quote: '"Take a deep breath... everything is going to be okay."',
    blurb: 'Calming matcha tones and soft dorsal plates create a peaceful sanctuary in your room.'
  },
  chaotic: {
    id: 'panko-axolotl',
    moodName: 'Chaotic Sweetheart',
    quote: '"*Happy wiggles* Let’s make today full of surprises!"',
    blurb: 'Bursting with playful energy and fluffy frills, Panko is your partner in crime for fun!'
  },
  dreamy: {
    id: 'pip-bunny',
    moodName: 'Sweet & Dreamy',
    quote: '"Strawberry dreams make the world a softer place."',
    blurb: 'Pip brings sweet fairytale vibes and cozy bunny warmth everywhere she hops.'
  }
};
