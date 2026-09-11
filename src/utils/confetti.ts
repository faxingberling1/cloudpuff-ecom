interface ConfettiParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
  alpha: number;
  shape: 'circle' | 'star';
}

class ConfettiEngine {
  private particles: ConfettiParticle[] = [];
  private animId: number | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;

  public init(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.resize();
    window.addEventListener('resize', this.resize.bind(this));
  }

  private resize() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  public burst(x?: number, y?: number) {
    if (!this.canvas || !this.ctx) return;
    const colors = ['#FF7597', '#F472B6', '#C084FC', '#FDE047', '#86EFAC', '#67E8F9', '#FFD1DF'];
    const count = 45;

    const startX = x ?? window.innerWidth / 2;
    const startY = y ?? window.innerHeight / 2;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const velocity = 4 + Math.random() * 8;
      this.particles.push({
        x: startX,
        y: startY,
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

  private render() {
    if (!this.canvas || !this.ctx) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.22;
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

export const confettiEngine = new ConfettiEngine();
