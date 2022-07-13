import React from 'react';
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
import styles from './paginated-vitals.scss';

interface PaginatedVitalsProps {
  tableRows: Array<DataTableRow>;
  pageSize: number;
  pageUrl: string;
  urlLabel: string;
  tableHeaders: Array<any>;
}

const PaginatedVitals: React.FC<PaginatedVitalsProps> = ({ tableRows, pageSize, pageUrl, urlLabel, tableHeaders }) => {
  const { results: paginatedVitals, goTo, currentPage } = usePagination(tableRows, pageSize);

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

  return (
    <div>
      <TableContainer>
        <DataTable rows={paginatedVitals} headers={tableHeaders} isSortable={true} size="sm">
          {({ rows, headers, getHeaderProps, getTableProps }) => (
            <Table {...getTableProps()} className={styles.customRow} useZebraStyles>
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
                    {row.cells.map((cell, index) => {
                      const vitalSignInterpretation = paginatedVitals[row.id][cell.id.substring(2) + 'Interpretation'];

                      return (
                        <StyledTableCell key={`styled-${index}`} interpretation={vitalSignInterpretation}>
                          {cell.value?.content ?? cell.value}
                        </StyledTableCell>
                      );
                    })}
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
        pageSize={pageSize}
        onPageNumberChange={({ page }) => goTo(page)}
        dashboardLinkUrl={pageUrl}
        dashboardLinkLabel={urlLabel}
      />
    </div>
  );
};

export default PaginatedVitals;
