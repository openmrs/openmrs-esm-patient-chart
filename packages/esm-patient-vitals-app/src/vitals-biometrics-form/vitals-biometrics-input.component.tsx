import React, { Fragment, useId, useState } from 'react';
import classNames from 'classnames';
import { type Control, Controller } from 'react-hook-form';
import { FormLabel, NumberInput, TextArea } from '@carbon/react';
import { Warning } from '@carbon/react/icons';
import { useTranslation } from 'react-i18next';
import { useLayoutType, ResponsiveWrapper } from '@openmrs/esm-framework';
import { generatePlaceholder } from '../common';
import { type VitalsBiometricsFormData } from './schema';
import styles from './vitals-biometrics-input.scss';

type fieldId =
  | 'computedBodyMassIndex'
  | 'diastolicBloodPressure'
  | 'generalPatientNote'
  | 'height'
  | 'midUpperArmCircumference'
  | 'oxygenSaturation'
  | 'pulse'
  | 'respiratoryRate'
  | 'systolicBloodPressure'
  | 'temperature'
  | 'weight';

type AbnormalValue = 'critically_low' | 'critically_high' | 'high' | 'low';
type FieldTypes = 'number' | 'textarea';
type NormalRange = { lowNormal?: number | null; hiNormal?: number | null };

function formatNormalRange(range?: NormalRange | null) {
  if (range?.lowNormal != null && range?.hiNormal != null) {
    return `${range.lowNormal}–${range.hiNormal}`;
  }
  if (range?.lowNormal != null) {
    return `≥ ${range.lowNormal}`;
  }
  if (range?.hiNormal != null) {
    return `≤ ${range.hiNormal}`;
  }
  return null;
}

interface VitalsAndBiometricsInputProps {
  control: Control<VitalsBiometricsFormData>;
  fieldStyles?: React.CSSProperties;
  fieldWidth?: string;
  fieldProperties: Array<{
    className?: string;
    id: fieldId;
    invalid?: boolean;
    max?: number | null;
    min?: number | null;
    name: string;
    separator?: string;
    type?: FieldTypes;
  }>;
  interpretation?: string;
  isValueWithinReferenceRange?: boolean;
  label: string;
  muacColorCode?: string;
  /** The normal range of each field, in the order of `fieldProperties`; shown under the input. */
  normalRanges?: Array<NormalRange | null | undefined>;
  placeholder?: string;
  readOnly?: boolean;
  showErrorMessage?: boolean;
  unitSymbol?: string;
  useMuacColors?: boolean;
}

