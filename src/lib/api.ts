import { User, ApplicantProfile, Assessment, LeaderboardEntry } from '@/types';

// API Base URL - reads from environment variable
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Generic API call function with error handling
async function apiCall<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || `HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
}

// ==================== USER API ====================

export const userApi = {
  // Get all users
  getAll: (): Promise<User[]> => apiCall<User[]>('/users'),
  
  // Get user by ID
  getById: (id: string): Promise<User> => apiCall<User>(`/users/${id}`),
  
  // Get user by email
  getByEmail: (email: string): Promise<User> => apiCall<User>(`/users/email/${email}`),
  
  // Get user by Google ID
  getByGoogleId: (googleId: string): Promise<User> => apiCall<User>(`/users/google/${googleId}`),
  
  // Create or update user
  createOrUpdate: (userData: User): Promise<User> => apiCall<User>('/users', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),
};

// ==================== PROFILE API ====================

export const profileApi = {
  // Get all profiles
  getAll: (): Promise<ApplicantProfile[]> => apiCall<ApplicantProfile[]>('/profiles'),
  
  // Get profile by user ID
  getByUserId: (userId: string): Promise<ApplicantProfile> => apiCall<ApplicantProfile>(`/profiles/user/${userId}`),
  
  // Create or update profile
  createOrUpdate: (profileData: ApplicantProfile): Promise<ApplicantProfile> => apiCall<ApplicantProfile>('/profiles', {
    method: 'POST',
    body: JSON.stringify(profileData),
  }),
};

// ==================== ASSESSMENT API ====================

export const assessmentApi = {
  // Get all assessments
  getAll: (): Promise<Assessment[]> => apiCall<Assessment[]>('/assessments'),
  
  // Get assessment by user ID
  getByUserId: (userId: string): Promise<Assessment> => apiCall<Assessment>(`/assessments/user/${userId}`),
  
  // Create or update assessment
  createOrUpdate: (assessmentData: Assessment): Promise<Assessment> => apiCall<Assessment>('/assessments', {
    method: 'POST',
    body: JSON.stringify(assessmentData),
  }),
};

// ==================== LEADERBOARD API ====================

export const leaderboardApi = {
  // Get leaderboard
  get: (): Promise<LeaderboardEntry[]> => apiCall<LeaderboardEntry[]>('/leaderboard'),
};
