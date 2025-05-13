import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { apiRequest } from "@/lib/queryClient";
import { User } from "@shared/schema";

interface AuthContextType {
  isAuthenticated: boolean;
  isAdmin: boolean;
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isAdmin: false,
  user: null,
  login: async () => false,
  logout: async () => {},
  isLoading: true,
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication status on initial load
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await fetch('/api/auth/status', {
          credentials: 'include'
        });
        
        const data = await response.json();
        
        if (data.authenticated) {
          setUser(data.user);
          setIsAuthenticated(true);
          setIsAdmin(data.user.isAdmin);
        } else {
          setUser(null);
          setIsAuthenticated(false);
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        setUser(null);
        setIsAuthenticated(false);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Login function
  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await apiRequest('POST', '/api/auth/login', { username, password });
      const data = await response.json();
      
      if (data.success) {
        setUser(data.user);
        setIsAuthenticated(true);
        setIsAdmin(data.user.isAdmin);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      await apiRequest('POST', '/api/auth/logout', {});
      setUser(null);
      setIsAuthenticated(false);
      setIsAdmin(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isAdmin,
        user,
        login,
        logout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
