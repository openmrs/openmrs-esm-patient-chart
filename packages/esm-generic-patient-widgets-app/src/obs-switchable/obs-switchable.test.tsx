import React from 'react';
import { screen } from '@testing-library/react';
import { within } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { openmrsFetch, useConfig } from '@openmrs/esm-framework';
import { renderWithSwr, waitForLoadingToFinish } from '../../../../tools/test-helpers';
import { mockWeightAndViralLoadResult } from '../__mocks__/generic-widgets.mock';
import { ConfigObject } from '../config-schema';
import ObsSwitchable from './obs-switchable.component';

const mockedUseConfig = useConfig as jest.Mock;
const mockedOpenmrsFetch = openmrsFetch as jest.Mock;

jest.mock('@openmrs/esm-framework', () => {
  const originalModule = jest.requireActual('@openmrs/esm-framework');

  return {
    ...originalModule,
    usePagination: jest.fn().mockImplementation((data) => ({
      currentPage: 1,
      goTo: () => {},
      results: data,
    })),
  };
});

describe('Switchable obs viewer ', () => {
  it('renders an empty state view if data is unavailable', async () => {
    mockedOpenmrsFetch.mockResolvedValue({ data: [] });
    mockedUseConfig.mockReturnValue({
      title: 'Blood',
      resultsName: 'blood data',
      data: [] as Array<{
        concept: string;
        label: string;
        color: string;
      }>,
      encounterTypes: [] as Array<string>,
    } as ConfigObject);

    renderObsSwitchable();

    await waitForLoadingToFinish();

    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Blood' })).toBeInTheDocument();
    expect(screen.getByText(/There are no blood data.*/)).toBeInTheDocument();
  });

  it('renders an error state view if there is a problem fetching data', async () => {
    mockedUseConfig.mockReturnValue({
      title: 'Yellow bile',
      data: [] as Array<{ concept: string; label: string; color: string }>,
      encounterTypes: [] as Array<string>,
    } as ConfigObject);

    const error = {
      message: 'You are not logged in',
      response: {
        status: 401,
        statusText: 'Unauthorized',
      },
    };

    mockedOpenmrsFetch.mockRejectedValue(error);

    renderObsSwitchable();

    await waitForLoadingToFinish();

    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Yellow bile/i })).toBeInTheDocument();
    expect(screen.getByText(/Error 401: Unauthorized/i)).toBeInTheDocument();
    expect(screen.getByText(/Sorry, there was a problem.*/i)).toBeInTheDocument();
  });

  it('renders data for the configured concepts', async () => {
    mockedUseConfig.mockReturnValue({
      title: 'Black bile',
      data: [
        { concept: '5089AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', label: 'Weight', color: 'brown' },
        { concept: '856AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', label: 'Viral Load', color: 'green' },
      ],
      encounterTypes: ['790a93a8-bfb6-49ab-b98d-2e9b436f93a8', '74c7c0c4-e9e9-fb2a-998e-421f49fc9cc8'],
      table: { pageSize: 5 },
    } as ConfigObject);
    mockedOpenmrsFetch.mockResolvedValue({ data: mockWeightAndViralLoadResult });

    renderObsSwitchable();

    await waitForLoadingToFinish();

    expect(screen.getByRole('heading', { name: /Black bile/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Chart View/i })).toBeInTheDocument();

    const table = screen.getByRole('table');

    const expectedColumnHeaders = [/date and time/, /weight/, /viral load/];

    expectedColumnHeaders.forEach((header) =>
      expect(within(table).getByRole('columnheader', { name: new RegExp(header, 'i') })).toBeInTheDocument(),
    );

    const expectedTableRows = [
      /1\d — Oct — 2021, \d{2}:\d{2}\s+PM -- 180/,
      /1\d — Oct — 2021, \d{2}:\d{2}\s+PM 198 200/,
    ];

    expectedTableRows.map((row) =>
      expect(within(table).getByRole('row', { name: new RegExp(row, 'i') })).toBeInTheDocument(),
    );
  });

  it('toggles between rendering either a tabular view or a chart view', async () => {
    const user = userEvent.setup();

    mockedUseConfig.mockReturnValue({
      title: 'Phlegm',
      data: [
        { concept: '5089AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', label: 'Weight', color: 'brown' },
        { concept: '856AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', label: 'Viral Load', color: 'green' },
      ],
      encounterTypes: ['790a93a8-bfb6-49ab-b98d-2e9b436f93a8', '74c7c0c4-e9e9-fb2a-998e-421f49fc9cc8'],
      table: { pageSize: 5 },
    } as ConfigObject);
    mockedOpenmrsFetch.mockResolvedValue({ data: mockWeightAndViralLoadResult });

    renderObsSwitchable();

    await waitForLoadingToFinish();

    expect(screen.getByRole('heading', { name: /phlegm/i })).toBeInTheDocument();

    const chartViewButton = screen.getByRole('button', {
      name: /chart view/i,
    });

    // await waitFor(() => user.click(chartViewButton));

    // expect(screen.queryByRole('table')).not.toBeInTheDocument();
    // expect(screen.getByRole('tab', { name: /viral load/i })).toHaveValue('');
    // expect(screen.getByRole('tab', { name: /weight/i })).toHaveValue('');
  });
});

function renderObsSwitchable() {
  renderWithSwr(<ObsSwitchable patientUuid={'foo-patient-123'} />);
}
