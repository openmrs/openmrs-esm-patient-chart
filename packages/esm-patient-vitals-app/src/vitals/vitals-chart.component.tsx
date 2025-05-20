import React, { useId, useMemo, useState } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Tab, TabListVertical, TabPanel, TabPanels, TabsVertical } from '@carbon/react';
import { LineChart, ScaleTypes } from '@carbon/charts-react';
import { formatDate, parseDate } from '@openmrs/esm-framework';
import { type ConfigObject } from '../config-schema';
import { withUnit, type PatientVitalsAndBiometrics } from '../common';
import styles from './vitals-chart.scss';

interface VitalsChartProps {
  conceptUnits: Map<string, string>;
  config: ConfigObject;
  patientVitals: Array<PatientVitalsAndBiometrics>;
}

type VitalSignKey = 'systolic' | 'spo2' | 'temperature' | 'respiratoryRate' | 'pulse';

interface VitalsChartData {
  title: string;
  value: VitalSignKey;
}

const VitalsChart: React.FC<VitalsChartProps> = ({ patientVitals, conceptUnits, config }) => {
  const { t } = useTranslation();
  const id = useId();
  const [selectedVitalsSign, setSelectedVitalsSign] = useState<VitalsChartData>({
    title: `${t('bp', 'BP')} (${conceptUnits.get(config.concepts.systolicBloodPressureUuid)})`,
    value: 'systolic',
  });

  const vitalSigns: { id: string; title: string; value: VitalSignKey }[] = [
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
      .filter((vitals) => vitals[selectedVitalsSign.value])
      .slice(0, 10)
      .sort((vitalA, vitalB) => new Date(vitalA.date).getTime() - new Date(vitalB.date).getTime())
      .map((vitals) => {
        if (['systolic', 'diastolic'].includes(selectedVitalsSign.value)) {
          return [
            {
              group: 'Systolic blood pressure',
              key: formatDate(parseDate(vitals.date), { year: true }),
              value: vitals.systolic,
              date: vitals.date,
            },
            {
              group: 'Diastolic blood pressure',
              key: formatDate(parseDate(vitals.date), { year: true }),
              value: vitals.diastolic,
              date: vitals.date,
            },
          ];
        }
        return {
          group: selectedVitalsSign.value,
          key: formatDate(parseDate(vitals.date)),
          value: vitals[selectedVitalsSign.value],
          date: vitals.date,
        };
      });
  }, [patientVitals, selectedVitalsSign]);

  const chartOptions = {
    title: selectedVitalsSign.title,
    axes: {
      bottom: {
        title: t('date', 'Date'),
        mapsTo: 'date',
        scaleType: ScaleTypes.TIME,
      },
      left: {
        mapsTo: 'value',
        title: selectedVitalsSign.title,
        scaleType: ScaleTypes.LINEAR,
        includeZero: false,
      },
    },
    legend: {
      enabled: false,
    },
    color: {
      scale: {
        [selectedVitalsSign.title]: '#6929c4',
      },
    },
    tooltip: {
      customHTML: ([{ value, group, key }]) =>
        `<div class="cds--tooltip cds--tooltip--shown" style="min-width: max-content; font-weight:600">${value} - ${String(
          group,
        ).toUpperCase()}
        <span style="color: #c6c6c6; font-size: 1rem; font-weight:600">${key}</span></div>`,
    },
    zoomBar: {
      top: {
        enabled: true,
      },
    },
    height: '400px',
  };

  return (
    <div className={styles.vitalsChartContainer}>
      <div className={styles.vitalSignsArea}>
        <label className={styles.vitalsSignLabel} htmlFor={`${id}-tab`}>
          {t('vitalSignDisplayed', 'Vital sign displayed')}
        </label>
        <TabsVertical>
          <TabListVertical aria-label="Vitals tabs">
            {vitalSigns.map(({ id, title, value }) => (
              <Tab
                className={classNames(styles.tab, { [styles.selectedTab]: selectedVitalsSign.title === title })}
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
            ))}
          </TabListVertical>
          <TabPanels>
            {vitalSigns.map(({ id, title, value }) => (
              <TabPanel key={id}>
                <LineChart
                  data={chartData
                    .flat()
                    .filter((data) =>
                      value === 'systolic'
                        ? data.group === 'Systolic blood pressure' || data.group === 'Diastolic blood pressure'
                        : data.group === value,
                    )}
                  options={chartOptions}
                />
              </TabPanel>
            ))}
          </TabPanels>
        </TabsVertical>
      </div>
    </div>
  );
};

export default VitalsChart;
