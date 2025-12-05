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
  forms?: Array<CompletedFormInfo>;
  error?: any;
  sectionName?: string;
  handleFormOpen: (form: Form, encounterUuid: string) => void;
  // Optional props to support infinite scrolling and parent controls
  onSearch?: (query: string) => void;
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
  forms,
  error,
  sectionName,
  handleFormOpen,
  onSearch,
  isValidating,
  loadMore,
  hasMore,
  isLoading,
  totalLoaded,
  enableInfiniteScrolling,
}) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const isTablet = useLayoutType() === 'tablet';
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Handle search with debounce
  const handleSearch = useMemo(
    () =>
      debounce((searchTerm: string) => {
        setSearchTerm(searchTerm);
        setIsSearching(true);

        // Give users time to finish typing before executing the search
        setTimeout(() => {
          onSearch?.(searchTerm);
          setIsSearching(false);
        }, 300);
      }, 800), // Reduced from 5000ms to 800ms for a more responsive feel
    [onSearch],
  );

  // Reset searching state when search term is empty
  useEffect(() => {
    if (searchTerm === '') {
      setIsSearching(false);
    }
  }, [searchTerm]);

  // Set up intersection observer for infinite scrolling
  useEffect(() => {
    // Exit early if infinite scrolling is not enabled or loadMore function is not provided
    if (!enableInfiniteScrolling || !loadMore) {
      return;
    }

    // Create a new IntersectionObserver instance
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        // Load more items when the element is intersecting (visible) and more items are available
        if (first.isIntersecting && hasMore && !isValidating) {
          loadMore();
        }
      },
      {
        // Even more aggressive settings to ensure it triggers reliably
        threshold: 0.01, // Trigger when even 1% of the element is visible
        rootMargin: '500px 0px', // Start loading 500px before the element comes into view
      },
    );

    observerRef.current = observer;

    // Observe the element if it's already available
    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    // Cleanup function
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [enableInfiniteScrolling, loadMore, hasMore, isValidating]);

  // Create a callback ref to observe the element when it becomes available
  const setLoadMoreRef = useCallback(
    (node: HTMLDivElement | null) => {
      // Clean up previous observation if needed
      if (loadMoreRef.current && observerRef.current) {
        observerRef.current.unobserve(loadMoreRef.current);
      }

      // Update the ref to point to the new node
      loadMoreRef.current = node;

      // Only observe if all conditions are met
      if (node && observerRef.current && hasMore && enableInfiniteScrolling) {
        observerRef.current.observe(node);

        // Force re-check intersection on new element (helps with cases where the element is already in view)
        setTimeout(() => {
          if (node.getBoundingClientRect().top < window.innerHeight && hasMore && !isValidating) {
            loadMore?.();
          }
        }, 100);
      }
    },
    [hasMore, enableInfiniteScrolling, loadMore, isValidating],
  ); // Force a re-check on visibility after component mount and when form data changes
  useEffect(() => {
    if (enableInfiniteScrolling && hasMore && !isValidating && loadMore) {
      // Give time for the component to render
      const timeoutId = setTimeout(() => {
        // Check if we have fewer items than would fill the screen
        const container = document.querySelector(`.${styles.infiniteScrollContainer}`);
        const viewportHeight = window.innerHeight;

        if (container) {
          const containerRect = container.getBoundingClientRect();
          // Special handling for RFE forms - if section name is RFE Forms, be more aggressive about loading
          const isRFESection = sectionName?.toLowerCase().includes('rfe');
          const shouldLoadMore =
            // Standard conditions for loading more
            containerRect.height < viewportHeight * 0.8 ||
            (loadMoreRef.current && loadMoreRef.current.getBoundingClientRect().top < viewportHeight) ||
            // Special condition for RFE forms - load more aggressively
            (isRFESection && forms && forms.length < 20 && totalLoaded > forms.length);

          if (shouldLoadMore) {
            loadMore();
          }
        }
      }, 300);

      return () => clearTimeout(timeoutId);
    }
  }, [forms, enableInfiniteScrolling, hasMore, isValidating, loadMore, sectionName, totalLoaded]);

  const filteredForms = useMemo(() => {
    // If using infinite scrolling with server-side search, don't filter client-side
    if (enableInfiniteScrolling && onSearch) {
      return forms;
    }

    if (!searchTerm) {
      return forms;
    }

    return fuzzy
      .filter(searchTerm, forms, { extract: (formInfo) => formInfo.form.display ?? formInfo.form.name })
      .sort((r1, r2) => r1.score - r2.score)
      .map((result) => result.original);
  }, [forms, searchTerm, enableInfiniteScrolling, onSearch]);

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

  if (!forms && !error && (isLoading || isValidating)) {
    return <DataTableSkeleton role="progressbar" />;
  }

  return (
    <ResponsiveWrapper>
      {sectionName && (
        <div className={isTablet ? styles.tabletHeading : styles.desktopHeading}>
          <h4>{t(sectionName)}</h4>
        </div>
      )}
      {enableInfiniteScrolling ? (
        <div className={styles.infiniteScrollContainer}>
          <FormsTable
            tableHeaders={tableHeaders}
            tableRows={tableRows}
            isTablet={isTablet}
            handleSearch={onSearch ? onSearch : handleSearch}
            handleFormOpen={handleFormOpen}
            isSearching={isSearching}
          />

          {/* Load more trigger */}
          {hasMore && (
            <div
              ref={setLoadMoreRef}
              className={styles.loadMoreTrigger}
              data-testid="load-more-trigger"
              style={{
                minHeight: '200px',
                padding: '20px',
                visibility: 'visible',
                margin: '20px 0',
                border: '1px dashed #e0e0e0',
                borderRadius: '4px',
              }}
            >
              {isValidating ? (
                <InlineLoading description={t('loadingMoreForms', 'Loading more forms...')} />
              ) : (
                <div style={{ minHeight: '50px', padding: '20px', textAlign: 'center' }}>
                  {t('scrollToLoadMore', 'Scroll to load more forms...')}
                </div>
              )}
            </div>
          )}

          {!hasMore && forms && forms.length > 0 && (
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
          isSearching={isSearching}
        />
      )}
    </ResponsiveWrapper>
  );
};

export default FormsList;
