import { Button } from '@carbon/react';
import { launchPatientChartWithWorkspaceOpen } from '@openmrs/esm-patient-common-lib';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

const StartVisitButton = ({ patientUuid }) => {
  const { t } = useTranslation();

  const handleStartVisit = useCallback(() => {
    launchPatientChartWithWorkspaceOpen({
      patientUuid,
      workspaceName: 'start-visit-workspace-form',
      additionalProps: {
        openedFrom: 'patient-chart-start-visit',
      },
    });
  }, [patientUuid]);

  return (
    <Button kind="primary" onClick={handleStartVisit}>
      {t('startVisit', 'Start visit')}
    </Button>
  );
};

export default StartVisitButton;
