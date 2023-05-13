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
import { usePagination } from '@openmrs/esm-framework';
import { PatientChartPagination } from '@openmrs/esm-patient-common-lib';
import { PatientBiometrics } from './biometrics.resource';
import styles from './biometrics-overview.scss';
import { orderBy } from 'lodash-es';

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
  const [sortParams, setSortParams] = useState({ key: '', order: 'none' });

  const sortDate = (myArray, order) =>
    order === 'ASC'
      ? orderBy(myArray, [(obj) => new Date(obj.encounterDate).getTime()], ['desc'])
      : orderBy(myArray, [(obj) => new Date(obj.encounterDate).getTime()], ['asc']);

  const { key, order } = sortParams;

  const sortedData =
    key === 'encounterDate'
      ? sortDate(tableRows, order)
      : order === 'DESC'
      ? orderBy(tableRows, [key], ['desc'])
      : orderBy(tableRows, [key], ['asc']);

  function customSortRow(noteA, noteB, { sortDirection, sortStates, ...props }) {
    const { key } = props;
    setSortParams({ key, order: sortDirection });
  }

  const { results: paginatedBiometrics, goTo, currentPage } = usePagination(sortedData, pageSize);

  return (
    <div>
      <DataTable
        rows={paginatedBiometrics}
        sortRow={customSortRow}
        headers={tableHeaders}
        isSortable
        size="sm"
        useZebraStyles
      >
        {({ rows, headers, getHeaderProps, getTableProps }) => (
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
