import React from 'react';
import {
  Upload,
  Sparkles,
  Sliders,
  Columns,
  Music,
  Type,
  Check,
  RotateCcw,
  Volume2,
  Wand2,
} from 'lucide-react';
import {
  Adjustments,
  AudioTrack,
  BeautySettings,
  FilterPreset,
  LayoutMode,
  MediaItem,
  TextOverlay,
  TransitionType,
} from '../types';

interface SidebarTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  mediaItems: MediaItem[];
  onUploadMedia: (files: FileList) => void;
  onSelectMediaForProject: (media: MediaItem) => void;
  filterPreset: FilterPreset;
  onSelectFilterPreset: (preset: FilterPreset) => void;
  adjustments: Adjustments;
  onChangeAdjustments: (adjustments: Adjustments) => void;
  beauty: BeautySettings;
  onChangeBeauty: (beauty: BeautySettings) => void;
  layoutMode: LayoutMode;
  onChangeLayoutMode: (mode: LayoutMode) => void;
  blendOpacity: number;
  onChangeBlendOpacity: (opacity: number) => void;
  audioTracks: AudioTrack[];
  selectedAudioTrack: AudioTrack | null;
  onSelectAudioTrack: (track: AudioTrack) => void;
  onUploadCustomSong: (file: File) => void;
  beatSync: boolean;
  onToggleBeatSync: () => void;
  bpm: number;
  onChangeBpm: (bpm: number) => void;
  textOverlay: TextOverlay;
  onChangeTextOverlay: (text: TextOverlay) => void;
  globalTransition: TransitionType;
  onChangeGlobalTransition: (trans: TransitionType) => void;
}

