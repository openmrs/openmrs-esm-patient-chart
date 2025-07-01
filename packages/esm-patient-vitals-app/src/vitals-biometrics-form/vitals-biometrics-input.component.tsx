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
    setInvalid(!(Number(value) || value === ''));

    if (!invalid) {
      onChange(value === '' ? undefined : Number(value));
    }
  }

  function handleFocusChange(isFocused: boolean) {
    setIsFocused(isFocused);
  }

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
          <span className={styles.label}>{label}</span>

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
                              defaultValue={''}
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
                              value={value}
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
                          value={value}
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
