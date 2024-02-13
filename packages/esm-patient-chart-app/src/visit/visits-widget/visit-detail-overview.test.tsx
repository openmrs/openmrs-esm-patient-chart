import React from 'react';
import userEvent from '@testing-library/user-event';
import { screen } from '@testing-library/react';
import { openmrsFetch, getConfig, useConfig, userHasAccess, getDefaultsFromConfigSchema, useFeatureFlag } from '@openmrs/esm-framework';
import { esmPatientChartSchema, type ChartConfig } from '../../config-schema';
import { mockPatient, renderWithSwr, waitForLoadingToFinish } from 'tools';
import { visitOverviewDetailMockData } from '__mocks__';
import VisitDetailOverview from './visit-detail-overview.component';

const testProps = {
  patientUuid: mockPatient.id,
};

const mockGetConfig = getConfig as jest.Mock;
const mockOpenmrsFetch = openmrsFetch as jest.Mock;
const mockUseConfig = jest.mocked<() => ChartConfig>(useConfig);
const mockedUseFeatureFlag = useFeatureFlag as jest.Mock;

jest.mock('@openmrs/esm-framework', () => ({
  ...jest.requireActual('@openmrs/esm-framework'),
  getVisitsForPatient: jest.fn(),
  userHasAccess: jest.fn().mockImplementation((privilege, _) => (privilege ? false : true)),
}));

mockUseConfig.mockReturnValue({
  ...getDefaultsFromConfigSchema(esmPatientChartSchema),
  numberOfVisitsToLoad: 5,
});

describe('VisitDetailOverview', () => {
  it('renders an empty state view if encounters data is unavailable', async () => {
    mockOpenmrsFetch.mockReturnValueOnce({ data: { results: [] } });
    mockGetConfig.mockResolvedValue({ htmlFormEntryForms: [] });

    renderVisitDetailOverview();

    await waitForLoadingToFinish();

    expect(screen.getByRole('heading', { name: /visits/i })).toBeInTheDocument();
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

    mockOpenmrsFetch.mockRejectedValueOnce(error);

    renderVisitDetailOverview();

    await waitForLoadingToFinish();

    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /visits/i })).toBeInTheDocument();
    expect(screen.getAllByText(/Error 401: Unauthorized/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/Sorry, there was a problem displaying this information/i)[0]).toBeInTheDocument();
  });

  it(`renders a summary of the patient's visits and encounters when data is available and showAllEncountersTab is true`, async () => {
    const user = userEvent.setup();

    mockOpenmrsFetch.mockReturnValueOnce(visitOverviewDetailMockData);
    mockGetConfig.mockResolvedValue({ htmlFormEntryForms: [] });
    mockUseConfig.mockReturnValue({
      ...getDefaultsFromConfigSchema(esmPatientChartSchema),
      showAllEncountersTab: true,
    });
    mockedUseFeatureFlag.mockReturnValueOnce(false);

    renderVisitDetailOverview();

    await waitForLoadingToFinish();

    const allVisitsTab = screen.getByRole('tab', { name: /All encounters/i });
    const visitSummariesTab = screen.getByRole('tab', { name: /visit summaries/i });

    expect(visitSummariesTab).toBeInTheDocument();
    expect(allVisitsTab).toBeInTheDocument();
    expect(visitSummariesTab).toHaveAttribute('aria-selected', 'true');
    expect(allVisitsTab).toHaveAttribute('aria-selected', 'false');
    expect(screen.getByRole('tab', { name: /notes/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /tests/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /medications/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /^encounters$/i })).toBeInTheDocument();

    expect(screen.getByRole('heading', { name: /ech/i })).toBeInTheDocument();
    expect(screen.getByText(/^diagnoses$/i)).toBeInTheDocument();
    expect(screen.getByText(/no diagnoses found/i)).toBeInTheDocument();
    expect(screen.getByText(/There are no notes to display for this patient/i)).toBeInTheDocument();
    expect(screen.getByText(/There are no medications to display for this patient/i)).toBeInTheDocument();

    await user.click(allVisitsTab);

    expect(allVisitsTab).toHaveAttribute('aria-selected', 'true');
    expect(visitSummariesTab).toHaveAttribute('aria-selected', 'false');
  });

  it('should render only the visit summary tab when showAllEncountersTab is false', async () => {
    mockOpenmrsFetch.mockReturnValueOnce(visitOverviewDetailMockData);
    mockGetConfig.mockResolvedValue({ htmlFormEntryForms: [] });
    mockUseConfig.mockReturnValue({
      ...getDefaultsFromConfigSchema(esmPatientChartSchema),
      showAllEncountersTab: false,
    });
    mockedUseFeatureFlag.mockReturnValueOnce(false);

    renderVisitDetailOverview();

    await waitForLoadingToFinish();

    const visitSummariesTab = screen.getByRole('tab', { name: /visit summaries/i });

    expect(visitSummariesTab).toBeInTheDocument();
    expect(visitSummariesTab).toHaveAttribute('aria-selected', 'true');
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

function renderVisitDetailOverview() {
  renderWithSwr(<VisitDetailOverview {...testProps} />);
}
