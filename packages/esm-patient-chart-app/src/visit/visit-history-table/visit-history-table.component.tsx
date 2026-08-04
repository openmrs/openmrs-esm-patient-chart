import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DataTable,
  DataTableSkeleton,
  Pagination,
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
} from '@carbon/react';
import { ErrorState, isDesktop, useLayoutType } from '@openmrs/esm-framework';
import { EmptyState } from '@openmrs/esm-patient-common-lib';
import { useEmrApiVisits } from '../visits-widget/visit.resource';
import VisitSummary from '../visits-widget/past-visits-components/visit-summary.component';
import VisitDateCell from './visit-date-cell.component';
import VisitTypeCell from './visit-type-cell.component';
import VisitDiagnosisCell from './visit-diagnoses-cell.component';
import VisitActionsCell from './visit-actions-cell.component';
import styles from './visit-history-table.scss';

interface VisitHistoryTableProps {
  patientUuid: string;
  patient: fhir.Patient;
}

/**
 * This shows a list of visit histories in the visit tab in patient chart.
 * Uses the EMRAPI endpoint to fetch lightweight visit data + diagnoses.
 * Full encounter data is fetched on-demand when a row is expanded (handled by VisitSummary).
 */
const VisitHistoryTable: React.FC<VisitHistoryTableProps> = ({ patientUuid, patient }) => {
  const defaultPageSize = 10;
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const pageSizes = [10, 20, 30, 40, 50];
  const { t } = useTranslation();
  const layout = useLayoutType();
  const desktopLayout = isDesktop(layout);

  const {
    visits: emrapiVisits,
    currentPage,
    error,
    isLoading,
    totalCount,
    goTo,
  } = useEmrApiVisits(patientUuid, pageSize);

  const columns = [
    { key: 'visitDate', header: t('date', 'Date'), CellComponent: VisitDateCell },
    { key: 'visitType', header: t('visitType', 'Visit type'), CellComponent: VisitTypeCell },
    { key: 'diagnoses', header: t('diagnoses', 'Diagnoses'), CellComponent: VisitDiagnosisCell },
    { key: 'actions', header: '', CellComponent: VisitActionsCell },
  ];

  const rowData = emrapiVisits?.map(({ visit, diagnoses }) => {
    const row: Record<string, JSX.Element | string> = { id: visit.uuid };
    for (const { key, CellComponent } of columns) {
      row[key] = <CellComponent key={key} visit={visit} patient={patient} diagnoses={diagnoses} />;
    }
    return row;
  });

  if (isLoading) {
    return <DataTableSkeleton role="progressbar" compact={desktopLayout} zebra />;
  }

  if (error) {
    return <ErrorState error={error} headerTitle={t('pastVisits', 'Past visits')} />;
  }

  if (!emrapiVisits || emrapiVisits.length === 0) {
    return (
      <div className={styles.emptyStateContainer}>
        <EmptyState headerTitle={t('pastVisits', 'Past visits')} displayText={t('visits', 'visits')} />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* @ts-ignore */}
      <DataTable headers={columns} rows={rowData} size={desktopLayout ? 'sm' : 'lg'} useZebraStyles>
        {({ rows, headers, getTableProps, getHeaderProps, getExpandHeaderProps, getRowProps, getExpandedRowProps }) => (
          <>
            <TableContainer>
              <Table {...getTableProps()}>
                <TableHead>
                  <TableRow>
                    <TableExpandHeader enableToggle {...getExpandHeaderProps()} />
                    {headers.map((header) => (
                      <TableHeader
                        {...getHeaderProps({
                          header,
                          className: header.key === 'actions' ? styles.actionsColumn : '',
                        })}
                      >
                        {header.header}
                      </TableHeader>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row, i) => {
                    const { visit, diagnoses } = emrapiVisits[i];
                    return (
                      <React.Fragment key={row.id}>
                        <TableExpandRow {...getRowProps({ row })}>
                          {row.cells.map((cell) => (
                            <TableCell key={cell.id}>{cell?.value}</TableCell>
                          ))}
                        </TableExpandRow>
                        {row.isExpanded ? (
                          <TableExpandedRow {...getExpandedRowProps({ row })} colSpan={headers.length + 2}>
                            <VisitSummary visit={visit} patientUuid={patientUuid} emrapiDiagnoses={diagnoses} />
                          </TableExpandedRow>
                        ) : (
                          <TableExpandedRow className={styles.hiddenRow} colSpan={headers.length + 2} />
                        )}
                      </React.Fragment>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
            <Pagination
              forwardText={t('nextPage', 'Next page')}
              backwardText={t('previousPage', 'Previous page')}
              page={currentPage}
              pageSize={pageSize}
              pageSizes={pageSizes}
              totalItems={totalCount}
              onChange={({ pageSize, page }) => {
                setPageSize(pageSize);
                if (page !== currentPage) {
                  goTo(page);
                }
              }}
            />
          </>
        )}
      </DataTable>
    </div>
  );
};

export default VisitHistoryTable;
