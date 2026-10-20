import { Adjustments, BeautySettings, FilterPreset, LayoutMode, MediaItem, TimelineClip, TransitionType } from '../types';
import { audioEngine } from './audioEngine';

export interface RenderState {
  currentTime: number;
  totalDuration: number;
  clips: TimelineClip[];
  mediaItems: Map<string, HTMLImageElement | HTMLVideoElement>;
  layoutMode: LayoutMode;
  aspectRatio: '16:9' | '9:16' | '1:1';
  filterPreset: FilterPreset;
  adjustments: Adjustments;
  beauty: BeautySettings;
  splitRatio: number; // 0 to 1 for before/after slider
  blendOpacity: number;
  textOverlay?: { text: string; fontSize: number; color: string; position: 'top' | 'middle' | 'bottom' };
  beatSync: boolean;
  bpm: number;
  speed: number;
}

// Draw an image / video onto canvas keeping aspect ratio and fitting or covering
function drawMediaCover(
  ctx: CanvasRenderingContext2D,
  media: HTMLImageElement | HTMLVideoElement,
  dx: number,
  dy: number,
  dWidth: number,
  dHeight: number,
  scale = 1.0,
  offsetX = 0,
  offsetY = 0
) {
  const sWidth = (media instanceof HTMLVideoElement ? media.videoWidth : media.naturalWidth) || media.width || 100;
  const sHeight = (media instanceof HTMLVideoElement ? media.videoHeight : media.naturalHeight) || media.height || 100;

  const hRatio = dWidth / sWidth;
  const vRatio = dHeight / sHeight;
  const ratio = Math.max(hRatio, vRatio) * scale;

  const centerShiftX = (dWidth - sWidth * ratio) / 2 + offsetX;
  const centerShiftY = (dHeight - sHeight * ratio) / 2 + offsetY;

  ctx.save();
  ctx.beginPath();
  ctx.rect(dx, dy, dWidth, dHeight);
  ctx.clip();
  ctx.drawImage(
    media,
    0,
    0,
    sWidth,
    sHeight,
    dx + centerShiftX,
    dy + centerShiftY,
    sWidth * ratio,
    sHeight * ratio
  );
  ctx.restore();
}

// Convert RGB to HSL
function rgbToHsl(r: number, g: number, b: number) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return [h, s, l];
}

