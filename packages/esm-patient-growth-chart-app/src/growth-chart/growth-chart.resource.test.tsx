import React from 'react';
import { SWRConfig } from 'swr';
import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { getReferenceSeries, type Observation, useChartData } from './growth-chart.resource';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <SWRConfig value={{ dedupingInterval: 0, provider: () => new Map() }}>{children}</SWRConfig>
);

const weights: Array<Observation> = [{ id: '1', effectiveDateTime: '2023-02-01', value: 4.5, unit: 'kg' }];

const patientWeightPoint = { group: 'Patient weight', age: expect.closeTo(1, 0), value: 4.5 };

const makePatient = (overrides: Partial<fhir.Patient> = {}): fhir.Patient => ({
  resourceType: 'Patient',
  id: 'patient-uuid',
  gender: 'male',
  birthDate: '2023-01-01',
  ...overrides,
});

describe('useChartData', () => {
  it('reports loading and returns no data until the reference series has loaded', async () => {
    const { result } = renderHook(() => useChartData(makePatient(), weights), { wrapper });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toEqual([]);

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error).toBeUndefined();
  });

  it('combines the reference series for the patient gender with the patient weights', async () => {
    const { result } = renderHook(() => useChartData(makePatient(), weights), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const referenceSeries = await getReferenceSeries('male');
    expect(new Set(referenceSeries.map((d) => d.group))).toEqual(new Set(['P3', 'P15', 'P50', 'P85', 'P97']));
    expect(result.current.data).toEqual([...referenceSeries, patientWeightPoint]);
  });

  it('switches the reference series when the patient gender changes', async () => {
    const { result, rerender } = renderHook(({ patient }) => useChartData(patient, weights), {
      wrapper,
      initialProps: { patient: makePatient({ gender: 'male' }) },
    });

    const [maleSeries, femaleSeries] = await Promise.all([getReferenceSeries('male'), getReferenceSeries('female')]);
    expect(maleSeries).not.toEqual(femaleSeries);

    await waitFor(() => expect(result.current.data).toEqual([...maleSeries, patientWeightPoint]));

    rerender({ patient: makePatient({ gender: 'female' }) });

    await waitFor(() => expect(result.current.data).toEqual([...femaleSeries, patientWeightPoint]));
  });

  it('returns only the patient weights for genders without WHO reference data', async () => {
    const { result } = renderHook(() => useChartData(makePatient({ gender: 'unknown' }), weights), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toEqual([patientWeightPoint]);
  });

  it('surfaces an error when the reference data fails to load', async () => {
    vi.resetModules();
    vi.doMock('../who-data/girls/weight-for-age.json', () => {
      throw new Error('Failed to load WHO data');
    });
    const { useChartData: useChartDataWithFailingImport } = await import('./growth-chart.resource');

    const { result } = renderHook(() => useChartDataWithFailingImport(makePatient({ gender: 'female' }), weights), {
      wrapper,
    });

    await waitFor(() => expect(result.current.error).toBeDefined());

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toEqual([]);
  });

  it('returns no data without loading reference data when the patient has no valid birth date', () => {
    const { result: missing } = renderHook(() => useChartData(makePatient({ birthDate: undefined }), weights), {
      wrapper,
    });
    const { result: invalid } = renderHook(() => useChartData(makePatient({ birthDate: 'not-a-date' }), weights), {
      wrapper,
    });

    for (const result of [missing, invalid]) {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeUndefined();
      expect(result.current.data).toEqual([]);
    }
  });
});
