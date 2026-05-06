import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  DataTable,
  DataTableSkeleton,
  InlineLoading,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableExpandedRow,
  TableExpandHeader,
  TableExpandRow,
  TableHead,
  TableHeader,
  TableRow,
  Tile,
} from '@carbon/react';
import { Add } from '@carbon/react/icons';
import {
  formatDate,
  isDesktop as isDesktopLayout,
  launchWorkspace2,
  parseDate,
  useLayoutType,
  CardHeader,
  EmptyCard,
  ErrorState,
  formatPartialDate,
} from '@openmrs/esm-framework';
import { useProcedures } from './procedures.resource';
import { PatientChartPagination } from '@openmrs/esm-patient-common-lib';
import styles from './procedures-overview.scss';
import { ProceduresActionMenu } from './procedures-action-menu.component';

const DEFAULT_PAGE_SIZE = 20;

type ProceduresDetailedSummaryProps = {
  patient: fhir.Patient;
};

type ProcedureTableRow = {
  id: string;
  display: string;
  procedureType: string;
  bodySite: string;
  startDateTimeRender: string;
  estimatedStartDate?: string;
  endDateTimeRender: string;
  status: string;
  notes?: string;
};

function ProceduresDetailedSummary({ patient }: ProceduresDetailedSummaryProps) {
  const { t } = useTranslation();
  const headerTitle = t('procedures', 'Procedures');
  const displayText = t('procedures_lower', 'procedures');
  const layout = useLayoutType();
  const isDesktop = isDesktopLayout(layout);
  const launchProceduresForm = useCallback(
    () => launchWorkspace2('procedures-form-workspace', { formContext: 'creating' }),
    [],
  );

  const { procedures, error, isLoading, isValidating } = useProcedures(patient.id);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const headers = useMemo(
    () => [
      { key: 'display', header: t('procedure', 'Procedure') },
      { key: 'procedureType', header: t('procedureType', 'Procedure type') },
      { key: 'bodySite', header: t('bodySite', 'Body site') },
      { key: 'startDateTimeRender', header: t('startDate', 'Start date') },
      { key: 'endDateTimeRender', header: t('endDate', 'End date') },
      { key: 'status', header: t('status', 'Status') },
    ],
    [t],
  );

  const allRows: ProcedureTableRow[] = useMemo(
    () =>
      procedures?.map((p) => ({
        id: p.uuid,
        display: p.display,
        procedureType: p.procedureType.name,
        bodySite: p.bodySite.display ?? '--',
        startDateTimeRender: p.estimatedStartDate ?? p.startDateTime,
        estimatedStartDate: p.estimatedStartDate,
        endDateTimeRender: p.endDateTime ? formatDate(parseDate(p.endDateTime), { mode: 'wide' }) : '--',
        status: p.status.display,
        notes: p.notes,
      })),
    [procedures],
  );

  const tableRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return allRows?.slice(start, start + pageSize);
  }, [allRows, currentPage, pageSize]);

  if (isLoading) {
    return <DataTableSkeleton role="progressbar" zebra />;
  }

  if (error) {
    return <ErrorState error={error} headerTitle={headerTitle} />;
  }

  if (procedures?.length) {
    return (
      <div className={styles.widgetCard}>
        <CardHeader title={headerTitle}>
          <span>{isValidating ? <InlineLoading /> : null}</span>
          <Button
            kind="ghost"
            renderIcon={(props) => <Add size={16} {...props} />}
            iconDescription={t('addProcedure', 'Add procedure')}
            onClick={launchProceduresForm}
          >
            {t('add', 'Add')}
          </Button>
        </CardHeader>
        <DataTable
          aria-label="procedures detailed summary"
          headers={headers}
          isSortable
          overflowMenuOnHover={isDesktop}
          rows={tableRows}
          size={isDesktop ? 'sm' : 'lg'}
          useZebraStyles
        >
          {({ rows, headers: carbonHeaders, getRowProps, getExpandedRowProps, getHeaderProps, getTableProps }) => (
            <>
              <TableContainer>
                <Table {...getTableProps()} className={styles.table}>
                  <TableHead>
                    <TableRow>
                      <TableExpandHeader aria-label="expand row" />
                      {carbonHeaders.map((header) => (
                        <TableHeader {...getHeaderProps({ header })} key={header.key}>
                          {header.header}
                        </TableHeader>
                      ))}
                      <TableHeader />
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows.map((row) => {
                      const matchingRow = tableRows?.find((r) => r.id === row.id);
                      const matchingProcedure = procedures?.find((p) => p.uuid === row.id);
                      return (
                        <React.Fragment key={row.id}>
                          <TableExpandRow {...getRowProps({ row })}>
                            {row.cells.map((cell) => {
                              if (cell.info.header === 'startDateTimeRender') {
                                const display = matchingRow?.estimatedStartDate
                                  ? `${formatPartialDate(matchingRow.estimatedStartDate, { mode: 'wide' })}*`
                                  : formatDate(parseDate(cell.value), { mode: 'wide', time: true });
                                return <TableCell key={cell.id}>{display}</TableCell>;
                              }
                              return <TableCell key={cell.id}>{cell.value}</TableCell>;
                            })}
                            <TableCell className="cds--table-column-menu">
                              <ProceduresActionMenu procedure={matchingProcedure} patientUuid={patient.id} />
                            </TableCell>
                          </TableExpandRow>
                          <TableExpandedRow
                            colSpan={headers.length + 2}
                            className="demo-expanded-td"
                            {...getExpandedRowProps({ row })}
                          >
                            <p>
                              <strong>{t('duration', 'Duration')}: </strong>
                              {matchingProcedure?.duration
                                ? `${matchingProcedure.duration} ${matchingProcedure.durationUnit?.display ?? ''}`
                                : '--'}
                            </p>
                            <p>
                              <strong>{t('notes', 'Notes')}: </strong>
                              {matchingRow?.notes ?? '--'}
                            </p>
                          </TableExpandedRow>
                        </React.Fragment>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
              {rows.length === 0 ? (
                <div className={styles.tileContainer}>
                  <Tile className={styles.tile}>
                    <div className={styles.tileContent}>
                      <p className={styles.content}>{t('noProceduresToDisplay', 'No procedures to display')}</p>
                    </div>
                  </Tile>
                </div>
              ) : null}
              <PatientChartPagination
                currentItems={rows.length}
                totalItems={allRows?.length ?? 0}
                pageNumber={currentPage}
                pageSize={pageSize}
                onPageNumberChange={({ page, pageSize: newPageSize }: { page: number; pageSize: number }) => {
                  setCurrentPage(page);
                  setPageSize(newPageSize);
                }}
              />
            </>
          )}
        </DataTable>
      </div>
    );
  }

  return <EmptyCard displayText={displayText} headerTitle={headerTitle} launchForm={launchProceduresForm} />;
}

export default ProceduresDetailedSummary;
