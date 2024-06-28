import React, { useMemo, useState } from 'react';
import {
  DataTable,
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
import styles from './paginated-biometrics.scss';
import type { BiometricsTableHeader, BiometricsTableRow } from './types';
import { VitalsAndBiometricsActionMenu } from '../vitals-biometrics-form/vitals-biometrics-action-menu.component';

interface PaginatedBiometricsProps {
  tableRows: Array<BiometricsTableRow>;
  pageSize: number;
  pageUrl: string;
  urlLabel: string;
  tableHeaders: Array<BiometricsTableHeader>;
}

const PaginatedBiometrics: React.FC<PaginatedBiometricsProps> = ({
  tableRows,
  pageSize,
  pageUrl,
  urlLabel,
  tableHeaders,
}) => {
  const isTablet = useLayoutType() === 'tablet';

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

  const sortedData: Array<BiometricsTableRow> = useMemo(() => {
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
  }, [tableRows, tableHeaders, sortParams]);

  const { results: paginatedBiometrics, goTo, currentPage } = usePagination(sortedData, pageSize);

  return (
    <div className={styles.paginatedBiometrics}>
      <DataTable
        rows={paginatedBiometrics}
        headers={tableHeaders}
        size={isTablet ? 'lg' : 'sm'}
        useZebraStyles
        sortRow={handleSorting}
        isSortable
      >
        {({ rows, headers, getHeaderProps, getTableProps }) => (
          <TableContainer className={styles.tableContainer}>
            <Table aria-label="biometrics" {...getTableProps()}>
              <TableHead>
                <TableRow>
                  {headers.map((header) => (
                    <TableHeader
                      {...getHeaderProps({
                        header,
                        isSortable: header.isSortable,
                      })}
                    >
                      {header.header?.content ?? header.header}
                    </TableHeader>
                  ))}
                  <TableHeader />
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.cells.map((cell) => (
                      <TableCell key={cell.id}>{cell.value?.content ?? cell.value}</TableCell>
                    ))}
                    <TableCell className="cds--table-column-menu" id="actions">
                      <VitalsAndBiometricsActionMenu rowId={row.id} formType="biometrics" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DataTable>
      <PatientChartPagination
        pageNumber={currentPage}
        totalItems={tableRows.length}
        currentItems={paginatedBiometrics.length}
        pageSize={pageSize}
        onPageNumberChange={({ page }) => goTo(page)}
        dashboardLinkUrl={pageUrl}
        dashboardLinkLabel={urlLabel}
      />
    </div>
  );
};

export default PaginatedBiometrics;
