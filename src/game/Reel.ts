import { Container, Graphics } from 'pixi.js';
import type { SymbolId } from '../types/slot.types';
import { GAME_CONFIG, REEL_STRIPS, ROW_COUNT, SYMBOL_KEYS } from './slotConfig';
import { SymbolSprite } from './SymbolSprite';
import { soundService } from '../services/soundService';

type ReelState = 'IDLE' | 'SPINNING' | 'STOPPING' | 'BOUNCING';

/**
 * Manages a single vertical reel strip, handling loop wrapping,
 * acceleration, server target alignment, and elastic bounce physics.
 */
export class Reel extends Container {
  public reelIndex: number;
  private reelState: ReelState = 'IDLE';
  private symbols: SymbolSprite[] = [];
  private visibleRows: number = ROW_COUNT;
  private symbolSize: number;
  private currentSpeed: number = 0;
  private targetSpeed: number = GAME_CONFIG.SPIN_SPEED_NORMAL;
  private offset: number = 0;

  // Stopping mechanics
  private targetSymbols: SymbolId[] | null = null;
  private stopScheduled: boolean = false;
  private stopTimeoutId: any = null;
  private onStopCallback: (() => void) | null = null;

  // Spring bounce damping
  private bounceOffset: number = 0;
  private bounceVelocity: number = 0;

  private maskGraphics: Graphics;

  constructor(reelIndex: number, reelWidth: number, symbolSize: number) {
    super();
    this.reelIndex = reelIndex;
    this.symbolSize = symbolSize;

    // Buffer: 3 visible rows + 1 top + 1 bottom for smooth seamless wrap
    const totalSlots = this.visibleRows + 2;
    const strip = REEL_STRIPS[reelIndex % REEL_STRIPS.length];

    for (let i = 0; i < totalSlots; i++) {
      const symId = strip[i % strip.length] || SYMBOL_KEYS[i % SYMBOL_KEYS.length];
      const sprite = new SymbolSprite(symId, symbolSize);
      sprite.position.set(0, (i - 1) * symbolSize);
      this.symbols.push(sprite);
      this.addChild(sprite);
    }

    // Viewport clip mask
    this.maskGraphics = new Graphics();
    this.maskGraphics
      .roundRect(0, 0, reelWidth, this.visibleRows * symbolSize, 8)
      .fill({ color: 0xffffff });
    this.addChild(this.maskGraphics);
    this.mask = this.maskGraphics;
  }

  public getReelState(): ReelState {
    return this.reelState;
  }

  public getVisibleSymbols(): SymbolId[] {
    return [this.symbols[1].symbolId, this.symbols[2].symbolId, this.symbols[3].symbolId];
  }

  public spin(isTurbo: boolean = false) {
    if (this.stopTimeoutId) {
      clearTimeout(this.stopTimeoutId);
      this.stopTimeoutId = null;
    }

    this.resetHighlights();
    this.reelState = 'SPINNING';
    this.targetSpeed = isTurbo ? GAME_CONFIG.SPIN_SPEED_TURBO : GAME_CONFIG.SPIN_SPEED_NORMAL;
    this.targetSymbols = null;
    this.stopScheduled = false;
    this.bounceOffset = 0;
    this.bounceVelocity = 0;
  }

  public stopWithResult(
    targetSymbols: SymbolId[],
    delayMs: number,
    onComplete: () => void
  ) {
    this.targetSymbols = targetSymbols;
    this.onStopCallback = onComplete;

    this.stopTimeoutId = setTimeout(() => {
      this.stopScheduled = true;
    }, delayMs);
  }

  public update(delta: number) {
    for (const sym of this.symbols) {
      sym.update(delta);
    }

    if (this.reelState === 'IDLE') return;

    if (this.reelState === 'SPINNING') {
      if (this.currentSpeed < this.targetSpeed) {
        this.currentSpeed += GAME_CONFIG.SPIN_ACCELERATION * delta;
        if (this.currentSpeed > this.targetSpeed) this.currentSpeed = this.targetSpeed;
      }

      this.moveSymbols(this.currentSpeed * delta);

      if (this.stopScheduled && this.targetSymbols) {
        this.applyFinalSymbolsAndDecelerate();
      }
    } else if (this.reelState === 'BOUNCING') {
      // Spring physics (Hooke's law + damping)
      this.bounceVelocity += (0 - this.bounceOffset) * GAME_CONFIG.BOUNCE_SPEED * delta;
      this.bounceVelocity *= 0.72;
      this.bounceOffset += this.bounceVelocity;

      if (Math.abs(this.bounceOffset) < 0.3 && Math.abs(this.bounceVelocity) < 0.3) {
        this.bounceOffset = 0;
        this.reelState = 'IDLE';
        this.repositionAllSymbols();

        if (this.onStopCallback) {
          this.onStopCallback();
          this.onStopCallback = null;
        }
      } else {
        this.applyBouncePositions();
      }
    }
  }

  private moveSymbols(distance: number) {
    this.offset += distance;

    for (let i = 0; i < this.symbols.length; i++) {
      const sprite = this.symbols[i];
      let y = (i - 1) * this.symbolSize + this.offset;

      const totalHeight = this.symbols.length * this.symbolSize;
      while (y >= (this.visibleRows + 1) * this.symbolSize) {
        y -= totalHeight;
        sprite.setSymbol(SYMBOL_KEYS[Math.floor(Math.random() * SYMBOL_KEYS.length)]);
      }

      sprite.position.y = y;
    }

    if (this.offset >= this.symbolSize) {
      this.offset = this.offset % this.symbolSize;
    }
  }

  private applyFinalSymbolsAndDecelerate() {
    if (!this.targetSymbols) return;

    this.reelState = 'BOUNCING';
    this.currentSpeed = 0;
    this.offset = 0;

    // Slot rows mapping: [1=Top, 2=Middle, 3=Bottom]
    this.symbols[1].setSymbol(this.targetSymbols[0]);
    this.symbols[2].setSymbol(this.targetSymbols[1]);
    this.symbols[3].setSymbol(this.targetSymbols[2]);

    // Random top/bottom context tiles
    this.symbols[0].setSymbol(SYMBOL_KEYS[Math.floor(Math.random() * SYMBOL_KEYS.length)]);
    this.symbols[4].setSymbol(SYMBOL_KEYS[Math.floor(Math.random() * SYMBOL_KEYS.length)]);

    this.bounceOffset = GAME_CONFIG.BOUNCE_DISTANCE;
    this.bounceVelocity = 0;

    soundService.playReelStop(this.reelIndex);
  }

  private applyBouncePositions() {
    for (let i = 0; i < this.symbols.length; i++) {
      this.symbols[i].position.y = (i - 1) * this.symbolSize + this.bounceOffset;
    }
  }

  private repositionAllSymbols() {
    for (let i = 0; i < this.symbols.length; i++) {
      this.symbols[i].position.y = (i - 1) * this.symbolSize;
    }
  }

  public highlightRows(rows: number[]) {
    for (const row of rows) {
      const spriteIndex = row + 1;
      if (this.symbols[spriteIndex]) {
        this.symbols[spriteIndex].setWinning(true);
      }
    }
  }

  public resetHighlights() {
    for (const sym of this.symbols) {
      sym.setWinning(false);
    }
  }

  public destroy(options?: any) {
    if (this.stopTimeoutId) {
      clearTimeout(this.stopTimeoutId);
      this.stopTimeoutId = null;
    }
    super.destroy(options);
  }
}
