import React, { type ComponentProps, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import isEmpty from 'lodash-es/isEmpty';
import {
  Button,
  DataTable,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
} from '@carbon/react';
import { EditIcon, formatDate, parseDate, TrashCanIcon, showModal } from '@openmrs/esm-framework';
import { type ImmunizationGrouped } from '../../types';
import { immunizationFormSub } from '../utils';
import styles from './immunizations-sequence-table.scss';

interface SequenceTableProps {
  immunizationsByVaccine: ImmunizationGrouped;
  launchPatientImmunizationForm: () => void;
}

const SequenceTable: React.FC<SequenceTableProps> = ({ immunizationsByVaccine, launchPatientImmunizationForm }) => {
  const { t } = useTranslation();
  const { sequences, vaccineUuid } = immunizationsByVaccine;

  const [doses, setDoses] = useState(immunizationsByVaccine.existingDoses);

  const tableHeader = useMemo(
    () => [
      { key: 'sequence', header: sequences.length ? t('sequence', 'Sequence') : t('doseNumber', 'Dose number') },
      { key: 'vaccinationDate', header: t('vaccinationDate', 'Vaccination date') },
      { key: 'expirationDate', header: t('expirationDate', 'Expiration date') },
      { key: 'edit', header: '' },
    ],
    [t, sequences.length],
  );

  const tableRows = doses.map((dose) => ({
    id: dose.immunizationObsUuid,
    sequence: isEmpty(sequences)
      ? dose.doseNumber || 0
      : sequences.find((s) => s.sequenceNumber === dose.doseNumber)?.sequenceLabel || dose.doseNumber,
    vaccinationDate: dose.occurrenceDateTime && formatDate(new Date(dose.occurrenceDateTime)),
    expirationDate: dose.expirationDate && formatDate(new Date(dose.expirationDate), { noToday: true }),
    edit: (
      <>
        <Button
          kind="ghost"
          iconDescription={t('edit', 'Edit')}
          renderIcon={(props: ComponentProps<typeof EditIcon>) => <EditIcon size={16} {...props} />}
          onClick={() => {
            immunizationFormSub.next({
              vaccineUuid,
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
          {t('edit', 'Edit')}
        </Button>
        <Button
          kind="ghost"
          iconDescription={t('delete', 'Delete')}
          renderIcon={(props: ComponentProps<typeof TrashCanIcon>) => <TrashCanIcon size={16} {...props} />}
          onClick={() => {
            const dispose = showModal('delete-dose-modal', {
              onClose: () => dispose(),
              onConfirm: () => {
                setDoses((prev) => prev.filter((d) => d.immunizationObsUuid !== dose.immunizationObsUuid));
                dispose();
              },
              itemLabel: 'dose',
            });
          }}
        />
      </>
    ),
  }));

  return (
    <>
      {tableRows.length > 0 && (
        <DataTable rows={tableRows} headers={tableHeader} useZebraStyles>
          {({ rows, headers, getHeaderProps, getTableProps }) => (
            <TableContainer className={styles.sequenceTable}>
              <Table {...getTableProps()}>
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
                    <TableRow key={row.id}>
                      {row.cells.map((cell) => (
                        <TableCell key={cell.id} className={styles.tableCell}>
                          {cell.value}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DataTable>
      )}
    </>
  );
};

export default SequenceTable;
