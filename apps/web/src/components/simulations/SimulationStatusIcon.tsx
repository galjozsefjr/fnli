import { SimulationStatus } from '@fnli/types/simulations';
import { type FC } from 'react';
import { CircleCheckIcon, CircleDotDashedIcon, CirclePauseIcon, PlayCircleIcon } from 'lucide-react';
import { TextTooltip } from '@/components/ui/TextTooltip';

type SimulationStatusKeys = keyof typeof SimulationStatus;
type SimulationStatusValues = typeof SimulationStatus[SimulationStatusKeys];

export type SimulationStatusIconProps = Readonly<{
  status: SimulationStatus
}>;

const Icons: Record<SimulationStatusValues, FC> = {
  [SimulationStatus.CREATED]: () => <TextTooltip content="Pending"><CircleDotDashedIcon color="var(--color-muted-foreground)" /></TextTooltip>,
  [SimulationStatus.FINISHED]: () => <TextTooltip content="Done"><CircleCheckIcon color="var(--color-green-500)" /></TextTooltip>,
  [SimulationStatus.STARTED]: () => <TextTooltip content="In progress"><PlayCircleIcon color="var(--color-yellow-500)" /></TextTooltip>,
  [SimulationStatus.STOP]: () => <TextTooltip content="Stoped"><CirclePauseIcon color="var(--color-red-500)" /></TextTooltip>,
};

export const SimulationStatusIcon: FC<SimulationStatusIconProps> = ({ status }) => {
  const Icon = Icons[status];
  return <Icon />;
};