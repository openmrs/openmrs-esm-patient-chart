import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@carbon/react';
import { launchPatientChartWithWorkspaceOpen } from '@openmrs/esm-patient-common-lib';
import { navigate } from '@openmrs/esm-framework';

const StartVisitButton = ({ patientUuid }) => {
  const { t } = useTranslation();

  const handleStartVisit = useCallback(() => {
    launchPatientChartWithWorkspaceOpen({
      patientUuid,
      workspaceName: 'start-visit-workspace-form',
    });
    navigate({
      to: `\${openmrsSpaBase}/patient/${patientUuid}/chart`,
    });
  }, [patientUuid]);

  return (
    <Button kind="primary" onClick={handleStartVisit}>
      {t('startVisit', 'Start visit')}
    </Button>
  );
};

export default StartVisitButton;
