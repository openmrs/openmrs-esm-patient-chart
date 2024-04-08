import React, { useState } from 'react';
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
import orderBy from 'lodash/orderBy';

interface PaginatedBiometricsProps {
  tableRows: Array<typeof DataTableRow>;
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
  const isTablet = useLayoutType() === 'tablet';

  const [sortParams, setSortParams] = useState({ key: '', order: 'NONE' });

  const handleSort = (cellA, cellB, { sortDirection }) => {
    setSortParams({ key: 'date', order: sortDirection });
  };

  const sortDate = (myArray, order) =>
    order === 'ASC'
      ? orderBy(myArray, [(obj) => new Date(obj.encounterDate).getTime()], ['desc'])
      : orderBy(myArray, [(obj) => new Date(obj.encounterDate).getTime()], ['asc']);

  const { key, order } = sortParams;

  const sortedData =
    key === 'date'
      ? sortDate(tableRows, order)
      : order === 'DESC'
      ? orderBy(tableRows, [key], ['desc'])
      : orderBy(tableRows, [key], ['asc']);

  const { results: paginatedBiometrics, goTo, currentPage } = usePagination(sortedData, pageSize);

  return (
    <div>
      <DataTable
        rows={paginatedBiometrics}
        headers={tableHeaders}
        size={isTablet ? 'lg' : 'sm'}
        useZebraStyles
        sortRow={handleSort}
      >
        {({ rows, headers, getHeaderProps, getTableProps }) => (
          <TableContainer>
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
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.cells.map((cell) => (
                      <TableCell key={cell.id}>{cell.value?.content ?? cell.value}</TableCell>
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
