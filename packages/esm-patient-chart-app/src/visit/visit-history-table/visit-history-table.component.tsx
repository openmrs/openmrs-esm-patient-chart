import {
  DataTable,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
 DataTableSkeleton } from '@carbon/react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useVisitsPagination } from '../visits-widget/visit.resource';
import { useVisitHistoryTableColumns } from './visit-history-table.resource';
import { ErrorState, isDesktop, useLayoutType } from '@openmrs/esm-framework';

interface VisitHistoryTableProps {
  patientUuid: string;
}

const VisitHistoryTable: React.FC<VisitHistoryTableProps> = ({ patientUuid }) => {
  const defaultPageSize = 10;
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const pageSizes = [10, 20, 30, 40, 50];

  const { data: visits, currentPage, error, isLoading, totalCount, goTo } = useVisitsPagination(patientUuid, pageSize);
  const { t } = useTranslation();
  const columns = useVisitHistoryTableColumns();
  const layout = useLayoutType();

  const rowData = visits?.map((visit) => {
    const row: Record<string, JSX.Element | string> = { id: visit.uuid };
    for (const { key, CellComponent } of columns) {
      row[key] = <CellComponent key={key} visit={visit} />;
    }
    return row;
  });

  if (isLoading) return <DataTableSkeleton role="progressbar" compact={isDesktop(layout)} zebra />;
  if (error) return <ErrorState error={error} headerTitle={t('Visits table')} />;
  return (
    <div className={''}>
      <DataTable headers={columns} rows={rowData} useZebraStyles>
        {({ rows, headers, getTableProps, getHeaderProps, getRowProps }) => (
          <>
            <TableContainer title={t('pastVisits', 'Past Visits')}>
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
