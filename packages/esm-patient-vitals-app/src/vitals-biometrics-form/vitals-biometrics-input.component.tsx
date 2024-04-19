import React, { Fragment, useId, useState } from 'react';
import classNames from 'classnames';
import { type Control, Controller, useForm, useFormContext } from 'react-hook-form';
import { FormLabel, NumberInput, TextArea } from '@carbon/react';
import { Warning } from '@carbon/react/icons';
import { useTranslation } from 'react-i18next';
import { useLayoutType, ResponsiveWrapper } from '@openmrs/esm-framework';
import { generatePlaceholder } from '../common';
import styles from './vitals-biometrics-input.scss';
import { type VitalsBiometricsFormData } from './types';

type AbnormalValue = 'critically_low' | 'critically_high' | 'high' | 'low';
type FieldTypes = 'number' | 'textarea';

interface ResponsiveWrapperProps {
  children: React.ReactNode;
  isTablet: boolean;
}

interface VitalsAndBiometricsInputProps {
  fieldStyles?: React.CSSProperties;
  fieldWidth?: string;
  fieldProperties: Array<{
    className?: string;
    id: keyof VitalsBiometricsFormData;
    invalid?: boolean;
    name: string;
    separator?: string;
    type?: FieldTypes;
  }>;
  interpretation?: string;
  label: string;
  muacColorCode?: string;
  placeholder?: string;
  readOnly?: boolean;
  showFormSubmissionErrorNotifications?: boolean;
  unitSymbol?: string;
  useMuacColors?: boolean;
}

const VitalsAndBiometricsInput: React.FC<VitalsAndBiometricsInputProps> = ({
  fieldProperties,
  fieldStyles,
  fieldWidth,
  interpretation,
  label,
  muacColorCode,
  placeholder,
  readOnly,
  showFormSubmissionErrorNotifications,
  unitSymbol,
  useMuacColors,
}) => {
  const { t } = useTranslation();
  const fieldId = useId();
  const isTablet = useLayoutType() === 'tablet';
  const [isFocused, setIsFocused] = useState(false);
  const {
    control,
    formState: { errors },
    setValue,
  } = useFormContext<VitalsBiometricsFormData>();

  const abnormalValues: Array<AbnormalValue> = ['critically_low', 'critically_high', 'high', 'low'];

  const hasAbnormalValue = !isFocused && interpretation && abnormalValues.includes(interpretation as AbnormalValue);

  function handleFocusChange(isFocused: boolean) {
    setIsFocused(isFocused);
  }

  const fieldIdWithError = fieldProperties?.find(({ id }) => errors?.[id])?.id;
  const errorMessage = errors?.[fieldIdWithError]?.message;
  const showInvalidInputError = Boolean((showFormSubmissionErrorNotifications || !isFocused) && errorMessage);
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
          <div className={styles.centered}>
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
                              name={fieldProperty.name}
                              onBlur={() => handleFocusChange(false)}
                              onChange={({ target: { value } }: React.ChangeEvent<HTMLInputElement>) =>
                                setValue(fieldProperty.id, isNaN(Number(value)) ? undefined : Number(value), {
                                  shouldValidate: true,
                                })
                              }
                              onFocus={() => handleFocusChange(true)}
                              placeholder={generatePlaceholder(fieldProperty.name)}
                              readOnly={readOnly}
                              ref={ref}
                              style={{ ...fieldStyles }}
                              title={fieldProperty.name}
                              type={fieldProperty.type}
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

      {showInvalidInputError && <FormLabel className={styles.invalidInputError}>{errorMessage}</FormLabel>}
    </>
  );
};

export default VitalsAndBiometricsInput;
