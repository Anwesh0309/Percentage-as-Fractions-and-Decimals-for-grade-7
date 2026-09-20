// Styled narration segment helpers (see audio_generation_pipeline.md §2.D).
// A segment = { text, style, key }.  `key` (optional) points straight at a pre-generated MP3.

export const seg = (text, style = 'statement', key = null) => ({ text, style, key });

export const say = (text, key) => seg(text, 'statement', key);
export const ask = (text, key) => seg(text, 'question', key);
export const cheer = (text, key) => seg(text, 'celebration', key);
export const emphasize = (text, key) => seg(text, 'emphasis', key);
export const think = (text, key) => seg(text, 'thinking', key);
export const celebrate = (text, key) => seg(text, 'celebration', key);
export const instruct = (text, key) => seg(text, 'instruction', key);
export const encourage = (text, key) => seg(text, 'encouragement', key);
