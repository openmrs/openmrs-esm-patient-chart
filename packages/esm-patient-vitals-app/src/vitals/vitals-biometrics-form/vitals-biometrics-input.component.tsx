import React, { Fragment, useState } from 'react';
import { FormLabel, TextArea, TextInput } from 'carbon-components-react';
import styles from './vitals-biometrics-input.component.scss';
import { useTranslation } from 'react-i18next';

interface VitalsBiometricInputProps {
  title: string;
  onInputChange(evnt): void;
  textFields: Array<{
    name: string;
    separator?: string;
    type?: string | 'text';
    value: number | string;
    className?: string;
    invalid?: boolean;
  }>;
  unitSymbol?: string;
  textFieldWidth?: string;
  textFieldStyles?: React.CSSProperties;
  placeholder?: string;
  disabled?: boolean;
  inputIsNormal: boolean;
  isTablet: boolean;
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
  inputIsNormal,
  isTablet,
}) => {
  const { t } = useTranslation();
  const [invalid, setInvalid] = useState<boolean>(false);

  function check(value) {
    setInvalid(!(Number(value) || value === ''));
  }

  return (
    <div className={styles.inputContainer} style={{ width: textFieldWidth }}>
      <p className={styles.vitalsBiometricInputLabel01}>{title}</p>
      <div
        className={`${styles.textInputContainer} ${disabled && styles.disableInput} ${!inputIsNormal && styles.danger}`}
        style={{ ...textFieldStyles }}
      >
        <div className={styles.centerDiv}>
          {textFields.map((val) => {
            return val.type === 'number' ? (
              <Fragment key={val.name}>
                <TextInput
                  style={{ ...textFieldStyles }}
                  className={`${styles.textInput} ${disabled && styles.disableInput} ${val.className} ${
                    !inputIsNormal && styles.danger
                  }`}
                  id={val.name}
                  invalid={invalid}
                  type={val.type}
                  min={0}
                  name={val.name}
                  onChange={(e) => check(e.target.value)}
                  onInput={onInputChange}
                  labelText={''}
                  value={val.value}
                  title={val.name}
                  light={isTablet}
                />
                {val?.separator}
              </Fragment>
            ) : (
              <TextArea
                key={val.name}
                style={{ ...textFieldStyles }}
                className={styles.textArea}
                id={val.name}
                name={val.name}
                labelText={''}
                onChange={onInputChange}
                rows={2}
                placeholder={placeholder}
                value={val.value}
                title={val.name}
                light={isTablet}
              />
            );
          })}
        </div>
        <p className={styles.unitName}>{unitSymbol}</p>
      </div>
      {invalid ? <FormLabel className={styles.danger}>{t('numericInputError', 'Must be a number')}</FormLabel> : null}
    </div>
  );
};

export default VitalsBiometricInput;
