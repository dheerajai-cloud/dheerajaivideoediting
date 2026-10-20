import { AudioTrack } from '../types';

class AudioEngine {
  private ctx: AudioContext | null = null;
  private currentSource: AudioBufferSourceNode | null = null;
  private gainNode: GainNode | null = null;
  private destinationNode: MediaStreamAudioDestinationNode | null = null;
  private isPlaying = false;
  private startTime = 0;
  private pauseOffset = 0;
  private currentTrack: AudioTrack | null = null;
  private cachedBuffers: Map<string, AudioBuffer> = new Map();

  constructor() {
    // Lazy initialized on first user gesture
  }

  public getAudioContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.gainNode = this.ctx.createGain();
      this.gainNode.gain.value = 0.8;
      this.destinationNode = this.ctx.createMediaStreamDestination();
      
      // Connect gain to speakers and destination for recording
      this.gainNode.connect(this.ctx.destination);
      this.gainNode.connect(this.destinationNode);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public getMediaStream(): MediaStream | null {
    if (!this.destinationNode) {
      this.getAudioContext();
    }
    return this.destinationNode ? this.destinationNode.stream : null;
  }

  public setVolume(vol: number) {
    if (this.gainNode) {
      this.gainNode.gain.value = Math.max(0, Math.min(1, vol));
    }
  }

  // Synthesize realistic music loop for given genre
  public async generateTrackBuffer(track: AudioTrack, duration = 30): Promise<AudioBuffer> {
    if (this.cachedBuffers.has(track.id)) {
      return this.cachedBuffers.get(track.id)!;
    }

    const ctx = this.getAudioContext();
    const sampleRate = ctx.sampleRate;
    const numSamples = Math.floor(sampleRate * duration);
    const buffer = ctx.createBuffer(2, numSamples, sampleRate);
    const left = buffer.getChannelData(0);
    const right = buffer.getChannelData(1);

    const bpm = track.bpm || 110;
    const beatSec = 60 / bpm;
    const barSec = beatSec * 4;

    // Chord progressions depending on genre
    const freqsLofi = [261.63, 311.13, 392.00, 466.16]; // Cm7
    const freqsBollywood = [220.00, 246.94, 293.66, 329.63, 392.00]; // Indian Raag Dorian/Kafi
    const freqsBeats = [55.0, 110.0, 220.0]; // Sub bass
    const freqsCinematic = [130.81, 164.81, 196.00, 261.63]; // C minor epic
    const freqsRomantic = [261.63, 329.63, 392.00, 493.88]; // Cmaj7

    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      const beat = (t / beatSec);
      const beatProgress = beat % 1;
      const barProgress = (t / barSec) % 1;

      let sampleL = 0;
      let sampleR = 0;

      if (track.genre === 'lofi') {
        // Soft electric piano chords with gentle decay
        const chordIdx = Math.floor((t / (beatSec * 2)) % 4);
        const baseFreq = freqsLofi[chordIdx] || 261.63;
        const decay = Math.exp(-((t % (beatSec * 2)) * 1.5));
        const chord = (Math.sin(2 * Math.PI * baseFreq * t) +
          0.5 * Math.sin(2 * Math.PI * baseFreq * 1.5 * t) +
          0.25 * Math.sin(2 * Math.PI * baseFreq * 2 * t)) * decay * 0.15;

        // Soft kick on beat 1 and 3
        const isKickBeat = Math.floor(beat) % 2 === 0;
        const kickEnv = isKickBeat ? Math.max(0, 1 - beatProgress * 6) : 0;
        const kick = Math.sin(2 * Math.PI * (60 - beatProgress * 30) * t) * kickEnv * 0.25;

        // Snare / rimshot on beat 2 and 4
        const isSnareBeat = Math.floor(beat) % 2 === 1;
        const snareEnv = isSnareBeat ? Math.max(0, 1 - beatProgress * 8) : 0;
        const snareNoise = (Math.random() * 2 - 1) * snareEnv * 0.1;

        // Vinyl crackle
        const crackle = (Math.random() > 0.997 ? (Math.random() - 0.5) * 0.05 : 0);

        sampleL = chord + kick + snareNoise + crackle;
        sampleR = chord * 0.95 + kick + snareNoise * 1.1 + crackle;

      } else if (track.genre === 'beats') {
        // Phonk / EDM heavy 808 bass & punchy rhythm
        const kickEnv = Math.max(0, 1 - beatProgress * 5);
        const subPitch = 50 + (1 - beatProgress) * 35;
        const kick = Math.sin(2 * Math.PI * subPitch * t) * kickEnv * 0.4;

        // 808 Hat rolls
        const hatEnv = Math.max(0, 1 - (beat * 4 % 1) * 12);
        const hat = (Math.random() * 2 - 1) * hatEnv * 0.08;

        // Dark synth lead
        const note = freqsBeats[Math.floor(beat / 2) % freqsBeats.length];
        const synth = Math.sin(2 * Math.PI * note * 2 * t) * 0.12;

        sampleL = kick + hat + synth;
        sampleR = kick + hat * 0.8 + synth * 1.1;

      } else if (track.genre === 'bollywood') {
        // Dholak / Tabla percussive pulse + melody
        const dholakDayan = Math.sin(2 * Math.PI * 140 * t) * Math.max(0, 1 - beatProgress * 4) * 0.25;
        const dholakBayan = Math.sin(2 * Math.PI * 75 * t) * Math.max(0, 1 - (beat * 2 % 1) * 3) * 0.2;
        
        // Sitar / flute style shimmering tone
        const melodyNote = freqsBollywood[Math.floor(beat) % freqsBollywood.length];
        const flute = Math.sin(2 * Math.PI * melodyNote * t) *
                      (1 + 0.2 * Math.sin(2 * Math.PI * 5 * t)) * 0.15;

        // Jhankaar shakers
        const shaker = (Math.random() * 2 - 1) * Math.max(0, 1 - (beat * 4 % 1) * 6) * 0.06;

        sampleL = dholakDayan + dholakBayan * 0.7 + flute + shaker;
        sampleR = dholakDayan * 0.7 + dholakBayan + flute * 1.05 + shaker;

      } else if (track.genre === 'cinematic') {
        // Deep string pad swells and heroic pulse
        const padChord = Math.sin(2 * Math.PI * freqsCinematic[0] * t) * 0.12 +
                         Math.sin(2 * Math.PI * freqsCinematic[1] * t) * 0.10 +
                         Math.sin(2 * Math.PI * freqsCinematic[2] * t) * 0.08;
        const swell = 0.5 + 0.5 * Math.sin(2 * Math.PI * (t / barSec));
        const epicDrum = (Math.floor(beat) % 4 === 0) ? Math.sin(2 * Math.PI * 45 * t) * Math.max(0, 1 - beatProgress * 3) * 0.35 : 0;

        sampleL = padChord * swell + epicDrum;
        sampleR = padChord * swell * 0.9 + epicDrum;

      } else {
        // Romantic acoustic guitar arpeggiation
        const arpIdx = Math.floor(beat * 2) % freqsRomantic.length;
        const f = freqsRomantic[arpIdx];
        const decay = Math.exp(-((t % (beatSec * 0.5)) * 4));
        const guitar = Math.sin(2 * Math.PI * f * t) * decay * 0.2;
        const bass = Math.sin(2 * Math.PI * (f / 2) * t) * 0.08;

        sampleL = (guitar + bass) * 0.9;
        sampleR = (guitar + bass) * 1.1;
      }

      left[i] = Math.max(-0.95, Math.min(0.95, sampleL));
      right[i] = Math.max(-0.95, Math.min(0.95, sampleR));
    }

