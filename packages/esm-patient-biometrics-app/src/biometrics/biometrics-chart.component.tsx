import React from 'react';
import styles from './biometrics-chart.component.scss';
import { Tab, Tabs } from 'carbon-components-react';
import { LineChart } from '@carbon/charts-react';
import { LineChartOptions } from '@carbon/charts/interfaces/charts';
import { ScaleTypes } from '@carbon/charts/interfaces/enums';
import { formatDate, parseDate } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import { ConfigObject } from '../config-schema';
import { PatientBiometrics } from './biometrics.resource';

interface BiometricsChartProps {
  patientBiometrics: Array<PatientBiometrics>;
  conceptUnits: Map<string, string>;
  config: ConfigObject;
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
        .filter((biometric) => biometric[selectedBiometrics.value])
        .splice(0, 10)
        .sort((BiometricA, BiometricB) => new Date(BiometricA.date).getTime() - new Date(BiometricB.date).getTime())
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

  const chartOptions: LineChartOptions = React.useMemo(() => {
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
          `<div class="bx--tooltip bx--tooltip--shown" style="min-width: max-content; font-weight:600">${formatDate(
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
              label={label}
            />
          ))}
        </Tabs>
      </div>
      <div className={styles.biometricChartArea}>
        <LineChart data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};

export default BiometricsChart;
