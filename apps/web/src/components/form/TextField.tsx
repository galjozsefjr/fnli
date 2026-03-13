import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useId, type ComponentProps, type FC } from "react"

type FieldSizes = 'sm' | 'md' | 'lg' | 'xl'

export type TextFieldProps = ComponentProps<"input"> & Readonly<{
  label: string;
  error?: string
  size?: FieldSizes
}>

const SizeMap: Record<FieldSizes, string> = {
  sm: 'h-8',
  md: 'h-10',
  lg: 'h-12',
  xl: 'h-14',
}

export const TextField: FC<TextFieldProps> = ({ size, label, error, ...inputProps }) => {
  const fieldId = useId();
  const fieldSize = SizeMap[size ?? 'md'];

  const props = {
    Field: (error ? { 'data-invalid': true } : {}),
    Input: (error ? { 'aria-invalid': true } : {}),
  }

  return (
    <Field {...props.Field}>
      <FieldLabel htmlFor={fieldId}>{label}</FieldLabel>
      <Input {...props.Input} {...inputProps} id={fieldId} className={fieldSize} />
      {error && <FieldError>{error}</FieldError>}
    </Field>
  )
}