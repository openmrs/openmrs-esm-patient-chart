import React from 'react';
import userEvent from '@testing-library/user-event';
import { screen } from '@testing-library/react';
import { openmrsFetch, usePagination } from '@openmrs/esm-framework';
import { launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';
import { mockPatient } from '../../../../__mocks__/patient.mock';
import {
  formattedVitals,
  mockConceptMetadata,
  mockFhirVitalsResponse,
  mockVitalsConfig,
  mockVitalsSignsConcept,
} from '../../../../__mocks__/vitals.mock';
import { renderWithSwr, waitForLoadingToFinish } from '../../../../tools/test-helpers';
import VitalsOverview from './vitals-overview.component';

const testProps = {
  patientUuid: mockPatient.id,
  showAddVitals: false,
  pageSize: 5,
  pageUrl: '',
  urlLabel: '',
};

const mockConceptUnits = new Map<string, string>(
  mockVitalsSignsConcept.data.results[0].setMembers.map((concept) => [concept.uuid, concept.units]),
);

const mockOpenmrsFetch = openmrsFetch as jest.Mock;
const mockUsePagination = usePagination as jest.Mock;

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
    usePagination: jest.fn().mockImplementation(() => ({
      currentPage: 1,
      goTo: () => {},
      results: [],
    })),
  };
});

describe('VitalsOverview: ', () => {
  it('renders an empty state view if vitals data is unavailable', async () => {
    mockOpenmrsFetch.mockReturnValueOnce({ data: [] });

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
    mockOpenmrsFetch.mockReturnValueOnce({ data: mockFhirVitalsResponse });
    mockUsePagination.mockReturnValueOnce({
      results: formattedVitals.slice(0, 5),
      goTo: () => {},
      currentPage: 1,
    });

    renderVitalsOverview();

    await waitForLoadingToFinish();

    expect(screen.getByRole('heading', { name: /vitals/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /table view/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /chart view/i })).toBeInTheDocument();

    const expectedColumnHeaders = [/date and time/, /bp/, /r. rate/, /pulse/, /spO2/, /temp/];

    expectedColumnHeaders.map((header) =>
      expect(screen.getByRole('columnheader', { name: new RegExp(header, 'i') })).toBeInTheDocument(),
    );

    const expectedTableRows = [
      /19 - May - 2021, 07:26 121 \/ 121 12 76 37/,
      /10 - May - 2021, 09:41 120 \/ 120 45 66 90 37/,
      /07 - May - 2021, 12:04 120 \/ 120/,
    ];

    expectedTableRows.map((row) => expect(screen.getByRole('row', { name: new RegExp(row, 'i') })).toBeInTheDocument());
  });

  it('toggles between rendering either a tabular view or a chart view', async () => {
    mockOpenmrsFetch.mockReturnValueOnce({ data: mockFhirVitalsResponse });
    mockUsePagination.mockReturnValue({
      results: formattedVitals.slice(0, 5),
      goTo: () => {},
      currentPage: 1,
    });
    renderVitalsOverview();

    await waitForLoadingToFinish();

    expect(screen.getByRole('heading', { name: /vitals/i })).toBeInTheDocument();

    const chartViewButton = screen.getByRole('button', {
      name: /chart view/i,
    });
    const tabularViewButton = screen.getByRole('button', {
      name: /table view/i,
    });

    // userEvent.click(chartViewButton);
    // expect(screen.queryByRole('table')).not.toBeInTheDocument();
    // expect(screen.getByText(/vital sign displayed/i)).toBeInTheDocument();
    // expect(screen.getAllByRole('tab').length).toEqual(5);
    // expect(screen.getByRole('tab', { name: /bp/i })).toHaveValue('');

    userEvent.click(tabularViewButton);
    expect(screen.queryByRole('table')).toBeInTheDocument();
    expect(screen.queryByText(/vital sign displayed/i)).not.toBeInTheDocument();
  });

  it('clicking the Add button launches the vitals form in a workspace', async () => {
    testProps.showAddVitals = true;
    mockOpenmrsFetch.mockReturnValueOnce({ data: mockFhirVitalsResponse });
    mockUsePagination.mockReturnValueOnce({
      results: formattedVitals.slice(0, 5),
      goTo: () => {},
      currentPage: 1,
    });

    renderVitalsOverview();

    await screen.findByRole('heading', { name: /vitals/i });

    screen.debug();

    const addVitalsButton = screen.getByLabelText(/Add vitals/i);
    expect(addVitalsButton).toBeInTheDocument();

    userEvent.click(addVitalsButton);

    expect(launchPatientWorkspace).toHaveBeenCalledTimes(1);
    expect(launchPatientWorkspace).toHaveBeenCalledWith('patient-vitals-biometrics-form-workspace');
  });
});

function renderVitalsOverview() {
  renderWithSwr(<VitalsOverview {...testProps} />);
}
