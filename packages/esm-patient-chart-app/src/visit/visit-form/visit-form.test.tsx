import React from 'react';
import { of, throwError } from 'rxjs';
import { screen, render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { saveVisit, showNotification, showToast } from '@openmrs/esm-framework';
import { mockLocations } from '../../__mocks__/location.mock';
import { mockPatient } from '../../../../../tools/test-helpers';
import { mockVisitTypes } from '../../__mocks__/visits.mock';
import StartVisitForm from './visit-form.component';

const mockCloseWorkspace = jest.fn();
const mockPromptBeforeClosing = jest.fn();

const testProps = {
  patientUuid: mockPatient.id,
  closeWorkspace: mockCloseWorkspace,
  promptBeforeClosing: mockPromptBeforeClosing,
};

const mockSaveVisit = saveVisit as jest.Mock;
const mockGetStartedVisitGetter = jest.fn();

jest.mock('@openmrs/esm-framework', () => {
  const originalModule = jest.requireActual('@openmrs/esm-framework');

  return {
    ...originalModule,

    get getStartedVisit() {
      return mockGetStartedVisitGetter();
    },
    saveVisit: jest.fn(),
    toOmrsIsoString: jest.fn(),
    useLocations: jest.fn(),
    toDateObjectStrict: jest.fn(),
    useVisitTypes: jest.fn().mockImplementation(() => mockVisitTypes),
    usePagination: jest.fn().mockImplementation(() => ({
      results: mockVisitTypes,
      goTo: () => {},
      currentPage: 1,
    })),
  };
});

jest.mock('@openmrs/esm-patient-common-lib', () => {
  const originalModule = jest.requireActual('@openmrs/esm-patient-common-lib');

  return {
    ...originalModule,
    useActivePatientEnrollment: jest.fn().mockReturnValue({
      activePatientEnrollment: [],
      isLoading: false,
    }),
  };
});

jest.mock('../hooks/useDefaultLocation', () => {
  const requireActual = jest.requireActual('../hooks/useDefaultLocation');

  return {
    ...requireActual,
    useDefaultLoginLocation: jest.fn(() => ({
      defaultFacility: null,
      isLoading: false,
    })),
  };
});

jest.mock('../hooks/useLocations', () => {
  const requireActual = jest.requireActual('../hooks/useLocations');
  return {
    ...requireActual,
    useLocations: jest.fn(() => ({
      locations: mockLocations,
      isLoading: false,
      error: null,
    })),
  };
});

describe('Visit Form', () => {
  it('renders the Start Visit form with all the relevant fields and values', async () => {
    renderVisitForm();

    expect(screen.getByRole('textbox', { name: /Date/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /Time/i })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /Time/i })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /Select a location/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /HIV Return Visit/ })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /AM/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /PM/i })).toBeInTheDocument();

    expect(screen.getByRole('button', { name: /Start Visit/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Discard/i })).toBeInTheDocument();

    // Testing the location picker
    const combobox = screen.getByRole('combobox', { name: /Select a location/i });
    expect(screen.getByText(/Outpatient Visit/i)).toBeInTheDocument();
    await waitFor(() => userEvent.click(combobox));
    expect(screen.getByText(/Mosoriot/i)).toBeInTheDocument();
    expect(screen.getByText(/Inpatient Ward/i)).toBeInTheDocument();
  });

  it('renders an error message when a visit type has not been selected', async () => {
    const user = userEvent.setup();

    renderVisitForm();

    const saveButton = screen.getByRole('button', { name: /start visit/i });

    await waitFor(() => user.click(saveButton));

    expect(screen.queryAllByText(/Please select a visit type/i)).not.toBe([]);

    await waitFor(() => user.click(screen.getByLabelText(/Outpatient visit/i)));
  });

  it('starts a new visit upon successful submission of the form', async () => {
    const user = userEvent.setup();

    renderVisitForm();

    const saveButton = screen.getByRole('button', { name: /Start visit/i });

    // Set visit type
    await waitFor(() => user.click(screen.getByLabelText(/Outpatient visit/i)));

    // Set location
    const locationPicker = screen.getByRole('combobox', { name: /Select a location/i });
    await waitFor(() => userEvent.click(locationPicker));
    await waitFor(() => user.click(screen.getByText('Inpatient Ward')));

    mockSaveVisit.mockReturnValueOnce(
      of({
        status: 201,
        data: {
          visitType: {
            display: 'Facility Visit',
          },
        },
      }),
    );

    await waitFor(() => user.click(saveButton));
  });

  it('renders an error message if there was a problem starting a new visit', async () => {
    mockSaveVisit.mockReturnValueOnce(throwError({ status: 500, statusText: 'Internal server error' }));

    const user = userEvent.setup();

    renderVisitForm();

    await waitFor(() => user.click(screen.getByLabelText(/Outpatient visit/i)));

    const saveButton = screen.getByRole('button', { name: /Start Visit/i });

    await waitFor(() => user.click(saveButton));
  });

  it('displays the `Unsaved changes` modal when a form has unsaved changes', async () => {
    const user = userEvent.setup();

    renderVisitForm();

    await waitFor(() => user.click(screen.getByLabelText(/Outpatient visit/i)));

    const closeButton = screen.getByRole('button', { name: /Discard/i });

    await waitFor(() => user.click(closeButton));

    expect(mockCloseWorkspace).toHaveBeenCalled();
  });
});

function renderVisitForm() {
  render(<StartVisitForm {...testProps} />);
}
