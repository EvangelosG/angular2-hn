import { useEffect, useState } from 'react';

import type { Story } from '../models';
import { fetchItemContent } from '../services/hackerNewsApi';

interface ItemState {
    key: number;
    item?: Story;
    errorMessage: string;
}

export function useItem(id: number) {
    const [state, setState] = useState<ItemState>({ key: id, errorMessage: '' });

    useEffect(() => {
        let cancelled = false;
        window.scrollTo(0, 0);

        fetchItemContent(id)
            .then((item) => {
                if (!cancelled) {
                    setState({ key: id, item, errorMessage: '' });
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setState({ key: id, errorMessage: 'Could not load item comments.' });
                }
            });

        return () => {
            cancelled = true;
        };
    }, [id]);

    return state.key === id ? { item: state.item, errorMessage: state.errorMessage } : { errorMessage: '' };
}
