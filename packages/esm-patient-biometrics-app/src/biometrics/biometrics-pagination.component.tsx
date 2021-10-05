import React from 'react';
import styles from './biometrics-overview.scss';
import {
  DataTable,
  Table,
  TableCell,
  TableContainer,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from 'carbon-components-react';
import { usePagination } from '@openmrs/esm-framework';
import { PatientChartPagination } from '@openmrs/esm-patient-common-lib';
import { PatientBiometrics } from './biometrics.resource';

interface BiometricsPaginationProps {
  tableRows: Array<PatientBiometrics>;
  pageSize: number;
  pageUrl: string;
  urlLabel: string;
  tableHeaders: Array<{ key: string; header: string }>;
}

const BiometricsPagination: React.FC<BiometricsPaginationProps> = ({
  tableRows,
  pageSize,
  pageUrl,
  urlLabel,
  tableHeaders,
}) => {
  const { results: paginatedBiometrics, goTo, currentPage } = usePagination(tableRows, pageSize);

  return (
    <div>
      <TableContainer>
        <DataTable rows={paginatedBiometrics} headers={tableHeaders} isSortable size="short">
          {({ rows, headers, getHeaderProps, getTableProps }) => (
            <Table {...getTableProps()} className={styles.customRow}>
              <TableHead>
                <TableRow>
                  {headers.map((header) => (
                    <TableHeader
                      className={`${styles.productiveHeading01} ${styles.text02}`}
                      {...getHeaderProps({
                        header,
                        isSortable: header.isSortable,
                      })}>
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
          )}
        </DataTable>
      </TableContainer>
      <PatientChartPagination
        pageNumber={currentPage}
        totalItems={tableRows.length}
        currentItems={paginatedBiometrics.length}
        pageUrl={pageUrl}
        pageSize={pageSize}
        onPageNumberChange={({ page }) => goTo(page)}
        urlLabel={urlLabel}
      />
    </div>
  );
};

export default BiometricsPagination;
