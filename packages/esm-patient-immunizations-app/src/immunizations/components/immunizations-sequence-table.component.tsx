import {
  Button,
  DataTable,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
} from '@carbon/react';
import { EditIcon, formatDate, getCoreTranslation, parseDate, showModal, TrashCanIcon } from '@openmrs/esm-framework';
import { isEmpty } from 'lodash-es';
import React, { type ComponentProps, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { type ImmunizationGrouped } from '../../types';
import { immunizationFormSub } from '../utils';
import styles from './immunizations-sequence-table.scss';

interface SequenceTableProps {
  immunizationsByVaccine: ImmunizationGrouped;
  launchPatientImmunizationForm: () => void;
  patientUuid: string;
}

const SequenceTable: React.FC<SequenceTableProps> = ({
  immunizationsByVaccine,
  launchPatientImmunizationForm,
  patientUuid,
}) => {
  const { t } = useTranslation();
  const { existingDoses, sequences, vaccineUuid } = immunizationsByVaccine;

  const tableHeaders = useMemo(
    () => [
      { key: 'sequence', header: sequences.length ? t('sequence', 'Sequence') : t('doseNumber', 'Dose number') },
      { key: 'vaccinationDate', header: t('vaccinationDate', 'Vaccination date') },
      { key: 'expirationDate', header: t('expirationDate', 'Expiration date') },
      { key: 'edit', header: getCoreTranslation('edit') },
      { key: 'delete', header: getCoreTranslation('delete') },
    ],
    [t, sequences.length],
  );

  const ConfirmDelete = (immunizationId: string, vaccineUuid: string, doseNumber: number) => {
    const dispose = showModal('immunization-delete-confirmation-modal', {
      patientUuid,
      immunizationId,
      doseNumber,
      vaccineUuid,
      close: () => {
        dispose?.();
      },
    });
  };
  const tableRows = existingDoses?.map((dose) => {
    return {
      id: dose?.immunizationObsUuid,
      sequence: isEmpty(sequences)
        ? dose.doseNumber || 0
        : sequences?.find((s) => s.sequenceNumber === dose.doseNumber).sequenceLabel || dose.doseNumber,
      vaccinationDate: dose?.occurrenceDateTime && formatDate(new Date(dose.occurrenceDateTime)),
      expirationDate: (dose?.expirationDate && formatDate(new Date(dose.expirationDate), { noToday: true })) || '--',
      edit: (
        <Button
          kind="ghost"
          iconDescription={getCoreTranslation('edit')}
          renderIcon={(props: ComponentProps<typeof EditIcon>) => <EditIcon size={16} {...props} />}
          onClick={() => {
            immunizationFormSub.next({
              vaccineUuid: vaccineUuid,
              immunizationId: dose.immunizationObsUuid,
              vaccinationDate: dose.occurrenceDateTime && parseDate(dose.occurrenceDateTime),
              doseNumber: dose.doseNumber,
              expirationDate: dose.expirationDate && parseDate(dose.expirationDate),
              lotNumber: dose.lotNumber,
              manufacturer: dose.manufacturer,
              visitId: dose.visitUuid,
            });
            launchPatientImmunizationForm();
          }}
        >
          {getCoreTranslation('edit')}
        </Button>
      ),
      delete: (
        <Button
          kind="ghost"
          className={styles.deleteButton}
          iconDescription={getCoreTranslation('delete')}
          renderIcon={(props: ComponentProps<typeof TrashCanIcon>) => <TrashCanIcon size={16} {...props} />}
          onClick={() => ConfirmDelete(dose.immunizationObsUuid, vaccineUuid, dose.doseNumber)}
        >
          {getCoreTranslation('delete')}
        </Button>
      ),
    };
  });

  return (
    tableRows.length > 0 && (
      <DataTable rows={tableRows} headers={tableHeaders} useZebraStyles>
        {({ rows, headers, getHeaderProps, getTableProps }) => (
          <TableContainer className={styles.sequenceTable}>
            <Table {...getTableProps()}>
              <TableHead>
                <TableRow>
                  {headers.map((header) => (
                    <TableHeader {...getHeaderProps({ header })}>{header.header}</TableHeader>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => {
                  return (
                    <TableRow key={row.id}>
                      {row.cells.map((cell) => (
                        <TableCell key={cell?.id} className={styles.tableCell}>
                          {cell?.value}
                        </TableCell>
                      ))}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DataTable>
    )
  );
};

export default SequenceTable;
