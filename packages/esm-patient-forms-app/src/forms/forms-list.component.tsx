import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import fuzzy from 'fuzzy';
import { DataTableSkeleton } from '@carbon/react';
import { formatDatetime, useConfig, useLayoutType, ResponsiveWrapper } from '@openmrs/esm-framework';
import type { FormEntryConfigSchema } from '../config-schema';
import type { CompletedFormInfo, Form } from '../types';
import { getDisplayTagsForForm } from './form-context-filter';
import FormsTable from './forms-table.component';
import styles from './forms-list.scss';

export type FormsListProps = {
  forms?: Array<CompletedFormInfo>;
  error?: any;
  sectionName?: string;
  searchTerm?: string;
  handleFormOpen: (form: Form, encounterUuid: string) => void;
};

/*
 * For the benefit of our automated translations:
 * t('forms', 'Forms')
 * t('recommendedForLocation', 'Recommended for this location')
 * t('generalForms', 'General forms')
 */

const FormsList: React.FC<FormsListProps> = ({ forms, error, sectionName, searchTerm = '', handleFormOpen }) => {
  const { t } = useTranslation();
  const config = useConfig<FormEntryConfigSchema>();
  const isTablet = useLayoutType() === 'tablet';

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
          contextTags: getDisplayTagsForForm(formData.form, config),
        };
      }) ?? [],
    [filteredForms, config],
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
          <h4>
            {sectionName === 'recommendedForLocation'
              ? t('recommendedForLocation', 'Recommended for this location')
              : sectionName === 'generalForms'
                ? t('generalForms', 'General forms')
                : t(sectionName)}
          </h4>
        </div>
      )}
      <FormsTable
        tableHeaders={tableHeaders}
        tableRows={tableRows}
        isTablet={isTablet}
        handleFormOpen={handleFormOpen}
      />
    </ResponsiveWrapper>
  );
};

export default FormsList;
