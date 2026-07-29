import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Tile } from '@carbon/react';
import { ResponsiveWrapper, useConfig, useConnectivity, type Visit } from '@openmrs/esm-framework';
import { EmptyDataIllustration, type Form } from '@openmrs/esm-patient-common-lib';
import { debounce } from 'lodash-es';
import type { FormEntryConfigSchema } from '../config-schema';
import { useFormEvaluationContext } from '../hooks/use-form-evaluation-context';
import { useForms } from '../hooks/use-forms';
import { filterFormsByContext, partitionFormsByGroup } from './form-context-filter';
import FormFavoritesList from './form-favorites-list.component';
import FormsList from './forms-list.component';
import styles from './forms-dashboard.scss';

/*
 * For automated translations:
 * t('noFormsMatchContext', 'No forms match the current patient, visit, or location context.')
 */

interface FormsDashbaordProps {
  handleFormOpen: (form: Form, encounterUuid: string) => void;
  patient: fhir.Patient;
  visitContext?: Visit | null;
}

const FormsDashboard: React.FC<FormsDashbaordProps> = ({ handleFormOpen, patient, visitContext }) => {
  const { t } = useTranslation();
  const config = useConfig<FormEntryConfigSchema>();
  const isOnline = useConnectivity();
  const evaluationContext = useFormEvaluationContext(patient, visitContext);

  const [searchTerm, setSearchTerm] = useState('');
  const handleSearch = useMemo(() => debounce((value: string) => setSearchTerm(value), 300), []);

  const { data: forms, error } = useForms(
    patient.id,
    visitContext?.uuid,
    undefined,
    undefined,
    !isOnline,
    config.orderBy,
  );

  const visibleForms = useMemo(() => {
    if (!forms) {
      return undefined;
    }
    return filterFormsByContext(forms, evaluationContext, config);
  }, [forms, evaluationContext, config]);

  const structuredSections = useMemo(() => {
    return config.formSections?.map((formSection) => ({
      ...formSection,
      availableForms: visibleForms?.filter((formInfo) =>
        formSection.forms.some((formConfig) => formInfo.form.uuid === formConfig || formInfo.form.name === formConfig),
      ),
    }));
  }, [config.formSections, visibleForms]);

  const { recommended, general } = useMemo(() => {
    if (!visibleForms) {
      return { recommended: [], general: [] };
    }
    return partitionFormsByGroup(visibleForms, config);
  }, [visibleForms, config]);

  const showLegacySections = Boolean(config.formSections?.length);

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

  if (visibleForms?.length === 0 && forms && forms.length > 0) {
    return (
      <ResponsiveWrapper>
        <Tile className={styles.emptyState}>
          <EmptyDataIllustration />
          <p className={styles.emptyStateContent}>
            {t('noFormsMatchContext', 'No forms match the current patient, visit, or location context.')}
          </p>
        </Tile>
      </ResponsiveWrapper>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.searchBar}>
        <Search
          size="sm"
          labelText={t('searchForms', 'Search forms')}
          placeholder={t('searchThisList', 'Search this list')}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSearch(e.target.value)}
          onClear={() => setSearchTerm('')}
        />
      </div>
      <FormFavoritesList onFormSelect={handleFormOpen} isSearching={Boolean(searchTerm)} />
      {showLegacySections ? (
        structuredSections?.map((section) => (
          <FormsList
            key={`form-section-${section.name}`}
            sectionName={section.name}
            forms={section.availableForms}
            error={error}
            searchTerm={searchTerm}
            handleFormOpen={handleFormOpen}
          />
        ))
      ) : (
        <>
          {recommended.length > 0 && (
            <FormsList
              key="recommended-forms"
              sectionName="recommendedForLocation"
              forms={recommended}
              error={error}
              searchTerm={searchTerm}
              handleFormOpen={handleFormOpen}
            />
          )}
          {general.length > 0 && (
            <FormsList
              key="general-forms"
              sectionName="generalForms"
              forms={general}
              error={error}
              searchTerm={searchTerm}
              handleFormOpen={handleFormOpen}
            />
          )}
        </>
      )}
    </div>
  );
};

export default FormsDashboard;
