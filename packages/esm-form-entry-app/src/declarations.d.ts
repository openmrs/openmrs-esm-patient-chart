import type { i18n } from 'i18next';

declare const __webpack_share_scopes__;
declare global {
  interface Window {
    openmrsBase: string;
    spaBase: string;
    i18next: i18n;
  }
}

declare module '*.scss' {
  const content: { [className: string]: string };
  export default content;
}
