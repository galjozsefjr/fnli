import { useAuthContext } from '@/auth/auth.context';
import { authorizedFetcher } from '@/hooks/fetcher';
import { type PaginationParams } from '@fnli/types/common';
import { type PaginatedSimulationList } from '@fnli/types/simulations';
import useSWR from 'swr';

export const useSimulations = (params?: PaginationParams) => {
  const { authToken } = useAuthContext();
  const queryParams = getPaginationParams(params);
  return useSWR<PaginatedSimulationList, Error>(
    authToken ? `/api/simulations?${queryParams}` : null,
    (url: string, config: RequestInit) => authorizedFetcher(url, authToken as string, config),
    { revalidateOnFocus: false, }
  );
};

const isPositiveInt = (value: unknown): boolean => {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0;
}

const getPaginationParams = (params?: PaginationParams, defaultLimit = 20): URLSearchParams => {
  const paginationParams = {
    offset: 0,
    limit: 20,
    ...params,
  };
  if (isPositiveInt(paginationParams.offset)) {
    paginationParams.offset = 0;
  }
  if (isPositiveInt(paginationParams.limit)) {
    paginationParams.limit = defaultLimit;
  }

  const searchParams = new URLSearchParams();
  searchParams.set('offset', paginationParams.offset.toString());
  searchParams.set('limit', paginationParams.limit.toString());
  return searchParams;
};