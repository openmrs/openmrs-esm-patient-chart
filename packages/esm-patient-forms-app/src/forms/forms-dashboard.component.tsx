import React, { useMemo } from 'react';
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
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);

  const useInfiniteScrolling = enableInfiniteScrolling ?? config.enableInfiniteScrolling;

  // Always use infinite forms for search to support server-side filtering
  const infiniteFormsResult = useInfiniteForms(
    patientUuid,
    visitContext?.uuid,
    undefined,
    undefined,
    !isOnline,
    config.orderBy,
    searchQuery,
  );

  // Only use regular forms when not searching
  const regularFormsResult = useForms(patientUuid, visitContext?.uuid, undefined, undefined, !isOnline, config.orderBy);

  // Use infinite forms result when searching or when infinite scrolling is enabled
  const {
    data: forms,
    error,
    mutateForms,
  } = useForms(patient.id, visitContext?.uuid, undefined, undefined, !isOnline, config.orderBy);

  // Use a memoized debounced search function
  const handleSearch = useMemo(() => {
    return debounce((query: string) => {
      setIsSearching(true);
      setSearchQuery(query);
    }, 500);
  }, []); // Empty dependencies since setIsSearching and setSearchQuery are stable

  const sections = useMemo(() => {
    return config.formSections?.map((formSection) => ({
      ...formSection,
      availableForms: forms?.filter((formInfo) =>
        formSection.forms.some((formConfig) => formInfo.form.uuid === formConfig || formInfo.form.name === formConfig),
      ),
    }));
  }, [config.formSections, forms]);

  // Show loading state when searching
  if (isSearching) {
    return (
      <ResponsiveWrapper>
        <div className={styles.searchingContainer}>
          <div className={styles.searchingMessage}>
            <InlineLoading description={t('searchingForms', 'Searching forms...')} status="active" />
          </div>
          <DataTableSkeleton role="progressbar" />
        </div>
      </ResponsiveWrapper>
    );
  }

  // Don't show empty state during search or initial loading
  if (forms?.length === 0 && !isSearching && !isLoading && !isValidating) {
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
              handleFormOpen={handleFormOpen}
              onSearch={handleSearch}
              isValidating={isValidating}
              loadMore={loadMore}
              hasMore={hasMore}
              isLoading={isLoading}
              totalLoaded={totalLoaded}
              enableInfiniteScrolling={useInfiniteScrolling}
              isSearching={isSearching}
            />
          );
        })
      )}
    </div>
  );
};

export default FormsDashboard;
