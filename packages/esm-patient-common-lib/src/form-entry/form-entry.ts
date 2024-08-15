import { type HtmlFormEntryForm } from '@openmrs/esm-patient-forms-app/src/config-schema';

export interface FormEntryProps {
  encounterUuid?: string;
  visitUuid?: string;
  formUuid: string;
  visitTypeUuid?: string;
  visitStartDatetime?: string;
  visitStopDatetime?: string;
  htmlForm?: HtmlFormEntryForm;
  additionalProps?: Record<string, any>;
}
