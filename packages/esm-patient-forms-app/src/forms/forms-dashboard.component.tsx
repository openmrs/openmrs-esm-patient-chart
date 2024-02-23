import React, { useCallback, useMemo } from 'react';
import { Layer, Tile } from '@carbon/react';
import { useConfig, useConnectivity, usePatient } from '@openmrs/esm-framework';
import {
  type DefaultWorkspaceProps,
  EmptyDataIllustration,
  launchFormEntryOrHtmlForms,
  useVisitOrOfflineVisit,
} from '@openmrs/esm-patient-common-lib';
import type { ConfigObject } from '../config-schema';
import FormsList from './forms-list.component';
import styles from './forms-dashboard.scss';
import { useForms } from '../hooks/use-forms';
import { useTranslation } from 'react-i18next';

const FormsDashboard: React.FC<DefaultWorkspaceProps> = () => {
  const { t } = useTranslation();
  const config = useConfig<ConfigObject>();
  const isOnline = useConnectivity();
  const htmlFormEntryForms = config.htmlFormEntryForms;
  const { patient, patientUuid } = usePatient();
  const { data: forms, error, mutateForms } = useForms(patientUuid, undefined, undefined, !isOnline, config.orderBy);
  const { currentVisit } = useVisitOrOfflineVisit(patientUuid);

  function ResponsiveWrapper({ children, isTablet }: { children: React.ReactNode; isTablet: boolean }) {
    return isTablet ? <Layer>{children} </Layer> : <>{children}</>;
  }

  const handleFormOpen = useCallback(
    (formUuid: string, encounterUuid: string, formName: string) => {
      launchFormEntryOrHtmlForms(
        htmlFormEntryForms,
        patientUuid,
        formUuid,
        currentVisit.uuid,
        encounterUuid,
        formName,
        currentVisit.visitType.uuid,
        currentVisit.startDatetime,
        currentVisit.stopDatetime,
        mutateForms,
      );
    },
    [currentVisit, htmlFormEntryForms, patient, mutateForms],
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
      <ResponsiveWrapper isTablet>
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
