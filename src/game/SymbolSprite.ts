import { Container, Graphics, Sprite, Texture } from 'pixi.js';
import type { SymbolId } from '../types/slot.types';
import { SYMBOL_DEFINITIONS } from './slotConfig';

/**
 * SymbolSprite gerencia a renderização gráfica e estados de animação
 * de cada símbolo individual nos rolos do PixiJS.
 * Utiliza texturas geradas dinamicamente com Canvas/Vectors de alta fidelidade
 * garantindo nitidez cristalina em telas Retina e 60 FPS estáveis.
 */

const textureCache: Map<string, Texture> = new Map();

export class SymbolSprite extends Container {
  public symbolId: SymbolId;
  private bgGraphics: Graphics;
  private iconSprite: Sprite;
  private winGlowGraphics: Graphics;
  private size: number;
  private isWinning: boolean = false;
  private winAnimTime: number = 0;

  constructor(symbolId: SymbolId, size: number = 130) {
    super();
    this.symbolId = symbolId;
    this.size = size;

    // 1. Container de fundo com borda chanfrada neon
    this.bgGraphics = new Graphics();
    this.addChild(this.bgGraphics);

    // 2. Sprite do ícone/textura embutida
    const texture = SymbolSprite.getOrCreateTexture(symbolId, size);
    this.iconSprite = new Sprite(texture);
    this.iconSprite.anchor.set(0.5);
    this.iconSprite.position.set(size / 2, size / 2);
    this.addChild(this.iconSprite);

    // 3. Efeito de glow/aura ativado quando este símbolo ganha
    this.winGlowGraphics = new Graphics();
    this.winGlowGraphics.visible = false;
    this.addChild(this.winGlowGraphics);

    this.drawBaseCard();
  }

  public setSymbol(newSymbolId: SymbolId) {
    if (this.symbolId === newSymbolId) return;
    this.symbolId = newSymbolId;
    this.iconSprite.texture = SymbolSprite.getOrCreateTexture(newSymbolId, this.size);
    this.drawBaseCard();
  }

  public setWinning(winning: boolean) {
    this.isWinning = winning;
    this.winGlowGraphics.visible = winning;
    if (!winning) {
      this.scale.set(1);
      this.iconSprite.scale.set(1);
    }
  }

  /**
   * Atualização de animação de vitória no loop do Ticker do Pixi
   */
  public update(delta: number) {
    if (this.isWinning) {
      this.winAnimTime += delta * 0.08;
      const pulse = 1 + Math.sin(this.winAnimTime) * 0.08;
      this.iconSprite.scale.set(pulse);

      // Redesenha a borda pulsante de vitória
      const symDef = SYMBOL_DEFINITIONS[this.symbolId];
      this.winGlowGraphics.clear();
      this.winGlowGraphics
        .roundRect(2, 2, this.size - 4, this.size - 4, 14)
        .stroke({ color: symDef.glowColor, width: 3.5, alpha: 0.8 + Math.sin(this.winAnimTime * 2) * 0.2 });
    }
  }

  private drawBaseCard() {
    this.bgGraphics.clear();

    // Fundo do slot card com cantos arredondados e gradiente translúcido
    this.bgGraphics
      .roundRect(4, 4, this.size - 8, this.size - 8, 12)
      .fill({ color: 0x0e1326, alpha: 0.75 })
      .stroke({ color: 0x24325a, width: 1.5, alpha: 0.5 });
  }

