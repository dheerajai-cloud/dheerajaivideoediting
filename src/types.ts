export type MediaType = 'image' | 'video';

export interface MediaItem {
  id: string;
  type: MediaType;
  url: string;
  title: string;
  duration?: number; // in seconds for videos
  aspectRatio?: number;
  file?: File;
  width?: number;
  height?: number;
}

export type FilterPreset =
  | 'original'
  | 'beauty_glow'
  | 'golden_hour'
  | 'teal_orange'
  | 'noir'
  | 'vintage'
  | 'cyberpunk'
  | 'vivid'
  | 'pastel'
  | 'vhs';

export type TransitionType = 'crossfade' | 'zoom' | 'slide' | 'glitch' | 'blur' | 'none';

export type LayoutMode = 'single' | 'side_by_side' | 'before_after' | 'grid_2x2' | 'blend';

export type CanvasAspectRatio = '16:9' | '9:16' | '1:1';

export interface Adjustments {
  brightness: number; // 50 to 150 (default 100)
  contrast: number;   // 50 to 150 (default 100)
  saturation: number; // 0 to 200 (default 100)
  warmth: number;     // -50 to 50 (default 0)
  sharpness: number;  // 0 to 100 (default 0)
  vignette: number;   // 0 to 100 (default 0)
  hue: number;        // -180 to 180 (default 0)
  grain: number;      // 0 to 100 (default 0)
}

export interface BeautySettings {
  smooth: number;     // 0 to 100
  glow: number;       // 0 to 100
  warmth: number;     // -50 to 50
  eyeBrightness: number; // 0 to 100
}

export interface AudioTrack {
  id: string;
  name: string;
  genre: 'lofi' | 'beats' | 'bollywood' | 'cinematic' | 'romantic' | 'custom';
  bpm: number;
  url?: string;
  isCustom?: boolean;
  audioBuffer?: AudioBuffer;
}

export interface TimelineClip {
  id: string;
  mediaId: string;
  duration: number; // duration in seconds for this clip
  speed: number;    // 0.25 to 2.0
  transition: TransitionType;
}

export interface TextOverlay {
  text: string;
  fontSize: number;
  color: string;
  position: 'top' | 'middle' | 'bottom';
  fontFamily: string;
}

export interface DirectorAIResponse {
  explanation: string;
  suggestedTitle: string;
  actions: {
    filter?: FilterPreset;
    speed?: number;
    transition?: TransitionType;
    layout?: LayoutMode;
    musicGenre?: 'lofi' | 'beats' | 'bollywood' | 'romantic' | 'cinematic';
    beatSync?: boolean;
    beautyEnhance?: {
      smooth: number;
      glow: number;
      warmth: number;
    };
    adjustments?: Partial<Adjustments>;
    textOverlay?: string;
  };
}
