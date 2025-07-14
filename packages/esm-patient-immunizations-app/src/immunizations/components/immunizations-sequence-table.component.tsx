import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DataTable,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
} from '@carbon/react';
import {
  EditIcon,
  formatDate,
  getCoreTranslation,
  parseDate,
  showModal,
  TrashCanIcon,
  useLayoutType,
} from '@openmrs/esm-framework';
import { immunizationFormSub } from '../utils';
import { type ImmunizationGrouped } from '../../types';
import styles from './immunizations-sequence-table.scss';

interface SequenceTableProps {
  immunizationsByVaccine: ImmunizationGrouped;
  launchPatientImmunizationForm: () => void;
  patientUuid: string;
}

interface DeleteImmunizationParams {
  doseNumber: number;
  immunizationId: string;
  vaccineUuid: string;
}

const SequenceTable: React.FC<SequenceTableProps> = ({
  immunizationsByVaccine,
  launchPatientImmunizationForm,
  patientUuid,
}) => {
  const { t } = useTranslation();
  const { existingDoses, sequences, vaccineUuid } = immunizationsByVaccine;
  const isTablet = useLayoutType() === 'tablet';
  const responsiveSize = isTablet ? 'md' : 'sm';

  const tableHeaders = useMemo(
    () => [
      {
        key: 'sequence',
        header: sequences.length ? t('sequence', 'Sequence') : t('doseNumberWithinSeries', 'Dose number within series'),
      },
      { key: 'vaccinationDate', header: t('vaccinationDate', 'Vaccination date') },
      { key: 'expirationDate', header: t('expirationDate', 'Expiration Date') },
      { key: 'actions', header: t('actions', 'Actions') },
    ],
    [t, sequences.length],
  );

  const handleDeleteImmunization = ({ doseNumber, immunizationId, vaccineUuid }: DeleteImmunizationParams) => {
    const dispose = showModal('immunization-delete-confirmation-modal', {
      doseNumber,
      immunizationId,
      patientUuid,
      vaccineUuid,
      close: () => dispose?.(),
    });
  };

  const tableRows = existingDoses?.map((dose) => ({
    id: dose?.immunizationObsUuid,
    sequence: !sequences.length
      ? dose.doseNumber || 0
      : sequences?.find((s) => s.sequenceNumber === dose.doseNumber)?.sequenceLabel || dose.doseNumber,
    vaccinationDate: dose?.occurrenceDateTime && formatDate(new Date(dose.occurrenceDateTime)),
    expirationDate: (dose?.expirationDate && formatDate(new Date(dose.expirationDate), { noToday: true })) || '--',
    actions: (
      <div className={styles.actionButtons}>
        <IconButton
          kind="ghost"
          label={getCoreTranslation('edit')}
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
          size={responsiveSize}
        >
          <EditIcon size={16} />
        </IconButton>
        <IconButton
          kind="ghost"
          label={getCoreTranslation('delete')}
          onClick={() =>
            handleDeleteImmunization({
              doseNumber: dose.doseNumber,
              immunizationId: dose.immunizationObsUuid,
              vaccineUuid,
            })
          }
          size={responsiveSize}
        >
          <TrashCanIcon size={16} />
        </IconButton>
      </div>
    ),
  }));

  if (tableRows?.length) {
    return (
      <DataTable rows={tableRows} headers={tableHeaders} useZebraStyles>
        {({ rows, headers, getHeaderProps, getTableProps, getRowProps }) => (
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
                    <TableRow key={row.id} {...getRowProps({ row })}>
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
    );
  }
};

export default SequenceTable;
