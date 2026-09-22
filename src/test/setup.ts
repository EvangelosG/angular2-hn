import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// jsdom does not implement scrolling; the pages call it after each fetch.
window.scrollTo = vi.fn();

afterEach(() => {
    cleanup();
    localStorage.clear();
});
