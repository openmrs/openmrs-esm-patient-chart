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
      }, 1000),
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
    // If using infinite scrolling with server-side search, don't filter client-side
    if (enableInfiniteScrolling && onSearch) {
      return completedForms;
    }

    if (!searchTerm) {
      return completedForms;
    }

    return fuzzy
      .filter(searchTerm, completedForms, { extract: (formInfo) => formInfo.form.display ?? formInfo.form.name })
      .sort((r1, r2) => r1.score - r2.score)
      .map((result) => result.original);
  }, [completedForms, searchTerm, enableInfiniteScrolling, onSearch]);

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

  if (completedForms?.length === 0 && !isLoading) {
    return <></>;
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
      handleSearch={handleSearch}
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
