import { cn } from '@/lib/utils';
import { type FC } from 'react';

export type LotteryNumberProps = Readonly<{
  number?: number;
  isError?: boolean;
}>;

export const LotteryNumber: FC<LotteryNumberProps> = ({ number, isError }) => (
  <div className={cn(
    'flex border-1 rounded-[10px] w-[34px] h-[38px] border-[--primary] bg-white justify-center items-center drop-shadow-sm',
    { 'border-destructive': isError }
  )}>{number ?? "?"}</div>
);
