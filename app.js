/**
 * CloudPuff Plushies - Interactive Experience Engine
 * Handles catalog data, audio synth, cart drawer, mood matcher, confetti, modals
 */

// ==========================================
// 1. Catalog Data
// ==========================================
const PLUSHIES = [
  {
    id: 'pip-bunny',
    name: 'Pip & Peaches',
    subtitle: 'The Sweet Strawberry Bunny',
    price: 32.00,
    originalPrice: 38.00,
    rating: 5.0,
    reviewsCount: 148,
    squishFactor: '9.9 / 10',
    image: 'assets/hero.jpg',
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
    image: 'assets/bear.jpg',
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
    image: 'assets/dino.jpg',
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
    image: 'assets/cat.jpg',
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
    image: 'assets/axolotl.jpg',
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
    image: 'assets/seal.jpg',
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

// Mood Matcher Profiles
const MOOD_MAP = {
  'sleepy': {
    id: 'cloudia-cat',
    moodName: 'Sleepy & Cozy',
    quote: '"Let’s wrap up in blankets and dream among the stars..."',
    blurb: 'You need deep relaxation and soft pastel comfort. Cloudia Kitty is scientifically engineered for the sweetest naps.'
  },
  'hug': {
    id: 'mochi-seal',
    moodName: 'Needs A Big Hug',
    quote: '"I am round, I am soft, and I will never let you go!"',
    blurb: 'For times when you need unconditional snuggle support. Mochi Seal’s spherical form absorbs 100% of gloomy thoughts.'
  },
  'zen': {
    id: 'matcha-dino',
    moodName: 'Chill & Zen',
    quote: '"Take a deep breath... everything is going to be okay."',
    blurb: 'Calming matcha tones and soft dorsal plates create a peaceful sanctuary in your room.'
  },
  'chaotic': {
    id: 'panko-axolotl',
    moodName: 'Chaotic Sweetheart',
    quote: '"*Happy wiggles* Let’s make today full of surprises!"',
    blurb: 'Bursting with playful energy and fluffy frills, Panko is your partner in crime for fun!'
  },
  'dreamy': {
    id: 'pip-bunny',
    moodName: 'Sweet & Dreamy',
    quote: '"Strawberry dreams make the world a softer place."',
    blurb: 'Pip brings sweet fairytale vibes and cozy bunny warmth everywhere she hops.'
  }
};

// ==========================================
// 2. Web Audio Synthesizer (Cute SFX)
// ==========================================
class CuteSoundEngine {
  constructor() {
    this.ctx = null;
    this.muted = localStorage.getItem('cloudpuff_sound') === 'muted';
    this.initContext = this.initContext.bind(this);
  }

  initContext() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleSound() {
    this.muted = !this.muted;
    localStorage.setItem('cloudpuff_sound', this.muted ? 'muted' : 'active');
    if (!this.muted) {
      this.initContext();
      this.playChime();
    }
    return !this.muted;
  }

  playPop() {
    if (this.muted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sine';
      const now = this.ctx.currentTime;
      
      // Pitch ramp up then quickly down for cute bubble pop
      osc.frequency.setValueAtTime(420, now);
      osc.frequency.exponentialRampToValueAtTime(860, now + 0.05);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.12);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.13);
    } catch (e) {
      // Ignore audio error if blocked
    }
  }

  playChime() {
    if (this.muted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 arpeggio
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const startTime = this.ctx.currentTime + (idx * 0.06);

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.18, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.36);
      });
    } catch (e) {}
  }

  playSquish() {
    if (this.muted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(1100, now + 0.08);
      osc.frequency.exponentialRampToValueAtTime(500, now + 0.18);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.18);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.2);
    } catch (e) {}
  }
}

const audio = new CuteSoundEngine();

// ==========================================
// 3. Confetti Particle System
// ==========================================
class ConfettiCannon {
  constructor() {
    this.canvas = document.getElementById('confetti-canvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.animId = null;

    this.resize = this.resize.bind(this);
    window.addEventListener('resize', this.resize);
    this.resize();
  }

  resize() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  burst(x, y) {
    const colors = ['#FF7597', '#F472B6', '#C084FC', '#FDE047', '#86EFAC', '#67E8F9', '#FFD1DF'];
    const count = 45;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const velocity = 4 + Math.random() * 8;
      this.particles.push({
        x: x || window.innerWidth / 2,
        y: y || window.innerHeight / 2,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity - 2,
        size: 5 + Math.random() * 8,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 12,
        alpha: 1,
        shape: Math.random() > 0.4 ? 'star' : 'circle'
      });
    }

    if (!this.animId) {
      this.render();
    }
  }

