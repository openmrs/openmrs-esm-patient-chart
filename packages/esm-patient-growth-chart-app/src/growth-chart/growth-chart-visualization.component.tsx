import React from 'react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { Tile, Layer } from '@carbon/react';
import { LineChart } from '@carbon/charts-react';
import { ScaleTypes, ToolbarControlTypes } from '@carbon/charts/interfaces';
import { EmptyDataIllustration } from '@openmrs/esm-patient-common-lib';
import { getReferenceSeries, getPatientSeries } from './growth-chart.utils';
import type { GrowthChartData, Observation } from './growth-chart.resource';
import '@carbon/charts/styles.css';
import styles from './growth-chart-main.scss';

interface GrowthChartVisualizationProps {
  data: GrowthChartData;
}

const GrowthChartVisualization: React.FC<GrowthChartVisualizationProps> = ({ data }) => {
  const { t } = useTranslation();
  const { patient, weights } = data;

  const birthDate = React.useMemo(() => dayjs(patient?.birthDate), [patient?.birthDate]);
  const ageInMonths = React.useMemo(() => {
    if (!birthDate.isValid()) {
      return null;
    }
    return dayjs().diff(birthDate, 'month', true);
  }, [birthDate]);

  const chartData = React.useMemo(() => {
    if (!patient || !weights || !birthDate.isValid()) {
      return [];
    }
    return getChartData(patient, weights, t);
  }, [patient, weights, t, birthDate]);

  const chartOptions = React.useMemo(() => getChartOptions(t), [t]);

  if (!patient) {
    return null;
  }

  if (ageInMonths !== null && ageInMonths > 60) {
    return (
      <div className={styles.emptyStateContainer}>
        <Layer>
          <Tile className={styles.emptyStateTile}>
            <div className={styles.emptyStateHeading}>
              <h4>{t('growthChartUnavailable', 'Growth Chart Unavailable')}</h4>
            </div>
            <EmptyDataIllustration />
            <p className={styles.emptyStateContent}>
              {t('growthChartAgeRestriction', 'Growth charts are only applicable for children under 5 years of age.')}
            </p>
          </Tile>
        </Layer>
      </div>
    );
  }

  return (
    <div className={styles.chartContainer}>
      <LineChart data={chartData} options={chartOptions} />
    </div>
  );
};

const getChartData = (patient: any, weights: Observation[], t: any) => {
  const birthDate = dayjs(patient.birthDate);
  if (!birthDate.isValid()) {
    console.warn('Invalid birth date for patient');
    return [];
  }

  const referenceSeries = getReferenceSeries(patient.gender);
  const patientSeries = getPatientSeries(weights, birthDate, t('patientWeight', 'Patient Weight'));

  return [...referenceSeries, ...patientSeries];
};

const getChartOptions = (t: any) => {
  const referencePalette = {
    P3: '#ff8389',
    P15: '#f1c21b',
    P50: '#42be65',
    P85: '#f1c21b',
    P97: '#ff8389',
  };

  return {
    title: t('weightForAge', 'Weight for Age (0-5 Years)'),
    axes: {
      bottom: {
        title: t('ageInMonths', 'Age (Months)'),
        mapsTo: 'age',
        scaleType: ScaleTypes.LINEAR,
        ticks: {
          values: Array.from({ length: 31 }, (_, i) => i * 2),
          formatter: (value) => value,
        },
      },
      left: {
        title: t('weightKg', 'Weight (kg)'),
        mapsTo: 'value',
        scaleType: ScaleTypes.LINEAR,
        ticks: {
          values: [0, 5, 10, 15, 20, 25],
        },
      },
    },
    curve: 'curveMonotoneX',
    height: '800px',
    points: {
      radius: ((d) => {
        if (d.group === t('patientWeight', 'Patient Weight')) {
          return 3;
        }
        return 0;
      }) as any,
    },
    legend: {
      position: 'bottom',
    },
    color: {
      scale: {
        ...referencePalette,
        [t('patientWeight', 'Patient Weight')]: '#000000',
      },
    },
    grid: {
      x: {
        alignWithAxisTicks: true,
      },
    },
    toolbar: {
      controls: [
        { type: ToolbarControlTypes.MAKE_FULLSCREEN },
        { type: ToolbarControlTypes.EXPORT_CSV },
        { type: ToolbarControlTypes.EXPORT_PNG },
        { type: ToolbarControlTypes.EXPORT_JPG },
      ],
    },
    getIsFilled: (group) => {
      if (group === t('patientWeight', 'Patient Weight')) {
        return true;
      }
      return false;
    },
    tooltip: {
      valueFormatter: (value, label) => {
        if (label === t('ageInMonths', 'Age (Months)')) {
          return Math.floor(value);
        }
        return value;
      },
      showTotal: false,
    },
  };
};

export default GrowthChartVisualization;
