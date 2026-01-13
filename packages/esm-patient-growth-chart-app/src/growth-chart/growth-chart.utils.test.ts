import { transformGrowthChartData } from './growth-chart.utils';
import { formatDate, parseDate } from '@openmrs/esm-framework';
import type { Observation } from './growth-chart.resource';

// Mock @openmrs/esm-framework
jest.mock('@openmrs/esm-framework', () => ({
  formatDate: jest.fn(),
  parseDate: jest.fn(),
}));

describe('growth-chart.utils', () => {
  const mockFormatDate = formatDate as jest.Mock;
  const mockParseDate = parseDate as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockFormatDate.mockImplementation((date) => `Formatted ${date}`);
    mockParseDate.mockImplementation((date) => date);
  });

  const createMockObservation = (date: string, value: number, unit: string, id: string): Observation => ({
    id,
    effectiveDateTime: date,
    value,
    unit,
    code: 'concept-code',
  });

  it('should transform empty input to empty array', () => {
    const result = transformGrowthChartData([], []);
    expect(result).toEqual([]);
  });

  it('should merge height and weight observations for the same date', () => {
    const date = '2023-01-01';
    const heightObs = createMockObservation(date, 170, 'cm', 'h1');
    const weightObs = createMockObservation(date, 70, 'kg', 'w1');

    const result = transformGrowthChartData([heightObs], [weightObs]);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      id: 'h1',
      date: `Formatted ${date}`,
      height: '170 cm',
      weight: '70 kg',
      rawDate: date,
    });
  });

  it('should handle only height', () => {
    const date = '2023-01-01';
    const heightObs = createMockObservation(date, 170, 'cm', 'h1');

    const result = transformGrowthChartData([heightObs], []);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      id: 'h1',
      date: `Formatted ${date}`,
      height: '170 cm',
      weight: '-',
      rawDate: date,
    });
  });

  it('should handle only weight', () => {
    const date = '2023-01-01';
    const weightObs = createMockObservation(date, 70, 'kg', 'w1');

    const result = transformGrowthChartData([], [weightObs]);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      id: 'w1',
      date: `Formatted ${date}`,
      height: '-',
      weight: '70 kg',
      rawDate: date,
    });
  });

  it('should sort by date descending', () => {
    const date1 = '2023-01-01';
    const date2 = '2023-01-02';
    const obs1 = createMockObservation(date1, 10, 'kg', '1');
    const obs2 = createMockObservation(date2, 20, 'kg', '2');

    // Passing as weights, so weights processing
    const result = transformGrowthChartData([], [obs1, obs2]);

    expect(result).toHaveLength(2);
    expect(result[0].rawDate).toBe(date2);
    expect(result[1].rawDate).toBe(date1);
  });
});