  render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.22; // gravity
      p.rotation += p.rotationSpeed;
      p.alpha -= 0.015;

      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.globalAlpha = p.alpha;
      this.ctx.fillStyle = p.color;
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate((p.rotation * Math.PI) / 180);

      if (p.shape === 'circle') {
        this.ctx.beginPath();
        this.ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        this.ctx.fill();
      } else {
        // Draw cute little diamond/star
        this.ctx.beginPath();
        this.ctx.moveTo(0, -p.size);
        this.ctx.lineTo(p.size / 2, 0);
        this.ctx.lineTo(0, p.size);
        this.ctx.lineTo(-p.size / 2, 0);
        this.ctx.closePath();
        this.ctx.fill();
      }

      this.ctx.restore();
    }

    if (this.particles.length > 0) {
      this.animId = requestAnimationFrame(this.render.bind(this));
    } else {
      this.animId = null;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }
}

const confetti = new ConfettiCannon();

// ==========================================
// 4. Cart State Management
// ==========================================
class CartState {
  constructor() {
    this.items = JSON.parse(localStorage.getItem('cloudpuff_cart') || '[]');
    this.shippingThreshold = 45.00;
  }

  save() {
    localStorage.setItem('cloudpuff_cart', JSON.stringify(this.items));
    this.updateUI();
  }

  addItem(productId, qty = 1) {
    const product = PLUSHIES.find(p => p.id === productId);
    if (!product) return;

    const existing = this.items.find(item => item.id === productId);
    if (existing) {
      existing.qty += qty;
    } else {
      this.items.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        qty: qty
      });
    }

    this.save();
    audio.playChime();
    this.triggerCartBadgeBump();
    showToast(`✨ ${product.name} hopped into your cart! 💖`);
  }

  updateQty(productId, delta) {
    const item = this.items.find(i => i.id === productId);
    if (!item) return;

    item.qty += delta;
    if (item.qty <= 0) {
      this.removeItem(productId);
      return;
    }

    audio.playPop();
    this.save();
  }

  removeItem(productId) {
    const item = this.items.find(i => i.id === productId);
    this.items = this.items.filter(i => i.id !== productId);
    audio.playPop();
    this.save();
    if (item) {
      showToast(`👋 ${item.name} went back to cuddle cloud`);
    }
  }

  getTotalCount() {
    return this.items.reduce((sum, item) => sum + item.qty, 0);
  }

  getSubtotal() {
    return this.items.reduce((sum, item) => sum + (item.price * item.qty), 0);
  }

  triggerCartBadgeBump() {
    const badge = document.getElementById('cart-badge');
    if (badge) {
      badge.classList.remove('bump');
      void badge.offsetWidth; // trigger reflow
      badge.classList.add('bump');
    }
  }

  updateUI() {
    const count = this.getTotalCount();
    const subtotal = this.getSubtotal();

    // Update Badges
    const badge = document.getElementById('cart-badge');
    if (badge) {
      badge.textContent = count;
    }

    // Shipping Progress
    const shippingMsg = document.getElementById('shipping-msg');
    const progressFill = document.getElementById('shipping-progress-fill');
    if (shippingMsg && progressFill) {
      if (subtotal >= this.shippingThreshold) {
        shippingMsg.innerHTML = `🎉 <strong>Hooray!</strong> You unlocked FREE cuddly shipping!`;
        progressFill.style.width = '100%';
      } else if (subtotal > 0) {
        const remaining = (this.shippingThreshold - subtotal).toFixed(2);
        const percent = Math.min(100, Math.round((subtotal / this.shippingThreshold) * 100));
        shippingMsg.innerHTML = `Add <strong>$${remaining}</strong> more for <strong>FREE Cuddle Delivery!</strong>`;
        progressFill.style.width = `${percent}%`;
      } else {
        shippingMsg.innerHTML = `Add <strong>$45.00</strong> to get <strong>FREE Cuddle Delivery!</strong>`;
        progressFill.style.width = '0%';
      }
    }

    // Cart Items Render
    const cartItemsWrap = document.getElementById('cart-items-wrap');
    if (cartItemsWrap) {
      if (this.items.length === 0) {
        cartItemsWrap.innerHTML = `
          <div class="cart-empty-state">
            <div class="cart-empty-icon">🧸</div>
            <h3>Your cart is feeling lonely!</h3>
            <p style="margin-top: 0.5rem; font-size: 0.95rem;">Adopt a fluffy friend to warm up this basket.</p>
            <button class="btn-primary" style="margin-top: 1.5rem; font-size: 0.95rem; padding: 0.65rem 1.4rem;" onclick="closeCart(); scrollToShop();">
              Explore Cuties 🍓
            </button>
          </div>
        `;
      } else {
        cartItemsWrap.innerHTML = this.items.map(item => `
          <div class="cart-item">
            <img class="cart-item-img" src="${item.image}" alt="${item.name}">
            <div class="cart-item-details">
              <h4>${item.name}</h4>
              <div class="cart-item-price">$${(item.price * item.qty).toFixed(2)}</div>
              <div class="cart-item-qty">
                <button class="qty-btn" onclick="cart.updateQty('${item.id}', -1)">-</button>
                <span>${item.qty}</span>
                <button class="qty-btn" onclick="cart.updateQty('${item.id}', 1)">+</button>
              </div>
            </div>
            <button class="remove-item-btn" title="Remove" onclick="cart.removeItem('${item.id}')">
              ✕
            </button>
          </div>
        `).join('');
      }
    }

    // Cart Totals
    const subtotalEl = document.getElementById('cart-subtotal');
    const totalEl = document.getElementById('cart-total');
    const shippingEl = document.getElementById('cart-shipping-cost');

    if (subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
    if (shippingEl) {
      if (subtotal === 0) {
        shippingEl.textContent = '$0.00';
      } else if (subtotal >= this.shippingThreshold) {
        shippingEl.textContent = 'FREE ✨';
      } else {
        shippingEl.textContent = '$4.99';
      }
    }
    if (totalEl) {
      const shippingCost = (subtotal > 0 && subtotal < this.shippingThreshold) ? 4.99 : 0;
      totalEl.textContent = `$${(subtotal + shippingCost).toFixed(2)}`;
    }
  }
}

