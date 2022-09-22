import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './forms-dashboard.scss';
import { EmptyDataIllustration, useVisitOrOfflineVisit } from '@openmrs/esm-patient-common-lib';
import FormsList from './form-list/forms-list.component';
import { useFormsToDisplay } from '../hooks/use-forms';
import { DataTableSkeleton, Layer, Tile } from '@carbon/react';

interface FormsDashboardProps {
  patientUuid: string;
  patient: fhir.Patient;
  isOffline: boolean;
}

const FormsDashboard: React.FC<FormsDashboardProps> = ({ patientUuid, patient, isOffline }) => {
  const { t } = useTranslation();
  const { currentVisit } = useVisitOrOfflineVisit(patientUuid);
  const { isValidating, data, error } = useFormsToDisplay(patientUuid, isOffline);
  const [searchTerm, setSearchTerm] = useState('');
  patient = { id: patientUuid }; //TODO workaround while isn't offline ready

  if (data) {
    return (
      <div className={styles.widgetCard}>
        {data?.map((formsSection, i) => {
          let pageSize = undefined;
          return (
            <FormsList {...{ patientUuid, patient, visit: currentVisit, formsSection, searchTerm, pageSize }} key={i} />
          );
        })}
      </div>
    );
  }

  if (isValidating) {
    return <DataTableSkeleton role="progressbar" />;
  }

  return (
    <Layer>
      <Tile className={styles.tile}>
        <EmptyDataIllustration />
        <p className={styles.content}>{t('noFormsAvailable', 'There are no forms to display')}</p>
      </Tile>
    </Layer>
  );
};

export default FormsDashboard;
