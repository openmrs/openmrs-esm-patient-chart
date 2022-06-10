import React from 'react';
import { screen } from '@testing-library/react';
import { within } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { openmrsFetch, useConfig, usePagination } from '@openmrs/esm-framework';
import { renderWithSwr, waitForLoadingToFinish } from '../../../../tools/test-helpers';
import { mockWeightAndViralLoadResult } from '../../../../__mocks__/generic-widgets.mock';
import { ConfigObject } from '../config-schema';
import ObsSwitchable from './obs-switchable.component';

const mockedUseConfig = useConfig as jest.Mock;
const mockedOpenmrsFetch = openmrsFetch as jest.Mock;
const mockedUsePagination = usePagination as jest.Mock;

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

describe('Switchable obs viewer: ', () => {
  it('renders an empty state view if data is unavailable', async () => {
    mockedOpenmrsFetch.mockResolvedValue({ data: [] });
    mockedUseConfig.mockReturnValue({ title: 'Blood', resultsName: 'blood data', data: [] } as ConfigObject);

    renderObsSwitchable();

    await waitForLoadingToFinish();

    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Blood' })).toBeInTheDocument();
    expect(screen.getByText(/There are no blood data.*/)).toBeInTheDocument();
  });

  it('renders an error state view if there is a problem fetching data', async () => {
    mockedUseConfig.mockReturnValue({ title: 'Yellow bile', data: [] } as ConfigObject);

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
      table: { pageSize: 5 },
    } as ConfigObject);
    mockedOpenmrsFetch.mockResolvedValue({ data: mockWeightAndViralLoadResult });

    renderObsSwitchable();

    await waitForLoadingToFinish();

    expect(screen.getByRole('heading', { name: /Black bile/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /table view/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /chart view/i })).toBeInTheDocument();

    const table = screen.getByRole('table');

    const expectedColumnHeaders = [/date and time/, /weight/, /viral load/];

    expectedColumnHeaders.forEach((header) =>
      expect(within(table).getByRole('columnheader', { name: new RegExp(header, 'i') })).toBeInTheDocument(),
    );

    const expectedTableRows = [/2\d — Oct — 2021, \d\d:\d\d PM -- 180/, /1\d — Oct — 2021, \d\d:\d\d AM 198 200/];

    expectedTableRows.map((row) =>
      expect(within(table).getByRole('row', { name: new RegExp(row, 'i') })).toBeInTheDocument(),
    );
  });

  it('toggles between rendering either a tabular view or a chart view', async () => {
    mockedUseConfig.mockReturnValue({
      title: 'Phlegm',
      data: [
        { concept: '5089AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', label: 'Weight', color: 'brown' },
        { concept: '856AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', label: 'Viral Load', color: 'green' },
      ],
      table: { pageSize: 5 },
    } as ConfigObject);
    mockedOpenmrsFetch.mockResolvedValue({ data: mockWeightAndViralLoadResult });

    renderObsSwitchable();

    await waitForLoadingToFinish();

    expect(screen.getByRole('heading', { name: /phlegm/i })).toBeInTheDocument();

    const chartViewButton = screen.getByRole('button', {
      name: /chart view/i,
    });
    const tabularViewButton = screen.getByRole('button', {
      name: /table view/i,
    });

    userEvent.click(chartViewButton);
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.getAllByRole('tab').length).toEqual(2);
    expect(screen.getByRole('tab', { name: /viral load/i })).toHaveValue('');

    userEvent.click(tabularViewButton);
    expect(screen.queryByRole('table')).toBeInTheDocument();
  });
});

function renderObsSwitchable() {
  renderWithSwr(<ObsSwitchable patientUuid={'foo-patient-123'} />);
}
