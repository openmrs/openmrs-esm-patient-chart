import React, { useMemo, useState } from 'react';
import orderBy from 'lodash-es/orderBy';
import {
  DataTable,
  type DataTableHeader,
  type DataTableRow,
  Table,
  TableCell,
  TableContainer,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@carbon/react';
import { useLayoutType, usePagination } from '@openmrs/esm-framework';
import { PatientChartPagination } from '@openmrs/esm-patient-common-lib';
import styles from './paginated-vitals.scss';
import type { VitalsTableHeader, VitalsTableRow } from './types';

interface PaginatedVitalsProps {
  pageSize: number;
  pageUrl: string;
  urlLabel: string;
  tableRows: Array<VitalsTableRow>;
  tableHeaders: Array<VitalsTableHeader>;
  isPrinting?: boolean;
}

const PaginatedVitals: React.FC<PaginatedVitalsProps> = ({
  tableRows,
  pageSize,
  pageUrl,
  urlLabel,
  tableHeaders,
  isPrinting,
}) => {
  const isTablet = useLayoutType() === 'tablet';

  const StyledTableCell = ({ interpretation, children }: { interpretation: string; children: React.ReactNode }) => {
    switch (interpretation) {
      case 'critically_high':
        return <TableCell className={styles.criticallyHigh}>{children}</TableCell>;
      case 'critically_low':
        return <TableCell className={styles.criticallyLow}>{children}</TableCell>;
      case 'high':
        return <TableCell className={styles.high}>{children}</TableCell>;
      case 'low':
        return <TableCell className={styles.low}>{children}</TableCell>;
      default:
        return <TableCell>{children}</TableCell>;
    }
  };

  const [sortParams, setSortParams] = useState<{ key: string; sortDirection: 'ASC' | 'DESC' | 'NONE' }>({
    key: '',
    sortDirection: 'NONE',
  });

  const handleSorting = (
    cellA,
    cellB,
    { key, sortDirection }: { key: string; sortDirection: 'ASC' | 'DESC' | 'NONE' },
  ) => {
    if (sortDirection === 'NONE') {
      setSortParams({ key: '', sortDirection });
    } else {
      setSortParams({ key, sortDirection });
    }
  };

  const sortedData: Array<VitalsTableRow> = useMemo(() => {
    if (sortParams.sortDirection === 'NONE') {
      return tableRows;
    }

    const header = tableHeaders.find((header) => header.key === sortParams.key);

    if (!header) {
      return tableRows;
    }

    const sortedRows = [...tableRows].sort((rowA, rowB) => header.sortFunc(rowA, rowB));

    if (sortParams.sortDirection === 'DESC') {
      sortedRows.reverse();
    }
    return sortedRows;
  }, [tableHeaders, sortParams]);

  const { results: paginatedVitals, goTo, currentPage } = usePagination(sortedData, pageSize);

  const rows = isPrinting ? sortedData : paginatedVitals;

  return (
    <div>
      <DataTable
        rows={rows}
        headers={tableHeaders}
        size={isTablet ? 'lg' : 'sm'}
        useZebraStyles
        sortRow={handleSorting}
      >
        {({ rows, headers, getTableProps, getHeaderProps }) => (
          <TableContainer>
            <Table className={styles.table} aria-label="vitals" {...getTableProps()}>
              <TableHead>
                <TableRow>
                  {headers.map((header) => (
                    <TableHeader {...getHeaderProps({ header, isSortable: header.isSortable })} key={header.key}>
                      {header.header?.content ?? header.header}
                    </TableHeader>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.cells.map((cell) => {
                      const vitalsObj = paginatedVitals.find((obj) => obj.id === row.id);
                      const vitalSignInterpretation = vitalsObj && vitalsObj[cell.id.substring(2) + 'Interpretation'];

                      return (
                        <StyledTableCell key={`styled-cell-${cell.id}`} interpretation={vitalSignInterpretation}>
                          {cell.value?.content ?? cell.value}
                        </StyledTableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DataTable>
      {!isPrinting ? (
        <PatientChartPagination
          pageNumber={currentPage}
          totalItems={tableRows.length}
          currentItems={paginatedVitals.length}
          pageSize={pageSize}
          onPageNumberChange={({ page }) => goTo(page)}
          dashboardLinkUrl={pageUrl}
          dashboardLinkLabel={urlLabel}
        />
      ) : null}
    </div>
  );
};

export default PaginatedVitals;
