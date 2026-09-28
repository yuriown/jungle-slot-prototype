import { useState, useEffect, useRef, useCallback } from 'react';
import type { ForceOutcomeType, GameState, NetworkLogEntry, SpinResponse } from '../types/slot.types';
import { mockServer } from '../services/mockSlotServer';
import { GAME_CONFIG } from '../game/slotConfig';
import type { SlotGameCanvasHandle } from '../components/SlotGameCanvas';

interface BigWinState {
  show: boolean;
  amount: number;
  multiplier: number;
  isMegaWin: boolean;
}

export function useSlotGame(canvasRef: React.RefObject<SlotGameCanvasHandle | null>) {
  // Core game state
  const [balance, setBalance] = useState<number>(mockServer.getBalance());
  const [lastWin, setLastWin] = useState<number>(0);
  const [betAmount, setBetAmount] = useState<number>(GAME_CONFIG.DEFAULT_BET);
  const [gameState, setGameState] = useState<GameState>('IDLE');
  const [isTurbo, setIsTurbo] = useState<boolean>(false);
  const [autoSpinsRemaining, setAutoSpinsRemaining] = useState<number>(0);
  const [forcedOutcome, setForcedOutcome] = useState<ForceOutcomeType>('AUTO');

  // Diagnostics & metrics
  const [fps, setFps] = useState<number>(60);
  const [frameTime, setFrameTime] = useState<number>(16.6);
  const [latency, setLatency] = useState<number>(mockServer.getLatency());
  const [logs, setLogs] = useState<NetworkLogEntry[]>([]);

  // Overlays
  const [bigWinData, setBigWinData] = useState<BigWinState>({
    show: false,
    amount: 0,
    multiplier: 0,
    isMegaWin: false,
  });

  // Mutable refs to prevent stale closure captures in async auto-spin loops
  const autoSpinsRef = useRef<number>(0);
  const isTurboRef = useRef<boolean>(isTurbo);
  const betAmountRef = useRef<number>(betAmount);
  const balanceRef = useRef<number>(balance);
  const forcedOutcomeRef = useRef<ForceOutcomeType>(forcedOutcome);
  const isSpinningRef = useRef<boolean>(false);
  const autoSpinTimerRef = useRef<any>(null);

  // Sync state changes to refs for immediate callback visibility
  useEffect(() => {
    isTurboRef.current = isTurbo;
  }, [isTurbo]);

  useEffect(() => {
    betAmountRef.current = betAmount;
  }, [betAmount]);

  useEffect(() => {
    balanceRef.current = balance;
  }, [balance]);

  useEffect(() => {
    forcedOutcomeRef.current = forcedOutcome;
  }, [forcedOutcome]);

  // Subscribe to mock socket events on mount
  useEffect(() => {
    const unsubLogs = mockServer.addLogListener((entry) => {
      setLogs((prev) => [entry, ...prev].slice(0, 100));
      setLatency(mockServer.getLatency());
    });

    const unsubBalance = mockServer.addBalanceListener((newBalance) => {
      setBalance(newBalance);
      balanceRef.current = newBalance;
    });

    return () => {
      unsubLogs();
      unsubBalance();
      if (autoSpinTimerRef.current) clearTimeout(autoSpinTimerRef.current);
    };
  }, []);

  const spin = useCallback(async () => {
    if (isSpinningRef.current) return;

    const currentBet = betAmountRef.current;
    const currentBalance = balanceRef.current;

    // Safety check: ensure balance covers wager
    if (currentBalance < currentBet) {
      autoSpinsRef.current = 0;
      setAutoSpinsRemaining(0);
      return;
    }

    isSpinningRef.current = true;
    setGameState('REQUESTING');
    setLastWin(0);

    const turbo = isTurboRef.current;
    canvasRef.current?.startSpin(turbo);

    try {
      const outcomeOverride = forcedOutcomeRef.current;
      const response = await mockServer.sendSpin({
        roundId: '',
        betAmount: currentBet,
        paylinesCount: GAME_CONFIG.TOTAL_PAYLINES,
        turbo,
        forcedOutcome: outcomeOverride !== 'AUTO' ? outcomeOverride : undefined,
      });

      // Reset test override back to standard RNG after dispatch
      if (outcomeOverride !== 'AUTO') {
        setForcedOutcome('AUTO');
        forcedOutcomeRef.current = 'AUTO';
      }

      // Feed authoritative server symbols into Pixi reel engine
      canvasRef.current?.stopWithServerResult(response);
    } catch (err) {
      console.error('[SlotGame] Spin request error:', err);
      isSpinningRef.current = false;
      setGameState('IDLE');
    }
  }, [canvasRef]);

  const startAutoSpins = useCallback(
    (count: number) => {
      if (autoSpinTimerRef.current) {
        clearTimeout(autoSpinTimerRef.current);
        autoSpinTimerRef.current = null;
      }
      autoSpinsRef.current = count;
      setAutoSpinsRemaining(count);
      spin();
    },
    [spin]
  );

  const stopAutoSpins = useCallback(() => {
    autoSpinsRef.current = 0;
    setAutoSpinsRemaining(0);
    if (autoSpinTimerRef.current) {
      clearTimeout(autoSpinTimerRef.current);
      autoSpinTimerRef.current = null;
    }
  }, []);

  const handleSpinComplete = useCallback(
    (response: SpinResponse) => {
      isSpinningRef.current = false;

      if (response.outcome === 'WIN') {
        setLastWin(response.totalWin);

        if (response.isBigWin || response.isMegaWin) {
          setBigWinData({
            show: true,
            amount: response.totalWin,
            multiplier: response.multiplier,
            isMegaWin: response.isMegaWin,
          });
        }
      }

      // Schedule next automated turn if active
      if (autoSpinsRef.current > 0) {
        if (autoSpinsRef.current < 9000) {
          autoSpinsRef.current -= 1;
        }

        const remaining = autoSpinsRef.current;
        setAutoSpinsRemaining(remaining);

        if (remaining > 0 && balanceRef.current >= betAmountRef.current) {
          const delay = isTurboRef.current
            ? 350
            : response.isBigWin
            ? 2200
            : response.outcome === 'WIN'
            ? 1200
            : 500;

          autoSpinTimerRef.current = setTimeout(() => {
            if (autoSpinsRef.current > 0) {
              spin();
            }
          }, delay);
        } else {
          autoSpinsRef.current = 0;
          setAutoSpinsRemaining(0);
        }
      }
    },
    [spin]
  );

  const dismissBigWin = useCallback(() => {
    setBigWinData((prev) => ({ ...prev, show: false }));
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  const resetBalance = useCallback(() => {
    mockServer.setBalance(GAME_CONFIG.INITIAL_BALANCE);
  }, []);

  return {
    balance,
    lastWin,
    betAmount,
    setBetAmount,
    gameState,
    setGameState,
    isTurbo,
    toggleTurbo: () => setIsTurbo((prev) => !prev),
    autoSpinsRemaining,
    forcedOutcome,
    setForcedOutcome,
    fps,
    frameTime,
    setFpsAndFrameTime: (newFps: number, newFrameTime: number) => {
      setFps(newFps);
      setFrameTime(newFrameTime);
    },
    latency,
    logs,
    clearLogs,
    resetBalance,
    bigWinData,
    dismissBigWin,
    spin,
    startAutoSpins,
    stopAutoSpins,
    handleSpinComplete,
  };
}
