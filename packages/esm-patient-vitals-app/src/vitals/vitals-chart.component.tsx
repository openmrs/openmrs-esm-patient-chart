/* eslint-disable prettier/prettier */
import React from 'react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import styles from './vitals-chart.component.scss';
import Tab from 'carbon-components-react/es/components/Tab';
import Tabs from 'carbon-components-react/es/components/Tabs';
import { withUnit } from './vitals-biometrics-form/use-vitalsigns';
import { PatientVitals } from './vitals-biometrics.resource';
import { LineChart } from '@carbon/charts-react';
import { LineChartOptions } from '@carbon/charts/interfaces/charts';
import { ScaleTypes } from '@carbon/charts/interfaces/enums';
import '@carbon/charts/styles.css';

interface vitalsChartData {
  title: string;
  value: number | string;
}

interface VitalsChartProps {
  patientVitals: Array<PatientVitals>;
  conceptsUnits: Array<string>;
}

const VitalsChart: React.FC<VitalsChartProps> = ({ patientVitals, conceptsUnits }) => {
  const { t } = useTranslation();
  const [chartData, setChartData] = React.useState([]);
  const [bloodPressureUnit, , temperatureUnit, , , pulseUnit, oxygenSaturationUnit, , respiratoryRateUnit] =
    conceptsUnits;
  const [selectedVitalSign, setSelectedVitalsSign] = React.useState<vitalsChartData>({
    title: `BP (${bloodPressureUnit})`,
    value: 'systolic',
  });

  React.useEffect(() => {
    const chartData = patientVitals.map((vitals) => {
      return vitals[selectedVitalSign.value]
        ? {
          group: 'vitalsChartData',
          key: dayjs(vitals.date).format('DD-MMM'),
          value: vitals[selectedVitalSign.value],
        }
        : {};
    });
    setChartData(chartData);
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
        <Tabs
          className={styles.verticalTabs}
          name="vitals-tabs"
          type="default">
          {vitalSigns.map(({ id, title, value }) => {
            return <Tab
              key={id}
              className={`${styles.tab} ${styles.bodyLong01} ${selectedVitalSign.title === title && styles.selectedTab}`}
              onClick={() => setSelectedVitalsSign({
                title: title,
                value: value,
              })
              }
              label={title}
            />
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
