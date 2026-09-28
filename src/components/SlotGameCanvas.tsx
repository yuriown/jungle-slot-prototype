import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import type { GameState, SpinResponse } from '../types/slot.types';
import { SlotEngine } from '../game/SlotEngine';

export interface SlotGameCanvasHandle {
  startSpin: (isTurbo: boolean) => void;
  stopWithServerResult: (response: SpinResponse) => void;
}

interface SlotGameCanvasProps {
  onStateChange: (state: GameState) => void;
  onSpinComplete: (response: SpinResponse) => void;
  onFpsUpdate: (fps: number, frameTimeMs: number) => void;
}

/**
 * Componente React que encapsula o Canvas do PixiJS.
 * Gerencia o ciclo de vida via useRef e useEffect, com limpeza estrita de memória (destroy)
 * ao desmontar, evitando vazamento de instâncias WebGL.
 */
export const SlotGameCanvas = forwardRef<SlotGameCanvasHandle, SlotGameCanvasProps>(
  ({ onStateChange, onSpinComplete, onFpsUpdate }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const engineRef = useRef<SlotEngine | null>(null);

    // Expõe métodos imperativos para o componente pai controlar o ciclo de giro
    useImperativeHandle(ref, () => ({
      startSpin: (isTurbo: boolean) => {
        engineRef.current?.startSpin(isTurbo);
      },
      stopWithServerResult: (response: SpinResponse) => {
        engineRef.current?.stopWithServerResult(response);
      },
    }));

    useEffect(() => {
      if (!containerRef.current) return;

      const engine = new SlotEngine(containerRef.current, {
        onStateChange,
        onSpinComplete,
        onFpsUpdate,
      });

      engineRef.current = engine;
      engine.init();

      const handleResize = () => {
        engine.handleResize();
      };

      window.addEventListener('resize', handleResize);

      // Cleanup estrito do PixiJS ao desmontar o componente React
      return () => {
        window.removeEventListener('resize', handleResize);
        engine.destroy();
        engineRef.current = null;
      };
    }, []);

    return (
      <div
        ref={containerRef}
        className="w-full h-full relative flex items-center justify-center overflow-hidden select-none"
        style={{ touchAction: 'none' }}
      />
    );
  }
);
