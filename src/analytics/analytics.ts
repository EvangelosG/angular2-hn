/** Sends a Google Analytics pageview, like app.component.ts did on NavigationEnd. No-op when ga isn't loaded. */
export function trackPageView(path: string): void {
    const ga = window.ga;
    if (typeof ga !== 'function') {
        return;
    }
    ga('set', 'page', path);
    ga('send', 'pageview');
}
