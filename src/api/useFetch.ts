import { useEffect, useState } from 'react';

interface FetchState<T> {
    data: T | null;
    error: string;
}

/**
 * Runs `request` whenever `deps` change and aborts the in-flight request on cleanup.
 */
export function useFetch<T>(
    request: (signal: AbortSignal) => Promise<T>,
    errorMessage: string,
    deps: unknown[]
): FetchState<T> {
    const [state, setState] = useState<FetchState<T>>({ data: null, error: '' });

    useEffect(() => {
        const controller = new AbortController();
        setState({ data: null, error: '' });

        request(controller.signal)
            .then((data) => setState({ data, error: '' }))
            .catch((error: unknown) => {
                if (error instanceof DOMException && error.name === 'AbortError') {
                    return;
                }
                setState({ data: null, error: errorMessage });
            });

        return () => controller.abort();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);

    return state;
}
