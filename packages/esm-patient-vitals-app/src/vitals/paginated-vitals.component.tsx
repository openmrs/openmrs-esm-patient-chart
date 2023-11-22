import React, { useState } from 'react';
import orderBy from 'lodash-es/orderBy';
import {
  DataTable,
  DataTableHeader,
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
import styles from './paginated-vitals.scss';

interface PaginatedVitalsProps {
  pageSize: number;
  pageUrl: string;
  urlLabel: string;
  // @ts-ignore
  tableRows: Array<typeof DataTableRow>;
  // @ts-ignore
  tableHeaders: Array<typeof DataTableHeader>;
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

  const { results: paginatedVitals, goTo, currentPage } = usePagination(sortedData, pageSize);

  const rows = isPrinting ? sortedData : paginatedVitals;

  return (
    <div>
      <DataTable rows={rows} headers={tableHeaders} size={isTablet ? 'lg' : 'sm'} useZebraStyles>
        {({ rows, headers, getTableProps }) => (
          <TableContainer>
            <Table aria-label="vitals" {...getTableProps()}>
              <TableHead>
                <TableRow>
                  {headers.map((header) => (
                    <TableHeader>{header.header?.content ?? header.header}</TableHeader>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id}>
                    {row?.cells?.map((cell, index) => {
                      const vitalSignInterpretation =
                        paginatedVitals[row.id] && paginatedVitals[row.id][cell.id.substring(2) + 'Interpretation'];

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
