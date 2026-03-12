'use client';

import { useRouter } from 'next/navigation';
import { type FC, type PropsWithChildren, useCallback, useEffect } from 'react';
import { useLocalStorage } from 'usehooks-ts';
import { useLogin } from '@/hooks/useLogin';
import { useUserProfile } from '@/hooks/useUserProfile';
import { type AuthContext, AuthContextProvider } from './auth.context';

const AUTH_KEY = 'moviesApiAuthToken';

export const AuthProvider: FC<PropsWithChildren> = ({ children }) => {
  const [authToken, setAuthToken, removeAuthToken] = useLocalStorage(AUTH_KEY, '');
  const { push: navigate } = useRouter();
  const { trigger: createLoginToken, isMutating } = useLogin();
  const { data: user, isLoading, error, mutate } = useUserProfile(authToken ?? null);

  const login: AuthContext['login'] = useCallback(
    async (username: string, password: string) => {
      const { accessToken } = await createLoginToken({ username, password });
      setAuthToken(accessToken);
      return true;
    },
    [setAuthToken, createLoginToken]
  );

  const logout: AuthContext['logout'] = useCallback(() => {
    removeAuthToken();
    navigate('/');
  }, [navigate, removeAuthToken]);

  const state: AuthContext = {
    login,
    logout,
    authToken,
    user: user ?? null,
    inProgress: isMutating || isLoading || (!error && !user)
  };

  useEffect(() => {
    if (!authToken) {
      return;
    }
    mutate();
  }, [authToken, mutate]);

  return <AuthContextProvider value={state}>{children}</AuthContextProvider>;
};
