import { ApiError } from '@/hooks/apiError';
import { useCallback, useEffect, useEffectEvent, useRef, useState } from 'react';
import { EventSourceMessage, fetchEventSource } from '@microsoft/fetch-event-source';

export const useSSE = <T>(url: string, authToken?: string) => {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<ApiError | null>(null);

  const [isConnected, setIsConnected] = useState(false);
  const eventSourceRef = useRef<ReturnType<typeof fetchEventSource>>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout>>(null);
  const abortControllerRef = useRef<AbortController>(null);
  const retryCount = useRef(0);

  const connect = useCallback(async () => {
    try {
      abortControllerRef.current?.abort();
      abortControllerRef.current = new AbortController();

      const eventSource = fetchEventSource(url, {
        method: 'GET',
        headers: authToken ? {
          Authorization: `Bearer ${authToken}`,
        } : {},
        signal: abortControllerRef.current.signal,
        onopen: () => {
          console.log('SSE connection opened');
          setIsConnected(true);
          setError(null);
          retryCount.current = 0;
          return Promise.resolve();
        },
        onmessage: (event: EventSourceMessage) => {
          try {
            if (!event.data) {
              return;
            }
            const parsedData = JSON.parse(event.data);
            setData(parsedData);
          } catch (parseError) {
            console.error('Failed to retrieve details: %o', parseError);
            setError(parseError as ApiError);
          }
        },
        onerror: (error: Error) => {
          setError(new ApiError(error, 410));
          retryCount.current = retryCount.current + 1;
        },
      });
      eventSourceRef.current = eventSource;
    } catch (error) {
      console.error('Error craeating SSE connection: %o', error);
      setError(new ApiError({ message: 'Connection creationg error' }, 444));
    }
  }, [authToken, url]);

  const disconnect = useCallback(() => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    setIsConnected(false);
  }, []);

  const applyConnect = useEffectEvent(connect);

  useEffect(() => {
    applyConnect();
    return () => disconnect();
  }, [disconnect]);

  return {
    data,
    error,
    isConnected,
    connect,
    disconnect,
  }
};
