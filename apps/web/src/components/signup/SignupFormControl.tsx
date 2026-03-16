'use client'

import { useRouter } from 'next/navigation';
import { type FC, useCallback, useEffect, useState } from 'react';
import { useAuthContext } from '@/auth/auth.context';
import { SignupForm } from '@/components/signup/SignupForm';
import type { CreateUser } from '@fnli/types/user';
import { useSignup } from '@/hooks/useSignup';
import type { ApiError } from '@/hooks/apiError';
import { toast } from 'sonner';

export const SignupFormControl: FC = () => {
  const { isAuthenticated } = useAuthContext();
  const [error, setError] = useState<string>();
  const { push: navigate } = useRouter();
  const { trigger: signup } = useSignup();

  const onSignup = useCallback(async (userData: CreateUser) => {
    try {
      await signup(userData);
      toast.success('Successful registration, you can now login');
      navigate('/login');
    } catch (err) {
      console.error(err);
      const errorMessage = (err as ApiError)?.message ?? 'Registration failed';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  }, [signup, navigate]);

  useEffect(() => {
    if (isAuthenticated()) {
      // already logged-in
      navigate('/');
    }
  });

  return (
    <SignupForm errorMessage={error} onSignup={onSignup} />
  );
}