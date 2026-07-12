import { formatDate, formatDatetime, parseDate } from '@openmrs/esm-framework';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { BACKEND_DATETIME_FORMAT } from '../constants';

dayjs.extend(utc);
dayjs.extend(customParseFormat);

const FIELD_LABELS: Record<string, string> = {
  gender: 'Gender',
  birthdate: 'Birth date',
  birthdateEstimated: 'Birth date estimated',
  dead: 'Deceased',
  deathDate: 'Death date',
  deathdateEstimated: 'Death date estimated',
  causeOfDeath: 'Cause of death',
  causeOfDeathNonCoded: 'Cause of death (non-coded)',
  voided: 'Voided',
  voidReason: 'Void reason',
  personVoided: 'Voided',
  personVoidReason: 'Void reason',
  identifier: 'Identifier',
  identifierType: 'Identifier type',
  preferred: 'Preferred',
  givenName: 'Given name',
  middleName: 'Middle name',
  familyName: 'Family name',
  address1: 'Address line 1',
  address2: 'Address line 2',
  cityVillage: 'City / village',
  stateProvince: 'State / province',
  postalCode: 'Postal code',
  country: 'Country',
};

// Fields that carry a calendar date with no meaningful time-of-day component.
const DATE_ONLY_FIELDS = new Set(['birthdate', 'deathDate']);

const ISO_DATETIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/;

export function humanizeFieldName(fieldName: string): string {
  if (FIELD_LABELS[fieldName]) {
    return FIELD_LABELS[fieldName];
  }
  const spaced = fieldName
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .trim();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

export function formatRevisionDatetime(value: string): string {
  if (!value) {
    return value;
  }
  const parsed = dayjs.utc(value, BACKEND_DATETIME_FORMAT, true);
  return parsed.isValid() ? formatDatetime(parsed.toDate()) : value;
}

export function formatDisplayValue(rawValue: string, display?: string | null, fieldName?: string): string {
  if (display) {
    return display;
  }
  if (!rawValue) {
    return '';
  }
  if (ISO_DATETIME.test(rawValue)) {
    const date = parseDate(rawValue);
    if (date && !Number.isNaN(date.getTime())) {
      return fieldName && DATE_ONLY_FIELDS.has(fieldName) ? formatDate(date) : formatDatetime(date);
    }
  }
  return rawValue;
}
