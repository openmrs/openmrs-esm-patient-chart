import React from 'react';
import { vi, describe, it, expect, beforeEach, type Mock } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getConfig, getDefaultsFromConfigSchema, useConfig } from '@openmrs/esm-framework';
import { mockEncounterTypes, visitOverviewDetailMockData } from '__mocks__';
import { mockPatient, renderWithSwr, waitForLoadingToFinish } from 'tools';
import { esmPatientChartSchema, type ChartConfig } from '../../config-schema';
import VisitDetailOverview from './visit-detail-overview.component';
import { useEmrApiVisits, useVisitEncounters } from './visit.resource';
import {
  useEncounterTypes,
  usePaginatedEncounters,
  useAllEncounters,
} from './past-visits-components/encounters-table/encounters-table.resource';

const mockGetConfig = getConfig as Mock;
const mockUseConfig = vi.mocked(useConfig<ChartConfig>);

const mockUseAllEncounters = vi.fn(useAllEncounters).mockReturnValue({
  data: [],
  isLoading: false,
  error: undefined,
} as any);

const mockEmrApiVisitsData = {
  visits: visitOverviewDetailMockData.data.results.map((visit) => ({
    visit,
    diagnoses: [],
  })),
  error: null,
  mutate: vi.fn(),
  isValidating: false,
  isLoading: false,
  totalPages: 1,
  totalCount: 1,
  currentPage: 1,
  currentPageSize: { current: 10 },
  paginated: false,
  showNextButton: false,
  showPreviousButton: false,
  goTo: vi.fn(),
  goToNext: vi.fn(),
  goToPrevious: vi.fn(),
};

vi.mock('./visit.resource', async () => ({
  ...((await vi.importActual('./visit.resource')) as object),
  useEmrApiVisits: vi.fn().mockImplementation(() => mockEmrApiVisitsData),
  useVisitEncounters: vi.fn().mockReturnValue({
    encounters: null,
    isLoading: false,
    error: undefined,
    isValidating: false,
    mutate: vi.fn(),
  }),
}));
const mockUseEmrApiVisits = vi.mocked(useEmrApiVisits);
const mockUseVisitEncounters = vi.mocked(useVisitEncounters);

const mockUsePaginatedEncounters = vi.fn(usePaginatedEncounters).mockReturnValue({
  error: null,
  mutate: vi.fn(),
  isValidating: false,
  isLoading: false,
  data: [],
  totalPages: 0,
  totalCount: 0,
  currentPage: 0,
  currentPageSize: undefined,
  paginated: false,
  showNextButton: false,
  showPreviousButton: false,
  goTo: undefined,
  goToNext: undefined,
  goToPrevious: undefined,
});

const mockUseEncounterTypes = vi.fn(useEncounterTypes).mockReturnValue({
  data: mockEncounterTypes,
  totalCount: mockEncounterTypes.length,
  hasMore: false,
  loadMore: vi.fn(),
  error: undefined,
  mutate: vi.fn(),
  isValidating: false,
  isLoading: false,
  nextUri: '',
});

vi.mock('./past-visits-components/encounters-table/encounters-table.resource', async () => ({
  ...((await vi.importActual('./past-visits-components/encounters-table/encounters-table.resource')) as object),
  usePaginatedEncounters: () => mockUsePaginatedEncounters('patient-uuid', null, 10),
  useAllEncounters: () => mockUseAllEncounters('patient-uuid', null),
  useEncounterTypes: () => mockUseEncounterTypes(),
}));