// Convert HSL to RGB
function hslToRgb(h: number, s: number, l: number) {
  let r: number, g: number, b: number;
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

// Apply Pixel-level color grading, presets, adjustments & natural skin beauty filter
export function applyPixelFilters(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  adjustments: Adjustments,
  beauty: BeautySettings,
  preset: FilterPreset
) {
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  // Compute preset offsets
  let presetBri = 1.0;
  let presetCon = 1.0;
  let presetSat = 1.0;
  let presetWarmth = 0;
  let presetGrain = 0;
  let isNoir = false;
  let isTealOrange = false;
  let isCyberpunk = false;
  let isBeautyGlow = false;

  switch (preset) {
    case 'beauty_glow':
      presetBri = 1.08;
      presetCon = 1.04;
      presetSat = 1.08;
      presetWarmth = 15;
      isBeautyGlow = true;
      break;
    case 'golden_hour':
      presetBri = 1.05;
      presetCon = 1.1;
      presetSat = 1.25;
      presetWarmth = 40;
      break;
    case 'teal_orange':
      presetBri = 1.02;
      presetCon = 1.18;
      isTealOrange = true;
      break;
    case 'noir':
      presetCon = 1.35;
      presetBri = 0.98;
      isNoir = true;
      break;
    case 'vintage':
      presetBri = 1.04;
      presetCon = 0.95;
      presetSat = 0.85;
      presetWarmth = 20;
      presetGrain = 25;
      break;
    case 'cyberpunk':
      presetBri = 1.05;
      presetCon = 1.25;
      isCyberpunk = true;
      break;
    case 'vivid':
      presetBri = 1.06;
      presetCon = 1.15;
      presetSat = 1.35;
      break;
    case 'pastel':
      presetBri = 1.12;
      presetCon = 0.88;
      presetSat = 0.9;
      presetWarmth = 8;
      break;
    case 'vhs':
      presetBri = 1.02;
      presetCon = 1.1;
      presetGrain = 35;
      break;
    default:
      break;
  }

  // Combined adjustments
  const bri = (adjustments.brightness / 100) * presetBri;
  const con = (adjustments.contrast / 100) * presetCon;
  const sat = isNoir ? 0 : (adjustments.saturation / 100) * presetSat;
  const warmth = adjustments.warmth + presetWarmth + (beauty.warmth || 0);
  const grainAmount = Math.max(adjustments.grain, presetGrain);

  // Beauty factor
  const beautySmoothFactor = (beauty.smooth || (isBeautyGlow ? 45 : 0)) / 100;
  const beautyGlowFactor = (beauty.glow || (isBeautyGlow ? 40 : 0)) / 100;

  const len = data.length;

  for (let i = 0; i < len; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    // 1. Natural Beauty Skin Smoothing (Retaining crisp edge details like eyes/brows)
    if (beautySmoothFactor > 0.05) {
      // Detect skin-tone range in HSV/RGB
      const isSkinLike = r > 80 && g > 50 && b > 35 && r > g && g > b && (r - b) > 15;
      if (isSkinLike) {
        // Soft blend towards skin median luminance to soften blemishes & pores
        const skinLum = 0.299 * r + 0.587 * g + 0.114 * b;
        const smoothIntensity = beautySmoothFactor * 0.45;
        r = r * (1 - smoothIntensity) + (skinLum * 1.05) * smoothIntensity;
        g = g * (1 - smoothIntensity) + (skinLum * 0.98) * smoothIntensity;
        b = b * (1 - smoothIntensity) + (skinLum * 0.92) * smoothIntensity;
      }
    }

    // 2. Radiance glow
    if (beautyGlowFactor > 0.05) {
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      if (lum > 140) {
        const glow = ((lum - 140) / 115) * beautyGlowFactor * 30;
        r += glow * 1.1;
        g += glow * 1.0;
        b += glow * 0.9;
      }
    }

    // 3. Brightness & Contrast
    r = ((r - 128) * con + 128) * bri;
    g = ((g - 128) * con + 128) * bri;
    b = ((b - 128) * con + 128) * bri;

    // 4. Color Grading presets
    if (isTealOrange) {
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      if (lum < 110) {
        // Shadows push towards Teal
        r *= 0.82;
        g *= 1.05;
        b *= 1.25;
      } else {
        // Highlights push towards Warm Orange
        r *= 1.18;
        g *= 1.04;
        b *= 0.85;
      }
    } else if (isCyberpunk) {
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      if (lum < 120) {
        r *= 0.75;
        b *= 1.35;
      } else {
        r *= 1.25;
        g *= 0.85;
        b *= 1.15;
      }
    }

    // 5. Warmth Temperature
    if (warmth !== 0) {
      r += warmth * 0.6;
      g += warmth * 0.15;
      b -= warmth * 0.6;
    }

    // 6. Saturation
    if (sat !== 1) {
      const gray = 0.299 * r + 0.587 * g + 0.114 * b;
      r = gray + (r - gray) * sat;
      g = gray + (g - gray) * sat;
      b = gray + (b - gray) * sat;
    }

    // 7. Film Grain
    if (grainAmount > 0) {
      const noise = (Math.random() - 0.5) * (grainAmount * 0.7);
      r += noise;
      g += noise;
      b += noise;
    }

    data[i] = Math.max(0, Math.min(255, r));
    data[i + 1] = Math.max(0, Math.min(255, g));
    data[i + 2] = Math.max(0, Math.min(255, b));
  }

  ctx.putImageData(imgData, 0, 0);

  // 8. Vignette Overlay
  if (adjustments.vignette > 0) {
    const radius = Math.max(width, height) * 0.8;
    const grad = ctx.createRadialGradient(
      width / 2,
      height / 2,
      radius * 0.35,
      width / 2,
      height / 2,
      radius
    );
    const alpha = (adjustments.vignette / 100) * 0.75;
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(1, `rgba(0,0,0,${alpha})`);

    ctx.save();
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }
}

// Main Frame Rendering Function
export function renderCanvasFrame(
  canvas: HTMLCanvasElement,
  state: RenderState,
  rawMode = false // true for comparing unedited raw
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const { width, height } = canvas;
  ctx.clearRect(0, 0, width, height);

  // Background fill
  ctx.fillStyle = '#080c14';
  ctx.fillRect(0, 0, width, height);

  const clips = state.clips;
  if (!clips || clips.length === 0) {
    // Empty state placeholder
    ctx.fillStyle = '#334155';
    ctx.font = '24px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Upload Photos or Videos to Start', width / 2, height / 2);
    return;
  }

  // Calculate current playback frame in timeline
  let accumulatedTime = 0;
  let activeClipIdx = 0;
  let activeClipProgress = 0; // 0 to 1
  let activeClip = clips[0];
  let nextClip = clips[1] || clips[0];

  // Map state.currentTime into clips sequence
  const modCurrentTime = state.currentTime % Math.max(0.1, state.totalDuration);
  for (let i = 0; i < clips.length; i++) {
    const c = clips[i];
    const dur = c.duration;
    if (modCurrentTime >= accumulatedTime && modCurrentTime < accumulatedTime + dur) {
      activeClipIdx = i;
      activeClip = c;
      nextClip = clips[(i + 1) % clips.length];
      activeClipProgress = (modCurrentTime - accumulatedTime) / dur;
      break;
    }
    accumulatedTime += dur;
  }

  const mediaA = state.mediaItems.get(activeClip.mediaId);
  const mediaB = state.mediaItems.get(nextClip.mediaId) || mediaA;

  // Beat sync pulse zoom
  let beatScale = 1.0;
  if (state.beatSync) {
    const pulse = audioEngine.getBeatPulse(state.currentTime, state.bpm);
    beatScale += pulse * 0.04;
  }

  // Handle Multi-Image Layouts if in dual-stitch mode
  if (state.layoutMode === 'side_by_side' && mediaA && mediaB) {
    // Split vertical 50/50
    const halfW = width / 2;
    drawMediaCover(ctx, mediaA, 0, 0, halfW, height, beatScale);
    drawMediaCover(ctx, mediaB, halfW, 0, halfW, height, beatScale);

    // Subtle divider
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(halfW, 0);
    ctx.lineTo(halfW, height);
    ctx.stroke();

  } else if (state.layoutMode === 'before_after' && mediaA) {
    // Before / After Comparison with draggable slider split
    const splitX = width * Math.max(0.05, Math.min(0.95, state.splitRatio));

    // Left side: RAW original
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, splitX, height);
    ctx.clip();
    drawMediaCover(ctx, mediaA, 0, 0, width, height, beatScale);
    ctx.restore();

    // Right side: Edited with Filters
    // We create an offscreen canvas for the edited version
    const offCanvas = document.createElement('canvas');
    offCanvas.width = width;
    offCanvas.height = height;
    const offCtx = offCanvas.getContext('2d');
    if (offCtx) {
      drawMediaCover(offCtx, mediaA, 0, 0, width, height, beatScale);
      applyPixelFilters(offCtx, width, height, state.adjustments, state.beauty, state.filterPreset);

      ctx.save();
      ctx.beginPath();
      ctx.rect(splitX, 0, width - splitX, height);
      ctx.clip();
      ctx.drawImage(offCanvas, 0, 0);
      ctx.restore();
    }

    // Draggable Split Divider Line & Handle
    ctx.save();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.shadowColor = 'rgba(0,0,0,0.6)';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.moveTo(splitX, 0);
    ctx.lineTo(splitX, height);
    ctx.stroke();

    // Handle Circle
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(splitX, height / 2, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Labels
    ctx.font = '600 13px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.shadowBlur = 4;
    ctx.fillText('ORIGINAL RAW', Math.max(20, splitX - 110), 40);
    ctx.fillText('AI ENHANCED', Math.min(width - 20, splitX + 20), 40);
    ctx.restore();

    return; // before/after already applied filters to right half

  } else if (state.layoutMode === 'grid_2x2') {
    // 4-quadrant layout
    const allMedia = Array.from(state.mediaItems.values());
    const m0 = allMedia[0] || mediaA;
    const m1 = allMedia[1] || mediaA;
    const m2 = allMedia[2] || mediaA;
    const m3 = allMedia[3] || mediaA;

    const halfW = width / 2;
    const halfH = height / 2;
    if (m0) drawMediaCover(ctx, m0, 0, 0, halfW, halfH, beatScale);
    if (m1) drawMediaCover(ctx, m1, halfW, 0, halfW, halfH, beatScale);
    if (m2) drawMediaCover(ctx, m2, 0, halfH, halfW, halfH, beatScale);
    if (m3) drawMediaCover(ctx, m3, halfW, halfH, halfW, halfH, beatScale);

  } else if (state.layoutMode === 'blend' && mediaA && mediaB) {
    // Double exposure / blend
    drawMediaCover(ctx, mediaA, 0, 0, width, height, beatScale);
    ctx.save();
    ctx.globalAlpha = state.blendOpacity || 0.5;
    ctx.globalCompositeOperation = 'screen';
    drawMediaCover(ctx, mediaB, 0, 0, width, height, beatScale * 1.05);
    ctx.restore();

  } else if (mediaA) {
    // Single View / Sequential Slideshow with Transition Animations
    const transitionThreshold = 0.8; // transition occurs in the last 20% of clip duration
    const isInTransition = activeClipProgress > transitionThreshold && clips.length > 1;
    const transProgress = isInTransition ? (activeClipProgress - transitionThreshold) / (1 - transitionThreshold) : 0;
    const transitionType = activeClip.transition || 'crossfade';

    // Ken Burns dramatic slow zoom for photos
    const kenBurnsZoom = 1.0 + activeClipProgress * 0.08;
    const currentScale = beatScale * kenBurnsZoom;

    if (!isInTransition || !mediaB) {
      drawMediaCover(ctx, mediaA, 0, 0, width, height, currentScale);
    } else {
      // Execute Transition Effect
      switch (transitionType) {
        case 'zoom': {
          // Push zoom
          drawMediaCover(ctx, mediaA, 0, 0, width, height, currentScale * (1 + transProgress * 0.4));
          ctx.save();
          ctx.globalAlpha = transProgress;
          drawMediaCover(ctx, mediaB, 0, 0, width, height, beatScale * (0.8 + transProgress * 0.2));
          ctx.restore();
          break;
        }
        case 'slide': {
          // Slide left
          const shift = width * transProgress;
          drawMediaCover(ctx, mediaA, -shift, 0, width, height, currentScale);
          drawMediaCover(ctx, mediaB, width - shift, 0, width, height, beatScale);
          break;
        }
        case 'glitch': {
          // Flash & chromatic jitter
          drawMediaCover(ctx, mediaA, 0, 0, width, height, currentScale);
          if (Math.random() > 0.4) {
            ctx.save();
            ctx.globalAlpha = 0.6;
            ctx.fillStyle = Math.random() > 0.5 ? 'rgba(0, 255, 255, 0.3)' : 'rgba(255, 0, 128, 0.3)';
            ctx.fillRect(0, 0, width, height);
            drawMediaCover(ctx, mediaB, (Math.random() - 0.5) * 20, 0, width, height, beatScale);
            ctx.restore();
          }
          break;
        }
        case 'blur':
        case 'crossfade':
        default: {
          drawMediaCover(ctx, mediaA, 0, 0, width, height, currentScale);
          ctx.save();
          ctx.globalAlpha = transProgress;
          drawMediaCover(ctx, mediaB, 0, 0, width, height, beatScale);
          ctx.restore();
          break;
        }
      }
    }
  }

  // Apply Pixel Filters, Beauty & Color grading (unless raw preview requested)
  if (!rawMode) {
    applyPixelFilters(ctx, width, height, state.adjustments, state.beauty, state.filterPreset);
  }

  // Draw Text Overlay if present
  if (state.textOverlay && state.textOverlay.text.trim()) {
    ctx.save();
    const size = Math.round((state.textOverlay.fontSize || 36) * (width / 1080));
    ctx.font = `700 ${size}px "Plus Jakarta Sans", sans-serif`;
    ctx.fillStyle = state.textOverlay.color || '#ffffff';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 3;

    let textY = height / 2;
    if (state.textOverlay.position === 'top') textY = height * 0.15;
    if (state.textOverlay.position === 'bottom') textY = height * 0.85;

    ctx.fillText(state.textOverlay.text, width / 2, textY);
    ctx.restore();
  }
}

