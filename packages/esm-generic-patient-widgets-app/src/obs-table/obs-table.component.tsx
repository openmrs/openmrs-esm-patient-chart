import React from 'react';
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
import { usePagination, useConfig, formatDatetime, formatDate, formatTime } from '@openmrs/esm-framework';
import { PatientChartPagination } from '@openmrs/esm-patient-common-lib';
import { useObs } from '../resources/useObs';
import styles from './obs-table.scss';

interface ObsTableProps {
  patientUuid: string;
}

const ObsTable: React.FC<ObsTableProps> = ({ patientUuid }) => {
  const config = useConfig();
  const { data: obss, error, isLoading, isValidating } = useObs(patientUuid);
  const uniqueDates = [...new Set(obss.map((o) => o.issued))].sort();
  const obssByDate = uniqueDates.map((date) => obss.filter((o) => o.issued === date));

  const tableHeaders = [
    { key: 'date', header: 'Date and time', isSortable: true },
    ...config.data.map(({ concept, label }) => ({
      key: concept,
      header: label,
    })),
  ];

  const tableRows = React.useMemo(
    () =>
      obssByDate?.map((obss, index) => {
        const rowData = {
          id: `${index}`,
          date: formatDatetime(new Date(obss[0].effectiveDateTime), { mode: 'wide' }),
        };

        for (const obs of obss) {
          switch (obs.dataType) {
            case 'Text':
              rowData[obs.conceptUuid] = obs.valueString;
              break;

            case 'Number': {
              const decimalPlaces: number | undefined = config.data.find((ele: any) => ele.concept === obs.conceptUuid)
                ?.decimalPlaces;

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
    [config, obssByDate],
  );

  const { results, goTo, currentPage } = usePagination(tableRows, config.table.pageSize);

  return (
    <div>
      <DataTable rows={results} headers={tableHeaders} isSortable size="sm" useZebraStyles>
        {({ rows, headers, getHeaderProps, getTableProps }) => (
          <TableContainer>
            <Table {...getTableProps()} className={styles.customRow}>
              <TableHead>
                <TableRow>
                  {headers.map((header) => (
                    <TableHeader
                      className={`${styles.tableHeader}`}
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
        totalItems={tableRows.length}
        currentItems={results.length}
        pageSize={config.table.pageSize}
        onPageNumberChange={({ page }) => goTo(page)}
      />
    </div>
  );
};

export default ObsTable;
