export type SymbolId =
  | 'WILD'
  | 'ROCKET'
  | 'PLANET'
  | 'ALIEN'
  | 'STAR_COIN'
  | 'ENERGY_ORB'
  | 'QUANTUM_A';

export interface SymbolDef {
  id: SymbolId;
  name: string;
  category: 'special' | 'high' | 'medium' | 'low';
  color: string;
  glowColor: string;
  payouts: {
    3: number;
    4: number;
    5: number;
  };
}

export type OutcomeType = 'WIN' | 'LOSS';

export type ForceOutcomeType =
  | 'AUTO'
  | 'JACKPOT_WILD'
  | 'BIG_WIN_ROCKETS'
  | 'MULTI_LINE_WIN'
  | 'NEAR_MISS'
  | 'LOSS';

export interface GridPosition {
  reel: number;
  row: number;
}

export interface WinLine {
  lineIndex: number;
  symbolId: SymbolId;
  count: number;
  payout: number;
  multiplier: number;
  positions: GridPosition[];
}

export interface SpinResponse {
  roundId: string;
  outcome: OutcomeType;
  /** 5x3 visible symbol matrix: [reelIndex][rowIndex] */
  symbols: SymbolId[][];
  winLines: WinLine[];
  totalWin: number;
  multiplier: number;
  balance: number;
  serverTimestamp: number;
  latencyMs: number;
  isBigWin: boolean;
  isMegaWin: boolean;
}

export interface SpinRequest {
  roundId: string;
  betAmount: number;
  paylinesCount: number;
  turbo: boolean;
  forcedOutcome?: ForceOutcomeType;
}

export interface NetworkLogEntry {
  id: string;
  timestamp: string;
  type: 'CONNECT' | 'DISCONNECT' | 'SPIN_REQUEST' | 'SPIN_RESPONSE' | 'ROUND_SETTLE' | 'ERROR';
  direction: 'CLIENT_TO_SERVER' | 'SERVER_TO_CLIENT' | 'SYSTEM';
  data: any;
  summary: string;
}

export type GameState =
  | 'IDLE'
  | 'REQUESTING'
  | 'SPINNING'
  | 'STOPPING'
  | 'CELEBRATING'
  | 'ERROR';

export interface PaylineDefinition {
  id: number;
  name: string;
  color: string;
  /** Row index per reel: [0=top, 1=middle, 2=bottom] */
  coords: [number, number, number, number, number];
}
