import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, setAuthToken } from '../services/api';
import { initSocket, disconnectSocket } from '../services/socket';
import { promptGoogleSignIn } from '../services/googleAuth';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (loginInput: string, passwordInput: string) => Promise<void>;
  register: (username: string, email: string, password: string, displayName?: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  deleteAccount: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('linkhub_token');
      const storedUser = await AsyncStorage.getItem('linkhub_user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setAuthToken(storedToken);
        setUser(JSON.parse(storedUser));
        initSocket();

        // Refresh latest profile from backend in background
        api.getMe()
          .then((res) => {
            if (res.user) {
              setUser(res.user);
              AsyncStorage.setItem('linkhub_user', JSON.stringify(res.user));
            }
          })
          .catch(() => {
            // Ignore if offline
          });
      }
    } catch (e) {
      console.warn('Failed to load stored auth session:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthSuccess = async (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    setAuthToken(newToken);
    await AsyncStorage.setItem('linkhub_token', newToken);
    await AsyncStorage.setItem('linkhub_user', JSON.stringify(newUser));
    await initSocket();
  };

  const login = async (loginInput: string, passwordInput: string) => {
    const res = await api.login({ login: loginInput, password: passwordInput });
    await handleAuthSuccess(res.token, res.user);
  };

  const register = async (username: string, email: string, password: string, displayName?: string) => {
    const res = await api.register({ username, email, password, display_name: displayName });
    await handleAuthSuccess(res.token, res.user);
  };

  const loginWithGoogle = async () => {
    const googleRes = await promptGoogleSignIn();
    const res = await api.googleAuth({
      idToken: googleRes.idToken,
      accessToken: googleRes.accessToken
    });
    await handleAuthSuccess(res.token, res.user);
  };

  const logout = async () => {
    setUser(null);
    setToken(null);
    setAuthToken(null);
    disconnectSocket();
    await AsyncStorage.removeItem('linkhub_token');
    await AsyncStorage.removeItem('linkhub_user');
  };

  const updateProfile = async (data: Partial<User>) => {
    const res = await api.updateProfile(data);
    if (res.user) {
      setUser(res.user);
      await AsyncStorage.setItem('linkhub_user', JSON.stringify(res.user));
    }
  };

  const deleteAccount = async () => {
    await api.deleteAccount();
    await logout();
  };

  const refreshUser = async () => {
    const res = await api.getMe();
    if (res.user) {
      setUser(res.user);
      await AsyncStorage.setItem('linkhub_user', JSON.stringify(res.user));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        loginWithGoogle,
        logout,
        updateProfile,
        deleteAccount,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
