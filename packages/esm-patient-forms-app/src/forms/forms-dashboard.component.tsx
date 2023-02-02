import React from 'react';
import { useConfig, usePatient } from '@openmrs/esm-framework';
import { useVisitOrOfflineVisit } from '@openmrs/esm-patient-common-lib';
import type { HtmlFormEntryForm } from '../config-schema';
import FormsList from './forms-list.component';
import styles from './forms-dashboard.scss';

const FormsDashboard = () => {
  const config = useConfig();
  const htmlFormEntryForms: Array<HtmlFormEntryForm> = config.htmlFormEntryForms;
  const { patient, patientUuid } = usePatient();
  const { currentVisit } = useVisitOrOfflineVisit(patientUuid);

  return (
    <div className={styles.container}>
      <FormsList
        currentVisit={currentVisit}
        htmlFormEntryForms={htmlFormEntryForms}
        patient={patient}
        patientUuid={patientUuid}
      />
    </div>
  );
};

export default FormsDashboard;
