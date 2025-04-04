import { getConfig, getDefaultsFromConfigSchema, useConfig } from '@openmrs/esm-framework';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { visitOverviewDetailMockData } from '__mocks__';
import React from 'react';
import { mockPatient, renderWithSwr, waitForLoadingToFinish } from 'tools';
import { esmPatientChartSchema, type ChartConfig } from '../../config-schema';
import VisitDetailOverview from './visit-detail-overview.component';
import { useInfiniteVisits, usePaginatedVisits } from './visit.resource';

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
const mockUseInfiniteVisitsData: ReturnType<typeof useInfiniteVisits> = {
  visits: visitOverviewDetailMockData.data.results,
  error: null,
  hasMore: false,
  isLoading: false,
  isValidating: false,
  mutate: jest.fn(),
  totalCount: visitOverviewDetailMockData.data.results.length,
  loadMore: jest.fn(),
  nextUri: '',
};
jest.mock('./visit.resource', () => ({
  ...jest.requireActual('./visit.resource'),
  usePaginatedVisits: jest.fn().mockImplementation(() => mockPaginatedVisitsData),
  useInfiniteVisits: jest.fn().mockImplementation(() => mockUseInfiniteVisitsData),
}));
const mockUsePaginatedVisits = jest.mocked(usePaginatedVisits);
const mockUseInfiniteVisits = jest.mocked(useInfiniteVisits);

describe('VisitDetailOverview', () => {
  it('renders an empty state view if encounters data is unavailable', async () => {
    mockUsePaginatedVisits.mockReturnValueOnce({
      ...mockPaginatedVisitsData,
      data: [],
    });
    mockUseInfiniteVisits.mockReturnValue({
      ...mockUseInfiniteVisitsData,
      visits: [],
    });
    mockGetConfig.mockResolvedValue({ htmlFormEntryForms: [] });

    renderWithSwr(<VisitDetailOverview patientUuid={mockPatient.id} />);

    await waitForLoadingToFinish();

    // visits table view
    expect(screen.getByRole('heading', { name: /past visits/i })).toBeInTheDocument();
    expect(screen.getAllByTitle(/Empty data illustration/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/There are no visits to display for this patient/i)[0]).toBeInTheDocument();

    // visits summary view
    await screen.getByRole('tab', { name: /summary cards/i }).click();
    expect(screen.getByRole('heading', { name: /Past visits/i })).toBeInTheDocument();
    expect(screen.getAllByTitle(/Empty data illustration/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/There are no visits to display for this patient/i)[0]).toBeInTheDocument();
  });

  it('renders an error state view if there was a problem fetching encounter data', async () => {
    const error = {
      message: 'Unauthorized',
      response: {
        status: 401,
        statusText: 'Unauthorized',
      },
    };
    mockUseInfiniteVisits.mockReturnValue({
      ...mockUseInfiniteVisitsData,
      visits: null,
      error,
    });
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
    expect(screen.getAllByText(/Error 401: Unauthorized/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/Sorry, there was a problem displaying this information/i)[0]).toBeInTheDocument();

    // visits summary view
    await screen.getByRole('tab', { name: /summary cards/i }).click();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.getAllByText(/Error 401: Unauthorized/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/Sorry, there was a problem displaying this information/i)[0]).toBeInTheDocument();
  });

  it(`renders a summary of the patient's visits and encounters when data is available and showAllEncountersTab is true`, async () => {
    const user = userEvent.setup();
    mockGetConfig.mockResolvedValue({ htmlFormEntryForms: [] });
    mockUseConfig.mockReturnValue({
      ...getDefaultsFromConfigSchema(esmPatientChartSchema),
      showAllEncountersTab: true,
    });
    mockUsePaginatedVisits.mockReturnValue(mockPaginatedVisitsData);
    mockUseInfiniteVisits.mockReturnValue(mockUseInfiniteVisitsData);

    renderWithSwr(<VisitDetailOverview patientUuid={mockPatient.id} />);

    await waitForLoadingToFinish();

    const allEncountersTab = screen.getByRole('tab', { name: /All encounters/i });
    const visitsTab = screen.getByRole('tab', { name: /visit/i });

    expect(visitsTab).toBeInTheDocument();
    expect(allEncountersTab).toBeInTheDocument();
    expect(visitsTab).toHaveAttribute('aria-selected', 'true');
    expect(allEncountersTab).toHaveAttribute('aria-selected', 'false');
    // visits summary view
    await screen.getByRole('tab', { name: /summary cards/i }).click();
    expect(screen.getByRole('tab', { name: /notes/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /tests/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /medications/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /^encounters$/i })).toBeInTheDocument();

    expect(screen.getByRole('heading', { name: /ech/i })).toBeInTheDocument();
    expect(screen.getByText(/^diagnoses$/i)).toBeInTheDocument();
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
    mockUseInfiniteVisits.mockReturnValue(mockUseInfiniteVisitsData);

    renderWithSwr(<VisitDetailOverview patientUuid={mockPatient.id} />);

    await waitForLoadingToFinish();

    const visitsTab = screen.getByRole('tab', { name: /visits/i });

    // visits summary view
    await screen.getByRole('tab', { name: /summary cards/i }).click();

    expect(visitsTab).toBeInTheDocument();
    expect(visitsTab).toHaveAttribute('aria-selected', 'true');
    expect(screen.queryByText('/All encounters/i')).not.toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /notes/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /tests/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /medications/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /^encounters$/i })).toBeInTheDocument();

    expect(screen.getByRole('heading', { name: /ech/i })).toBeInTheDocument();
    expect(screen.getByText(/^diagnoses$/i)).toBeInTheDocument();
    expect(screen.getByText(/no diagnoses found/i)).toBeInTheDocument();
    expect(screen.getByText(/There are no notes to display for this patient/i)).toBeInTheDocument();
    expect(screen.getByText(/There are no medications to display for this patient/i)).toBeInTheDocument();
  });
});
