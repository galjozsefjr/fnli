import { Field, FieldLabel } from '@/components/ui/field';
import { Slider } from '@/components/ui/slider';
import { useUpdateSimulationSpeed } from '@/hooks/useUpdateSimulationSpeed';
import { useCallback, useState, type FC } from 'react';
import { useSWRConfig } from 'swr';
import { useDebounceCallback } from 'usehooks-ts';

export type UpdateIntervalProps = {
  simulationId: string;
  defaultInterval: number;
};

export const UpdateInterval: FC<UpdateIntervalProps> = ({ simulationId, defaultInterval }) => {
  const [interval, setInterval] = useState(defaultInterval);
  const { trigger, isMutating } = useUpdateSimulationSpeed(simulationId);
  const { mutate } = useSWRConfig();

  const handleUpdate = useCallback(async (interval: number) => {
    try {
      const simulationInfo = await trigger({ simulationInterval: interval });
      await mutate(`/api/simulations/${simulationId}`, simulationInfo, { revalidate: false });
    } catch (error) {
      console.error(error);
    }
  }, [simulationId, trigger, mutate]);

  const delayedUpdateHandler = useDebounceCallback(handleUpdate, 500);

  const handleIntervalChange = useCallback((value: number[]) => {
    setInterval(value[0]);
    delayedUpdateHandler(value[0]);
  }, [delayedUpdateHandler]);

  return (
    <Field className="gap-3">
      <FieldLabel htmlFor="simulationInterval" className="text-xs sm:text-base font-semibold sm:font-normal">Speed ({interval} ms)</FieldLabel>
      <Slider
        onValueChange={handleIntervalChange}
        value={[interval]}
        min={10}
        max={1000}
        step={10}
        defaultValue={[defaultInterval]}
        disabled={isMutating}
      />
    </Field>
  );
};
