import { useAuthContext } from '@/auth/auth.context';
import { type ApiError } from '@/hooks/apiError';
import { authorizedFetcher } from '@/hooks/fetcher';
import { type SimulationDetails } from '@fnli/types/simulations';
import useSWR from 'swr';

export const useSimulationDetails = (simulationId?: string) => {
  const { authToken } = useAuthContext();
  return useSWR<SimulationDetails, ApiError>(
    authToken && simulationId ? `/api/simulations/${simulationId}` : null,
    (url: string, config: RequestInit) => authorizedFetcher(url, authToken as string, config),
    { revalidateOnFocus: false, }
  );
};
