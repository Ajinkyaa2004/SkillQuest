export type UserRole = 'applicant' | 'admin' | 'employee' | 'client';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface ApplicantProfile {
  userId: string;
  candidateId: string;
  name: string;
  email: string;
  phone: string;
  collegeName: string;
  cgpa: string;
  location: string;
  interestedRoles: string[];
  resumeUrl?: string;
  resumeLink?: string;
  websiteLink?: string;
  telegramId: string;
  profileCompleted: boolean;
  createdAt: string;
}

export type GameType = 'minesweeper' | 'unblock-me' | 'water-capacity';

export interface GameScore {
  gameType: GameType;
  puzzlesCompleted: number;
  timeSpent: number; // in seconds
  errorRate?: number;
  minimumMoves?: number;
  completedAt: string;
  trialCompleted: boolean;
  failed?: boolean; // true if disqualified or failed
  failureReason?: string;
}

export interface Assessment {
  userId: string;
  candidateId: string;
  games: {
    minesweeper: GameScore | null;
    'unblock-me': GameScore | null;
    'water-capacity': GameScore | null;
  };
  totalScore: number;
  completedAt?: string;
  currentGame?: GameType;
  trialMode: {
    minesweeper: boolean;
    'unblock-me': boolean;
    'water-capacity': boolean;
  };
}

export interface LeaderboardEntry {
  candidateId: string;
  name: string;
  email: string;
  collegeName: string;
  location: string;
  totalScore: number;
  completedAt: string;
  gameScores: {
    minesweeper: number;
    unblockMe: number;
    waterCapacity: number;
  };
}

export interface Message {
  id: string;
  type: 'email' | 'whatsapp' | 'telegram';
  template: string;
  recipients: string[];
  sentAt: string;
  status: 'sent' | 'pending' | 'failed';
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  message: string;
  timestamp: string;
  relatedQuestions?: string[];
  feedback?: 'positive' | 'negative' | null;
}

export const LOCATIONS = [
  'Mumbai',
  'Delhi',
  'Bangalore',
  'Hyderabad',
  'Chennai',
  'Kolkata',
  'Pune',
  'Ahmedabad',
  'Remote',
  'Other'
];

export const ROLES = [
  'Software Engineer',
  'Data Analyst',
  'Product Manager',
  'UI/UX Designer',
  'Business Analyst',
  'Marketing Manager',
  'Sales Executive',
  'HR Manager',
  'Other'
];

export const MESSAGE_TEMPLATES = {
  'interview-invitation': {
    name: 'Interview Invitation',
    email: 'Dear {name}, Congratulations! You have been shortlisted for an interview. Please check your email for details.',
    whatsapp: 'Hi {name}! 🎉 You\'re invited for an interview. Check your email for details.',
    telegram: 'Congratulations {name}! You\'ve been shortlisted for an interview. Details in your email.'
  },
  'assessment-complete': {
    name: 'Assessment Complete',
    email: 'Dear {name}, Thank you for completing the assessment. We will review your performance and get back to you soon.',
    whatsapp: 'Hi {name}! Thanks for completing the assessment. We\'ll be in touch soon! 👍',
    telegram: 'Thanks for completing the assessment, {name}! We\'ll review and get back to you.'
  },
  'application-received': {
    name: 'Application Received',
    email: 'Dear {name}, We have received your application. Good luck with the assessment!',
    whatsapp: 'Hi {name}! Your application is received. Best of luck! 🍀',
    telegram: 'Application received, {name}! Good luck with your assessment.'
  }
};
