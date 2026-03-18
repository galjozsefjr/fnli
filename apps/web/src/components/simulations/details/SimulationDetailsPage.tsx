'use client';

import { HitStatistics } from '@/components/simulations/details/HitStatistics';
import { UpdateInterval } from '@/components/simulations/details/UpdateInterval';
import { PlayedNumbers } from '@/components/simulations/PlayedNumbers';
import { numberFormat } from '@fnli/utils/numberFormat';
import dayjs from 'dayjs';
import { CheckIcon } from 'lucide-react';
import { type FC } from 'react';
import { useDetails } from './useDetails';

export type SimulationDetailsPageProps = Readonly<{
  simulationId: string;
}>;

export const SimulationDetailsPage: FC<SimulationDetailsPageProps> = ({ simulationId }) => {
  const { details, error } = useDetails(simulationId);

  if (error) {
    return null;
  }

  const yearsSpent = details && Math.floor(dayjs().add(details.totalDraws, 'week').diff(new Date(), 'years'));

  return (
    <>
      <header className="mb-6 sm:mb-8">
        <h2 className="font-bold text-4xl/14">Result</h2>
      </header>
      <section className="w-full flex flex-col gap-6 sm:gap-8">
        <div className="bg-primary text-white w-full max-w-[325px] px-6 pt-5 pb-3 rounded-[10px]">
          <dl className="grid grid-cols-2 gap-y-2 font-bold">
            <dt className="text-base grow-1 base">Number of tickets:</dt>
            <dd className="text-base font-extrabold pl-6 text-nowrap">{details?.totalDraws && numberFormat(details?.totalDraws)}</dd>
            <dt className="text-sm">Years spent:</dt>
            <dd className="text-sm pl-6">{yearsSpent ?? 0}</dd>
            <dt className="text-sm">Cost of tickets:</dt>
            <dd className="text-sm pl-6 text-nowrap">{details?.totalSpent && numberFormat(details.totalSpent)}</dd>
          </dl>
        </div>
        <HitStatistics matches={details?.matches} />
        <div className="flex flex-col gap-6">
          <div className="flex flex-row items-center gap-5 sm:gap-7">
            <p className="w-[105px] sm:w-[133px] text-xs sm:text-base font-semibold sm:font-normal">Winning numbers:</p>
            <PlayedNumbers numbers={details?.lastDraw ?? []} />
          </div>
          <div className="flex flex-row items-center gap-5 sm:gap-7">
            <p className="w-[105px] sm:w-[133px] text-xs sm:text-base font-semibold sm:font-normal">Your numbers:</p>
            <PlayedNumbers numbers={details?.lastPlay ?? []} />
          </div>
          <div className="flex flex-row items-center gap-6 sm:gap-12">
            <p className="text-xs sm:text-base font-semibold sm:font-normal">Play with random numbers:</p>
            <div className="flex justify-center items-center w-[20px] sm:w-8 h-[20px] sm:h-8 rounded-[5px] border-1 border-foreground bg-white drop-shadow-sm">
              {!details?.fixedNumbers && <CheckIcon size="16" color="var(--foreground)" />}
            </div>
          </div>
          {details && <UpdateInterval simulationId={simulationId} defaultInterval={details.simulationInterval} />}
        </div>
      </section>
    </>
  );
};
