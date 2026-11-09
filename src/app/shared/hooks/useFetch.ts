import { DependencyList, useEffect, useState } from 'react';

export interface FetchState<T> {
    data: T | undefined;
    error: unknown;
    loading: boolean;
}

export function useFetch<T>(fetcher: (signal: AbortSignal) => Promise<T>, deps: DependencyList): FetchState<T> {
    const [state, setState] = useState<FetchState<T>>({ data: undefined, error: undefined, loading: true });

    useEffect(() => {
        const controller = new AbortController();
        setState({ data: undefined, error: undefined, loading: true });
        fetcher(controller.signal).then(
            (data) => {
                if (!controller.signal.aborted) {
                    setState({ data, error: undefined, loading: false });
                }
            },
            (error: unknown) => {
                if (!controller.signal.aborted) {
                    setState({ data: undefined, error, loading: false });
                }
            }
        );
        return () => controller.abort();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);

    return state;
}
