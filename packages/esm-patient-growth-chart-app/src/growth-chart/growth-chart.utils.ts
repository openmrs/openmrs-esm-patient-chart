import type { TFunction } from 'i18next';
import { ScaleTypes, ToolbarControlTypes } from '@carbon/charts/interfaces';
import boysWeightData from '../who-data/boys/weight-for-age.json';
import girlsWeightData from '../who-data/girls/weight-for-age.json';

export const getReferenceSeries = (gender?: string) => {
  const whoData = gender?.toLowerCase() === 'female' ? girlsWeightData : boysWeightData;
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

export const getChartOptions = (t: TFunction) => {
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
      }) as unknown as number,
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
