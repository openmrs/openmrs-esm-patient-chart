<<<<<<< HEAD
import React, { useMemo } from 'react';
=======
import React, { useCallback, useMemo, useState } from 'react';
>>>>>>> 5ad15105 (O3-4746 Implementation of pagination in esm-patient-forms-app)
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
  const [pageSize, setPageSize] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const {
    data: forms,
    error,
    mutateForms,
    totalCount,
  } = useForms(
    patientUuid,
    visitContext?.uuid,
    undefined,
    undefined,
    !isOnline,
    config.orderBy,
    searchTerm,
    pageSize,
    currentPage,
  );

  const htmlFormEntryForms = useMemo(() => {
    return mapFormsToHtmlFormEntryForms(allForms, config.htmlFormEntryForms);
  }, [config.htmlFormEntryForms, allForms]);

  const handleFormOpen = useCallback(
    (form: Form, encounterUuid: string) => {
      launchFormEntryOrHtmlForms(
        htmlFormEntryForms,
        patientUuid,
        form,
        visitContext?.uuid,
        encounterUuid,
        visitContext?.visitType.uuid,
        visitContext?.startDatetime,
        visitContext?.stopDatetime,
        mutateForms,
        clinicalFormsWorkspaceName,
        formEntryWorkspaceName,
        htmlFormEntryWorkspaceName,
      );
    },
    [
      visitContext,
      htmlFormEntryForms,
      mutateForms,
      patientUuid,
      clinicalFormsWorkspaceName,
      formEntryWorkspaceName,
      htmlFormEntryWorkspaceName,
    ],
  );

  const sections = useMemo(() => {
    return config.formSections?.map((formSection) => ({
      ...formSection,
      availableForms: forms?.filter((formInfo) =>
        formSection.forms.some((formConfig) => formInfo.form.uuid === formConfig || formInfo.form.name === formConfig),
      ),
    }));
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
        <FormsList forms={forms} error={error} handleFormOpen={handleFormOpen} />
      ) : (
        sections.map((section) => {
          return (
            <FormsList
              key={`form-section-${section.name}`}
              sectionName={section.name}
              forms={section.availableForms}
              error={error}
              pageSize={pageSize}
              handleFormOpen={handleFormOpen}
              searchTerm={searchTerm}
              onPageChange={setCurrentPage}
              onPageSizeChange={setPageSize}
              onSearchTermChange={setSearchTerm}
            />
          );
        })
      )}
    </div>
  );
};

export default FormsDashboard;
