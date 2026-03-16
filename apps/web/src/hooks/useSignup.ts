import useSWRMutation from 'swr/mutation';
import { fetcher } from '@/hooks/fetcher';
import { CreateUser } from '@fnli/types/user';
import { ApiError } from './apiError';

type UserCreatedResponse = {
  id: string;
};

export const useSignup = <Data = UserCreatedResponse, Error = ApiError>() => {
  return useSWRMutation<Data, Error, string, CreateUser>('/api/user', (url, { arg }) => {
    return fetcher(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(arg)
    });
  });
};
