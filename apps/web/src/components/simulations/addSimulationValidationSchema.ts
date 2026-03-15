import { array, boolean, number, object } from 'yup';

export const addSimulationValidationSchema = object().shape({
  fixedNumbers: array().of(number().min(1).max(90)).length(5, 'Select 5 numbers').when('random', {
    is: (random: boolean) => random,
    then: array().required('Select 5 numbers')
  }).nullable(),
  simulationInterval: number().integer('Select a valid value').min(10).max(1000),
  random: boolean(),
});