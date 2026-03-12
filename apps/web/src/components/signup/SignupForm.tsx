import { TextField } from '@/components/form/TextField';
import { Button } from '@/components/ui/button';
import { FieldGroup } from '@/components/ui/field';
import type { CreateUser } from '@fnli/types/user';
import { yupResolver } from '@hookform/resolvers/yup';
import Link from 'next/link';
import { type FC } from 'react';
import { useForm } from 'react-hook-form';
import { signupFormValidate } from './signupFormValidate';

export type SignupFormProps = Readonly<{
  errorMessage?: string;
  onSignup: (userData: CreateUser) => void
}>;

export const SignupForm: FC<SignupFormProps> = ({ errorMessage, onSignup }) => {

  const form = useForm<CreateUser>({
    defaultValues: {
      username: '',
      password: '',
      firstName: '',
      lastName: '',
    },
    resolver: yupResolver(signupFormValidate),
  });

  const handleSubmit = form.handleSubmit(onSignup);

  const { register, formState: { errors, isSubmitting, isValidating } } = form;

  return (
    <form onSubmit={handleSubmit} className="w-full" noValidate>
      <FieldGroup className="mx-auto gap-3 w-full">
        {errorMessage && <p className="text-center text-red-700">{errorMessage}</p>}
        <TextField type="email" label="Email address" error={errors?.username?.message} {...register('username')} />
        <TextField type="password" label="Password" error={errors?.password?.message} {...register('password')} />
        <TextField label="First name" error={errors?.firstName?.message} {...register('firstName')} />
        <TextField label="Last name" error={errors?.lastName?.message} {...register('lastName')} />
        <div className="flex justify-between w-full gap-3">
          <p>
            Already have an account?<br />
            <Link href="/login" className="justify-self-start">Sign in</Link>
          </p>
          <div className="flex gap-3">
            <Button type="reset" variant="secondary" onClick={() => form.reset()} size="lg" className="justify-self-end">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || isValidating} size="lg" className="justify-self-end">
              Create account
            </Button>
          </div>
        </div>
      </FieldGroup>
    </form>
  );
}