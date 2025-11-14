import React from 'react';
import { type PatientWorkspace2DefinitionProps } from '@openmrs/esm-patient-common-lib';
import ExportedVitalsAndBiometricsForm from './exported-vitals-biometrics-form.workspace';

export interface VitalsAndBiometricsFormProps {
  formContext: 'creating' | 'editing';
  editEncounterUuid?: string;
}

/**
 * This workspace displays the form to input patient vitals and biometrics.
 * This workspace should only be used within the patient chart. Use ExportedVitalsAndBiometricsForm
 * for use cases outside the patient chart.
 */
const VitalsAndBiometricsForm: React.FC<PatientWorkspace2DefinitionProps<VitalsAndBiometricsFormProps, {}>> = ({
  workspaceProps: { editEncounterUuid, formContext = 'creating' },
  groupProps: { patientUuid, patient, visitContext },
  ...rest
}) => {
  return (
    <ExportedVitalsAndBiometricsForm
      workspaceProps={{ editEncounterUuid, formContext, patientUuid, patient, visitContext }}
      windowProps={null}
      groupProps={null}
      {...rest}
    />
  );
};

export default VitalsAndBiometricsForm;
