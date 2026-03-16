import { array, boolean, number, object } from 'yup';

export const addSimulationValidationSchema = object().shape({
  fixedNumbers: array().when('random', {
    is: false,
    then: (schema) => schema.of(number().min(1).max(90)).length(5, 'Select 5 numbers').required('Select 5 numbers'),
    otherwise: (schema) => schema.optional().nullable(),
  }),
  simulationInterval: number().integer('Select a valid value').min(10).max(1000),
  random: boolean(),
});
