import React, { useMemo } from 'react';
import { ExtensionSlot, usePatient } from '@openmrs/esm-framework';
import { spaBasePath } from '../constants';

const PatientChartNavMenu: React.FC = () => {
  const { patientUuid } = usePatient();
  const basePath = useMemo(() => spaBasePath.replace(':patientUuid', patientUuid), [patientUuid]);

  return <ExtensionSlot state={{ basePath }} extensionSlotName="patient-chart-dashboard-slot" />;
};

export default PatientChartNavMenu;
