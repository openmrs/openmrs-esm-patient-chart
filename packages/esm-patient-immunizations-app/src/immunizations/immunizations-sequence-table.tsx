import React, { useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import isEmpty from 'lodash-es/isEmpty';
import { Button, DataTable, Table, TableHead, TableRow, TableHeader, TableBody, TableCell } from '@carbon/react';
import { launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';
import ImmunizationsForm from './immunizations-form.component';
import { type ExistingDoses, type Immunization } from '../types';

interface SequenceTableProps {
  immunizations: Immunization;
  patientUuid: string;
}

const SequenceTable: React.FC<SequenceTableProps> = ({ immunizations }) => {
  const { t } = useTranslation();
  const { existingDoses, sequences } = immunizations;

  const launchPatientImmunizationForm = useCallback(
    (immunizationFormData: Immunization, existingDoses: ExistingDoses) => {
      launchPatientWorkspace('immunization-form-workspace');

      // What's all this about?

      // const { vaccineName, vaccineUuid, sequences } = immunizationFormData;
      // const { sequenceLabel, sequenceNumber } = existingDoses;
      // const formHeader = t('immunizationForm', 'Immunization Form');
      // openWorkspaceTab(ImmunizationsForm, formHeader, {
      //   vaccineName,
      //   vaccineUuid,
      //   immunizationObsUuid: existingDoses.immunizationObsUuid,
      //   manufacturer: existingDoses.manufacturer,
      //   lotNumber: existingDoses.lotNumber,
      //   expirationDate: existingDoses.expirationDate,
      //   sequences,
      //   currentDose: {
      //     sequenceLabel,
      //     sequenceNumber,
      //   },
      //   vaccinationDate: existingDoses?.occurrenceDateTime,
      // });
    },
    [],
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

  const tableRows = existingDoses?.map((dose, index) => {
    return {
      id: dose?.immunizationObsUuid,
      sequence: isEmpty(sequences) ? t('singleDose', 'Single Dose') : sequences[index]?.sequenceLabel,
      vaccinationDate: dose?.occurrenceDateTime,
      expirationDate: dose?.expirationDate,
      edit: (
        <Button kind="ghost" iconDescription="Edit" onClick={() => launchPatientImmunizationForm(immunizations, dose)}>
          {t('edit', 'Edit')}
        </Button>
      ),
    };
  });

  return (
    tableRows.length > 0 && (
      <DataTable rows={tableRows} headers={tableHeader} useZebraStyles>
        {({ rows, headers, getHeaderProps, getTableProps }) => (
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
        )}
      </DataTable>
    )
  );
};

export default SequenceTable;