const VitalsAndBiometricsInput: React.FC<VitalsAndBiometricsInputProps> = ({
  control,
  fieldProperties,
  fieldStyles,
  fieldWidth,
  interpretation,
  isValueWithinReferenceRange = true,
  label,
  muacColorCode,
  normalRanges,
  placeholder,
  readOnly,
  showErrorMessage,
  unitSymbol,
  useMuacColors,
}) => {
  const { t } = useTranslation();
  const fieldId = useId();
  const isTablet = useLayoutType() === 'tablet';
  const [invalid, setInvalid] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const abnormalValues: Array<AbnormalValue> = ['critically_low', 'critically_high', 'high', 'low'];
  const hasAbnormalValue = !isFocused && interpretation && abnormalValues.includes(interpretation as AbnormalValue);

  function checkValidity(value, onChange) {
    setInvalid(value !== '' && isNaN(Number(value)));

    if (!invalid) {
      onChange(value === '' ? undefined : Number(value));
    }
  }

  function handleFocusChange(isFocused: boolean) {
    setIsFocused(isFocused);
  }

  const formattedNormalRanges = (normalRanges ?? []).map(formatNormalRange);
  const normalRange = formattedNormalRanges.some(Boolean)
    ? formattedNormalRanges.map((range) => range ?? '–').join(' / ')
    : null;

  const isInvalidInput = !isValueWithinReferenceRange || invalid;
  const showInvalidInputError = Boolean(showErrorMessage && isInvalidInput);
  const errorMessageClass = showInvalidInputError ? styles.invalidInput : '';

  const containerClasses = classNames(styles.container, {
    [styles.inputInTabletView]: isTablet,
    [styles.inputWithAbnormalValue]: hasAbnormalValue,
  });

  const inputClasses = classNames(styles.inputContainer, {
    [styles['critical-value']]: hasAbnormalValue,
    [styles.focused]: isFocused,
    [styles.readonly]: readOnly,
    [muacColorCode]: useMuacColors,
    [errorMessageClass]: true,
  });

  return (
    <>
      <div className={containerClasses} style={{ width: fieldWidth }}>
        <section className={styles.labelContainer}>
          <span className={styles.label} id={`${fieldId}-label`}>
            {label}
          </span>

          {Boolean(hasAbnormalValue) ? (
            <span className={styles[interpretation.replace('_', '-')]} title={t('abnormalValue', 'Abnormal value')} />
          ) : null}

          {showInvalidInputError ? (
            <span className={styles.invalidInputIcon}>
              <Warning />
            </span>
          ) : null}
        </section>
        <section className={inputClasses} style={{ ...fieldStyles }}>
          <div
            className={classNames({
              [styles.centered]: !isTablet || unitSymbol === 'mmHg',
            })}
          >
            {fieldProperties.map((fieldProperty) => {
              if (fieldProperty.type === 'number') {
                const numberInputClasses = classNames(styles.numberInput, fieldProperty.className);

                return (
                  <Fragment key={fieldProperty.id}>
                    <ResponsiveWrapper>
                      <Controller
                        name={fieldProperty.id}
                        control={control}
                        render={({ field: { onChange, ref, value } }) => {
                          return (
                            <NumberInput
                              allowEmpty
                              className={numberInputClasses}
                              disableWheel
                              hideSteppers
                              id={`${fieldId}-${fieldProperty.id}`}
                              max={fieldProperty.max ?? undefined}
                              min={fieldProperty.min ?? undefined}
                              name={fieldProperty.name}
                              onBlur={() => handleFocusChange(false)}
                              onChange={(event, { value }) => checkValidity(value, onChange)}
                              onFocus={() => handleFocusChange(true)}
                              placeholder={generatePlaceholder(fieldProperty.name)}
                              readOnly={readOnly}
                              ref={ref}
                              style={{ ...fieldStyles }}
                              title={fieldProperty.name}
                              type="number"
                              value={value ?? ''}
                            />
                          );
                        }}
                      />
                    </ResponsiveWrapper>
                    {fieldProperty?.separator}
                  </Fragment>
                );
              }

              if (fieldProperty.type === 'textarea') {
                return (
                  <ResponsiveWrapper key={fieldProperty.id}>
                    <Controller
                      name={fieldProperty.id}
                      control={control}
                      render={({ field: { onChange, ref, value } }) => (
                        <TextArea
                          className={styles.textarea}
                          id={`${fieldId}-${fieldProperty.id}`}
                          labelText={''}
                          aria-labelledby={`${fieldId}-label`}
                          maxCount={100}
                          name={fieldProperty.name}
                          onBlur={() => handleFocusChange(false)}
                          onChange={onChange}
                          onFocus={() => handleFocusChange(true)}
                          placeholder={placeholder}
                          ref={ref}
                          rows={2}
                          style={{ ...fieldStyles }}
                          title={fieldProperty.name}
                          value={value ?? ''}
                        />
                      )}
                    />
                  </ResponsiveWrapper>
                );
              }
            })}
          </div>
          {Boolean(unitSymbol) && <p className={styles.unitName}>{unitSymbol}</p>}
        </section>
        {normalRange ? (
          <p className={styles.normalRange}>
            {t('normalRangeHint', 'Normal: {{range}}', {
              range: normalRange,
              // The range is built from numbers here; escaping would turn its " / " into "&#x2F;"
              interpolation: { escapeValue: false },
            })}
          </p>
        ) : null}
      </div>

      {showInvalidInputError && (
        <FormLabel className={styles.invalidInputError}>
          {t('validationInputError', `Value must be between {{min}} and {{max}}`, {
            min: fieldProperties[0].min,
            max: fieldProperties[0].max,
          })}
        </FormLabel>
      )}
    </>
  );
};

export default VitalsAndBiometricsInput;
