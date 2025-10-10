import Fuse from 'fuse.js';

export interface FAQItem {
  question: string;
  answer: string;
  keywords: string[];
  category: string;
}

export const FAQ_DATABASE: FAQItem[] = [
  {
    question: 'How long is the assessment?',
    answer: 'Each game in the assessment runs for exactly 5 minutes. You will complete three games in total, making it a 15-minute assessment.',
    keywords: ['duration', 'time', 'long', 'minutes', 'how much time'],
    category: 'general',
  },
  {
    question: 'What games are included?',
    answer: 'There are three games: Minesweeper (tests risk assessment), Unblock Me (tests spatial reasoning), and Water Capacity (tests logical sequencing).',
    keywords: ['games', 'what games', 'which games', 'list', 'included'],
    category: 'games',
  },
  {
    question: 'How is scoring done?',
    answer: 'Your score is based on the number of puzzles or levels you complete within the 5-minute time limit for each game. The total score is calculated from all three games.',
    keywords: ['score', 'scoring', 'points', 'calculated', 'grading'],
    category: 'scoring',
  },
  {
    question: 'How do I unlock games?',
    answer: 'Games are unlocked sequentially. You must complete Game 1 (Minesweeper) to unlock Game 2 (Unblock Me), and complete Game 2 to unlock Game 3 (Water Capacity).',
    keywords: ['unlock', 'locked', 'sequential', 'order', 'next game'],
    category: 'games',
  },
  {
    question: 'What is trial mode?',
    answer: 'Trial mode is a practice mode available after you complete the scored version of the previous game. It allows you to practice without affecting your score.',
    keywords: ['trial', 'practice', 'mode', 'training'],
    category: 'general',
  },
  {
    question: 'Do I need to complete my profile?',
    answer: 'You need to complete your profile with personal information, academic details, career preferences, and contact information before starting the assessment.',
    keywords: ['profile', 'complete', 'information', 'details', 'required'],
    category: 'profile',
  },
  {
    question: 'Is fullscreen required?',
    answer: 'Yes, the assessment must be played in fullscreen mode to ensure a fair testing environment and minimize distractions.',
    keywords: ['fullscreen', 'full screen', 'required', 'mandatory'],
    category: 'rules',
  },
  {
    question: 'What about tab switching?',
    answer: 'Tab switching is monitored during the assessment. You will receive warnings, and excessive tab switching (3 times) will result in disqualification.',
    keywords: ['tab', 'switch', 'switching', 'warning', 'disqualification'],
    category: 'rules',
  },
  {
    question: 'How do I view my results?',
    answer: 'After completing all three games, you can view your results on the Results page. Your scores will also be visible to recruiters on the leaderboard.',
    keywords: ['results', 'view', 'see', 'check', 'scores'],
    category: 'results',
  },
  {
    question: 'What is the leaderboard?',
    answer: 'The leaderboard shows all candidates ranked by their total assessment scores. Recruiters can view this to identify top performers.',
    keywords: ['leaderboard', 'ranking', 'top', 'candidates', 'rank'],
    category: 'results',
  },
  {
    question: 'How will recruiters contact me?',
    answer: 'After completing your assessment, recruiters will contact you via email, WhatsApp, or Telegram based on your performance.',
    keywords: ['contact', 'reach', 'communication', 'recruiters'],
    category: 'general',
  },
  {
    question: 'How do I play Minesweeper?',
    answer: 'Minesweeper tests risk assessment and deductive logic. Left-click to reveal cells, right-click to flag mines. Clear all safe cells without hitting mines.',
    keywords: ['minesweeper', 'mines', 'play', 'controls', 'how to'],
    category: 'games',
  },
  {
    question: 'How do I play Unblock Me?',
    answer: 'Unblock Me tests spatial reasoning. Click a block to select it, then use arrow buttons to move it. Move the red car to the exit on the right.',
    keywords: ['unblock me', 'unblock', 'blocks', 'play', 'controls'],
    category: 'games',
  },
  {
    question: 'How do I play Water Capacity?',
    answer: 'Water Capacity tests logical sequencing. Use Fill, Empty, and Pour buttons to transfer water between jugs and achieve the exact target amount.',
    keywords: ['water capacity', 'water', 'jugs', 'play', 'controls'],
    category: 'games',
  },
  {
    question: 'Is resume upload required?',
    answer: 'Resume upload is optional during profile completion. You can upload PDF, DOC, or DOCX files up to 5MB.',
    keywords: ['resume', 'upload', 'cv', 'optional', 'required'],
    category: 'profile',
  },
  {
    question: 'How do I enter my CGPA?',
    answer: 'Enter your CGPA or GPA on a scale of 0-10. This information is required for profile completion.',
    keywords: ['cgpa', 'gpa', 'grades', 'academic'],
    category: 'profile',
  },
  {
    question: 'How do I select my location?',
    answer: 'Select your preferred work location from the dropdown menu. This helps recruiters match you with suitable positions.',
    keywords: ['location', 'city', 'place', 'work location'],
    category: 'profile',
  },
  {
    question: 'How do I select roles?',
    answer: 'Select one or more roles you are interested in. This helps recruiters understand your career preferences.',
    keywords: ['roles', 'job', 'position', 'career', 'interested'],
    category: 'profile',
  },
  {
    question: 'What is my Telegram username?',
    answer: 'Enter your Telegram username (e.g., @username) so recruiters can contact you via Telegram.',
    keywords: ['telegram', 'username', 'contact', '@'],
    category: 'profile',
  },
];

// Create Fuse instance for fuzzy searching
const fuse = new Fuse(FAQ_DATABASE, {
  keys: [
    { name: 'question', weight: 0.4 },
    { name: 'keywords', weight: 0.4 },
    { name: 'answer', weight: 0.2 },
  ],
  threshold: 0.4, // Lower = more strict, Higher = more lenient
  includeScore: true,
  minMatchCharLength: 3,
});

export const fuzzySearch = (query: string): FAQItem | null => {
  if (!query || query.trim().length < 2) {
    return null;
  }

  const results = fuse.search(query);
  
  if (results.length > 0 && results[0].score && results[0].score < 0.5) {
    return results[0].item;
  }

  return null;
};

export const getDefaultResponse = (): string => {
  return "I'm not sure about that. You can ask me about:\n• Assessment duration and rules\n• Game instructions (Minesweeper, Unblock Me, Water Capacity)\n• Scoring system\n• Profile completion\n• Trial mode\n• Fullscreen and tab switching policies\n• Results and leaderboard";
};
