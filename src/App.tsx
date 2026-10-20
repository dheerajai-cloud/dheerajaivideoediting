/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Adjustments,
  AudioTrack,
  BeautySettings,
  CanvasAspectRatio,
  DirectorAIResponse,
  FilterPreset,
  LayoutMode,
  MediaItem,
  TextOverlay,
  TimelineClip,
  TransitionType,
} from './types';
import { audioEngine, DEFAULT_AUDIO_TRACKS } from './utils/audioEngine';
import { renderCanvasFrame, RenderState, exportHighResImage } from './utils/canvasRenderer';
import { TopNavbar } from './components/TopNavbar';
import { CanvasViewport } from './components/CanvasViewport';
import { PlaybackControls } from './components/PlaybackControls';
import { TimelineTrack } from './components/TimelineTrack';
import { SidebarTabs } from './components/SidebarTabs';
import { AIDirectorModal } from './components/AIDirectorModal';
import { ExportModal } from './components/ExportModal';

// Pre-generated High-Fidelity Demo Assets
const INITIAL_DEMO_MEDIA: MediaItem[] = [
  {
    id: 'demo-1',
    type: 'image',
    url: '/src/assets/images/portrait_model_1792481536565.jpg',
    title: 'Model Editorial Portrait',
  },
  {
    id: 'demo-2',
    type: 'image',
    url: '/src/assets/images/scenic_sunset_1792481536222.jpg',
    title: 'Golden Sunset Himalaya',
  },
  {
    id: 'demo-3',
    type: 'image',
    url: '/src/assets/images/urban_portrait_1792481536228.jpg',
    title: 'Urban Candid Street',
  },
];

