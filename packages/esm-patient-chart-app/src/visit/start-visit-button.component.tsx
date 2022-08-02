import { navigate } from '@openmrs/esm-framework';
import { launchPatientChartWithWorkspaceOpen } from '@openmrs/esm-patient-common-lib';
import { Button } from 'carbon-components-react';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

interface StartVisitButtonProps {
  patientUuid: string;
}

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
  }, [launchPatientChartWithWorkspaceOpen, patientUuid]);
  return (
    <Button kind="primary" onClick={handleStartVisit}>
      {t('startVisit', 'Start visit')}
    </Button>
  );
};

export default StartVisitButton;
