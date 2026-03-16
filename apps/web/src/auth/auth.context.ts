'use client';

import { createContext, useContext } from 'react';

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface AuthContext {
  user: User | null;
  inProgress: boolean;
  authToken?: string;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const createAuthContext = () => {
  const context = createContext<AuthContext | null>(null);

  const useAuthContext = () => {
    const ctx = useContext<AuthContext | null>(
      // @ts-expect-error expected to be defined
      context as AuthContext
    );
    if (!ctx) {
      throw new Error('authContext must be within a AuthContextProvider component');
    }
    return ctx;
  };
  return [useAuthContext, context.Provider] as const;
};

export const [useAuthContext, AuthContextProvider] = createAuthContext();
