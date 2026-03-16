import useSWR from 'swr';
import type { User } from '@/auth/auth.context';
import type { ApiError } from './apiError';
import { authorizedFetcher } from './fetcher';

export const useUserProfile = (authToken: string | null) => {
  return useSWR<User, ApiError>(authToken ? '/api/user' : null, (url: string, config: RequestInit) =>
    authorizedFetcher(url, authToken as string, config)
  );
};
