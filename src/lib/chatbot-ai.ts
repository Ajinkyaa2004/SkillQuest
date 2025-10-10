import OpenAI from 'openai';

// Initialize OpenAI client (will be null if no API key is provided)
let openai: OpenAI | null = null;

// Check if API key is available
const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
if (apiKey) {
  openai = new OpenAI({
    apiKey: apiKey,
    dangerouslyAllowBrowser: true, // Note: In production, use a backend proxy
  });
}

export const isAIEnabled = (): boolean => {
  return openai !== null;
};

export const getAIResponse = async (
  userMessage: string,
  conversationHistory: { role: 'user' | 'assistant'; content: string }[]
): Promise<string> => {
  if (!openai) {
    throw new Error('AI is not enabled. Please set VITE_OPENAI_API_KEY in your environment.');
  }

  const systemPrompt = `You are a helpful assistant for the IFA (Investment Fund Advisors) hiring platform. 
Your role is to help candidates with:
- Assessment rules and duration (each game is 5 minutes, 3 games total)
- Game instructions (Minesweeper, Unblock Me, Water Capacity)
- Scoring system (based on puzzles/levels completed)
- Profile completion requirements
- Trial mode (practice mode after completing scored version)
- Fullscreen and tab switching policies (3 warnings = disqualification)
- Results and leaderboard information
- Contact methods (email, WhatsApp, Telegram)

Be concise, friendly, and helpful. Keep responses under 150 words unless detailed instructions are needed.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        ...conversationHistory,
        { role: 'user', content: userMessage },
      ],
      max_tokens: 300,
      temperature: 0.7,
    });

    return response.choices[0]?.message?.content || 'I apologize, but I could not generate a response. Please try again.';
  } catch (error) {
    console.error('AI Response Error:', error);
    throw error;
  }
};

export const generateRelatedQuestions = (userQuery: string, botResponse: string): string[] => {
  // Generate contextual related questions based on the topic
  const relatedQuestionsMap: Record<string, string[]> = {
    time: [
      'What happens if I run out of time?',
      'Can I pause the timer?',
      'How is the time tracked?',
    ],
    games: [
      'How do I unlock the next game?',
      'Can I replay a game?',
      'What skills does each game test?',
    ],
    score: [
      'What is a good score?',
      'How do recruiters see my score?',
      'Can I retake the assessment?',
    ],
    profile: [
      'Is resume upload mandatory?',
      'Can I edit my profile later?',
      'What information is required?',
    ],
    minesweeper: [
      'What are the controls for Minesweeper?',
      'How many mines are there?',
      'What happens if I hit a mine?',
    ],
    'unblock me': [
      'How do I move blocks in Unblock Me?',
      'What is the goal of Unblock Me?',
      'Are there hints available?',
    ],
    'water capacity': [
      'How many jugs are in Water Capacity?',
      'What operations can I perform?',
      'How do I achieve the target?',
    ],
    trial: [
      'Does trial mode affect my score?',
      'When can I access trial mode?',
      'How long is trial mode?',
    ],
    fullscreen: [
      'What if fullscreen exits accidentally?',
      'Why is fullscreen required?',
      'Can I use multiple monitors?',
    ],
    tab: [
      'What counts as tab switching?',
      'How many warnings do I get?',
      'What happens after 3 warnings?',
    ],
  };

  const lowerQuery = userQuery.toLowerCase();
  
  for (const [key, questions] of Object.entries(relatedQuestionsMap)) {
    if (lowerQuery.includes(key)) {
      return questions;
    }
  }

  // Default related questions
  return [
    'How long is each game?',
    'What games are included?',
    'How is scoring calculated?',
  ];
};
