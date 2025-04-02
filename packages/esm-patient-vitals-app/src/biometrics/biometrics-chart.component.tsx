import React, { useMemo, useState } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Tab, TabListVertical, TabPanel, TabPanels, TabsVertical } from '@carbon/react';
import { LineChart, ScaleTypes } from '@carbon/charts-react';
import { formatDate, parseDate } from '@openmrs/esm-framework';
import { type ConfigObject } from '../config-schema';
import { type PatientVitalsAndBiometrics } from '../common';
import styles from './biometrics-chart.scss';

interface BiometricsChartProps {
  conceptUnits: Map<string, string>;
  config: ConfigObject;
  patientBiometrics: Array<PatientVitalsAndBiometrics>;
}

interface BiometricChartData {
  groupName: 'Weight' | 'Height' | 'Body mass index' | string;
  title: string;
  value: number | string;
}

const chartColors = { weight: '#6929c4', height: '#6929c4', bmi: '#6929c4' };

const BiometricsChart: React.FC<BiometricsChartProps> = ({ patientBiometrics, conceptUnits, config }) => {
  const { t } = useTranslation();
  const { bmiUnit } = config.biometrics;
  const [selectedBiometrics, setSelectedBiometrics] = useState<BiometricChartData>({
    title: `${t('weight', 'Weight')} (${conceptUnits.get(config.concepts.weightUuid) ?? ''})`,
    value: 'weight',
    groupName: 'weight',
  });

  const biometrics = [
    {
      id: 'weight',
      title: `${t('weight', 'Weight')} (${conceptUnits.get(config.concepts.weightUuid) ?? ''})`,
      value: 'weight',
    },
    {
      id: 'height',
      title: `${t('height', 'Height')} (${conceptUnits.get(config.concepts.heightUuid) ?? ''})`,
      value: 'height',
    },
    {
      id: 'bmi',
      title: `${t('bmi', 'BMI')} (${bmiUnit})`,
      value: 'bmi',
    },
  ];

  const chartData = useMemo(
    () =>
      patientBiometrics
        .filter((biometrics) => biometrics[selectedBiometrics.value])
        .slice(0, 10)
        .sort((biometricA, biometricB) => new Date(biometricA.date).getTime() - new Date(biometricB.date).getTime())
        .map(
          (biometrics) =>
            biometrics[selectedBiometrics.value] && {
              group: selectedBiometrics.title,
              key: formatDate(new Date(biometrics.date), { mode: 'wide', year: false, time: false }),
              value: biometrics[selectedBiometrics.value],
              date: biometrics.date,
            },
        ),
    [patientBiometrics, selectedBiometrics.title, selectedBiometrics.value],
  );

  const chartOptions = useMemo(() => {
    return {
      title: selectedBiometrics.title,
      axes: {
        bottom: {
          title: t('date', 'Date'),
          mapsTo: 'key',
          scaleType: ScaleTypes.LABELS,
        },
        left: {
          mapsTo: 'value',
          title: selectedBiometrics.title,
          scaleType: ScaleTypes.LINEAR,
          includeZero: false,
        },
      },
      legend: {
        enabled: false,
      },
      color: {
        scale: {
          [selectedBiometrics.title]: '#6929c4',
        },
      },
      tooltip: {
        customHTML: ([{ value, date }]) =>
          `<div class="cds--tooltip cds--tooltip--shown" style="min-width: max-content; font-weight:600">${formatDate(
            parseDate(date),
            { year: true },
          )} -
          <span style="color: #c6c6c6; font-size: 1rem; font-weight:400">${value}</span></div>`,
      },
      height: '400px',
    };
  }, [selectedBiometrics, t]);

  return (
    <div className={styles.biometricChartContainer}>
      <div className={styles.biometricsArea}>
        <label className={styles.biometricLabel} htmlFor="biometrics-chart-radio-group">
          {t('biometricDisplayed', 'Biometric displayed')}
        </label>
        <TabsVertical>
          <TabListVertical aria-label="Biometrics tabs">
            {biometrics.map(({ id, title, value }) => (
              <Tab
                className={classNames(styles.tab, styles.bodyLong01, {
                  [styles.selectedTab]: selectedBiometrics.title === title,
                })}
                id={`${id}-tab`}
                key={id}
                onClick={() =>
                  setSelectedBiometrics({
                    title: title,
                    value: value,
                    groupName: id,
                  })
                }
              >
                {title}
              </Tab>
            ))}
          </TabListVertical>
          <TabPanels>
            {biometrics.map(({ id }) => (
              <TabPanel key={id}>
                <LineChart data={chartData} options={chartOptions} key={id} />
              </TabPanel>
            ))}
          </TabPanels>
        </TabsVertical>
      </div>
    </div>
  );
};

export default BiometricsChart;
