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

const FormsList: React.FC<FormsListProps> = ({ forms, error, sectionName, handleFormOpen }) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const isTablet = useLayoutType() === 'tablet';

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
      return forms;
    }

    // Ensure we have forms to filter
    if (!completedForms || completedForms.length === 0) {
      return [];
    }

    return fuzzy
      .filter(searchTerm, forms, { extract: (formInfo) => formInfo.form.display ?? formInfo.form.name })
      .sort((r1, r2) => r1.score - r2.score)
      .map((result) => result.original);
  }, [forms, searchTerm]);

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

  if (!forms && !error) {
    return <DataTableSkeleton role="progressbar" />;
  }

  if (forms?.length === 0) {
    return <></>;
  }

  return (
    <ResponsiveWrapper>
      {sectionName && (
        <div className={isTablet ? styles.tabletHeading : styles.desktopHeading}>
          <h4>{t(sectionName)}</h4>
        </div>
      )}
      <FormsTable
        tableHeaders={tableHeaders}
        tableRows={tableRows}
        isTablet={isTablet}
        handleSearch={handleSearch}
        handleFormOpen={handleFormOpen}
      />
    </ResponsiveWrapper>
  );
};

export default FormsList;
