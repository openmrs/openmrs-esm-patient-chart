import React, { Fragment, useState } from 'react';
import { Control, Controller } from 'react-hook-form';
import { FormLabel, Layer, NumberInput, TextArea } from '@carbon/react';
import { Warning } from '@carbon/react/icons';
import { useTranslation } from 'react-i18next';
import { useLayoutType } from '@openmrs/esm-framework';
import { VitalsBiometricsFormData } from './vitals-biometrics-form.component';
import { generatePlaceholder } from '../vitals.resource';
import styles from './vitals-biometrics-input.scss';

type Id =
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

interface VitalsBiometricInputProps {
  title: string;
  control: Control<VitalsBiometricsFormData>;
  muacColorCode?: string;
  useMuacColors?: boolean;
  textFields: Array<{
    id: Id;
    name: string;
    separator?: string;
    type?: string | 'text';
    className?: string;
    invalid?: boolean;
    min?: number | null;
    max?: number | null;
  }>;
  unitSymbol?: string;
  textFieldWidth?: string;
  textFieldStyles?: React.CSSProperties;
  placeholder?: string;
  disabled?: boolean;
  isWithinNormalRange?: boolean;
  interpretation?: string;
  showErrorMessage?: boolean;
}

const VitalsBiometricInput: React.FC<VitalsBiometricInputProps> = ({
  title,
  control,
  textFields,
  unitSymbol,
  textFieldStyles,
  textFieldWidth,
  placeholder,
  disabled,
  muacColorCode,
  useMuacColors,
  isWithinNormalRange = true,
  interpretation,
  showErrorMessage,
}) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const [invalid, setInvalid] = useState(false);
  const [isFocused, setFocused] = useState(false);

  const handleFocus = () => {
    setFocused(true);
  };

  const handleBlur = () => {
    setFocused(false);
  };

  const flaggedCritical =
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

  return (
    <div
      className={`${styles.inputContainer} ${isTablet ? styles.inputInTabletView : ''} ${
        flaggedCritical ? styles.isCriticalInput : ''
      }`}
      style={{ width: textFieldWidth }}
    >
      <div className={styles.labelAndIcons}>
        <p className={styles.vitalsBiometricInputLabel01}>{title}</p>
        {flaggedCritical ? (
          <div title="abnormal value">
            <span className={styles[interpretation.replace('_', '-')]} />
          </div>
        ) : showInvalidInputError ? (
          <div className={styles.invalidInputIcon}>
            <Warning />
          </div>
        ) : null}
      </div>
      <div
        className={`${styles.textInputContainer} ${isFocused ? styles.focused : ''} ${
          flaggedCritical && styles['critical-value']
        } ${disabled ? styles.disabledInput : ''} ${useMuacColors ? muacColorCode : undefined} ${errorMessageClass}`}
        style={{ ...textFieldStyles }}
      >
        <div className={styles.centerDiv}>
          {textFields.map((val, i) => {
            return val.type === 'number' ? (
              <Fragment key={`vitals-text-input-${val.name}-${i}`}>
                <ResponsiveWrapper isTablet={isTablet}>
                  <Controller
                    name={val.id}
                    control={control}
                    render={({ field: { onBlur, onChange, value, ref } }) => (
                      <NumberInput
                        allowEmpty
                        placeholder={generatePlaceholder(val.name)}
                        className={`${styles.textInput} ${disabled ? styles.disabledInput : ''} ${val.className}`}
                        defaultValue="--"
                        disabled={disabled}
                        disableWheel
                        hideSteppers
                        id={val.name + 'input'}
                        label={''}
                        max={val.max}
                        min={val.min}
                        name={val.name}
                        onBlur={handleBlur}
                        onFocus={handleFocus}
                        onChange={(e) => checkValidity(e.target.value, onChange)}
                        style={{ ...textFieldStyles }}
                        ref={ref}
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
              <ResponsiveWrapper key={`vitals-text-area-${val.name}-${i}`} isTablet={isTablet}>
                <Controller
                  name={val.id}
                  control={control}
                  render={({ field: { onBlur, onChange, value, ref } }) => (
                    <TextArea
                      key={val.name}
                      style={{ ...textFieldStyles }}
                      className={styles.textarea}
                      id={val.name}
                      name={val.name}
                      labelText={''}
                      onChange={(e) => onChange(e.target.value)}
                      onBlur={onBlur}
                      rows={2}
                      placeholder={placeholder}
                      value={value}
                      title={val.name}
                      ref={ref}
                    />
                  )}
                />
              </ResponsiveWrapper>
            );
          })}
        </div>
        <p className={styles.unitName}>{unitSymbol}</p>
      </div>
      {showInvalidInputError ? (
        <FormLabel className={styles.danger}>
          {t('numericInputError', `Only numbers "{min}" - "{max}" permitted`, {
            min: textFields[0].min,
            max: textFields[0].max,
          })}
        </FormLabel>
      ) : null}
    </div>
  );
};

function ResponsiveWrapper({ children, isTablet }: { children: React.ReactNode; isTablet: boolean }) {
  return isTablet ? <Layer className={styles.layer}>{children} </Layer> : <>{children}</>;
}

export default VitalsBiometricInput;
