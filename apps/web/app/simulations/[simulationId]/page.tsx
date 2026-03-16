import { SimulationDetailsPage as SimulationsDetailsContainer } from '@/components/simulations/details/SimulationDetailsPage';
import { validate } from 'uuid';
import { redirect } from 'next/navigation';

export default async function SimulationDetailsPage({ params }: { params: Promise<{ simulationId: string }> }) {
  const { simulationId } = await params;
  if (!validate(simulationId)) {
    console.error('Invalid simulationId: "%s"', simulationId);
    redirect('/');
  }
  return <SimulationsDetailsContainer simulationId={simulationId} />;
}
