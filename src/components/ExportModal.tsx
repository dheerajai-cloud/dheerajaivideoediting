import React, { useState } from 'react';
import {
  Download,
  X,
  Film,
  Image as ImageIcon,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { exportHighResImage, exportVideo, RenderState } from '../utils/canvasRenderer';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  renderState: RenderState;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  renderState,
}) => {
  const [exportType, setExportType] = useState<'video' | 'image'>('video');
  const [imageFormat, setImageFormat] = useState<'image/png' | 'image/jpeg'>('image/png');
  const [videoQuality, setVideoQuality] = useState<'1080p' | '720p'>('1080p');
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadFilename, setDownloadFilename] = useState<string>('');

  if (!isOpen) return null;

  const handleStartExport = async () => {
    setIsExporting(true);
    setProgress(0);
    setDownloadUrl(null);

    try {
      if (exportType === 'video') {
        const videoBlob = await exportVideo(renderState, (p) => {
          setProgress(p);
        });

        const url = URL.createObjectURL(videoBlob);
        const ext = videoBlob.type.includes('mp4') ? 'mp4' : 'webm';
        const filename = `lumina_cut_video_${Date.now()}.${ext}`;

        setDownloadUrl(url);
        setDownloadFilename(filename);

        // Auto trigger download
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
      } else {
        // Image export
        const w = renderState.aspectRatio === '9:16' ? 1080 : renderState.aspectRatio === '1:1' ? 1440 : 1920;
        const h = renderState.aspectRatio === '9:16' ? 1920 : renderState.aspectRatio === '1:1' ? 1440 : 1080;

        const imgBlob = await exportHighResImage(renderState, w, h, imageFormat);
        const url = URL.createObjectURL(imgBlob);
        const ext = imageFormat === 'image/jpeg' ? 'jpg' : 'png';
        const filename = `lumina_cut_photo_${Date.now()}.${ext}`;

        setDownloadUrl(url);
        setDownloadFilename(filename);

        // Auto trigger download
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
      }
    } catch (err) {
      console.error('Export error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs select-none">
      <div className="relative w-full max-w-lg bg-[#0d1322] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-[#090e1a]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">Export Studio Render</h2>
              <p className="text-[11px] text-slate-400">Download high-definition video or photo with all effects baked in</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal body */}
        <div className="p-6 space-y-5">
          {/* Export Type Switcher */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-2">Select Export Format</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setExportType('video')}
                className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  exportType === 'video'
                    ? 'border-blue-500 bg-[#121c2e] text-white ring-1 ring-blue-500'
                    : 'border-slate-800 bg-[#0a0f1c] text-slate-400 hover:text-white'
                }`}
              >
                <Film className="w-4 h-4 text-blue-400 shrink-0" />
                <div>
                  <div className="text-xs font-semibold">HD Video File</div>
                  <div className="text-[10px] text-slate-400">With audio & transitions</div>
                </div>
              </button>

              <button
                onClick={() => setExportType('image')}
                className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  exportType === 'image'
                    ? 'border-blue-500 bg-[#121c2e] text-white ring-1 ring-blue-500'
                    : 'border-slate-800 bg-[#0a0f1c] text-slate-400 hover:text-white'
                }`}
              >
                <ImageIcon className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <div className="text-xs font-semibold">High-Res Still Photo</div>
                  <div className="text-[10px] text-slate-400">100% face & detail retention</div>
                </div>
              </button>
            </div>
          </div>

          {/* Video Options */}
          {exportType === 'video' ? (
            <div className="space-y-3 p-3.5 rounded-xl bg-[#090f1e] border border-slate-800/80">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>Output Resolution:</span>
                <span className="font-mono text-blue-400 font-semibold">{videoQuality}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setVideoQuality('1080p')}
                  className={`py-1.5 px-3 rounded-lg text-xs font-medium border cursor-pointer ${
                    videoQuality === '1080p'
                      ? 'border-blue-500 bg-blue-600/20 text-white'
                      : 'border-slate-800 bg-slate-900 text-slate-400'
                  }`}
                >
                  1080p Full HD
                </button>
                <button
                  onClick={() => setVideoQuality('720p')}
                  className={`py-1.5 px-3 rounded-lg text-xs font-medium border cursor-pointer ${
                    videoQuality === '720p'
                      ? 'border-blue-500 bg-blue-600/20 text-white'
                      : 'border-slate-800 bg-slate-900 text-slate-400'
                  }`}
                >
                  720p Fast Render
                </button>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                <span>Total Length: {renderState.totalDuration.toFixed(1)}s</span>
                <span>Frame Rate: 30 FPS</span>
              </div>
            </div>
          ) : (
            /* Image Options */
            <div className="space-y-3 p-3.5 rounded-xl bg-[#090f1e] border border-slate-800/80">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>Image File Type:</span>
                <span className="font-mono text-emerald-400 font-semibold">{imageFormat.toUpperCase()}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setImageFormat('image/png')}
                  className={`py-1.5 px-3 rounded-lg text-xs font-medium border cursor-pointer ${
                    imageFormat === 'image/png'
                      ? 'border-emerald-500 bg-emerald-600/20 text-white'
                      : 'border-slate-800 bg-slate-900 text-slate-400'
                  }`}
                >
                  PNG (Lossless Crystal Clear)
                </button>
                <button
                  onClick={() => setImageFormat('image/jpeg')}
                  className={`py-1.5 px-3 rounded-lg text-xs font-medium border cursor-pointer ${
                    imageFormat === 'image/jpeg'
                      ? 'border-emerald-500 bg-emerald-600/20 text-white'
                      : 'border-slate-800 bg-slate-900 text-slate-400'
                  }`}
                >
                  JPEG (Compact Size)
                </button>
              </div>
            </div>
          )}

          {/* Progress bar when rendering */}
          {isExporting && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-spin" />
                  Rendering Master Output...
                </span>
                <span className="font-mono text-blue-400">{progress}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-sky-400 transition-all duration-150"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Success Download Link if available */}
          {downloadUrl && !isExporting && (
            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800 text-xs text-emerald-300 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Export ready: {downloadFilename}</span>
              </div>
              <a
                href={downloadUrl}
                download={downloadFilename}
                className="underline hover:text-white font-semibold"
              >
                Download Again
              </a>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={onClose}
              disabled={isExporting}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleStartExport}
              disabled={isExporting}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExporting ? `Rendering (${progress}%)` : 'Start Export & Download'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
