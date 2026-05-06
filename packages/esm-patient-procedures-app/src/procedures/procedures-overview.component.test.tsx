import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  type FetchResponse,
  getDefaultsFromConfigSchema,
  launchWorkspace2,
  openmrsFetch,
  useConfig,
} from '@openmrs/esm-framework';
import { type ConfigObject, configSchema } from '../config-schema';
import { mockProceduresResponse } from '__mocks__';
import { mockPatient, renderWithSwr, waitForLoadingToFinish } from 'tools';
import ProceduresOverview from './procedures-overview.component';

const mockUseConfig = jest.mocked(useConfig<ConfigObject>);
const mockOpenmrsFetch = jest.mocked(openmrsFetch);
const mockLaunchWorkspace2 = jest.mocked(launchWorkspace2);

mockUseConfig.mockReturnValue({
  ...getDefaultsFromConfigSchema(configSchema),
  procedurePageSize: 5,
});

describe('ProceduresOverview', () => {
  it('renders an empty state view if procedures data is unavailable', async () => {
    mockOpenmrsFetch.mockResolvedValueOnce({ data: { results: [] } } as FetchResponse);

    renderWithSwr(<ProceduresOverview patientUuid={mockPatient.id} />);

    await waitForLoadingToFinish();

    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /procedures/i })).toBeInTheDocument();
    expect(screen.getByTestId('empty-card-illustration')).toBeInTheDocument();
    expect(screen.getByText(/There are no procedures to display/i)).toBeInTheDocument();
  });

  it('renders an error state view if there is a problem fetching procedures', async () => {
    const error = {
      message: 'You are not logged in',
      response: {
        status: 401,
        statusText: 'Unauthorized',
      },
    };

    mockOpenmrsFetch.mockRejectedValueOnce(error);

    renderWithSwr(<ProceduresOverview patientUuid={mockPatient.id} />);

    await waitForLoadingToFinish();

    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.getByText('Error State')).toBeInTheDocument();
  });

  it("renders a paginated overview of the patient's procedures", async () => {
    const user = userEvent.setup();

    mockOpenmrsFetch.mockResolvedValueOnce({ data: mockProceduresResponse } as FetchResponse);

    renderWithSwr(<ProceduresOverview patientUuid={mockPatient.id} />);

    await waitForLoadingToFinish();

    expect(screen.getByRole('heading', { name: /procedures/i })).toBeInTheDocument();

    const expectedColumnHeaders = [/^procedure$/i, /^date$/i];
    expectedColumnHeaders.forEach((header) => {
      expect(screen.getByRole('columnheader', { name: header })).toBeInTheDocument();
    });

    // First page: 5 rows visible
    const firstPageRows = [/appendectomy/i, /colonoscopy/i, /blood draw/i, /chest x-ray/i, /ecg/i];
    firstPageRows.forEach((row) => {
      expect(screen.getByRole('row', { name: row })).toBeInTheDocument();
    });

    // Header row + 5 data rows = 6
    expect(screen.getAllByRole('row').length).toEqual(6);
    expect(screen.getByText(/5 \/ 6 items/i)).toBeInTheDocument();

    const nextPageButton = screen.getByRole('button', { name: /next page/i });
    await user.click(nextPageButton);

    // Second page: 1 row
    expect(screen.getByRole('row', { name: /mri brain/i })).toBeInTheDocument();
    expect(screen.getAllByRole('row').length).toEqual(2); // header + 1 data row
  });

  it('renders an "Add" button that launches the procedures form workspace', async () => {
    const user = userEvent.setup();

    mockOpenmrsFetch.mockResolvedValueOnce({ data: mockProceduresResponse } as FetchResponse);

    renderWithSwr(<ProceduresOverview patientUuid={mockPatient.id} />);

    await waitForLoadingToFinish();

    const addButton = screen.getByRole('button', { name: /add/i });
    expect(addButton).toBeInTheDocument();

    await user.click(addButton);
    expect(mockLaunchWorkspace2).toHaveBeenCalledWith('procedures-form-workspace');
  });

  it('displays a non-coded procedure name when procedureCoded is absent', async () => {
    mockOpenmrsFetch.mockResolvedValueOnce({
      data: {
        results: [
          {
            uuid: 'proc-noncoded-1',
            procedureNonCoded: 'Custom procedure',
            startDateTime: '2021-08-01T00:00:00.000+0000',
            voided: false,
          },
        ],
        links: [],
      },
    } as FetchResponse);

    renderWithSwr(<ProceduresOverview patientUuid={mockPatient.id} />);

    await waitForLoadingToFinish();

    expect(screen.getByRole('row', { name: /custom procedure/i })).toBeInTheDocument();
  });
});
