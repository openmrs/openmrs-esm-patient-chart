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
  type DataTableSortState,
} from '@carbon/react';
import { NumericObservation, useLayoutType, usePagination } from '@openmrs/esm-framework';
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
  patient: fhir.Patient;
  patientUuid: string;
}

const PaginatedBiometrics: React.FC<PaginatedBiometricsProps> = ({
  tableRows,
  pageSize,
  pageUrl,
  urlLabel,
  tableHeaders,
  patient,
  patientUuid,
}) => {
  const isTablet = useLayoutType() === 'tablet';

  const { t } = useTranslation();

  const [sortParams, setSortParams] = useState<{ key: string; sortDirection: 'ASC' | 'DESC' | 'NONE' }>({
    key: '',
    sortDirection: 'NONE',
  });

  const handleSorting = (
    cellA: any,
    cellB: any,
    { key, sortDirection }: { key: string; sortDirection: DataTableSortState },
  ) => {
    if (sortDirection === 'NONE') {
      setSortParams({ key: '', sortDirection });
    } else {
      setSortParams({ key, sortDirection });
    }
    return 0;
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

  const headerByKey = useMemo(
    () => new Map<string, BiometricsTableHeader>(tableHeaders.map((h) => [h.key, h])),
    [tableHeaders],
  );

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
                      })}
                    >
                      {header.header}
                    </TableHeader>
                  ))}
                  <TableHeader aria-label={t('actions', 'Actions')} />
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => {
                  const biometricsObj = paginatedBiometrics.find((obj) => obj.id === row.id);

                  return (
                    <TableRow key={row.id}>
                      {row.cells.map((cell) => {
                        if (cell.info.header === 'dateRender') {
                          return <TableCell key={cell.id}>{cell.value?.content ?? cell.value}</TableCell>;
                        }

                        const interpretationKey = cell.info.header + 'Interpretation';
                        const interpretation = biometricsObj?.[interpretationKey];
                        const conceptUuid = headerByKey.get(cell.info.header)?.conceptUuid;
                        const rawValue = cell.value?.content ?? cell.value;

                        return (
                          <TableCell key={cell.id} className={styles.numericObsCell}>
                            <NumericObservation
                              value={rawValue}
                              interpretation={interpretation}
                              conceptUuid={conceptUuid}
                              patientUuid={patientUuid}
                              variant="cell"
                            />
                          </TableCell>
                        );
                      })}
                      <TableCell className="cds--table-column-menu" id="actions">
                        <VitalsAndBiometricsActionMenu patient={patient} encounterUuid={row.id} />
                      </TableCell>
                    </TableRow>
                  );
                })}
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
