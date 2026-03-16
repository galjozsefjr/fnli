import { cn } from '@/lib/utils';
import { type FC } from 'react';

export type NumberSelectorProps = Readonly<{
  value: number[];
  onChange: (selectedNumbers: number[]) => void;
}>;

export const NumberSelector: FC<NumberSelectorProps> = ({ value, onChange }) => {
  const NUMBERS = Array.from({ length: 90 }, (_, i) => i + 1);

  return (
    <ol className="grid grid-cols-10 grid-rows-9 gap-3 max-w-[428px]">
      {NUMBERS.map((number) => {
        const isSelected = value.includes(number);
        const isDisabled = !isSelected && value.length === 5;
        const handleOnClick = () => {
          if (isDisabled) {

            return;
          }
          const resultSet = new Set(isSelected ? value.filter((item) => item !== number) : [...value, number]);
          console.log(resultSet.values())
          onChange(Array.from(resultSet.values()).toSorted());
        };
        return (
          <li key={number}>
            <div onClick={handleOnClick} className={cn(
              'flex w-8 h-8 rounded-full items-center justify-center border-1 border-primary mx-auto',
              { 'bg-primary text-white': isSelected, 'bg-muted text-gray-300 cursor-default': isDisabled, 'cursor-pointer': !isDisabled },
            )} role="checkbox" aria-checked={isSelected}>{number}</div>
          </li>
        );
      })}
    </ol>
  );
};
