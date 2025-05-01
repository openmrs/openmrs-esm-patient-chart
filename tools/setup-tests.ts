import '@testing-library/jest-dom';

// https://github.com/jsdom/jsdom/issues/1695
window.HTMLElement.prototype.scrollIntoView = function () {};

window.URL.createObjectURL = jest.fn();
global.openmrsBase = '/openmrs';
global.spaBase = '/spa';
global.getOpenmrsSpaBase = () => '/openmrs/spa/';
global.Response = Object as any;

// https://github.com/jsdom/jsdom/issues/1695
window.HTMLElement.prototype.scrollIntoView = function () {};

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated in MediaQueryList
    removeListener: jest.fn(), // Deprecated in MediaQueryList
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));
