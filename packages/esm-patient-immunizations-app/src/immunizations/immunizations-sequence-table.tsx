import React, { useMemo } from 'react';
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
import { type ImmunizationGrouped } from '../types';
import { formatDate, parseDate } from '@openmrs/esm-framework';
import { immunizationFormSub } from './utils';

interface SequenceTableProps {
  immunizationsByVaccine: ImmunizationGrouped;
  launchPatientImmunizationForm: () => void;
}

const SequenceTable: React.FC<SequenceTableProps> = ({ immunizationsByVaccine, launchPatientImmunizationForm }) => {
  const { t } = useTranslation();
  const { existingDoses, sequences, vaccineUuid } = immunizationsByVaccine;

  const tableHeader = useMemo(
    () => [
      { key: 'sequence', header: sequences.length ? t('sequence', 'Sequence') : t('doseNumber', 'Dose Number') },
      { key: 'vaccinationDate', header: t('vaccinationDate', 'Vaccination Date') },
      { key: 'expirationDate', header: t('expirationDate', 'Expiration Date') },
      { key: 'edit', header: '' },
    ],
    [t],
  );

  const tableRows = existingDoses?.map((dose) => {
    return {
      id: dose?.immunizationObsUuid,
      sequence: isEmpty(sequences)
        ? dose.doseNumber || 0
        : sequences?.find((s) => s.sequenceNumber === dose.doseNumber).sequenceLabel || dose.doseNumber,
      vaccinationDate: dose?.occurrenceDateTime && formatDate(new Date(dose.occurrenceDateTime)),
      expirationDate: dose?.expirationDate && formatDate(new Date(dose.expirationDate), { noToday: true }),
      edit: (
        <Button
          kind="ghost"
          iconDescription="Edit"
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
          {t('edit', 'Edit')}
        </Button>
      ),
    };
  });

  return (
    tableRows.length > 0 && (
      <DataTable rows={tableRows} headers={tableHeader} useZebraStyles>
        {({ rows, headers, getHeaderProps, getTableProps }) => (
          <TableContainer>
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
                        <TableCell key={cell?.id}>{cell?.value}</TableCell>
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
