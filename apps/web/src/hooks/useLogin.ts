import useSWRMutation from 'swr/mutation';
import type { ApiError } from './apiError';
import { fetcher } from './fetcher';

type LoginUserArgs = {
  username: string;
  password: string;
};

type LoginResponse = {
  accessToken: string;
};

export const useLogin = <Data = LoginResponse, Error = ApiError>() => {
  return useSWRMutation<Data, Error, string, LoginUserArgs>('/api/user/login', (url, { arg }) => {
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
