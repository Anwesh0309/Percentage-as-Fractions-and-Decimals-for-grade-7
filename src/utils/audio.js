// Sound engine — pre-generated ElevenLabs narration + tiny synthesized UI sounds.
// Architecture follows audio_generation_pipeline.md:
//   1. Segment helpers (say / ask / cheer / emphasize / think / celebrate / instruct / encourage)
//   2. Cache check   : audioMap[text] / audioMap["key:<key>"] → static MP3 (zero latency)
//   3. Dynamic req.  : if an MP3 is missing AND VITE_ELEVENLABS_API_KEY is set, request it on the fly
//   4. Queue         : narrate(segments) plays sequentially; a `currentQueue` symbol prevents overlaps
//   5. Preloading    : while segment i plays, segment i+1 is already loading
// If no MP3 exists (e.g. `npm run audio` has not been run yet) it falls back to the browser voice so the
// module is never silent.

import { audioMap } from './audioMap.js';
import { toSpeech } from './speech.js';
import { VOICE_ID, MODEL_ID, getVoiceSettings } from './voiceSettings.js';
import { seg } from './segments.js';
import { narrationScript, narrationStyles } from '../data/narration.js';

export { seg, say, ask, cheer, emphasize, think, celebrate, instruct, encourage } from './segments.js';

const USE_BROWSER_VOICE_FALLBACK = true;

class SoundEngine {
  constructor() {
    this.currentAudio = null;
    this.audioEnabled = true;
    this.isPlaying = false;
    this.currentQueue = null;      // Symbol of the narrate() run that is allowed to keep playing
    this.cancelCurrent = null;     // resolves the in-flight playback promise when stop() is called
    this.preloaded = new Map();    // url -> HTMLAudioElement
    this.dynamicCache = new Map(); // "spoken|style" -> Promise<blobUrl | null>
    this.lastClickTime = 0;
    this.audioCtx = null;
  }

  setAudioEnabled(enabled) {
    this.audioEnabled = enabled;
    if (!enabled) this.stop();
  }

  // Immediately halts every kind of playback.
  stop() {
    this.currentQueue = null;
    if (this.currentAudio) {
      try { this.currentAudio.pause(); this.currentAudio.currentTime = 0; } catch { /* ignore */ }
      this.currentAudio = null;
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      try { window.speechSynthesis.cancel(); } catch { /* ignore */ }
    }
    const cancel = this.cancelCurrent;
    this.cancelCurrent = null;
    if (cancel) cancel();
    this.isPlaying = false;
  }

  // ── Lookup ────────────────────────────────────────────────
  resolveUrl({ key, text }) {
    if (key && audioMap[`key:${key}`]) return audioMap[`key:${key}`];
    if (text) {
      if (audioMap[text]) return audioMap[text];
      const spoken = toSpeech(text);
      if (audioMap[spoken]) return audioMap[spoken];
      if (audioMap[`key:${text}`]) return audioMap[`key:${text}`];
    }
    return null;
  }

  preload(segment) {
    const url = this.resolveUrl(segment);
    if (!url || this.preloaded.has(url)) return;
    try {
      const a = new Audio();
      a.preload = 'auto';
      a.src = url;
      this.preloaded.set(url, a);
    } catch { /* ignore */ }
  }

