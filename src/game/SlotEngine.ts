import { Application, Container, Graphics } from 'pixi.js';
import type { GameState, SpinResponse } from '../types/slot.types';
import { GAME_CONFIG, REEL_COUNT, ROW_COUNT } from './slotConfig';
import { Reel } from './Reel';
import { PaylineOverlay } from './PaylineOverlay';
import { ParticleSystem } from './ParticleSystem';
import { soundService } from '../services/soundService';

export interface SlotEngineEvents {
  onStateChange: (state: GameState) => void;
  onSpinComplete: (response: SpinResponse) => void;
  onFpsUpdate: (fps: number, frameTimeMs: number) => void;
}

/**
 * SlotEngine coordinates the Pixi.js scene graph, reel spin physics,
 * server payload alignment, and memory lifecycle.
 */
export class SlotEngine {
  private app: Application | null = null;
  private containerElement: HTMLElement;
  private events: SlotEngineEvents;

  // Scene graph layers
  private mainStage: Container;
  private backgroundLayer: Graphics;
  private machineFrame: Graphics;
  private reelsContainer: Container;
  private reels: Reel[] = [];
  private paylineOverlay: PaylineOverlay;
  private particleSystem: ParticleSystem;

  // Grid dimensions
  private reelWidth: number = GAME_CONFIG.REEL_WIDTH;
  private symbolSize: number = GAME_CONFIG.SYMBOL_SIZE;
  private reelGap: number = GAME_CONFIG.REEL_GAP;
  private reelsStartX: number = 0;
  private reelsStartY: number = 0;

  // State management
  private state: GameState = 'IDLE';
  private currentSpinResponse: SpinResponse | null = null;
  private isTurbo: boolean = false;
  private isDestroyed: boolean = false;

  // Profiling
  private lastFpsUpdate: number = 0;

  constructor(containerElement: HTMLElement, events: SlotEngineEvents) {
    this.containerElement = containerElement;
    this.events = events;

    this.mainStage = new Container();
    this.backgroundLayer = new Graphics();
    this.machineFrame = new Graphics();
    this.reelsContainer = new Container();
    this.paylineOverlay = new PaylineOverlay(this.reelWidth, this.symbolSize, this.reelGap, 0, 0);
    this.particleSystem = new ParticleSystem(GAME_CONFIG.CANVAS_WIDTH, GAME_CONFIG.CANVAS_HEIGHT);
  }

  public async init(): Promise<void> {
    const app = new Application();

    await app.init({
      resizeTo: this.containerElement,
      resolution: typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 2, 2) : 1,
      autoDensity: true,
      backgroundAlpha: 0,
      antialias: true,
    });

    if (this.isDestroyed) {
      app.destroy(true);
      return;
    }

    this.app = app;
    this.containerElement.appendChild(app.canvas);

    // Assemble render layers
    app.stage.addChild(this.mainStage);
    this.mainStage.addChild(this.particleSystem);
    this.mainStage.addChild(this.backgroundLayer);
    this.mainStage.addChild(this.machineFrame);
    this.mainStage.addChild(this.reelsContainer);
    this.mainStage.addChild(this.paylineOverlay);

    this.calculateLayout();
    this.buildReels();
    this.drawMachineChassis();

