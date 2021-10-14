import React, { useState } from 'react';
import FormView from './form-view.component';
import styles from './forms.component.scss';
import EmptyFormView from './empty-form.component';
import { ContentSwitcher, Switch, DataTableSkeleton, InlineLoading } from 'carbon-components-react';
import { ErrorState } from '@openmrs/esm-patient-common-lib';
import { useTranslation } from 'react-i18next';
import { useForms } from '../hooks/useForms';

const enum FormsCategory {
  Recommended,
  Completed,
  All,
}

interface FormsProps {
  patientUuid: string;
  patient: fhir.Patient;
  pageSize: number;
  pageUrl: string;
  urlLabel: string;
}

const Forms: React.FC<FormsProps> = ({ patientUuid, patient, pageSize, pageUrl, urlLabel }) => {
  const { t } = useTranslation();
  const headerTitle = t('forms', 'Forms');
  const [formsCategory, setFormsCategory] = useState(FormsCategory.All);
  const { isValidating, data, error } = useForms(patientUuid);

  if (!data && !error) {
    return <DataTableSkeleton role="progressbar" rowCount={5} />;
  }

  if (error) {
    return <ErrorState headerTitle={t('forms', 'Forms')} error={error} />;
  }

  if (data.length === 0) {
    return <EmptyFormView action={t('noFormsAvailable', 'There are no Forms to display for this patient')} />;
  }

  return (
    <div className={styles.formsWidgetContainer}>
      <div className={styles.formsHeaderContainer}>
        <h4 className={`${styles.productiveHeading03} ${styles.text02}`}>{headerTitle}</h4>
        {isValidating ? (
          <span>
            <InlineLoading />
          </span>
        ) : null}
        <div className={styles.contextSwitcherContainer}>
          <ContentSwitcher
            className={styles.contextSwitcherWidth}
            onChange={(event) => setFormsCategory(event.name as any)}
            selectedIndex={formsCategory}
          >
            <Switch name={FormsCategory.Recommended} text="Recommended" />
            <Switch name={FormsCategory.Completed} text="Completed" />
            <Switch name={FormsCategory.All} text="All" />
          </ContentSwitcher>
        </div>
      </div>
      <div style={{ width: '100%' }}>
        {formsCategory === FormsCategory.Completed && (
          <FormView
            forms={data.filter((formInfo) => formInfo.associatedEncounters.length > 0)}
            patientUuid={patientUuid}
            patient={patient}
            pageSize={pageSize}
            pageUrl={pageUrl}
            urlLabel={urlLabel}
          />
        )}
        {formsCategory === FormsCategory.All && (
          <FormView
            forms={data}
            patientUuid={patientUuid}
            patient={patient}
            pageSize={pageSize}
            pageUrl={pageUrl}
            urlLabel={urlLabel}
          />
        )}
        {formsCategory === FormsCategory.Recommended && (
          <EmptyFormView action={t('noRecommendedFormsAvailable', 'No recommended forms available at the moment')} />
        )}
      </div>
    </div>
  );
};

export default Forms;
