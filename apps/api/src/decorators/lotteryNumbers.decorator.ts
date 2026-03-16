import {
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator,
} from 'class-validator';

export const LotteryNumbers =
  (options?: ValidationOptions) => (object: any, propertyName: string) =>
    registerDecorator({
      target: (object as { constructor: CallableFunction }).constructor,
      propertyName,
      options,
      validator: LotteryNumbersConstraint,
    });

@ValidatorConstraint({ name: 'LotteryNumbers' })
export class LotteryNumbersConstraint implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    const structureReady =
      Array.isArray(value) &&
      value.length === 5 &&
      value.every(isValidLotteryNumber);
    if (!structureReady) {
      return false;
    }
    return new Set(value).size === 5;
  }

  defaultMessage(args?: ValidationArguments): string {
    const { value } = (args ?? {}) as { value?: unknown };
    if (!value || !Array.isArray(value)) {
      return `Invalid lottery numbers`;
    }
    if (value.length !== 5) {
      return `Must be 5 unique numbers between 1 and 90`;
    }
    const invalid = value.filter((item) => !isValidLotteryNumber(item));
    if (invalid.length) {
      return `Invalid lottery numbers: ${invalid.join(',')}`;
    }
    return `Must be 5 unique numbers between 1 and 90`;
  }
}

const isValidLotteryNumber = (item: unknown) =>
  typeof item === 'number' && Number.isInteger(item) && item > 0 && item <= 90;
