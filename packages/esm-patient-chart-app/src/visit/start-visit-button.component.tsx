import React, { useCallback } from 'react';
import { Button } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';
import { showSnackbar } from '@openmrs/esm-framework';

interface StartVisitButtonProps {
  patientUuid: string;
  handleBackToSearchList?: () => void;
  setIsPatientSearchOpen?: (isOpen: boolean) => void;
}

const StartVisitButton = ({ patientUuid, handleBackToSearchList, setIsPatientSearchOpen }: StartVisitButtonProps) => {
  const { t } = useTranslation();
  const startVisitWorkspaceForm = 'start-visit-workspace-form';

  const handleStartVisit = useCallback(() => {
    if (setIsPatientSearchOpen) {
      setIsPatientSearchOpen(false);
    }
    try {
      launchPatientWorkspace(startVisitWorkspaceForm, {
        patientUuid,
        openedFrom: 'patient-chart-start-visit',
        handleBackToSearchList,
      });
    } catch (error) {
      console.error('Error launching visit form workspace:', error);

      showSnackbar({
        isLowContrast: false,
        kind: 'error',
        title: t('errorStartingVisit', 'Error starting visit'),
        subtitle: error.message ?? t('errorStartingVisitDescription', 'An error occurred while starting the visit'),
      });
    }
  }, [patientUuid, t, handleBackToSearchList, setIsPatientSearchOpen]);

  return (
    <Button aria-label={t('startVisit', 'Start visit')} kind="primary" onClick={handleStartVisit}>
      {t('startVisit', 'Start visit')}
    </Button>
  );
};

export default StartVisitButton;
