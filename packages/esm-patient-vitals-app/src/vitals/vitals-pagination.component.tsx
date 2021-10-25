import React from 'react';
import styles from './vitals-overview.scss';
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

interface VitalsPaginationProps {
  tableRows: Array<any>;
  pageSize: number;
  pageUrl: string;
  urlLabel: string;
  tableHeaders: Array<any>;
}

const VitalsPagination: React.FC<VitalsPaginationProps> = ({
  tableRows,
  pageSize,
  pageUrl,
  urlLabel,
  tableHeaders,
}) => {
  const { results: paginatedVitals, goTo, currentPage } = usePagination(tableRows, pageSize);

  return (
    <div>
      <TableContainer>
        <DataTable rows={paginatedVitals} headers={tableHeaders} isSortable={true} size="short">
          {({ rows, headers, getHeaderProps, getTableProps }) => (
            <Table {...getTableProps()} useZebraStyles className={styles.customRow}>
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
          )}
        </DataTable>
      </TableContainer>
      <PatientChartPagination
        pageNumber={currentPage}
        totalItems={tableRows.length}
        currentItems={paginatedVitals.length}
        pageUrl={pageUrl}
        pageSize={pageSize}
        onPageNumberChange={({ page }) => goTo(page)}
        urlLabel={urlLabel}
      />
    </div>
  );
};

export default VitalsPagination;
