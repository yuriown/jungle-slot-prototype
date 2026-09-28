import React, { useState, useEffect } from 'react';
import { RotateCcw, Zap, Plus, Minus, Coins, Trophy, Flame, SlidersHorizontal } from 'lucide-react';
import { GAME_CONFIG } from '../game/slotConfig';
import type { GameState } from '../types/slot.types';
import { soundService } from '../services/soundService';
import { AutoSpinModal } from './AutoSpinModal';

interface BottomControlsProps {
  balance: number;
  lastWin: number;
  betAmount: number;
  gameState: GameState;
  isTurbo: boolean;
  autoSpinsRemaining: number;
  onBetChange: (newBet: number) => void;
  onToggleTurbo: () => void;
  onStartSpin: () => void;
  onStartAutoSpins: (count: number) => void;
  onStopAutoSpins: () => void;
}

export const BottomControls: React.FC<BottomControlsProps> = ({
  balance,
  lastWin,
  betAmount,
  gameState,
  isTurbo,
  autoSpinsRemaining,
  onBetChange,
  onToggleTurbo,
  onStartSpin,
  onStartAutoSpins,
  onStopAutoSpins,
}) => {
  const [showAutoModal, setShowAutoModal] = useState(false);
  const [displayWin, setDisplayWin] = useState(0);

  const isBusy = gameState === 'SPINNING' || gameState === 'STOPPING' || gameState === 'REQUESTING';
  const isAutoPlaying = autoSpinsRemaining > 0;

  // Animação de contagem suave para o display de vitória
  useEffect(() => {
    if (lastWin === 0) {
      setDisplayWin(0);
      return;
    }

    const duration = 600; // ms
    const startTime = performance.now();

    const animateCount = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      const current = Math.round(progress * lastWin * 100) / 100;
      setDisplayWin(current);

      if (progress < 1) {
        requestAnimationFrame(animateCount);
      } else {
        setDisplayWin(lastWin);
      }
    };

    requestAnimationFrame(animateCount);
  }, [lastWin]);

  const handleStepBet = (delta: number) => {
    soundService.playButtonClick();
    const steps = GAME_CONFIG.BET_STEPS;
    const currentIndex = steps.indexOf(betAmount);
    let newIndex = currentIndex !== -1 ? currentIndex + delta : 0;
    if (newIndex < 0) newIndex = 0;
    if (newIndex >= steps.length) newIndex = steps.length - 1;
    onBetChange(steps[newIndex]);
  };

  const handleMaxBet = () => {
    soundService.playButtonClick();
    const steps = GAME_CONFIG.BET_STEPS;
    onBetChange(steps[steps.length - 1]);
  };

  return (
    <>
      <footer className="bottom-controls w-full bg-slate-950/95 backdrop-blur-xl border-t border-cyan-500/20 px-2 py-2 sm:px-6 sm:py-3 z-30 shrink-0">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2 sm:gap-4">
          {/* Lado Esquerdo: Saldo (Balance) e Vitória (Win Display) */}
          <div className="flex items-center gap-3 sm:gap-5">
            {/* Display de Saldo */}
            <div className="flex flex-col">
              <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Coins className="w-3 h-3 text-cyan-400 shrink-0" /> Saldo
              </span>
              <div className="text-sm sm:text-lg font-black font-mono text-cyan-300 drop-shadow-[0_0_8px_rgba(6,182,212,0.4)]">
                ${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>

            {/* Display de Vitória */}
            <div className="flex flex-col min-w-[90px] sm:min-w-[130px]">
              <span className="text-[9px] sm:text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                <Trophy className="w-3 h-3 text-amber-400 shrink-0" /> Ganho
              </span>
              <div
                className={`text-sm sm:text-lg font-black font-mono transition-all duration-300 ${
                  lastWin > 0
                    ? 'text-amber-300 drop-shadow-[0_0_12px_rgba(251,191,36,0.8)] scale-105'
                    : 'text-slate-500'
                }`}
              >
                ${displayWin.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          {/* Centro: Seletores de Aposta (Bet) */}
          <div className="flex items-center gap-1.5 sm:gap-2 bg-slate-900/90 p-1 sm:p-1.5 rounded-xl border border-slate-800">
            <div className="flex flex-col px-1.5 sm:px-2">
              <span className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase">Aposta</span>
              <span className="text-xs sm:text-base font-black font-mono text-white">
                ${betAmount.toFixed(2)}
              </span>
            </div>

            <button
              onClick={() => handleStepBet(-1)}
              disabled={isBusy || isAutoPlaying || betAmount <= GAME_CONFIG.BET_STEPS[0]}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 flex items-center justify-center transition"
              title="Diminuir Aposta"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => handleStepBet(1)}
              disabled={isBusy || isAutoPlaying || betAmount >= GAME_CONFIG.BET_STEPS[GAME_CONFIG.BET_STEPS.length - 1]}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 flex items-center justify-center transition"
              title="Aumentar Aposta"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleMaxBet}
              disabled={isBusy || isAutoPlaying || betAmount >= GAME_CONFIG.BET_STEPS[GAME_CONFIG.BET_STEPS.length - 1]}
              className="px-2 py-1 text-[10px] sm:text-[11px] font-bold rounded-lg bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 border border-purple-500/40 disabled:opacity-40 transition"
            >
              MAX
            </button>
          </div>

          {/* Lado Direito: Turbo, Auto Spin e Botão Principal GIRAR */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* Botão Turbo */}
            <button
              onClick={() => {
                soundService.playButtonClick();
                onToggleTurbo();
              }}
              disabled={isBusy}
              title="Alternar Modo Turbo"
              className={`px-2.5 sm:px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1 border transition ${
                isTurbo
                  ? 'bg-amber-500/20 text-amber-300 border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                  : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              <Zap className={`w-3.5 h-3.5 ${isTurbo ? 'text-amber-400 fill-amber-400 animate-pulse' : ''}`} />
              <span className="hidden sm:inline">TURBO</span>
            </button>

            {/* Botão Auto Spin com Modal */}
            {isAutoPlaying ? (
              <button
                onClick={() => {
                  soundService.playButtonClick();
                  onStopAutoSpins();
                }}
                className="px-3 sm:px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 bg-rose-600 hover:bg-rose-500 text-white shadow-[0_0_15px_rgba(225,29,72,0.6)] border border-rose-400 transition animate-pulse"
                title="Clique para Parar os Giros Automáticos"
              >
                <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                <span>PARAR ({autoSpinsRemaining > 9000 ? '∞' : autoSpinsRemaining})</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  soundService.playButtonClick();
                  setShowAutoModal(true);
                }}
                disabled={isBusy}
                className="px-2.5 sm:px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border border-slate-800 hover:border-cyan-500/30 transition"
                title="Configurar Giros Automáticos"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">AUTO</span>
                <SlidersHorizontal className="w-3 h-3 opacity-60 hidden md:inline" />
              </button>
            )}

            {/* Botão Hero GIRAR */}
            <button
              onClick={() => {
                if (!isBusy && !isAutoPlaying) {
                  soundService.playButtonClick();
                  onStartSpin();
                }
              }}
              disabled={isBusy || isAutoPlaying || balance < betAmount}
              className={`relative group px-5 sm:px-8 py-2.5 sm:py-3 rounded-2xl font-black text-xs sm:text-base uppercase tracking-wider flex items-center gap-1.5 sm:gap-2 text-white transition-all transform active:scale-95 ${
                isBusy || isAutoPlaying
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  : balance < betAmount
                  ? 'bg-rose-950 text-rose-400 border border-rose-800 cursor-not-allowed'
                  : 'bg-gradient-to-r from-pink-500 via-purple-600 to-cyan-500 hover:from-pink-400 hover:to-cyan-400 shadow-[0_0_25px_rgba(236,72,153,0.6)] hover:shadow-[0_0_35px_rgba(6,182,212,0.8)] border border-pink-300/40'
              }`}
            >
              {isBusy ? (
                <>
                  <RotateCcw className="w-4 h-4 animate-spin text-pink-400" />
                  <span>{gameState === 'REQUESTING' ? 'MOCK WS...' : gameState === 'STOPPING' ? 'PARANDO...' : 'GIRANDO...'}</span>
                </>
              ) : balance < betAmount ? (
                <span>SEM SALDO</span>
              ) : (
                <>
                  <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-300 group-hover:scale-125 transition-transform" />
                  <span>GIRAR</span>
                </>
              )}
            </button>
          </div>
        </div>
      </footer>

      {/* Modal de Configuração de Auto Spin */}
      <AutoSpinModal
        isOpen={showAutoModal}
        onClose={() => setShowAutoModal(false)}
        onStartAutoSpins={onStartAutoSpins}
        betAmount={betAmount}
      />
    </>
  );
};
