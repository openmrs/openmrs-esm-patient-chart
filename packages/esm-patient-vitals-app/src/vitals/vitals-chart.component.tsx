import React, { useId, useMemo } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Tab, Tabs, TabList } from '@carbon/react';
import { LineChart } from '@carbon/charts-react';
import { formatDate, parseDate } from '@openmrs/esm-framework';
import { type ConfigObject } from '../config-schema';
import { withUnit, type PatientVitalsAndBiometrics } from '../common';
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
  patientVitals: Array<PatientVitalsAndBiometrics>;
}

interface VitalsChartData {
  title: string;
  value: string;
}

const VitalsChart: React.FC<VitalsChartProps> = ({ patientVitals, conceptUnits, config }) => {
  const { t } = useTranslation();
  const id = useId();
  const [selectedVitalSign, setSelectedVitalsSign] = React.useState<VitalsChartData>({
    title: `${t('bp', 'BP')} (${conceptUnits.get(config.concepts.systolicBloodPressureUuid)})`,
    value: 'systolic',
  });

  const vitalSigns = [
    {
      id: 'bloodPressure',
      title: withUnit(t('bp', 'BP'), conceptUnits.get(config.concepts.systolicBloodPressureUuid) ?? '-'),
      value: 'systolic',
    },
    {
      id: 'oxygenSaturation',
      title: withUnit(t('spo2', 'SpO2'), conceptUnits.get(config.concepts.oxygenSaturationUuid) ?? '-'),
      value: 'spo2',
    },
    {
      id: 'notes',
      title: withUnit(t('notes', 'Notes'), conceptUnits.get(config.concepts.notesUuid) ?? '-'),
      value: 'notes',
    },
    {
      id: 'temperature',
      title: withUnit(t('temp', 'Temp'), conceptUnits.get(config.concepts.temperatureUuid) ?? '-'),
      value: 'temperature',
    },
    {
      id: 'respiratoryRate',
      title: withUnit(t('respiratoryRate', 'R. rate'), conceptUnits.get(config.concepts.respiratoryRateUuid) ?? '-'),
      value: 'respiratoryRate',
    },
    {
      id: 'pulse',
      title: withUnit(t('pulse', 'Pulse'), conceptUnits.get(config.concepts.pulseUuid) ?? '-'),
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
        title: t('date', 'Date'),
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
        <label className={styles.vitalsSignLabel} htmlFor={`${id}-tab`}>
          {t('vitalSignDisplayed', 'Vital sign displayed')}
        </label>
        <Tabs className={styles.verticalTabs}>
          <TabList className={styles.tablist} aria-label="Vitals tabs">
            {vitalSigns.map(({ id, title, value }) => {
              return (
                <Tab
                  className={classNames(styles.tab, { [styles.selectedTab]: selectedVitalSign.title === title })}
                  id={`${id}-tab`}
                  key={id}
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
