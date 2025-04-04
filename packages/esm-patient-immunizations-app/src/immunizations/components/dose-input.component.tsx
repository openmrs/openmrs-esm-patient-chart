import React, { useMemo } from 'react';
import { type ImmunizationSequenceDefinition } from '../../types/fhir-immunization-domain';
import { useController, type Control } from 'react-hook-form';
import { Dropdown, Select, SelectItem } from '@carbon/react';
import styles from './../immunizations-form.scss';
import { useTranslation } from 'react-i18next';

export const DoseInput: React.FC<{
  vaccine: string;
  sequences: ImmunizationSequenceDefinition[];
  control: Control;
}> = ({ vaccine, sequences, control }) => {
  const { t } = useTranslation();
  const { field } = useController({ name: 'doseNumber', control });

  const vaccineSequences = useMemo(
    () => sequences?.find((sequence) => sequence.vaccineConceptUuid === vaccine)?.sequences || [],
    [sequences, vaccine],
  );

  return (
    <div className={styles.row}>
      {vaccineSequences.length ? (
        <Dropdown
          id="sequence"
          label={t('pleaseSelect', 'Please select')}
          titleText={t('sequence', 'Sequence')}
          items={vaccineSequences?.map((sequence) => sequence.sequenceNumber) || []}
          itemToString={(item) => vaccineSequences.find((s) => s.sequenceNumber === item)?.sequenceLabel}
          onChange={(val) => field.onChange(parseInt(val.selectedItem || 0))}
          selectedItem={field.value}
        />
      ) : (
        <Select
          id="doseNumber"
          labelText={t('doseNumberWithinSeries', 'Dose number within series')}
          value={field.value}
            onChange={(event) => field.onChange(parseInt(event.target.value, 10))}
        >
          {[1, 2, 3, 4].map((num) => (
            <SelectItem key={num} value={num} text={String(num)} />
          ))}
        </Select>
      )}
    </div>
  );
};
