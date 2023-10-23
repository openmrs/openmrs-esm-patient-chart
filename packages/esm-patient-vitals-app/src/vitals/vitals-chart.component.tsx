import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Tab, Tabs, TabList } from '@carbon/react';
import { LineChart } from '@carbon/charts-react';
import { formatDate, parseDate } from '@openmrs/esm-framework';
import { withUnit } from '@openmrs/esm-patient-common-lib';
import { ConfigObject } from '../config-schema';
import { type PatientVitals } from '../common';
import styles from './vitals-chart.scss';

enum ScaleTypes {
  LABELS = 'labels',
  LABELS_RATIO = 'labels_ratio',
  LINEAR = 'linear',
  LOG = 'log',
  TIME = 'time',
}

interface VitalsChartProps {
  conceptUnits: Map<string, string>;
  config: ConfigObject;
  patientVitals: Array<PatientVitals>;
}

interface VitalsChartData {
  title: string;
  value: string;
}

const VitalsChart: React.FC<VitalsChartProps> = ({ patientVitals, conceptUnits, config }) => {
  const { t } = useTranslation();
  const [selectedVitalSign, setSelectedVitalsSign] = React.useState<VitalsChartData>({
    title: `BP (${conceptUnits.get(config.concepts.systolicBloodPressureUuid)})`,
    value: 'systolic',
  });

  const vitalSigns = [
    {
      id: 'bloodPressure',
      title: withUnit('BP', conceptUnits.get(config.concepts.systolicBloodPressureUuid) ?? '-'),
      value: 'systolic',
    },
    {
      id: 'oxygenSaturation',
      title: withUnit('SPO2', conceptUnits.get(config.concepts.oxygenSaturationUuid) ?? '-'),
      value: 'spo2',
    },
    {
      id: 'temperature',
      title: withUnit('Temp', conceptUnits.get(config.concepts.temperatureUuid) ?? '-'),
      value: 'temperature',
    },
    {
      id: 'respiratoryRate',
      title: withUnit('R. Rate', conceptUnits.get(config.concepts.respiratoryRateUuid) ?? '-'),
      value: 'respiratoryRate',
    },
    {
      id: 'pulse',
      title: withUnit('Pulse', conceptUnits.get(config.concepts.pulseUuid) ?? '-'),
      value: 'pulse',
    },
  ];

  const chartData = useMemo(() => {
    return patientVitals
      .filter((vitals) => vitals[selectedVitalSign.value])
      .splice(0, 10)
      .sort((vitalA, vitalB) => new Date(vitalA.date).getTime() - new Date(vitalB.date).getTime())
      .map((vitals) => {
        if (vitals[selectedVitalSign.value]) {
          if (['systolic', 'diastolic'].includes(selectedVitalSign.value)) {
            return [
              {
                group: 'Systolic blood pressure',
                key: formatDate(parseDate(vitals.date.toString()), { year: false }),
                value: vitals.systolic,
                date: vitals.date,
              },
              {
                group: 'Diastolic blood pressure',
                key: formatDate(parseDate(vitals.date.toString()), { year: false }),
                value: vitals.diastolic,
                date: vitals.date,
              },
            ];
          } else {
            return {
              group: selectedVitalSign.title,
              key: formatDate(parseDate(vitals.date.toString()), { year: false }),
              value: vitals[selectedVitalSign.value],
              date: vitals.date,
            };
          }
        }
      });
  }, [patientVitals, selectedVitalSign]);

  const chartOptions = {
    title: selectedVitalSign.title,
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
      scale: {
        [selectedVitalSign.title]: '#6929c4',
      },
    },
    tooltip: {
      customHTML: ([{ value, group, key }]) =>
        `<div class="cds--tooltip cds--tooltip--shown" style="min-width: max-content; font-weight:600">${value} - ${String(
          group,
        ).toUpperCase()}
        <span style="color: #c6c6c6; font-size: 1rem; font-weight:600">${key}</span></div>`,
    },
    height: '400px',
  };

  return (
    <div className={styles.vitalsChartContainer}>
      <div className={styles.vitalSignsArea}>
        <label className={styles.vitalsSignLabel} htmlFor="vitals-chart-tab-group">
          {t('vitalSignDisplayed', 'Vital sign displayed')}
        </label>
        <Tabs className={styles.verticalTabs}>
          <TabList className={styles.tablist} aria-label="Vitals tabs">
            {vitalSigns.map(({ id, title, value }) => {
              return (
                <Tab
                  key={id}
                  className={`${styles.tab} ${selectedVitalSign.title === title && styles.selectedTab}`}
                  onClick={() =>
                    setSelectedVitalsSign({
                      title: title,
                      value: value,
                    })
                  }
                >
                  {title}
                </Tab>
              );
            })}
          </TabList>
        </Tabs>
      </div>
      <div className={styles.vitalsChartArea}>
        <LineChart data={chartData.flat()} options={chartOptions} />
      </div>
    </div>
  );
};

export default VitalsChart;
