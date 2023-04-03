import React, { useState } from 'react';
import {
  DataTable,
  DataTableRow,
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
import styles from './biometrics-overview.scss';

interface PaginatedBiometricsProps {
  tableRows: Array<DataTableRow>;
  pageSize: number;
  pageUrl: string;
  urlLabel: string;
  tableHeaders: Array<{ key: string; header: string }>;
}

const PaginatedBiometrics: React.FC<PaginatedBiometricsProps> = ({
  tableRows,
  pageSize,
  pageUrl,
  urlLabel,
  tableHeaders,
}) => {
  const [sort, setSort] = useState({ column: null, direction: null });
  const [sortedTableRows, setSortedTableRows] = useState(tableRows);
  const { results: paginatedBiometrics, goTo, currentPage } = usePagination(sortedTableRows, pageSize);
  const isTablet = useLayoutType() === 'tablet';

  const getHeaderProps = (header) => ({
    onClick: () => {
      if (!header.isSortable) {
        return;
      }

      let direction = 'ascending';

      if (sort.column === header.key && sort.direction === 'ascending') {
        direction = 'descending';
      }

      const sortedRows = sortedTableRows.sort((a, b) => {
        if (a.cells[header.key].value > b.cells[header.key].value) {
          return direction === 'ascending' ? 1 : -1;
        }

        if (a.cells[header.key].value < b.cells[header.key].value) {
          return direction === 'ascending' ? -1 : 1;
        }

        return 0;
      });

      setSortedTableRows(sortedRows);
      setSort({ column: header.key, direction });
    },
  });

  return (
    <div>
      <DataTable
        rows={paginatedBiometrics}
        headers={tableHeaders}
        isSortable
        size={isTablet ? 'lg' : 'sm'}
        useZebraStyles
      >
        {({ rows, headers, getTableProps }) => (
          <TableContainer>
            <Table {...getTableProps()}>
              <TableHead>
                <TableRow>
                  {headers.map((header) => (
                    <TableHeader
                      className={`${styles.productiveHeading01} ${styles.text02}`}
                      {...getHeaderProps({
                        header,
                        isSortable: header.isSortable,
                        key: header.key,
                      })}
                    >
                      {header.header}
                    </TableHeader>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.cells.map((cell) => (
                      <TableCell key={cell.id}>{cell.value}</TableCell>
                    ))}
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
