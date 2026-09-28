import type {
  ForceOutcomeType,
  NetworkLogEntry,
  PaylineDefinition,
  SpinRequest,
  SpinResponse,
  SymbolId,
  WinLine,
} from '../types/slot.types';
import {
  GAME_CONFIG,
  PAYLINES,
  REEL_COUNT,
  ROW_COUNT,
  SYMBOL_DEFINITIONS,
} from '../game/slotConfig';

type NetworkLogListener = (log: NetworkLogEntry) => void;
type BalanceListener = (balance: number) => void;

/**
 * Mock authoritative game server simulating WebSocket messaging and balanced RTP math.
 * Standard medium-volatility iGaming math model:
 * - Target RTP: ~96.5%
 * - Hit Frequency: ~26.5% (approx 1 win every 3.5 to 4 spins)
 */
export class MockSlotServer {
  private balance: number = GAME_CONFIG.INITIAL_BALANCE;
  private latencyMs: number = 250;
  private logListeners: Set<NetworkLogListener> = new Set();
  private balanceListeners: Set<BalanceListener> = new Set();
  private roundCounter: number = 1000;
  private stats = {
    totalSpins: 0,
    totalWagered: 0,
    totalWon: 0,
  };

  constructor() {
    this.emitLog({
      id: `sys-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      type: 'CONNECT',
      direction: 'SYSTEM',
      summary: 'WebSocket connected (wss://game-server.slots.internal:443/v1/ws)',
      data: {
        server: 'wss://game-server.slots.internal:443/v1/ws',
        protocol: 'slot-protocol-v2.1',
        sessionToken: 'sess_live_' + Math.random().toString(36).substring(2, 10),
        latencyTarget: `${this.latencyMs}ms`,
        rtpTarget: '96.5%',
        volatility: 'Medium',
      },
    });
  }

  public getBalance(): number {
    return this.balance;
  }

  public setBalance(newBalance: number) {
    this.balance = newBalance;
    this.notifyBalance();
  }

  public getLatency(): number {
    return this.latencyMs;
  }

  public setLatency(latency: number) {
    this.latencyMs = latency;
  }

  public getStats() {
    return { ...this.stats };
  }

  public addLogListener(listener: NetworkLogListener): () => void {
    this.logListeners.add(listener);
    return () => this.logListeners.delete(listener);
  }

  public addBalanceListener(listener: BalanceListener): () => void {
    this.balanceListeners.add(listener);
    return () => this.balanceListeners.delete(listener);
  }

  private notifyBalance() {
    this.balanceListeners.forEach((fn) => fn(this.balance));
  }

  private emitLog(entry: NetworkLogEntry) {
    this.logListeners.forEach((fn) => fn(entry));
  }

  public async sendSpin(request: SpinRequest): Promise<SpinResponse> {
    const roundId = `RND-${++this.roundCounter}`;

    // Client outbound frame
    this.emitLog({
      id: `req-${Date.now()}-${roundId}`,
      timestamp: new Date().toLocaleTimeString(),
      type: 'SPIN_REQUEST',
      direction: 'CLIENT_TO_SERVER',
      summary: `[WS OUT] SPIN_REQUEST Round ${roundId} | Wager: $${request.betAmount.toFixed(2)} | Lines: ${request.paylinesCount}`,
      data: {
        action: 'SPIN',
        roundId,
        betAmount: request.betAmount,
        lines: request.paylinesCount,
        turbo: request.turbo,
        forcedOutcome: request.forcedOutcome || 'AUTO',
        timestamp: Date.now(),
      },
    });

    // Deduct wager
    this.balance -= request.betAmount;
    this.stats.totalSpins += 1;
    this.stats.totalWagered += request.betAmount;
    this.notifyBalance();

    // Latency jitter
    const actualLatency = Math.max(
      30,
      Math.round(this.latencyMs * (0.85 + Math.random() * 0.3))
    );
    await new Promise((resolve) => setTimeout(resolve, actualLatency));

    // Generate balanced grid outcome
    const symbols = this.generateSymbolsMatrix(request.forcedOutcome);

    // Evaluate paylines
    const { winLines, totalWin, multiplier } = this.evaluatePaylines(
      symbols,
      request.betAmount,
      request.paylinesCount
    );

    // Credit wins if applicable
    if (totalWin > 0) {
      this.balance += totalWin;
      this.stats.totalWon += totalWin;
      this.notifyBalance();
    }

    const outcome = totalWin > 0 ? 'WIN' : 'LOSS';
    const isBigWin = totalWin >= request.betAmount * 15;
    const isMegaWin = totalWin >= request.betAmount * 40;

    const response: SpinResponse = {
      roundId,
      outcome,
      symbols,
      winLines,
      totalWin,
      multiplier,
      balance: this.balance,
      serverTimestamp: Date.now(),
      latencyMs: actualLatency,
      isBigWin,
      isMegaWin,
    };

    // Server inbound frame
    this.emitLog({
      id: `res-${Date.now()}-${roundId}`,
      timestamp: new Date().toLocaleTimeString(),
      type: 'SPIN_RESPONSE',
      direction: 'SERVER_TO_CLIENT',
      summary: `[WS IN] SPIN_RESPONSE ${outcome} | Win: $${totalWin.toFixed(2)} (${multiplier}x) | Ping: ${actualLatency}ms`,
      data: {
        roundId,
        outcome,
        totalWin,
        multiplier,
        winLinesCount: winLines.length,
        balance: this.balance,
        latencyMs: actualLatency,
        grid: symbols,
      },
    });

    return response;
  }

  private generateSymbolsMatrix(forcedOutcome?: ForceOutcomeType): SymbolId[][] {
    if (forcedOutcome === 'JACKPOT_WILD') {
      return [
        ['ROCKET', 'WILD', 'PLANET'],
        ['ALIEN', 'WILD', 'ENERGY_ORB'],
        ['STAR_COIN', 'WILD', 'QUANTUM_A'],
        ['PLANET', 'WILD', 'ROCKET'],
        ['ENERGY_ORB', 'WILD', 'ALIEN'],
      ];
    }

    if (forcedOutcome === 'BIG_WIN_ROCKETS') {
      return [
        ['ROCKET', 'ROCKET', 'ALIEN'],
        ['ROCKET', 'ROCKET', 'PLANET'],
        ['ROCKET', 'ROCKET', 'STAR_COIN'],
        ['ROCKET', 'ROCKET', 'QUANTUM_A'],
        ['ROCKET', 'ROCKET', 'ENERGY_ORB'],
      ];
    }

    if (forcedOutcome === 'MULTI_LINE_WIN') {
      return [
        ['PLANET', 'ALIEN', 'STAR_COIN'],
        ['PLANET', 'ALIEN', 'STAR_COIN'],
        ['PLANET', 'ALIEN', 'STAR_COIN'],
        ['PLANET', 'QUANTUM_A', 'STAR_COIN'],
        ['ENERGY_ORB', 'ROCKET', 'PLANET'],
      ];
    }

    if (forcedOutcome === 'NEAR_MISS') {
      return [
        ['WILD', 'PLANET', 'QUANTUM_A'],
        ['WILD', 'ALIEN', 'STAR_COIN'],
        ['QUANTUM_A', 'ENERGY_ORB', 'ROCKET'],
        ['STAR_COIN', 'ROCKET', 'PLANET'],
        ['ALIEN', 'QUANTUM_A', 'ENERGY_ORB'],
      ];
    }

    if (forcedOutcome === 'LOSS') {
      return [
        ['QUANTUM_A', 'ALIEN', 'ENERGY_ORB'],
        ['STAR_COIN', 'PLANET', 'ROCKET'],
        ['ENERGY_ORB', 'QUANTUM_A', 'ALIEN'],
        ['PLANET', 'ROCKET', 'STAR_COIN'],
        ['ALIEN', 'ENERGY_ORB', 'QUANTUM_A'],
      ];
    }

    // Weighted distribution calibrated for balanced gameplay
    const weights: Record<SymbolId, number> = {
      WILD: 5,        // Wild (5% probability)
      ROCKET: 10,     // High tier
      PLANET: 14,     // High tier
      ALIEN: 16,      // Mid tier
      STAR_COIN: 18,  // Mid tier
      ENERGY_ORB: 20, // Low tier
      QUANTUM_A: 22,  // Low tier
    };

    const getRandomSymbol = (): SymbolId => {
      const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
      let rand = Math.random() * totalWeight;
      for (const [sym, weight] of Object.entries(weights)) {
        if (rand < weight) return sym as SymbolId;
        rand -= weight;
      }
      return 'QUANTUM_A';
    };

    // Base grid generation
    const matrix: SymbolId[][] = [];
    for (let reel = 0; reel < REEL_COUNT; reel++) {
      const col: SymbolId[] = [];
      for (let row = 0; row < ROW_COUNT; row++) {
        col.push(getRandomSymbol());
      }
      matrix.push(col);
    }

    // Balanced hit frequency (~26.5% natural hit rate for medium volatility slots)
    const shouldHit = Math.random() < 0.265;
    if (shouldHit) {
      const chosenLine = PAYLINES[Math.floor(Math.random() * PAYLINES.length)];
      // Favor lower/mid tier symbols for regular hits, high tier for occasional bigger hits
      const randSymIndex = Math.random();
      const chosenSymbol: SymbolId =
        randSymIndex < 0.35
          ? 'QUANTUM_A'
          : randSymIndex < 0.60
          ? 'ENERGY_ORB'
          : randSymIndex < 0.78
          ? 'STAR_COIN'
          : randSymIndex < 0.90
          ? 'ALIEN'
          : randSymIndex < 0.96
          ? 'PLANET'
          : 'ROCKET';

      // 72% 3-of-a-kind, 22% 4-of-a-kind, 6% 5-of-a-kind
      const matchRoll = Math.random();
      const matchLength = matchRoll < 0.72 ? 3 : matchRoll < 0.94 ? 4 : 5;

      for (let reel = 0; reel < matchLength; reel++) {
        const row = chosenLine.coords[reel];
        // 10% chance of WILD substitution in the chain
        matrix[reel][row] = Math.random() < 0.1 ? 'WILD' : chosenSymbol;
      }
    }

    return matrix;
  }

  private evaluatePaylines(
    grid: SymbolId[][],
    betAmount: number,
    paylinesCount: number
  ): { winLines: WinLine[]; totalWin: number; multiplier: number } {
    const betPerLine = betAmount / paylinesCount;
    const winLines: WinLine[] = [];
    let totalWin = 0;

    const activePaylines = PAYLINES.slice(0, paylinesCount);

    for (let i = 0; i < activePaylines.length; i++) {
      const lineDef = activePaylines[i];
      const match = this.evaluateSingleLine(grid, lineDef);

      if (match && match.count >= 3) {
        const symDef = SYMBOL_DEFINITIONS[match.symbolId];
        const lineMultiplier =
          symDef.payouts[match.count as 3 | 4 | 5] || 0;

        if (lineMultiplier > 0) {
          const linePayout = betPerLine * lineMultiplier;
          totalWin += linePayout;

          winLines.push({
            lineIndex: lineDef.id - 1,
            symbolId: match.symbolId,
            count: match.count,
            payout: linePayout,
            multiplier: lineMultiplier,
            positions: match.positions,
          });
        }
      }
    }

    const totalMultiplier = betAmount > 0 ? Number((totalWin / betAmount).toFixed(2)) : 0;

    return {
      winLines,
      totalWin: Number(totalWin.toFixed(2)),
      multiplier: totalMultiplier,
    };
  }

  private evaluateSingleLine(
    grid: SymbolId[][],
    lineDef: PaylineDefinition
  ): { symbolId: SymbolId; count: number; positions: Array<{ reel: number; row: number }> } | null {
    const coords = lineDef.coords;
    const firstSymbol = grid[0][coords[0]];

    let targetSymbol: SymbolId = firstSymbol;
    let matchCount = 1;
    const positions: Array<{ reel: number; row: number }> = [{ reel: 0, row: coords[0] }];

    for (let reel = 1; reel < REEL_COUNT; reel++) {
      const currentSymbol = grid[reel][coords[reel]];

      if (targetSymbol === 'WILD' && currentSymbol !== 'WILD') {
        targetSymbol = currentSymbol;
      }

      const isMatch =
        currentSymbol === targetSymbol ||
        currentSymbol === 'WILD' ||
        targetSymbol === 'WILD';

      if (isMatch) {
        matchCount++;
        positions.push({ reel, row: coords[reel] });
      } else {
        break;
      }
    }

    if (matchCount >= 3) {
      return {
        symbolId: targetSymbol,
        count: matchCount,
        positions,
      };
    }

    return null;
  }
}

export const mockServer = new MockSlotServer();