const cart = new CartState();

// ==========================================
// 5. Product Catalog Rendering & Filtering
// ==========================================
function renderProducts(filter = 'all') {
  const grid = document.getElementById('products-grid');
  if (!grid) return;

  const filtered = filter === 'all' 
    ? PLUSHIES 
    : PLUSHIES.filter(p => p.category === filter);

  grid.innerHTML = filtered.map(p => `
    <article class="product-card" data-id="${p.id}">
      <div class="product-thumb-wrap" onclick="openQuickView('${p.id}')">
        <span class="card-pill-tag ${p.badgeClass}">${p.badge}</span>
        <button class="wishlist-heart-btn" title="Save to favorites" onclick="toggleWishlist(event, this)">
          ♥
        </button>
        <img class="product-thumb" src="${p.image}" alt="${p.name} Plushie" loading="lazy">
      </div>
      <div class="product-info">
        <div class="squish-meter-bar">
          <span>Squish Factor</span>
          <span class="squish-score">☁️ ${p.squishFactor}</span>
        </div>
        <h3 class="product-title">${p.name}</h3>
        <p class="product-bio">${p.subtitle} — ${p.description.substring(0, 75)}...</p>
        <div class="product-price-row">
          <div class="price-box">
            <span class="current-price">$${p.price.toFixed(2)}</span>
            <span class="original-price">$${p.originalPrice.toFixed(2)}</span>
          </div>
          <span class="shipping-pill">Ready to Ship</span>
        </div>
        <div class="card-actions">
          <button class="quick-view-btn" onclick="openQuickView('${p.id}')">
            Quick Peek 👀
          </button>
          <button class="adopt-btn" onclick="adoptPlushie(event, '${p.id}')">
            Adopt Me 💖
          </button>
        </div>
      </div>
    </article>
  `).join('');
}

function initCategoryFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      audio.playPop();
      renderProducts(btn.dataset.category);
    });
  });
}

// ==========================================
// 6. Mood Matcher Interactive Logic
// ==========================================
function initMoodMatcher() {
  const moodBtns = document.querySelectorAll('.mood-btn');
  moodBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      moodBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      audio.playPop();
      const moodKey = btn.dataset.mood;
      renderMoodResult(moodKey);
    });
  });

  // Default initial mood
  renderMoodResult('sleepy');
}

