import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Mic,
  MicOff,
  Send,
  X,
  CheckCircle2,
  Sliders,
  Layers,
  Wand2,
  Music,
  Gauge,
  Film,
} from 'lucide-react';
import { DirectorAIResponse } from '../types';

interface AIDirectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyDirectorActions: (actions: DirectorAIResponse['actions']) => void;
  mediaCount: number;
}

export const AIDirectorModal: React.FC<AIDirectorModalProps> = ({
  isOpen,
  onClose,
  onApplyDirectorActions,
  mediaCount,
}) => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<DirectorAIResponse | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const samplePrompts = [
    'Iski slow motion cinematic video banao with lo-fi beats aur golden hour warmth',
    'Dono photos ko ek sath jod do side-by-side aur beauty filter lagao',
    'Beat sync video montage banao with zoom transitions and vibrant colors',
    'Face skin smooth karo, radiance glow badhao aur natural touchup do',
    'Vintage 35mm film look with slow 0.5x speed and acoustic music',
    'Teal and orange cinematic blockbuster look with deep contrast',
  ];

  // Speech Recognition setup for "bol saku"
  useEffect(() => {
    // Check speech recognition support
    const SpeechRecognition =
      (window as unknown as { SpeechRecognition: any; webkitSpeechRecognition: any })
        .SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition: any }).webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'hi-IN'; // Supports Hindi/Hinglish/English

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setPrompt((prev) => (prev ? `${prev} ${transcript}` : transcript));
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    if (isListening) {
      try {
        recognition.start();
      } catch {
        setIsListening(false);
      }
    } else {
      try {
        recognition.stop();
      } catch {}
    }

    return () => {
      try {
        recognition.stop();
      } catch {}
    };
  }, [isListening]);

  if (!isOpen) return null;

  const handleSubmit = async (promptText: string) => {
    const textToSubmit = promptText || prompt;
    if (!textToSubmit.trim()) return;

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/gemini/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: textToSubmit,
          context: { mediaCount },
        }),
      });

      const data = await res.json();
      if (data.result) {
        setResponse(data.result);
      } else {
        setErrorMsg('Failed to process prompt. Please try again.');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Error contacting AI Director. Using default smart settings.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = () => {
    if (response?.actions) {
      onApplyDirectorActions(response.actions);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs select-none">
      <div className="relative w-full max-w-2xl bg-[#0d1322] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-[#090e1a]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">AI Director & Prompt Studio</h2>
              <p className="text-[11px] text-slate-400">
                Bolo ya likho ki kya karwana hai (Hindi, Hinglish, or English)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Prompt Input Form */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">Apna Prompt Likhain ya Bolain:</label>
            <div className="relative flex items-center">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. Iski slow motion cinematic video banao with lo-fi beats, golden hour warmth aur beauty glow..."
                rows={3}
                className="w-full pr-24 pl-3.5 py-2.5 rounded-xl bg-[#090e1a] border border-slate-800 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-hidden resize-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(prompt);
                  }
                }}
              />
              <div className="absolute right-2 bottom-2.5 flex items-center gap-1.5">
                {/* Voice button */}
                <button
                  type="button"
                  onClick={() => setIsListening(!isListening)}
                  className={`p-2 rounded-lg transition-all cursor-pointer ${
                    isListening
                      ? 'bg-rose-500 text-white animate-pulse'
                      : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
                  }`}
                  title={isListening ? 'Listening... click to stop' : 'Click to Speak (Boliye)'}
                >
                  {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                </button>

                {/* Submit button */}
                <button
                  type="button"
                  onClick={() => handleSubmit(prompt)}
                  disabled={isLoading || !prompt.trim()}
                  className="flex items-center gap-1 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold transition-all shadow-md shadow-blue-600/30 cursor-pointer"
                >
                  {isLoading ? (
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Direct</span>
                      <Send className="w-3 h-3" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Prompt Suggestion Chips */}
          <div>
            <span className="text-[11px] font-medium text-slate-400">Quick Prompt Presets (Click to test):</span>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {samplePrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setPrompt(p);
                    handleSubmit(p);
                  }}
                  className="px-2.5 py-1 text-[11px] text-slate-300 hover:text-white bg-[#101726] hover:bg-slate-800 border border-slate-800 rounded-lg text-left transition-colors cursor-pointer"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* AI Response Display */}
          {response && (
            <div className="p-4 rounded-xl bg-[#090f1e] border border-blue-500/30 space-y-3.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-400">
                <CheckCircle2 className="w-4 h-4 text-blue-400" />
                <span>Director Cut Ready: {response.suggestedTitle}</span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed bg-[#0b1326] p-3 rounded-lg border border-slate-800">
                {response.explanation}
              </p>

              {/* Action summary tags */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] text-slate-400 pt-1">
                {response.actions.filter && (
                  <div className="flex items-center gap-1.5 bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                    <Sliders className="w-3.5 h-3.5 text-blue-400" />
                    <span>Filter: {response.actions.filter}</span>
                  </div>
                )}
                {response.actions.speed !== undefined && (
                  <div className="flex items-center gap-1.5 bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                    <Gauge className="w-3.5 h-3.5 text-amber-400" />
                    <span>Speed: {response.actions.speed}x</span>
                  </div>
                )}
                {response.actions.layout && (
                  <div className="flex items-center gap-1.5 bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                    <Layers className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Layout: {response.actions.layout}</span>
                  </div>
                )}
                {response.actions.musicGenre && (
                  <div className="flex items-center gap-1.5 bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                    <Music className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Music: {response.actions.musicGenre}</span>
                  </div>
                )}
                {response.actions.beautyEnhance && (
                  <div className="flex items-center gap-1.5 bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                    <Wand2 className="w-3.5 h-3.5 text-rose-400" />
                    <span>Beauty Smooth: {response.actions.beautyEnhance.smooth}%</span>
                  </div>
                )}
                {response.actions.transition && (
                  <div className="flex items-center gap-1.5 bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                    <Film className="w-3.5 h-3.5 text-sky-400" />
                    <span>Transition: {response.actions.transition}</span>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="flex justify-end pt-2">
                <button
                  onClick={handleApply}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Apply Direct to Canvas & Timeline
                </button>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800 text-xs text-rose-300">
              {errorMsg}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
