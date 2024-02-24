import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import debounce from 'lodash-es/debounce';
import fuzzy from 'fuzzy';
import { DataTableSkeleton } from '@carbon/react';
import { formatDatetime, useLayoutType, ResponsiveWrapper } from '@openmrs/esm-framework';
import type { CompletedFormInfo } from '../types';
import FormsTable from './forms-table.component';
import styles from './forms-list.scss';

export type FormsListProps = {
  completedForms?: Array<CompletedFormInfo>;
  error?: any;
  sectionName?: string;
  handleFormOpen: (formUuid: string, encounterUuid: string, formName: string) => void;
};

/*
 * For the benefit of our automated translations:
 * t('forms', 'Forms')
 */

const FormsList: React.FC<FormsListProps> = ({ completedForms, error, sectionName = 'forms', handleFormOpen }) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const isTablet = useLayoutType() === 'tablet';
  const [locale, setLocale] = useState(window.i18next.language ?? navigator.language);

  useEffect(() => {
    if (window.i18next?.on) {
      const languageChanged = (lng: string) => setLocale(lng);
      window.i18next.on('languageChanged', languageChanged);
      return () => window.i18next.off('languageChanged', languageChanged);
    }
  }, []);

  const handleSearch = useMemo(() => debounce((searchTerm) => setSearchTerm(searchTerm), 300), []);

  const filteredForms = useMemo(() => {
    if (!searchTerm) {
      return completedForms;
    }

    return fuzzy
      .filter(searchTerm, completedForms, { extract: (formInfo) => formInfo.form.display ?? formInfo.form.name })
      .sort((r1, r2) => r1.score - r2.score)
      .map((result) => result.original);
  }, [completedForms, searchTerm, locale]);

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
          lastCompleted: formData.lastCompleted ? formatDatetime(formData.lastCompleted) : undefined,
          formName: formData.form.display ?? formData.form.name,
          formUuid: formData.form.uuid,
          encounterUuid: formData?.associatedEncounters[0]?.uuid,
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

  if (sectionName === 'forms') {
    return (
      <ResponsiveWrapper>
        <FormsTable
          tableHeaders={tableHeaders}
          tableRows={tableRows}
          isTablet={isTablet}
          handleSearch={handleSearch}
          handleFormOpen={handleFormOpen}
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
        />
      </ResponsiveWrapper>
    );
  }
};

export default FormsList;
