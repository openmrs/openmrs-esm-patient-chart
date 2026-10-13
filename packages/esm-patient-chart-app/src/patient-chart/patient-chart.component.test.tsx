import React from 'react';
import { screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  ErrorState,
  ExtensionSlot,
  launchWorkspaceGroup2,
  useLayoutType,
  usePatient,
  useVisit,
} from '@openmrs/esm-framework';
import { usePatientChartStore } from '@openmrs/esm-patient-common-lib';
import { mockFhirPatient } from '__mocks__';
import { renderWithSwr } from 'tools';
import ChartReview from './chart-review/chart-review.component';
import PatientChart from './patient-chart.component';

vi.mock('@openmrs/esm-patient-common-lib', () => ({
  setPatientChartWorkspaceGroupVisitUuid: vi.fn(),
  usePatientChartStore: vi.fn(),
}));

vi.mock('./chart-review/chart-review.component', () => ({
  default: vi.fn(() => <div>Patient dashboard</div>),
}));

const mockUsePatient = vi.mocked(usePatient);
const mockUseVisit = vi.mocked(useVisit);
const mockUsePatientChartStore = vi.mocked(usePatientChartStore);
const mockChartReview = vi.mocked(ChartReview);
const mockExtensionSlot = vi.mocked(ExtensionSlot);
const mockErrorState = vi.mocked(ErrorState);
const mockUseLayoutType = vi.mocked(useLayoutType);
const setPatient = vi.fn();
const setVisitContext = vi.fn();
const mutateVisitContext = vi.fn();

function patientChartRoute() {
  return (
    <MemoryRouter initialEntries={[`/patient/${mockFhirPatient.id}/chart/Patient%20Summary`]}>
      <Routes>
        <Route path="/patient/:patientUuid/chart/:view" element={<PatientChart />} />
      </Routes>
    </MemoryRouter>
  );
}

function renderPatientChart() {
  return renderWithSwr(patientChartRoute());
}

describe('PatientChart', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Render on a large-desktop layout so SideMenuPanel mounts the dashboard LeftNavMenu; this lets
    // us assert the dashboard navigation is suppressed when the patient is unavailable (O3-6113).
    mockUseLayoutType.mockReturnValue('large-desktop');
    mockUsePatient.mockReturnValue({
      isLoading: false,
      patient: mockFhirPatient,
      patientUuid: mockFhirPatient.id,
      error: null,
    });
    mockUseVisit.mockReturnValue({
      activeVisit: null,
      currentVisit: null,
      currentVisitIsRetrospective: false,
      isLoading: false,
      isValidating: false,
      error: null,
      mutate: mutateVisitContext,
    });
    mockUsePatientChartStore.mockReturnValue({
      patientUuid: mockFhirPatient.id,
      patient: null,
      visitContext: null,
      mutateVisitContext: null,
      setPatient,
      setVisitContext,
    });
    vi.mocked(launchWorkspaceGroup2).mockResolvedValue(true);
  });

  it.each([
    [404, 'Not Found'],
    [410, 'Gone'],
  ])('does not mount the banner or dashboards when the patient request fails with %i', (status, statusText) => {
    const error = Object.assign(new Error(statusText), { response: { status, statusText } });
    mockUsePatient.mockReturnValue({
      isLoading: false,
      patient: undefined,
      patientUuid: mockFhirPatient.id,
      error,
    });

    renderPatientChart();

    expect(mockChartReview).not.toHaveBeenCalled();
    expect(mockExtensionSlot).not.toHaveBeenCalled();
    expect(screen.queryByText('Left Nav Menu')).not.toBeInTheDocument();
    expect(screen.getByText('Error State')).toBeInTheDocument();
    expect(mockErrorState.mock.calls[0][0]).toEqual(
      expect.objectContaining({ error, headerTitle: 'Patient record unavailable' }),
    );
    expect(launchWorkspaceGroup2).not.toHaveBeenCalled();
  });

  it('removes the chart when a cached patient becomes unavailable', () => {
    const { rerender } = renderPatientChart();
    expect(screen.getByText('Patient dashboard')).toBeInTheDocument();
    mockChartReview.mockClear();
    mockExtensionSlot.mockClear();

    const error = Object.assign(new Error('Gone'), { response: { status: 410, statusText: 'Gone' } });
    mockUsePatient.mockReturnValue({
      isLoading: false,
      patient: mockFhirPatient,
      patientUuid: mockFhirPatient.id,
      error,
    });

    rerender(patientChartRoute());

    expect(screen.queryByText('Patient dashboard')).not.toBeInTheDocument();
    expect(mockChartReview).not.toHaveBeenCalled();
    expect(mockExtensionSlot).not.toHaveBeenCalled();
    expect(screen.queryByText('Left Nav Menu')).not.toBeInTheDocument();
    expect(screen.getByText('Error State')).toBeInTheDocument();
    expect(mockErrorState.mock.calls[0][0]).toEqual(
      expect.objectContaining({ error, headerTitle: 'Patient record unavailable' }),
    );
  });

  it.each([null, undefined])(
    'does not mount the banner or dashboards when loading finishes with patient %s',
    (patient) => {
      mockUsePatient.mockReturnValue({
        isLoading: false,
        patient,
        patientUuid: mockFhirPatient.id,
        error: null,
      });

      renderPatientChart();

      expect(mockChartReview).not.toHaveBeenCalled();
      expect(mockExtensionSlot).not.toHaveBeenCalled();
      expect(screen.queryByText('Left Nav Menu')).not.toBeInTheDocument();
      expect(screen.getByText('Error State')).toBeInTheDocument();
      expect(mockErrorState.mock.calls[0][0]).toEqual(
        expect.objectContaining({ headerTitle: 'Patient record unavailable' }),
      );
      expect(launchWorkspaceGroup2).not.toHaveBeenCalled();
    },
  );

  it('shows the loader while the patient is loading', () => {
    mockUsePatient.mockReturnValue({
      isLoading: true,
      patient: undefined,
      patientUuid: mockFhirPatient.id,
      error: null,
    });

    renderPatientChart();

    expect(screen.getByText('Loading ...')).toBeInTheDocument();
    expect(mockChartReview).not.toHaveBeenCalled();
    expect(mockExtensionSlot).not.toHaveBeenCalled();
    expect(mockErrorState).not.toHaveBeenCalled();
  });

  it('renders the patient banner and dashboards for an available patient', () => {
    renderPatientChart();

    expect(screen.getByText('Patient dashboard')).toBeInTheDocument();
    expect(screen.getByText('Left Nav Menu')).toBeInTheDocument();
    expect(mockChartReview.mock.calls[0][0]).toEqual(
      expect.objectContaining({ patient: mockFhirPatient, patientUuid: mockFhirPatient.id }),
    );
    expect(mockExtensionSlot.mock.calls.map(([props]) => props.name)).toEqual([
      'patient-header-slot',
      'patient-info-slot',
    ]);
    expect(mockErrorState).not.toHaveBeenCalled();
  });
});
