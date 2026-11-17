import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Tile, RadioButtonGroup, RadioButton, Layer } from '@carbon/react';
import styles from './unknown-gender.scss';

interface UnknownGenderStateProps {
  onGenderSelected: (gender: string) => void;
}

const UnknownGenderState: React.FC<UnknownGenderStateProps> = ({ onGenderSelected }) => {
  const { t } = useTranslation();
  const [selectedGender, setSelectedGender] = useState<string>();

  const handleGenderChange = (value: string | number | undefined) => {
    if (value !== undefined) {
      const genderStr = value.toString();
      setSelectedGender(genderStr);
      onGenderSelected(genderStr);
    }
  };

  return (
    <div className={styles.tileContainer}>
      <Layer>
        <Tile className={styles.tile}>
          <div className={styles.tileContent}>
            <p className={styles.content}>{t('noGrowthChartsToDisplay', 'No growth charts to display')}</p>
            <p className={styles.helper}>
              {t('unknownGender', "This patient's recorded gender is unknown or other.")}
              <br />
              {t('referenceChartPrompt', 'Choose a reference chart to continue.')}
            </p>

            <div className={styles.radioGroup}>
              <RadioButtonGroup
                name="reference-chart-selection"
                legendText={t('referenceChart', 'Reference chart')}
                valueSelected={selectedGender}
                onChange={handleGenderChange}
              >
                <RadioButton value="male" id="male-reference" labelText={t('maleReference', 'Male reference')} />
                <RadioButton
                  value="female"
                  id="female-reference"
                  labelText={t('femaleReference', 'Female reference')}
                />
              </RadioButtonGroup>
            </div>
          </div>
        </Tile>
      </Layer>
    </div>
  );
};

export default UnknownGenderState;