describe('VisitDetailOverview', () => {
  beforeEach(() => {
    mockUseVisitEncounters.mockReturnValue({
      encounters: visitOverviewDetailMockData.data.results[0].encounters,
      isLoading: false,
      error: undefined,
      isValidating: false,
      mutate: vi.fn(),
    });
  });

  it('renders an empty state view if encounters data is unavailable', async () => {
    mockUseEmrApiVisits.mockReturnValueOnce({
      ...mockEmrApiVisitsData,
      visits: [],
    });
    mockGetConfig.mockResolvedValue({ htmlFormEntryForms: [] });

    renderWithSwr(<VisitDetailOverview patientUuid={mockPatient.id} patient={mockPatient} />);

    await waitForLoadingToFinish();

    expect(screen.getByRole('heading', { name: /past visits/i })).toBeInTheDocument();
    expect(screen.getAllByTitle(/Empty data illustration/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/There are no visits to display for this patient/i)[0]).toBeInTheDocument();
  });

  it('renders an error state view if there was a problem fetching visit data', async () => {
    const error = {
      message: 'Unauthorized',
      response: {
        status: 401,
        statusText: 'Unauthorized',
      },
    };
    mockUseEmrApiVisits.mockReturnValue({
      ...mockEmrApiVisitsData,
      visits: null,
      error,
    });

    renderWithSwr(<VisitDetailOverview patientUuid={mockPatient.id} patient={mockPatient} />);

    await waitForLoadingToFinish();

    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.getAllByText(/visits/i)[0]).toBeInTheDocument();
    expect(screen.getByText(/Error State/i)).toBeInTheDocument();
  });

  it(`renders a summary of the patient's visits and encounters when data is available and showAllEncountersTab is true`, async () => {
    const user = userEvent.setup();
    mockGetConfig.mockResolvedValue({ htmlFormEntryForms: [] });
    mockUseConfig.mockReturnValue({
      ...getDefaultsFromConfigSchema(esmPatientChartSchema),
      showAllEncountersTab: true,
    });
    mockUseEmrApiVisits.mockReturnValue(mockEmrApiVisitsData);

    renderWithSwr(<VisitDetailOverview patientUuid={mockPatient.id} patient={mockPatient} />);

    await waitForLoadingToFinish();

    const allEncountersTab = screen.getByRole('tab', { name: /All encounters/i });
    const visitsTab = screen.getByRole('tab', { name: /visit/i });

    expect(visitsTab).toBeInTheDocument();
    expect(allEncountersTab).toBeInTheDocument();
    expect(visitsTab).toHaveAttribute('aria-selected', 'true');
    expect(allEncountersTab).toHaveAttribute('aria-selected', 'false');

    await user.click(screen.getByRole('button', { name: /expand current row/i }));
    expect(screen.getByRole('tab', { name: /notes/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /tests/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /medications/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /^encounters$/i })).toBeInTheDocument();

    expect(screen.getByText(/no diagnoses found/i)).toBeInTheDocument();
    expect(screen.getByText(/There are no notes to display for this patient/i)).toBeInTheDocument();
    expect(screen.getByText(/There are no medications to display for this patient/i)).toBeInTheDocument();

    await user.click(allEncountersTab);

    expect(allEncountersTab).toHaveAttribute('aria-selected', 'true');
    expect(visitsTab).toHaveAttribute('aria-selected', 'false');
  });

  it('should render only the visit summary tab when showAllEncountersTab is false', async () => {
    const user = userEvent.setup();
    mockGetConfig.mockResolvedValue({ htmlFormEntryForms: [] });
    mockUseConfig.mockReturnValue({
      ...getDefaultsFromConfigSchema(esmPatientChartSchema),
      showAllEncountersTab: false,
    });
    mockUseEmrApiVisits.mockReturnValue(mockEmrApiVisitsData);

    renderWithSwr(<VisitDetailOverview patientUuid={mockPatient.id} patient={mockPatient} />);

    await waitForLoadingToFinish();

    const visitsTab = screen.getByRole('tab', { name: /visits/i });

    expect(visitsTab).toBeInTheDocument();
    expect(visitsTab).toHaveAttribute('aria-selected', 'true');
    expect(screen.queryByText('/All encounters/i')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /expand current row/i }));
    expect(screen.getByRole('tab', { name: /notes/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /tests/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /medications/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /^encounters$/i })).toBeInTheDocument();

    expect(screen.getByText(/no diagnoses found/i)).toBeInTheDocument();
    expect(screen.getByText(/There are no notes to display for this patient/i)).toBeInTheDocument();
    expect(screen.getByText(/There are no medications to display for this patient/i)).toBeInTheDocument();
  });
});
