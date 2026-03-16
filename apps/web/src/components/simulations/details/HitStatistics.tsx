import { type HitStatistic } from '@fnli/types/simulations';
import { FC } from 'react';
import { numberFormat } from '@fnli/utils/numberFormat'

export type HitStatisticProps = Readonly<{
  matches?: HitStatistic[];
}>;

export const HitStatistics: FC<HitStatisticProps> = ({ matches }) => {
  const matchList: HitStatistic[] = matches ?? Array.from({ length: 4 }, (_, index) => ({
    matches: index + 1,
    hitcount: 0,
  }));
  return (
    <div className="grid grid-cols-2 grid-rows-2 sm:grid-cols-4 sm:grid-rows-1 drop-shadow-sm">
      {matchList.map((match, index) => (
        <div key={`${match.matches}_${index}`} className="flex flex-col p-3 gap-2 bg-white border-1 border-(--color-warning) text-center first:rounded-tl-[10px] sm:first:rounded-l-[10px] nth-of-type-2:rounded-tr-[10px] sm:nth-of-type-2:rounded-tr-none nth-of-type-3:rounded-bl-[10px] sm:nth-of-type-3:rounded-bl-none last:rounded-br-[10px] sm:last:rounded-r-[10px]">
          <p className="text-xs font-bold">{match.matches} matches</p>
          <p className="text-base font-extrabold">{numberFormat(match.hitcount)}</p>
        </div>
      ))}
    </div>
  );
};

//