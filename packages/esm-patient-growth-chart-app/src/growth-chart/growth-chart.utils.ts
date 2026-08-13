import type { TFunction } from 'i18next';
import { ScaleTypes, ToolbarControlTypes } from '@carbon/charts/interfaces';
import { getCoreTranslation } from '@openmrs/esm-framework';
import boysWeightData from '../who-data/boys/weight-for-age.json';
import girlsWeightData from '../who-data/girls/weight-for-age.json';

export const getReferenceSeries = (gender?: string) => {
  const supportedGender = gender?.toLowerCase();
  const whoData = supportedGender === 'female' ? girlsWeightData : supportedGender === 'male' ? boysWeightData : null;

  if (!whoData) {
    return [];
  }

  const referenceSeries: Array<{ group: string; age: number; value: number }> = [];
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
    P3: 'var(--cds-support-error)',
    P15: 'var(--cds-support-warning)',
    P50: 'var(--cds-support-success)',
    P85: 'var(--cds-support-warning)',
    P97: 'var(--cds-support-error)',
  };

  return {
    title: t('weightForAge', 'Weight-for-age, birth to 5 years'),
    axes: {
      bottom: {
        title: t('ageInMonths', 'Age (months)'),
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
        if (d.group === t('patientWeight', 'Patient weight')) {
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
        [t('patientWeight', 'Patient weight')]: 'var(--cds-text-primary)',
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
      if (group === t('patientWeight', 'Patient weight')) {
        return true;
      }
      return false;
    },
    tooltip: {
      valueFormatter: (value, label) => {
        if (label === t('ageInMonths', 'Age (months)')) {
          return Math.floor(value);
        }
        return value;
      },
      showTotal: false,
    },
  };
};

export const getGenderTranslation = (gender: string | null | undefined) => {
  switch (gender?.toLowerCase()) {
    case 'male':
      return getCoreTranslation('male', 'Male');
    case 'female':
      return getCoreTranslation('female', 'Female');
    case 'other':
      return getCoreTranslation('other', 'Other');
    default:
      return getCoreTranslation('unknown', 'Unknown');
  }
};
