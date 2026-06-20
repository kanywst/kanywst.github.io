/// <reference types="vitest/globals" />
import '@testing-library/jest-dom/vitest';

// jsdom doesn't implement matchMedia; App reads it for prefers-reduced-motion. Stub a
// "no preference" match so the View Transition path falls through to a synchronous swap.
if (!window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList;
}
