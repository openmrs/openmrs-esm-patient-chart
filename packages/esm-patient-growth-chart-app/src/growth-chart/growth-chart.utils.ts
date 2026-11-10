import dayjs from 'dayjs';
import type { TFunction } from 'i18next';
import { ToolbarControlTypes } from '@carbon/charts';
import { type LineChartOptions, ScaleTypes } from '@carbon/charts-react';
import { getCoreTranslation } from '@openmrs/esm-framework';
import type { Observation } from './growth-chart.resource';

export interface ChartDatum {
  group: string;
  age: number;
  value: number;
}

export const getPatientSeries = (weights: Array<Observation>, birthDate: dayjs.Dayjs, patientWeightLabel: string) => {
  return weights
    .map((observation) => {
      if (!observation.effectiveDateTime || observation.value == null) {
        return null;
      }

      const observationDate = dayjs(observation.effectiveDateTime);
      if (!observationDate.isValid()) {
        return null;
      }

      const ageInMonths = observationDate.diff(birthDate, 'month', true);
      if (ageInMonths < 0) {
        return null;
      }

      return {
        group: patientWeightLabel,
        age: ageInMonths,
        value: observation.value,
      };
    })
    .filter((item): item is ChartDatum => item !== null)
    .sort((a, b) => a.age - b.age);
};

export const getChartOptions = (t: TFunction): LineChartOptions => {
  const patientWeightLabel = t('patientWeight', 'Patient weight');
  const referencePalette = {
    P3: 'var(--growth-chart-p3-p97)',
    P15: 'var(--growth-chart-p15-p85)',
    P50: 'var(--growth-chart-p50)',
    P85: 'var(--growth-chart-p15-p85)',
    P97: 'var(--growth-chart-p3-p97)',
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
        if (d.group === patientWeightLabel) {
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
        [patientWeightLabel]: 'var(--growth-chart-patient)',
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
    getIsFilled: (group) => group === patientWeightLabel,
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
