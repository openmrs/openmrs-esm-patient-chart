import React from 'react';
import { useRouteMatch } from 'react-router-dom';
import { ExtensionSlot } from '@openmrs/esm-framework';
import { basePath } from '../constants';

export interface CustomViewProps {
  name: string;
  slot: string;
  patient: fhir.Patient;
  patientUuid: string;
}

export default function CustomView({ slot, patient, patientUuid }: CustomViewProps) {
  const { url } = useRouteMatch(basePath);

  const state = React.useMemo(
    () => ({
      basePath: url,
      patient,
      patientUuid,
    }),
    [url, patientUuid, patient],
  );

  return <ExtensionSlot key={slot} state={state} extensionSlotName={slot} />;
}
