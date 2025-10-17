import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Tile } from '@carbon/react';
import { ResponsiveWrapper, useConfig, useConnectivity } from '@openmrs/esm-framework';
import {
  type ClinicalFormsWorkspaceWindowProps,
  EmptyDataIllustration,
  type Form,
  type PatientWorkspace2DefinitionProps,
} from '@openmrs/esm-patient-common-lib';
import type { FormEntryConfigSchema } from '../config-schema';
import { useForms } from '../hooks/use-forms';
import FormsList from './forms-list.component';
import styles from './forms-dashboard.scss';

const FormsDashboard: React.FC<PatientWorkspace2DefinitionProps<{}, ClinicalFormsWorkspaceWindowProps>> = ({
  groupProps: { patientUuid, visitContext },
  launchChildWorkspace,
}) => {
  const { t } = useTranslation();
  const config = useConfig<FormEntryConfigSchema>();
  const isOnline = useConnectivity();
  const {
    data: forms,
    error,
    mutateForms,
  } = useForms(patientUuid, visitContext?.uuid, undefined, undefined, !isOnline, config.orderBy);

  const handleFormOpen = useCallback(
    (form: Form, encounterUuid: string) => {
      launchChildWorkspace('patient-form-entry-workspace', {
        form,
        encounterUuid,
      });
    },
    [launchChildWorkspace],
  );

  const sections = useMemo(() => {
    return config.formSections?.map((formSection) => ({
      ...formSection,
      availableForms: forms?.filter((formInfo) =>
        formSection.forms.some((formConfig) => formInfo.form.uuid === formConfig || formInfo.form.name === formConfig),
      ),
    }));
  }, [config.formSections, forms]);

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

  return (
    <div className={styles.container}>
      {sections.length === 0 ? (
        <FormsList forms={forms} error={error} handleFormOpen={handleFormOpen} />
      ) : (
        sections.map((section) => {
          return (
            <FormsList
              key={`form-section-${section.name}`}
              sectionName={section.name}
              forms={section.availableForms}
              error={error}
              handleFormOpen={handleFormOpen}
            />
          );
        })
      )}
    </div>
  );
};

export default FormsDashboard;
