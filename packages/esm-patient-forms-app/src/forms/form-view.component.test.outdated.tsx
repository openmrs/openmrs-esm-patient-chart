import React from 'react';
import FormView from './form-view.component';
import userEvent from '@testing-library/user-event';
import { screen, render } from '@testing-library/react';
import { getStartedVisit } from '@openmrs/esm-framework';
import { mockForms } from '../../../../__mocks__/forms.mock';
import { mockPatient } from '../../../../__mocks__/patient.mock';
import { mockCurrentVisit } from '../../../../__mocks__/visits.mock';

jest.mock('lodash-es/debounce', () => jest.fn((fn) => fn));

describe('<FormViewComponent/>', () => {
  beforeEach(() => {
    getStartedVisit.next(mockCurrentVisit);
    render(
      <FormView
        forms={mockForms}
        patientUuid={mockPatient.id}
        encounterUuid={'5859f098-45d6-4c4e-9447-53dd4032d7d7'}
      />,
    );
  });

  it('should be able to search for a form', async () => {
    expect(screen.getByText(/Biometrics/i)).toBeInTheDocument();
    expect(screen.getByText(/Admission/i)).toBeInTheDocument();
    expect(screen.getByText(/POC Vitals/i)).toBeInTheDocument();
    const searchInput = screen.getByPlaceholderText(/Search for a form/);
    userEvent.type(searchInput, 'POC');
    expect(await screen.getByText(/1 match found/)).toBeInTheDocument();
  });

  it('should display not found message when searched form is not found', () => {
    expect(screen.getByText(/Biometrics/i)).toBeInTheDocument();
    expect(screen.getByText(/Admission/i)).toBeInTheDocument();
    expect(screen.getByText(/POC Vitals/i)).toBeInTheDocument();
    const searchInput = screen.getByPlaceholderText(/Search for a form/);
    userEvent.type(searchInput, 'some weird form');
    expect(screen.getByText(/Sorry, no forms have been found/)).toBeInTheDocument();
  });
});
