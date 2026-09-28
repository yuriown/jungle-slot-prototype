import React, { useState } from 'react';
import { X, RotateCcw, Check, Flame, Infinity as InfinityIcon } from 'lucide-react';
import { soundService } from '../services/soundService';

interface AutoSpinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartAutoSpins: (count: number) => void;
  betAmount: number;
}

export const AutoSpinModal: React.FC<AutoSpinModalProps> = ({
  isOpen,
  onClose,
  onStartAutoSpins,
  betAmount,
}) => {
  const [selectedCount, setSelectedCount] = useState<number>(25);
  const [isInfinite, setIsInfinite] = useState<boolean>(false);

  if (!isOpen) return null;

  const presets = [10, 25, 50, 100, 250, 500];

  const handleSelectPreset = (count: number) => {
    soundService.playButtonClick();
    setSelectedCount(count);
    setIsInfinite(false);
  };

  const handleSelectInfinite = () => {
    soundService.playButtonClick();
    setIsInfinite(true);
    setSelectedCount(9999);
  };

  const handleStepCount = (delta: number) => {
    soundService.playButtonClick();
    setIsInfinite(false);
    setSelectedCount((prev) => Math.max(5, Math.min(1000, prev + delta)));
  };

  const handleStart = () => {
    soundService.playButtonClick();
    onStartAutoSpins(isInfinite ? 9999 : selectedCount);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn select-none">
      <div className="relative w-full max-w-md bg-slate-950 rounded-3xl border border-cyan-500/40 shadow-[0_0_50px_rgba(6,182,212,0.3)] flex flex-col overflow-hidden animate-scaleUp">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-900/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <RotateCcw className="w-5 h-5 animate-spin" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white tracking-wide uppercase">
                Configurar Giros Automáticos
              </h2>
              <p className="text-[11px] text-slate-400">Escolha a quantidade de rodadas contínuas</p>
            </div>
          </div>
          <button
            onClick={() => {
              soundService.playButtonClick();
              onClose();
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo */}
        <div className="p-4 sm:p-6 space-y-5">
          {/* Seletor Customizado (+ / -) */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col items-center justify-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total de Rodadas Selecionadas
            </span>

            <div className="flex items-center gap-4 my-1">
              <button
                onClick={() => handleStepCount(-5)}
                disabled={isInfinite || selectedCount <= 5}
                className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white font-bold text-lg flex items-center justify-center border border-slate-700 active:scale-95 transition"
              >
                -5
              </button>

              <div className="flex items-center justify-center min-w-[120px] px-4 py-2 rounded-xl bg-slate-950 border border-cyan-500/40">
                {isInfinite ? (
                  <div className="flex items-center gap-1.5 text-cyan-400 font-mono font-black text-2xl">
                    <InfinityIcon className="w-6 h-6 animate-pulse" />
                    <span>Infinito</span>
                  </div>
                ) : (
                  <span className="font-mono font-black text-3xl text-cyan-300 drop-shadow-[0_0_10px_rgba(6,182,212,0.6)]">
                    {selectedCount}
                  </span>
                )}
              </div>

              <button
                onClick={() => handleStepCount(5)}
                disabled={isInfinite || selectedCount >= 1000}
                className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white font-bold text-lg flex items-center justify-center border border-slate-700 active:scale-95 transition"
              >
                +5
              </button>
            </div>

            <span className="text-[11px] text-slate-400">
              Aposta por rodada: <strong className="text-white font-mono">${betAmount.toFixed(2)}</strong>
            </span>
          </div>

          {/* Botões de Opções Rápidas (Presets) */}
          <div>
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2.5">
              Opções Rápidas (Presets)
            </span>
            <div className="grid grid-cols-4 gap-2">
              {presets.map((count) => {
                const isSelected = !isInfinite && selectedCount === count;
                return (
                  <button
                    key={count}
                    onClick={() => handleSelectPreset(count)}
                    className={`py-2.5 px-2 rounded-xl font-bold text-xs sm:text-sm border transition flex flex-col items-center justify-center gap-0.5 ${
                      isSelected
                        ? 'bg-gradient-to-b from-cyan-500/30 to-blue-600/30 border-cyan-400 text-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.4)] scale-105'
                        : 'bg-slate-900/80 hover:bg-slate-800 border-slate-800 text-slate-300'
                    }`}
                  >
                    <span>{count}</span>
                    <span className="text-[9px] text-slate-400">rodadas</span>
                  </button>
                );
              })}

              {/* Botão Infinito */}
              <button
                onClick={handleSelectInfinite}
                className={`py-2.5 px-2 rounded-xl font-bold text-xs sm:text-sm border transition flex flex-col items-center justify-center gap-0.5 col-span-2 ${
                  isInfinite
                    ? 'bg-gradient-to-b from-pink-500/30 to-purple-600/30 border-pink-400 text-pink-200 shadow-[0_0_12px_rgba(236,72,153,0.4)] scale-105'
                    : 'bg-slate-900/80 hover:bg-slate-800 border-slate-800 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-1">
                  <InfinityIcon className="w-4 h-4 text-pink-400" />
                  <span>Infinito (Até parar)</span>
                </div>
              </button>
            </div>
          </div>

          {/* Dica de usabilidade */}
          <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Você pode pausar ou parar o Auto Spin a qualquer momento clicando no botão "PARAR".</span>
          </div>

          {/* Botão de Iniciar */}
          <button
            onClick={handleStart}
            className="w-full py-3.5 px-6 rounded-2xl font-black text-sm sm:text-base uppercase tracking-wider bg-gradient-to-r from-pink-500 via-purple-600 to-cyan-500 hover:from-pink-400 hover:to-cyan-400 text-white shadow-[0_0_25px_rgba(236,72,153,0.6)] border border-pink-300/40 flex items-center justify-center gap-2 active:scale-98 transition"
          >
            <Flame className="w-5 h-5 text-yellow-300" />
            <span>
              Iniciar Auto Spin ({isInfinite ? 'Infinito' : `${selectedCount} Rodadas`})
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
