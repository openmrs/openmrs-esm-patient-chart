import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Tile } from '@carbon/react';
import { ResponsiveWrapper, useConfig, useConnectivity } from '@openmrs/esm-framework';
import {
  type DefaultPatientWorkspaceProps,
  EmptyDataIllustration,
  type Form,
  launchFormEntryOrHtmlForms,
  mapFormsToHtmlFormEntryForms,
  useVisitOrOfflineVisit,
} from '@openmrs/esm-patient-common-lib';
import type { ConfigObject } from '../config-schema';
import { useForms } from '../hooks/use-forms';
import FormsList from './forms-list.component';
import styles from './forms-dashboard.scss';

interface FormsDashboardProps extends DefaultPatientWorkspaceProps {
  clinicalFormsWorkspaceName?: string;
  formEntryWorkspaceName?: string;
  htmlFormEntryWorkspaceName?: string;
}

const FormsDashboard: React.FC<FormsDashboardProps> = ({
  patientUuid,
  clinicalFormsWorkspaceName,
  formEntryWorkspaceName,
  htmlFormEntryWorkspaceName,
}) => {
  const { t } = useTranslation();
  const config = useConfig<ConfigObject>();
  const isOnline = useConnectivity();
  const { currentVisit } = useVisitOrOfflineVisit(patientUuid);
  const {
    data: forms,
    allForms,
    error,
    mutateForms,
  } = useForms(patientUuid, currentVisit?.uuid, undefined, undefined, !isOnline, config.orderBy);

  const htmlFormEntryForms = useMemo(() => {
    return mapFormsToHtmlFormEntryForms(allForms, config.htmlFormEntryForms);
  }, [config.htmlFormEntryForms, allForms]);

  const handleFormOpen = useCallback(
    (form: Form, encounterUuid: string) => {
      launchFormEntryOrHtmlForms(
        htmlFormEntryForms,
        patientUuid,
        form,
        currentVisit?.uuid,
        encounterUuid,
        currentVisit?.visitType.uuid,
        currentVisit?.startDatetime,
        currentVisit?.stopDatetime,
        mutateForms,
        clinicalFormsWorkspaceName,
        formEntryWorkspaceName,
        htmlFormEntryWorkspaceName,
      );
    },
    [
      currentVisit,
      htmlFormEntryForms,
      mutateForms,
      patientUuid,
      clinicalFormsWorkspaceName,
      formEntryWorkspaceName,
      htmlFormEntryWorkspaceName,
    ],
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
        <FormsList completedForms={forms} error={error} handleFormOpen={handleFormOpen} />
      ) : (
        sections.map((section) => {
          return (
            <FormsList
              key={`form-section-${section.name}`}
              sectionName={section.name}
              completedForms={section.availableForms}
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
