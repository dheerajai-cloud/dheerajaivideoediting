import React from 'react';
import { Download, Sparkles, Film } from 'lucide-react';

interface TopNavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenExport: () => void;
  onOpenAIDirector: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenExport,
  onOpenAIDirector,
}) => {
  return (
    <header className="flex items-center justify-between gap-8 px-6 py-3.5 bg-[#0b101b] border-b border-slate-800/80 sticky top-0 z-40 select-none">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 via-indigo-500 to-sky-400 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
          <Film className="w-4 h-4" />
        </div>
        <a href="/" className="text-base font-bold tracking-tight text-white whitespace-nowrap shrink-0 hover:text-blue-400 transition-colors">
          Lumina Cut Studio
        </a>
      </div>

      {/* Zone 2: Clean single-line text navigation links */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
        <button
          onClick={() => setActiveTab('media')}
          className={`hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'media' ? 'text-blue-400 font-semibold' : ''
          }`}
        >
          Media & Timeline
        </button>
        <button
          onClick={() => setActiveTab('beauty')}
          className={`hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'beauty' ? 'text-blue-400 font-semibold' : ''
          }`}
        >
          Face & Beauty Polish
        </button>
        <button
          onClick={() => setActiveTab('filters')}
          className={`hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'filters' ? 'text-blue-400 font-semibold' : ''
          }`}
        >
          Cinematic LUTs
        </button>
        <button
          onClick={() => setActiveTab('stitch')}
          className={`hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'stitch' ? 'text-blue-400 font-semibold' : ''
          }`}
        >
          Dual Stitch & Compare
        </button>
        <button
          onClick={() => setActiveTab('music')}
          className={`hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'music' ? 'text-blue-400 font-semibold' : ''
          }`}
        >
          Music & Beat Sync
        </button>
        <button
          onClick={onOpenAIDirector}
          className="flex items-center gap-1.5 text-sky-400 hover:text-sky-300 font-semibold transition-colors whitespace-nowrap shrink-0"
        >
          <Sparkles className="w-3.5 h-3.5" />
          AI Prompt Director
        </button>
      </nav>

      {/* Zone 3: Primary action button */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onOpenExport}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-500 active:scale-98 transition-all shadow-md shadow-blue-600/30 whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          Export HD
        </button>
      </div>
    </header>
  );
};
