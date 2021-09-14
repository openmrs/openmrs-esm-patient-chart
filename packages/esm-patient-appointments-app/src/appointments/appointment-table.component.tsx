import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Appointment } from '../types';
import DataTable, {
  Table,
  TableCell,
  TableContainer,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  DataTableHeader,
} from 'carbon-components-react/es/components/DataTable';
import styles from './appointment-table.component.scss';
import dayjs from 'dayjs';
import { PatientChartPagination } from '@openmrs/esm-patient-common-lib';
import { usePagination } from '@openmrs/esm-framework';

const pageSize = 5;

interface AppointmentTableProps {
  patientAppointments: Array<Appointment>;
}

const AppointmentTable: React.FC<AppointmentTableProps> = ({ patientAppointments = [] }) => {
  const { t } = useTranslation();
  const { results, currentPage, goTo } = usePagination(patientAppointments, pageSize);
  const tableHeader: Array<DataTableHeader> = useMemo(
    () => [
      { key: 'date', header: t('date', 'Date') },
      { key: 'location', header: t('location', 'Location') },
      { key: 'service', header: t('service', 'Service') },
    ],
    [t],
  );

  const tableRows = useMemo(
    () =>
      results.map((appointment) => {
        return {
          id: `${appointment.uuid}`,
          date: dayjs((appointment.startDateTime / 1000) * 1000).format('DD - MMM -YYYY , HH:MM'),
          location: appointment.location.name,
          service: appointment.service.name,
        };
      }),
    [results],
  );

  return (
    <div>
      <TableContainer>
        <DataTable rows={tableRows} headers={tableHeader} isSortable={true} size="short">
          {({ rows, headers, getHeaderProps, getTableProps }) => (
            <Table {...getTableProps()} useZebraStyles>
              <TableHead>
                <TableRow>
                  {headers.map((header) => (
                    <TableHeader
                      className={`${styles.productiveHeading01} ${styles.text02}`}
                      {...getHeaderProps({
                        header,
                        isSortable: header.isSortable,
                      })}>
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
        currentItems={results.length}
        totalItems={patientAppointments.length}
        onPageNumberChange={({ page }) => goTo(page)}
        pageNumber={currentPage}
        pageSize={pageSize}
      />
    </div>
  );
};

export default AppointmentTable;
