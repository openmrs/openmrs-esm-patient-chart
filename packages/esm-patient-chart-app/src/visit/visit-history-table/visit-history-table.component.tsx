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
import { usePaginatedVisits } from '../visits-widget/visit.resource';
import VisitDateCell from './visit-date-cell.component';
import VisitDiagnosisCell from './visit-diagnoses-cell.component';
import VisitSummary from '../visits-widget/past-visits-components/visit-summary.component';
import VisitTypeCell from './visit-type-cell.component';
import VisitActionsCell from './visit-actions-cell.component';
import styles from './visit-history-table.scss';

interface VisitHistoryTableProps {
  patientUuid: string;
}

/**
 * This show a list of visit histories in the visit tab in patient chart
 */
const VisitHistoryTable: React.FC<VisitHistoryTableProps> = ({ patientUuid }) => {
  const defaultPageSize = 10;
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const pageSizes = [10, 20, 30, 40, 50];

  const { data: visits, currentPage, error, isLoading, totalCount, goTo } = usePaginatedVisits(patientUuid, pageSize);
  const { t } = useTranslation();
  const desktopLayout = isDesktop(useLayoutType());

  // TODO: make this configurable
  const columns = [
    { key: 'visitDate', header: t('date', 'Date'), CellComponent: VisitDateCell },
    { key: 'visitType', header: t('visitType', 'Visit type'), CellComponent: VisitTypeCell },
    { key: 'diagnoses', header: t('diagnoses', 'Diagnoses'), CellComponent: VisitDiagnosisCell },
    { key: 'actions', header: '', CellComponent: VisitActionsCell },
  ];

  const layout = useLayoutType();

  const rowData = visits?.map((visit) => {
    const row: Record<string, JSX.Element | string> = { id: visit.uuid };
    for (const { key, CellComponent } of columns) {
      row[key] = <CellComponent key={key} visit={visit} />;
    }
    return row;
  });

  if (isLoading) {
    return <DataTableSkeleton role="progressbar" compact={isDesktop(layout)} zebra />;
  }

  if (error) {
    return <ErrorState error={error} headerTitle={t('pastVisits', 'Past visits')} />;
  }

  if (visits.length === 0) {
    return (
      <div className={styles.emptyStateContainer}>
        <EmptyState headerTitle={t('pastVisits', 'Past visits')} displayText={t('visits', 'visits')} />
      </div>
    );
  }
  return (
    <div className={styles.container}>
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
                          isSortable: header.isSortable,
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
                    const visit = visits[i];
                    return (
                      <React.Fragment key={row.id}>
                        <TableExpandRow {...getRowProps({ row })}>
                          {row.cells.map((cell) => {
                            return <TableCell key={cell.id}>{cell?.value}</TableCell>;
                          })}
                        </TableExpandRow>
                        {row.isExpanded ? (
                          <TableExpandedRow {...getExpandedRowProps({ row })} colSpan={headers.length + 2}>
                            <VisitSummary visit={visit} patientUuid={patientUuid} />
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
