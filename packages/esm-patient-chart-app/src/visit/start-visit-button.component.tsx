import { Button } from '@carbon/react';
import { launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';
import React from 'react';
import { useTranslation } from 'react-i18next';

const StartVisitButton = ({ patientUuid }) => {
  const { t } = useTranslation();

  const handleStartVisit = () => {
    try {
      launchPatientWorkspace('start-visit-workspace-form', {
        patientUuid,
        openedFrom: 'patient-chart-start-visit',
      });
    } catch (error) {
      console.error('Error launching Start Visit workspace:', error);
    }
  };

  return (
    <Button kind="primary" onClick={handleStartVisit} aria-label={t('startVisit', 'Start visit')}>
      {t('startVisit', 'Start visit')}
    </Button>
  );
};

export default StartVisitButton;
