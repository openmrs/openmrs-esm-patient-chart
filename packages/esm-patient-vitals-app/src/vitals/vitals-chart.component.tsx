import React, { useMemo } from 'react';
import styles from './vitals-chart.component.scss';
import { useTranslation } from 'react-i18next';
import { Tab, Tabs } from 'carbon-components-react';
import { PatientVitals } from './vitals.resource';
import { LineChart } from '@carbon/charts-react';
import { LineChartOptions } from '@carbon/charts/interfaces/charts';
import { ScaleTypes } from '@carbon/charts/interfaces/enums';
import { withUnit } from '@openmrs/esm-patient-common-lib';
import '@carbon/charts/styles.css';
import { ConfigObject } from '../config-schema';
import { formatDate, parseDate } from '@openmrs/esm-framework';

interface vitalsChartData {
  title: string;
  value: number | string;
}

interface VitalsChartProps {
  patientVitals: Array<PatientVitals>;
  conceptUnits: Map<string, string>;
  config: ConfigObject;
}

const VitalsChart: React.FC<VitalsChartProps> = ({ patientVitals, conceptUnits, config }) => {
  const { t } = useTranslation();
  const [selectedVitalSign, setSelectedVitalsSign] = React.useState<vitalsChartData>({
    title: `BP (${conceptUnits.get(config.concepts.systolicBloodPressureUuid)})`,
    value: 'systolic',
  });

  const chartData = useMemo(() => {
    return patientVitals
      .filter((vitals) => vitals[selectedVitalSign.value])
      .map((vitals) => {
        return (
          vitals[selectedVitalSign.value] && {
            group: 'vitalsChartData',
            key: formatDate(parseDate(vitals.date.toString()), { mode: 'wide', year: false }),
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
      title: withUnit('BP', conceptUnits.get(config.concepts.systolicBloodPressureUuid) ?? '-'),
      value: 'systolic',
    },
    {
      id: 'oxygenSaturation',
      title: withUnit('SPO2', conceptUnits.get(config.concepts.oxygenSaturationUuid) ?? '-'),
      value: 'oxygenSaturation',
    },
    {
      id: 'temperature',
      title: withUnit('Temp', conceptUnits.get(config.concepts.temperatureUuid) ?? '-'),
      value: 'temperature',
    },
    {
      id: 'Respiratory Rate',
      title: withUnit('R. Rate', conceptUnits.get(config.concepts.respiratoryRateUuid) ?? '-'),
      value: 'respiratoryRate',
    },
    {
      id: 'pulse',
      title: withUnit('Pulse', conceptUnits.get(config.concepts.pulseUuid) ?? '-'),
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
