import {
  DataTable,
  DataTableSkeleton,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
} from '@carbon/react';
import { ErrorState, isDesktop, useLayoutType } from '@openmrs/esm-framework';
import { EmptyState } from '@openmrs/esm-patient-common-lib';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useVisitsPagination } from '../visits-widget/visit.resource';
import VisitDateCell from './visit-date-cell.component';
import VisitDiagnosisCell from './visit-diagnoses-cell.component';
import styles from './visit-history-table.scss';
import VisitTypeCell from './visit-type-cell.component';

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

  const { data: visits, currentPage, error, isLoading, totalCount, goTo } = useVisitsPagination(patientUuid, pageSize);
  const { t } = useTranslation();

  // TODO: make this configurable
  const columns = [
    { key: 'visitDate', header: t('date', 'Date'), CellComponent: VisitDateCell },
    { key: 'visitType', header: t('visitType', 'Visit type'), CellComponent: VisitTypeCell },
    { key: 'diagnoses', header: t('diagnoses', 'Diagnoses'), CellComponent: VisitDiagnosisCell },
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
  if (visits.length == 0) {
    return (
      <div className={styles.emptyStateContainer}>
        <EmptyState headerTitle={t('pastVisits', 'Past visits')} displayText={t('visits', 'visits')} />
      </div>
    );
  }
  return (
    <div className={''}>
      <DataTable headers={columns} rows={rowData} useZebraStyles>
        {({ rows, headers, getTableProps, getHeaderProps, getRowProps }) => (
          <>
            <TableContainer>
              <Table {...getTableProps()}>
                <TableHead>
                  <TableRow>
                    {headers.map((header) => (
                      <TableHeader
                        {...getHeaderProps({
                          header,
                          isSortable: header.isSortable,
                        })}
                      >
                        {header.header}
                      </TableHeader>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row) => {
                    return (
                      <TableRow key={row.id} {...getRowProps({ row })}>
                        {row.cells.map((cell) => {
                          return <TableCell key={cell.id}>{cell?.value}</TableCell>;
                        })}
                      </TableRow>
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
