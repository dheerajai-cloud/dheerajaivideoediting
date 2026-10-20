import React from 'react';
import {
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Layers,
} from 'lucide-react';
import { MediaItem, TimelineClip, TransitionType } from '../types';

interface TimelineTrackProps {
  clips: TimelineClip[];
  mediaMap: Map<string, MediaItem>;
  activeClipIndex: number;
  onSelectClip: (index: number) => void;
  onUpdateClipDuration: (index: number, duration: number) => void;
  onUpdateClipTransition: (index: number, trans: TransitionType) => void;
  onMoveClip: (from: number, to: number) => void;
  onDeleteClip: (index: number) => void;
  onAddMediaAsClip: (mediaId: string) => void;
  currentTime: number;
  totalDuration: number;
}

export const TimelineTrack: React.FC<TimelineTrackProps> = ({
  clips,
  mediaMap,
  activeClipIndex,
  onSelectClip,
  onUpdateClipDuration,
  onUpdateClipTransition,
  onMoveClip,
  onDeleteClip,
  onAddMediaAsClip,
  currentTime,
  totalDuration,
}) => {
  const transitionOptions: { value: TransitionType; label: string }[] = [
    { value: 'crossfade', label: 'Crossfade' },
    { value: 'zoom', label: 'Zoom Burst' },
    { value: 'slide', label: 'Slide' },
    { value: 'glitch', label: 'Beat Glitch' },
    { value: 'blur', label: 'Soft Blur' },
  ];

  // Calculate current playhead percentage
  const playheadPercent =
    totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0;

  return (
    <div className="relative w-full bg-[#080c14] border-t border-slate-800/80 p-3 select-none">
      {/* Track Header */}
      <div className="flex items-center justify-between mb-2 px-2 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Layers className="w-3.5 h-3.5 text-blue-400" />
          <span className="font-semibold text-slate-300">Video & Photo Montage Track</span>
          <span className="text-slate-500">({clips.length} clips · {totalDuration.toFixed(1)}s total)</span>
        </div>
        <span className="text-slate-500 text-[11px]">
          Tip: Adjust duration & transitions to create custom reels
        </span>
      </div>

      {/* Horizontal Clips Scroll Container */}
      <div className="relative flex items-center gap-2.5 overflow-x-auto pb-2 pt-1 px-1">
        {clips.map((clip, index) => {
          const media = mediaMap.get(clip.mediaId);
          const isActive = index === activeClipIndex;

          return (
            <div
              key={clip.id}
              onClick={() => onSelectClip(index)}
              className={`relative flex flex-col shrink-0 w-36 rounded-lg overflow-hidden border transition-all cursor-pointer group ${
                isActive
                  ? 'border-blue-500 bg-[#121c2e] shadow-lg shadow-blue-500/10 ring-1 ring-blue-500'
                  : 'border-slate-800 bg-[#0e1422] hover:border-slate-700'
              }`}
            >
              {/* Thumbnail Container */}
              <div className="relative w-full h-18 bg-black/60 overflow-hidden">
                {media && media.url ? (
                  <img
                    src={media.url}
                    alt={media.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-600 text-xs">
                    No preview
                  </div>
                )}

                {/* Clip Index badge */}
                <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-black/70 text-slate-300 backdrop-blur-xs">
                  #{index + 1}
                </div>

                {/* Move & Delete on hover */}
                <div className="absolute top-1 right-1 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  {index > 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onMoveClip(index, index - 1);
                      }}
                      className="p-1 rounded bg-black/80 hover:bg-slate-700 text-slate-300"
                      title="Move clip left"
                    >
                      <ChevronLeft className="w-3 h-3" />
                    </button>
                  )}
                  {index < clips.length - 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onMoveClip(index, index + 1);
                      }}
                      className="p-1 rounded bg-black/80 hover:bg-slate-700 text-slate-300"
                      title="Move clip right"
                    >
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  )}
                  {clips.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteClip(index);
                      }}
                      className="p-1 rounded bg-rose-950/80 hover:bg-rose-800 text-rose-300"
                      title="Remove clip"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Clip Controls: Duration & Transition */}
              <div className="p-2 flex flex-col gap-1.5 text-[11px] bg-[#0c121e]">
                {/* Duration Slider */}
                <div className="flex items-center justify-between text-slate-400">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span>Duration:</span>
                  </div>
                  <span className="font-mono text-white text-[11px]">{clip.duration}s</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="8"
                  step="0.5"
                  value={clip.duration}
                  onChange={(e) => {
                    e.stopPropagation();
                    onUpdateClipDuration(index, parseFloat(e.target.value));
                  }}
                  className="w-full h-1 bg-slate-800 rounded accent-blue-500 cursor-pointer"
                />

                {/* Transition Picker */}
                <div className="flex items-center justify-between gap-1 pt-1 border-t border-slate-800/80">
                  <span className="text-slate-500 text-[10px]">Trans:</span>
                  <select
                    value={clip.transition}
                    onChange={(e) => {
                      e.stopPropagation();
                      onUpdateClipTransition(index, e.target.value as TransitionType);
                    }}
                    className="bg-slate-900 text-slate-300 text-[10px] py-0.5 px-1 rounded border border-slate-800 outline-hidden cursor-pointer"
                  >
                    {transitionOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          );
        })}

        {/* Add from Media Library Button */}
        <div className="flex flex-col items-center justify-center shrink-0 w-28 h-32 rounded-lg border border-dashed border-slate-800 bg-[#0a0f19] hover:border-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer p-2 text-center group">
          <div className="p-2 rounded-full bg-slate-900 group-hover:bg-blue-600/20 text-slate-400 group-hover:text-blue-400 transition-colors mb-1.5">
            <Plus className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-medium leading-tight">Add Clip</span>
          <span className="text-[9px] text-slate-500 mt-0.5">from library</span>
        </div>
      </div>
    </div>
  );
};
