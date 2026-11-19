import { trackPageView } from './analytics';

describe('trackPageView', () => {
    afterEach(() => {
        delete window.ga;
    });

    it('sets the page and sends a pageview', () => {
        const ga = vi.fn();
        window.ga = ga;

        trackPageView('/news/2');

        expect(ga.mock.calls).toEqual([
            ['set', 'page', '/news/2'],
            ['send', 'pageview'],
        ]);
    });

    it('does nothing when analytics is not loaded', () => {
        expect(() => trackPageView('/news/1')).not.toThrow();
    });
});
