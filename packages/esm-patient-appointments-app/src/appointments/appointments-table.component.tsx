import React, { useMemo } from 'react';
import dayjs from 'dayjs';
const utc = require('dayjs/plugin/utc');
dayjs.extend(utc);
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
  DataTableHeader,
} from '@carbon/react';
import { PatientChartPagination } from '@openmrs/esm-patient-common-lib';
import { formatDatetime, parseDate, usePagination } from '@openmrs/esm-framework';
import { Appointment } from '../types';
import styles from './appointments-table.scss';

const pageSize = 5;

interface AppointmentTableProps {
  patientAppointments: Array<Appointment>;
}

const AppointmentsTable: React.FC<AppointmentTableProps> = ({ patientAppointments }) => {
  const { t } = useTranslation();
  const { results: paginatedAppointments, currentPage, goTo } = usePagination(patientAppointments, pageSize);

  const tableHeaders: Array<DataTableHeader> = useMemo(
    () => [
      { key: 'date', header: t('date', 'Date') },
      { key: 'location', header: t('location', 'Location') },
      { key: 'service', header: t('service', 'Service') },
    ],
    [t],
  );

  const tableRows = useMemo(
    () =>
      paginatedAppointments?.map((appointment) => {
        return {
          id: appointment.uuid,
          date: formatDatetime(parseDate(appointment.startDateTime), { mode: 'wide' }),
          location: appointment.location.name,
          service: appointment.service.name,
        };
      }),
    [paginatedAppointments],
  );

  return (
    <div>
      <TableContainer>
        <DataTable rows={tableRows} headers={tableHeaders} isSortable={true} size="sm">
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
        currentItems={paginatedAppointments.length}
        totalItems={patientAppointments.length}
        onPageNumberChange={({ page }) => goTo(page)}
        pageNumber={currentPage}
        pageSize={pageSize}
      />
    </div>
  );
};

export default AppointmentsTable;
