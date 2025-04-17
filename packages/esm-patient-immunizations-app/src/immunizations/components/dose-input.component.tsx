import React, { useCallback, useMemo } from 'react';
import { type ImmunizationSequenceDefinition } from '../../types/fhir-immunization-domain';
import { useController, type Control } from 'react-hook-form';
import { Dropdown, NumberInput } from '@carbon/react';
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

  const handleChange = useCallback(
    (event, { value }) => {
      const parsedValue =
        value === '' || value === null || (typeof value === 'string' && !value.trim()) ? undefined : Number(value);
      field.onChange(isNaN(parsedValue) ? undefined : parsedValue);
    },
    [field],
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
        <NumberInput
          id="doseNumber"
          label={t('doseNumberWithinSeries', 'Dose number within series')}
          min={1}
          onChange={handleChange}
          value={field.value}
          hideSteppers={true}
          allowEmpty={true}
          disableWheel={true}
          required={true}
        />
      )}
    </div>
  );
};
