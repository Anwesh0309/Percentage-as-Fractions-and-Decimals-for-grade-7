# Percentage as Fractions and Decimals — Grade 6 Gamified Module

Interactive, narrated math module (Vite + React 19 + Tailwind 4 + Zustand).
Same UI/UX, layout and architecture as the *Angles around a point* module — new topic, new content, four new station activities.

## Quick start

```bash
npm install
npm run audio      # ONE-TIME: generates all narration MP3s with ElevenLabs (needs internet + API key)
npm run dev        # http://localhost:5173
```

`npm run build` → production bundle in `dist/`.

### Audio (ElevenLabs, voice "Alice")

| | |
|---|---|
| Voice ID | `Xb7hH8MSUJpSbSDYk0k2` (Alice — clear, engaging educator) |
| Model | `eleven_multilingual_v2` |
| API key | `.env.local` → `ELEVENLABS_API_KEY=...` (git-ignored; used only by the Node script, never bundled into the browser) |

* `npm run audio:dry` — shows what would be generated (no credits used).
* `npm run audio` — generates every missing MP3 (~212 files, ~15,400 characters). Existing files are skipped, so it is safe to re-run/resume.
  * Small quota? `node scripts/generate_audio.js --only=w3_` (one world) or `--limit=50`.
  * `--force` regenerates everything.
* `npm run audio:clean` — deletes MP3s no longer referenced by `src/utils/audioMap.js`.
* Until MP3s exist the app falls back to the browser's built-in voice, so it is never silent.

Per-style voice settings (celebration / encouragement / question / emphasis / thinking / statement / instruction) live in `src/utils/voiceSettings.js`.
Numbers, fractions and percents are converted to spoken words by `src/utils/speech.js` (e.g. `3/4` → "three quarters", `45%` → "forty-five percent"), so ElevenLabs never reads a fraction as a date.

**Content policy:** only paragraph text and questions are narrated — never titles or headings.

### Changing or adding narration

1. Edit the text in `src/data/narration.js` (or the data file it reads: `storySlides.js`, `reflectTopics.js`, `stationData.js`, `questionBank.js`). On-screen text and audio come from the same string, so they always match word-for-word.
2. `npm run audio` (only changed lines are generated)
3. `npm run audio:clean` (optional)

### Check the content

`npm run validate` re-verifies every one of the 100 practice questions numerically (single correct answer, no distractor equal to the answer, comparisons unambiguous) and checks that all narration converts to clean spoken words.

## Learning flow

1. **Home** → 2. **Wonder** (pizza slicer) → 3. **Story** (4 illustrated slides) → 4. **Simulate** → 5. **Practice** → 6. **Reflect**

### Simulate stations

| Station | Approach | Activity |
|---|---|---|
| A · Percent Grid Lab | understand | Shade a 100-square grid; fraction, decimal and percent update live. Discover the ½, ¼, ¾ and ⅒ landmarks. |
| B · Number Line Sorter | try it yourself | Drag mixed fraction / decimal / percent cards onto a 0–100% number line (3 rounds: tenths → fifths → eighths). |
| C · Imposter Detective | reason it out | 6 cases: three cards show the same amount, one is an imposter. One-use magnifier per case. |
| D · Real-World Percent Lab | apply it | Phone battery, water bottle, class vote and test score, each with 3 missions in fraction / decimal / percent form. |

### Practice worlds (10 questions each)

1 Meet Percent · 2 Percent → Fraction · 3 Simplify It · 4 Percent → Decimal · 5 Decimal → Percent · 6 Fraction → Percent · 7 Same Amount, New Costume · 8 Compare & Order · 9 Beyond 100% & Below 1% · 10 Real-Life Percent Problems

## Project structure

```
scripts/       generate_audio.js · clean_audio.js · validate_content.js
public/assets/ images/ (story slides) · audio/ (generated MP3s)
src/
  stages/      Home · Wonder · Story · Simulate · Practice · Reflect
  components/  HundredGrid · NumberLineSorter · ImposterDetective · RealWorldLab · PizzaSlicer
               PercentDiagramSVG · TripleReadout · MathText (stacked fractions) · TopNav · Mascot
  data/        narration · storySlides · stationData · questionBank · reflectTopics · worlds
  utils/       audio (engine) · audioMap (generated) · speech · voiceSettings · segments · mathValue
  store/       useAppStore (Zustand)
```

Layouts are designed for landscape screens ≥ 1024px wide; screens ≤ 820px tall automatically switch to a compact mode so nothing scrolls.
