import { formatDate, parseDate } from '@openmrs/esm-framework';
import type { Observation } from './growth-chart.resource';

export interface TableRowData {
  id: string;
  date: string;
  height: string;
  weight: string;
  rawDate: string;
}

export function transformGrowthChartData(heights: Observation[], weights: Observation[]): TableRowData[] {
  const groupedMap = new Map<string, { height?: string; weight?: string; id: string }>();

  // Helper to process observations
  const processObs = (obsList: Observation[], type: 'height' | 'weight') => {
    obsList.forEach((obs) => {
      const dateKey = obs.effectiveDateTime;
      if (!groupedMap.has(dateKey)) {
        groupedMap.set(dateKey, { id: obs.id });
      }
      const existing = groupedMap.get(dateKey)!;
      existing[type] = `${obs.value} ${obs.unit}`;
    });
  };

  processObs(heights, 'height');
  processObs(weights, 'weight');

  return Array.from(groupedMap.entries())
    .map(([date, values]) => ({
      id: values.id,
      date: formatDate(parseDate(date)),
      height: values.height || '-',
      weight: values.weight || '-',
      rawDate: date,
    }))
    .sort((a, b) => new Date(b.rawDate).getTime() - new Date(a.rawDate).getTime());
}
