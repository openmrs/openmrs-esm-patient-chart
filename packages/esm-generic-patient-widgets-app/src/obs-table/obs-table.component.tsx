import React, { useMemo, useState, useCallback } from 'react';
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
import { usePagination, useConfig, formatDatetime, formatDate, formatTime } from '@openmrs/esm-framework';
import { PatientChartPagination } from '@openmrs/esm-patient-common-lib';
import { useObs } from '../resources/useObs';
import styles from './obs-table.scss';
import { useTranslation } from 'react-i18next';
import { type ConfigObjectSwitchable } from '../config-schema-obs-switchable';

interface ObsTableProps {
  patientUuid: string;
}

interface Row {
  id: string;
  date: string;
  rawDate: string;
  encounter: string;
  [conceptUuid: string]: string | number;
}

interface Header {
  key: string;
  header: string;
  sortFunc: (rowA: Row, rowB: Row) => number;
}

const ObsTable: React.FC<ObsTableProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const config = useConfig<ConfigObjectSwitchable>();
  const {
    data: { observations, concepts },
  } = useObs(patientUuid);

  const uniqueEncounterReferences = [...new Set(observations.map((o) => o.encounter.reference))].sort();
  const obssGroupedByEncounters = uniqueEncounterReferences.map((reference) =>
    observations.filter((o) => o.encounter.reference === reference),
  );

  const tableHeaders: Array<Header> = useMemo(() => {
    const headers: Array<Header> = [
      {
        key: 'date',
        header: t('dateAndTime', 'Date and time'),
        sortFunc: (rowA: Row, rowB: Row) =>
          new Date(rowA.rawDate).getTime() < new Date(rowB.rawDate).getTime() ? 1 : -1,
      },
    ];
    if (config.showEncounterType) {
      headers.splice(1, 0, {
        key: 'encounter',
        header: t('encounterType', 'Encounter type'),
        sortFunc: (rowA: Row, rowB: Row) => rowA.encounter.localeCompare(rowB.encounter) as 1 | -1,
      });
    }
    headers.push(
      ...config.data.map(({ concept, label }) => ({
        key: concept,
        header: label || concepts.find((c) => c.uuid == concept)?.display,
        sortFunc: (rowA: Row, rowB: Row) => {
          const a = rowA[concept];
          const b = rowB[concept];
          if (a === b) {
            return 0;
          }
          if (a == null) {
            return 1;
          }
          if (b == null) {
            return -1;
          }
          return a < b ? 1 : -1;
        },
      })),
    );
    return headers;
  }, [t, config.data, config.showEncounterType, concepts]);

  const tableRows: Array<Row> = React.useMemo(
    () =>
      obssGroupedByEncounters?.map((obss, index) => {
        const rowData = {
          id: `${index}`,
          date: formatDatetime(new Date(obss[0].effectiveDateTime), { mode: 'wide' }),
          rawDate: obss[0].effectiveDateTime,
          encounter: obss[0].encounter.name,
        };

        for (const obs of obss) {
          switch (obs.dataType) {
            case 'Text':
              rowData[obs.conceptUuid] = obs.valueString;
              break;

            case 'Numeric': {
              const decimalPlaces: number | undefined = config.data.find(
                (ele: any) => ele.concept === obs.conceptUuid,
              )?.decimalPlaces;

              if (obs.valueQuantity?.value % 1 !== 0) {
                if (decimalPlaces > 0) {
                  rowData[obs.conceptUuid] = obs.valueQuantity?.value.toFixed(decimalPlaces);
                } else {
                  rowData[obs.conceptUuid] = obs.valueQuantity?.value.toFixed(2);
                }
              } else {
                rowData[obs.conceptUuid] = obs.valueQuantity?.value;
              }
              break;
            }

            case 'Coded':
              rowData[obs.conceptUuid] = obs.valueCodeableConcept?.coding[0]?.display;
              break;

            case 'DateTime':
              if (config?.dateFormat === 'dateTime') {
                rowData[obs.conceptUuid] = formatDatetime(new Date(obs.valueDateTime), { mode: 'standard' });
              } else if (config?.dateFormat === 'time') {
                rowData[obs.conceptUuid] = formatTime(new Date(obs.valueDateTime));
              } else if (config?.dateFormat === 'date') {
                rowData[obs.conceptUuid] = formatDate(new Date(obs.valueDateTime), { mode: 'standard' });
              } else {
                //maintain the default behavior
                rowData[obs.conceptUuid] = formatDatetime(new Date(obs.valueDateTime), { mode: 'standard' });
              }

              break;
          }
        }

        return rowData;
      }),
    [config.data, config?.dateFormat, obssGroupedByEncounters],
  );

  const [sortParams, setSortParams] = useState<{ key: string; sortDirection: 'ASC' | 'DESC' | 'NONE' }>({
    key: 'date',
    sortDirection: config.tableSortOldestFirst ? 'ASC' : 'DESC',
  });

  const handleSorting = useCallback(
    (cellA: any, cellB: any, { key, sortDirection }: { key: string; sortDirection: DataTableSortState }) => {
      // Use setTimeout to avoid setState during render
      setTimeout(() => {
        if (sortDirection === 'NONE') {
          setSortParams({ key: '', sortDirection });
        } else {
          setSortParams({ key, sortDirection });
        }
      }, 0);
      return 0;
    },
    [],
  );

  const sortedData: Array<any> = useMemo(() => {
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

  const { results, goTo, currentPage } = usePagination(sortedData, config.table.pageSize);

  return (
    <div>
      <DataTable rows={results} headers={tableHeaders} isSortable sortRow={handleSorting} size="sm" useZebraStyles>
        {({ rows, headers, getHeaderProps, getTableProps }) => (
          <TableContainer>
            <Table {...getTableProps()} className={styles.customRow}>
              <TableHead>
                <TableRow>
                  {headers.map((header) => (
                    <TableHeader
                      className={styles.tableHeader}
                      {...getHeaderProps({
                        header,
                      })}
                    >
                      {header.header}
                    </TableHeader>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.cells.map((cell) => (
                      <TableCell key={cell.id}>{cell.value?.content ?? cell.value ?? '--'}</TableCell>
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
        totalItems={sortedData.length}
        currentItems={results.length}
        pageSize={config.table.pageSize}
        onPageNumberChange={({ page }) => goTo(page)}
      />
    </div>
  );
};

export default ObsTable;
