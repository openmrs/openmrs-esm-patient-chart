import React, { useCallback, useMemo } from 'react';
import { useConfig, usePatient } from '@openmrs/esm-framework';
import { closeWorkspace, useVisitOrOfflineVisit } from '@openmrs/esm-patient-common-lib';
import type { ConfigObject } from '../config-schema';
import FormsList from './forms-list.component';
import styles from './forms-dashboard.scss';
import { launchFormEntryOrHtmlForms } from '../form-entry-interop';
import { useForms } from '../hooks/use-forms';

const FormsDashboard = () => {
  const config = useConfig<ConfigObject>();
  const htmlFormEntryForms = config.htmlFormEntryForms;
  const { patient, patientUuid } = usePatient();
  const { data: forms, error, mutateForms } = useForms(patientUuid, undefined, undefined, undefined, config.orderBy);
  const { currentVisit } = useVisitOrOfflineVisit(patientUuid);

  const handleFormOpen = useCallback(
    (formUuid: string, encounterUuid: string, formName: string) => {
      closeWorkspace('clinical-forms-workspace', true);
      launchFormEntryOrHtmlForms(
        currentVisit,
        formUuid,
        patient,
        htmlFormEntryForms,
        encounterUuid,
        formName,
        mutateForms,
      );
    },
    [currentVisit, htmlFormEntryForms, patient, mutateForms],
  );

  const sections = useMemo(() => {
    return config.formSections?.map((formSection) => ({
      ...formSection,
      availableForms: forms?.filter((formInfo) =>
        formSection.forms.some((formConfig) => formInfo.form.uuid === formConfig || formInfo.form.name === formConfig),
      ),
    }));
  }, [config.formSections, forms]);

  return (
    <div className={styles.container}>
      {sections.length === 0 ? (
        <FormsList completedForms={forms} error={error} handleFormOpen={handleFormOpen} />
      ) : (
        sections.map((section) => {
          return (
            <FormsList
              key={`form-section-${section.name}`}
              sectionName={section.name}
              completedForms={section.availableForms}
              error={error}
              handleFormOpen={handleFormOpen}
            />
          );
        })
      )}
    </div>
  );
};

export default FormsDashboard;
