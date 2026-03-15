import { AddSimulationFormDialog } from '@/components/simulations/AddSimulationFormDialog';
import { SimulationsTable } from '@/components/simulations/SimulationsTable';
//import { Button } from '@/components/ui/button';
import { useSimulations } from '@/hooks/useSimulations';
import { type PaginationState } from '@tanstack/react-table';
//import { PlusIcon } from 'lucide-react';
import { useState, type FC } from 'react';

export const Simulations: FC = () => {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  });
  const { data: simulations } = useSimulations({
    offset: pagination.pageIndex * pagination.pageSize,
    limit: pagination.pageSize,
  });



  return (
    <>
      <header className="flex justify-between items-center w-full">
        <h2 className="font-bold text-4xl/14">Simulations</h2>
        <AddSimulationFormDialog />
      </header>
      <section className="w-full">
        {simulations?.data && <SimulationsTable simulations={simulations} onPaginationChange={setPagination} pagination={pagination} />}
      </section>
    </>
  );
};