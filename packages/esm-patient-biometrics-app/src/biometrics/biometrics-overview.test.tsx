import React from 'react';
import { screen, render } from '@testing-library/react';
import { of } from 'rxjs/internal/observable/of';
import { throwError } from 'rxjs';
import { openmrsObservableFetch, useConfig, usePagination } from '@openmrs/esm-framework';
import { mockPatient } from '../../../../__mocks__/patient.mock';
import { mockBiometricsResponse, formattedBiometrics } from '../../../../__mocks__/biometrics.mock';
import BiometricsOverview from './biometrics-overview.component';

const testProps = {
  basePath: '/',
  showAddBiometrics: true,
  patientUuid: mockPatient.id,
};

const mockBiometricsConfig = {
  biometrics: { bmiUnit: 'kg / m²' },
  concepts: { heightUuid: '5090AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', weightUuid: '5089AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' },
};

const mockOpenmrsObservableFetch = openmrsObservableFetch as jest.Mock;
const mockUsePagination = usePagination as jest.Mock;

jest.mock('@openmrs/esm-framework', () => ({
  ...(jest.requireActual('@openmrs/esm-framework') as any),
  openmrsObservableFetch: jest.fn(),
  useConfig: jest.fn().mockImplementation(() => mockBiometricsConfig),
  usePagination: jest.fn(),
}));

function renderBiometricsOverview() {
  render(<BiometricsOverview {...testProps} />);
}

describe('BiometricsOverview: ', () => {
  it('renders an empty state view if biometrics data is unavailable', async () => {
    mockOpenmrsObservableFetch.mockReturnValueOnce(of({ data: [] }));

    renderBiometricsOverview();

    await screen.getByRole('heading', { name: /biometrics/i });
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /biometrics/i })).toBeInTheDocument();
    expect(screen.getByText(/There are no biometrics to display for this patient/i)).toBeInTheDocument();
    expect(screen.getByText(/Record biometrics/i)).toBeInTheDocument();
  });

  it('renders an error state view if there is a problem fetching biometrics data', async () => {
    const error = {
      message: 'You are not logged in',
      response: {
        status: 401,
        statusText: 'Unauthorized',
      },
    };

    mockOpenmrsObservableFetch.mockReturnValue(throwError(error));
    renderBiometricsOverview();

    await screen.getByRole('heading', { name: /biometrics/i });
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /biometrics/i })).toBeInTheDocument();
    expect(screen.getByText(/Error 401: Unauthorized/i)).toBeInTheDocument();
    expect(
      screen.getByText(
        /Sorry, there was a problem displaying this information. You can try to reload this page, or contact the site administrator and quote the error code above/i,
      ),
    ).toBeInTheDocument();
  });

  it("renders an overview of the patient's biometrics", async () => {
    mockOpenmrsObservableFetch.mockReturnValueOnce(of({ data: mockBiometricsResponse }));
    mockUsePagination.mockReturnValueOnce({
      results: formattedBiometrics.slice(0, 5),
      goTo: () => {},
      currentPage: 1,
    });

    renderBiometricsOverview();

    await screen.getByRole('heading', { name: /biometrics/i });
    expect(screen.getByRole('heading', { name: /biometrics/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /table view/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /chart view/i })).toBeInTheDocument();

    const expectedColumnHeaders = [/date/, /weight/, /height/, /bmi/];

    expectedColumnHeaders.map((header) =>
      expect(screen.getByRole('columnheader', { name: new RegExp(header, 'i') })).toBeInTheDocument(),
    );

    const expectedTableRows = [
      /12 - Aug - 2021, 01:23 90 186 26.0 17/,
      /18 - Jun - 2021, 12:02 80 198 20.4 23/,
      /10 - Jun - 2021, 04:40 50/,
      /26 - May - 2021, 06:21 61 160 23.8/,
      /10 - May - 2021, 09:41 90 198 23.0 25/,
    ];

    expectedTableRows.map((row) => expect(screen.getByRole('row', { name: new RegExp(row, 'i') })).toBeInTheDocument());
  });
});