const INITIAL_CLIPS: TimelineClip[] = [
  {
    id: 'clip-1',
    mediaId: 'demo-1',
    duration: 3.5,
    speed: 1.0,
    transition: 'crossfade',
  },
  {
    id: 'clip-2',
    mediaId: 'demo-2',
    duration: 3.5,
    speed: 1.0,
    transition: 'zoom',
  },
  {
    id: 'clip-3',
    mediaId: 'demo-3',
    duration: 3.5,
    speed: 1.0,
    transition: 'slide',
  },
];

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Studio Media & Clips State
  const [mediaItems, setMediaItems] = useState<MediaItem[]>(INITIAL_DEMO_MEDIA);
  const [mediaDomMap, setMediaDomMap] = useState<Map<string, HTMLImageElement | HTMLVideoElement>>(new Map());
  const [clips, setClips] = useState<TimelineClip[]>(INITIAL_CLIPS);
  const [activeClipIndex, setActiveClipIndex] = useState(0);

  // Playback & Timing
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [speed, setSpeed] = useState(1.0);
  const [volume, setVolume] = useState(0.8);
  const [aspectRatio, setAspectRatio] = useState<CanvasAspectRatio>('16:9');

  // Multi-Image & Stitching Layout
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('single');
  const [splitRatio, setSplitRatio] = useState(0.5);
  const [blendOpacity, setBlendOpacity] = useState(0.5);

  // Filters & Adjustments
  const [filterPreset, setFilterPreset] = useState<FilterPreset>('original');
  const [adjustments, setAdjustments] = useState<Adjustments>({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    warmth: 0,
    sharpness: 0,
    vignette: 0,
    hue: 0,
    grain: 0,
  });

  // Face & Beauty Settings
  const [beauty, setBeauty] = useState<BeautySettings>({
    smooth: 40,
    glow: 30,
    warmth: 10,
    eyeBrightness: 25,
  });

  // Music & Audio Track
  const [audioTracks, setAudioTracks] = useState<AudioTrack[]>(DEFAULT_AUDIO_TRACKS);
  const [selectedAudioTrack, setSelectedAudioTrack] = useState<AudioTrack | null>(DEFAULT_AUDIO_TRACKS[0]);
  const [beatSync, setBeatSync] = useState(true);
  const [bpm, setBpm] = useState(85);

  // Text & Title Overlay
  const [textOverlay, setTextOverlay] = useState<TextOverlay>({
    text: '',
    fontSize: 42,
    color: '#ffffff',
    position: 'bottom',
    fontFamily: 'Plus Jakarta Sans',
  });
  const [globalTransition, setGlobalTransition] = useState<TransitionType>('crossfade');

  // UI Modals & Active Tab
  const [activeTab, setActiveTab] = useState('media');
  const [isAIDirectorOpen, setIsAIDirectorOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Preload Image and Video Elements into DOM Map
  useEffect(() => {
    const newMap = new Map<string, HTMLImageElement | HTMLVideoElement>();

    mediaItems.forEach((item) => {
      if (item.type === 'video') {
        const vid = document.createElement('video');
        vid.src = item.url;
        vid.crossOrigin = 'anonymous';
        vid.muted = true;
        vid.playsInline = true;
        vid.loop = true;
        vid.load();
        newMap.set(item.id, vid);
      } else {
        const img = new Image();
        img.src = item.url;
        img.crossOrigin = 'anonymous';
        newMap.set(item.id, img);
      }
    });

    setMediaDomMap(newMap);
  }, [mediaItems]);

  // Compute total duration of project
  const totalDuration = clips.reduce((sum, c) => sum + (c.duration || 3), 0);

  // Sync Audio Volume
  useEffect(() => {
    audioEngine.setVolume(volume);
  }, [volume]);

  // Start or Stop Audio on isPlaying
  useEffect(() => {
    if (isPlaying) {
      if (selectedAudioTrack) {
        audioEngine.play(selectedAudioTrack, currentTime);
      }
    } else {
      audioEngine.stop();
    }
  }, [isPlaying, selectedAudioTrack]);

  // Animation & Rendering Loop
  useEffect(() => {
    let animationFrameId: number;
    let lastTimestamp = performance.now();

    const loop = (timestamp: number) => {
      const delta = (timestamp - lastTimestamp) / 1000;
      lastTimestamp = timestamp;

      if (isPlaying && totalDuration > 0) {
        setCurrentTime((prev) => {
          const next = prev + delta * speed;
          if (next >= totalDuration) {
            // Loop from start
            return 0;
          }
          return next;
        });
      }

      // Render Frame on Canvas
      if (canvasRef.current) {
        const renderState: RenderState = {
          currentTime,
          totalDuration,
          clips,
          mediaItems: mediaDomMap,
          layoutMode,
          aspectRatio,
          filterPreset,
          adjustments,
          beauty,
          splitRatio,
          blendOpacity,
          textOverlay,
          beatSync,
          bpm,
          speed,
        };

        renderCanvasFrame(canvasRef.current, renderState);
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [
    isPlaying,
    currentTime,
    totalDuration,
    speed,
    clips,
    mediaDomMap,
    layoutMode,
    aspectRatio,
    filterPreset,
    adjustments,
    beauty,
    splitRatio,
    blendOpacity,
    textOverlay,
    beatSync,
    bpm,
  ]);

  // Spacebar toggle shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && (e.target as HTMLElement).tagName !== 'INPUT' && (e.target as HTMLElement).tagName !== 'TEXTAREA') {
        e.preventDefault();
        setIsPlaying((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Upload Custom Media Files
  const handleUploadMedia = (files: FileList) => {
    const newItems: MediaItem[] = [];
    const newClips: TimelineClip[] = [];

    Array.from(files).forEach((file, idx) => {
      const isVideo = file.type.startsWith('video');
      const url = URL.createObjectURL(file);
      const id = `upload-${Date.now()}-${idx}`;

      const item: MediaItem = {
        id,
        type: isVideo ? 'video' : 'image',
        url,
        title: file.name,
        file,
      };

      newItems.push(item);
      newClips.push({
        id: `clip-${Date.now()}-${idx}`,
        mediaId: id,
        duration: 3.5,
        speed: 1.0,
        transition: globalTransition,
      });
    });

    setMediaItems((prev) => [...newItems, ...prev]);
    setClips((prev) => [...prev, ...newClips]);
    showToast(`Uploaded ${newItems.length} media file(s)`);
  };

  // Add an item from library into timeline
  const handleSelectMediaForProject = (item: MediaItem) => {
    const newClip: TimelineClip = {
      id: `clip-${Date.now()}`,
      mediaId: item.id,
      duration: 3.5,
      speed: 1.0,
      transition: globalTransition,
    };
    setClips((prev) => [...prev, newClip]);
    showToast(`Added "${item.title}" to video timeline`);
  };

  // Upload custom song
  const handleUploadCustomSong = async (file: File) => {
    try {
      const buffer = await audioEngine.decodeAudioFile(file);
      const customTrack: AudioTrack = {
        id: `custom-song-${Date.now()}`,
        name: file.name.replace(/\.[^/.]+$/, ''),
        genre: 'custom',
        bpm: 110,
        isCustom: true,
        audioBuffer: buffer,
      };

      setAudioTracks((prev) => [customTrack, ...prev]);
      setSelectedAudioTrack(customTrack);
      showToast(`Loaded audio: "${customTrack.name}"`);
    } catch (err) {
      console.error(err);
      showToast('Could not decode audio file');
    }
  };

  // Handle AI Director Recommendations
  const handleApplyDirectorActions = (actions: DirectorAIResponse['actions']) => {
    if (actions.filter) {
      setFilterPreset(actions.filter);
    }
    if (actions.speed !== undefined) {
      setSpeed(actions.speed);
    }
    if (actions.layout) {
      setLayoutMode(actions.layout);
    }
    if (actions.transition) {
      setGlobalTransition(actions.transition);
      setClips((prev) => prev.map((c) => ({ ...c, transition: actions.transition! })));
    }
    if (actions.beautyEnhance) {
      setBeauty((prev) => ({
        ...prev,
        smooth: actions.beautyEnhance!.smooth ?? prev.smooth,
        glow: actions.beautyEnhance!.glow ?? prev.glow,
        warmth: actions.beautyEnhance!.warmth ?? prev.warmth,
      }));
    }
    if (actions.adjustments) {
      setAdjustments((prev) => ({
        ...prev,
        ...actions.adjustments,
      }));
    }
    if (actions.musicGenre) {
      const matchingTrack = audioTracks.find((t) => t.genre === actions.musicGenre);
      if (matchingTrack) {
        setSelectedAudioTrack(matchingTrack);
        setBpm(matchingTrack.bpm);
      }
    }
    if (actions.beatSync !== undefined) {
      setBeatSync(actions.beatSync);
    }
    if (actions.textOverlay) {
      setTextOverlay((prev) => ({ ...prev, text: actions.textOverlay! }));
    }

    showToast('AI Director settings applied successfully!');
  };

  // Snapshot Current High-Res Frame
  const handleSnapshot = async () => {
    const renderState: RenderState = {
      currentTime,
      totalDuration,
      clips,
      mediaItems: mediaDomMap,
      layoutMode,
      aspectRatio,
      filterPreset,
      adjustments,
      beauty,
      splitRatio,
      blendOpacity,
      textOverlay,
      beatSync,
      bpm,
      speed,
    };

    const w = aspectRatio === '9:16' ? 1080 : aspectRatio === '1:1' ? 1440 : 1920;
    const h = aspectRatio === '9:16' ? 1920 : aspectRatio === '1:1' ? 1440 : 1080;
    const blob = await exportHighResImage(renderState, w, h);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lumina_still_${Date.now()}.png`;
    a.click();
    showToast('High-Res Still Image saved!');
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  // Build current RenderState object for export modal
  const currentRenderState: RenderState = {
    currentTime,
    totalDuration,
    clips,
    mediaItems: mediaDomMap,
    layoutMode,
    aspectRatio,
    filterPreset,
    adjustments,
    beauty,
    splitRatio,
    blendOpacity,
    textOverlay,
    beatSync,
    bpm,
    speed,
  };

  const mediaMap = new Map(mediaItems.map((item) => [item.id, item]));

  return (
    <div className="flex flex-col h-screen w-screen bg-[#080c14] text-slate-100 overflow-hidden font-sans">
      {/* Top Bar Contract (Wordmark, Nav Links, Primary CTA) */}
      <TopNavbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenExport={() => setIsExportOpen(true)}
        onOpenAIDirector={() => setIsAIDirectorOpen(true)}
      />

      {/* Main Studio Work Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Center: Video/Photo Canvas Viewport & Playback Controls */}
        <main className="flex flex-col flex-1 h-full min-w-0 bg-[#070a12] overflow-hidden">
          {/* Canvas Viewport */}
          <CanvasViewport
            canvasRef={canvasRef}
            aspectRatio={aspectRatio}
            setAspectRatio={setAspectRatio}
            layoutMode={layoutMode}
            splitRatio={splitRatio}
            setSplitRatio={setSplitRatio}
            filterPresetName={filterPreset}
            onSnapshot={handleSnapshot}
            onResetAdjustments={() => {
              setFilterPreset('original');
              setAdjustments({
                brightness: 100,
                contrast: 100,
                saturation: 100,
                warmth: 0,
                sharpness: 0,
                vignette: 0,
                hue: 0,
                grain: 0,
              });
              setBeauty({ smooth: 0, glow: 0, warmth: 0, eyeBrightness: 0 });
              showToast('Filters reset to Raw');
            }}
          />

          {/* Playback Controls Directly under Viewport */}
          <PlaybackControls
            isPlaying={isPlaying}
            onTogglePlay={() => setIsPlaying(!isPlaying)}
            currentTime={currentTime}
            totalDuration={totalDuration}
            onSeek={(t) => setCurrentTime(t)}
            speed={speed}
            onChangeSpeed={(s) => setSpeed(s)}
            volume={volume}
            onChangeVolume={(v) => setVolume(v)}
            beatSync={beatSync}
            onToggleBeatSync={() => setBeatSync(!beatSync)}
            bpm={bpm}
          />

          {/* Bottom Timeline Clips Track */}
          <TimelineTrack
            clips={clips}
            mediaMap={mediaMap}
            activeClipIndex={activeClipIndex}
            onSelectClip={(idx) => {
              setActiveClipIndex(idx);
              // Seek to start of selected clip
              let seekTo = 0;
              for (let i = 0; i < idx; i++) {
                seekTo += clips[i].duration;
              }
              setCurrentTime(seekTo);
            }}
            onUpdateClipDuration={(idx, dur) => {
              setClips((prev) =>
                prev.map((c, i) => (i === idx ? { ...c, duration: dur } : c))
              );
            }}
            onUpdateClipTransition={(idx, trans) => {
              setClips((prev) =>
                prev.map((c, i) => (i === idx ? { ...c, transition: trans } : c))
              );
            }}
            onMoveClip={(from, to) => {
              setClips((prev) => {
                const next = [...prev];
                const [moved] = next.splice(from, 1);
                next.splice(to, 0, moved);
                return next;
              });
            }}
            onDeleteClip={(idx) => {
              setClips((prev) => prev.filter((_, i) => i !== idx));
              if (activeClipIndex >= idx && activeClipIndex > 0) {
                setActiveClipIndex((prev) => prev - 1);
              }
            }}
            onAddMediaAsClip={(mediaId) => {
              const item = mediaItems.find((m) => m.id === mediaId);
              if (item) handleSelectMediaForProject(item);
            }}
            currentTime={currentTime}
            totalDuration={totalDuration}
          />
        </main>

        {/* Right Sidebar: Tabs for Media, Beauty, Filters, Stitching, Music, Text */}
        <SidebarTabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          mediaItems={mediaItems}
          onUploadMedia={handleUploadMedia}
          onSelectMediaForProject={handleSelectMediaForProject}
          filterPreset={filterPreset}
          onSelectFilterPreset={(preset) => {
            setFilterPreset(preset);
            showToast(`Preset: ${preset.replace('_', ' ')}`);
          }}
          adjustments={adjustments}
          onChangeAdjustments={setAdjustments}
          beauty={beauty}
          onChangeBeauty={setBeauty}
          layoutMode={layoutMode}
          onChangeLayoutMode={(mode) => {
            setLayoutMode(mode);
            showToast(`Layout: ${mode.replace('_', ' ')}`);
          }}
          blendOpacity={blendOpacity}
          onChangeBlendOpacity={setBlendOpacity}
          audioTracks={audioTracks}
          selectedAudioTrack={selectedAudioTrack}
          onSelectAudioTrack={(t) => {
            setSelectedAudioTrack(t);
            setBpm(t.bpm);
            showToast(`Track: ${t.name}`);
          }}
          onUploadCustomSong={handleUploadCustomSong}
          beatSync={beatSync}
          onToggleBeatSync={() => setBeatSync(!beatSync)}
          bpm={bpm}
          onChangeBpm={setBpm}
          textOverlay={textOverlay}
          onChangeTextOverlay={setTextOverlay}
          globalTransition={globalTransition}
          onChangeGlobalTransition={(trans) => {
            setGlobalTransition(trans);
            setClips((prev) => prev.map((c) => ({ ...c, transition: trans })));
            showToast(`Transition set to ${trans}`);
          }}
        />
      </div>

      {/* AI Director Prompt Modal (Hindi / English / Voice / Text) */}
      <AIDirectorModal
        isOpen={isAIDirectorOpen}
        onClose={() => setIsAIDirectorOpen(false)}
        onApplyDirectorActions={handleApplyDirectorActions}
        mediaCount={mediaItems.length}
      />

      {/* HD Video & Still Image Export Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        renderState={currentRenderState}
      />

      {/* Minimal Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2 bg-slate-900 border border-slate-700 text-white text-xs font-medium rounded-lg shadow-xl shadow-black/50 animate-fade-in pointer-events-none">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
