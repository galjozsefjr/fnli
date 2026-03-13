import {
  equals,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator,
} from 'class-validator';

export const Match =
  <T>(property: keyof T, options?: ValidationOptions) =>
  (object: any, propertyName: string) =>
    registerDecorator({
      target: (object as { constructor: CallableFunction }).constructor,
      propertyName,
      options,
      constraints: [property],
      validator: MatchConstraint,
    });

@ValidatorConstraint({ name: 'Match' })
export class MatchConstraint implements ValidatorConstraintInterface {
  validate(value: unknown, args?: ValidationArguments): boolean {
    const [propertyNameToCompare] = (args?.constraints || []) as unknown[];
    const propertyValue = args?.object[
      propertyNameToCompare as keyof (typeof args)['object']
    ] as unknown;
    return equals(value, propertyValue);
  }

  defaultMessage(args?: ValidationArguments): string {
    const [propertyNameToCompare] = (args?.constraints || []) as unknown[];

    return `${args?.property} does not match the ${propertyNameToCompare as string}`;
  }
}
