// Narration script — the SINGLE source of truth for everything Robo says.
//
//  • Only paragraph text and questions are narrated. Titles / headings / labels NEVER are.
//  • The text here is exactly what is shown on screen (1:1 parity); digits, fractions and % signs are
//    converted to spoken words at generation time by utils/speech.js (toSpeech).
//  • scripts/generate_audio.js reads `narrationEntries` to create every MP3 + src/utils/audioMap.js.

import { storySlides } from './storySlides.js';
import { reflectTopics } from './reflectTopics.js';
import { gridLandmarks, realWorldSkins } from './stationData.js';
import { staticQuestionBank } from './questionBank.js';
import { seg } from '../utils/segments.js';

const entries = [];
const add = (key, text, style = 'statement') => entries.push({ key, text, style });

// ── Home / Wonder ────────────────────────────────────────────
add('home_intro', "Ready to see how one amount can wear three costumes? Let's roll!", 'celebration');
add('wonder_prompt', 'Robo cuts a pizza into 4 equal slices and eats 1 slice. Alex says: "That\'s 1/4 of the pizza, 0.25 of the pizza, and 25% of the pizza. Those are three different amounts!" Is that actually true?', 'question');
add('wonder_teaser', 'What if Robo ate a second slice? Which numbers would change, and would they all change together?', 'thinking');
add('wonder_rule', 'Fractions, decimals and percents are three names for exactly the same amount!', 'emphasis');

// ── Story (narrative paragraph + key-point sentence per slide) ──
storySlides.forEach((s, i) => {
  add(`story_slide_${i + 1}`, s.narrative, 'statement');
  add(`story_slide_${i + 1}_key`, s.keyPoint, 'emphasis');
});

// ── Simulate: station intros ─────────────────────────────────
add('station_a_intro', 'Welcome to the Percent Grid Lab! Tap or drag on the grid to shade squares. Watch the fraction, the decimal and the percent change together as you shade!', 'instruction');
add('station_b_intro', 'Time for the Number Line Sorter! Drag each card onto the number line where it belongs. Change each fraction or decimal into a percent to find its spot, then press Check!', 'instruction');
add('station_c_intro', 'Welcome, detective! Three of these four cards show exactly the same amount, but one imposter is hiding. Change the cards into the same costume to spot the imposter, then tap it!', 'instruction');
add('station_d_intro', 'Welcome to the Real-World Percent Lab! Pick an object, then complete each mission by setting it to the amount shown. Fractions, decimals and percents are all fair game!', 'instruction');

// ── Simulate: live feedback lines ────────────────────────────
gridLandmarks.forEach((l) => add(l.key, l.text, 'celebration'));
add('discover_all', 'Amazing! You found all four landmarks. Percent is just a number out of 100!', 'celebration');
add('sorter_round_correct', 'Perfect! Every card is on the right spot. Changing to percents makes the number line easy!', 'celebration');
add('sorter_some_wrong', 'Some cards bounced back. Change each fraction or decimal into a percent, then try again!', 'encouragement');
add('sorter_all_rounds', 'All three rounds complete! You are a number line master!', 'celebration');
add('detective_caught', 'Case closed! You caught the imposter. Great detective work!', 'celebration');
add('detective_wrong', 'Not the imposter! That card matches the others. Keep investigating!', 'encouragement');
add('detective_all', 'All the cases are solved! You are a top detective!', 'celebration');
add('mission_complete', 'Mission complete! You matched the amount exactly!', 'celebration');
add('mission_all', 'All the missions for this object are done! Try another one!', 'celebration');
realWorldSkins.forEach((sk) => sk.missions.forEach((m) => add(m.key, m.text, 'instruction')));

// ── Practice ─────────────────────────────────────────────────
add('practice_welcome', 'Choose your world on the map! Beat each world to unlock the next. Earn stars and XP!', 'encouragement');
add('correct_cheer', 'Awesome job! You got it right!', 'celebration');
add('incorrect_try_again', 'Not quite. Remember, percent means out of 100!', 'encouragement');
add('out_of_hearts', "No worries! Let's practice some more. Try again to master this world!", 'encouragement');
add('world_complete', 'Congratulations! You completed the world and earned new stars!', 'celebration');

Object.values(staticQuestionBank).forEach((list) => {
  list.forEach((q) => {
    add(`${q.id}_prompt`, q.prompt, 'question');
    add(`${q.id}_hint`, q.hint, 'thinking');
  });
});

// ── Reflect ──────────────────────────────────────────────────
add('reflect_intro', "Amazing work! Let's reflect on what you learned.", 'celebration');
reflectTopics.forEach((t, i) => {
  add(`reflect_q${i + 1}`, t.question, 'question');
  add(`reflect_a${i + 1}`, t.answer, 'statement');
});

export const narrationEntries = entries;
export const narrationScript = Object.fromEntries(entries.map((e) => [e.key, e.text]));
export const narrationStyles = Object.fromEntries(entries.map((e) => [e.key, e.style]));

// ── Phase functions → arrays of styled segments (played with narrate()) ──
const S = (key) => seg(narrationScript[key], narrationStyles[key], key);

export const homeNarration = () => [S('home_intro')];
export const wonderNarration = () => [S('wonder_prompt'), S('wonder_teaser'), S('wonder_rule')];
export const storyNarration = (slideIndex) => [S(`story_slide_${slideIndex + 1}`), S(`story_slide_${slideIndex + 1}_key`)];
export const stationIntroNarration = (stationId) => [S(`station_${stationId.toLowerCase()}_intro`)];
export const eventNarration = (key) => [S(key)];
export const practiceWelcomeNarration = () => [S('practice_welcome')];
export const questionNarration = (questionId) => [S(`${questionId}_prompt`)];
export const hintNarration = (questionId) => [S(`${questionId}_hint`)];
export const reflectIntroNarration = () => [S('reflect_intro')];
export const reflectQuestionNarration = (topicIndex) => [S(`reflect_q${topicIndex + 1}`), S(`reflect_a${topicIndex + 1}`)];

export default narrationScript;
