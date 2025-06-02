import React, { type ComponentProps, useMemo } from 'react';
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
import { orderBy, get, first } from 'lodash-es';
import {
  AddIcon,
  formatDate,
  parseDate,
  useConfig,
  useLayoutType,
  usePagination,
  useVisit,
  launchWorkspace,
} from '@openmrs/esm-framework';
import { CardHeader, EmptyState, ErrorState, PatientChartPagination } from '@openmrs/esm-patient-common-lib';
import { immunizationFormSub, latestFirst, linkConfiguredSequences } from './utils';
import { type ExistingDoses, type Sequence } from '../types';
import { useImmunizations } from '../hooks/useImmunizations';
import SequenceTable from './components/immunizations-sequence-table.component';
import styles from './immunizations-detailed-summary.scss';

interface ImmunizationsDetailedSummaryProps {
  patientUuid: string;
  basePath: string;
  launchStartVisitPrompt: () => void;
}

const ImmunizationsDetailedSummary: React.FC<ImmunizationsDetailedSummaryProps> = ({
  patientUuid,
  launchStartVisitPrompt,
}) => {
  const { t } = useTranslation();
  const { immunizationsConfig } = useConfig();
  const displayText = t('immunizations__lower', 'immunizations');
  const headerTitle = t('immunizations', 'Immunizations');
  const pageUrl = window.getOpenmrsSpaBase() + `patient/${patientUuid}/chart`;
  const urlLabel = t('goToSummary', 'Go to Summary');
  const { currentVisit } = useVisit(patientUuid);
  const isTablet = useLayoutType() === 'tablet';
  const sequenceDefinitions = immunizationsConfig?.sequenceDefinitions;

  const { data: existingImmunizations, isLoading, error, isValidating } = useImmunizations(patientUuid);
  const consolidatedImmunizations = linkConfiguredSequences(existingImmunizations, sequenceDefinitions);

  const launchImmunizationsForm = React.useCallback(() => {
    if (!currentVisit) {
      launchStartVisitPrompt();
      return;
    }
    launchWorkspace('immunization-form-workspace');
  }, [currentVisit, launchStartVisitPrompt]);

  const sortedImmunizations = orderBy(
    consolidatedImmunizations,
    [(immunization) => get(immunization, 'existingDoses.length', 0)],
    ['desc'],
  );

  const tableHeader = useMemo(
    () => [
      { key: 'vaccine', header: t('vaccine', 'Vaccine') },
      { key: 'recentVaccination', header: t('recentVaccination', 'Recent vaccination') },
      { key: 'add', header: '' },
    ],
    [t],
  );

  const tableRows = useMemo(
    () =>
      sortedImmunizations?.map((immunization) => {
        const occurrenceDate =
          !immunization.sequences?.length && immunization.existingDoses?.length
            ? `${t('singleDoseOn', 'Single Dose on')} ${formatDate(
                parseDate(first<ExistingDoses>(immunization.existingDoses.sort(latestFirst))?.occurrenceDateTime),
                { time: false, noToday: true },
              )}`
            : immunization.existingDoses?.length
              ? `${first<Sequence>(immunization?.sequences)?.sequenceLabel} on ${formatDate(
                  parseDate(first<ExistingDoses>(immunization.existingDoses.sort(latestFirst))?.occurrenceDateTime),
                  { time: false, noToday: true },
                )} `
              : '';

        return {
          id: immunization.vaccineUuid,
          vaccine: immunization.vaccineName,
          recentVaccination: occurrenceDate,
          add: (
            <Button
              hasIconOnly
              iconDescription={t('add', 'Add')}
              kind="ghost"
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
              renderIcon={(props: ComponentProps<typeof AddIcon>) => <AddIcon size={16} {...props} />}
              size="sm"
            ></Button>
          ),
        };
      }),
    [launchImmunizationsForm, sortedImmunizations, t],
  );

  const { results: paginatedImmunizations, currentPage, goTo } = usePagination(tableRows, 10);

  if (isLoading || !sortedImmunizations) {
    return <DataTableSkeleton role="progressbar" />;
  }

  if (error) {
    return <ErrorState error={error} headerTitle={headerTitle} />;
  }

  if (sortedImmunizations?.length) {
    return (
      <div className={styles.widgetCard}>
        <CardHeader title={headerTitle}>
          <span>{isValidating ? <InlineLoading /> : null}</span>
          <Button
            kind="ghost"
            renderIcon={(props: ComponentProps<typeof AddIcon>) => <AddIcon size={16} {...props} />}
            iconDescription={t('addImmunizations', 'Add immunizations')}
            onClick={launchImmunizationsForm}
          >
            {t('add', 'Add')}
          </Button>
        </CardHeader>

        <DataTable rows={paginatedImmunizations} headers={tableHeader} size={isTablet ? 'lg' : 'sm'} useZebraStyles>
          {({
            rows,
            headers,
            getExpandedRowProps,
            getHeaderProps,
            getRowProps,
            getTableProps,
            getExpandHeaderProps,
          }) => (
            <TableContainer>
              <Table aria-label="immunizations summary" {...getTableProps()}>
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
                        <TableExpandedRow {...getExpandedRowProps({ row })} colSpan={headers.length + 2}>
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
        <div className={styles.paginationContainer}>
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
      </div>
    );
  }

  return <EmptyState displayText={displayText} headerTitle={headerTitle} launchForm={launchImmunizationsForm} />;
};

export default ImmunizationsDetailedSummary;
