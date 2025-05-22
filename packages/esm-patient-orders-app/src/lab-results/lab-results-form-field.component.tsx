import React, { useCallback, useMemo } from 'react';
import { NumberInput, Select, SelectItem, TextInput, InlineNotification } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { type Control, Controller } from 'react-hook-form';
import { isCoded, isNumeric, isPanel, isText, type LabOrderConcept } from './lab-results.resource';
import { type Observation } from '../types/encounter';
import styles from './lab-results-form.scss';

interface ResultFormFieldProps {
  concept: LabOrderConcept;
  control: Control<Record<string, unknown>>;
  defaultValue: Observation;
}

const ResultFormField: React.FC<ResultFormFieldProps> = ({ concept, control, defaultValue }) => {
  const { t } = useTranslation();

  // TODO: Reference ranges should be dynamically adjusted based on patient demographics:
  // - Age-specific ranges (e.g., pediatric vs adult values)
  // - Gender-specific ranges where applicable
  const formatLabRange = (concept: LabOrderConcept) => {
    const hl7Abbreviation = concept?.datatype?.hl7Abbreviation;
    if (hl7Abbreviation !== 'NM') {
      return '';
    }

    const { hiAbsolute, lowAbsolute, units } = concept;
    const displayUnit = units ? ` ${units}` : '';

    const hasLowerLimit = lowAbsolute != null;
    const hasUpperLimit = hiAbsolute != null;

    if (hasLowerLimit && hasUpperLimit) {
      return ` (${lowAbsolute} - ${hiAbsolute} ${displayUnit})`;
    } else if (hasUpperLimit) {
      return ` (<= ${hiAbsolute} ${displayUnit})`;
    } else if (hasLowerLimit) {
      return ` (>= ${lowAbsolute} ${displayUnit})`;
    }
    return units ? ` (${displayUnit})` : '';
  };

  const getSavedMemberDefaultObservation = useCallback(
    (conceptUuid: string) => defaultValue?.groupMembers?.find((member) => member.concept.uuid === conceptUuid),

    [defaultValue],
  );

  const labelText = useMemo(() => `${concept.display} ${formatLabRange(concept)}`, [concept]);

  const { isTextField, isNumericField, isCodedField, isPanelField } = useMemo(
    () => ({
      isTextField: isText(concept),
      isNumericField: isNumeric(concept),
      isCodedField: isCoded(concept),
      isPanelField: isPanel(concept),
    }),
    [concept],
  );

  if (isTextField || isNumericField || isCodedField || isPanelField) {
    return (
      <>
        <Controller
          control={control}
          name={concept.uuid}
          render={({ field, fieldState: { error } }) =>
            isTextField ? (
              <TextInput
                {...field}
                className={styles.textInput}
                id={concept.uuid}
                key={concept.uuid}
                labelText={labelText}
                type="text"
                invalidText={error?.message}
                invalid={Boolean(error?.message)}
              />
            ) : isNumericField ? (
              <NumberInput
                {...field}
                allowEmpty
                className={styles.numberInput}
                disableWheel
                id={concept.uuid}
                key={concept.uuid}
                label={labelText}
                onChange={(_, { value }) => field.onChange(value !== '' ? value : undefined)}
                step={concept.allowDecimal ? 0.01 : 1}
                value={field.value || ''}
                invalidText={error?.message}
                invalid={Boolean(error?.message)}
              />
            ) : isCodedField ? (
              <Select
                {...field}
                className={styles.textInput}
                defaultValue={defaultValue?.value?.uuid}
                id={`select-${concept.uuid}`}
                key={concept.uuid}
                labelText={labelText}
                invalidText={error?.message}
                invalid={Boolean(error?.message)}
              >
                <SelectItem text={t('chooseAnOption', 'Choose an option')} value="" />
                {concept?.answers?.length &&
                  concept?.answers?.map((answer) => (
                    <SelectItem key={answer.uuid} text={answer.display} value={answer.uuid}>
                      {answer.display}
                    </SelectItem>
                  ))}
              </Select>
            ) : null
          }
        />
        {isPanelField
          ? concept.setMembers.map((member) => (
              <ResultFormField
                key={member.uuid}
                concept={member}
                control={control}
                defaultValue={getSavedMemberDefaultObservation(member.uuid)}
              />
            ))
          : null}
      </>
    );
  }

  return (
    <>
      <label className={styles.label}>{labelText}</label>
      <InlineNotification
        kind="error"
        hideCloseButton
        title={t('invalidLabTestConfiguration', 'Invalid lab test configuration')}
        subtitle={t(
          'invalidLabTestConfigurationSubtitle',
          'This test needs to be configured with a specific type (like number, text, or choice list) to record results properly. Please contact your system administrator to fix this.',
        )}
      />
    </>
  );
};

export default ResultFormField;