  // Optional on-the-fly generation (only when VITE_ELEVENLABS_API_KEY is provided)
  fetchDynamic(spoken, style) {
    const apiKey = typeof import.meta !== 'undefined' ? import.meta.env?.VITE_ELEVENLABS_API_KEY : null;
    if (!apiKey || !spoken) return Promise.resolve(null);
    const cacheKey = `${spoken}|${style}`;
    if (!this.dynamicCache.has(cacheKey)) {
      this.dynamicCache.set(cacheKey, (async () => {
        try {
          const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'audio/mpeg', 'xi-api-key': apiKey },
            body: JSON.stringify({ text: spoken, model_id: MODEL_ID, voice_settings: getVoiceSettings(style) }),
          });
          if (!res.ok) throw new Error(`ElevenLabs ${res.status}`);
          return URL.createObjectURL(await res.blob());
        } catch (e) {
          console.warn('[SoundEngine] dynamic ElevenLabs request failed:', e.message);
          return null;
        }
      })());
    }
    return this.dynamicCache.get(cacheKey);
  }

  // ── Playback primitives (each resolves when finished / cancelled) ──
  playUrl(url) {
    return new Promise((resolve) => {
      const audio = this.preloaded.get(url) || new Audio(url);
      this.preloaded.delete(url);
      try { audio.currentTime = 0; } catch { /* not seekable yet */ }
      this.currentAudio = audio;
      this.isPlaying = true;

      let finished = false;
      const done = (result) => {
        if (finished) return;
        finished = true;
        audio.onended = null;
        audio.onerror = null;
        if (this.currentAudio === audio) this.currentAudio = null;
        this.cancelCurrent = null;
        this.isPlaying = false;
        resolve(result);
      };
      this.cancelCurrent = () => done('cancelled');
      audio.onended = () => done('ended');
      audio.onerror = () => done('error');
      audio.play().catch((err) => {
        // NotAllowedError = browser autoplay policy (user hasn't interacted yet)
        done(err && err.name === 'NotAllowedError' ? 'blocked' : 'error');
      });
    });
  }

  speakBrowser(spoken) {
    return new Promise((resolve) => {
      if (typeof window === 'undefined' || !window.speechSynthesis || !spoken) return resolve('error');
      try {
        const u = new SpeechSynthesisUtterance(spoken);
        u.lang = 'en-US';
        u.rate = 0.98;
        u.pitch = 1.05;
        const voices = window.speechSynthesis.getVoices();
        const pick = voices.find((v) => /female|samantha|zira|aria|jenny/i.test(v.name) && /^en/i.test(v.lang))
          || voices.find((v) => /^en/i.test(v.lang));
        if (pick) u.voice = pick;
        let finished = false;
        const done = (r) => { if (finished) return; finished = true; this.cancelCurrent = null; this.isPlaying = false; resolve(r); };
        const safety = setTimeout(() => done('ended'), spoken.split(/\s+/).length * 600 + 3000);
        this.cancelCurrent = () => { clearTimeout(safety); done('cancelled'); };
        u.onend = () => { clearTimeout(safety); done('ended'); };
        u.onerror = () => { clearTimeout(safety); done('error'); };
        this.isPlaying = true;
        window.speechSynthesis.speak(u);
      } catch {
        resolve('error');
      }
    });
  }

  async playSegment(segment, token) {
    const spoken = toSpeech(segment.text);
    let url = this.resolveUrl(segment);
    if (!url) url = await this.fetchDynamic(spoken, segment.style);
    if (this.currentQueue !== token) return;

    if (url) {
      const result = await this.playUrl(url);
      if (result !== 'error') return; // ended / cancelled / blocked
    }
    if (USE_BROWSER_VOICE_FALLBACK && this.currentQueue === token) {
      if (!url) console.warn(`[SoundEngine] No pre-generated audio for "${spoken.slice(0, 40)}…" — run "npm run audio". Using browser voice.`);
      await this.speakBrowser(spoken);
    }
  }

  // ── Public API ────────────────────────────────────────────
  // Plays an array of segments sequentially, preloading the next one while the current one plays.
  async narrate(segments) {
    const list = (Array.isArray(segments) ? segments : [segments]).filter((s) => s && s.text);
    if (!this.audioEnabled || list.length === 0) return;

    this.stop();
    const token = Symbol('narration');
    this.currentQueue = token;

    for (let i = 0; i < list.length; i++) {
      if (this.currentQueue !== token || !this.audioEnabled) return;
      if (list[i + 1]) this.preload(list[i + 1]);
      await this.playSegment(list[i], token);
    }
    if (this.currentQueue === token) this.currentQueue = null;
  }

  // Convenience: play one narration key (e.g. "correct_cheer", "w3_q4_hint")
  playKey(key) {
    const text = narrationScript[key];
    if (!text) return Promise.resolve();
    return this.narrate([seg(text, narrationStyles[key] || 'statement', key)]);
  }

  // Convenience: play arbitrary text (looked up in audioMap by exact/spoken text)
  playText(text, style = 'statement') {
    if (!text) return Promise.resolve();
    return this.narrate([seg(text, style)]);
  }

  // ── Tiny synthesized UI sounds (one shared AudioContext) ──
  getCtx() {
    if (typeof window === 'undefined') return null;
    const Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) return null;
    if (!this.audioCtx) this.audioCtx = new Ctor();
    if (this.audioCtx.state === 'suspended') this.audioCtx.resume().catch(() => {});
    return this.audioCtx;
  }

  tone({ freq = 600, end = freq, dur = 0.08, type = 'sine', vol = 0.06, delay = 0 }) {
    if (!this.audioEnabled) return;
    try {
      const ctx = this.getCtx();
      if (!ctx) return;
      const t0 = ctx.currentTime + delay;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, t0);
      if (end !== freq) osc.frequency.exponentialRampToValueAtTime(end, t0 + dur);
      gain.gain.setValueAtTime(vol, t0);
      gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t0);
      osc.stop(t0 + dur + 0.01);
    } catch { /* ignore web audio errors if restricted */ }
  }

  playDragClick() {
    const now = Date.now();
    if (this.lastClickTime && now - this.lastClickTime < 45) return; // throttled for smooth drag sound
    this.lastClickTime = now;
    this.tone({ freq: 900, end: 250, dur: 0.018, vol: 0.06 });
  }

  playPop() { this.tone({ freq: 420, end: 760, dur: 0.07, vol: 0.07 }); }
  playSuccess() {
    this.tone({ freq: 660, dur: 0.11, vol: 0.07 });
    this.tone({ freq: 880, dur: 0.11, vol: 0.07, delay: 0.1 });
    this.tone({ freq: 1320, dur: 0.18, vol: 0.06, delay: 0.2 });
  }
  playWrong() {
    this.tone({ freq: 240, end: 150, dur: 0.22, type: 'triangle', vol: 0.08 });
  }
}

export const soundEngine = new SoundEngine();
export const narrate = (segments) => soundEngine.narrate(segments);
export const stopNarration = () => soundEngine.stop();
export default soundEngine;
