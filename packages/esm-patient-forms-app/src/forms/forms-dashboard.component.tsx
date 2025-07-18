import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Tile } from '@carbon/react';
import { ResponsiveWrapper, useConfig, useConnectivity } from '@openmrs/esm-framework';
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

  const useInfiniteScrolling = enableInfiniteScrolling ?? config.enableInfiniteScrolling;
  const infiniteFormsResult = useInfiniteForms(
    patientUuid,
    currentVisit?.uuid,
    undefined,
    undefined,
    !isOnline,
    config.orderBy,
    searchQuery,
  );

  const regularFormsResult = useForms(patientUuid, currentVisit?.uuid, undefined, undefined, !isOnline, config.orderBy);

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
  } = useInfiniteScrolling
    ? infiniteFormsResult
    : {
        ...regularFormsResult,
        loadMore: undefined,
        hasMore: false,
        isLoading: false,
        totalLoaded: regularFormsResult.allForms?.length || 0,
      };

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

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

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
            />
          );
        })
      )}
    </div>
  );
};

export default FormsDashboard;
