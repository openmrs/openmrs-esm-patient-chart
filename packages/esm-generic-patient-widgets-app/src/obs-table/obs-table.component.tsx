import React from 'react';
import styles from './obs-table.scss';
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
import { usePagination, useConfig } from '@openmrs/esm-framework';
import { PatientChartPagination } from '@openmrs/esm-patient-common-lib';
import { useObs } from '../resources/useObs';
import dayjs from 'dayjs';

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
          date: dayjs(obss[0].issued).format(`DD - MMM - YYYY, hh:mm`),
        };
        for (let obs of obss) {
          rowData[obs.conceptUuid] = obs.valueQuantity.value;
        }
        return rowData;
      }),
    [obssByDate],
  );

  const { results, goTo, currentPage } = usePagination(tableRows, config.table.pageSize);

  return (
    <div>
      <TableContainer>
        <DataTable rows={results} headers={tableHeaders} isSortable={true} size="short">
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
        currentItems={results.length}
        pageSize={config.table.pageSize}
        onPageNumberChange={({ page }) => goTo(page)}
      />
    </div>
  );
};

export default ObsTable;
