import React from 'react';
import { type Encounter, type Workspace2DefinitionProps } from '@openmrs/esm-framework';
import {
  type ClinicalFormsWindowProps,
  type Form,
  getPatientAndVisitProps,
  type SharedWorkspaceGroupProps,
  usePatientForBanner,
  useShowPatientBanner,
} from '@openmrs/esm-patient-common-lib';
import FormEntry from './form-entry.component';

interface FormEntryWorkspaceProps {
  form: Form;
  encounterUuid?: string;
  additionalProps?: Record<string, any>;
  handlePostResponse?: (encounter: Encounter) => void;
}

/**
 * This workspace renders a React or HTML form to be filled out for a given patient.
 *
 * It takes the patient and visit from its window props, not from group props, so it can be used
 * both inside and outside the patient chart.
 */
const FormEntryWorkspace: React.FC<
  Workspace2DefinitionProps<FormEntryWorkspaceProps, ClinicalFormsWindowProps, SharedWorkspaceGroupProps>
> = ({
  closeWorkspace,
  isRootWorkspace,
  groupProps,
  workspaceProps: { form, encounterUuid, additionalProps, handlePostResponse },
  windowProps,
}) => {
  const {
    patient: patientProp,
    patientUuid,
    visitContext,
  } = getPatientAndVisitProps(windowProps, undefined, groupProps);
  // Hosts such as the ward pass a partial / REST patient, and child workspaces inherit the window props
  // of the workspace that opened them, so resolve the patient the banner needs here.
  const patient = usePatientForBanner(patientProp, patientUuid);
  const shouldShowPatientBanner = useShowPatientBanner(groupProps);

  return (
    <FormEntry
      form={form}
      encounterUuid={encounterUuid}
      additionalProps={additionalProps}
      patient={patient}
      patientUuid={patientUuid}
      visitContext={visitContext}
      closeWorkspace={closeWorkspace}
      showBackButton={!isRootWorkspace}
      showPatientBanner={shouldShowPatientBanner}
      handlePostResponse={handlePostResponse}
    />
  );
};

export default FormEntryWorkspace;
