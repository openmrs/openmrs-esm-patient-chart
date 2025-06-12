import React, { useCallback, useMemo } from 'react';
import {
  Accordion,
  AccordionItem,
  NumberInput,
  Select,
  SelectItem,
  TextInput,
  InlineNotification,
} from '@carbon/react';
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

  const getSavedMemberValue = useCallback(
    (conceptUuid: string, hl7Abbreviation: string) => {
      const value = defaultValue?.groupMembers?.find((member) => member.concept.uuid === conceptUuid)?.value;
      return hl7Abbreviation === 'CWE' && value && typeof value === 'object' && 'uuid' in value ? value.uuid : value;
    },
    [defaultValue],
  );

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
      <div className={styles.formField}>
        <Controller
          control={control}
          name={concept.uuid}
          render={({ field, fieldState: { error } }) =>
            isTextField ? (
              <TextInput
                {...field}
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
                defaultValue={getSavedMemberValue(concept.uuid, concept.datatype.hl7Abbreviation)}
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
        {isPanelField ? (
          <Accordion>
            <AccordionItem title={concept.display} open>
              {concept.setMembers.map((member) => (
                <div>
                  <ResultFormField
                    key={member.uuid}
                    concept={member}
                    control={control}
                    defaultValue={getSavedMemberDefaultObservation(member.uuid)}
                  />
                </div>
              ))}
            </AccordionItem>
          </Accordion>
        ) : null}
      </div>
    );
  }

  return (
    <div className={styles.formField}>
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
    </div>
  );
};

export default ResultFormField;
