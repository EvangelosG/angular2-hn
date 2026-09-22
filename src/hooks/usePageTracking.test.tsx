import { act, render } from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { usePageTracking } from './usePageTracking';

let navigateTo: (path: string) => void = () => undefined;

function Tracked() {
    usePageTracking();
    navigateTo = useNavigate();
    return null;
}

describe('usePageTracking', () => {
    afterEach(() => {
        delete window.ga;
    });

    it('sends a pageview to ga on mount and on every navigation', () => {
        const ga = vi.fn();
        window.ga = ga;

        render(
            <MemoryRouter initialEntries={['/news/1']}>
                <Tracked />
            </MemoryRouter>
        );

        expect(ga.mock.calls).toEqual([
            ['set', 'page', '/news/1'],
            ['send', 'pageview'],
        ]);

        act(() => navigateTo('/item/42?x=1'));

        expect(ga.mock.calls.slice(2)).toEqual([
            ['set', 'page', '/item/42?x=1'],
            ['send', 'pageview'],
        ]);
    });

    it('is a no-op when the analytics snippet is not loaded', () => {
        expect(() =>
            render(
                <MemoryRouter initialEntries={['/news/1']}>
                    <Tracked />
                </MemoryRouter>
            )
        ).not.toThrow();
    });
});
