import React, { useState } from 'react';
import { DataTableSkeleton, Layer, Search, Tile } from '@carbon/react';
import { useConfig, useLayoutType, usePatient } from '@openmrs/esm-framework';
import { EmptyDataIllustration, useVisitOrOfflineVisit } from '@openmrs/esm-patient-common-lib';
import type { HtmlFormEntryForm } from '../config-schema';
import FormsList from './form-list/forms-list.component';
import styles from './forms-workspace.scss';
import { useTranslation } from 'react-i18next';
import { useForms } from '../hooks/use-form-workspace';

const FormsWorkspace = () => {
  const config = useConfig();
  const { t } = useTranslation();
  const { patient, patientUuid } = usePatient();
  const { isValidating, data, error } = useForms(patientUuid);
  const htmlFormEntryForms: Array<HtmlFormEntryForm> = config.htmlFormEntryForms;
  const { currentVisit } = useVisitOrOfflineVisit(patientUuid);
  const isTablet = useLayoutType() === 'tablet';
  const [searchTerm, setSearchTerm] = useState('');

  if (data) {
    return (
      <div className={styles.container}>
        <Search
          id="formSearch"
          size={isTablet ? 'lg' : 'sm'}
          placeholder={t('searchForAForm', 'Search for a form')}
          onChange={(event) => setSearchTerm(event.target.value)}
        />
        {data
          ?.filter((s) => {
            return s.completedFromsInfo?.length > 0;
          })
          .map((formsSection, i) => {
            let pageSize = undefined;
            return (
              <FormsList
                {...{
                  patientUuid,
                  patient,
                  visit: currentVisit,
                  formsSection,
                  searchTerm,
                  pageSize,
                  htmlFormEntryForms,
                }}
                key={i}
              />
            );
          })}
      </div>
    );
  }

  if (isValidating) {
    return <DataTableSkeleton role="progressbar" />;
  }

  return (
    <Layer>
      <Tile className={styles.emptyState}>
        <div className={isTablet ? styles.tabletHeading : styles.desktopHeading}>
          <h4>{t('forms', 'Forms')}</h4>
        </div>
        <EmptyDataIllustration />
        <p className={styles.emptyStateContent}>{t('noFormsToDisplay', 'There are no forms to display.')}</p>
      </Tile>
    </Layer>
  );
};
export default FormsWorkspace;
