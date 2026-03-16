import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { NumberSelector } from './NumberSelector';
import { PlayedNumbers } from './PlayedNumbers';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Slider } from '@/components/ui/slider';
import { useCreateSimulation } from '@/hooks/useCreateSimulation';
import { CreateSimulationRequest } from '@fnli/types/simulations';
import { useRouter } from 'next/navigation';
import { useCallback, type FC } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { yupResolver } from '@hookform/resolvers/yup';
import { addSimulationValidationSchema } from '@/components/simulations/addSimulationValidationSchema';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Button } from '@/components/ui/button';

export type AddSimulationFormProps = Readonly<{
  message?: string;
}>

export type AddSimulationFormState = CreateSimulationRequest & {
  random: boolean;
};

export const AddSimulationForm: FC<AddSimulationFormProps> = ({ }) => {
  const { trigger } = useCreateSimulation();
  const { push: goto } = useRouter();

  const form = useForm<AddSimulationFormState>({
    defaultValues: {
      fixedNumbers: [],
      simulationInterval: 500,
      random: true,
    },
    // @ts-expect-error definition is fine;
    resolver: yupResolver(addSimulationValidationSchema),
  });

  const createSimulation = useCallback(async (data: AddSimulationFormState) => {
    try {
      const submitData: CreateSimulationRequest = {
        fixedNumbers: data.random ? null : data.fixedNumbers,
        simulationInterval: data.simulationInterval,
      };
      const newSimulation = await trigger(submitData);
      toast.success('Simulation created successfully');
      await new Promise<void>((resolve) => {
        window.setTimeout(() => {
          goto(`/simulations/${newSimulation.id}`);
          resolve();
        }, 3000);
      });
    } catch (error) {
      console.error(error);
      toast.error('Failed to create simulation, please try again');
    }
  }, [trigger, goto]);

  // @ts-expect-error arguments is defined properly
  const handleSubmit = form.handleSubmit(createSimulation)
  const isRandom = useWatch({ name: 'random', control: form.control });
  const simulationInterval = useWatch({ name: 'simulationInterval', control: form.control });

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <Field aria-invalid={!!form.formState.errors.simulationInterval}>
        <FieldLabel htmlFor="simulationInterval">Interval ({simulationInterval} ms)</FieldLabel>
        <Slider {...form.register('simulationInterval')} min={10} max={1000} step={10} defaultValue={[500]} />
        {form.formState.errors.simulationInterval && <FieldError>{form.formState.errors.simulationInterval.message}</FieldError>}
      </Field>
      <Controller control={form.control} name="random" render={({ field }) => {
        return (
          <ToggleGroup type="single" defaultValue={field.value ? "random" : "fixed"} className="w-full" onValueChange={(value) => {
            field.onChange(value === 'random');
          }}>
            <ToggleGroupItem value="random" className="shrink-0 grow-1">Random number</ToggleGroupItem>
            <ToggleGroupItem value="fixed" className="shrink-0 grow-1">Fixed numbers</ToggleGroupItem>
          </ToggleGroup>
        );
      }} />
      <div className={cn('mx-auto', { 'hidden': isRandom })}>
        <Controller control={form.control} name="fixedNumbers" render={({ field, fieldState, formState }) => (
          <Collapsible disabled={formState.isSubmitting || isRandom} className="flex flex-col gap-3 items-center" defaultOpen={false}>
            <div className="flex-col gap-4">
              <CollapsibleTrigger className="w-full flex justify-center">
                <PlayedNumbers numbers={field.value ?? null} className={cn({ 'outline-error': fieldState.error })} isError={!!fieldState.error} />
              </CollapsibleTrigger>
              {form.formState.errors.fixedNumbers && <FieldError>{form.formState.errors.fixedNumbers.message}</FieldError>}
            </div>
            <CollapsibleContent>
              <NumberSelector onChange={field.onChange} value={field.value ?? []} />
            </CollapsibleContent>
          </Collapsible>
        )} />
      </div>
      <div className="flex justify-center">
        <Button type="submit" size="lg" className="cursor-pointer">Create simulation</Button>
      </div>
    </form>
  );
};
