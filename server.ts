import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '50mb' }));

// Initialize GoogleGenAI SDK with user-agent
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Fallback smart parser for Hindi & English requests
function fallbackDirectorRuleParser(prompt: string) {
  const p = prompt.toLowerCase();
  
  // Speed
  let speed = 1.0;
  if (p.includes('slow') || p.includes('dheere') || p.includes('slomo') || p.includes('0.5')) {
    speed = 0.5;
  } else if (p.includes('fast') || p.includes('tez') || p.includes('2x')) {
    speed = 1.5;
  }

  // Filter
  let filter: string = 'original';
  if (p.includes('beauty') || p.includes('glow') || p.includes('sundar') || p.includes('skin') || p.includes('face') || p.includes('chehra')) {
    filter = 'beauty_glow';
  } else if (p.includes('golden') || p.includes('warm') || p.includes('sunset') || p.includes('peela') || p.includes('dhup')) {
    filter = 'golden_hour';
  } else if (p.includes('teal') || p.includes('orange') || p.includes('cinematic') || p.includes('movie')) {
    filter = 'teal_orange';
  } else if (p.includes('noir') || p.includes('black and white') || p.includes('b&w') || p.includes('kaala') || p.includes('monochrome')) {
    filter = 'noir';
  } else if (p.includes('vintage') || p.includes('purana') || p.includes('film') || p.includes('retro')) {
    filter = 'vintage';
  } else if (p.includes('cyberpunk') || p.includes('neon') || p.includes('night')) {
    filter = 'cyberpunk';
  } else if (p.includes('vivid') || p.includes('hdr') || p.includes('colourful') || p.includes('rangin')) {
    filter = 'vivid';
  }

  // Layout / Stitch
  let layout: string = 'single';
  if (p.includes('jod') || p.includes('stitch') || p.includes('side by side') || p.includes('dono') || p.includes('combine') || p.includes('split')) {
    layout = 'side_by_side';
  } else if (p.includes('before') || p.includes('after') || p.includes('compare') || p.includes('antaratam')) {
    layout = 'before_after';
  } else if (p.includes('grid') || p.includes('collage') || p.includes('chaar')) {
    layout = 'grid_2x2';
  } else if (p.includes('blend') || p.includes('mix') || p.includes('double exposure')) {
    layout = 'blend';
  }

  // Transition
  let transition: string = 'crossfade';
  if (p.includes('zoom') || p.includes('ken burns')) {
    transition = 'zoom';
  } else if (p.includes('slide') || p.includes('sarik')) {
    transition = 'slide';
  } else if (p.includes('glitch') || p.includes('jhatka')) {
    transition = 'glitch';
  } else if (p.includes('blur') || p.includes('dissolve')) {
    transition = 'blur';
  }

  // Music Genre
  let musicGenre: string = 'lofi';
  if (p.includes('bollywood') || p.includes('desi') || p.includes('hindi') || p.includes('dholak')) {
    musicGenre = 'bollywood';
  } else if (p.includes('beat') || p.includes('phonk') || p.includes('bass') || p.includes('edm') || p.includes('dance')) {
    musicGenre = 'beats';
  } else if (p.includes('romantic') || p.includes('pyar') || p.includes('acoustic') || p.includes('guitar')) {
    musicGenre = 'romantic';
  } else if (p.includes('cinematic') || p.includes('epic') || p.includes('heroic') || p.includes('orchestral')) {
    musicGenre = 'cinematic';
  }

  // Beat sync
  const beatSync = p.includes('beat') || p.includes('sync') || p.includes('gaane ke hisab') || p.includes('song ke hisab');

  // Beauty enhance settings
  const hasBeauty = filter === 'beauty_glow' || p.includes('beauty') || p.includes('skin') || p.includes('glow');
  const beautyEnhance = {
    smooth: hasBeauty ? 70 : 35,
    glow: hasBeauty ? 60 : 30,
    warmth: p.includes('warm') || filter === 'golden_hour' ? 40 : 15,
  };

  return {
    explanation: `Prompt successfully analyzed! Applied ${filter.replace('_', ' ')} filter, ${transition} transition, ${speed}x playback speed, ${musicGenre} soundtrack with ${beatSync ? 'beat-sync enabled' : 'smooth pacing'}, and layout set to ${layout}.`,
    suggestedTitle: 'AI Creative Edit',
    actions: {
      filter,
      speed,
      transition,
      layout,
      musicGenre,
      beatSync: beatSync || true,
      beautyEnhance,
      adjustments: {
        brightness: filter === 'golden_hour' ? 112 : filter === 'vivid' ? 110 : 105,
        contrast: filter === 'noir' ? 130 : 115,
        saturation: filter === 'noir' ? 0 : filter === 'vivid' ? 135 : 110,
        warmth: filter === 'golden_hour' ? 35 : 0,
        sharpness: 25,
        vignette: 20,
      },
      textOverlay: p.includes('text') || p.includes('title') ? 'Vibes' : '',
    },
  };
}

