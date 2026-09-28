import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, Trophy } from 'lucide-react';

interface BigWinOverlayProps {
  show: boolean;
  winAmount: number;
  multiplier: number;
  isMegaWin: boolean;
  onDismiss: () => void;
}

export const BigWinOverlay: React.FC<BigWinOverlayProps> = ({
  show,
  winAmount,
  multiplier,
  isMegaWin,
  onDismiss,
}) => {
  const [countingValue, setCountingValue] = useState(0);

  useEffect(() => {
    if (!show) return;

    // Dispara confetes com canvas-confetti
    try {
      confetti({
        particleCount: isMegaWin ? 150 : 80,
        spread: 90,
        origin: { y: 0.6 },
        colors: ['#00f0ff', '#ff007f', '#fbbf24', '#a855f7'],
      });
    } catch {
      // fallback
    }

    // Contagem de números
    const duration = 1200;
    const start = performance.now();

    const frame = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(1, elapsed / duration);
      setCountingValue(Math.round(progress * winAmount * 100) / 100);

      if (progress < 1) {
        requestAnimationFrame(frame);
      }
    };

    requestAnimationFrame(frame);

    // Auto dispensar após 3.5 segundos se o jogador não clicar
    const timer = setTimeout(() => {
      onDismiss();
    }, 3500);

    return () => clearTimeout(timer);
  }, [show, winAmount, isMegaWin]);

  if (!show) return null;

  return (
    <div
      onClick={onDismiss}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md cursor-pointer animate-fadeIn select-none"
    >
      <div className="relative flex flex-col items-center text-center p-8 rounded-3xl bg-gradient-to-b from-slate-900/90 via-slate-950 to-purple-950/80 border-2 border-pink-500/50 shadow-[0_0_60px_rgba(236,72,153,0.5)] transform animate-scaleUp max-w-md w-full">
        {/* Ícone de Troféu */}
        <div className="p-4 rounded-full bg-gradient-to-tr from-pink-500 to-yellow-400 shadow-[0_0_30px_rgba(251,191,36,0.8)] mb-4">
          <Trophy className="w-12 h-12 text-slate-950 animate-bounce" />
        </div>

        {/* Banner de Título */}
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-yellow-300 animate-spin" />
          <h2 className="text-3xl sm:text-4xl font-black italic tracking-wider bg-gradient-to-r from-yellow-300 via-pink-400 to-cyan-300 bg-clip-text text-transparent uppercase drop-shadow-[0_0_15px_rgba(251,191,36,0.6)]">
            {isMegaWin ? 'MEGA JACKPOT!' : 'BIG WIN!'}
          </h2>
          <Sparkles className="w-5 h-5 text-yellow-300 animate-spin" />
        </div>

        <p className="text-xs font-bold text-pink-300 uppercase tracking-widest mb-4">
          Multiplicador Cósmico {multiplier}X
        </p>

        {/* Valor Total Ganho */}
        <div className="text-4xl sm:text-5xl font-black font-mono text-yellow-400 drop-shadow-[0_0_20px_rgba(250,204,21,0.9)] mb-6">
          ${countingValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>

        <span className="text-[11px] text-slate-400">Clique em qualquer lugar para continuar</span>
      </div>
    </div>
  );
};
