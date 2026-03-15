import type { CreateSimulationRequest, SimulationDetails } from '@fnli/types/simulations';
import useSWRMutation from 'swr/mutation';
import { authorizedFetcher } from '@/hooks/fetcher';
import { useAuthContext } from '@/auth/auth.context';
import { ApiError } from './apiError';

export const useCreateSimulation = <Data = SimulationDetails, Error = ApiError>() => {
  const { authToken } = useAuthContext();
  return useSWRMutation<Data, Error, string, CreateSimulationRequest>('/api/simulations', (url, { arg }) => {
    if (!authToken) {
      throw new ApiError({ message: 'Unauthorized' }, 401);
    }
    return authorizedFetcher(url, authToken, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(arg)
    });
  });
};
