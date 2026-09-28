import type { SymbolDef, SymbolId, PaylineDefinition } from '../types/slot.types';

export const REEL_COUNT = 5;
export const ROW_COUNT = 3;

/**
 * Balanced Medium-Volatility Paytable (RTP target ~96.5%)
 * Multipliers represent payout per payline wager.
 */
export const SYMBOL_DEFINITIONS: Record<SymbolId, SymbolDef> = {
  WILD: {
    id: 'WILD',
    name: 'Cosmic Wild',
    category: 'special',
    color: '#ff007f',
    glowColor: '#ff2a8d',
    payouts: { 3: 40, 4: 120, 5: 500 },
  },
  ROCKET: {
    id: 'ROCKET',
    name: 'Star Rocket',
    category: 'high',
    color: '#00f0ff',
    glowColor: '#38bdf8',
    payouts: { 3: 15, 4: 45, 5: 150 },
  },
  PLANET: {
    id: 'PLANET',
    name: 'Saturn Planet',
    category: 'high',
    color: '#a855f7',
    glowColor: '#c084fc',
    payouts: { 3: 10, 4: 30, 5: 90 },
  },
  ALIEN: {
    id: 'ALIEN',
    name: 'Cyber Alien',
    category: 'medium',
    color: '#22c55e',
    glowColor: '#4ade80',
    payouts: { 3: 6, 4: 18, 5: 50 },
  },
  STAR_COIN: {
    id: 'STAR_COIN',
    name: 'Galactic Coin',
    category: 'medium',
    color: '#fbbf24',
    glowColor: '#fde047',
    payouts: { 3: 4, 4: 12, 5: 35 },
  },
  ENERGY_ORB: {
    id: 'ENERGY_ORB',
    name: 'Plasma Orb',
    category: 'low',
    color: '#3b82f6',
    glowColor: '#60a5fa',
    payouts: { 3: 3, 4: 8, 5: 25 },
  },
  QUANTUM_A: {
    id: 'QUANTUM_A',
    name: 'Quantum Core',
    category: 'low',
    color: '#f97316',
    glowColor: '#fb923c',
    payouts: { 3: 2, 4: 5, 5: 15 },
  },
};

export const SYMBOL_KEYS: SymbolId[] = [
  'WILD',
  'ROCKET',
  'PLANET',
  'ALIEN',
  'STAR_COIN',
  'ENERGY_ORB',
  'QUANTUM_A',
];

/** Standard 10 payline matrix */
export const PAYLINES: PaylineDefinition[] = [
  { id: 1, name: 'Center Horizontal', color: '#ff007f', coords: [1, 1, 1, 1, 1] },
  { id: 2, name: 'Top Horizontal', color: '#00f0ff', coords: [0, 0, 0, 0, 0] },
  { id: 3, name: 'Bottom Horizontal', color: '#fbbf24', coords: [2, 2, 2, 2, 2] },
  { id: 4, name: 'V-Shape', color: '#a855f7', coords: [0, 1, 2, 1, 0] },
  { id: 5, name: 'Inverted V', color: '#22c55e', coords: [2, 1, 0, 1, 2] },
  { id: 6, name: 'Top ZigZag', color: '#38bdf8', coords: [0, 0, 1, 2, 2] },
  { id: 7, name: 'Bottom ZigZag', color: '#f43f5e', coords: [2, 2, 1, 0, 0] },
  { id: 8, name: 'Center Down-Up', color: '#eab308', coords: [1, 2, 2, 2, 1] },
  { id: 9, name: 'Center Up-Down', color: '#10b981', coords: [1, 0, 0, 0, 1] },
  { id: 10, name: 'W-Wave', color: '#8b5cf6', coords: [1, 0, 1, 2, 1] },
];

/** Pre-configured reel strips used during active spin loop */
export const REEL_STRIPS: SymbolId[][] = [
  ['QUANTUM_A', 'ENERGY_ORB', 'STAR_COIN', 'ALIEN', 'PLANET', 'ROCKET', 'WILD', 'QUANTUM_A', 'ENERGY_ORB', 'ALIEN', 'STAR_COIN', 'PLANET'],
  ['ENERGY_ORB', 'QUANTUM_A', 'ALIEN', 'STAR_COIN', 'ROCKET', 'WILD', 'PLANET', 'ENERGY_ORB', 'QUANTUM_A', 'STAR_COIN', 'ROCKET', 'ALIEN'],
  ['STAR_COIN', 'ALIEN', 'QUANTUM_A', 'ENERGY_ORB', 'PLANET', 'ROCKET', 'WILD', 'STAR_COIN', 'ALIEN', 'QUANTUM_A', 'ROCKET', 'PLANET'],
  ['ALIEN', 'STAR_COIN', 'ENERGY_ORB', 'QUANTUM_A', 'ROCKET', 'PLANET', 'WILD', 'ALIEN', 'ENERGY_ORB', 'STAR_COIN', 'PLANET', 'ROCKET'],
  ['ROCKET', 'PLANET', 'ALIEN', 'STAR_COIN', 'QUANTUM_A', 'ENERGY_ORB', 'WILD', 'ROCKET', 'PLANET', 'STAR_COIN', 'ALIEN', 'QUANTUM_A'],
];

export const GAME_CONFIG = {
  CANVAS_WIDTH: 960,
  CANVAS_HEIGHT: 540,
  REEL_WIDTH: 150,
  SYMBOL_SIZE: 130,
  REEL_GAP: 14,
  TOTAL_PAYLINES: 10,
  INITIAL_BALANCE: 1000.0,
  DEFAULT_BET: 10.0,
  BET_STEPS: [1, 2, 5, 10, 20, 50, 100, 250, 500],
  // Physics tuning
  SPIN_SPEED_NORMAL: 32,
  SPIN_SPEED_TURBO: 58,
  SPIN_ACCELERATION: 1.8,
  REEL_STOP_DELAY: 220,
  REEL_STOP_DELAY_TURBO: 80,
  BOUNCE_DISTANCE: 28,
  BOUNCE_SPEED: 0.18,
};
