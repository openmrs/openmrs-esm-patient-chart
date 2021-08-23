import React, { useMemo, useCallback } from 'react';
import Button from 'carbon-components-react/lib/components/Button';
import DataTable, {
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
} from 'carbon-components-react/lib/components/DataTable';
import { isEmpty } from 'lodash-es';
import { openWorkspaceTab } from '../../../esm-patient-common-lib/src';
import ImmunizationsForm from './immunizations-form.component';
import { useTranslation } from 'react-i18next';
import { ExistingDoses, Immunization } from '../types';

interface DetailsTableProps {
  immunizations: Immunization;
  patientUuid: string;
}

const InnerTable: React.FC<DetailsTableProps> = ({ immunizations, patientUuid }) => {
  const { t } = useTranslation();

  const editPatientVaccine = useCallback(
    (immunizationFormData: Immunization, existingDoses: ExistingDoses) => {
      const { vaccineName, vaccineUuid, sequences } = immunizationFormData;
      const { sequenceLabel, sequenceNumber } = existingDoses;
      const formHeader = t('immunizationForm', 'Immunization Form');
      return openWorkspaceTab(ImmunizationsForm, formHeader, {
        vaccineName,
        vaccineUuid,
        immunizationObsUuid: existingDoses.immunizationObsUuid,
        manufacturer: existingDoses.manufacturer,
        lotNumber: existingDoses.lotNumber,
        expirationDate: existingDoses.expirationDate,
        sequences,
        currentDose: {
          sequenceLabel,
          sequenceNumber,
        },
        vaccinationDate: existingDoses?.occurrenceDateTime,
      });
    },
    [t],
  );

  const tableHeader = useMemo(
    () => [
      { key: 'sequence', header: t('sequence', 'Sequence') },
      { key: 'vaccinationDate', header: t('vaccinationDate', 'Vaccination Date') },
      { key: 'expirationDate', header: t('expirationDate', 'Expiration Date') },
      { key: 'edit', header: '' },
    ],
    [t],
  );

  const { existingDoses, sequences, vaccineName, vaccineUuid } = immunizations;

  const tableRows = existingDoses?.map((dose, index) => {
    return {
      id: dose?.immunizationObsUuid,
      sequence: isEmpty(sequences) ? t('singleDose', 'Single Dose') : sequences[index]?.sequenceLabel,
      vaccinationDate: dose?.occurrenceDateTime,
      expirationDate: dose?.expirationDate,
      edit: (
        <Button kind="ghost" iconDescription="Edit" onClick={() => editPatientVaccine(immunizations, dose)}>
          {t('edit', 'Edit')}
        </Button>
      ),
    };
  });

  return (
    <DataTable rows={tableRows} headers={tableHeader}>
      {({ rows, headers, getHeaderProps, getTableProps }) => (
        <Table {...getTableProps()} useZebraStyles>
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
      )}
    </DataTable>
  );
};

export default InnerTable;
