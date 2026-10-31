import React from 'react';
import { screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  ErrorState,
  ExtensionSlot,
  launchWorkspaceGroup2,
  useLeftNav,
  useLayoutType,
  usePatient,
  useVisit,
} from '@openmrs/esm-framework';
import { leftNavStore } from '@openmrs/esm-extensions';
import { useLeftNav as useRealLeftNav, useLeftNavStore } from '@openmrs/esm-react-utils';
import { ErrorState as RealErrorState } from '@openmrs/esm-styleguide/src/public';
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

// This consumer lives outside the chart, as the framework's navigation does.
function FrameworkNavigation() {
  const { slotName, basePath } = useLeftNavStore();
  return slotName ? <a href={`${basePath}/Patient%20Summary`}>Framework patient summary</a> : null;
}

function patientChartRoute() {
  return (
    <MemoryRouter initialEntries={[`/patient/${mockFhirPatient.id}/chart/Patient%20Summary`]}>
      <Routes>
        <Route path="/patient/:patientUuid/chart/:view" element={<PatientChart />} />
      </Routes>
      <FrameworkNavigation />
    </MemoryRouter>
  );
}

function renderPatientChart() {
  return renderWithSwr(patientChartRoute());
}

describe('PatientChart', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    leftNavStore.setState(leftNavStore.getInitialState(), true);
    vi.mocked(useLeftNav).mockImplementation(useRealLeftNav);
    mockErrorState.mockImplementation(() => <div>Error State</div>);
    // Keep the chart's local navigation visible in healthy-patient controls.
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
    expect(screen.queryByRole('link', { name: 'Framework patient summary' })).not.toBeInTheDocument();
    expect(leftNavStore.getState().slotName).toBeNull();
    expect(screen.getByText('Error State')).toBeInTheDocument();
    expect(mockErrorState.mock.calls[0][0]).toEqual(
      expect.objectContaining({ error, headerTitle: 'Patient record unavailable' }),
    );
    expect(launchWorkspaceGroup2).not.toHaveBeenCalled();
  });

  it('removes the chart when a cached patient becomes unavailable', () => {
    const { rerender } = renderPatientChart();
    expect(screen.getByText('Patient dashboard')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Framework patient summary' })).toBeInTheDocument();
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
    expect(screen.queryByRole('link', { name: 'Framework patient summary' })).not.toBeInTheDocument();
    expect(leftNavStore.getState().slotName).toBeNull();
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
      mockErrorState.mockImplementation(RealErrorState);

      renderPatientChart();

      expect(mockChartReview).not.toHaveBeenCalled();
      expect(mockExtensionSlot).not.toHaveBeenCalled();
      expect(screen.queryByText('Left Nav Menu')).not.toBeInTheDocument();
      expect(screen.getByText('Patient record unavailable')).toBeInTheDocument();
      expect(screen.getByText('The patient record could not be loaded. Please try again.')).toBeInTheDocument();
      expect(screen.queryByText(/undefined/i)).not.toBeInTheDocument();
      expect(mockErrorState).not.toHaveBeenCalled();
      expect(screen.queryByRole('link', { name: 'Framework patient summary' })).not.toBeInTheDocument();
      expect(leftNavStore.getState().slotName).toBeNull();
      expect(launchWorkspaceGroup2).not.toHaveBeenCalled();
    },
  );

  it('restores framework navigation after the patient becomes available again and clears it on unmount', () => {
    const { rerender, unmount } = renderPatientChart();
    const basePath = `/spa/patient/${mockFhirPatient.id}/chart`;
    expect(leftNavStore.getState()).toEqual(
      expect.objectContaining({ slotName: 'patient-chart-dashboard-slot', basePath }),
    );

    mockUsePatient.mockReturnValue({
      isLoading: false,
      patient: undefined,
      patientUuid: mockFhirPatient.id,
      error: Object.assign(new Error('Gone'), { response: { status: 410, statusText: 'Gone' } }),
    });
    rerender(patientChartRoute());
    expect(leftNavStore.getState().slotName).toBeNull();

    mockUsePatient.mockReturnValue({
      isLoading: false,
      patient: mockFhirPatient,
      patientUuid: mockFhirPatient.id,
      error: null,
    });
    rerender(patientChartRoute());
    expect(screen.getByRole('link', { name: 'Framework patient summary' })).toHaveAttribute(
      'href',
      `${basePath}/Patient%20Summary`,
    );
    expect(leftNavStore.getState().slotName).toBe('patient-chart-dashboard-slot');

    unmount();
    expect(leftNavStore.getState().slotName).toBeNull();
  });

  it('retains the real HTTP error status when the patient request fails', () => {
    mockErrorState.mockImplementation(RealErrorState);
    mockUsePatient.mockReturnValue({
      isLoading: false,
      patient: undefined,
      patientUuid: mockFhirPatient.id,
      error: Object.assign(new Error('Not Found'), { response: { status: 404, statusText: 'Not Found' } }),
    });

    renderPatientChart();

    expect(screen.getByText('Patient record unavailable')).toBeInTheDocument();
    expect(screen.getByText(/404: Not Found/)).toBeInTheDocument();
    expect(screen.queryByText(/undefined/i)).not.toBeInTheDocument();
  });

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