  /**
   * Gera uma textura rica e nítida para o símbolo usando Canvas 2D de alta densidade
   */
  public static getOrCreateTexture(symbolId: SymbolId, size: number): Texture {
    const key = `${symbolId}_${size}`;
    if (textureCache.has(key)) {
      return textureCache.get(key)!;
    }

    const canvas = document.createElement('canvas');
    const dpr = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 2, 2) : 2;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      return Texture.WHITE;
    }

    ctx.scale(dpr, dpr);
    const center = size / 2;
    const radius = size * 0.35;

    // Renderiza cada símbolo proceduralmente
    switch (symbolId) {
      case 'WILD': {
        // Supernova Diamond com borda Magenta Neon
        ctx.save();
        ctx.translate(center, center);

        // Brilho exterior
        const glow = ctx.createRadialGradient(0, 0, 5, 0, 0, radius * 1.3);
        glow.addColorStop(0, 'rgba(255, 0, 128, 0.6)');
        glow.addColorStop(1, 'rgba(255, 0, 128, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(0, 0, radius * 1.3, 0, Math.PI * 2);
        ctx.fill();

        // Diamante
        ctx.beginPath();
        ctx.moveTo(0, -radius);
        ctx.lineTo(radius * 0.85, 0);
        ctx.lineTo(0, radius);
        ctx.lineTo(-radius * 0.85, 0);
        ctx.closePath();

        const grad = ctx.createLinearGradient(-radius, -radius, radius, radius);
        grad.addColorStop(0, '#ff77bb');
        grad.addColorStop(0.5, '#ff007f');
        grad.addColorStop(1, '#99004d');
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();

        // Facetas internas do diamante
        ctx.beginPath();
        ctx.moveTo(-radius * 0.85, 0);
        ctx.lineTo(radius * 0.85, 0);
        ctx.moveTo(0, -radius);
        ctx.lineTo(0, radius);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Badge de texto "WILD"
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 15px "Segoe UI", Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 4;
        ctx.fillText('WILD', 0, 1);
        ctx.restore();
        break;
      }

      case 'ROCKET': {
        // Foguete Espacial Cyber Cyan
        ctx.save();
        ctx.translate(center, center);

        // Rastro de propulsão
        const flame = ctx.createLinearGradient(0, radius * 0.3, 0, radius * 1.1);
        flame.addColorStop(0, '#fbbf24');
        flame.addColorStop(0.5, '#ef4444');
        flame.addColorStop(1, 'rgba(239, 68, 68, 0)');
        ctx.fillStyle = flame;
        ctx.beginPath();
        ctx.moveTo(-radius * 0.25, radius * 0.4);
        ctx.lineTo(0, radius * 1.05);
        ctx.lineTo(radius * 0.25, radius * 0.4);
        ctx.closePath();
        ctx.fill();

        // Corpo do Foguete
        ctx.beginPath();
        ctx.moveTo(0, -radius * 1.05);
        ctx.bezierCurveTo(radius * 0.6, -radius * 0.3, radius * 0.45, radius * 0.4, radius * 0.3, radius * 0.45);
        ctx.lineTo(-radius * 0.3, radius * 0.45);
        ctx.bezierCurveTo(-radius * 0.45, radius * 0.4, -radius * 0.6, -radius * 0.3, 0, -radius * 1.05);
        ctx.closePath();

        const rocketGrad = ctx.createLinearGradient(-radius * 0.5, 0, radius * 0.5, 0);
        rocketGrad.addColorStop(0, '#00f0ff');
        rocketGrad.addColorStop(0.5, '#ffffff');
        rocketGrad.addColorStop(1, '#0284c7');
        ctx.fillStyle = rocketGrad;
        ctx.fill();
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Asas laterais
        ctx.fillStyle = '#0369a1';
        ctx.beginPath();
        ctx.moveTo(-radius * 0.3, radius * 0.1);
        ctx.lineTo(-radius * 0.75, radius * 0.55);
        ctx.lineTo(-radius * 0.25, radius * 0.45);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(radius * 0.3, radius * 0.1);
        ctx.lineTo(radius * 0.75, radius * 0.55);
        ctx.lineTo(radius * 0.25, radius * 0.45);
        ctx.closePath();
        ctx.fill();

        // Janela / Escotilha circular
        ctx.beginPath();
        ctx.arc(0, -radius * 0.25, radius * 0.2, 0, Math.PI * 2);
        ctx.fillStyle = '#0f172a';
        ctx.fill();
        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.restore();
        break;
      }

      case 'PLANET': {
        // Planeta Roxo com Anel Cósmico
        ctx.save();
        ctx.translate(center, center);

        // Anel traseiro
        ctx.save();
        ctx.rotate(-Math.PI / 6);
        ctx.beginPath();
        ctx.ellipse(0, 0, radius * 1.25, radius * 0.35, 0, Math.PI, Math.PI * 2);
        ctx.strokeStyle = 'rgba(192, 132, 252, 0.4)';
        ctx.lineWidth = 5;
        ctx.stroke();
        ctx.restore();

        // Esfera planetária com relevo
        ctx.beginPath();
        ctx.arc(0, 0, radius * 0.7, 0, Math.PI * 2);
        const planetGrad = ctx.createRadialGradient(-radius * 0.25, -radius * 0.25, 2, 0, 0, radius * 0.7);
        planetGrad.addColorStop(0, '#e879f9');
        planetGrad.addColorStop(0.5, '#a855f7');
        planetGrad.addColorStop(1, '#4c1d95');
        ctx.fillStyle = planetGrad;
        ctx.fill();
        ctx.strokeStyle = '#d8b4fe';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Anel frontal
        ctx.save();
        ctx.rotate(-Math.PI / 6);
        ctx.beginPath();
        ctx.ellipse(0, 0, radius * 1.25, radius * 0.35, 0, 0, Math.PI);
        const ringGrad = ctx.createLinearGradient(-radius * 1.2, 0, radius * 1.2, 0);
        ringGrad.addColorStop(0, 'rgba(192, 132, 252, 0.1)');
        ringGrad.addColorStop(0.5, 'rgba(253, 224, 71, 0.95)');
        ringGrad.addColorStop(1, 'rgba(192, 132, 252, 0.1)');
        ctx.strokeStyle = ringGrad;
        ctx.lineWidth = 6;
        ctx.stroke();
        ctx.restore();

        ctx.restore();
        break;
      }

      case 'ALIEN': {
        // Invasor Alienígena Cyber Verde
        ctx.save();
        ctx.translate(center, center);

        // Cabeça alienígena triangular estilizada
        ctx.beginPath();
        ctx.moveTo(0, radius * 0.8);
        ctx.bezierCurveTo(-radius * 0.2, radius * 0.7, -radius * 0.9, radius * 0.1, -radius * 0.75, -radius * 0.4);
        ctx.bezierCurveTo(-radius * 0.6, -radius * 0.9, radius * 0.6, -radius * 0.9, radius * 0.75, -radius * 0.4);
        ctx.bezierCurveTo(radius * 0.9, radius * 0.1, radius * 0.2, radius * 0.7, 0, radius * 0.8);
        ctx.closePath();

        const alienGrad = ctx.createRadialGradient(-radius * 0.2, -radius * 0.3, 2, 0, 0, radius * 0.9);
        alienGrad.addColorStop(0, '#86efac');
        alienGrad.addColorStop(0.6, '#22c55e');
        alienGrad.addColorStop(1, '#14532d');
        ctx.fillStyle = alienGrad;
        ctx.fill();
        ctx.strokeStyle = '#4ade80';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Olhos ovais oblíquos
        const drawEye = (x: number, angle: number) => {
          ctx.save();
          ctx.translate(x, -radius * 0.1);
          ctx.rotate(angle);
          ctx.beginPath();
          ctx.ellipse(0, 0, radius * 0.25, radius * 0.4, 0, 0, Math.PI * 2);
          ctx.fillStyle = '#022c22';
          ctx.fill();
          ctx.strokeStyle = '#10b981';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Ponto de luz no olho
          ctx.beginPath();
          ctx.arc(-radius * 0.08, -radius * 0.12, radius * 0.08, 0, Math.PI * 2);
          ctx.fillStyle = '#6ee7b7';
          ctx.fill();
          ctx.restore();
        };

        drawEye(-radius * 0.35, -Math.PI / 8);
        drawEye(radius * 0.35, Math.PI / 8);

        ctx.restore();
        break;
      }

      case 'STAR_COIN': {
        // Moeda Dourada Galáctica 3D
        ctx.save();
        ctx.translate(center, center);

        // Base da Moeda
        ctx.beginPath();
        ctx.arc(0, 0, radius * 0.85, 0, Math.PI * 2);
        const coinGrad = ctx.createLinearGradient(-radius, -radius, radius, radius);
        coinGrad.addColorStop(0, '#fef08a');
        coinGrad.addColorStop(0.4, '#eab308');
        coinGrad.addColorStop(0.8, '#ca8a04');
        coinGrad.addColorStop(1, '#713f12');
        ctx.fillStyle = coinGrad;
        ctx.fill();
        ctx.strokeStyle = '#fde047';
        ctx.lineWidth = 3.5;
        ctx.stroke();

        // Borda interna
        ctx.beginPath();
        ctx.arc(0, 0, radius * 0.65, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(254, 240, 138, 0.6)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Estrela de 5 pontas no centro
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
          const outerAngle = (i * Math.PI * 2) / 5 - Math.PI / 2;
          const innerAngle = outerAngle + Math.PI / 5;
          const ox = Math.cos(outerAngle) * radius * 0.45;
          const oy = Math.sin(outerAngle) * radius * 0.45;
          const ix = Math.cos(innerAngle) * radius * 0.22;
          const iy = Math.sin(innerAngle) * radius * 0.22;
          if (i === 0) ctx.moveTo(ox, oy);
          else ctx.lineTo(ox, oy);
          ctx.lineTo(ix, iy);
        }
        ctx.closePath();
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.strokeStyle = '#ca8a04';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.restore();
        break;
      }

      case 'ENERGY_ORB': {
        // Orbe de Plasma Quântico Azul
        ctx.save();
        ctx.translate(center, center);

        const plasma = ctx.createRadialGradient(0, 0, 4, 0, 0, radius * 0.85);
        plasma.addColorStop(0, '#ffffff');
        plasma.addColorStop(0.3, '#93c5fd');
        plasma.addColorStop(0.7, '#3b82f6');
        plasma.addColorStop(1, '#1e3a8a');
        ctx.fillStyle = plasma;
        ctx.beginPath();
        ctx.arc(0, 0, radius * 0.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#60a5fa';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Raios elétricos internos
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-radius * 0.5, 0);
        ctx.lineTo(-radius * 0.1, -radius * 0.3);
        ctx.lineTo(radius * 0.1, radius * 0.2);
        ctx.lineTo(radius * 0.5, -radius * 0.1);
        ctx.stroke();

        ctx.restore();
        break;
      }

      case 'QUANTUM_A': {
        // Símbolo 'A' Cyberpunk estilizado
        ctx.save();
        ctx.translate(center, center);

        ctx.beginPath();
        ctx.arc(0, 0, radius * 0.8, 0, Math.PI * 2);
        ctx.fillStyle = '#18181b';
        ctx.fill();
        ctx.strokeStyle = '#f97316';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        ctx.fillStyle = '#fb923c';
        ctx.font = 'bold 36px "Segoe UI", Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = '#ea580c';
        ctx.shadowBlur = 10;
        ctx.fillText('A', 0, 2);

        ctx.restore();
        break;
      }
    }

    const texture = Texture.from(canvas);
    textureCache.set(key, texture);
    return texture;
  }
}
