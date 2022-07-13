import React from 'react';
import { of, throwError } from 'rxjs';
import { screen, render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { saveVisit, showNotification, showToast } from '@openmrs/esm-framework';
import { mockPatient } from '../../../../../__mocks__/patient.mock';
import { mockLocations } from '../../../../../__mocks__/location.mock';
import { mockVisitTypes } from '../../../../../__mocks__/visits.mock';
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
    toDateObjectStrict: jest.fn(),
    useLocations: jest.fn().mockImplementation(() => mockLocations),
    useVisitTypes: jest.fn().mockImplementation(() => mockVisitTypes),
    usePagination: jest.fn().mockImplementation(() => ({
      results: mockVisitTypes,
      goTo: () => {},
      currentPage: 1,
    })),
  };
});

describe('VisitForm', () => {
  it('renders the Start Visit form with all the relevant fields and values', () => {
    renderVisitForm();

    expect(screen.getByRole('textbox', { name: /Date/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /Time/i })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /Time/i })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /Select a location/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Recommended/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /All/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /Outpatient Visit/ })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /HIV Return Visit/ })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /AM/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /PM/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /Mosoriot/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /Inpatient Ward/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Start Visit/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Discard/i })).toBeInTheDocument();
  });

  it('renders an error message if a Visit Type is not selected', async () => {
    const user = userEvent.setup();

    renderVisitForm();

    const saveButton = screen.getByRole('button', { name: /Start Visit/i });

    await waitFor(() => user.click(saveButton));

    const errorAlert = screen.getByRole('alert');
    expect(errorAlert).toBeInTheDocument();
    expect(screen.getByText(/Missing visit type/i)).toBeInTheDocument();
    expect(screen.getByText(/Please select a visit type/i)).toBeInTheDocument();

    await waitFor(() => user.click(screen.getByLabelText(/Outpatient visit/i)));

    expect(errorAlert).not.toBeInTheDocument();
  });

  it('starts a new visit upon successful submission', async () => {
    const user = userEvent.setup();

    renderVisitForm();

    const saveButton = screen.getByRole('button', { name: /Start visit/i });

    // Set visit type
    await waitFor(() => user.click(screen.getByLabelText(/Outpatient visit/i)));

    // Set location
    const locationOptions = screen.getByRole('combobox', { name: /Select a location/i });

    await waitFor(() => user.selectOptions(locationOptions, 'b1a8b05e-3542-4037-bbd3-998ee9c40574'));

    mockSaveVisit.mockReturnValueOnce(of({ status: 201 }));

    await waitFor(() => user.click(saveButton));

    expect(mockSaveVisit).toHaveBeenCalledTimes(1);
    expect(mockSaveVisit).toHaveBeenCalledWith(
      expect.objectContaining({
        location: mockLocations[1].uuid,
        patient: mockPatient.id,
        visitType: 'some-uuid1',
      }),
      new AbortController(),
    );

    expect(showToast).toHaveBeenCalledTimes(1);
    expect(showToast).toHaveBeenCalledWith({ description: 'Visit started successfully', kind: 'success' });
  });

  it('renders an error message if there was a problem starting a new visit', async () => {
    mockSaveVisit.mockReturnValueOnce(throwError({ status: 500, statusText: 'Internal server error' }));

    const user = userEvent.setup();

    renderVisitForm();

    await waitFor(() => user.click(screen.getByLabelText(/Outpatient visit/i)));

    const saveButton = screen.getByRole('button', { name: /Start Visit/i });

    await waitFor(() => user.click(saveButton));

    expect(showNotification).toHaveBeenCalledTimes(1);
    expect(showNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        kind: 'error',
        title: 'Error starting visit',
      }),
    );
  });

  it('displays the unsaved change modal when a form has unsaved changes', async () => {
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
