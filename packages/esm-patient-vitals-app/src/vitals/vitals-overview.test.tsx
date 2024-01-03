import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { openmrsFetch, usePagination } from '@openmrs/esm-framework';
import {
  formattedVitals,
  mockConceptMetadata,
  mockFhirVitalsResponse,
  mockVitalsConfig,
  mockVitalsSignsConcept,
} from '__mocks__';
import { mockPatient, renderWithSwr, waitForLoadingToFinish } from 'tools';
import VitalsOverview from './vitals-overview.component';

const testProps = {
  patientUuid: mockPatient.id,
  pageSize: 5,
  pageUrl: '',
  urlLabel: '',
};

const mockConceptUnits = new Map<string, string>(
  mockVitalsSignsConcept.data.results[0].setMembers.map((concept) => [concept.uuid, concept.units]),
);

const mockOpenmrsFetch = openmrsFetch as jest.Mock;
const mockUsePagination = usePagination as jest.Mock;

global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

jest.mock('@openmrs/esm-patient-common-lib', () => {
  const originalModule = jest.requireActual('@openmrs/esm-patient-common-lib');

  return {
    ...originalModule,
    launchPatientWorkspace: jest.fn(),
    useVitalsConceptMetadata: jest.fn().mockImplementation(() => ({
      data: mockConceptUnits,
      conceptMetadata: mockConceptMetadata,
    })),
  };
});

jest.mock('@openmrs/esm-framework', () => {
  const originalModule = jest.requireActual('@openmrs/esm-framework');

  return {
    ...originalModule,
    useConfig: jest.fn(() => mockVitalsConfig),
    useVisitOrOfflineVisit: jest.fn(),
    useConnectivity: jest.fn(),
    usePagination: jest.fn().mockImplementation(() => ({
      currentPage: 1,
      goTo: () => {},
      results: [],
    })),
  };
});

describe('VitalsOverview', () => {
  it('renders an empty state view if vitals data is unavailable', async () => {
    mockOpenmrsFetch.mockReturnValue({ data: [] });

    renderVitalsOverview();

    await waitForLoadingToFinish();

    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /vitals/i })).toBeInTheDocument();
    expect(screen.getByText(/There are no vital signs to display for this patient/i)).toBeInTheDocument();
    expect(screen.getByText(/Record vital signs/i)).toBeInTheDocument();
  });

  it('renders an error state view if there is a problem fetching allergies data', async () => {
    const error = {
      message: 'You are not logged in',
      response: {
        status: 401,
        statusText: 'Unauthorized',
      },
    };

    mockOpenmrsFetch.mockRejectedValueOnce(error);

    renderVitalsOverview();

    await waitForLoadingToFinish();

    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /vitals/i })).toBeInTheDocument();
    expect(screen.getByText(/Error 401: Unauthorized/i)).toBeInTheDocument();
    expect(
      screen.getByText(
        /Sorry, there was a problem displaying this information. You can try to reload this page, or contact the site administrator and quote the error code above/i,
      ),
    ).toBeInTheDocument();
  });

  it("renders a tabular overview of the patient's vital signs", async () => {
    mockOpenmrsFetch.mockReturnValue({ data: mockFhirVitalsResponse });
    mockUsePagination.mockReturnValue({
      results: formattedVitals.slice(0, 5),
      goTo: () => {},
      currentPage: 1,
    });

    renderVitalsOverview();

    await waitForLoadingToFinish();

    expect(screen.getByRole('table', { name: /vitals/i })).toBeInTheDocument();
    const expectedColumnHeaders = [/date and time/, /bp/, /r. rate/, /pulse/, /spO2/, /temp/];
    expectedColumnHeaders.map((header) =>
      expect(screen.getByRole('columnheader', { name: new RegExp(header, 'i') })).toBeInTheDocument(),
    );

    const expectedTableRows = [
      /19 - May - 2021, 07:26 37 125 \/ 93 76 12/,
      /10 - May - 2021, 09:41 37 120 \/ 85 66 45 90/,
      /07 - May - 2021, 12:04 107 \/ 90/,
    ];

    expectedTableRows.map((row) => expect(screen.getByRole('row', { name: new RegExp(row, 'i') })).toBeInTheDocument());
  });

  it('toggles between rendering either a tabular view or a chart view', async () => {
    const user = userEvent.setup();

    mockOpenmrsFetch.mockReturnValue({ data: mockFhirVitalsResponse });
    mockUsePagination.mockReturnValue({
      results: formattedVitals.slice(0, 5),
      goTo: () => {},
      currentPage: 1,
    });

    renderVitalsOverview();

    await waitForLoadingToFinish();

    expect(screen.getByRole('table', { name: /vitals/i })).toBeInTheDocument();

    const chartViewButton = screen.getByRole('tab', {
      name: /chart view/i,
    });

    await user.click(chartViewButton);

    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.getByText(/vital sign displayed/i)).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /bp/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /pulse/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /spo2/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /temp/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /r\. rate/i })).toBeInTheDocument();
  });
});

function renderVitalsOverview() {
  renderWithSwr(<VitalsOverview {...testProps} />);
}
