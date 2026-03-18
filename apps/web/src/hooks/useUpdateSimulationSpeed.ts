import { useAuthContext } from '@/auth/auth.context';
import { ApiError } from '@/hooks/apiError';
import { authorizedFetcher } from '@/hooks/fetcher';
import type { ChangeSimulationSpeed, SimulationDetails } from '@fnli/types/simulations';
import useSWRMutation from 'swr/mutation';

export const useUpdateSimulationSpeed = <Data = SimulationDetails, Error = ApiError>(simulationId: string) => {
  const { authToken } = useAuthContext();
  return useSWRMutation<Data, Error, string, ChangeSimulationSpeed>(`/api/simulations/${simulationId}`, (url, { arg }) => {
    if (!authToken) {
      throw new ApiError({ message: 'Unauthorized' }, 401);
    }
    return authorizedFetcher(url, authToken, {
      method: 'PATCH',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(arg)
    });
  });
};
