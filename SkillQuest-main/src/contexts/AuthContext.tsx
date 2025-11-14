import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '@/types';
import { getCurrentUser, setCurrentUser, getUserByEmail, saveUser, initializeDefaultAdmin } from '@/lib/storage';
import { generateId } from '@/lib/utils';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: UserRole) => Promise<boolean>;
  signup: (email: string, password: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    initializeDefaultAdmin();
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
  }, []);

  const login = async (email: string, password: string, role: UserRole): Promise<boolean> => {
    // For MVP, simplified authentication
    // Admin: admin@ifa.com / admin123
    // Others: any email with password123
    
    if (role === 'admin') {
      if (email === 'admin@ifa.com' && password === 'admin123') {
        const adminUser = getUserByEmail(email);
        if (adminUser) {
          setUser(adminUser);
          setCurrentUser(adminUser);
          return true;
        }
      }
      return false;
    }

    // For applicants, check if user exists
    let existingUser = getUserByEmail(email);
    
    if (existingUser && existingUser.role === role) {
      setUser(existingUser);
      setCurrentUser(existingUser);
      return true;
    }

    return false;
  };

  const signup = async (email: string, password: string, role: UserRole): Promise<boolean> => {
    // Check if user already exists
    const existingUser = getUserByEmail(email);
    if (existingUser) {
      return false;
    }

    // Create new user
    const newUser: User = {
      id: generateId(),
      email,
      role,
      createdAt: new Date().toISOString(),
    };

    saveUser(newUser);
    setUser(newUser);
    setCurrentUser(newUser);
    return true;
  };

  const logout = () => {
    setUser(null);
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
