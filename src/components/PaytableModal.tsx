import React from 'react';
import { X, Trophy, Sparkles, ShieldCheck } from 'lucide-react';
import { PAYLINES, SYMBOL_DEFINITIONS, SYMBOL_KEYS } from '../game/slotConfig';

interface PaytableModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PaytableModal: React.FC<PaytableModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-slate-950 rounded-2xl border border-cyan-500/30 shadow-2xl flex flex-col overflow-hidden">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-white uppercase tracking-wider">
              Tabela de Pagamentos & Regras do Jogo
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo com Scroll */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 text-slate-300 text-xs">
          {/* Grid de Símbolos e Multiplicadores */}
          <div>
            <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              Símbolos e Multiplicadores de Linha
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SYMBOL_KEYS.map((symKey) => {
                const sym = SYMBOL_DEFINITIONS[symKey];
                return (
                  <div
                    key={sym.id}
                    className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-sm" style={{ color: sym.color }}>
                        {sym.name}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {sym.category === 'special'
                          ? 'Coringa (Substitui todos)'
                          : `Categoria: ${sym.category.toUpperCase()}`}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 font-mono text-xs">
                      <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                        5x: <strong className="text-amber-300">{sym.payouts[5]}x</strong>
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                        4x: {sym.payouts[4]}x
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                        3x: {sym.payouts[3]}x
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Diagrama das 10 Paylines */}
          <div>
            <h3 className="text-sm font-bold text-pink-400 uppercase tracking-wider mb-3">
              10 Linhas de Pagamento (Paylines)
            </h3>
            <p className="text-[11px] text-slate-400 mb-3">
              As combinações são avaliadas da esquerda para a direita (Left-to-Right), iniciando sempre no primeiro rolo.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {PAYLINES.map((line) => (
                <div
                  key={line.id}
                  className="p-2 rounded-lg bg-slate-900/90 border border-slate-800 flex flex-col items-center gap-1.5"
                >
                  <div className="flex items-center justify-between w-full text-[10px] font-bold">
                    <span style={{ color: line.color }}>Linha #{line.id}</span>
                  </div>
                  {/* Mini Grid 5x3 demonstrativo */}
                  <div className="grid grid-cols-5 gap-1 p-1 bg-slate-950 rounded border border-slate-800 w-full">
                    {[0, 1, 2, 3, 4].map((reelIdx) => (
                      <div key={reelIdx} className="flex flex-col gap-0.5">
                        {[0, 1, 2].map((rowIdx) => {
                          const isActive = line.coords[reelIdx] === rowIdx;
                          return (
                            <div
                              key={rowIdx}
                              className={`h-2 rounded-sm transition ${
                                isActive ? 'bg-cyan-400 shadow-[0_0_4px_rgba(6,182,212,0.8)]' : 'bg-slate-800/60'
                              }`}
                            />
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Regras e Arquitetura Técnica */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-200">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Arquitetura Autoritativa de Backend (iGaming Compliance)
            </div>
            <p className="text-slate-400 leading-relaxed">
              Em jogos reais de cassino (iGaming), nenhum cálculo de vitória é realizado no cliente para evitar fraudes.
              O cliente React + PixiJS atua puramente como uma camada de visualização em tempo real sincronizada via WebSocket.
              Os rolos aceleram e desaceleram na combinação exata validada criptograficamente pelo servidor.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
