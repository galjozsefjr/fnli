'use client';

import { useRouter } from 'next/navigation';
import { type FC, type PropsWithChildren, useCallback, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useLocalStorage } from 'usehooks-ts';
import { useLogin } from '@/hooks/useLogin';
import { useUserProfile } from '@/hooks/useUserProfile';
import { type AuthContext, AuthContextProvider } from './auth.context';

const AUTH_KEY = 'fnliApiAuthToken';

export const AuthProvider: FC<PropsWithChildren> = ({ children }) => {
  const [authToken, setAuthToken, removeAuthToken] = useLocalStorage(AUTH_KEY, '');
  const { push: navigate } = useRouter();
  const { trigger: createLoginToken, isMutating } = useLogin();
  const { data: user, isLoading, error, mutate } = useUserProfile(authToken ?? null);

  const login: AuthContext['login'] = useCallback(
    async (username: string, password: string) => {
      const { accessToken } = await createLoginToken({ username, password });
      setAuthToken(accessToken);
      mutate();
      return true;
    },
    [setAuthToken, createLoginToken, mutate]
  );

  const logout: AuthContext['logout'] = useCallback(() => {
    removeAuthToken();
    mutate(undefined, { revalidate: false });
    navigate('/');
  }, [navigate, removeAuthToken, mutate]);

  const isAuthenticated = useCallback(() => {
    if (!authToken) {
      return false;
    }
    const tokenDetails = jwtDecode(authToken);

    if (tokenDetails.exp && tokenDetails.exp * 1000 < Date.now()) {
      logout();
      return false;
    }
    return true;
  }, [authToken, logout]);

  useEffect(() => {
    if (error?.statusCode === 401) {
      logout();
    }
  }, [error, logout])

  const state: AuthContext = {
    login,
    logout,
    isAuthenticated,
    authToken,
    user: user ?? null,
    inProgress: isMutating || isLoading || (!error && !user)
  };

  return <AuthContextProvider value={state}>{children}</AuthContextProvider>;
};
