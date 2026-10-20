import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Maximize2, Camera, RefreshCw, Smartphone, Monitor, Square, Sparkles } from 'lucide-react';
import { CanvasAspectRatio, LayoutMode } from '../types';

interface CanvasViewportProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  aspectRatio: CanvasAspectRatio;
  setAspectRatio: (ratio: CanvasAspectRatio) => void;
  layoutMode: LayoutMode;
  splitRatio: number;
  setSplitRatio: (ratio: number) => void;
  filterPresetName: string;
  onSnapshot: () => void;
  onResetAdjustments: () => void;
  isAiThinking?: boolean;
}

export const CanvasViewport: React.FC<CanvasViewportProps> = ({
  canvasRef,
  aspectRatio,
  setAspectRatio,
  layoutMode,
  splitRatio,
  setSplitRatio,
  filterPresetName,
  onSnapshot,
  onResetAdjustments,
  isAiThinking = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDraggingSplit, setIsDraggingSplit] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Aspect ratio sizing classes
  const aspectClass =
    aspectRatio === '9:16'
      ? 'aspect-[9/16] max-h-[68vh] w-auto'
      : aspectRatio === '1:1'
      ? 'aspect-square max-h-[68vh] w-auto'
      : 'aspect-[16/9] w-full max-h-[68vh]';

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (layoutMode === 'before_after') {
      setIsDraggingSplit(true);
      updateSplitRatio(e.clientX);
    }
  };

  const updateSplitRatio = useCallback(
    (clientX: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const relativeX = (clientX - rect.left) / rect.width;
      const clamped = Math.max(0.05, Math.min(0.95, relativeX));
      setSplitRatio(clamped);
    },
    [canvasRef, setSplitRatio]
  );

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (isDraggingSplit) {
        updateSplitRatio(e.clientX);
      }
    };

    const handlePointerUp = () => {
      if (isDraggingSplit) {
        setIsDraggingSplit(false);
      }
    };

    if (isDraggingSplit) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
    }

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isDraggingSplit, updateSplitRatio]);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative flex flex-col items-center justify-center flex-1 w-full bg-[#070a12] p-4 select-none overflow-hidden"
    >
      {/* Top Toolbar: Aspect Ratio Switcher & Status */}
      <div className="flex items-center justify-between w-full max-w-4xl px-2 py-2 mb-2 text-xs text-slate-400">
        <div className="flex items-center gap-1.5 p-1 bg-[#101726] border border-slate-800 rounded-lg">
          <button
            onClick={() => setAspectRatio('16:9')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-all ${
              aspectRatio === '16:9'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            16:9 Cinema
          </button>
          <button
            onClick={() => setAspectRatio('9:16')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-all ${
              aspectRatio === '9:16'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            9:16 Reel
          </button>
          <button
            onClick={() => setAspectRatio('1:1')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-all ${
              aspectRatio === '1:1'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Square className="w-3.5 h-3.5" />
            1:1 Post
          </button>
        </div>

        <div className="flex items-center gap-2">
          {filterPresetName && (
            <span className="hidden sm:inline-block text-xs font-mono text-slate-400 bg-slate-900/60 px-2 py-1 rounded border border-slate-800">
              LUT: {filterPresetName}
            </span>
          )}

          <button
            onClick={onSnapshot}
            title="Take High-Res Still Photo"
            className="flex items-center gap-1 px-2.5 py-1 text-slate-300 hover:text-white bg-[#101726] hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <Camera className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Photo Snap</span>
          </button>

          <button
            onClick={onResetAdjustments}
            title="Reset Filters to Default"
            className="p-1.5 text-slate-400 hover:text-white bg-[#101726] hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={toggleFullscreen}
            title="Toggle Fullscreen"
            className="p-1.5 text-slate-400 hover:text-white bg-[#101726] hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Canvas Container */}
      <div
        className={`relative flex items-center justify-center rounded-xl overflow-hidden bg-black shadow-2xl border border-slate-800/80 ${aspectClass} ${
          layoutMode === 'before_after' ? 'cursor-ew-resize' : ''
        }`}
        onPointerDown={handlePointerDown}
      >
        <canvas
          ref={canvasRef}
          width={aspectRatio === '9:16' ? 720 : aspectRatio === '1:1' ? 1080 : 1280}
          height={aspectRatio === '9:16' ? 1280 : aspectRatio === '1:1' ? 1080 : 720}
          className="w-full h-full object-contain pointer-events-none"
        />

        {/* AI Processing indicator overlay */}
        {isAiThinking && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center gap-3 text-white z-20">
            <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <div className="flex items-center gap-2 text-sm font-semibold tracking-wide">
              <Sparkles className="w-4 h-4 text-blue-400" />
              AI Studio Enhancing Media...
            </div>
          </div>
        )}
      </div>

      {layoutMode === 'before_after' && (
        <div className="mt-2 text-xs text-slate-400 flex items-center gap-2">
          <span>Drag left or right to compare Raw Original vs AI Enhanced</span>
        </div>
      )}
    </div>
  );
};
