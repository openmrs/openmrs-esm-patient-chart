import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@carbon/react';
import { launchWorkspace2, showSnackbar } from '@openmrs/esm-framework';

interface StartVisitButtonProps {
  patient: fhir.Patient;
  patientUuid: string;
  handleReturnToSearchList?: () => void;
  hidePatientSearch?: () => void;
}

/**
 * This button shows up in search results patient cards for patients with no active visit
 */
const StartVisitButton = ({
  patient,
  patientUuid,
  handleReturnToSearchList,
  hidePatientSearch,
}: StartVisitButtonProps) => {
  const { t } = useTranslation();
  const startVisitWorkspaceForm = 'start-visit-workspace-form';

  const handleStartVisit = useCallback(() => {
    hidePatientSearch?.();

    try {
      launchWorkspace2(
        startVisitWorkspaceForm,
        {
          openedFrom: 'patient-chart-start-visit',
          handleReturnToSearchList,
        },
        {},
        {
          patient,
          patientUuid,
          visitContext: null,
          mutateVisitContext: null,
        },
      );
    } catch (error) {
      console.error('Error launching visit form workspace:', error);

      showSnackbar({
        isLowContrast: false,
        kind: 'error',
        title: t('errorStartingVisit', 'Error starting visit'),
        subtitle: error.message ?? t('errorStartingVisitDescription', 'An error occurred while starting the visit'),
      });
    }
  }, [patient, patientUuid, t, handleReturnToSearchList, hidePatientSearch]);

  return (
    <Button aria-label={t('startVisit', 'Start visit')} kind="primary" onClick={handleStartVisit}>
      {t('startVisit', 'Start visit')}
    </Button>
  );
};

export default StartVisitButton;
