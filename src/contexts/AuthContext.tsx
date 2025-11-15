import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '@/types';
import { getCurrentUser, setCurrentUser, getUserByGoogleId, saveUser, initializeDefaultAdmin } from '@/lib/storage';
import { generateId } from '@/lib/utils';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  loginWithGoogle: (credential: string, role: UserRole) => Promise<User | null>; // ✅ Changed return type
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        await initializeDefaultAdmin();
        const currentUser = getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // ✅ UPDATED: Now returns the user object
  const loginWithGoogle = async (credential: string, role: UserRole): Promise<User | null> => {
    setLoading(true);
    
    try {
      const payload = JSON.parse(atob(credential.split('.')[1]));
      
      const googleId = payload.sub;
      const email = payload.email;
      const name = payload.name;
      const picture = payload.picture;

      console.log('🔐 Login attempt:', { email, role, googleId });

      if (role === 'admin') {
        const adminEmails = ['admin@ifa.com', 'admin@insightfusionanalytics.com'];
        if (!adminEmails.includes(email)) {
          toast.error('Unauthorized: Admin access requires a valid admin email');
          setLoading(false);
          return null;
        }
      }

      let existingUser = await getUserByGoogleId(googleId);
      
      if (existingUser) {
        console.log('✅ Existing user found:', existingUser.id);
        
        if (existingUser.role !== role) {
          toast.error(`This account is registered as ${existingUser.role}, not ${role}`);
          setLoading(false);
          return null;
        }
        
        existingUser.name = name;
        existingUser.picture = picture;
        existingUser.email = email;
        
        await saveUser(existingUser);
        setUser(existingUser);
        setCurrentUser(existingUser);
        
        setLoading(false);
        return existingUser; // ✅ Return user
      }

      const newUser: User = {
        id: generateId(),
        googleId,
        email,
        name,
        picture,
        role,
        createdAt: new Date().toISOString(),
      };

      console.log('🆕 Creating new user:', newUser.id);

      await saveUser(newUser);
      setUser(newUser);
      setCurrentUser(newUser);
      
      console.log('✅ User created and logged in:', newUser.id);
      
      setLoading(false);
      return newUser; // ✅ Return user
    } catch (error) {
      console.error('❌ Google login error:', error);
      toast.error('Login failed. Please try again.');
      setLoading(false);
      return null; // ✅ Return null on error
    }
  };

  const logout = () => {
    setUser(null);
    setCurrentUser(null);
    toast.success('Logged out successfully');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loginWithGoogle,
        logout,
        isAuthenticated: !!user,
        loading,
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
