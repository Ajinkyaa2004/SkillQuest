import React, {createContext, useContext, useState, useEffect} from "react";
import {User, UserRole} from "@/types";
import {
  getCurrentUser,
  setCurrentUser,
  getUserByGoogleId,
  saveUser,
  initializeDefaultAdmin
} from "@/lib/storage";
import {generateId} from "@/lib/utils";

interface AuthContextType {
  user: User | null;
  loginWithGoogle: (credential: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({
  children
}) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Initialize default admin (if needed for backward compatibility)
    initializeDefaultAdmin();

    // Check if user is already logged in
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
  }, []);

  /**
   * Login with Google OAuth
   * Decodes the JWT credential from Google and creates/updates user
   */
  const loginWithGoogle = async (
    credential: string,
    role: UserRole
  ): Promise<boolean> => {
    try {
      // Decode JWT token from Google (it's a base64-encoded JWT)
      const payload = JSON.parse(atob(credential.split(".")[1]));

      const googleId = payload.sub;
      const email = payload.email;
      const name = payload.name;
      const picture = payload.picture;

      // Special case: Admin check using email domain or specific email
      if (role === "admin") {
        // Allow only specific admin emails (you can customize this logic)
        const adminEmails = [
          "admin@ifa.com",
          "admin@insightfusionanalytics.com"
        ];
        if (!adminEmails.includes(email)) {
          console.error("Unauthorized admin access attempt");
          return false;
        }
      }

      // Check if user exists by Google ID
      const existingUser = getUserByGoogleId(googleId);

      if (existingUser) {
        // User exists, log them in
        if (existingUser.role !== role) {
          // Role mismatch - user trying to login with different role
          console.error("Role mismatch: User exists with different role");
          return false;
        }

        // Update user info (in case name or picture changed)
        existingUser.name = name;
        existingUser.picture = picture;
        existingUser.email = email;
        saveUser(existingUser);

        setUser(existingUser);
        setCurrentUser(existingUser);
        return true;
      }

      // New user - create account
      const newUser: User = {
        id: generateId(),
        googleId,
        email,
        name,
        picture,
        role,
        createdAt: new Date().toISOString()
      };

      saveUser(newUser);
      setUser(newUser);
      setCurrentUser(newUser);
      return true;
    } catch (error) {
      console.error("Google login error:", error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loginWithGoogle,
        logout,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
