/**
 * jsdom ships neither observer API, and the landing page's scroll/viewport
 * animations construct both on mount. The stubs below never fire a callback,
 * which is the right behaviour under test: nothing scrolls and nothing resizes.
 */
class NoopObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
  readonly root = null;
  readonly rootMargin = "";
  readonly thresholds: readonly number[] = [];
}

if (!("ResizeObserver" in globalThis)) {
  globalThis.ResizeObserver =
    NoopObserver as unknown as typeof globalThis.ResizeObserver;
}

if (!("IntersectionObserver" in globalThis)) {
  globalThis.IntersectionObserver =
    NoopObserver as unknown as typeof globalThis.IntersectionObserver;
}

if (!globalThis.matchMedia) {
  globalThis.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof globalThis.matchMedia;
}
