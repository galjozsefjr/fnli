'use client';

import { useAuthContext } from '@/auth/auth.context';
import { LoginFormControl } from '@/components/login/LoginFormControl';
import { Simulations } from '@/components/simulations/Simulations';

export const HomePage = () => {
  const { isAuthenticated } = useAuthContext();

  if (!isAuthenticated()) {
    return (
      <LoginFormControl />
    );
  }


  return <Simulations />;
};

export default HomePage;