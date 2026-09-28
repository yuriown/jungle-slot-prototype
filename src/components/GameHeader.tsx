import React, { useState, useEffect } from 'react';
import {
  Volume2,
  VolumeX,
  HelpCircle,
  Activity,
  BarChart2,
  Radio,
  Zap,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { soundService } from '../services/soundService';

interface GameHeaderProps {
  fps: number;
  frameTime: number;
  latency: number;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenPaytable: () => void;
  onOpenStats: () => void;
  onToggleNetworkLogs: () => void;
  showLogs: boolean;
  logCount: number;
}

export const GameHeader: React.FC<GameHeaderProps> = ({
  fps,
  frameTime,
  latency,
  isMuted,
  onToggleMute,
  onOpenPaytable,
  onOpenStats,
  onToggleNetworkLogs,
  showLogs,
  logCount,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    soundService.playButtonClick();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <header className="game-header flex items-center justify-between px-3 sm:px-4 py-2 bg-slate-950/80 backdrop-blur-md border-b border-cyan-500/20 z-30">
      {/* Logotipo e Título */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        <div className="relative flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gradient-to-br from-pink-500 to-purple-600 shadow-[0_0_15px_rgba(236,72,153,0.5)] border border-pink-400">
          <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <h1 className="text-sm sm:text-lg font-black tracking-wider bg-gradient-to-r from-cyan-400 via-pink-400 to-purple-400 bg-clip-text text-transparent uppercase">
              COSMIC NOVA
            </h1>
            <span className="text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded bg-pink-500/20 text-pink-400 border border-pink-500/30">
              5X3 REELS
            </span>
          </div>
          <p className="text-[10px] sm:text-[11px] text-slate-400 hidden sm:block">
            High-Performance PixiJS + React iGaming Showcase
          </p>
        </div>
      </div>

      {/* Indicadores de Desempenho e WebSocket */}
      <div className="flex items-center gap-1.5 sm:gap-4">
        {/* Medidor de 60 FPS */}
        <div className="flex items-center gap-1.5 px-2 py-1 sm:px-2.5 rounded-full bg-slate-900/90 border border-slate-700/60 text-[11px] sm:text-xs">
          <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span className="font-mono font-bold text-emerald-400">{fps || 60} FPS</span>
          <span className="text-slate-500 text-[10px] hidden md:inline">({frameTime}ms)</span>
        </div>

        {/* Status do WebSocket Backend */}
        <div className="flex items-center gap-1.5 px-2 py-1 sm:px-2.5 rounded-full bg-slate-900/90 border border-slate-700/60 text-[11px] sm:text-xs">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span className="text-cyan-400 font-semibold hidden md:inline">WS LIVE</span>
          <span className="font-mono text-slate-300 text-[10px] sm:text-[11px]">{latency}ms</span>
        </div>

        {/* Botões de Ação */}
        <div className="flex items-center gap-1 sm:gap-1.5 border-l border-slate-800 pl-1.5 sm:pl-2">
          {/* Mudo / Áudio */}
          <button
            onClick={() => {
              soundService.playButtonClick();
              onToggleMute();
            }}
            title={isMuted ? 'Ativar Áudio' : 'Mutar Áudio'}
            className="p-1.5 sm:p-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-cyan-400 border border-slate-700 transition"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Sair da Tela Cheia' : 'Tela Cheia (Imersivo)'}
            className="p-1.5 sm:p-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-cyan-400 border border-slate-700 transition"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4 text-cyan-400" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Paytable / Regras */}
          <button
            onClick={() => {
              soundService.playButtonClick();
              onOpenPaytable();
            }}
            title="Tabela de Pagamentos & Regras"
            className="p-1.5 sm:p-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-cyan-400 border border-slate-700 transition flex items-center gap-1"
          >
            <HelpCircle className="w-4 h-4" />
            <span className="text-xs font-semibold hidden lg:inline">Paytable</span>
          </button>

          {/* Estatísticas RTP */}
          <button
            onClick={() => {
              soundService.playButtonClick();
              onOpenStats();
            }}
            title="Estatísticas & RTP"
            className="p-1.5 sm:p-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-cyan-400 border border-slate-700 transition flex items-center gap-1"
          >
            <BarChart2 className="w-4 h-4" />
            <span className="text-xs font-semibold hidden lg:inline">Stats</span>
          </button>

          {/* Toggle do Log de Rede Simulado */}
          <button
            onClick={() => {
              soundService.playButtonClick();
              onToggleNetworkLogs();
            }}
            title="Painel de Rede WebSocket"
            className={`p-1.5 sm:p-2 rounded-lg border transition flex items-center gap-1.5 relative ${
              showLogs
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                : 'bg-slate-900/80 text-slate-300 hover:text-cyan-400 border-slate-700 hover:bg-slate-800'
            }`}
          >
            <Radio className="w-4 h-4" />
            <span className="text-xs font-semibold hidden sm:inline">Network Dev</span>
            {logCount > 0 && (
              <span className="flex items-center justify-center px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-cyan-500 text-slate-950">
                {logCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
