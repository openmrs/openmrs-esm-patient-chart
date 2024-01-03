import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { openmrsFetch, usePagination } from '@openmrs/esm-framework';
import { formattedBiometrics, mockBiometricsResponse, mockConceptMetadata } from '__mocks__';
import { mockPatient, patientChartBasePath, renderWithSwr, waitForLoadingToFinish } from 'tools';
import BiometricsOverview from './biometrics-overview.component';

const testProps = {
  basePath: patientChartBasePath,
  patientUuid: mockPatient.id,
};

const mockVitalsSignsConcepts = {
  data: {
    results: [
      {
        setMembers: [
          {
            uuid: '5085AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
            display: 'Systolic blood pressure',
            hiNormal: 120,
            hiAbsolute: 250.0,
            hiCritical: null,
            lowNormal: 80,
            lowAbsolute: 0.0,
            lowCritical: null,
            units: 'mmHg',
          },
          {
            uuid: '5086AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
            display: 'Diastolic blood pressure',
            hiNormal: 80,
            hiAbsolute: 150.0,
            hiCritical: null,
            lowNormal: 70,
            lowAbsolute: 0.0,
            lowCritical: null,
            units: 'mmHg',
          },
          {
            uuid: '5088AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
            display: 'Temperature (C)',
            hiNormal: 37.5,
            hiAbsolute: 43.0,
            hiCritical: null,
            lowNormal: 36.5,
            lowAbsolute: 25.0,
            lowCritical: null,
            units: 'DEG C',
          },
          {
            uuid: '5090AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
            display: 'Height (cm)',
            hiNormal: null,
            hiAbsolute: 272.0,
            hiCritical: null,
            lowNormal: null,
            lowAbsolute: 10.0,
            lowCritical: null,
            units: 'cm',
          },
          {
            uuid: '5089AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
            display: 'Weight (kg)',
            hiNormal: null,
            hiAbsolute: 250.0,
            hiCritical: null,
            lowNormal: null,
            lowAbsolute: 0.0,
            lowCritical: null,
            units: 'kg',
          },
          {
            uuid: '5087AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
            display: 'Pulse',
            hiNormal: 70,
            hiAbsolute: 230.0,
            hiCritical: null,
            lowNormal: 30,
            lowAbsolute: 0.0,
            lowCritical: null,
            units: 'beats/min',
          },
          {
            uuid: '5092AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
            display: 'Blood oxygen saturation',
            hiNormal: 100,
            hiAbsolute: 100.0,
            hiCritical: null,
            lowNormal: 95,
            lowAbsolute: 0.0,
            lowCritical: null,
            units: '%',
          },
          {
            uuid: '1343AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
            display: 'MID-UPPER ARM CIRCUMFERENCE',
            hiNormal: 25,
            hiAbsolute: null,
            hiCritical: null,
            lowNormal: 23,
            lowAbsolute: null,
            lowCritical: null,
            units: 'cm',
          },
          {
            uuid: '5242AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
            display: 'Respiratory rate',
            hiNormal: 70.0,
            hiAbsolute: 999.0,
            hiCritical: 120.0,
            lowNormal: null,
            lowAbsolute: 0.0,
            lowCritical: null,
            units: 'breaths/min',
          },
        ],
      },
    ],
  },
};

const mockConceptUnits = new Map<string, string>(
  mockVitalsSignsConcepts.data.results[0].setMembers.map((concept) => [concept.uuid, concept.units]),
);

const mockBiometricsConfig = {
  biometrics: { bmiUnit: 'kg / m²' },
  concepts: { heightUuid: '5090AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', weightUuid: '5089AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' },
};

const mockOpenmrsFetch = openmrsFetch as jest.Mock;
const mockUsePagination = usePagination as jest.Mock;

jest.mock('@openmrs/esm-framework', () => {
  const originalModule = jest.requireActual('@openmrs/esm-framework');

  return {
    ...originalModule,
    useConfig: jest.fn().mockImplementation(() => mockBiometricsConfig),
    useVisitOrOfflineVisit: jest.fn(),
    useConnectivity: jest.fn(),
    usePagination: jest.fn().mockImplementation(() => ({
      currentPage: 1,
      goTo: () => {},
      results: [],
    })),
  };
});

jest.mock('@openmrs/esm-patient-common-lib', () => {
  const originalModule = jest.requireActual('@openmrs/esm-patient-common-lib');

  return {
    ...originalModule,
    useVitalsConceptMetadata: jest.fn().mockImplementation(() => ({
      data: mockConceptUnits,
      conceptMetadata: mockConceptMetadata,
    })),
  };
});

describe('BiometricsOverview: ', () => {
  it('renders an empty state view if biometrics data is unavailable', async () => {
    mockOpenmrsFetch.mockReturnValueOnce({ data: [] });

    renderBiometricsOverview();

    await waitForLoadingToFinish();

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

    mockOpenmrsFetch.mockRejectedValueOnce(error);

    renderBiometricsOverview();

    await waitForLoadingToFinish();

    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /biometrics/i })).toBeInTheDocument();
    expect(screen.getByText(/Error 401: Unauthorized/i)).toBeInTheDocument();
    expect(
      screen.getByText(
        /Sorry, there was a problem displaying this information. You can try to reload this page, or contact the site administrator and quote the error code above/i,
      ),
    ).toBeInTheDocument();
  });

  it("renders a tabular overview of the patient's biometrics data when available", async () => {
    mockOpenmrsFetch.mockReturnValueOnce({ data: mockBiometricsResponse });
    mockUsePagination.mockReturnValueOnce({
      currentPage: 1,
      goTo: () => {},
      results: formattedBiometrics.slice(0, 5),
    });

    renderBiometricsOverview();

    await waitForLoadingToFinish();

    expect(screen.getByRole('heading', { name: /biometrics/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /table view/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /chart view/i })).toBeInTheDocument();

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

  it('toggles between rendering either a tabular view or a chart view', async () => {
    const user = userEvent.setup();

    mockOpenmrsFetch.mockReturnValueOnce({ data: mockBiometricsResponse });
    mockUsePagination.mockReturnValueOnce({
      currentPage: 1,
      goTo: () => {},
      results: formattedBiometrics.slice(0, 5),
    });

    renderBiometricsOverview();

    await waitForLoadingToFinish();

    expect(screen.getByRole('table', { name: /biometrics/i })).toBeInTheDocument();

    const chartViewButton = screen.getByRole('tab', {
      name: /chart view/i,
    });

    await user.click(chartViewButton);

    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.getByText(/biometric displayed/i)).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /weight/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /height/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /bmi/i })).toBeInTheDocument();
  });
});

function renderBiometricsOverview() {
  renderWithSwr(<BiometricsOverview {...testProps} />);
}
