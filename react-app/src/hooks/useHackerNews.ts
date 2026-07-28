import { useEffect, useState } from 'react';

interface HackerNewsRequest<T> {
  (signal: AbortSignal): Promise<T>;
}

interface HackerNewsResult<T> {
  data: T | null;
  errorMessage: string;
}

/**
 * Runs a Hacker News API request and cancels the in-flight fetch when the
 * request changes or the component unmounts.
 *
 * `request` must be referentially stable (wrap it in `useCallback`).
 */
export function useHackerNews<T>(
  request: HackerNewsRequest<T>,
  errorMessage: string
): HackerNewsResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    setData(null);
    setError('');

    request(controller.signal)
      .then((result) => setData(result))
      .catch(() => {
        if (!controller.signal.aborted) {
          setError(errorMessage);
        }
      });

    return () => controller.abort();
  }, [request, errorMessage]);

  return { data, errorMessage: error };
}
