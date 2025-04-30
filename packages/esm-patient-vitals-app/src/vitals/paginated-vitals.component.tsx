import React, { useMemo, useState } from 'react';
import {
  DataTable,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
} from '@carbon/react';
import { useLayoutType, usePagination } from '@openmrs/esm-framework';
import { PatientChartPagination } from '@openmrs/esm-patient-common-lib';
import type { VitalsTableHeader, VitalsTableRow } from './types';
import { VitalsAndBiometricsActionMenu } from '../components/action-menu/vitals-biometrics-action-menu.component';
import styles from './paginated-vitals.scss';

interface PaginatedVitalsProps {
  isPrinting?: boolean;
  pageSize: number;
  pageUrl: string;
  tableHeaders: Array<VitalsTableHeader>;
  tableRows: Array<VitalsTableRow>;
  urlLabel: string;
}

const PaginatedVitals: React.FC<PaginatedVitalsProps> = ({
  isPrinting,
  pageSize,
  pageUrl,
  tableHeaders,
  tableRows,
  urlLabel,
}) => {
  const isTablet = useLayoutType() === 'tablet';

  const StyledTableCell = ({ children, interpretation }: { children: React.ReactNode; interpretation: string }) => {
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

    const sortedRows = tableRows.slice().sort((rowA, rowB) => {
      const sortingNum = header.sortFunc(rowA, rowB);
      return sortParams.sortDirection === 'DESC' ? sortingNum : -sortingNum;
    });

    return sortedRows;
  }, [tableHeaders, tableRows, sortParams]);

  const { results: paginatedVitals, goTo, currentPage } = usePagination(sortedData, pageSize);

  const rows = isPrinting ? sortedData : paginatedVitals;

  return (
    <>
      <DataTable
        headers={tableHeaders}
        isSortable
        overflowMenuOnHover={!isTablet}
        rows={rows}
        size={isTablet ? 'lg' : 'sm'}
        sortRow={handleSorting}
        useZebraStyles
      >
        {({ rows, headers, getTableProps, getHeaderProps }) => (
          <TableContainer className={styles.tableContainer}>
            <Table aria-label="vitals" className={styles.table} {...getTableProps()}>
              <TableHead>
                <TableRow>
                  {headers.map((header) => (
                    <TableHeader {...getHeaderProps({ header, isSortable: header.isSortable })} key={header.key}>
                      {header.header?.content ?? header.header}
                    </TableHeader>
                  ))}
                  <TableHeader />
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.cells.map((cell) => {
                      const vitalsObj = paginatedVitals.find((obj) => obj.id === row.id);
                      const interpretationKey = cell.info.header + 'Interpretation';
                      const interpretation = vitalsObj?.[interpretationKey];

                      return (
                        <StyledTableCell key={`styled-cell-${cell.id}`} interpretation={interpretation}>
                          {cell.value?.content ?? cell.value}
                        </StyledTableCell>
                      );
                    })}
                    <TableCell className="cds--table-column-menu" id="actions">
                      <VitalsAndBiometricsActionMenu encounterUuid={row.id} />
                    </TableCell>
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
    </>
  );
};

export default PaginatedVitals;
