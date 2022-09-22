import React from 'react';
import { DataTableSkeleton } from '@carbon/react';
import { formatDate, UserHasAccess, useVisit } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import styles from './forms-dashboard.scss';
import { CardHeader, EmptyDataIllustration, useVisitOrOfflineVisit } from '@openmrs/esm-patient-common-lib';
import FormsList from './form-list/forms-list.component';
import { useFormsToDisplay } from '../hooks/use-forms';

interface FormsDashboardProps {
  patientUuid: string;
  patient: fhir.Patient;
  isOffline: boolean;
}

const FormsDashboard: React.FC<FormsDashboardProps> = ({ patientUuid, patient, isOffline }) => {
  const { t } = useTranslation();
  const { currentVisit } = useVisitOrOfflineVisit(patientUuid);
  const { isValidating, data, error } = useFormsToDisplay(patientUuid, isOffline);
  const mockData = {
    sections: [
      {
        name: 'ICRC Forms',
        labelCode: 'icrcForms',
        encounters: [
          {
            id: '1',
            uuid: '',
            display: 'WHODAS 2.0',
            lastCompleted: formatDate(new Date('2022-01-14T08:46:05.000+0000'), { time: false }),
            formUuid: 'f09727da-5806-3de0-a51b-56c3ad3564bb',
          },
          {
            id: '2',
            uuid: '',
            display: 'ProQOL Form',
            lastCompleted: formatDate(new Date('2022-01-14T08:46:05.000+0000'), { time: false }),
            formUuid: '9c7b24e7-b7ee-31f1-a80d-3665eafb1f52',
          },
        ],
      },
      {
        name: 'Distress Scales',
        labelCode: 'distressScales',
        encounters: [
          {
            id: '3',
            uuid: '',
            display: 'DASS-21',
            lastCompleted: formatDate(new Date('2022-01-14T08:46:05.000+0000'), { time: false }),
            formUuid: '2e6233af-240d-31cc-b4c3-4f0ab566dd54',
          },
          {
            id: '4',
            uuid: '',
            display: 'CRIES-13',
            lastCompleted: formatDate(new Date('2022-01-14T08:46:05.000+0000'), { time: false }),
            formUuid: 'a9364c6d-3a08-31d6-862f-df8cef5e9423',
          },
        ],
      },
    ],
  };

  if (isValidating) {
    return <DataTableSkeleton role="progressbar" />;
  }

  if (data) {
    return (
      <div className={styles.formsWidgetContainer}>
        {data?.map((formsSection, i) => {
          let searchTerm = '';
          let pageSize = undefined;
          return (
            <FormsList {...{ patientUuid, patient, visit: currentVisit, formsSection, searchTerm, pageSize }} key={i} />
          );
        })}
      </div>
    );
  }

  return (
    <div className={styles.formsWidgetContainer}>
      <CardHeader title={t('formsDashboard', 'Forms Dashboard')} children={undefined} />
      <div>
        <h5 className={styles.tile}>
          <EmptyDataIllustration />
          <p className={styles.content}>{t('noFormsAvailable', 'There are no forms to display')}</p>
        </h5>
      </div>
    </div>
  );
};

export default FormsDashboard;
