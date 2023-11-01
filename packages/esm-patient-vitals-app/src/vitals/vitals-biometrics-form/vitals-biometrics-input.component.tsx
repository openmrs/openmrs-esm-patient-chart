import React, { Fragment, useState } from 'react';
import classNames from 'classnames';
import { Control, Controller } from 'react-hook-form';
import { FormLabel, Layer, NumberInput, TextArea } from '@carbon/react';
import { Warning } from '@carbon/react/icons';
import { useTranslation } from 'react-i18next';
import { useLayoutType } from '@openmrs/esm-framework';
import { VitalsBiometricsFormData } from './vitals-biometrics-form.component';
import { generatePlaceholder } from '../vitals.resource';
import styles from './vitals-biometrics-input.scss';

type fieldId =
  | 'systolicBloodPressure'
  | 'diastolicBloodPressure'
  | 'respiratoryRate'
  | 'oxygenSaturation'
  | 'pulse'
  | 'temperature'
  | 'generalPatientNote'
  | 'weight'
  | 'height'
  | 'midUpperArmCircumference'
  | 'computedBodyMassIndex';

interface ResponsiveWrapperProps {
  children: React.ReactNode;
  isTablet: boolean;
}

interface VitalsBiometricInputProps {
  control: Control<VitalsBiometricsFormData>;
  muacColorCode?: string;
  interpretation?: string;
  isWithinNormalRange?: boolean;
  placeholder?: string;
  readOnly?: boolean;
  showErrorMessage?: boolean;
  fieldStyles?: React.CSSProperties;
  fieldWidth?: string;
  fields: Array<{
    id: fieldId;
    name: string;
    separator?: string;
    type?: string | 'text';
    className?: string;
    invalid?: boolean;
    min?: number | null;
    max?: number | null;
  }>;
  title: string;
  useMuacColors?: boolean;
  unitSymbol?: string;
}

const VitalsBiometricInput: React.FC<VitalsBiometricInputProps> = ({
  control,
  interpretation,
  isWithinNormalRange = true,
  muacColorCode,
  placeholder,
  readOnly,
  showErrorMessage,
  fields,
  fieldStyles,
  fieldWidth,
  title,
  unitSymbol,
  useMuacColors,
}) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const [invalid, setInvalid] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const isFlaggedCritical =
    interpretation && ['critically_low', 'critically_high', 'high', 'low'].includes(interpretation);

  function checkValidity(value, onChange) {
    setInvalid(!(Number(value) || value === ''));

    if (!invalid) {
      onChange(Number(value));
    }
  }

  const isInvalidInput = !isWithinNormalRange || invalid;
  const showInvalidInputError = showErrorMessage && isInvalidInput;
  const errorMessageClass = showInvalidInputError ? styles.invalidInput : '';

  const containerClasses = classNames(styles.inputContainer, {
    [styles.inputInTabletView]: isTablet,
    [styles.isCriticalInput]: !isFocused && isFlaggedCritical,
  });

  const textInputClasses = classNames(styles.textInputContainer, {
    [styles['critical-value']]: !isFocused && isFlaggedCritical,
    [styles.focused]: isFocused,
    [styles.readonly]: readOnly,
    [muacColorCode]: useMuacColors,
    [errorMessageClass]: true,
  });

  return (
    <>
      <div className={containerClasses} style={{ width: fieldWidth }}>
        <div className={styles.labelAndIcons}>
          <p className={styles.vitalsBiometricInputLabel01}>{title}</p>
          {!isFocused && isFlaggedCritical ? (
            <div title="abnormal value">
              <span className={styles[interpretation.replace('_', '-')]} />
            </div>
          ) : showInvalidInputError ? (
            <div className={styles.invalidInputIcon}>
              <Warning />
            </div>
          ) : null}
        </div>
        <div className={textInputClasses} style={{ ...fieldStyles }}>
          <div className={styles.centerDiv}>
            {fields.map((val, i) => {
              return val.type === 'number' ? (
                <Fragment key={`${val.name}-${i}-number-input`}>
                  <ResponsiveWrapper isTablet={isTablet}>
                    <Controller
                      name={val.id}
                      control={control}
                      render={({ field: { onChange, value, ref } }) => (
                        <NumberInput
                          allowEmpty
                          className={`${styles.textInput} ${val.className}`}
                          defaultValue={''}
                          disableWheel
                          hideSteppers
                          id={val.name + 'input'}
                          label={''}
                          max={val.max}
                          min={val.min}
                          name={val.name}
                          onBlur={handleBlur}
                          onChange={(e) => checkValidity(e.target.value, onChange)}
                          onFocus={handleFocus}
                          placeholder={generatePlaceholder(val.name)}
                          readOnly={readOnly}
                          ref={ref}
                          style={{ ...fieldStyles }}
                          title={val.name}
                          type={val.type}
                          value={value}
                        />
                      )}
                    />
                  </ResponsiveWrapper>
                  {val?.separator}
                </Fragment>
              ) : (
                <ResponsiveWrapper key={`${val.name}-${i}-textarea`} isTablet={isTablet}>
                  <Controller
                    name={val.id}
                    control={control}
                    render={({ field: { onBlur, onChange, value, ref } }) => (
                      <TextArea
                        className={styles.textarea}
                        id={val.name}
                        key={val.name + 'textarea'}
                        labelText={''}
                        name={val.name}
                        onBlur={onBlur}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={placeholder}
                        ref={ref}
                        rows={2}
                        style={{ ...fieldStyles }}
                        title={val.name}
                        value={value}
                      />
                    )}
                  />
                </ResponsiveWrapper>
              );
            })}
          </div>
          <p className={styles.unitName}>{unitSymbol}</p>
        </div>
      </div>
      {showInvalidInputError ? (
        <FormLabel className={styles.invalidInputError}>
          {t('validationInputError', `Value must be between {{min}} and {{max}} {{unitSymbol}}`, {
            min: fields[0].min,
            max: fields[0].max,
            unitSymbol: unitSymbol,
          })}
        </FormLabel>
      ) : null}
    </>
  );
};

const ResponsiveWrapper: React.FC<ResponsiveWrapperProps> = ({ children, isTablet }) => {
  return isTablet ? <Layer className={styles.layer}>{children} </Layer> : <>{children}</>;
};

export default VitalsBiometricInput;
