import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { of } from 'rxjs/internal/observable/of';
import { throwError } from 'rxjs/internal/observable/throwError';
import { attach, openmrsObservableFetch, usePagination } from '@openmrs/esm-framework';
import { mockPatient } from '../../../../__mocks__/patient.mock';
import { formattedVitals, mockFhirVitalsResponse } from '../../../../__mocks__/vitals.mock';
import VitalsOverview from './vitals-overview.component';

const mockVitalsConfig = {
  concepts: {
    systolicBloodPressureUuid: '5085AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    diastolicBloodPressureUuid: '5085AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    pulseUuid: '5087AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    temperatureUuid: '5088AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    oxygenSaturationUuid: '5092AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    heightUuid: '5090AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    weightUuid: '5089AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    respiratoryRateUuid: '5242AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  },
};

const testProps = {
  patientUuid: mockPatient.id,
  showAddVitals: false,
  pageSize: 5,
  pageUrl: '',
  urlLabel: '',
};

const mockAttach = attach as jest.Mock;
const mockOpenmrsObservableFetch = openmrsObservableFetch as jest.Mock;
const mockUsePagination = usePagination as jest.Mock;

jest.mock('@openmrs/esm-framework', () => ({
  ...(jest.requireActual('@openmrs/esm-framework') as any),
  attach: jest.fn(),
  openmrsObservableFetch: jest.fn(),
  useConfig: jest.fn(() => mockVitalsConfig),
  usePagination: jest.fn(),
}));

describe('VitalsOverview: ', () => {
  it('renders an empty state view if vitals data is unavailable', () => {
    mockOpenmrsObservableFetch.mockReturnValue(of({ data: [] }));

    renderVitalsOverview();

    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /vitals/i })).toBeInTheDocument();
    expect(screen.getByText(/There are no vital signs to display for this patient/i)).toBeInTheDocument();
    expect(screen.getByText(/Record vital signs/i)).toBeInTheDocument();
  });

  it('renders an error state view if there is a problem fetching allergies data', () => {
    const error = {
      message: 'You are not logged in',
      response: {
        status: 401,
        statusText: 'Unauthorized',
      },
    };

    mockOpenmrsObservableFetch.mockReturnValue(throwError(error));

    renderVitalsOverview();

    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /vitals/i })).toBeInTheDocument();
    expect(screen.getByText(/Error 401: Unauthorized/i)).toBeInTheDocument();
    expect(
      screen.getByText(
        /Sorry, there was a problem displaying this information. You can try to reload this page, or contact the site administrator and quote the error code above/i,
      ),
    ).toBeInTheDocument();
  });

  it("renders an overview of the patient's vital signs", async () => {
    mockOpenmrsObservableFetch.mockReturnValueOnce(of({ data: mockFhirVitalsResponse }));
    mockUsePagination.mockReturnValueOnce({
      results: formattedVitals.slice(0, 5),
      goTo: () => {},
      currentPage: 1,
    });

    renderVitalsOverview();

    await screen.findByRole('heading', { name: /vitals/i });
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

  it('can toggle between rendering either a table view or a chart view', async () => {
    mockOpenmrsObservableFetch.mockReturnValueOnce(of({ data: mockFhirVitalsResponse }));
    mockUsePagination.mockReturnValue({
      results: formattedVitals.slice(0, 5),
      goTo: () => {},
      currentPage: 1,
    });

    renderVitalsOverview();

    await screen.findByRole('heading', { name: /vitals/i });

    const chartViewButton = screen.getByRole('button', {
      name: /chart view/i,
    });
    const tableViewButton = screen.getByRole('button', {
      name: /table view/i,
    });

    userEvent.click(chartViewButton);
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.getByText(/vital sign displayed/i)).toBeInTheDocument();
    expect(screen.getAllByRole('tab').length).toEqual(5);
    expect(screen.getByRole('tab', { name: /bp/i })).toHaveValue('');

    userEvent.click(tableViewButton);
    expect(screen.queryByRole('table')).toBeInTheDocument();
    expect(screen.queryByText(/vital sign displayed/i)).not.toBeInTheDocument();
  });

  it('clicking the Add button launches the vitals form in a workspace', async () => {
    testProps.showAddVitals = true;
    mockOpenmrsObservableFetch.mockReturnValueOnce(of({ data: mockFhirVitalsResponse }));
    mockUsePagination.mockReturnValueOnce({
      results: formattedVitals.slice(0, 5),
      goTo: () => {},
      currentPage: 1,
    });

    renderVitalsOverview();

    await screen.findByRole('heading', { name: /vitals/i });

    const addVitalsButton = screen.getByLabelText(/Add vitals/i);
    expect(addVitalsButton).toBeInTheDocument();
    userEvent.click(addVitalsButton);

    expect(mockAttach).toHaveBeenCalledTimes(1);
    expect(mockAttach).toHaveBeenCalledWith('patient-chart-workspace-slot', 'patient-vitals-biometrics-form-workspace');
  });
});

function renderVitalsOverview() {
  render(<VitalsOverview {...testProps} />);
}
