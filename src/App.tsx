import React, { useState, useRef, useEffect } from 'react';
import { useSlotGame } from './hooks/useSlotGame';
import { soundService } from './services/soundService';
import { SlotGameCanvas, type SlotGameCanvasHandle } from './components/SlotGameCanvas';
import { GameHeader } from './components/GameHeader';
import { BottomControls } from './components/BottomControls';
import { NetworkLogPanel } from './components/NetworkLogPanel';
import { PaytableModal } from './components/PaytableModal';
import { StatsModal } from './components/StatsModal';
import { BigWinOverlay } from './components/BigWinOverlay';

export const App: React.FC = () => {
  const canvasRef = useRef<SlotGameCanvasHandle>(null);
  const [showLogs, setShowLogs] = useState(false);
  const [showPaytable, setShowPaytable] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [isMuted, setIsMuted] = useState(soundService.getIsMuted());

  const {
    balance,
    lastWin,
    betAmount,
    setBetAmount,
    gameState,
    setGameState,
    isTurbo,
    toggleTurbo,
    autoSpinsRemaining,
    forcedOutcome,
    setForcedOutcome,
    fps,
    frameTime,
    setFpsAndFrameTime,
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
  } = useSlotGame(canvasRef);

  // Keyboard shortcut: Spacebar trigger
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isAnyModalOpen = showPaytable || showStats || bigWinData.show;
      if (e.code === 'Space' && !e.repeat && !isAnyModalOpen && autoSpinsRemaining === 0) {
        e.preventDefault();
        spin();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [spin, showPaytable, showStats, bigWinData.show, autoSpinsRemaining]);

  return (
    <div className="game-wrapper flex flex-col w-screen h-screen overflow-hidden bg-slate-950 text-slate-100 font-sans select-none">
      {/* Top Header */}
      <GameHeader
        fps={fps}
        frameTime={frameTime}
        latency={latency}
        isMuted={isMuted}
        onToggleMute={() => setIsMuted(soundService.toggleMute())}
        onOpenPaytable={() => setShowPaytable(true)}
        onOpenStats={() => setShowStats(true)}
        onToggleNetworkLogs={() => setShowLogs((prev) => !prev)}
        showLogs={showLogs}
        logCount={logs.length}
      />

      {/* Main Pixi.js Canvas Viewport */}
      <main className="relative flex-1 w-full h-full flex items-center justify-center p-2 sm:p-4 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-slate-950 to-slate-950 pointer-events-none" />

        <div className="relative w-full h-full max-w-5xl max-h-[680px] rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] border border-slate-800/80 flex items-center justify-center">
          <SlotGameCanvas
            ref={canvasRef}
            onStateChange={setGameState}
            onSpinComplete={handleSpinComplete}
            onFpsUpdate={setFpsAndFrameTime}
          />
        </div>
      </main>

      {/* Bottom Console Controls */}
      <BottomControls
        balance={balance}
        lastWin={lastWin}
        betAmount={betAmount}
        gameState={gameState}
        isTurbo={isTurbo}
        autoSpinsRemaining={autoSpinsRemaining}
        onBetChange={setBetAmount}
        onToggleTurbo={toggleTurbo}
        onStartSpin={spin}
        onStartAutoSpins={startAutoSpins}
        onStopAutoSpins={stopAutoSpins}
      />

      {/* Real-time WebSocket Debugger */}
      <NetworkLogPanel
        logs={logs}
        isOpen={showLogs}
        onClose={() => setShowLogs(false)}
        onClearLogs={clearLogs}
        forcedOutcome={forcedOutcome}
        onSelectForcedOutcome={setForcedOutcome}
        onResetBalance={resetBalance}
      />

      {/* Modals & Visual Celebrations */}
      <PaytableModal isOpen={showPaytable} onClose={() => setShowPaytable(false)} />
      <StatsModal isOpen={showStats} onClose={() => setShowStats(false)} />
      <BigWinOverlay
        show={bigWinData.show}
        winAmount={bigWinData.amount}
        multiplier={bigWinData.multiplier}
        isMegaWin={bigWinData.isMegaWin}
        onDismiss={dismissBigWin}
      />
    </div>
  );
};

export default App;
