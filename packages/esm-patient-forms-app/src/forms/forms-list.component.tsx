import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { debounce } from 'lodash-es';
import fuzzy from 'fuzzy';
import { DataTableSkeleton } from '@carbon/react';
import { formatDatetime, useLayoutType, ResponsiveWrapper } from '@openmrs/esm-framework';
import type { CompletedFormInfo, Form } from '../types';
import { useFormsContext } from '../hooks/use-forms-context';
import FormsTable from './forms-table.component';
import styles from './forms-list.scss';

export type FormsListProps = {
  forms?: Array<CompletedFormInfo>;
  error?: any;
  sectionName?: string;
  handleFormOpen: (form: Form, encounterUuid: string) => void;
  totalForms?: number;
};

/*
 * For the benefit of our automated translations:
 * t('forms', 'Forms')
 */

const FormsList: React.FC<FormsListProps> = ({ forms, error, sectionName, handleFormOpen, totalForms }) => {
  const { t } = useTranslation();
  const { searchTerm, setSearchTerm } = useFormsContext();
  const isTablet = useLayoutType() === 'tablet';

  const handleSearch = useMemo(() => debounce((term) => setSearchTerm(term), 300), [setSearchTerm]);

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
        totalForms={totalForms}
      />
    </ResponsiveWrapper>
  );
};

export default FormsList;
