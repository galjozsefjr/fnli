import type { User } from './auth.context';

const BASE_URL = 'http://localhost:5000/user';

export const getUserProfile = async (authToken: string): Promise<User> => {
  const response = await fetch(BASE_URL, {
    headers: { Authorization: `Bearer ${authToken}` }
  });
  if (!response.ok) {
    throw new Error('Érvénytelen token');
  }
  return response.json();
};

export const createLoginToken = async (username: string, password: string): Promise<string> => {
  const response = await fetch(`${BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  if (!response.ok) {
    throw new Error(response.status === 400 ? 'Hibás adatok' : 'Hibás felhasználónév vagy jelszó!');
  }
  const result = await response.json();
  return result.accessToken;
};
