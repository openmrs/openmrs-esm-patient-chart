import React from 'react';
import PastVisitOverview from './past-visit-overview.component';
import { screen, render, within } from '@testing-library/react';
import { mockPatient } from '../../../../__mocks__/patient.mock';
import { getVisitsForPatient, detach } from '@openmrs/esm-framework';
import { of, throwError } from 'rxjs';
import userEvent from '@testing-library/user-event';

const mockGetVisitsForPatient = getVisitsForPatient as jest.Mock;

const mockData = {
  data: {
    results: [
      {
        uuid: '1f0b35e2-ab94-4f96-a439-ba67e4fe22b0',
        encounters: [],
        patient: { uuid: 'b0d24286-3bcc-4010-9d27-ffb33e99774d' },
        visitType: { uuid: 'e89b4b06-8d7a-40e6-b5ad-d3209f47040b', name: 'ECH', display: 'ECH' },
        attributes: [],
        location: { uuid: '7fdfa2cb-bc95-405a-88c6-32b7673c0453', name: 'Laboratory', display: 'Laboratory' },
        startDatetime: '2021-09-07T14:44:00.000+0000',
        stopDatetime: '2021-09-07T16:26:28.000+0000',
      },
      {
        uuid: '2fcf6cbc-99e0-4b6a-9ecc-a66b455bff15',
        encounters: [],
        patient: { uuid: 'b0d24286-3bcc-4010-9d27-ffb33e99774d' },
        visitType: { uuid: '7b0f5697-27e3-40c4-8bae-f4049abfb4ed', name: 'Facility Visit', display: 'Facility Visit' },
        attributes: [],
        location: {
          uuid: '6351fcf4-e311-4a19-90f9-35667d99a8af',
          name: 'Registration Desk',
          display: 'Registration Desk',
        },
        startDatetime: '2021-09-03T06:38:21.000+0000',
        stopDatetime: '2021-09-03T06:38:27.000+0000',
      },
    ],
  },
};

jest.mock('@openmrs/esm-framework', () => ({
  getVisitsForPatient: jest.fn(),
  detach: jest.fn(),
}));

describe('PastVisitOverview', () => {
  const renderPastVisitOverview = () => {
    mockGetVisitsForPatient.mockReturnValue(of(mockData));
    render(<PastVisitOverview patientUuid={mockPatient.id} />);
  };
  it('should display past visit and launch form for editing', async () => {
    renderPastVisitOverview();
    const table = screen.queryByRole('table');
    expect(within(table).getByText('Start Date')).toBeInTheDocument();
    expect(within(table).getByText('Type')).toBeInTheDocument();
    expect(within(table).getByText('Location')).toBeInTheDocument();
    expect(within(table).getByText('End Date')).toBeInTheDocument();

    const rows = screen.getAllByRole('row');
    expect(rows.length).toBe(3);

    //open visit form in edit mode
    const firstOptionButton = screen.getAllByTitle(/open and close list of options/i)[0];
    userEvent.click(firstOptionButton);

    // close the form
    const closeButton = screen.getByRole('button', { name: /Cancel/i });
    userEvent.click(closeButton);

    expect(detach).toHaveBeenCalledWith('patient-chart-workspace-slot', 'past-visits-overview');
  });

  it('should display error state', () => {
    mockGetVisitsForPatient.mockReturnValue(throwError({ status: 500, message: 'API is down' }));
    render(<PastVisitOverview patientUuid={mockPatient.id} />);

    expect(screen.getByText(/Past Visit Error/i)).toBeInTheDocument();
  });
});
