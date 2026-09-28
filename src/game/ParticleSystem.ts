import { Container, Graphics } from 'pixi.js';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: number;
  alpha: number;
  gravity: number;
}

/**
 * ParticleSystem gerencia partículas de faíscas cósmicas, poeira estelar de fundo
 * e explosões de vitória (confetes galácticos).
 */
export class ParticleSystem extends Container {
  private particles: Particle[] = [];
  private burstGraphics: Graphics;
  private backgroundDust: Particle[] = [];
  private bgGraphics: Graphics;
  private sceneWidth: number;
  private sceneHeight: number;

  constructor(sceneWidth: number, sceneHeight: number) {
    super();
    this.sceneWidth = sceneWidth;
    this.sceneHeight = sceneHeight;

    this.bgGraphics = new Graphics();
    this.burstGraphics = new Graphics();

    this.addChild(this.bgGraphics);
    this.addChild(this.burstGraphics);

    this.initBackgroundDust();
  }

  private initBackgroundDust() {
    // Cria 40 partículas flutuantes de poeira cósmica suave
    for (let i = 0; i < 40; i++) {
      this.backgroundDust.push({
        x: Math.random() * this.sceneWidth,
        y: Math.random() * this.sceneHeight,
        vx: (Math.random() - 0.5) * 0.3,
        vy: -0.2 - Math.random() * 0.3,
        life: 100,
        maxLife: 100,
        size: 1 + Math.random() * 2,
        color: Math.random() > 0.5 ? 0x00f0ff : 0xa855f7,
        alpha: 0.15 + Math.random() * 0.3,
        gravity: 0,
      });
    }
  }

  public emitWinBurst(x: number, y: number, count: number = 40, colors: number[] = [0xfbbf24, 0x00f0ff, 0xff007f]) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 6;
      const color = colors[Math.floor(Math.random() * colors.length)];

      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        life: 0,
        maxLife: 40 + Math.random() * 30,
        size: 2 + Math.random() * 4,
        color,
        alpha: 1,
        gravity: 0.15,
      });
    }
  }

  public update(delta: number) {
    // 1. Atualiza poeira estelar de fundo
    this.bgGraphics.clear();
    for (const p of this.backgroundDust) {
      p.x += p.vx * delta;
      p.y += p.vy * delta;

      if (p.y < 0) p.y = this.sceneHeight;
      if (p.x < 0) p.x = this.sceneWidth;
      if (p.x > this.sceneWidth) p.x = 0;

      this.bgGraphics.circle(p.x, p.y, p.size).fill({ color: p.color, alpha: p.alpha });
    }

    // 2. Atualiza partículas ativas de explosão
    this.burstGraphics.clear();
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life += delta;
      p.x += p.vx * delta;
      p.y += p.vy * delta;
      p.vy += p.gravity * delta;
      p.alpha = Math.max(0, 1 - p.life / p.maxLife);

      if (p.life >= p.maxLife) {
        this.particles.splice(i, 1);
        continue;
      }

      this.burstGraphics.circle(p.x, p.y, p.size).fill({ color: p.color, alpha: p.alpha });
    }
  }

  public resize(sceneWidth: number, sceneHeight: number) {
    this.sceneWidth = sceneWidth;
    this.sceneHeight = sceneHeight;
  }
}
