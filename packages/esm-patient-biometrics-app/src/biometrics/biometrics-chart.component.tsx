import React from 'react';
import styles from './biometrics-chart.component.scss';
import { Tab, Tabs } from 'carbon-components-react';
import { LineChart } from '@carbon/charts-react';
import { LineChartOptions } from '@carbon/charts/interfaces/charts';
import { ScaleTypes } from '@carbon/charts/interfaces/enums';
import { formatDate } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import { ConfigObject } from '../config-schema';

interface BiometricsChartProps {
  patientBiometrics: Array<any>;
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
        .map((biometric) => {
          return (
            biometric[selectedBiometrics.value] && {
              group: selectedBiometrics.groupName,
              key: formatDate(new Date(biometric.date), { mode: 'wide', year: false, time: false }),
              value: biometric[selectedBiometrics.value],
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
