import React, { useCallback, useMemo } from 'react';
import { Tile } from '@carbon/react';
import { useConfig, useConnectivity, usePatient, ResponsiveWrapper, useSession } from '@openmrs/esm-framework';
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
  const { data: forms, error, mutateForms } = useForms(patientUuid, undefined, undefined, !isOnline, config.orderBy);
  const { currentVisit } = useVisitOrOfflineVisit(patientUuid);
  const sessionUser = useSession();
  const sessionPrivileges = sessionUser?.user?.privileges;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  let editableForms = [];

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

  if (Array.isArray(forms)) {
    forms.forEach((item) => {
      const editPrivilege = item.form.encounterType?.editPrivilege?.name;
      sessionPrivileges.forEach((item) => {
        if (item?.display === editPrivilege) {
          editableForms.push(item);
        }
      });
    });
  }

  const sections = useMemo(() => {
    return config.formSections?.map((formSection) => ({
      ...formSection,
      availableForms: editableForms?.filter((formInfo) =>
        formSection.forms.some((formConfig) => formInfo.form.uuid === formConfig || formInfo.form.name === formConfig),
      ),
    }));
  }, [config.formSections, editableForms]);

  if (editableForms?.length === 0) {
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
        <FormsList completedForms={editableForms} error={error} handleFormOpen={handleFormOpen} />
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
