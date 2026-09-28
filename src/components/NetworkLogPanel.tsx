import React, { useState } from 'react';
import {
  X,
  Radio,
  ArrowUpRight,
  ArrowDownLeft,
  Sliders,
  Trash2,
  RefreshCw,
  Code2,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';
import type { ForceOutcomeType, NetworkLogEntry } from '../types/slot.types';
import { mockServer } from '../services/mockSlotServer';

interface NetworkLogPanelProps {
  logs: NetworkLogEntry[];
  isOpen: boolean;
  onClose: () => void;
  onClearLogs: () => void;
  forcedOutcome: ForceOutcomeType;
  onSelectForcedOutcome: (outcome: ForceOutcomeType) => void;
  onResetBalance: () => void;
}

export const NetworkLogPanel: React.FC<NetworkLogPanelProps> = ({
  logs,
  isOpen,
  onClose,
  onClearLogs,
  forcedOutcome,
  onSelectForcedOutcome,
  onResetBalance,
}) => {
  const [latency, setLatency] = useState<number>(mockServer.getLatency());
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'stream' | 'devtools'>('stream');

  if (!isOpen) return null;

  const handleLatencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setLatency(val);
    mockServer.setLatency(val);
  };

  const toggleExpand = (id: string) => {
    setExpandedLogId(expandedLogId === id ? null : id);
  };

  return (
    <aside className="fixed top-0 right-0 h-full w-full sm:w-[440px] bg-slate-950/95 backdrop-blur-2xl border-l border-cyan-500/30 shadow-2xl z-50 flex flex-col transition-all">
      {/* Cabeçalho do Painel */}
      <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/50">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">WebSocket Network Inspector</h3>
            <p className="text-[11px] text-slate-400">Simulador de Backend Autoritativo iGaming</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 bg-slate-900/30">
        <button
          onClick={() => setActiveTab('stream')}
          className={`flex-1 py-2.5 text-xs font-bold border-b-2 transition flex items-center justify-center gap-1.5 ${
            activeTab === 'stream'
              ? 'border-cyan-400 text-cyan-400 bg-cyan-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Radio className="w-3.5 h-3.5" />
          Live Stream ({logs.length})
        </button>
        <button
          onClick={() => setActiveTab('devtools')}
          className={`flex-1 py-2.5 text-xs font-bold border-b-2 transition flex items-center justify-center gap-1.5 ${
            activeTab === 'devtools'
              ? 'border-pink-400 text-pink-400 bg-pink-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          Dev Sandbox & Simulação
        </button>
      </div>

      {/* Conteúdo da Tab */}
      {activeTab === 'stream' ? (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Barra de Ações Rápidas */}
          <div className="flex items-center justify-between px-4 py-2 bg-slate-900/60 border-b border-slate-800/80 text-[11px]">
            <span className="text-slate-400 font-mono">
              Status: <span className="text-emerald-400 font-bold">CONNECTED (101 Switching Protocols)</span>
            </span>
            <button
              onClick={onClearLogs}
              className="flex items-center gap-1 text-slate-400 hover:text-rose-400 transition"
              title="Limpar Histórico de Logs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Limpar
            </button>
          </div>

          {/* Lista de Mensagens do Stream */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 font-mono text-xs">
            {logs.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">
                Nenhum evento registrado ainda. Clique em "GIRAR" para iniciar o tráfego WebSocket.
              </div>
            ) : (
              logs.map((log) => {
                const isOut = log.direction === 'CLIENT_TO_SERVER';
                const isIn = log.direction === 'SERVER_TO_CLIENT';
                const isExpanded = expandedLogId === log.id;

                return (
                  <div
                    key={log.id}
                    className={`rounded-lg border p-2.5 transition ${
                      isOut
                        ? 'bg-blue-950/20 border-blue-500/30'
                        : isIn
                        ? 'bg-emerald-950/20 border-emerald-500/30'
                        : 'bg-slate-900/60 border-slate-800'
                    }`}
                  >
                    <div
                      onClick={() => toggleExpand(log.id)}
                      className="flex items-center justify-between cursor-pointer select-none"
                    >
                      <div className="flex items-center gap-2">
                        {isOut ? (
                          <span className="p-1 rounded bg-blue-500/20 text-blue-400">
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </span>
                        ) : isIn ? (
                          <span className="p-1 rounded bg-emerald-500/20 text-emerald-400">
                            <ArrowDownLeft className="w-3.5 h-3.5" />
                          </span>
                        ) : (
                          <span className="p-1 rounded bg-slate-800 text-slate-400">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </span>
                        )}
                        <span
                          className={`font-bold text-[11px] ${
                            isOut ? 'text-blue-400' : isIn ? 'text-emerald-400' : 'text-slate-300'
                          }`}
                        >
                          {log.type}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-500 text-[10px]">
                        <span>{log.timestamp}</span>
                        {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                      </div>
                    </div>

                    <div className="mt-1 text-[11px] text-slate-300 font-sans break-words">
                      {log.summary}
                    </div>

                    {/* JSON Expansível com Payload Detalhado */}
                    {isExpanded && log.data && (
                      <div className="mt-2 pt-2 border-t border-slate-800/80">
                        <div className="flex items-center justify-between mb-1 text-[10px] text-slate-400">
                          <span className="flex items-center gap-1">
                            <Code2 className="w-3 h-3 text-cyan-400" /> Frame Payload (JSON)
                          </span>
                        </div>
                        <pre className="p-2 rounded bg-slate-950 text-[10px] text-cyan-300 overflow-x-auto border border-slate-800">
                          {JSON.stringify(log.data, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : (
        /* Tab Dev Sandbox para apresentação em Entrevistas */
        <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs">
          {/* Controle de Latência */}
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="flex justify-between items-center mb-2">
              <label className="font-bold text-slate-200">Latência de Rede Simulada</label>
              <span className="font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30">
                {latency} ms
              </span>
            </div>
            <input
              type="range"
              min="30"
              max="1500"
              step="20"
              value={latency}
              onChange={handleLatencyChange}
              className="w-full accent-cyan-400 cursor-pointer"
            />
            <p className="text-[11px] text-slate-400 mt-2">
              Simula condições de rede reais (WiFi, 4G, lag elevado) para demonstrar a robustez do estado do jogo.
            </p>
          </div>

          {/* Forçar Resultados para Demonstração Técnica */}
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <label className="font-bold text-slate-200 block mb-1.5">
              Injeção de Cenários de Teste (Mock Override)
            </label>
            <p className="text-[11px] text-slate-400 mb-3">
              Selecione um cenário para disparar no próximo giro e testar as animações e cálculos:
            </p>

            <div className="grid grid-cols-1 gap-2">
              {[
                { id: 'AUTO', label: '🎲 Aleatório Padrão (RTP ~96.5%)', desc: 'RNG orgânico com distribuição balanceada' },
                { id: 'JACKPOT_WILD', label: '💎 Jackpot Épico (5x WILD)', desc: '5 símbolos Wild na linha central com multiplicador máximo' },
                { id: 'BIG_WIN_ROCKETS', label: '🚀 Big Win (Foguetes 5x)', desc: 'Linhas múltiplas de foguetes com fanfarra de Big Win' },
                { id: 'MULTI_LINE_WIN', label: '🌌 Vitória Multi-Linha', desc: 'Combinações simultâneas em 3 paylines' },
                { id: 'NEAR_MISS', label: '⚡ Near Miss (Suspense)', desc: '2 Wilds nos primeiros rolos e parada sem ganho' },
                { id: 'LOSS', label: '❌ Sem Vitória (Loss)', desc: 'Rodada sem combinações premiadas' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => onSelectForcedOutcome(item.id as ForceOutcomeType)}
                  className={`p-2.5 rounded-lg border text-left transition flex flex-col gap-0.5 ${
                    forcedOutcome === item.id
                      ? 'bg-pink-500/20 border-pink-400 text-pink-300 shadow-[0_0_10px_rgba(236,72,153,0.3)]'
                      : 'bg-slate-950 hover:bg-slate-800/80 border-slate-800 text-slate-300'
                  }`}
                >
                  <span className="font-bold text-xs">{item.label}</span>
                  <span className="text-[10px] text-slate-400">{item.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Reset de Saldo */}
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
            <div>
              <div className="font-bold text-slate-200">Restaurar Saldo</div>
              <div className="text-[11px] text-slate-400">Recarregar banca para $1,000.00</div>
            </div>
            <button
              onClick={onResetBalance}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center gap-1.5 transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Resetar
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};
