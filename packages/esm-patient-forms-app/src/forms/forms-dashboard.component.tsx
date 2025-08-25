import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DataTableSkeleton, InlineLoading, Tile } from '@carbon/react';
import { ResponsiveWrapper, useConfig, useConnectivity } from '@openmrs/esm-framework';
import { debounce } from 'lodash-es';
import {
  type DefaultPatientWorkspaceProps,
  EmptyDataIllustration,
  type Form,
  launchFormEntryOrHtmlForms,
  mapFormsToHtmlFormEntryForms,
  useVisitOrOfflineVisit,
} from '@openmrs/esm-patient-common-lib';
import type { ConfigObject } from '../config-schema';
import { useForms, useInfiniteForms } from '../hooks/use-forms';
import FormsList from './forms-list.component';
import styles from './forms-dashboard.scss';

interface FormsDashboardProps extends DefaultPatientWorkspaceProps {
  clinicalFormsWorkspaceName?: string;
  formEntryWorkspaceName?: string;
  htmlFormEntryWorkspaceName?: string;
  enableInfiniteScrolling?: boolean;
}

const FormsDashboard: React.FC<FormsDashboardProps> = ({
  patientUuid,
  clinicalFormsWorkspaceName,
  formEntryWorkspaceName,
  htmlFormEntryWorkspaceName,
  enableInfiniteScrolling,
}) => {
  const { t } = useTranslation();
  const config = useConfig<ConfigObject>();
  const isOnline = useConnectivity();
  const { currentVisit } = useVisitOrOfflineVisit(patientUuid);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);

  const useInfiniteScrolling = enableInfiniteScrolling ?? config.enableInfiniteScrolling;

  // Always use infinite forms for search to support server-side filtering
  const infiniteFormsResult = useInfiniteForms(
    patientUuid,
    currentVisit?.uuid,
    undefined,
    undefined,
    !isOnline,
    config.orderBy,
    searchQuery,
  );

  // Only use regular forms when not searching
  const regularFormsResult = useForms(patientUuid, currentVisit?.uuid, undefined, undefined, !isOnline, config.orderBy);

  // Use infinite forms result when searching or when infinite scrolling is enabled
  const {
    data: forms,
    allForms,
    error,
    mutateForms,
    isValidating,
    loadMore,
    hasMore,
    isLoading,
    totalLoaded,
  } = searchQuery || useInfiniteScrolling
    ? infiniteFormsResult
    : {
        ...regularFormsResult,
        loadMore: undefined,
        hasMore: false,
        isLoading: false,
        totalLoaded: regularFormsResult.allForms?.length || 0,
      };

  // Reset isSearching when data is fetched
  useEffect(() => {
    if (isSearching && !isValidating && !isLoading) {
      setIsSearching(false);
    }
  }, [isSearching, isValidating, isLoading]);

  const htmlFormEntryForms = useMemo(() => {
    return mapFormsToHtmlFormEntryForms(allForms, config.htmlFormEntryForms);
  }, [config.htmlFormEntryForms, allForms]);

  const handleFormOpen = useCallback(
    (form: Form, encounterUuid: string) => {
      launchFormEntryOrHtmlForms(
        htmlFormEntryForms,
        patientUuid,
        form,
        currentVisit?.uuid,
        encounterUuid,
        currentVisit?.visitType.uuid,
        currentVisit?.startDatetime,
        currentVisit?.stopDatetime,
        mutateForms,
        clinicalFormsWorkspaceName,
        formEntryWorkspaceName,
        htmlFormEntryWorkspaceName,
      );
    },
    [
      currentVisit,
      htmlFormEntryForms,
      mutateForms,
      patientUuid,
      clinicalFormsWorkspaceName,
      formEntryWorkspaceName,
      htmlFormEntryWorkspaceName,
    ],
  );

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
        <FormsList
          completedForms={forms}
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
      ) : (
        sections.map((section) => {
          return (
            <FormsList
              key={`form-section-${section.name}`}
              sectionName={section.name}
              completedForms={section.availableForms}
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