    // Attach fixed ticker update
    app.ticker.add(this.update, this);
  }

  private calculateLayout() {
    const totalReelsWidth = REEL_COUNT * this.reelWidth + (REEL_COUNT - 1) * this.reelGap;
    const totalReelsHeight = ROW_COUNT * this.symbolSize;

    this.reelsStartX = (GAME_CONFIG.CANVAS_WIDTH - totalReelsWidth) / 2;
    this.reelsStartY = (GAME_CONFIG.CANVAS_HEIGHT - totalReelsHeight) / 2 + 10;

    this.reelsContainer.position.set(this.reelsStartX, this.reelsStartY);

    this.paylineOverlay.position.set(0, 0);
    this.mainStage.removeChild(this.paylineOverlay);
    this.paylineOverlay = new PaylineOverlay(
      this.reelWidth,
      this.symbolSize,
      this.reelGap,
      this.reelsStartX,
      this.reelsStartY
    );
    this.mainStage.addChild(this.paylineOverlay);

    this.handleResize();
  }

  private buildReels() {
    this.reelsContainer.removeChildren();
    this.reels = [];

    for (let i = 0; i < REEL_COUNT; i++) {
      const reel = new Reel(i, this.reelWidth, this.symbolSize);
      reel.position.x = i * (this.reelWidth + this.reelGap);
      this.reels.push(reel);
      this.reelsContainer.addChild(reel);
    }
  }

  private drawMachineChassis() {
    const totalW = REEL_COUNT * this.reelWidth + (REEL_COUNT - 1) * this.reelGap;
    const totalH = ROW_COUNT * this.symbolSize;
    const padding = 16;

    this.backgroundLayer.clear();
    this.machineFrame.clear();

    // Reel backdrop
    this.backgroundLayer
      .roundRect(
        this.reelsStartX - padding,
        this.reelsStartY - padding,
        totalW + padding * 2,
        totalH + padding * 2,
        20
      )
      .fill({ color: 0x070b18, alpha: 0.9 })
      .stroke({ color: 0x1e293b, width: 2 });

    // Reel column dividers
    for (let i = 1; i < REEL_COUNT; i++) {
      const sepX = this.reelsStartX + i * (this.reelWidth + this.reelGap) - this.reelGap / 2;
      this.backgroundLayer
        .moveTo(sepX, this.reelsStartY - 6)
        .lineTo(sepX, this.reelsStartY + totalH + 6)
        .stroke({ color: 0x1e293b, width: 1.5, alpha: 0.7 });
    }

    // Outer neon border
    this.machineFrame
      .roundRect(
        this.reelsStartX - padding,
        this.reelsStartY - padding,
        totalW + padding * 2,
        totalH + padding * 2,
        20
      )
      .stroke({ color: 0x00f0ff, width: 2.5, alpha: 0.75 });

    // Cyberpunk corner brackets
    const bracketSize = 24;
    const drawBracket = (bx: number, by: number, dx: number, dy: number) => {
      this.machineFrame
        .moveTo(bx, by + dy * bracketSize)
        .lineTo(bx, by)
        .lineTo(bx + dx * bracketSize, by)
        .stroke({ color: 0xff007f, width: 4, alpha: 0.9, cap: 'round' });
    };

    const fx = this.reelsStartX - padding;
    const fy = this.reelsStartY - padding;
    const fw = totalW + padding * 2;
    const fh = totalH + padding * 2;

    drawBracket(fx, fy, 1, 1);
    drawBracket(fx + fw, fy, -1, 1);
    drawBracket(fx, fy + fh, 1, -1);
    drawBracket(fx + fw, fy + fh, -1, -1);
  }

  private update() {
    if (this.isDestroyed || !this.app) return;

    const delta = this.app.ticker.deltaTime;
    const now = performance.now();

    for (const reel of this.reels) {
      reel.update(delta);
    }

    this.particleSystem.update(delta);
    this.paylineOverlay.update(delta);

    // Sample framerate every 500ms
    if (now - this.lastFpsUpdate >= 500) {
      const currentFps = Math.round(this.app.ticker.FPS);
      const frameTime = Number((1000 / (currentFps || 60)).toFixed(1));
      this.events.onFpsUpdate(currentFps, frameTime);
      this.lastFpsUpdate = now;
    }
  }

  public startSpin(isTurbo: boolean = false) {
    if (this.state === 'SPINNING' || this.state === 'STOPPING') return;

    this.isTurbo = isTurbo;
    this.setState('SPINNING');
    this.paylineOverlay.clear();
    this.currentSpinResponse = null;

    for (const reel of this.reels) {
      reel.resetHighlights();
      reel.spin(isTurbo);
    }

    soundService.startSpinSound();
  }

  public stopWithServerResult(response: SpinResponse) {
    if (this.state !== 'SPINNING' && this.state !== 'REQUESTING') return;

    this.currentSpinResponse = response;
    this.setState('STOPPING');

    const baseDelay = this.isTurbo
      ? GAME_CONFIG.REEL_STOP_DELAY_TURBO
      : GAME_CONFIG.REEL_STOP_DELAY;

    let stoppedCount = 0;

    // Staggered stop: reel 0 through 4
    for (let i = 0; i < REEL_COUNT; i++) {
      const reelTargetSymbols = response.symbols[i];
      const stopDelay = (i + 1) * baseDelay;

      this.reels[i].stopWithResult(reelTargetSymbols, stopDelay, () => {
        stoppedCount++;

        if (stoppedCount === REEL_COUNT) {
          soundService.stopSpinSound();
          this.handleAllReelsStopped();
        }
      });
    }
  }

  private handleAllReelsStopped() {
    if (!this.currentSpinResponse) {
      this.setState('IDLE');
      return;
    }

    const resp = this.currentSpinResponse;

    if (resp.outcome === 'WIN' && resp.winLines.length > 0) {
      this.setState('CELEBRATING');

      // Highlight winning symbol tiles
      const reelWinningRows: Map<number, number[]> = new Map();
      for (const line of resp.winLines) {
        for (const pos of line.positions) {
          const rows = reelWinningRows.get(pos.reel) || [];
          if (!rows.includes(pos.row)) rows.push(pos.row);
          reelWinningRows.set(pos.reel, rows);
        }
      }

      reelWinningRows.forEach((rows, reelIdx) => {
        this.reels[reelIdx].highlightRows(rows);
      });

      // Render connected laser paths
      this.paylineOverlay.setWinLines(resp.winLines);

      // Particle explosion
      this.particleSystem.emitWinBurst(
        GAME_CONFIG.CANVAS_WIDTH / 2,
        GAME_CONFIG.CANVAS_HEIGHT / 2,
        resp.isBigWin ? 80 : 35
      );

      if (resp.isBigWin || resp.isMegaWin) {
        soundService.playBigWinFanfare();
      } else {
        soundService.playWinSound(resp.multiplier);
      }

      this.events.onSpinComplete(resp);

      const celebrationTime = this.isTurbo ? 500 : resp.isBigWin ? 1800 : 1000;
      setTimeout(() => {
        if (this.state === 'CELEBRATING') {
          this.setState('IDLE');
        }
      }, celebrationTime);
    } else {
      this.events.onSpinComplete(resp);
      this.setState('IDLE');
    }
  }

  private setState(newState: GameState) {
    this.state = newState;
    this.events.onStateChange(newState);
  }

  public getState(): GameState {
    return this.state;
  }

  public handleResize() {
    if (!this.app || !this.containerElement) return;

    const containerWidth = this.containerElement.clientWidth || GAME_CONFIG.CANVAS_WIDTH;
    const containerHeight = this.containerElement.clientHeight || GAME_CONFIG.CANVAS_HEIGHT;

    const scaleX = containerWidth / GAME_CONFIG.CANVAS_WIDTH;
    const scaleY = containerHeight / GAME_CONFIG.CANVAS_HEIGHT;
    const scale = Math.min(scaleX, scaleY, 1.15);

    this.mainStage.scale.set(scale);
    this.mainStage.position.x = (containerWidth - GAME_CONFIG.CANVAS_WIDTH * scale) / 2;
    this.mainStage.position.y = (containerHeight - GAME_CONFIG.CANVAS_HEIGHT * scale) / 2;

    this.particleSystem.resize(GAME_CONFIG.CANVAS_WIDTH, GAME_CONFIG.CANVAS_HEIGHT);
  }

  public destroy() {
    this.isDestroyed = true;

    if (this.app) {
      this.app.ticker.remove(this.update, this);

      for (const reel of this.reels) {
        reel.destroy({ children: true });
      }
      this.reels = [];

      this.paylineOverlay.destroy({ children: true });
      this.particleSystem.destroy({ children: true });
      this.mainStage.destroy({ children: true });

      this.app.destroy(true, { children: true });
      this.app = null;
    }
  }
}
