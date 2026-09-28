import React from 'react';
import { X, BarChart2, DollarSign, RotateCw, TrendingUp } from 'lucide-react';
import { mockServer } from '../services/mockSlotServer';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StatsModal: React.FC<StatsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const stats = mockServer.getStats();
  const rtp =
    stats.totalWagered > 0
      ? ((stats.totalWon / stats.totalWagered) * 100).toFixed(2)
      : '0.00';
  const netProfit = stats.totalWon - stats.totalWagered;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-slate-950 rounded-2xl border border-cyan-500/30 shadow-2xl flex flex-col overflow-hidden">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-white uppercase tracking-wider">
              Estatísticas da Sessão & RTP
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Métricas */}
        <div className="p-5 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            {/* Giros Realizados */}
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col">
              <span className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
                <RotateCw className="w-3 h-3 text-cyan-400" /> Total de Giros
              </span>
              <span className="text-xl font-bold font-mono text-white mt-1">
                {stats.totalSpins}
              </span>
            </div>

            {/* RTP Real */}
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col">
              <span className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-pink-400" /> RTP Calculado
              </span>
              <span className="text-xl font-bold font-mono text-pink-400 mt-1">
                {rtp}%
              </span>
              <span className="text-[9px] text-slate-500">Target Teórico: 96.5%</span>
            </div>

            {/* Total Apostado */}
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col">
              <span className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
                <DollarSign className="w-3 h-3 text-slate-400" /> Total Apostado
              </span>
              <span className="text-lg font-bold font-mono text-slate-200 mt-1">
                ${stats.totalWagered.toFixed(2)}
              </span>
            </div>

            {/* Total Pago */}
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col">
              <span className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
                <DollarSign className="w-3 h-3 text-amber-400" /> Total Pago
              </span>
              <span className="text-lg font-bold font-mono text-amber-400 mt-1">
                ${stats.totalWon.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Saldo Líquido */}
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
            <span className="font-bold text-slate-300">Lucro Líquido (GGR):</span>
            <span
              className={`font-mono font-bold text-base ${
                netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {netProfit >= 0 ? `+$${netProfit.toFixed(2)}` : `-$${Math.abs(netProfit).toFixed(2)}`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
