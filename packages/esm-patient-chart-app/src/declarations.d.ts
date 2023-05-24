declare module '*.css';
declare module '*.scss';
declare module '*.png';
declare global {
  interface Window {
    i18next: i18n;
  }
}
