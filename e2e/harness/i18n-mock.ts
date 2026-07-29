/**
 * Minimal react-i18next stand-in for the harness. Renders the developer default with `{{...}}`
 * interpolation applied, and picks the singular form from the app's own `en.json` when a `count`
 * of one is passed — the one place plural selection is visible in a screenshot.
 */
import translations from '../../packages/esm-patient-tests-app/translations/en.json';

function translate(key: string, defaultValue?: string, options: Record<string, unknown> = {}): string {
  const count = options.count as number | undefined;
  let result =
    count === 1 && translations[`${key}_one`]
      ? (translations[`${key}_one`] as string)
      : defaultValue ?? (translations[key] as string) ?? key;

  Object.entries(options).forEach(([name, value]) => {
    result = result.replace(new RegExp(`{{${name}}}`, 'g'), String(value));
  });

  return result;
}

export function useTranslation() {
  return { t: translate, i18n: { language: 'en' } };
}

export const Trans = ({ children }: { children: React.ReactNode }) => children;
