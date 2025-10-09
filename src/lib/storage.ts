import { User, ApplicantProfile, Assessment, LeaderboardEntry, Message } from '@/types';

const STORAGE_KEYS = {
  USERS: 'ifa_users',
  PROFILES: 'ifa_profiles',
  ASSESSMENTS: 'ifa_assessments',
  MESSAGES: 'ifa_messages',
  CURRENT_USER: 'ifa_current_user',
};

// User Management
export const saveUser = (user: User): void => {
  const users = getUsers();
  const existingIndex = users.findIndex(u => u.id === user.id);
  if (existingIndex >= 0) {
    users[existingIndex] = user;
  } else {
    users.push(user);
  }
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
};

export const getUsers = (): User[] => {
  const data = localStorage.getItem(STORAGE_KEYS.USERS);
  return data ? JSON.parse(data) : [];
};

export const getUserByEmail = (email: string): User | null => {
  const users = getUsers();
  return users.find(u => u.email === email) || null;
};

export const setCurrentUser = (user: User | null): void => {
  if (user) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }
};

export const getCurrentUser = (): User | null => {
  const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  return data ? JSON.parse(data) : null;
};

// Profile Management
export const saveProfile = (profile: ApplicantProfile): void => {
  const profiles = getProfiles();
  const existingIndex = profiles.findIndex(p => p.userId === profile.userId);
  if (existingIndex >= 0) {
    profiles[existingIndex] = profile;
  } else {
    profiles.push(profile);
  }
  localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));
};

export const getProfiles = (): ApplicantProfile[] => {
  const data = localStorage.getItem(STORAGE_KEYS.PROFILES);
  return data ? JSON.parse(data) : [];
};

export const getProfileByUserId = (userId: string): ApplicantProfile | null => {
  const profiles = getProfiles();
  return profiles.find(p => p.userId === userId) || null;
};

// Assessment Management
export const saveAssessment = (assessment: Assessment): void => {
  const assessments = getAssessments();
  const existingIndex = assessments.findIndex(a => a.userId === assessment.userId);
  if (existingIndex >= 0) {
    assessments[existingIndex] = assessment;
  } else {
    assessments.push(assessment);
  }
  localStorage.setItem(STORAGE_KEYS.ASSESSMENTS, JSON.stringify(assessments));
};

export const getAssessments = (): Assessment[] => {
  const data = localStorage.getItem(STORAGE_KEYS.ASSESSMENTS);
  return data ? JSON.parse(data) : [];
};

export const getAssessmentByUserId = (userId: string): Assessment | null => {
  const assessments = getAssessments();
  return assessments.find(a => a.userId === userId) || null;
};

// Leaderboard
export const getLeaderboard = (): LeaderboardEntry[] => {
  const profiles = getProfiles();
  const assessments = getAssessments();
  
  const leaderboard: LeaderboardEntry[] = assessments
    .filter(a => a.completedAt)
    .map(assessment => {
      const profile = profiles.find(p => p.userId === assessment.userId);
      if (!profile) return null;
      
      return {
        candidateId: assessment.candidateId,
        name: profile.name,
        email: profile.email,
        collegeName: profile.collegeName,
        location: profile.location,
        totalScore: assessment.totalScore,
        completedAt: assessment.completedAt!,
        gameScores: {
          minesweeper: assessment.games.minesweeper?.puzzlesCompleted || 0,
          unblockMe: assessment.games['unblock-me']?.puzzlesCompleted || 0,
          waterCapacity: assessment.games['water-capacity']?.puzzlesCompleted || 0,
        }
      };
    })
    .filter((entry): entry is LeaderboardEntry => entry !== null)
    .sort((a, b) => b.totalScore - a.totalScore);
  
  return leaderboard;
};

// Message Management
export const saveMessage = (message: Message): void => {
  const messages = getMessages();
  messages.push(message);
  localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
};

export const getMessages = (): Message[] => {
  const data = localStorage.getItem(STORAGE_KEYS.MESSAGES);
  return data ? JSON.parse(data) : [];
};

// Initialize default admin user
export const initializeDefaultAdmin = (): void => {
  const users = getUsers();
  const adminExists = users.some(u => u.email === 'admin@ifa.com');
  
  if (!adminExists) {
    const adminUser: User = {
      id: 'admin-default',
      email: 'admin@ifa.com',
      role: 'admin',
      createdAt: new Date().toISOString(),
    };
    saveUser(adminUser);
  }
};
