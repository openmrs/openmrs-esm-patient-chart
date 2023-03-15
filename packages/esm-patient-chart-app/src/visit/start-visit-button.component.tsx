import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@carbon/react';
import { launchPatientChartWithWorkspaceOpen } from '@openmrs/esm-patient-common-lib';
import { navigate, useConfig } from '@openmrs/esm-framework';

interface StartVisitButtonProps {
  patientUuid: string;
}

const StartVisitButton = ({ patientUuid }) => {
  const { t } = useTranslation();
  const { startVisitLabel } = useConfig();

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
      {!startVisitLabel ? <>{t('startVisit', 'Start visit')}</> : startVisitLabel}
    </Button>
  );
};

export default StartVisitButton;
