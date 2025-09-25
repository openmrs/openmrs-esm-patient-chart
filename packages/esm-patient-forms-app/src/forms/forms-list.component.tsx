import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { debounce } from 'lodash-es';
import fuzzy from 'fuzzy';
import { DataTableSkeleton, InlineLoading } from '@carbon/react';
import { formatDatetime, useLayoutType, ResponsiveWrapper } from '@openmrs/esm-framework';
import type { CompletedFormInfo, Form } from '../types';
import FormsTable from './forms-table.component';
import styles from './forms-list.scss';

export type FormsListProps = {
  completedForms?: Array<CompletedFormInfo>;
  error?: any;
  sectionName?: string;
  handleFormOpen: (form: Form, encounterUuid: string) => void;
  // Infinite scrolling props
  onSearch?: (searchTerm: string) => void;
  isValidating?: boolean;
  loadMore?: () => void;
  hasMore?: boolean;
  isLoading?: boolean;
  totalLoaded?: number;
  enableInfiniteScrolling?: boolean;
  isSearching?: boolean;
};

/*
 * For the benefit of our automated translations:
 * t('forms', 'Forms')
 */

const FormsList: React.FC<FormsListProps> = ({
  completedForms,
  error,
  sectionName = 'forms',
  handleFormOpen,
  onSearch,
  isValidating,
  loadMore,
  hasMore,
  isLoading,
  totalLoaded = 0,
  enableInfiniteScrolling = false,
  isSearching = false,
}) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const isTablet = useLayoutType() === 'tablet';
  const [locale, setLocale] = useState(window.i18next.language ?? navigator.language);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (window.i18next?.on) {
      const languageChanged = (lng: string) => setLocale(lng);
      window.i18next.on('languageChanged', languageChanged);
      return () => window.i18next.off('languageChanged', languageChanged);
    }
  }, []);

  // Handle search with debounce
  const handleSearch = useMemo(
    () =>
      debounce((searchTerm: string) => {
        setSearchTerm(searchTerm);
        onSearch?.(searchTerm);
      }, 500), // Match the debounce time with FormsDashboard
    [onSearch],
  );

  // Set up intersection observer for infinite scrolling
  useEffect(() => {
    if (!enableInfiniteScrolling || !loadMore || !hasMore) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];

        if (first.isIntersecting && !isValidating) {
          loadMore();
        }
      },
      { threshold: 0.1 },
    );

    observerRef.current = observer;

    // Observe the element if it's already available
    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [enableInfiniteScrolling, loadMore, hasMore, isValidating]);

  // Create a callback ref to observe the element when it becomes available
  const setLoadMoreRef = useCallback((node: HTMLDivElement | null) => {
    if (loadMoreRef.current) {
      // Clean up previous observation
      if (observerRef.current) {
        observerRef.current.unobserve(loadMoreRef.current);
      }
    }

    loadMoreRef.current = node;

    if (node && observerRef.current) {
      observerRef.current.observe(node);
    }
  }, []);

  const filteredForms = useMemo(() => {
    // If search is handled server-side through onSearch function, just use the results directly
    if (onSearch && searchTerm) {
      return completedForms;
    }

    if (!searchTerm) {
      return completedForms;
    }

    // Ensure we have forms to filter
    if (!completedForms || completedForms.length === 0) {
      return [];
    }

    return fuzzy
      .filter(searchTerm, completedForms, { extract: (formInfo) => formInfo.form.display ?? formInfo.form.name })
      .sort((r1, r2) => r2.score - r1.score) // Sort by best match first
      .map((result) => result.original);
  }, [completedForms, searchTerm, onSearch]);

  const tableHeaders = useMemo(() => {
    return [
      {
        header: t('formName', 'Form name (A-Z)'),
        key: 'formName',
      },
      {
        header: t('lastCompleted', 'Last completed'),
        key: 'lastCompleted',
      },
    ];
  }, [t]);

  const tableRows = useMemo(
    () =>
      filteredForms?.map((formData) => {
        return {
          id: formData.form.uuid,
          lastCompleted: formData.lastCompletedDate ? formatDatetime(formData.lastCompletedDate) : undefined,
          formName: formData.form.display ?? formData.form.name,
          formUuid: formData.form.uuid,
          encounterUuid: formData?.associatedEncounters[0]?.uuid,
          form: formData.form,
        };
      }) ?? [],
    [filteredForms],
  );

  if (!completedForms && !error && (isLoading || isValidating)) {
    return <DataTableSkeleton role="progressbar" />;
  }

  // Show loading state during searching regardless of infinite scrolling
  if (isSearching || (searchTerm && (isLoading || isValidating))) {
    return (
      <div>
        <div className={styles.searchingMessage}>
          <InlineLoading description={t('searchingForms', 'Searching forms...')} status="active" />
        </div>
        <DataTableSkeleton role="progressbar" />
      </div>
    );
  }

  // If there are no forms but we're not loading, just return empty fragment
  // Don't show empty state in FormsList - this is handled by FormsDashboard
  if ((!completedForms || completedForms.length === 0) && !isLoading && !isValidating) {
    return <></>;
  }

  // If we have search term but no filtered forms
  if (searchTerm && tableRows.length === 0 && !isLoading && !isValidating && !isSearching) {
    return (
      <ResponsiveWrapper>
        <div className={styles.noSearchResults}>
          {t('noSearchResults', 'No forms match your search "{{searchTerm}}".', { searchTerm })}
        </div>
      </ResponsiveWrapper>
    );
  }

  const tableComponent = enableInfiniteScrolling ? (
    <div className={styles.infiniteScrollContainer}>
      <FormsTable
        tableHeaders={tableHeaders}
        tableRows={tableRows}
        isTablet={isTablet}
        handleSearch={onSearch ? onSearch : handleSearch}
        handleFormOpen={handleFormOpen}
        totalLoaded={totalLoaded}
      />

      {/* Load more trigger */}
      {hasMore && (
        <div ref={setLoadMoreRef} className={styles.loadMoreTrigger}>
          {isValidating && <InlineLoading description={t('loadingMoreForms', 'Loading more forms...')} />}
          {!isValidating && (
            <div style={{ minHeight: '50px', padding: '20px', textAlign: 'center' }}>
              {t('scrollToLoadMore', 'Scroll to load more forms...')}
            </div>
          )}
        </div>
      )}

      {/* End of results indicator */}
      {!hasMore && completedForms && completedForms.length > 0 && (
        <div className={styles.endOfResults}>
          {t('allFormsLoaded', 'All forms loaded ({{count}} total)', { count: totalLoaded })}
        </div>
      )}
    </div>
  ) : (
    <FormsTable
      tableHeaders={tableHeaders}
      tableRows={tableRows}
      isTablet={isTablet}
      handleSearch={onSearch ? onSearch : handleSearch}
      handleFormOpen={handleFormOpen}
      totalLoaded={totalLoaded}
    />
  );

  if (sectionName === 'forms') {
    return <ResponsiveWrapper>{tableComponent}</ResponsiveWrapper>;
  } else {
    return (
      <ResponsiveWrapper>
        <div className={isTablet ? styles.tabletHeading : styles.desktopHeading}>
          <h4>{t(sectionName)}</h4>
        </div>
        {tableComponent}
      </ResponsiveWrapper>
    );
  }
};

export default FormsList;
