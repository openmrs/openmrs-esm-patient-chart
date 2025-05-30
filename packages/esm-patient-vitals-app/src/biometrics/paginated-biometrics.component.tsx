import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DataTable,
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
import type { BiometricsTableHeader, BiometricsTableRow } from './types';
import { VitalsAndBiometricsActionMenu } from '../components/action-menu/vitals-biometrics-action-menu.component';
import styles from './paginated-biometrics.scss';

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

  const { t } = useTranslation();

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
    <>
      <DataTable
        headers={tableHeaders}
        isSortable
        overflowMenuOnHover={!isTablet}
        rows={paginatedBiometrics}
        size={isTablet ? 'lg' : 'sm'}
        sortRow={handleSorting}
        useZebraStyles
      >
        {({ getHeaderProps, getTableProps, headers, rows }) => (
          <TableContainer className={styles.tableContainer}>
            <Table aria-label="biometrics" className={styles.table} {...getTableProps()}>
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
                  <TableHeader aria-label={t('actions', 'Actions')} />
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.cells.map((cell) => (
                      <TableCell key={cell.id}>{cell.value?.content ?? cell.value}</TableCell>
                    ))}
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
      <PatientChartPagination
        currentItems={paginatedBiometrics.length}
        dashboardLinkLabel={urlLabel}
        dashboardLinkUrl={pageUrl}
        onPageNumberChange={({ page }) => goTo(page)}
        pageNumber={currentPage}
        pageSize={pageSize}
        totalItems={tableRows.length}
      />
    </>
  );
};

export default PaginatedBiometrics;
