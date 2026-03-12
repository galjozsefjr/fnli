import { ApiError } from './apiError';

export const fetcher = async (url: string | URL, requestInit?: RequestInit) => {
  const res = await fetch(url, {
    ...requestInit,
    headers: {
      Accept: 'application/json',
      ...requestInit?.headers
    }
  });
  const content = res.status === 204 ? null : await res.json();
  if (!res.ok) {
    throw new ApiError(content, res.status);
  }
  return content;
};

export const authorizedFetcher = (url: string | URL, authToken: string, requestInit?: RequestInit) => {
  return fetcher(url, {
    ...requestInit,
    headers: {
      ...requestInit?.headers,
      Authorization: `Bearer ${authToken}`
    }
  });
};
