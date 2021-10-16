import React, { useMemo } from 'react';
import dayjs from 'dayjs';
import styles from './vitals-chart.component.scss';
import { useTranslation } from 'react-i18next';
import { Tab, Tabs } from 'carbon-components-react';
import { PatientVitals } from './vitals.resource';
import { LineChart } from '@carbon/charts-react';
import { LineChartOptions } from '@carbon/charts/interfaces/charts';
import { ScaleTypes } from '@carbon/charts/interfaces/enums';
import { withUnit } from '@openmrs/esm-patient-common-lib';
import '@carbon/charts/styles.css';

interface vitalsChartData {
  title: string;
  value: number | string;
}

interface VitalsChartProps {
  patientVitals: Array<PatientVitals>;
  conceptUnits: Array<string>;
}

const VitalsChart: React.FC<VitalsChartProps> = ({ patientVitals, conceptUnits }) => {
  const { t } = useTranslation();
  const [bloodPressureUnit, , temperatureUnit, , , pulseUnit, oxygenSaturationUnit, , respiratoryRateUnit] =
    conceptUnits;
  const [selectedVitalSign, setSelectedVitalsSign] = React.useState<vitalsChartData>({
    title: `BP (${bloodPressureUnit})`,
    value: 'systolic',
  });

  const chartData = useMemo(() => {
    return patientVitals
      .filter((vitals) => vitals[selectedVitalSign.value])
      .map((vitals) => {
        return (
          vitals[selectedVitalSign.value] && {
            group: 'vitalsChartData',
            key: dayjs(vitals.date).format('DD-MMM'),
            value: vitals[selectedVitalSign.value],
          }
        );
      });
  }, [patientVitals, selectedVitalSign]);

  const chartColors = {
    'Blood Pressure': '#6929c4',
    'Oxygen Saturation': '#6929c4',
    Temperature: '#6929c4',
    'Respiratory Rate': '#6929c4',
    Pulse: '#6929c4',
  };

  const chartOptions: LineChartOptions = {
    axes: {
      bottom: {
        title: 'Date',
        mapsTo: 'key',
        scaleType: ScaleTypes.LABELS,
      },
      left: {
        mapsTo: 'value',
        title: selectedVitalSign.title,
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

  const vitalSigns = [
    {
      id: 'bloodPressure',
      title: withUnit('BP', bloodPressureUnit),
      value: 'systolic',
    },
    {
      id: 'oxygenSaturation',
      title: withUnit('SPO2', oxygenSaturationUnit),
      value: 'oxygenSaturation',
    },
    {
      id: 'temperature',
      title: withUnit('Temp', temperatureUnit),
      value: 'temperature',
    },
    {
      id: 'Respiratory Rate',
      title: withUnit('R. Rate', respiratoryRateUnit),
      value: 'respiratoryRate',
    },
    {
      id: 'pulse',
      title: withUnit('Pulse', pulseUnit),
      value: 'pulse',
    },
  ];

  return (
    <div className={styles.vitalsChartContainer}>
      <div className={styles.vitalSignsArea} style={{ flex: 1 }}>
        <label className={styles.vitalsSign} htmlFor="vitals-chart-tab-group">
          {t('vitalSignDisplayed', 'Vital Sign Displayed')}
        </label>
        <Tabs className={styles.verticalTabs} type="default">
          {vitalSigns.map(({ id, title, value }) => {
            return (
              <Tab
                key={id}
                className={`${styles.tab} ${styles.bodyLong01} ${
                  selectedVitalSign.title === title && styles.selectedTab
                }`}
                onClick={() =>
                  setSelectedVitalsSign({
                    title: title,
                    value: value,
                  })
                }
                label={title}
              />
            );
          })}
        </Tabs>
      </div>
      <div className={styles.vitalsChartArea} style={{ flex: 4 }}>
        <LineChart data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};

export default VitalsChart;
