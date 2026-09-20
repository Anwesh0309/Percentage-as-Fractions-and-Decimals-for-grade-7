// Data for the four Simulate stations.
//   A  Percent Grid Lab      – explore how a hundred grid, a fraction, a decimal and a percent link up
//   B  Number Line Sorter    – place mixed-form cards on a 0%–100% number line by yourself
//   C  Imposter Detective    – three cards show the same amount, one is an imposter
//   D  Real-World Percent Lab – complete missions with a battery, bottle, class vote and test score

// ---------- Station A: landmark discoveries on the hundred grid ----------
export const gridLandmarks = [
  {
    id: 'half', percent: 50, badge: '½', name: 'One half', key: 'discover_half',
    text: 'You found one half! 50 out of 100 squares is 50%, 1/2 and 0.5. One amount in three costumes!',
  },
  {
    id: 'quarter', percent: 25, badge: '¼', name: 'One quarter', key: 'discover_quarter',
    text: 'You found one quarter! 25 out of 100 squares is 25%, 1/4 and 0.25!',
  },
  {
    id: 'threeq', percent: 75, badge: '¾', name: 'Three quarters', key: 'discover_threeq',
    text: 'Three quarters! 75 out of 100 squares is 75%, 3/4 and 0.75!',
  },
  {
    id: 'tenth', percent: 10, badge: '⅒', name: 'One tenth', key: 'discover_tenth',
    text: 'One tenth! 10 out of 100 squares is 10%, 1/10 and 0.1!',
  },
];

// ---------- Station B: Number Line Sorter rounds ----------
// slots: the tick positions (in %) on the line. cards: mixed forms, value = position in %.
const tens = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
const eighths = [0, 12.5, 25, 37.5, 50, 62.5, 75, 87.5, 100];

export const sorterRounds = [
  {
    id: 1,
    subtitle: 'Tenths & halves',
    slots: tens,
    cards: [
      { id: 'r1a', label: '0.2', value: 20 },
      { id: 'r1b', label: '3/10', value: 30 },
      { id: 'r1c', label: '40%', value: 40 },
      { id: 'r1d', label: '1/2', value: 50 },
      { id: 'r1e', label: '0.9', value: 90 },
    ],
  },
  {
    id: 2,
    subtitle: 'Fifths & tenths',
    slots: tens,
    cards: [
      { id: 'r2a', label: '1/10', value: 10 },
      { id: 'r2b', label: '1/5', value: 20 },
      { id: 'r2c', label: '3/5', value: 60 },
      { id: 'r2d', label: '70%', value: 70 },
      { id: 'r2e', label: '0.8', value: 80 },
    ],
  },
  {
    id: 3,
    subtitle: 'Eighths — the tricky ones!',
    slots: eighths,
    cards: [
      { id: 'r3a', label: '1/8', value: 12.5 },
      { id: 'r3b', label: '0.25', value: 25 },
      { id: 'r3c', label: '37.5%', value: 37.5 },
      { id: 'r3d', label: '5/8', value: 62.5 },
      { id: 'r3e', label: '0.875', value: 87.5 },
    ],
  },
];

// ---------- Station C: Imposter Detective cases ----------
// Exactly ONE card (imposter) does not match the other three.
export const detectiveCases = [
  {
    id: 1, title: 'The Missing Half',
    cards: ['1/2', '0.5', '5%', '50%'], imposter: 2,
    reveal: '5% is only 5/100. The other three all show one half: 1/2 = 0.5 = 50%.',
  },
  {
    id: 2, title: 'Three-Quarters Caper',
    cards: ['3/4', '0.34', '75%', '0.75'], imposter: 1,
    reveal: '0.34 is only 34%. The other three all show three quarters: 3/4 = 0.75 = 75%.',
  },
  {
    id: 3, title: 'The Slippery Decimal Point',
    cards: ['0.07', '7/10', '70%', '0.7'], imposter: 0,
    reveal: '0.07 is only 7%. The other three all show seven tenths: 7/10 = 0.7 = 70%.',
  },
  {
    id: 4, title: 'Sixty Percent Suspects',
    cards: ['60%', '0.6', '3/5', '35%'], imposter: 3,
    reveal: '35% is not 60%. The other three all show three fifths: 3/5 = 0.6 = 60%.',
  },
  {
    id: 5, title: 'The 45% Mix-Up',
    cards: ['45%', '4.5%', '9/20', '0.45'], imposter: 1,
    reveal: '4.5% is only 0.045. The other three all show nine twentieths: 9/20 = 0.45 = 45%.',
  },
  {
    id: 6, title: 'The Eighth Wonder',
    cards: ['0.375', '37.5%', '3/8', '0.38'], imposter: 3,
    reveal: '0.38 is 38%, but 3/8 = 0.375 = 37.5%. Close, but not equal!',
  },
];

// ---------- Station D: Real-World Percent Lab ----------
// Every target is a multiple of 20% (or a slider step) so it works for every class size / test total.
export const realWorldSkins = [
  {
    id: 'battery', icon: '🔋', name: 'Phone Battery',
    missions: [
      { key: 'mission_battery_1', text: 'Charge the battery to 3/4.', target: 75 },
      { key: 'mission_battery_2', text: 'Set the battery to 0.2. That is a low battery!', target: 20 },
      { key: 'mission_battery_3', text: 'Make the battery show 90%.', target: 90 },
    ],
  },
  {
    id: 'bottle', icon: '🥤', name: 'Water Bottle',
    missions: [
      { key: 'mission_bottle_1', text: 'Fill the bottle to 0.5.', target: 50 },
      { key: 'mission_bottle_2', text: 'Fill the bottle to 1/5.', target: 20 },
      { key: 'mission_bottle_3', text: 'Fill the bottle to 70%.', target: 70 },
    ],
  },
  {
    id: 'vote', icon: '🧑‍🎓', name: 'Class Vote',
    missions: [
      { key: 'mission_vote_1', text: 'Get 3/5 of the class to vote for pizza.', target: 60 },
      { key: 'mission_vote_2', text: 'Get 0.4 of the class to vote for pizza.', target: 40 },
      { key: 'mission_vote_3', text: 'Get 80% of the class to vote for pizza.', target: 80 },
    ],
  },
  {
    id: 'score', icon: '📝', name: 'Test Score',
    missions: [
      { key: 'mission_score_1', text: 'Score 4/5 of the marks on the test.', target: 80 },
      { key: 'mission_score_2', text: 'Show a test score of 0.6.', target: 60 },
      { key: 'mission_score_3', text: 'Score full marks: 100%!', target: 100 },
    ],
  },
];

export const CLASS_SIZES = [10, 20, 25, 50];
export const TEST_TOTALS = [20, 25, 40, 50];
