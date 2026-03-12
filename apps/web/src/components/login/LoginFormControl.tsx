'use client';

import { useRouter } from 'next/navigation';
import { type FC, useCallback, useState } from 'react';
import { useAuthContext } from '@/auth/auth.context';
import { LoginForm } from './LoginForm';
import { toast } from 'sonner';

export const LoginFormControl: FC = () => {
  const { login } = useAuthContext();
  const [error, setError] = useState<string>();
  const { push: navigate } = useRouter();

  const onLogin = useCallback(
    async (username: string, password: string): Promise<boolean> => {
      setError(undefined);
      try {
        await login(username, password);
        navigate('/');
        return true;
      } catch {
        setError('Invalid username or password');
        toast.error('Invalid username or password');
        return false;
      }
    },
    [navigate, login]
  );

  return <LoginForm onLogin={onLogin} errorMessage={error} />;
};
