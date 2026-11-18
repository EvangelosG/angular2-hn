/** Installs a controllable window.matchMedia; returns a restore function and a way to fire change events. */
export function installMatchMedia(initialMatches: boolean) {
    const original = window.matchMedia;
    const listeners = new Set<(event: MediaQueryListEvent) => void>();
    let matches = initialMatches;

    window.matchMedia = function matchMedia(query: string): MediaQueryList {
        return {
            get matches() {
                return matches;
            },
            media: query,
            onchange: null,
            addEventListener: (_type: string, listener: (event: MediaQueryListEvent) => void) => listeners.add(listener),
            removeEventListener: (_type: string, listener: (event: MediaQueryListEvent) => void) =>
                listeners.delete(listener),
            addListener: () => undefined,
            removeListener: () => undefined,
            dispatchEvent: () => false,
        } as unknown as MediaQueryList;
    };

    return {
        setMatches(next: boolean) {
            matches = next;
            listeners.forEach((listener) => listener({ matches: next } as MediaQueryListEvent));
        },
        listenerCount: () => listeners.size,
        restore() {
            window.matchMedia = original;
        },
    };
}
