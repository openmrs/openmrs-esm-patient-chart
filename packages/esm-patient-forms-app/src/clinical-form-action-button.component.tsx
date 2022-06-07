import React, { useCallback } from 'react';
import Document20 from '@carbon/icons-react/es/document/20';
import styles from './clinical-form-action-button.scss';
import { useTranslation } from 'react-i18next';
import { useLayoutType, usePatient } from '@openmrs/esm-framework';
import { Button } from 'carbon-components-react';
import {
  launchPatientWorkspace,
  launchStartVisitPrompt,
  useVisitOrOfflineVisit,
  useWorkspaces,
} from '@openmrs/esm-patient-common-lib';

const ClinicalFormActionButton: React.FC = () => {
  const { t } = useTranslation();
  const { patientUuid } = usePatient();
  const { currentVisit } = useVisitOrOfflineVisit(patientUuid);
  const layout = useLayoutType();
  const { workspaces } = useWorkspaces();
  const isActive = workspaces.find(({ name }) => name.includes('patient-form-workspace'));
  const launchClinicalForms = () => {
    if (currentVisit) {
      launchPatientWorkspace('patient-form-workspace');
    } else {
      launchStartVisitPrompt();
    }
  };

  if (layout === 'tablet')
    return (
      <Button
        onClick={launchClinicalForms}
        kind="ghost"
        className={`${styles.container} ${isActive ? styles.active : ''}`}
      >
        <Document20 />
        <span>{t('clinicalForm', 'Clinical form')}</span>
      </Button>
    );

  return (
    <Button
      className={`${styles.container} ${isActive ? styles.active : ''}`}
      kind="ghost"
      onClick={launchClinicalForms}
      renderIcon={Document20}
      hasIconOnly
      iconDescription={t('form', 'Form')}
      tooltipAlignment="start"
      tooltipPosition="left"
    />
  );
};

export default ClinicalFormActionButton;
