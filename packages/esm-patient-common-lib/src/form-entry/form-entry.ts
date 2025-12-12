import { type Encounter, type Visit, type Workspace2DefinitionProps } from '@openmrs/esm-framework';

export interface FormEntryProps {
  encounterUuid?: string;
  visitUuid?: string;
  formUuid: string;
  visitTypeUuid?: string;
  visitStartDatetime?: string;
  visitStopDatetime?: string;
  additionalProps?: Record<string, any>;
}

/**
 * Workspace control props are made optional to support usage in non-workspace contexts,
 * such as the Fast Data Entry app or other standalone form zones.
 */
export interface FormRendererProps {
  additionalProps?: Record<string, any>;
  encounterUuid?: string;
  formUuid: string;
  patientUuid: string;
  patient: fhir.Patient;
  visit?: Visit;
  visitUuid?: string;
  hideControls?: boolean;
  hidePatientBanner?: boolean;
  handlePostResponse?: (encounter: Encounter) => void;
  preFilledQuestions?: Record<string, string>;
  launchChildWorkspace?: Workspace2DefinitionProps['launchChildWorkspace'];
  closeWorkspace?: Workspace2DefinitionProps['closeWorkspace'];
  setHasUnsavedChanges?(hasUnsavedChanges: boolean);
}
