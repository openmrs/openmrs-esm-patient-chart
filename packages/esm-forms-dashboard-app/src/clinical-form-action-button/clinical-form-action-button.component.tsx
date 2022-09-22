import React, { useCallback } from 'react';
import { Button } from '@carbon/react';
import { Document } from '@carbon/react/icons';
import { useTranslation } from 'react-i18next';
import { useConfig, useLayoutType, usePatient } from '@openmrs/esm-framework';
import styles from './clinical-form-action-button.scss';
import {
  launchPatientWorkspace,
  launchStartVisitPrompt,
  useVisitOrOfflineVisit,
} from '@openmrs/esm-patient-common-lib';
import { ConfigObject } from '../config-schema';

const ClinicalFormActionButton: React.FC = () => {
  const { t } = useTranslation();
  const { patientUuid } = usePatient();
  const { currentVisit } = useVisitOrOfflineVisit(patientUuid);
  const { useCurrentVisitDates } = useConfig() as ConfigObject;
  const layout = useLayoutType();
  const handleClick = useCallback(() => {
    if (useCurrentVisitDates && !currentVisit) {
      launchStartVisitPrompt();
    } else {
      launchPatientWorkspace('forms-dashboard-workspace');
    }
  }, [currentVisit]);

  if (layout === 'tablet')
    return (
      <Button kind="ghost" className={styles.container} onClick={handleClick}>
        <Document size={20} />
        <span>{t('clinicalForm', 'Clinical form')}</span>
      </Button>
    );

  return (
    <Button
      className={styles.container}
      kind="ghost"
      renderIcon={(props) => <Document size={20} {...props} />}
      hasIconOnly
      iconDescription={t('form', 'Form')}
      tooltipAlignment="end"
      tooltipPosition="bottom"
      onClick={handleClick}
    />
  );
};

export default ClinicalFormActionButton;
