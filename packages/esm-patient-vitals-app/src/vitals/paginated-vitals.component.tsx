import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DataTable,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableExpandedRow,
  TableExpandHeader,
  TableExpandRow,
  TableHead,
  TableHeader,
  TableRow,
  type DataTableSortState,
} from '@carbon/react';
import { NumericObservation, useLayoutType, usePagination } from '@openmrs/esm-framework';
import { PatientChartPagination } from '@openmrs/esm-patient-common-lib';
import type { VitalsTableHeader, VitalsTableRow } from './types';
import { VitalsAndBiometricsActionMenu } from '../components/action-menu/vitals-biometrics-action-menu.component';
import styles from './paginated-vitals.scss';

interface PaginatedVitalsProps {
  isPrinting?: boolean;
  pageSize: number;
  pageUrl: string;
  patientUuid: string;
  tableHeaders: Array<VitalsTableHeader>;
  tableRows: Array<VitalsTableRow>;
  urlLabel: string;
  patient: fhir.Patient;
}

const PaginatedVitals: React.FC<PaginatedVitalsProps> = ({
  isPrinting,
  pageSize,
  pageUrl,
  patientUuid,
  tableHeaders,
  tableRows,
  urlLabel,
  patient,
}) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';

  const [sortParams, setSortParams] = useState<{ key: string; sortDirection: 'ASC' | 'DESC' | 'NONE' }>({
    key: '',
    sortDirection: 'NONE',
  });

  const handleSorting = (
    _cellA: any,
    _cellB: any,
    { key, sortDirection }: { key: string; sortDirection: DataTableSortState },
  ) => {
    if (sortDirection === 'NONE') {
      setSortParams({ key: '', sortDirection });
    } else {
      setSortParams({ key, sortDirection });
    }
    return 0;
  };

  const sortedData: Array<VitalsTableRow> = useMemo(() => {
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
  }, [tableHeaders, tableRows, sortParams]);

  const { results: paginatedVitals, goTo, currentPage } = usePagination(sortedData, pageSize);

  const headerByKey = useMemo(
    () => new Map<string, VitalsTableHeader>(tableHeaders.map((h) => [h.key, h])),
    [tableHeaders],
  );

  const displayedRows = isPrinting ? sortedData : paginatedVitals;
  const hasAnyNotes = tableRows.some((row) => Boolean(row.note));

  return (
    <>
      <DataTable
        headers={tableHeaders}
        isSortable
        overflowMenuOnHover={!isTablet}
        rows={displayedRows}
        size={isTablet ? 'lg' : 'sm'}
        sortRow={handleSorting}
        useZebraStyles
      >
        {({ rows, headers, getTableProps, getHeaderProps, getExpandHeaderProps, getRowProps, getExpandedRowProps }) => (
          <TableContainer className={styles.tableContainer}>
            <Table aria-label="vitals" className={styles.table} {...getTableProps()}>
              <TableHead>
                <TableRow>
                  {hasAnyNotes && <TableExpandHeader {...getExpandHeaderProps()} />}
                  {headers.map((header) => (
                    <TableHeader {...getHeaderProps({ header })} key={header.key}>
                      {header.header}
                    </TableHeader>
                  ))}
                  <TableHeader aria-label={t('actions', 'Actions')} />
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => {
                  const vitalsObj = displayedRows.find((obj) => obj.id === row.id);
                  const hasNote = Boolean(vitalsObj?.note);

                  if (!hasAnyNotes) {
                    return (
                      <TableRow key={row.id}>
                        {row.cells.map((cell) => {
                          const interpretationKey = cell.info.header + 'Interpretation';
                          const interpretation = vitalsObj?.[interpretationKey];
                          const conceptUuid = headerByKey.get(cell.info.header)?.conceptUuid;

                          return (
                            <TableCell key={`styled-cell-${cell.id}`} className={styles.numericObsCell}>
                              <NumericObservation
                                value={cell.value?.content ?? cell.value}
                                interpretation={interpretation}
                                conceptUuid={conceptUuid}
                                variant="cell"
                                patientUuid={patientUuid}
                              />
                            </TableCell>
                          );
                        })}
                        <TableCell className="cds--table-column-menu" id="actions">
                          <VitalsAndBiometricsActionMenu patient={patient} encounterUuid={row.id} />
                        </TableCell>
                      </TableRow>
                    );
                  }

                  return (
                    <React.Fragment key={row.id}>
                      <TableExpandRow
                        {...getRowProps({ row })}
                        className={!hasNote ? styles.noNoteRow : undefined}
                        isExpanded={hasNote ? isPrinting || row.isExpanded : false}
                      >
                        {row.cells.map((cell) => {
                          const conceptUuid = headerByKey.get(cell.info.header)?.conceptUuid;
                          const interpretationKey = cell.info.header + 'Interpretation';
                          const interpretation = vitalsObj?.[interpretationKey];

                          return (
                            <TableCell key={`styled-cell-${cell.id}`} className={styles.numericObsCell}>
                              <NumericObservation
                                value={cell.value?.content ?? cell.value}
                                interpretation={interpretation}
                                conceptUuid={conceptUuid}
                                variant="cell"
                                patientUuid={patientUuid}
                              />
                            </TableCell>
                          );
                        })}
                        <TableCell className="cds--table-column-menu" id="actions">
                          <VitalsAndBiometricsActionMenu patient={patient} encounterUuid={row.id} />
                        </TableCell>
                      </TableExpandRow>
                      {(isPrinting || row.isExpanded) && hasNote ? (
                        <TableExpandedRow
                          className={styles.expandedRow}
                          colSpan={headers.length + 2}
                          {...getExpandedRowProps({ row })}
                        >
                          <div className={styles.container}>
                            <div className={styles.copy}>
                              <span className={styles.content}>{vitalsObj.note}</span>
                            </div>
                          </div>
                        </TableExpandedRow>
                      ) : (
                        <TableExpandedRow className={styles.hiddenRow} colSpan={headers.length + 2} />
                      )}
                    </React.Fragment>
                  );
                })}
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
    </>
  );
};

export default PaginatedVitals;
