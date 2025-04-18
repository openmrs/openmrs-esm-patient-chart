import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getConfig, getDefaultsFromConfigSchema, useConfig } from '@openmrs/esm-framework';
import { mockEncounterTypes, visitOverviewDetailMockData } from '__mocks__';
import { mockPatient, renderWithSwr, waitForLoadingToFinish } from 'tools';
import { esmPatientChartSchema, type ChartConfig } from '../../config-schema';
import VisitDetailOverview from './visit-detail-overview.component';
import { usePaginatedVisits } from './visit.resource';
import {
  useEncounterTypes,
  usePaginatedEncounters,
} from './past-visits-components/encounters-table/encounters-table.resource';

const mockGetConfig = getConfig as jest.Mock;
const mockUseConfig = jest.mocked(useConfig<ChartConfig>);

mockUseConfig.mockReturnValue({
  ...getDefaultsFromConfigSchema(esmPatientChartSchema),
  numberOfVisitsToLoad: 5,
});

const mockPaginatedVisitsData: ReturnType<typeof usePaginatedVisits> = {
  data: visitOverviewDetailMockData.data.results,
  error: null,
  mutate: jest.fn(),
  isValidating: false,
  isLoading: false,
  totalPages: 1,
  totalCount: 1,
  currentPage: 1,
  currentPageSize: { current: 10 },
  paginated: false,
  showNextButton: false,
  showPreviousButton: false,
  goTo: jest.fn(),
  goToNext: jest.fn(),
  goToPrevious: jest.fn(),
};
jest.mock('./visit.resource', () => ({
  ...jest.requireActual('./visit.resource'),
  usePaginatedVisits: jest.fn().mockImplementation(() => mockPaginatedVisitsData),
}));
const mockUsePaginatedVisits = jest.mocked(usePaginatedVisits);

const mockUsePaginatedEncounters = jest.fn(usePaginatedEncounters).mockReturnValue({
  error: null,
  mutate: jest.fn(),
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

const mockUseEncounterTypes = jest.fn(useEncounterTypes).mockReturnValue({
  data: mockEncounterTypes,
  totalCount: mockEncounterTypes.length,
  hasMore: false,
  loadMore: jest.fn(),
  error: undefined,
  mutate: jest.fn(),
  isValidating: false,
  isLoading: false,
  nextUri: '',
});

jest.mock('./past-visits-components/encounters-table/encounters-table.resource', () => ({
  ...jest.requireActual('./past-visits-components/encounters-table/encounters-table.resource'),
  usePaginatedEncounters: () => mockUsePaginatedEncounters('patient-uuid', null, 10),
  useEncounterTypes: () => mockUseEncounterTypes(),
}));

describe('VisitDetailOverview', () => {
  it('renders an empty state view if encounters data is unavailable', async () => {
    mockUsePaginatedVisits.mockReturnValueOnce({
      ...mockPaginatedVisitsData,
      data: [],
    });
    mockGetConfig.mockResolvedValue({ htmlFormEntryForms: [] });

    renderWithSwr(<VisitDetailOverview patientUuid={mockPatient.id} />);

    await waitForLoadingToFinish();

    // visits table view
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
    mockUsePaginatedVisits.mockReturnValue({
      ...mockPaginatedVisitsData,
      data: null,
      error,
    });

    renderWithSwr(<VisitDetailOverview patientUuid={mockPatient.id} />);

    await waitForLoadingToFinish();

    // visits table view
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
    mockUsePaginatedVisits.mockReturnValue(mockPaginatedVisitsData);

    renderWithSwr(<VisitDetailOverview patientUuid={mockPatient.id} />);

    await waitForLoadingToFinish();

    const allEncountersTab = screen.getByRole('tab', { name: /All encounters/i });
    const visitsTab = screen.getByRole('tab', { name: /visit/i });

    expect(visitsTab).toBeInTheDocument();
    expect(allEncountersTab).toBeInTheDocument();
    expect(visitsTab).toHaveAttribute('aria-selected', 'true');
    expect(allEncountersTab).toHaveAttribute('aria-selected', 'false');

    screen.getByRole('button', { name: /expand current row/i }).click();
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
    mockGetConfig.mockResolvedValue({ htmlFormEntryForms: [] });
    mockUseConfig.mockReturnValue({
      ...getDefaultsFromConfigSchema(esmPatientChartSchema),
      showAllEncountersTab: false,
    });
    mockUsePaginatedVisits.mockReturnValue(mockPaginatedVisitsData);

    renderWithSwr(<VisitDetailOverview patientUuid={mockPatient.id} />);

    await waitForLoadingToFinish();

    const visitsTab = screen.getByRole('tab', { name: /visits/i });

    expect(visitsTab).toBeInTheDocument();
    expect(visitsTab).toHaveAttribute('aria-selected', 'true');
    expect(screen.queryByText('/All encounters/i')).not.toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /notes/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /tests/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /medications/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /^encounters$/i })).toBeInTheDocument();

    expect(screen.getByText(/no diagnoses found/i)).toBeInTheDocument();
    expect(screen.getByText(/There are no notes to display for this patient/i)).toBeInTheDocument();
    expect(screen.getByText(/There are no medications to display for this patient/i)).toBeInTheDocument();
  });
});
