import React, { type ComponentProps, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { isEmpty } from 'lodash-es';
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
import { EditIcon, formatDate, getCoreTranslation, parseDate } from '@openmrs/esm-framework';
import { immunizationFormSub } from '../utils';
import { type ImmunizationGrouped } from '../../types';
import styles from './immunizations-sequence-table.scss';

interface SequenceTableProps {
  immunizationsByVaccine: ImmunizationGrouped;
  launchPatientImmunizationForm: () => void;
}

const SequenceTable: React.FC<SequenceTableProps> = ({ immunizationsByVaccine, launchPatientImmunizationForm }) => {
  const { t } = useTranslation();
  const { existingDoses, sequences, vaccineUuid } = immunizationsByVaccine;

  const tableHeaders = useMemo(
    () => [
      { key: 'sequence', header: sequences.length ? t('sequence', 'Sequence') : t('doseNumber', 'Dose number') },
      { key: 'vaccinationDate', header: t('vaccinationDate', 'Vaccination date') },
      { key: 'expirationDate', header: t('expirationDate', 'Expiration date') },
      { key: 'edit', header: '' },
    ],
    [t, sequences.length],
  );

  const tableRows = existingDoses?.map((dose) => {
    return {
      id: dose?.immunizationObsUuid,
      sequence: isEmpty(sequences)
        ? dose.doseNumber || 0
        : sequences?.find((s) => s.sequenceNumber === dose.doseNumber).sequenceLabel || dose.doseNumber,
      vaccinationDate: dose?.occurrenceDateTime && formatDate(parseDate(dose.occurrenceDateTime), { noToday: true }),
      expirationDate: dose?.expirationDate && formatDate(parseDate(dose.expirationDate), { noToday: true }),
      edit: (
        <Button
          kind="ghost"
          iconDescription={getCoreTranslation('edit', 'Edit')}
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
          {getCoreTranslation('edit', 'Edit')}
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
