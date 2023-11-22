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
import { useLayoutType, usePagination } from '@openmrs/esm-framework';
import { PatientChartPagination } from '@openmrs/esm-patient-common-lib';

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
  const { results: paginatedBiometrics, goTo, currentPage } = usePagination(tableRows, pageSize);
  const isTablet = useLayoutType() === 'tablet';

  return (
    <div>
      <DataTable rows={paginatedBiometrics} headers={tableHeaders} size={isTablet ? 'lg' : 'sm'} useZebraStyles>
        {({ rows, headers, getHeaderProps, getTableProps }) => (
          <TableContainer>
            <Table aria-label="biometrics" {...getTableProps()}>
              <TableHead>
                <TableRow>
                  {headers.map((header) => (
                    <TableHeader
                      {...getHeaderProps({
                        header,
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
