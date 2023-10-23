import React, { Fragment, useState } from 'react';
import { Control, Controller } from 'react-hook-form';
import { FormLabel, Layer, NumberInput, TextArea } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { useLayoutType } from '@openmrs/esm-framework';
import { VitalsBiometricsFormData } from './vitals-biometrics-form.component';
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
}) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const [invalid, setInvalid] = useState(false);

  function checkValidity(value, onChange) {
    setInvalid(!(Number(value) || value === ''));

    if (!invalid) {
      onChange(Number(value));
    }
  }

  return (
    <div className={styles.inputContainer} style={{ width: textFieldWidth }}>
      <p className={styles.vitalsBiometricInputLabel01}>{title}</p>
      <div
        className={`${styles.textInputContainer} ${disabled && styles.disabledInput} ${
          !isWithinNormalRange && styles.danger
        } ${useMuacColors ? muacColorCode : undefined}`}
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
                        className={`${styles.textInput} ${disabled && styles.disabledInput} ${val.className} ${
                          !isWithinNormalRange && styles.danger
                        }`}
                        defaultValue="--"
                        disabled={disabled}
                        disableWheel
                        hideSteppers
                        id={val.name + 'input'}
                        label={''}
                        max={val.max}
                        min={val.min}
                        name={val.name}
                        onBlur={onBlur}
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
      {(!isWithinNormalRange || invalid) && (
        <FormLabel className={styles.danger}>
          {t('numericInputError', 'Must be a number with in acceptable ranges')}
        </FormLabel>
      )}
    </div>
  );
};

function ResponsiveWrapper({ children, isTablet }: { children: React.ReactNode; isTablet: boolean }) {
  return isTablet ? <Layer className={styles.layer}>{children} </Layer> : <>{children}</>;
}

export default VitalsBiometricInput;
