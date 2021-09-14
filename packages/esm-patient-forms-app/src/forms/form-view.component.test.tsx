import React from 'react';
import FormView from './form-view.component';
import userEvent from '@testing-library/user-event';
import { screen, render } from '@testing-library/react';
import { mockForms } from '../../../../__mocks__/forms.mock';
import { mockPatient } from '../../../../__mocks__/patient.mock';
import { mockCurrentVisit } from '../../../../__mocks__/visits.mock';
import { usePagination, useVisit } from '@openmrs/esm-framework';

const mockUseVisit = useVisit as jest.Mock;
const mockUsePagination = usePagination as jest.Mock;
const mockLaunchFormEntry = jest.fn();

window.CustomEvent = mockLaunchFormEntry;

jest.mock('lodash-es/debounce', () => jest.fn((fn) => fn));

jest.mock('@openmrs/esm-framework', () => ({
  ...(jest.requireActual('@openmrs/esm-framework') as any),
  useVisit: jest.fn(),
  usePagination: jest.fn(),
}));

describe('<FormViewComponent/>', () => {
  beforeEach(() => {
    mockUseVisit.mockReturnValue({
      currentVisit: mockCurrentVisit.visitData,
      error: null,
    });
    mockUsePagination.mockReturnValue({
      results: mockForms.slice(0, 3),
      goTo: () => {},
      currentPage: 1,
    });
    render(
      <FormView
        forms={mockForms}
        patientUuid={mockPatient.id}
        patient={mockPatient}
        encounterUuid={'5859f098-45d6-4c4e-9447-53dd4032d7d7'}
        pageUrl={'/seeAll'}
        urlLabel=""
        pageSize={5}
      />,
    );
  });

  afterEach(() => {
    mockUseVisit.mockReset();
    mockUsePagination.mockReset();
  });

  it('should be able to search for a form', async () => {
    expect(screen.getByText(/Biometrics/i)).toBeInTheDocument();
    expect(screen.getByText(/Admission/i)).toBeInTheDocument();
    expect(screen.getByText(/POC Vitals/i)).toBeInTheDocument();
    const searchInput = screen.getByPlaceholderText(/Search for a form/);
    userEvent.type(searchInput, 'I');
    expect(await screen.findByText(/3 match found/)).toBeInTheDocument();
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