    this.cachedBuffers.set(track.id, buffer);
    return buffer;
  }

  public async decodeAudioFile(file: File): Promise<AudioBuffer> {
    const ctx = this.getAudioContext();
    const arrayBuffer = await file.arrayBuffer();
    const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
    return audioBuffer;
  }

  public async play(track: AudioTrack, offsetSeconds = 0) {
    const ctx = this.getAudioContext();
    this.stop();

    let buffer: AudioBuffer;
    if (track.audioBuffer) {
      buffer = track.audioBuffer;
    } else {
      buffer = await this.generateTrackBuffer(track, 60);
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    if (this.gainNode) {
      source.connect(this.gainNode);
    }

    const safeOffset = offsetSeconds % buffer.duration;
    source.start(0, safeOffset);

    this.currentSource = source;
    this.currentTrack = track;
    this.isPlaying = true;
    this.startTime = ctx.currentTime - safeOffset;
    this.pauseOffset = safeOffset;
  }

  public stop() {
    if (this.currentSource) {
      try {
        this.currentSource.stop();
        this.currentSource.disconnect();
      } catch {
        // already stopped
      }
      this.currentSource = null;
    }
    this.isPlaying = false;
  }

  public getCurrentTime(): number {
    if (!this.isPlaying || !this.ctx) return this.pauseOffset;
    return this.ctx.currentTime - this.startTime;
  }

  // Calculate beat pulse intensity (0 to 1) at any given time
  public getBeatPulse(timeSec: number, bpm = 120): number {
    const beatDuration = 60 / bpm;
    const progress = (timeSec % beatDuration) / beatDuration;
    // Sharp peak on beat 0 then exponential decay
    return Math.pow(Math.max(0, 1 - progress * 4), 2);
  }
}

export const audioEngine = new AudioEngine();

export const DEFAULT_AUDIO_TRACKS: AudioTrack[] = [
  {
    id: 'lofi-midnight',
    name: 'Lo-Fi Chill Sunset',
    genre: 'lofi',
    bpm: 85,
  },
  {
    id: 'phonk-bass-drop',
    name: 'Phonk 808 Energy Beat',
    genre: 'beats',
    bpm: 128,
  },
  {
    id: 'bollywood-rhythm',
    name: 'Bollywood Fusion Groove',
    genre: 'bollywood',
    bpm: 105,
  },
  {
    id: 'cinematic-epic',
    name: 'Cinematic Horizon Orchestral',
    genre: 'cinematic',
    bpm: 90,
  },
  {
    id: 'romantic-acoustic',
    name: 'Acoustic Golden Glow',
    genre: 'romantic',
    bpm: 100,
  },
];
