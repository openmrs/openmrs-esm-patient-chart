import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { debounce } from 'lodash-es';
import fuzzy from 'fuzzy';
import { DataTableSkeleton } from '@carbon/react';
import { formatDatetime, useLayoutType, ResponsiveWrapper } from '@openmrs/esm-framework';
import type { CompletedFormInfo, Form } from '../types';
import FormsTable from './forms-table.component';
import styles from './forms-list.scss';

export type FormsListProps = {
  forms?: Array<CompletedFormInfo>;
  error?: any;
  sectionName?: string;
  handleFormOpen: (form: Form, encounterUuid: string) => void;
  totalForms?: number;
  pageSize: number;
  searchTerm?: string;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  onSearchTermChange?: (searchTerm: string) => void;
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
  totalForms,
  pageSize,
  searchTerm = '',
  onPageChange,
  onPageSizeChange,
  onSearchTermChange,
}) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';

  const handleSearch = useMemo(() => debounce((term) => onSearchTermChange?.(term), 300), [onSearchTermChange]);

  const filteredForms = useMemo(() => {
    if (!searchTerm) {
      return forms;
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

  if (sectionName === 'forms') {
    return (
      <ResponsiveWrapper>
        <FormsTable
          tableHeaders={tableHeaders}
          tableRows={tableRows}
          isTablet={isTablet}
          handleSearch={handleSearch}
          handleFormOpen={handleFormOpen}
          totalItems={totalForms}
          pageSize={pageSize}
          completedForms={completedForms}
          currentPage={1}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
          searchTerm={searchTerm}
        />
      </ResponsiveWrapper>
    );
  } else {
    return (
      <ResponsiveWrapper>
        <div className={isTablet ? styles.tabletHeading : styles.desktopHeading}>
          <h4>{t(sectionName)}</h4>
        </div>
        <FormsTable
          tableHeaders={tableHeaders}
          tableRows={tableRows}
          isTablet={isTablet}
          handleSearch={handleSearch}
          handleFormOpen={handleFormOpen}
          pageSize={pageSize}
          totalItems={totalForms}
          completedForms={completedForms}
          currentPage={1}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
          searchTerm={searchTerm}
        />
      </ResponsiveWrapper>
    );
  }
};

export default FormsList;
