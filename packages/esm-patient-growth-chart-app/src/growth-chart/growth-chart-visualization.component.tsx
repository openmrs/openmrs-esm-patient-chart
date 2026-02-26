import React, { useMemo } from 'react';
import { LineChart } from '@carbon/charts-react';
import { Tile, Layer } from '@carbon/react';
import { ScaleTypes, ToolbarControlTypes } from '@carbon/charts/interfaces';
import '@carbon/charts/styles.css';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import boysWeightData from '../who-data/boys/weight-for-age.json';
import girlsWeightData from '../who-data/girls/weight-for-age.json';
import type { GrowthChartData } from './growth-chart.resource';
import { EmptyDataIllustration } from '@openmrs/esm-patient-common-lib';
import styles from './growth-chart-main.scss';

interface GrowthChartVisualizationProps {
  data: GrowthChartData;
}

const GrowthChartVisualization: React.FC<GrowthChartVisualizationProps> = ({ data }) => {
  const { t } = useTranslation();
  const { patient } = data;

  if (!patient) {
    return null;
  }

  const birthDate = dayjs(patient.birthDate);
  const today = dayjs();
  const ageInMonths = today.diff(birthDate, 'month', true);

  if (ageInMonths > 60) {
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

  return <GrowthChart data={data} />;
};

const GrowthChart: React.FC<GrowthChartVisualizationProps> = ({ data }) => {
  const { t } = useTranslation();
  const { patient, weights } = data;

  const chartData = useMemo(() => {
    if (!patient || !weights) return [];

    const birthDate = dayjs(patient.birthDate);
    if (!birthDate.isValid()) {
      console.warn('Invalid birth date for patient');
      return [];
    }

    const referenceSeries = getReferenceSeries(patient.gender);
    const patientSeries = getPatientSeries(weights, birthDate, t);

    return [...referenceSeries, ...patientSeries];
  }, [patient, weights, t]);

  const options = useMemo(() => {
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
            formatter: (value) => {
              // Return the value as is. Styling handled in CSS.
              return value;
            },
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
  }, [t]);

  return (
    <div className={styles.chartContainer}>
      <LineChart data={chartData} options={options} />
    </div>
  );
};

const getReferenceSeries = (gender: string) => {
  const whoData = gender.toLowerCase() === 'female' ? girlsWeightData : boysWeightData;
  const referenceSeries = [];
  const percentiles = ['P3', 'P15', 'P50', 'P85', 'P97'];

  whoData.forEach((point) => {
    percentiles.forEach((p) => {
      referenceSeries.push({
        group: p,
        age: point.age_months,
        value: point[p],
      });
    });
  });

  return referenceSeries;
};

const getPatientSeries = (weights: any[], birthDate: dayjs.Dayjs, t: any) => {
  return weights
    .map((obs) => {
      const obsDate = dayjs(obs.effectiveDateTime);
      if (!obsDate.isValid()) return null;

      const ageInMonths = obsDate.diff(birthDate, 'month', true);
      if (ageInMonths < 0) return null;

      return {
        group: t('patientWeight', 'Patient Weight'),
        age: ageInMonths,
        value: obs.value,
      };
    })
    .filter(Boolean)
    .sort((a, b) => a!.age - b!.age);
};

export default GrowthChartVisualization;
