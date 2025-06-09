import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { debounce } from 'lodash-es';
import fuzzy from 'fuzzy';
import { DataTableSkeleton } from '@carbon/react';
import { formatDatetime, useLayoutType, ResponsiveWrapper } from '@openmrs/esm-framework';
import type { CompletedFormInfo, Form } from '../types';
import FormsTable from './forms-table.component';
import { useFormsContext } from '../hooks/use-forms-context';
import styles from './forms-list.scss';

export type FormsListProps = {
  completedForms?: Array<CompletedFormInfo>;
  error?: any;
  sectionName?: string;
  handleFormOpen: (form: Form, encounterUuid: string) => void;
  totalForms?: number;
};

const FormsList: React.FC<FormsListProps> = ({
  completedForms,
  error,
  sectionName = 'forms',
  handleFormOpen,
  totalForms,
}) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const { searchTerm, setSearchTerm } = useFormsContext();
  const [locale, setLocale] = useState(window.i18next.language ?? navigator.language);

  useEffect(() => {
    if (window.i18next?.on) {
      const languageChanged = (lng: string) => setLocale(lng);
      window.i18next.on('languageChanged', languageChanged);
      return () => window.i18next.off('languageChanged', languageChanged);
    }
  }, []);

  const handleSearch = useMemo(() => debounce(setSearchTerm, 300), [setSearchTerm]);

  const filteredForms = useMemo(() => {
    if (!searchTerm) {
      return completedForms;
    }

    return fuzzy
      .filter(searchTerm, completedForms, { extract: (formInfo) => formInfo.form.display ?? formInfo.form.name })
      .sort((r1, r2) => r1.score - r2.score)
      .map((result) => result.original);
  }, [completedForms, searchTerm]);

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

  if (!completedForms && !error) {
    return <DataTableSkeleton role="progressbar" />;
  }

  if (completedForms?.length === 0) {
    return <></>;
  }

  return (
    <ResponsiveWrapper>
      {sectionName !== 'forms' && (
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
        totalItems={totalForms}
      />
    </ResponsiveWrapper>
  );
};

export default FormsList;
