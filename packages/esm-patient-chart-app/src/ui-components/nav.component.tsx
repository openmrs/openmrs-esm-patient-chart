import React, { useEffect, useState } from 'react';
import { ExtensionSlot } from '@openmrs/esm-framework';
import { spaBasePath } from '../constants';

function getPatientUuidFromUrl() {
  const match = /\/patient\/([a-zA-Z0-9\-]+)\/?/.exec(location.pathname);
  return match && match[1];
}

const PatientChartNavMenu: React.FC = () => {
  const [patientUuid, setPatientUuid] = useState(getPatientUuidFromUrl);
  const basePath = spaBasePath.replace(':patientUuid', patientUuid);

  useEffect(() => {
    const handler = () => {
      const currentPatientUuid = getPatientUuidFromUrl();

      if (currentPatientUuid !== patientUuid) {
        setPatientUuid(currentPatientUuid);
      }
    };
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, [patientUuid]);

  return <ExtensionSlot state={{ basePath }} extensionSlotName="patient-chart-dashboard-slot" />;
};

export default PatientChartNavMenu;
