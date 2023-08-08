import React, { Fragment, useState } from 'react';
import { FormLabel, Layer, TextArea, TextInput } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { useLayoutType } from '@openmrs/esm-framework';
import styles from './vitals-biometrics-input.scss';

interface VitalsBiometricInputProps {
  title: string;
  muacColorCode?: string;
  useMuacColors?: boolean;
  onInputChange(event): void;
  textFields: Array<{
    name: string;
    separator?: string;
    type?: string | 'text';
    value: number | string;
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
  onInputChange,
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

  function checkValidity(value) {
    setInvalid(!(Number(value) || value === ''));
  }

  return (
    <div className={styles.inputContainer} style={{ width: textFieldWidth }}>
      <p className={styles.vitalsBiometricInputLabel01}>{title}</p>
      <div
        className={`${styles.textInputContainer} ${disabled && styles.disableInput} ${
          !isWithinNormalRange && styles.danger
        } ${useMuacColors ? muacColorCode : undefined}`}
        style={{ ...textFieldStyles }}
      >
        <div className={styles.centerDiv}>
          {textFields.map((val, i) => {
            return val.type === 'number' ? (
              <Fragment key={`vitals-text-input-${val.name}-${i}`}>
                <ResponsiveWrapper isTablet={isTablet}>
                  <TextInput
                    style={{ ...textFieldStyles }}
                    className={`${styles.textInput} ${disabled && styles.disableInput} ${val.className} ${
                      !isWithinNormalRange && styles.danger
                    }`}
                    id={val.name}
                    invalid={invalid}
                    type={val.type}
                    min={val.min}
                    max={val.max}
                    name={val.name}
                    onChange={(e) => checkValidity(e.target.value)}
                    onInput={onInputChange}
                    labelText={''}
                    value={val.value}
                    title={val.name}
                  />
                </ResponsiveWrapper>
                {val?.separator}
              </Fragment>
            ) : (
              <ResponsiveWrapper key={`vitals-text-area-${val.name}-${i}`} isTablet={isTablet}>
                <TextArea
                  key={val.name}
                  style={{ ...textFieldStyles }}
                  className={styles.textarea}
                  id={val.name}
                  name={val.name}
                  labelText={''}
                  onChange={onInputChange}
                  rows={2}
                  placeholder={placeholder}
                  value={val.value}
                  title={val.name}
                />
              </ResponsiveWrapper>
            );
          })}
        </div>
        <p className={styles.unitName}>{unitSymbol}</p>
      </div>
      {!isWithinNormalRange || invalid ? (
        <FormLabel className={styles.danger}>
          {t('numericInputError', 'Must be a number with in acceptable ranges')}
        </FormLabel>
      ) : null}
    </div>
  );
};

function ResponsiveWrapper({ children, isTablet }: { children: React.ReactNode; isTablet: boolean }) {
  return isTablet ? <Layer>{children} </Layer> : <>{children}</>;
}

export default VitalsBiometricInput;
