import React from 'react';
import { useTranslation } from 'react-i18next';
import { Tab, Tabs, TabList } from '@carbon/react';
import { LineChart } from '@carbon/charts-react';
import { formatDate, parseDate } from '@openmrs/esm-framework';
import { ConfigObject } from '../config-schema';
import { PatientBiometrics } from './biometrics.resource';
import styles from './biometrics-chart.scss';
import '@carbon/charts/styles.css';

export enum ScaleTypes {
  LABELS = 'labels',
  LABELS_RATIO = 'labels-ratio',
  LINEAR = 'linear',
  LOG = 'log',
  TIME = 'time',
}

interface BiometricsChartProps {
  conceptUnits: Map<string, string>;
  config: ConfigObject;
  patientBiometrics: Array<PatientBiometrics>;
}

interface BiometricChartData {
  title: string;
  value: number | string;
  groupName: 'weight' | 'height' | 'bmi' | string;
}

const chartColors = { weight: '#6929c4', height: '#6929c4', bmi: '#6929c4' };

const BiometricsChart: React.FC<BiometricsChartProps> = ({ patientBiometrics, conceptUnits, config }) => {
  const { t } = useTranslation();
  const { bmiUnit } = config.biometrics;
  const [selectedBiometrics, setSelectedBiometrics] = React.useState<BiometricChartData>({
    title: `Weight (${conceptUnits.get(config.concepts.weightUuid) ?? ''})`,
    value: 'weight',
    groupName: 'weight',
  });

  const chartData = React.useMemo(
    () =>
      patientBiometrics
        .filter((biometrics) => biometrics[selectedBiometrics.value])
        .splice(0, 10)
        .sort((biometricA, biometricB) => new Date(biometricA.date).getTime() - new Date(biometricB.date).getTime())
        .map((biometric) => {
          return (
            biometric[selectedBiometrics.value] && {
              group: selectedBiometrics.groupName,
              key: formatDate(new Date(biometric.date), { mode: 'wide', year: false, time: false }),
              value: biometric[selectedBiometrics.value],
              date: biometric.date,
            }
          );
        }),
    [patientBiometrics, selectedBiometrics.groupName, selectedBiometrics.value],
  );

  const chartOptions = React.useMemo(() => {
    return {
      axes: {
        bottom: {
          title: 'Date',
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
        scale: chartColors,
      },
      tooltip: {
        customHTML: ([{ value, date }]) =>
          `<div class="cds--tooltip cds--tooltip--shown" style="min-width: max-content; font-weight:600">${formatDate(
            parseDate(date),
            { year: true },
          )} - 
          <span style="color: #c6c6c6; font-size: 1rem; font-weight:400">${value}</span></div>`,
      },
    };
  }, [selectedBiometrics]);

  return (
    <div className={styles.biometricChartContainer}>
      <div className={styles.biometricSignsArea}>
        <label className={styles.biometricSign} htmlFor="biometrics-chart-radio-group">
          {t('biometricDisplayed', 'Biometric Displayed')}
        </label>
        <Tabs className={styles.verticalTabs} type="default">
          <TabList className={styles.tablist} aria-label="Biometrics tabs">
            {[
              { id: 'weight', label: `Weight (${conceptUnits.get(config.concepts.weightUuid) ?? ''})` },
              { id: 'height', label: `Height (${conceptUnits.get(config.concepts.heightUuid) ?? ''})` },
              { id: 'bmi', label: `BMI (${bmiUnit})` },
            ].map(({ id, label }) => (
              <Tab
                key={id}
                className={`${styles.tab} ${styles.bodyLong01} ${
                  selectedBiometrics.title === label && styles.selectedTab
                }`}
                onClick={() =>
                  setSelectedBiometrics({
                    title: label,
                    value: id,
                    groupName: id,
                  })
                }
              >
                {label}
              </Tab>
            ))}
          </TabList>
        </Tabs>
      </div>
      <div className={styles.biometricChartArea}>
        <LineChart data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};

export default BiometricsChart;