// API Route: AI Video & Photo Director Assistant
app.post('/api/gemini/assistant', async (req, res) => {
  try {
    const { prompt, context } = req.body;
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Valid prompt is required' });
    }

    if (!ai) {
      // Fallback if no API key
      const fallbackResult = fallbackDirectorRuleParser(prompt);
      return res.json({ result: fallbackResult, source: 'rule-engine' });
    }

    const systemInstruction = `You are Lumina Cut AI Video & Image Director.
The user wants to edit videos or photos, create beat-synced video montages from images, enhance face/beauty, apply cinematic color grading LUTs, slow-motion, stitch two or more images together, or add music.
The user speaks in Hindi, Hinglish, or English.
You must interpret their instructions precisely and return ONLY a valid JSON object matching this schema:
{
  "explanation": "Short friendly confirmation in Hinglish or English explaining what was adjusted",
  "suggestedTitle": "Short creative video or photo title",
  "actions": {
    "filter": "original" | "beauty_glow" | "golden_hour" | "teal_orange" | "noir" | "vintage" | "cyberpunk" | "vivid",
    "speed": number (between 0.25 and 2.0, e.g. 0.5 for slow motion),
    "transition": "crossfade" | "zoom" | "slide" | "glitch" | "blur",
    "layout": "single" | "side_by_side" | "before_after" | "grid_2x2" | "blend",
    "musicGenre": "lofi" | "beats" | "bollywood" | "romantic" | "cinematic",
    "beatSync": boolean,
    "beautyEnhance": {
      "smooth": number (0 to 100),
      "glow": number (0 to 100),
      "warmth": number (-50 to 50)
    },
    "adjustments": {
      "brightness": number (50 to 150),
      "contrast": number (50 to 150),
      "saturation": number (0 to 200),
      "warmth": number (-50 to 50),
      "sharpness": number (0 to 100),
      "vignette": number (0 to 100)
    },
    "textOverlay": string (optional short stylish caption if requested)
  }
}`;

    const geminiResponse = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `User Prompt: "${prompt}"\nCurrent Context: ${JSON.stringify(context || {})}`,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      },
    });

    const text = geminiResponse.text?.trim() || '';
    try {
      const parsed = JSON.parse(text);
      return res.json({ result: parsed, source: 'gemini-ai' });
    } catch {
      const fallbackResult = fallbackDirectorRuleParser(prompt);
      return res.json({ result: fallbackResult, source: 'gemini-fallback' });
    }
  } catch (error) {
    console.error('Gemini assistant error:', error);
    const prompt = req.body?.prompt || '';
    const fallbackResult = fallbackDirectorRuleParser(prompt);
    return res.json({ result: fallbackResult, source: 'rule-fallback', warning: 'Used local AI engine' });
  }
});

// Setup Vite middleware in dev or static files in prod
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Lumina Cut Studio Server listening on port ${PORT}`);
  });
}

startServer();