function renderMoodResult(moodKey) {
  const mood = MOOD_MAP[moodKey];
  if (!mood) return;

  const plushie = PLUSHIES.find(p => p.id === mood.id);
  if (!plushie) return;

  const resultContainer = document.getElementById('mood-result-display');
  if (!resultContainer) return;

  // Add subtle bounce transition
  resultContainer.style.opacity = '0.5';
  resultContainer.style.transform = 'scale(0.98)';

  setTimeout(() => {
    resultContainer.innerHTML = `
      <div class="mood-result-img-wrap" onclick="openQuickView('${plushie.id}')" style="cursor: pointer;">
        <img src="${plushie.image}" alt="${plushie.name}">
      </div>
      <div class="mood-result-info">
        <span class="match-tag">✨ 100% Soulmate Match for ${mood.moodName}</span>
        <h3 class="mood-plushie-name">${plushie.name}</h3>
        <p class="mood-plushie-quote">${mood.quote}</p>
        <p class="mood-plushie-desc">${mood.blurb}</p>
        <div class="mood-meta-row">
          <div class="mood-meta-item">Squish Factor: <span>${plushie.squishFactor}</span></div>
          <div class="mood-meta-item">Adoption Fee: <span>$${plushie.price.toFixed(2)}</span></div>
        </div>
        <div style="display: flex; gap: 1rem; margin-top: 1rem; flex-wrap: wrap;">
          <button class="btn-primary" onclick="adoptPlushie(event, '${plushie.id}')">
            Adopt ${plushie.name.split(' ')[0]} Now 💖
          </button>
          <button class="btn-secondary" onclick="openQuickView('${plushie.id}')">
            Read Full Backstory 📖
          </button>
        </div>
      </div>
    `;
    resultContainer.style.opacity = '1';
    resultContainer.style.transform = 'scale(1)';
  }, 150);
}

// ==========================================
// 7. Quick View Modal Controller
// ==========================================
let currentModalQty = 1;
let currentModalPlushieId = null;

