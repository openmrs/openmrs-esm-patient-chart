import React, { useMemo } from 'react';
import Add16 from '@carbon/icons-react/es/add/16';
import SequenceTable from './immunizations-sequence-table';
import get from 'lodash-es/get';
import first from 'lodash-es/first';
import isEmpty from 'lodash-es/isEmpty';
import orderBy from 'lodash-es/orderBy';
import styles from './immunizations-detailed-summary.scss';
import {
  EmptyState,
  ErrorState,
  launchPatientWorkspace,
  PatientChartPagination,
} from '@openmrs/esm-patient-common-lib';
import { useConfig, usePagination } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import { useImmunizations, useImmunizationsConceptSet } from './immunizations.resource';
import {
  Button,
  DataTable,
  DataTableSkeleton,
  Table,
  TableHead,
  TableRow,
  TableExpandHeader,
  TableHeader,
  TableBody,
  TableExpandRow,
  TableCell,
  TableExpandedRow,
  InlineLoading,
} from 'carbon-components-react';
import { ExistingDoses, Sequence } from '../types';
import { findConfiguredSequences, findExistingDoses, latestFirst } from './utils';
import { immunizationFormSub } from './immunization-utils';

interface ImmunizationsDetailedSummaryProps {
  patientUuid: string;
  basePath: string;
}

const ImmunizationsDetailedSummary: React.FC<ImmunizationsDetailedSummaryProps> = ({ patientUuid, basePath }) => {
  const { t, i18n } = useTranslation();
  const { immunizationsConfig } = useConfig();
  const sequenceDefinitions = immunizationsConfig?.sequenceDefinitions;
  const displayText = t('immunizations', 'immunizations');
  const headerTitle = t('immunizations', 'Immunizations');
  const locale = i18n.language.replace('_', '-');
  const pageUrl = window.spaBase + basePath + '/summary';
  const urlLabel = t('goToSummary', 'Go to Summary');

  const { data: immunizationsConceptSetData } = useImmunizationsConceptSet();
  const { data: existingImmunizations, isError, isLoading, isValidating } = useImmunizations(patientUuid);

  const configuredImmunizations = findConfiguredSequences(sequenceDefinitions, immunizationsConceptSetData);
  const consolidatedImmunizations = findExistingDoses(configuredImmunizations, existingImmunizations || []);
  const sortedImmunizations = orderBy(
    consolidatedImmunizations,
    [(immunization) => get(immunization, 'existingDoses.length', 0)],
    ['desc'],
  );

  const launchImmunizationsForm = React.useCallback(() => launchPatientWorkspace('immunization-form-workspace'), []);

  const tableHeader = useMemo(
    () => [
      { key: 'vaccine', header: t('vaccine', 'Vaccine') },
      { key: 'recentVaccination', header: t('recentVaccination', 'Recent Vaccination') },
      { key: 'add', header: '' },
    ],
    [t],
  );

  const tableRows = useMemo(
    () =>
      sortedImmunizations?.map((immunization) => {
        const occurrenceDate =
          isEmpty(immunization.sequences) && !isEmpty(immunization.existingDoses)
            ? `${t('singleDoseOn', 'Single Dose on')} ${new Date(
                first<ExistingDoses>(immunization.existingDoses.sort(latestFirst))?.occurrenceDateTime,
              ).toLocaleDateString(locale, { dateStyle: 'medium' })}`
            : !isEmpty(immunization.existingDoses)
            ? `${first<Sequence>(immunization?.sequences)?.sequenceLabel} on ${new Date(
                first<ExistingDoses>(immunization.existingDoses.sort(latestFirst))?.occurrenceDateTime,
              ).toLocaleDateString(locale, { dateStyle: 'medium' })} `
            : '';
        return {
          id: immunization.vaccineUuid,
          vaccine: immunization.vaccineName,
          recentVaccination: occurrenceDate,
          add: (
            <Button
              kind="ghost"
              renderIcon={Add16}
              iconDescription="Add"
              onClick={() => {
                immunizationFormSub.next({
                  vaccineName: immunization.vaccineName,
                  vaccineUuid: immunization.vaccineUuid,
                  sequences: immunization?.sequences,
                  existingDoses: immunization?.existingDoses,
                  immunizationObsUuid: immunization?.immunizationObsUuid,
                  manufacturer: immunization.manufacturer,
                  lotNumber: immunization.lotNumber,
                  expirationDate: immunization.expirationDate,
                  currentDose: {
                    sequenceLabel: immunization.sequenceLabel,
                    sequenceNumber: immunization.sequenceNumber,
                  },
                  vaccinationDate: immunization.occurrenceDateTime,
                  formChanged: immunization.formChanged,
                });
                launchImmunizationsForm();
              }}
            ></Button>
          ),
        };
      }),
    [sortedImmunizations, t, locale, launchImmunizationsForm],
  );

  const { results: paginatedImmunizations, currentPage, goTo } = usePagination(tableRows, 10);

  if (isLoading || !sortedImmunizations) return <DataTableSkeleton role="progressbar" />;
  if (isError) return <ErrorState error={isError} headerTitle={headerTitle} />;
  if (sortedImmunizations?.length) {
    <div className={styles.widgetCard}>
      <div className={styles.immunizationsHeader}>
        <h4 className={`${styles.productiveHeading03} ${styles.text02}`}>{t('immunizations', 'Immunizations')}</h4>
        <span>{isValidating ? <InlineLoading /> : null}</span>
        <Button kind="ghost" renderIcon={Add16} iconDescription="Add immunizations" onClick={launchImmunizationsForm}>
          {t('add', 'Add')}
        </Button>
      </div>
      <DataTable rows={paginatedImmunizations} headers={tableHeader}>
        {({ rows, headers, getHeaderProps, getRowProps, getTableProps }) => (
          <Table {...getTableProps()} useZebraStyles>
            <TableHead>
              <TableRow>
                <TableExpandHeader />
                {headers.map((header) => (
                  <TableHeader {...getHeaderProps({ header })}>{header.header}</TableHeader>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row, index) => (
                <React.Fragment key={row.id}>
                  <TableExpandRow {...getRowProps({ row })}>
                    {row.cells.map((cell) => (
                      <TableCell key={cell.id}>{cell.value}</TableCell>
                    ))}
                  </TableExpandRow>
                  {row.isExpanded && (
                    <TableExpandedRow colSpan={headers.length + 1}>
                      {<SequenceTable immunizations={sortedImmunizations[index]} patientUuid={patientUuid} />}
                    </TableExpandedRow>
                  )}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        )}
      </DataTable>
      <PatientChartPagination
        totalItems={tableRows?.length}
        pageSize={10}
        onPageNumberChange={({ page }) => goTo(page)}
        pageNumber={currentPage}
        pageUrl={pageUrl}
        currentItems={paginatedImmunizations?.length}
        urlLabel={urlLabel}
      />
    </div>;
  }
  return <EmptyState displayText={displayText} headerTitle={headerTitle} launchForm={launchImmunizationsForm} />;
};

export default ImmunizationsDetailedSummary;
