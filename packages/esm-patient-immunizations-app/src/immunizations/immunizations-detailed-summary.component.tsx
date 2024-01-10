import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  DataTable,
  DataTableSkeleton,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  InlineLoading,
  TableExpandHeader,
  TableExpandRow,
  TableContainer,
  TableExpandedRow,
} from '@carbon/react';
import { Add } from '@carbon/react/icons';
import {
  CardHeader,
  EmptyState,
  ErrorState,
  launchPatientWorkspace,
  PatientChartPagination,
} from '@openmrs/esm-patient-common-lib';
import { useConfig, useLayoutType, usePagination, useVisit } from '@openmrs/esm-framework';
import styles from './immunizations-detailed-summary.scss';
import { immunizationFormSub, latestFirst, linkConfiguredSequences } from './utils';
import { orderBy, get, first, isEmpty } from 'lodash-es';
import { type ExistingDoses, type Sequence } from '../types';
import SequenceTable from './components/immunizations-sequence-table.component';
import { useImmunizations } from '../hooks/useImmunizations';

interface ImmunizationsDetailedSummaryProps {
  patientUuid: string;
  basePath: string;
  launchStartVisitPrompt: () => void;
}

const ImmunizationsDetailedSummary: React.FC<ImmunizationsDetailedSummaryProps> = ({
  patientUuid,
  launchStartVisitPrompt,
}) => {
  const { t, i18n } = useTranslation();
  const { immunizationsConfig } = useConfig();
  const displayText = t('immunizations', 'immunizations');
  const headerTitle = t('immunizations', 'Immunizations');
  const locale = i18n.language.replace('_', '-');
  const pageUrl = window.getOpenmrsSpaBase() + `patient/${patientUuid}/chart`;
  const urlLabel = t('goToSummary', 'Go to Summary');
  const { currentVisit } = useVisit(patientUuid);
  const isTablet = useLayoutType() === 'tablet';
  const sequenceDefinitions = immunizationsConfig?.sequenceDefinitions;

  const { data: existingImmunizations, isLoading, isError, isValidating } = useImmunizations(patientUuid);
  const consolidatedImmunizations = linkConfiguredSequences(existingImmunizations, sequenceDefinitions);

  const launchImmunizationsForm = React.useCallback(() => {
    if (!currentVisit) {
      launchStartVisitPrompt();
      return;
    }
    launchPatientWorkspace('immunization-form-workspace');
  }, [currentVisit]);

  const sortedImmunizations = orderBy(
    consolidatedImmunizations,
    [(immunization) => get(immunization, 'existingDoses.length', 0)],
    ['desc'],
  );

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
              renderIcon={(props) => <Add size={16} {...props} />}
              iconDescription="Add"
              onClick={() => {
                immunizationFormSub.next({
                  vaccineUuid: immunization.vaccineUuid,
                  immunizationId: null,
                  vaccinationDate: null,
                  doseNumber: 0,
                  expirationDate: null,
                  lotNumber: null,
                  manufacturer: null,
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
    return (
      <div className={styles.widgetCard}>
        <CardHeader title={headerTitle}>
          <span>{isValidating ? <InlineLoading /> : null}</span>
          <Button
            kind="ghost"
            renderIcon={(props) => <Add size={16} {...props} />}
            iconDescription="Add immunizations"
            onClick={launchImmunizationsForm}
          >
            {t('add', 'Add')}
          </Button>
        </CardHeader>

        <DataTable rows={paginatedImmunizations} headers={tableHeader} size={isTablet ? 'lg' : 'sm'} useZebraStyles>
          {({ rows, headers, getHeaderProps, getRowProps, getTableProps, getExpandHeaderProps }) => (
            <TableContainer>
              <Table {...getTableProps()}>
                <TableHead>
                  <TableRow>
                    <TableExpandHeader enableToggle {...getExpandHeaderProps()} />
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
                      {row.isExpanded ? (
                        <TableExpandedRow colSpan={headers.length + 2}>
                          <SequenceTable
                            immunizationsByVaccine={sortedImmunizations[index]}
                            launchPatientImmunizationForm={launchImmunizationsForm}
                          />
                        </TableExpandedRow>
                      ) : (
                        <TableExpandedRow className={styles.hiddenRow} colSpan={headers.length + 2} />
                      )}
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DataTable>

        <PatientChartPagination
          totalItems={tableRows?.length}
          pageSize={10}
          onPageNumberChange={({ page }) => goTo(page)}
          pageNumber={currentPage}
          currentItems={paginatedImmunizations?.length}
          dashboardLinkUrl={pageUrl}
          dashboardLinkLabel={urlLabel}
        />
      </div>
    );
  }
  return <EmptyState displayText={displayText} headerTitle={headerTitle} launchForm={launchImmunizationsForm} />;
};

export default ImmunizationsDetailedSummary;
