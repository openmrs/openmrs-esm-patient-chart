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
  label: string;
  title: string;
  value: VitalSignKey;
  unit: string;
}

const VitalsChart: React.FC<VitalsChartProps> = ({ patientVitals, conceptUnits, config }) => {
  const { t } = useTranslation();
  const labelId = useId();
  const [selectedVitalsSign, setSelectedVitalsSign] = useState<VitalsChartData>({
    label: t('bp', 'BP'),
    title: withUnit(t('bp', 'BP'), conceptUnits.get(config.concepts.systolicBloodPressureUuid) ?? '-'),
    value: 'systolic',
    unit: conceptUnits.get(config.concepts.systolicBloodPressureUuid) ?? '',
  });

  const vitalSigns: { id: string; label: string; title: string; value: VitalSignKey; unit: string }[] = [
    {
      id: 'bloodPressure',
      label: t('bp', 'BP'),
      title: withUnit(t('bp', 'BP'), conceptUnits.get(config.concepts.systolicBloodPressureUuid) ?? '-'),
      value: 'systolic',
      unit: conceptUnits.get(config.concepts.systolicBloodPressureUuid) ?? '',
    },
    {
      id: 'oxygenSaturation',
      label: t('spo2', 'SpO2'),
      title: withUnit(t('spo2', 'SpO2'), conceptUnits.get(config.concepts.oxygenSaturationUuid) ?? '-'),
      value: 'spo2',
      unit: conceptUnits.get(config.concepts.oxygenSaturationUuid) ?? '',
    },
    {
      id: 'temperature',
      label: t('temp', 'Temp'),
      title: withUnit(t('temp', 'Temp'), conceptUnits.get(config.concepts.temperatureUuid) ?? '-'),
      value: 'temperature',
      unit: conceptUnits.get(config.concepts.temperatureUuid) ?? '',
    },
    {
      id: 'respiratoryRate',
      label: t('respiratoryRate', 'R. rate'),
      title: withUnit(t('respiratoryRate', 'R. rate'), conceptUnits.get(config.concepts.respiratoryRateUuid) ?? '-'),
      value: 'respiratoryRate',
      unit: conceptUnits.get(config.concepts.respiratoryRateUuid) ?? '',
    },
    {
      id: 'pulse',
      label: t('pulse', 'Pulse'),
      title: withUnit(t('pulse', 'Pulse'), conceptUnits.get(config.concepts.pulseUuid) ?? '-'),
      value: 'pulse',
      unit: conceptUnits.get(config.concepts.pulseUuid) ?? '',
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
          group: selectedVitalsSign.title,
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
      customHTML: ([{ value, group, date }]) => {
        const dateLabel = t('date', 'Date');
        const label = group === selectedVitalsSign.title ? selectedVitalsSign.label : group;
        return `<div class="cds--tooltip cds--tooltip--shown" style="min-width: max-content; font-weight:600">
            <div style="font-size:1rem; line-height:1.4">${label}: <span>${value} ${selectedVitalsSign.unit}</span></div>
            <div style="color:#6F6F6F; font-size:0.875rem; font-weight:500; margin-top:0.125rem">${dateLabel}: ${formatDate(parseDate(date))}</div>
          </div>`;
      },
    },
    toolbar: {
      enabled: true,
      numberOfIcons: 4,
      controls: [
        {
          type: 'Zoom in',
        },
        {
          type: 'Zoom out',
        },
        {
          type: 'Reset zoom',
        },
        {
          type: 'Export as CSV',
        },
        {
          type: 'Export as PNG',
        },
        {
          type: 'Make fullscreen',
        },
      ],
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
        <label className={styles.vitalsSignLabel} id={labelId}>
          {t('vitalSignDisplayed', 'Vital sign displayed')}
        </label>
        <TabsVertical>
          <TabListVertical aria-labelledby={labelId}>
            {vitalSigns.map(({ id, label, title, value, unit }) => (
              <Tab
                className={classNames(styles.tab, { [styles.selectedTab]: selectedVitalsSign.title === title })}
                id={`${id}-tab`}
                key={id}
                onClick={() =>
                  setSelectedVitalsSign({
                    label,
                    title,
                    value,
                    unit,
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
                        : data.group === title,
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
