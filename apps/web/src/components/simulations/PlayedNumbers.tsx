import { type SimulationEntity } from '@fnli/types/simulations';
import { type FC } from 'react';
import { LotteryNumber } from './LotteryNumber';
import { cn } from '@/lib/utils';

export type PlayedNumbersProps = Readonly<{
  numbers: SimulationEntity['fixedNumbers'];
  isError?: boolean;
  className?: string;
}>

export const PlayedNumbers: FC<PlayedNumbersProps> = ({ numbers, className, isError }) => {
  const numbersList = numbers?.length === 5 ? numbers : Array.from({ length: 5 }, (_, index) => numbers?.[index] ?? undefined);

  return (
    <div className={cn('flex gap-2', className)}>
      {numbersList.map((item, index) => <LotteryNumber number={item} isError={isError} key={`${index}_${item}`} />)}
    </div>
  )
};
