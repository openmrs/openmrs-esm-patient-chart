import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Tile } from '@carbon/react';
import { ResponsiveWrapper, useConfig, useConnectivity, type Visit } from '@openmrs/esm-framework';
import { EmptyDataIllustration, type Form } from '@openmrs/esm-patient-common-lib';
import type { FormEntryConfigSchema } from '../config-schema';
import { useForms, useInfiniteForms } from '../hooks/use-forms';
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
  const { enableInfiniteScrolling, formSections } = config;
  const [searchQuery, setSearchQuery] = useState<string>('');
  const {
    data: forms,
    error,
    isValidating,
    mutateForms,
  } = useForms(patient.id, visitContext?.uuid, undefined, undefined, !isOnline, config.orderBy);

  const infiniteFormsResult = useInfiniteForms(
    patient.id,
    visitContext?.uuid,
    undefined,
    undefined,
    !isOnline,
    config.orderBy,
    searchQuery,
  );

  const displayData = enableInfiniteScrolling
    ? {
        forms: infiniteFormsResult.data,
        error: infiniteFormsResult.isError,
        isValidating: infiniteFormsResult.isValidating,
        loadMore: infiniteFormsResult.loadMore,
        hasMore: infiniteFormsResult.hasMore,
        isLoading: infiniteFormsResult.isLoading,
        totalLoaded: infiniteFormsResult.totalLoaded,
      }
    : {
        forms: forms,
        error: error,
        isValidating: isValidating,
        loadMore: undefined,
        hasMore: false,
        isLoading: false,
        totalLoaded: forms?.length || 0,
      };

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const sections = useMemo(() => {
    return formSections?.map((formSection) => ({
      ...formSection,
      availableForms: displayData.forms?.filter((formInfo) =>
        formSection.forms.some((formConfig) => formInfo.form.uuid === formConfig || formInfo.form.name === formConfig),
      ),
    }));
  }, [formSections, displayData.forms]);

  if (displayData.forms?.length === 0 && !searchQuery) {
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
        <FormsList
          forms={displayData.forms}
          error={displayData.error}
          handleFormOpen={handleFormOpen}
          onSearch={handleSearch}
          isValidating={displayData.isValidating}
          loadMore={displayData.loadMore}
          hasMore={displayData.hasMore}
          isLoading={displayData.isLoading}
          totalLoaded={displayData.totalLoaded}
          enableInfiniteScrolling={enableInfiniteScrolling}
        />
      ) : (
        sections.map((section) => {
          const sectionForms = section.availableForms;
          const sectionHasMore =
            section.name === 'RFE Forms'
              ? sectionForms?.length < displayData.totalLoaded && displayData.hasMore
              : displayData.hasMore;

          return (
            <FormsList
              key={`form-section-${section.name}`}
              sectionName={section.name}
              forms={section.availableForms}
              error={displayData.error}
              handleFormOpen={handleFormOpen}
              onSearch={handleSearch}
              isValidating={displayData.isValidating}
              loadMore={displayData.loadMore}
              hasMore={sectionHasMore}
              isLoading={displayData.isLoading}
              totalLoaded={displayData.totalLoaded}
              enableInfiniteScrolling={enableInfiniteScrolling}
            />
          );
        })
      )}
    </div>
  );
};

export default FormsDashboard;
