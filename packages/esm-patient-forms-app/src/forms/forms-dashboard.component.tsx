import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Tile } from '@carbon/react';
import { ResponsiveWrapper, useConfig, useConnectivity, type Visit } from '@openmrs/esm-framework';
import { EmptyDataIllustration, type Form } from '@openmrs/esm-patient-common-lib';
import type { FormEntryConfigSchema } from '../config-schema';
import { useForms } from '../hooks/use-forms';
import FormsList from './forms-list.component';
import styles from './forms-dashboard.scss';

interface FormsDashbaordProps {
  handleFormOpen: (form: Form, encounterUuid: string) => void;
  patient: fhir.Patient;
  visitContext: Visit;
}

const FormsDashboard: React.FC<FormsDashbaordProps> = ({ handleFormOpen, patient, visitContext }) => {
  const { t } = useTranslation();
  const config = useConfig<FormEntryConfigSchema>();
  const isOnline = useConnectivity();
  const {
    data: forms,
    error,
    totalForms,
  } = useForms(patient.id, visitContext?.uuid, undefined, undefined, !isOnline, config.orderBy);

  const sections = useMemo(() => {
    return (
      config.formSections?.map((formSection) => ({
        ...formSection,
        availableForms: forms?.filter((formInfo) =>
          formSection.forms.some(
            (formConfig) => formInfo.form.uuid === formConfig || formInfo.form.name === formConfig,
          ),
        ),
      })) ?? []
    );
  }, [config.formSections, forms]);

  if (forms?.length === 0) {
    return (
      <ResponsiveWrapper>
        <Tile className={styles.emptyState}>
          <EmptyDataIllustration />
          <p className={styles.emptyStateContent}>{t('noFormsToDisplay', 'There are no forms to display.')}</p>
        </Tile>
      </ResponsiveWrapper>
    );
  }

  return (
    <div className={styles.container}>
      {sections.length === 0 ? (
        <FormsList forms={forms} error={error} handleFormOpen={handleFormOpen} totalForms={totalForms} />
      ) : (
        sections.map((section) => {
          const sectionForms = section.availableForms ?? [];
          return (
            <FormsList
              key={`form-section-${section.name}`}
              sectionName={section.name}
              forms={sectionForms.length > 0 ? sectionForms : undefined}
              error={error}
              handleFormOpen={handleFormOpen}
              totalForms={totalForms}
            />
          );
        })
      )}
    </div>
  );
};

export default FormsDashboard;
