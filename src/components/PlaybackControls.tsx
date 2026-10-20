import React from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Gauge,
  Music2,
} from 'lucide-react';

interface PlaybackControlsProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  currentTime: number;
  totalDuration: number;
  onSeek: (time: number) => void;
  speed: number;
  onChangeSpeed: (speed: number) => void;
  volume: number;
  onChangeVolume: (vol: number) => void;
  beatSync: boolean;
  onToggleBeatSync: () => void;
  bpm: number;
}

export const PlaybackControls: React.FC<PlaybackControlsProps> = ({
  isPlaying,
  onTogglePlay,
  currentTime,
  totalDuration,
  onSeek,
  speed,
  onChangeSpeed,
  volume,
  onChangeVolume,
  beatSync,
  onToggleBeatSync,
  bpm,
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 10);
    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}.${ms}`;
  };

  const speedOptions = [0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 2.0];

  return (
    <div className="flex flex-col gap-2 w-full px-6 py-2.5 bg-[#0b101b] border-t border-slate-800/80 select-none">
      {/* Seekbar with Beat Ticks */}
      <div className="relative flex items-center w-full group">
        <input
          type="range"
          min="0"
          max={Math.max(1, totalDuration)}
          step="0.05"
          value={currentTime}
          onChange={(e) => onSeek(parseFloat(e.target.value))}
          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:h-2 transition-all"
        />
      </div>

      {/* Control Buttons & Counters */}
      <div className="flex items-center justify-between gap-4 text-xs text-slate-300">
        {/* Left: Playback Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={onTogglePlay}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-500 active:scale-95 text-white transition-all shadow-md shadow-blue-600/30 cursor-pointer"
            title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </button>

          <button
            onClick={() => onSeek(0)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            title="Restart from beginning"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Timecode */}
          <div className="font-mono text-xs text-slate-300 tabular-nums">
            <span className="text-white font-medium">{formatTime(currentTime)}</span>
            <span className="text-slate-500"> / </span>
            <span className="text-slate-400">{formatTime(totalDuration)}</span>
          </div>
        </div>

        {/* Center: Beat Sync Quick Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleBeatSync}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
              beatSync
                ? 'bg-blue-600/20 text-blue-400 border-blue-500/40 shadow-sm'
                : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
            title="Auto-synchronize image transitions and subtle pulse on musical beats"
          >
            <Music2 className="w-3.5 h-3.5" />
            <span>Beat Sync: {beatSync ? `${bpm} BPM (ON)` : 'OFF'}</span>
          </button>
        </div>

        {/* Right: Speed & Volume */}
        <div className="flex items-center gap-4">
          {/* Speed Selector */}
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1">
            <Gauge className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={speed}
              onChange={(e) => onChangeSpeed(parseFloat(e.target.value))}
              className="bg-transparent text-slate-200 text-xs font-mono outline-hidden cursor-pointer"
              title="Playback speed (Slow Motion to Fast)"
            >
              {speedOptions.map((opt) => (
                <option key={opt} value={opt} className="bg-slate-900 text-slate-200">
                  {opt === 0.25
                    ? '0.25x (Super SlowMo)'
                    : opt === 0.5
                    ? '0.5x (SlowMo)'
                    : opt === 1.0
                    ? '1.0x (Normal)'
                    : `${opt}x`}
                </option>
              ))}
            </select>
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onChangeVolume(volume > 0 ? 0 : 0.8)}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              title={volume === 0 ? 'Unmute' : 'Mute'}
            >
              {volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => onChangeVolume(parseFloat(e.target.value))}
              className="w-16 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
