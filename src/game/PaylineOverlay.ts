import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import type { WinLine } from '../types/slot.types';
import { PAYLINES } from './slotConfig';

/**
 * PaylineOverlay gerencia a renderização de linhas de pagamento vencedoras,
 * raios laser neon conectando os símbolos premiados e textos flutuantes de ganhos.
 */
export class PaylineOverlay extends Container {
  private lineGraphics: Graphics;
  private glowGraphics: Graphics;
  private textContainer: Container;
  private winLines: WinLine[] = [];
  private animTime: number = 0;
  private reelWidth: number;
  private symbolSize: number;
  private reelGap: number;
  private startX: number;
  private startY: number;

  constructor(reelWidth: number, symbolSize: number, reelGap: number, startX: number, startY: number) {
    super();
    this.reelWidth = reelWidth;
    this.symbolSize = symbolSize;
    this.reelGap = reelGap;
    this.startX = startX;
    this.startY = startY;

    this.glowGraphics = new Graphics();
    this.lineGraphics = new Graphics();
    this.textContainer = new Container();

    this.addChild(this.glowGraphics);
    this.addChild(this.lineGraphics);
    this.addChild(this.textContainer);
  }

  public setWinLines(winLines: WinLine[]) {
    this.winLines = winLines;
    this.animTime = 0;
    this.textContainer.removeChildren();
    this.renderLines();
    this.createFloatingTexts();
  }

  public clear() {
    this.winLines = [];
    this.lineGraphics.clear();
    this.glowGraphics.clear();
    this.textContainer.removeChildren();
  }

  public update(delta: number) {
    if (this.winLines.length === 0) return;

    this.animTime += delta * 0.05;
    this.renderLines();

    // Animação de elevação e fade dos textos de ganhos flutuantes
    for (let i = 0; i < this.textContainer.children.length; i++) {
      const txt = this.textContainer.children[i] as Text;
      if (txt) {
        txt.alpha = Math.min(1, 0.4 + Math.sin(this.animTime * 2 + i) * 0.4);
      }
    }
  }

  /**
   * Converte a coordenada de grid (reel, row) em posição de pixel absoluto na tela
   */
  private getSymbolCenter(reel: number, row: number): { x: number; y: number } {
    const x = this.startX + reel * (this.reelWidth + this.reelGap) + this.reelWidth / 2;
    const y = this.startY + row * this.symbolSize + this.symbolSize / 2;
    return { x, y };
  }

  private renderLines() {
    this.lineGraphics.clear();
    this.glowGraphics.clear();

    if (this.winLines.length === 0) return;

    for (let i = 0; i < this.winLines.length; i++) {
      const winLine = this.winLines[i];
      const paylineDef = PAYLINES.find((p) => p.id === winLine.lineIndex + 1);
      const color = paylineDef ? paylineDef.color : '#ff007f';

      if (winLine.positions.length < 2) continue;

      const pts = winLine.positions.map((pos) => this.getSymbolCenter(pos.reel, pos.row));

      // 1. Linha exterior com brilho difuso (Glow)
      this.glowGraphics.beginPath();
      this.glowGraphics.moveTo(pts[0].x, pts[0].y);
      for (let j = 1; j < pts.length; j++) {
        this.glowGraphics.lineTo(pts[j].x, pts[j].y);
      }
      this.glowGraphics.stroke({
        color: color,
        width: 10 + Math.sin(this.animTime * 3 + i) * 2,
        alpha: 0.35,
        cap: 'round',
        join: 'round',
      });

      // 2. Linha central brilhante laser neon
      this.lineGraphics.beginPath();
      this.lineGraphics.moveTo(pts[0].x, pts[0].y);
      for (let j = 1; j < pts.length; j++) {
        this.lineGraphics.lineTo(pts[j].x, pts[j].y);
      }
      this.lineGraphics.stroke({
        color: '#ffffff',
        width: 3.5,
        alpha: 0.95,
        cap: 'round',
        join: 'round',
      });

      // 3. Nós circulares nos centros dos símbolos conectados
      for (const pt of pts) {
        this.lineGraphics
          .circle(pt.x, pt.y, 6)
          .fill({ color: '#ffffff' })
          .stroke({ color: color, width: 2.5 });
      }
    }
  }

  private createFloatingTexts() {
    const style = new TextStyle({
      fontFamily: '"Segoe UI", "Inter", Roboto, sans-serif',
      fontSize: 20,
      fontWeight: 'bold',
      fill: '#fbbf24',
      stroke: { color: '#000000', width: 4 },
      dropShadow: {
        color: '#000000',
        blur: 6,
        distance: 2,
      },
    });

    for (const winLine of this.winLines) {
      if (winLine.positions.length > 0) {
        // Posiciona texto acima do último símbolo conectado
        const lastPos = winLine.positions[winLine.positions.length - 1];
        const center = this.getSymbolCenter(lastPos.reel, lastPos.row);

        const winText = new Text({
          text: `+$${winLine.payout.toFixed(2)}`,
          style,
        });
        winText.anchor.set(0.5);
        winText.position.set(center.x, center.y - 35);
        this.textContainer.addChild(winText);
      }
    }
  }
}
