import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// https://github.com/jsdom/jsdom/issues/1695
window.HTMLElement.prototype.scrollIntoView = function () {};

window.URL.createObjectURL = vi.fn();
(globalThis as Record<string, unknown>).openmrsBase = '/openmrs';
(globalThis as Record<string, unknown>).spaBase = '/spa';
(globalThis as Record<string, unknown>).getOpenmrsSpaBase = () => '/openmrs/spa/';
(globalThis as Record<string, unknown>).Response = Object as unknown as typeof Response;

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // Deprecated in MediaQueryList
    removeListener: vi.fn(), // Deprecated in MediaQueryList
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

global.ResizeObserver = class ResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
};

class IntersectionObserverMock {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  trigger: (entries: unknown[]) => void;
  options: unknown;
  constructor(callback: (entries: unknown[], observer: IntersectionObserverMock) => void, options?: unknown) {
    this.trigger = (entries) => callback(entries, this);
    this.options = options;
  }
}
global.IntersectionObserver = IntersectionObserverMock as unknown as typeof IntersectionObserver;
