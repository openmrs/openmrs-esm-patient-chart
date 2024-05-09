import React, { useCallback, useMemo } from 'react';
import { Tile } from '@carbon/react';
import {
  useConfig,
  useConnectivity,
  usePatient,
  ResponsiveWrapper,
  useSession,
  userHasAccess,
} from '@openmrs/esm-framework';
import {
  type DefaultPatientWorkspaceProps,
  EmptyDataIllustration,
  launchFormEntryOrHtmlForms,
  useVisitOrOfflineVisit,
} from '@openmrs/esm-patient-common-lib';
import type { ConfigObject } from '../config-schema';
import FormsList from './forms-list.component';
import styles from './forms-dashboard.scss';
import { useForms } from '../hooks/use-forms';
import { useTranslation } from 'react-i18next';

const FormsDashboard: React.FC<DefaultPatientWorkspaceProps> = () => {
  const { t } = useTranslation();
  const config = useConfig<ConfigObject>();
  const isOnline = useConnectivity();
  const htmlFormEntryForms = config.htmlFormEntryForms;
  const { patient, patientUuid } = usePatient();
  const session = useSession();

  const { currentVisit } = useVisitOrOfflineVisit(patientUuid);

  const useFormFilters = () => {
    const { data: forms, error, mutateForms } = useForms(patientUuid, undefined, undefined, !isOnline, config.orderBy);

    const filteredForms = useMemo(() => {
      if (session && config.filterFormsByEditPrivilege) {
        return forms?.filter((formInfo) =>
          userHasAccess(formInfo?.form?.encounterType?.editPrivilege?.name, session?.user),
        );
      }
      return forms;
    }, [forms]);

    return { forms: filteredForms, error, mutateForms };
  };

  const { forms, error, mutateForms } = useFormFilters();

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
    [currentVisit, htmlFormEntryForms, mutateForms, patientUuid],
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
