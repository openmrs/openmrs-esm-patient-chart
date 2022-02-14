import React, { useState } from 'react';
import FormView from './form-view.component';
import styles from './forms.component.scss';
import EmptyFormView from './empty-form.component';
import { ContentSwitcher, Switch, DataTableSkeleton, InlineLoading } from 'carbon-components-react';
import { CardHeader, ErrorState } from '@openmrs/esm-patient-common-lib';
import { useTranslation } from 'react-i18next';
import { useForms } from '../hooks/use-forms';
import { useConfig, useLayoutType } from '@openmrs/esm-framework';
import { isValidOfflineFormEncounter } from '../offline-forms/offline-form-helpers';
import { ConfigObject } from '../config-schema';

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
  isOffline: boolean;
}

const Forms: React.FC<FormsProps> = ({ patientUuid, patient, pageSize, pageUrl, urlLabel, isOffline }) => {
  const { t } = useTranslation();
  const config = useConfig() as ConfigObject;
  const headerTitle = t('forms', 'Forms');
  const isTablet = useLayoutType() === 'tablet';
  const [formsCategory, setFormsCategory] = useState(FormsCategory.All);
  const { isValidating, data, error } = useForms(patientUuid, undefined, undefined, isOffline);
  const formsToDisplay = isOffline
    ? data?.filter((formInfo) => isValidOfflineFormEncounter(formInfo.form, config.htmlFormEntryForms))
    : data;

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
      <CardHeader title={headerTitle}>
        {isValidating ? (
          <span>
            <InlineLoading />
          </span>
        ) : null}
        <div className={styles.contextSwitcherContainer}>
          <ContentSwitcher
            className={isTablet ? styles.tabletContentSwitcher : styles.desktopContentSwitcher}
            onChange={(event) => setFormsCategory(event.name as any)}
            selectedIndex={formsCategory}
          >
            <Switch name={FormsCategory.Recommended} text="Recommended" />
            <Switch name={FormsCategory.Completed} text="Completed" />
            <Switch name={FormsCategory.All} text="All" />
          </ContentSwitcher>
        </div>
      </CardHeader>
      <div style={{ width: '100%' }}>
        {formsCategory === FormsCategory.Completed && (
          <FormView
            forms={formsToDisplay.filter((formInfo) => formInfo.associatedEncounters.length > 0)}
            patientUuid={patientUuid}
            patient={patient}
            pageSize={pageSize}
            pageUrl={pageUrl}
            urlLabel={urlLabel}
          />
        )}
        {formsCategory === FormsCategory.All && (
          <FormView
            forms={formsToDisplay}
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
