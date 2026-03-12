import { yupResolver } from '@hookform/resolvers/yup';
import type { FC } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { loginFormValidate } from './loginFormValidate';
import { TextField } from '@/components/form/TextField';
import { FieldGroup } from '@/components/ui/field';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export interface LoginFormProps {
  onLogin: (username: string, password: string) => Promise<boolean>;
  errorMessage?: string;
}

export const LoginForm: FC<LoginFormProps> = ({ errorMessage, onLogin }) => {
  const form = useForm({
    values: {
      username: '',
      password: ''
    },
    resolver: yupResolver(loginFormValidate)
  });

  const handleSubmit = form.handleSubmit(async (formData) => {
    const { username, password } = formData;
    const loggedIn = await onLogin(username, password);
    if (!loggedIn) {
      form.setValue('password', '');
    }
  });

  const {
    formState: { errors, isSubmitting, isValidating },
    register
  } = form;

  return (
    <form onSubmit={handleSubmit} className="w-full" noValidate>
      <FieldGroup className="mx-auto gap-3 w-full">
        <p className={cn('text-center', { 'text-red-700': errorMessage })}>{errorMessage || 'Enter your username and password'}</p>
        <TextField type="email" label="Email address" error={errors?.username?.message} {...register('username')} />
        <TextField type="password" label="Password" error={errors?.password?.message} {...register('password')} />
        <div className="flex justify-between w-full gap-3">
          <Link href="/signup" className="justify-self-start">Create an account</Link>
          <div className="flex gap-3">
            <Button type="reset" variant="secondary" onClick={() => form.reset()} size="lg" className="justify-self-end">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || isValidating} size="lg" className="justify-self-end">
              Login
            </Button>
          </div>
        </div>
      </FieldGroup>
    </form>
  );
};
