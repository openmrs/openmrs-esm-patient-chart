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
  /**
   * Set by hosts that manage the encounter datetime themselves (see `EncounterDateTimePicker`). When not
   * `undefined`, the form does not render its own encounter datetime question. A `Date` is the backdated datetime
   * chosen by the user; `null` means no explicit datetime, so the server stamps (or keeps) it.
   */
  encounterDatetime?: Date | null;
  /**
   * Set by hosts that manage the encounter provider themselves (see `ClinicianPicker`). When not `undefined`, the
   * form does not render its own encounter provider question. The value is the UUID of the provider the encounter
   * is attributed to.
   */
  encounterProvider?: string | null;
  launchChildWorkspace?: Workspace2DefinitionProps['launchChildWorkspace'];
  closeWorkspace?: Workspace2DefinitionProps['closeWorkspace'];
  closeWorkspaceWithSavedChanges?: () => void;
  setHasUnsavedChanges?(hasUnsavedChanges: boolean);
}