export const SidebarTabs: React.FC<SidebarTabsProps> = ({
  activeTab,
  setActiveTab,
  mediaItems,
  onUploadMedia,
  onSelectMediaForProject,
  filterPreset,
  onSelectFilterPreset,
  adjustments,
  onChangeAdjustments,
  beauty,
  onChangeBeauty,
  layoutMode,
  onChangeLayoutMode,
  blendOpacity,
  onChangeBlendOpacity,
  audioTracks,
  selectedAudioTrack,
  onSelectAudioTrack,
  onUploadCustomSong,
  beatSync,
  onToggleBeatSync,
  bpm,
  onChangeBpm,
  textOverlay,
  onChangeTextOverlay,
  globalTransition,
  onChangeGlobalTransition,
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const songInputRef = React.useRef<HTMLInputElement>(null);

  const tabs = [
    { id: 'media', label: 'Media', icon: Upload },
    { id: 'beauty', label: 'Beauty', icon: Wand2 },
    { id: 'filters', label: 'Filters', icon: Sliders },
    { id: 'stitch', label: 'Stitch & Collage', icon: Columns },
    { id: 'music', label: 'Music', icon: Music },
    { id: 'text', label: 'Text & Motion', icon: Type },
  ];

  const filterCards: { id: FilterPreset; title: string; desc: string; gradient: string }[] = [
    { id: 'original', title: 'Original Raw', desc: 'Natural balanced neutral', gradient: 'from-slate-700 to-slate-900' },
    { id: 'beauty_glow', title: 'Beauty Glow', desc: 'Smooth skin & radiant bloom', gradient: 'from-rose-500/80 to-amber-500/80' },
    { id: 'golden_hour', title: 'Golden Hour', desc: 'Warm sunset amber illumination', gradient: 'from-amber-500 to-orange-700' },
    { id: 'teal_orange', title: 'Teal & Orange', desc: 'High-contrast Hollywood grading', gradient: 'from-cyan-600 to-amber-600' },
    { id: 'noir', title: 'Noir Luxe', desc: 'Deep monochrome cinema shadows', gradient: 'from-zinc-900 via-neutral-600 to-zinc-950' },
    { id: 'vintage', title: '35mm Vintage', desc: 'Organic film grain & soft tones', gradient: 'from-yellow-800 to-stone-900' },
    { id: 'cyberpunk', title: 'Cyberpunk Neon', desc: 'Electric magenta & cyan punch', gradient: 'from-fuchsia-600 to-blue-600' },
    { id: 'vivid', title: 'Vivid HDR', desc: 'Punchy saturation & edge sharpness', gradient: 'from-emerald-500 to-sky-600' },
    { id: 'pastel', title: 'Pastel Dream', desc: 'Soft luminous low-contrast aesthetic', gradient: 'from-pink-400 to-indigo-400' },
    { id: 'vhs', title: 'Retro VHS', desc: '90s camcorder retro analog look', gradient: 'from-violet-700 to-red-800' },
  ];

  return (
    <aside className="flex flex-col w-full md:w-80 lg:w-96 bg-[#0a0e18] border-r border-slate-800/80 h-full overflow-hidden shrink-0 select-none">
      {/* Tab Navigation Icons Bar */}
      <div className="flex items-center justify-between border-b border-slate-800/80 bg-[#080c14] px-2 py-1.5 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                isActive
                  ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="text-[10px]">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content Panels */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* TAB 1: MEDIA LIBRARY & UPLOAD */}
        {activeTab === 'media' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Media Library</h3>
              <p className="text-xs text-slate-400 mt-0.5">Upload your own videos and images, or use demo assets</p>
            </div>

            {/* Upload Action Card */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-800 hover:border-blue-500/50 bg-[#0c1220] rounded-xl text-center cursor-pointer group transition-all"
            >
              <div className="w-10 h-10 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <Upload className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-slate-200">Upload Photos or Video</span>
              <span className="text-[11px] text-slate-500 mt-0.5">PNG, JPG, WEBP, MP4, MOV (Multiple files supported)</span>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={(e) => e.target.files && onUploadMedia(e.target.files)}
                className="hidden"
              />
            </div>

            {/* Media Items Grid */}
            <div className="space-y-2">
              <span className="text-xs font-medium text-slate-400">Available Assets ({mediaItems.length})</span>
              <div className="grid grid-cols-2 gap-2">
                {mediaItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => onSelectMediaForProject(item)}
                    className="relative group rounded-lg overflow-hidden border border-slate-800 hover:border-blue-500 bg-slate-900/60 aspect-4/3 cursor-pointer transition-all"
                  >
                    <img
                      src={item.url}
                      alt={item.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-1.5 opacity-90">
                      <span className="text-[11px] font-medium text-white truncate">{item.title}</span>
                    </div>
                    <div className="absolute top-1 right-1 px-1 py-0.5 rounded text-[9px] font-mono bg-black/70 text-slate-300">
                      {item.type.toUpperCase()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: BEAUTY & FACE POLISH */}
        {activeTab === 'beauty' && (
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-1.5">
                <Wand2 className="w-4 h-4 text-rose-400" />
                <h3 className="text-sm font-semibold text-white">Face & Beauty Polish</h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Edge-preserving skin smoothing and radiant bloom for natural portraits.
              </p>
            </div>

            {/* Quick Beauty Presets */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onChangeBeauty({ smooth: 60, glow: 50, warmth: 15, eyeBrightness: 30 })}
                className="p-2.5 text-left rounded-lg bg-[#0e1626] border border-slate-800 hover:border-rose-500/50 transition-colors cursor-pointer"
              >
                <div className="text-xs font-semibold text-white">Glamour Glow</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Smooth skin & radiance</div>
              </button>
              <button
                onClick={() => onChangeBeauty({ smooth: 35, glow: 25, warmth: 0, eyeBrightness: 20 })}
                className="p-2.5 text-left rounded-lg bg-[#0e1626] border border-slate-800 hover:border-rose-500/50 transition-colors cursor-pointer"
              >
                <div className="text-xs font-semibold text-white">Natural Subtle</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Light blemish touchup</div>
              </button>
              <button
                onClick={() => onChangeBeauty({ smooth: 50, glow: 40, warmth: 30, eyeBrightness: 25 })}
                className="p-2.5 text-left rounded-lg bg-[#0e1626] border border-slate-800 hover:border-rose-500/50 transition-colors cursor-pointer"
              >
                <div className="text-xs font-semibold text-white">Sun-Kissed Warmth</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Golden hour skin tone</div>
              </button>
              <button
                onClick={() => onChangeBeauty({ smooth: 0, glow: 0, warmth: 0, eyeBrightness: 0 })}
                className="p-2.5 text-left rounded-lg bg-[#0e1626] border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer"
              >
                <div className="text-xs font-semibold text-slate-300">Reset Raw</div>
                <div className="text-[10px] text-slate-500 mt-0.5">No beauty filters</div>
              </button>
            </div>

            {/* Sliders */}
            <div className="space-y-3.5 pt-2 border-t border-slate-800/80">
              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>Skin Smoothing (Blemish softening)</span>
                  <span className="font-mono text-rose-400">{beauty.smooth}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={beauty.smooth}
                  onChange={(e) => onChangeBeauty({ ...beauty, smooth: parseInt(e.target.value, 10) })}
                  className="w-full h-1.5 bg-slate-800 rounded accent-rose-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>Radiance Bloom & Glow</span>
                  <span className="font-mono text-amber-400">{beauty.glow}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={beauty.glow}
                  onChange={(e) => onChangeBeauty({ ...beauty, glow: parseInt(e.target.value, 10) })}
                  className="w-full h-1.5 bg-slate-800 rounded accent-amber-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>Skin Warmth Undertone</span>
                  <span className="font-mono text-orange-400">{beauty.warmth}</span>
                </div>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  value={beauty.warmth}
                  onChange={(e) => onChangeBeauty({ ...beauty, warmth: parseInt(e.target.value, 10) })}
                  className="w-full h-1.5 bg-slate-800 rounded accent-orange-500 cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: CINEMATIC LUTS & PRO ADJUSTMENTS */}
        {activeTab === 'filters' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Cinematic LUTs</h3>
              <p className="text-xs text-slate-400 mt-0.5">Color grading presets crafted for mood and aesthetics</p>
            </div>

            {/* Presets list */}
            <div className="grid grid-cols-2 gap-2">
              {filterCards.map((card) => {
                const isSelected = filterPreset === card.id;
                return (
                  <button
                    key={card.id}
                    onClick={() => onSelectFilterPreset(card.id)}
                    className={`relative p-2.5 rounded-lg border text-left transition-all cursor-pointer overflow-hidden ${
                      isSelected
                        ? 'border-blue-500 bg-[#121c2e] ring-1 ring-blue-500'
                        : 'border-slate-800 bg-[#0e1422] hover:border-slate-700'
                    }`}
                  >
                    <div className={`h-8 rounded bg-gradient-to-r ${card.gradient} mb-2 shadow-inner`} />
                    <div className="text-xs font-semibold text-white truncate">{card.title}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{card.desc}</div>
                    {isSelected && (
                      <div className="absolute top-2 right-2 p-0.5 rounded-full bg-blue-500 text-white">
                        <Check className="w-2.5 h-2.5" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Pro Manual Sliders */}
            <div className="space-y-3 pt-3 border-t border-slate-800/80">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">Fine Adjustments</span>
                <button
                  onClick={() =>
                    onChangeAdjustments({
                      brightness: 100,
                      contrast: 100,
                      saturation: 100,
                      warmth: 0,
                      sharpness: 0,
                      vignette: 0,
                      hue: 0,
                      grain: 0,
                    })
                  }
                  className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset
                </button>
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Brightness</span>
                  <span className="font-mono text-slate-200">{adjustments.brightness}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="150"
                  value={adjustments.brightness}
                  onChange={(e) =>
                    onChangeAdjustments({ ...adjustments, brightness: parseInt(e.target.value, 10) })
                  }
                  className="w-full h-1 bg-slate-800 rounded accent-blue-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Contrast</span>
                  <span className="font-mono text-slate-200">{adjustments.contrast}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="150"
                  value={adjustments.contrast}
                  onChange={(e) =>
                    onChangeAdjustments({ ...adjustments, contrast: parseInt(e.target.value, 10) })
                  }
                  className="w-full h-1 bg-slate-800 rounded accent-blue-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Saturation</span>
                  <span className="font-mono text-slate-200">{adjustments.saturation}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={adjustments.saturation}
                  onChange={(e) =>
                    onChangeAdjustments({ ...adjustments, saturation: parseInt(e.target.value, 10) })
                  }
                  className="w-full h-1 bg-slate-800 rounded accent-blue-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Vignette Edge Shadow</span>
                  <span className="font-mono text-slate-200">{adjustments.vignette}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={adjustments.vignette}
                  onChange={(e) =>
                    onChangeAdjustments({ ...adjustments, vignette: parseInt(e.target.value, 10) })
                  }
                  className="w-full h-1 bg-slate-800 rounded accent-blue-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Film Grain Texture</span>
                  <span className="font-mono text-slate-200">{adjustments.grain}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={adjustments.grain}
                  onChange={(e) =>
                    onChangeAdjustments({ ...adjustments, grain: parseInt(e.target.value, 10) })
                  }
                  className="w-full h-1 bg-slate-800 rounded accent-blue-500 cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: DUAL STITCH & COLLAGE */}
        {activeTab === 'stitch' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Stitch & Multi-Image Collage</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Join two or more photos side-by-side, interactive before/after comparison, or blend
              </p>
            </div>

            <div className="space-y-2">
              {[
                { id: 'single', title: 'Single Frame View', desc: 'Standard sequential timeline video/photo' },
                { id: 'side_by_side', title: 'Side-by-Side 50/50', desc: 'Stitch two photos together into one split frame' },
                { id: 'before_after', title: 'Interactive Before / After', desc: 'Interactive comparison slider with divider handle' },
                { id: 'grid_2x2', title: '2x2 Quad Grid', desc: 'Collage 4 photos into a 4-quadrant layout' },
                { id: 'blend', title: 'Double Exposure Blend', desc: 'Layer two photos on top with artistic overlay' },
              ].map((mode) => {
                const isSelected = layoutMode === mode.id;
                return (
                  <button
                    key={mode.id}
                    onClick={() => onChangeLayoutMode(mode.id as LayoutMode)}
                    className={`w-full p-3 rounded-lg border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-blue-500 bg-[#121c2e] ring-1 ring-blue-500'
                        : 'border-slate-800 bg-[#0e1422] hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-white">{mode.title}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-blue-400" />}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">{mode.desc}</div>
                  </button>
                );
              })}
            </div>

            {layoutMode === 'blend' && (
              <div className="pt-2">
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Blend Layer Opacity</span>
                  <span className="font-mono text-blue-400">{Math.round(blendOpacity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={blendOpacity}
                  onChange={(e) => onChangeBlendOpacity(parseFloat(e.target.value))}
                  className="w-full h-1 bg-slate-800 rounded accent-blue-500 cursor-pointer"
                />
              </div>
            )}
          </div>
        )}

        {/* TAB 5: MUSIC & BEAT SYNC */}
        {activeTab === 'music' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Soundtrack & Beat Sync</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Add trending background music or upload your own song with beat synchronization
              </p>
            </div>

            {/* Custom Song Upload Card */}
            <div
              onClick={() => songInputRef.current?.click()}
              className="flex items-center gap-3 p-3 border border-dashed border-slate-800 hover:border-blue-500 bg-[#0c1220] rounded-lg cursor-pointer transition-all"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center shrink-0">
                <Upload className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="text-xs font-semibold text-white">Upload Your Song</div>
                <div className="text-[10px] text-slate-400">MP3, WAV, AAC, M4A</div>
              </div>
              <input
                ref={songInputRef}
                type="file"
                accept="audio/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) onUploadCustomSong(file);
                }}
                className="hidden"
              />
            </div>

            {/* Beat Sync Switch */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-[#0e1626] border border-slate-800">
              <div>
                <div className="text-xs font-semibold text-white">Beat-Sync Transition</div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Cut and pulse frames on musical rhythm
                </div>
              </div>
              <button
                onClick={onToggleBeatSync}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                  beatSync ? 'bg-blue-600' : 'bg-slate-800'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    beatSync ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* BPM Adjuster */}
            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>Rhythm Tempo (BPM)</span>
                <span className="font-mono text-blue-400">{bpm} BPM</span>
              </div>
              <input
                type="range"
                min="70"
                max="160"
                value={bpm}
                onChange={(e) => onChangeBpm(parseInt(e.target.value, 10))}
                className="w-full h-1 bg-slate-800 rounded accent-blue-500 cursor-pointer"
              />
            </div>

            {/* Preset Soundtracks */}
            <div className="space-y-1.5 pt-2">
              <span className="text-xs font-medium text-slate-400">Studio Royalty-Free Soundtracks</span>
              <div className="space-y-1.5">
                {audioTracks.map((track) => {
                  const isSelected = selectedAudioTrack?.id === track.id;
                  return (
                    <button
                      key={track.id}
                      onClick={() => onSelectAudioTrack(track)}
                      className={`w-full flex items-center justify-between p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'border-blue-500 bg-[#121c2e] ring-1 ring-blue-500'
                          : 'border-slate-800 bg-[#0e1422] hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                            isSelected ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          <Music className="w-3.5 h-3.5" />
                        </div>
                        <div className="truncate">
                          <div className="text-xs font-semibold text-white truncate">{track.name}</div>
                          <div className="text-[10px] text-slate-400">
                            {track.bpm} BPM · {track.genre.toUpperCase()}
                          </div>
                        </div>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-blue-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: TEXT OVERLAY & MOTION */}
        {activeTab === 'text' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Title & Video Motion</h3>
              <p className="text-xs text-slate-400 mt-0.5">Add stylish text captions and choose global animation</p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Caption Text</label>
                <input
                  type="text"
                  placeholder="e.g. Golden Memories 2026"
                  value={textOverlay.text}
                  onChange={(e) => onChangeTextOverlay({ ...textOverlay, text: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:border-blue-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Text Position</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['top', 'middle', 'bottom'] as const).map((pos) => (
                    <button
                      key={pos}
                      onClick={() => onChangeTextOverlay({ ...textOverlay, position: pos })}
                      className={`py-1.5 text-xs rounded-lg border capitalize cursor-pointer ${
                        textOverlay.position === pos
                          ? 'border-blue-500 bg-blue-600/20 text-white font-medium'
                          : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
                      }`}
                    >
                      {pos}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Default Transition</label>
                <select
                  value={globalTransition}
                  onChange={(e) => onChangeGlobalTransition(e.target.value as TransitionType)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white outline-hidden cursor-pointer"
                >
                  <option value="crossfade">Crossfade (Smooth dissolved blend)</option>
                  <option value="zoom">Zoom Burst (Ken Burns camera push)</option>
                  <option value="slide">Slide Left (Clean motion wipe)</option>
                  <option value="glitch">Beat Glitch (Dynamic RGB flash)</option>
                  <option value="blur">Soft Blur Dissolve</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
