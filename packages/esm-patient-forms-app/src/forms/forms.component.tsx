import React, { useCallback, useMemo, useState } from 'react';
import FormView from './form-view.component';
import styles from './forms.scss';
import EmptyFormView from './empty-form.component';
import { DataTableSkeleton } from 'carbon-components-react';
import { ErrorState, PatientProgram } from '@openmrs/esm-patient-common-lib';
import { useTranslation } from 'react-i18next';
import { useConfig } from '@openmrs/esm-framework';
import { ConfigObject } from '../config-schema';
import dayjs from 'dayjs';
import 'dayjs/plugin/isToday';
import { useRecommendForms } from '../hooks/use-recommended-forms';

const enum FormsCategory {
  Recommended = 'Recommend',
  Completed = 'Completed',
  All = 'All',
}
interface FormsProps {
  patientUuid: string;
  patient: fhir.Patient;
  pageSize: number;
  pageUrl: string;
  urlLabel: string;
  isOffline: boolean;
  activePatientEnrollment?: Array<PatientProgram>;
  launchForm: (form) => void;
}

const Forms: React.FC<FormsProps> = ({ patientUuid, patient, pageSize, pageUrl, urlLabel, isOffline, launchForm }) => {
  const { t } = useTranslation();
  const { showRecommendedFormsTab } = useConfig() as ConfigObject;
  const [formsCategory, setFormsCategory] = useState(
    showRecommendedFormsTab ? FormsCategory.Recommended : FormsCategory.All,
  );
  const { formsToDisplay, recommendedForms, error } = useRecommendForms(patientUuid, isOffline);

  const changeFormCategory = useCallback((formCategory: FormsCategory) => setFormsCategory(formCategory), []);

  const forms = useMemo(() => {
    switch (formsCategory) {
      case FormsCategory.All:
        return formsToDisplay;
      case FormsCategory.Completed:
        return formsToDisplay.filter(
          ({ associatedEncounters, lastCompleted }) =>
            associatedEncounters.length > 0 && dayjs(lastCompleted).isToday(),
        );
      case FormsCategory.Recommended:
        return recommendedForms;
    }
  }, [formsCategory, formsToDisplay, recommendedForms]);
  if (!formsToDisplay && !error) {
    return <DataTableSkeleton role="progressbar" rowCount={5} />;
  }

  if (error) {
    return <ErrorState headerTitle={t('forms', 'Forms')} error={error} />;
  }

  if (formsToDisplay.length === 0) {
    return <EmptyFormView action={t('noFormsAvailable', 'There are no Forms to display for this patient')} />;
  }

  return (
    <div className={styles.widgetCard}>
      <section>
        <FormView
          forms={forms}
          patientUuid={patientUuid}
          patient={patient}
          pageSize={pageSize}
          pageUrl={pageUrl}
          urlLabel={urlLabel}
          changeFormCategory={changeFormCategory}
          launchForm={launchForm}
        />
      </section>
    </div>
  );
};

export default Forms;
