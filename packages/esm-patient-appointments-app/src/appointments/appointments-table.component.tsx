import React, { useEffect, useMemo } from 'react';
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

const pageSize = 10;

interface AppointmentTableProps {
  patientAppointments: Array<Appointment>;
  switchedView: boolean;
  setSwitchedView: (value: boolean) => void;
}

const AppointmentsTable: React.FC<AppointmentTableProps> = ({ patientAppointments, switchedView, setSwitchedView }) => {
  const { t } = useTranslation();
  const { results: paginatedAppointments, currentPage, goTo } = usePagination(patientAppointments, pageSize);

  useEffect(() => {
    if (switchedView && currentPage !== 1) {
      goTo(1);
    }
  }, [switchedView, goTo, currentPage]);

  const tableHeaders: Array<DataTableHeader> = useMemo(
    () => [
      { key: 'date', header: t('date', 'Date') },
      { key: 'location', header: t('location', 'Location') },
      { key: 'service', header: t('service', 'Service') },
      { key: 'status', header: t('status', 'Status') },
      { key: 'type', header: t('type', 'Type') },
      { key: 'notes', header: t('notes', 'Notes') },
    ],
    [t],
  );

  const tableRows = useMemo(
    () =>
      paginatedAppointments?.map((appointment) => {
        return {
          id: appointment.uuid,
          date: formatDatetime(parseDate(appointment.startDateTime), { mode: 'wide' }),
          location: appointment?.location?.name ?? '—',
          service: appointment.service.name,
          status: appointment.status,
          type: appointment.appointmentKind ?? '—',
          notes: appointment.comments ?? '—',
        };
      }),
    [paginatedAppointments],
  );

  return (
    <div>
      <DataTable rows={tableRows} headers={tableHeaders} isSortable size="sm">
        {({ rows, headers, getHeaderProps, getTableProps }) => (
          <TableContainer>
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
          </TableContainer>
        )}
      </DataTable>
      <PatientChartPagination
        currentItems={paginatedAppointments.length}
        totalItems={patientAppointments.length}
        onPageNumberChange={({ page }) => {
          setSwitchedView(false);
          goTo(page);
        }}
        pageNumber={currentPage}
        pageSize={pageSize}
      />
    </div>
  );
};

export default AppointmentsTable;