// Export High-Resolution Still Image (PNG / JPEG)
export async function exportHighResImage(
  state: RenderState,
  targetWidth = 1920,
  targetHeight = 1080,
  format: 'image/png' | 'image/jpeg' = 'image/png'
): Promise<Blob> {
  const exportCanvas = document.createElement('canvas');
  exportCanvas.width = targetWidth;
  exportCanvas.height = targetHeight;

  renderCanvasFrame(exportCanvas, state);

  return new Promise((resolve, reject) => {
    exportCanvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Canvas image blob creation failed'));
      },
      format,
      0.95
    );
  });
}

// Export Full HD Video (MP4 / WebM with embedded mixed audio)
export async function exportVideo(
  state: RenderState,
  onProgress?: (progress: number) => void
): Promise<Blob> {
  const dims =
    state.aspectRatio === '9:16'
      ? { w: 720, h: 1280 }
      : state.aspectRatio === '1:1'
      ? { w: 1080, h: 1080 }
      : { w: 1280, h: 720 };

  const exportCanvas = document.createElement('canvas');
  exportCanvas.width = dims.w;
  exportCanvas.height = dims.h;

  const fps = 30;
  const canvasStream = exportCanvas.captureStream(fps);

  // Mix in Web Audio destination stream if available
  const audioStream = audioEngine.getMediaStream();
  const tracks: MediaStreamTrack[] = [...canvasStream.getVideoTracks()];
  if (audioStream) {
    const audioTracks = audioStream.getAudioTracks();
    if (audioTracks.length > 0) {
      tracks.push(audioTracks[0]);
    }
  }

  const combinedStream = new MediaStream(tracks);

  // Determine supported mime type
  const mimeTypes = [
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm',
    'video/mp4',
  ];
  let chosenMime = 'video/webm';
  for (const mime of mimeTypes) {
    if (MediaRecorder.isTypeSupported(mime)) {
      chosenMime = mime;
      break;
    }
  }

  const recorder = new MediaRecorder(combinedStream, {
    mimeType: chosenMime,
    videoBitsPerSecond: 6000000, // 6 Mbps HD
  });

  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) {
      chunks.push(e.data);
    }
  };

  return new Promise(async (resolve, reject) => {
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: chosenMime });
      resolve(blob);
    };

    recorder.onerror = (err) => {
      reject(err);
    };

    recorder.start(100);

    const totalSeconds = Math.max(3, state.totalDuration);
    const totalFrames = Math.floor(totalSeconds * fps);
    let frame = 0;

    const renderLoop = () => {
      if (frame >= totalFrames) {
        recorder.stop();
        return;
      }

      const simTime = (frame / totalFrames) * totalSeconds;
      const simState = { ...state, currentTime: simTime };
      renderCanvasFrame(exportCanvas, simState);

      frame++;
      if (onProgress) {
        onProgress(Math.round((frame / totalFrames) * 100));
      }

      // Next tick
      requestAnimationFrame(renderLoop);
    };

    requestAnimationFrame(renderLoop);
  });
}