function openQuickView(productId) {
  const p = PLUSHIES.find(item => item.id === productId);
  if (!p) return;

  currentModalPlushieId = productId;
  currentModalQty = 1;
  audio.playPop();

  const modalBackdrop = document.getElementById('quick-view-modal');
  const modalBody = document.getElementById('modal-dialog-content');
  if (!modalBackdrop || !modalBody) return;

  modalBody.innerHTML = `
    <div class="modal-grid">
      <div class="modal-img-wrap">
        <img class="modal-img" src="${p.image}" alt="${p.name}">
      </div>
      <div class="modal-body">
        <span class="modal-badge">${p.badge}</span>
        <h2 class="modal-title">${p.name}</h2>
        <div class="modal-price">$${p.price.toFixed(2)} <span class="original-price" style="font-size: 1.1rem; margin-left: 0.5rem;">$${p.originalPrice.toFixed(2)}</span></div>
        <p class="modal-desc">${p.description}</p>
        
        <div class="modal-specs-list">
          <div class="spec-item">
            <strong>Squish Score</strong>
            <span>☁️ ${p.squishFactor}</span>
          </div>
          <div class="spec-item">
            <strong>Dimensions</strong>
            <span>${p.dimensions}</span>
          </div>
          <div class="spec-item">
            <strong>Outer Material</strong>
            <span>${p.material}</span>
          </div>
          <div class="spec-item">
            <strong>Care Instructions</strong>
            <span>${p.care}</span>
          </div>
        </div>

        <div class="modal-actions">
          <div class="modal-qty-selector">
            <button class="modal-qty-btn" onclick="adjustModalQty(-1)">-</button>
            <span class="modal-qty-val" id="modal-qty-display">1</span>
            <button class="modal-qty-btn" onclick="adjustModalQty(1)">+</button>
          </div>
          <button class="btn-primary" style="flex: 1;" onclick="adoptFromModal(event)">
            Adopt & Cuddle ($${p.price.toFixed(2)}) 💖
          </button>
        </div>
      </div>
    </div>
  `;

  modalBackdrop.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function adjustModalQty(delta) {
  currentModalQty = Math.max(1, currentModalQty + delta);
  audio.playPop();
  const display = document.getElementById('modal-qty-display');
  if (display) display.textContent = currentModalQty;
}

function adoptFromModal(event) {
  if (!currentModalPlushieId) return;
  cart.addItem(currentModalPlushieId, currentModalQty);
  confetti.burst(event.clientX, event.clientY);
  closeModal();
}

function closeModal() {
  const modalBackdrop = document.getElementById('quick-view-modal');
  if (modalBackdrop) {
    modalBackdrop.classList.remove('open');
    document.body.style.overflow = '';
  }
}

// ==========================================
// 8. Drawer, Wishlist, Toast & Helpers
// ==========================================
function openCart() {
  audio.playPop();
  const drawer = document.getElementById('cart-drawer-backdrop');
  if (drawer) {
    drawer.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}

function closeCart() {
  const drawer = document.getElementById('cart-drawer-backdrop');
  if (drawer) {
    drawer.classList.remove('open');
    document.body.style.overflow = '';
  }
}

function adoptPlushie(event, productId) {
  if (event) {
    event.stopPropagation();
    const rect = event.currentTarget.getBoundingClientRect();
    confetti.burst(rect.left + rect.width / 2, rect.top + rect.height / 2);
  }
  cart.addItem(productId, 1);
}

function toggleWishlist(event, btn) {
  event.stopPropagation();
  audio.playPop();
  btn.classList.toggle('loved');
  if (btn.classList.contains('loved')) {
    btn.innerHTML = '❤️';
    showToast('Added to your Love Wishlist! 🎀');
  } else {
    btn.innerHTML = '♥';
  }
}

function showToast(message) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = message;
  container.appendChild(toast);

  setTimeout(() => {
    if (toast.parentNode) {
      toast.parentNode.removeChild(toast);
    }
  }, 3000);
}

function scrollToShop() {
  const target = document.getElementById('shop-section');
  if (target) {
    target.scrollIntoView({ behavior: 'smooth' });
  }
}

// Mystery Box Feature
function triggerMysteryGacha(event) {
  audio.playSquish();
  const rect = event.currentTarget.getBoundingClientRect();
  confetti.burst(rect.left + rect.width / 2, rect.top + rect.height / 2);

  const perks = [
    '🎉 BONUS UNLOCKED: Use code **SNUGGLE15** for 15% off + Free Pip Sticker Pack!',
    '✨ LUCKY PULL: Use code **BOBABUDDY** for Free Mystery Plushie Keyring on orders over $40!',
    '🍓 CUTIE REWARD: Use code **MATCHALOVE** for $5 Instant Adoption Credit!'
  ];
  const chosenPerk = perks[Math.floor(Math.random() * perks.length)];

  alert(`${chosenPerk}\n\nCopied to your cuddle heart! 💌`);
}

// Checkout simulation
function simulateCheckout() {
  if (cart.items.length === 0) {
    showToast('Your cuddle cart is currently empty! 🧸');
    return;
  }
  audio.playChime();
  confetti.burst();
  alert(`🎊 Order confirmed! Thank you for adopting ${cart.getTotalCount()} plush friends! They are being tucked into their cloud boxes with love right now! ☁️📦`);
  cart.items = [];
  cart.save();
  closeCart();
}

// ==========================================
// 9. Interactive Hero Plushie Squish
// ==========================================
function initHeroSquish() {
  const heroCard = document.getElementById('hero-stage-card');
  if (!heroCard) return;

  heroCard.addEventListener('click', (e) => {
    audio.playSquish();
    heroCard.classList.remove('squish-active');
    void heroCard.offsetWidth; // trigger reflow
    heroCard.classList.add('squish-active');

    const rect = heroCard.getBoundingClientRect();
    confetti.burst(rect.left + rect.width / 2, rect.top + rect.height / 2);
    showToast('🍓 Squeeeak! Pip loved that cuddle!');
  });
}

// ==========================================
// 10. Initialization on Load
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  renderProducts('all');
  initCategoryFilters();
  initMoodMatcher();
  initHeroSquish();
  cart.updateUI();

  // Sound toggle button setup
  const soundBtn = document.getElementById('sound-toggle-btn');
  if (soundBtn) {
    soundBtn.innerHTML = audio.muted ? '<span>🔇</span> <span>Sound: Off</span>' : '<span>🔊</span> <span>Sound: On</span>';
    soundBtn.addEventListener('click', () => {
      const active = audio.toggleSound();
      soundBtn.innerHTML = active ? '<span>🔊</span> <span>Sound: On</span>' : '<span>🔇</span> <span>Sound: Off</span>';
      showToast(active ? '🔊 Cute SFX enabled!' : '🔇 Sound muted');
    });
  }

  // Mobile menu button
  const mobileBtn = document.getElementById('mobile-menu-btn');
  const navLinks = document.getElementById('nav-links');
  if (mobileBtn && navLinks) {
    mobileBtn.addEventListener('click', () => {
      navLinks.classList.toggle('mobile-open');
    });
  }

  // Close modals on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal();
      closeCart();
    }
  });

  // Newsletter signup form
  const newsletterForm = document.getElementById('newsletter-form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailInput = document.getElementById('newsletter-email');
      if (emailInput && emailInput.value) {
        audio.playChime();
        confetti.burst();
        showToast('💌 Welcome to the Secret Snuggle Club! Check your inbox for your adoption certificate! ✨');
        emailInput.value = '';
      }
    });
  }
});
