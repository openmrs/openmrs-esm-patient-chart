import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLayoutType } from '@openmrs/esm-framework';
import { CardHeader, ErrorState } from '@openmrs/esm-patient-common-lib';
import { ContentSwitcher, DataTableSkeleton, InlineLoading, Switch } from '@carbon/react';
import capitalize from 'lodash-es/capitalize';
import { groupBy } from '../helpers';
import { CompletedFormInfo } from '../types';
import EmptyFormView from './empty-form.component';
import FormView from './form-view.component';
import styles from './forms.scss';

interface ConfigurableFormsProps {
  formsToDisplay: Array<CompletedFormInfo>;
  headerTitle: string;
  isValidating: boolean;
  patientUuid: string;
  patient: fhir.Patient;
  pageSize: number;
  pageUrl: string;
  urlLabel: string;
  error: Error;
}

const ConfigurableForms: React.FC<ConfigurableFormsProps> = ({
  formsToDisplay,
  headerTitle,
  isValidating,
  patientUuid,
  patient,
  pageSize,
  pageUrl,
  urlLabel,
  error,
}) => {
  const [selectedFormCategoryIndex, setSelectedFormCategoryIndex] = useState(0);
  const isTablet = useLayoutType() === 'tablet';
  const { t } = useTranslation();

  const configurableForms =
    formsToDisplay?.flatMap((form) => ({ formCategory: form.form.formCategory, ...form })) ?? [];
  const formCategories = Array.from(new Set(configurableForms?.flatMap(({ form }) => form.formCategory)));
  const configFormsToDisplay = groupBy<Record<string, CompletedFormInfo>>(configurableForms, 'formCategory');

  const forms = configFormsToDisplay[formCategories[selectedFormCategoryIndex]];

  if (!formsToDisplay && !error) {
    return <DataTableSkeleton role="progressbar" rowCount={5} />;
  }

  if (error) {
    return <ErrorState headerTitle={t('forms', 'Forms')} error={error} />;
  }

  if (formsToDisplay.length === 0) {
    return <EmptyFormView content={t('noFormsAvailable', 'There are no forms to display for this patient')} />;
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
            onChange={({ name }) => setSelectedFormCategoryIndex(Number(name))}
            selectedIndex={0}
          >
            {formCategories?.map((form, index) => (
              <Switch name={index} text={capitalize(form)} />
            ))}
          </ContentSwitcher>
        </div>
      </CardHeader>
      <div style={{ width: '100%' }}>
        {forms && (
          <FormView
            forms={forms}
            patientUuid={patientUuid}
            patient={patient}
            pageSize={pageSize}
            pageUrl={pageUrl}
            urlLabel={urlLabel}
          />
        )}
      </div>
    </div>
  );
};

export default ConfigurableForms;
