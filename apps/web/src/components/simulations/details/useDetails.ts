import { useAuthContext } from '@/auth/auth.context';
import { useSimulationDetails } from '@/hooks/useSimulationDetails';
import { useSSE } from '@/hooks/useSSE';
import { SimulationStatus, type SimulationDetails } from '@fnli/types/simulations';

import { useEffect } from 'react';

export const useDetails = (simulationId: string) => {
  const { data, error } = useSimulationDetails(simulationId);
  const { authToken } = useAuthContext();
  const { data: updateInfo, disconnect } = useSSE<SimulationDetails>(`/api/simulations/${simulationId}/events`, authToken);

  useEffect(() => {
    if (updateInfo && updateInfo.status !== SimulationStatus.STARTED) {
      disconnect();
    }
  }, [updateInfo, disconnect]);

  return {
    details: updateInfo ?? data ?? null,
    error,
  };
};
