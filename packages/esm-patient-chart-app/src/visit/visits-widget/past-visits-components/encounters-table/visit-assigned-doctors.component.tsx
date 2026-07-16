import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DataTable,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  TableContainer,
} from '@carbon/react';
import { formatDatetime, parseDate, type Visit } from '@openmrs/esm-framework';
import { EmptyState } from '@openmrs/esm-patient-common-lib';

// UUID of the "Assigned Doctor" VisitAttributeType.
// Filtering by uuid (not display text) so this keeps working if the
// attribute type's display label is renamed/translated in AdminUI.
export const ASSIGNED_DOCTOR_ATTRIBUTE_TYPE_UUID = 'e965fdc6-42c1-4167-9dfe-0b3865a6d2e6';

interface VisitAssignedDoctorsTableProps {
  visit: Visit;
}

interface AssignedDoctorRow {
  id: string;
  doctorName: string;
  assignedDate: string;
  rawDate: Date;
}

/**
 * Shows the doctor(s) assigned to a single visit, sourced from the
 * "Assigned Doctor" visit_attribute. A visit can have more than one
 * assigned doctor (e.g. a co-consult or handover), so this renders as
 * a flat table of Doctor | Assigned Date, ordered by assignment time.
 */
const VisitAssignedDoctorsTable: React.FC<VisitAssignedDoctorsTableProps> = ({ visit }) => {
  const { t } = useTranslation();

  const assignedDoctorRows: Array<AssignedDoctorRow> = useMemo(() => {
    const attributes = visit?.attributes ?? [];

    return attributes
      .filter((attribute) => attribute?.attributeType?.uuid === ASSIGNED_DOCTOR_ATTRIBUTE_TYPE_UUID)
      .filter((attribute) => !attribute?.voided)
      .map((attribute) => {
        const rawDate = attribute?.dateCreated ? parseDate(attribute.dateCreated) : null;
        return {
          id: attribute.uuid,
          // value.display is typically "admin - Super User"; fall back to
          // value.person.display in case a config returns a bare provider.
          doctorName: attribute?.value?.person?.display ?? attribute?.value?.display ??  '--',
          assignedDate: rawDate ? formatDatetime(rawDate, { mode: 'wide' }) : '--',
          rawDate,
        };
      })
      .sort((a, b) => (a.rawDate && b.rawDate ? a.rawDate.getTime() - b.rawDate.getTime() : 0));
  }, [visit]);

  const headers = [
    { key: 'doctorName', header: t('assignedDoctor', 'Assigned doctor') },
    { key: 'assignedDate', header: t('assignedDate', 'Assigned date') },
  ];

  if (assignedDoctorRows.length === 0) {
    return (
      <EmptyState
        displayText={t('assignedDoctors', 'assigned doctors')}
        headerTitle={t('assignedDoctors', 'Assigned doctors')}
      />
    );
  }

  return (
    <div>
      <DataTable rows={assignedDoctorRows} headers={headers} size="sm" useZebraStyles>
        {({ rows, headers, getHeaderProps, getRowProps, getTableProps, getTableContainerProps }) => (
          <TableContainer {...getTableContainerProps()}>
            <Table {...getTableProps()} aria-label={t('assignedDoctors', 'Assigned doctors')}>
              <TableHead>
                <TableRow>
                  {headers.map((header) => (
                    <TableHeader key={header.key} {...getHeaderProps({ header })}>
                      {header.header}
                    </TableHeader>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id} {...getRowProps({ row })}>
                    {row.cells.map((cell) => (
                      <TableCell key={cell.id}>{cell.value}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DataTable>
    </div>
  );
};

export default VisitAssignedDoctorsTable;