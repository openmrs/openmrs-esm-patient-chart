import React from 'react';
import { screen, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { mockPatient } from '../../../../../__mocks__/patient.mock';
import { mockLocations } from '../../../../../__mocks__/location.mock';
import { mockCurrentVisit, mockVisitTypes } from '../../../../../__mocks__/visits.mock';
import { saveVisit, showNotification, showToast } from '@openmrs/esm-framework';
import StartVisitForm from './visit-form.component';

const testProps = {
  isTablet: false,
  patientUuid: mockPatient.id,
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
    showNotification: jest.fn(),
    showToast: jest.fn(),
    useLocations: jest.fn().mockImplementation(() => mockLocations),
    useVisitTypes: jest.fn().mockImplementation(() => mockVisitTypes),
    usePagination: jest.fn().mockImplementation(() => ({
      results: mockVisitTypes,
      goTo: () => {},
      currentPage: 1,
    })),
  };
});

describe('VisitForm: ', () => {
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

  describe('Form submission: ', () => {
    let saveButton: HTMLElement;

    beforeEach(() => {
      renderVisitForm();
      saveButton = screen.getByRole('button', { name: /Start Visit/i });
    });

    it('starts a new visit upon successful submission', () => {
      const dateInput = screen.getByLabelText('Date');
      userEvent.type(dateInput, new Date('2021-12-12').toISOString());

      const timeInput = screen.getByRole('textbox', { name: /Time/i });
      userEvent.type(timeInput, '1:30');

      const visitType = screen.getByRole('radio', { name: /Outpatient Visit/ });
      userEvent.click(visitType);

      const timeFormat = screen.getByRole('combobox', { name: /Time/i });
      userEvent.selectOptions(timeFormat, 'AM');

      const locationOptions = screen.getByRole('combobox', { name: /Select a location/i });
      userEvent.selectOptions(locationOptions, 'b1a8b05e-3542-4037-bbd3-998ee9c40574');

      const recommended = screen.getByRole('tab', { name: /Recommended/i });
      userEvent.click(recommended);

      mockGetStartedVisitGetter.mockReturnValueOnce(new BehaviorSubject(mockCurrentVisit));
      mockSaveVisit.mockReturnValueOnce(of({ status: 201 }));

      userEvent.click(saveButton);

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
      expect(showToast).toHaveBeenCalledWith({ description: 'Visit has been started successfully', kind: 'success' });
    });

    it('renders an error message if there was a problem starting a new visit', () => {
      const visitType = screen.getByRole('radio', { name: /Outpatient Visit/ });
      userEvent.click(visitType);

      mockGetStartedVisitGetter.mockReturnValueOnce(new BehaviorSubject(mockCurrentVisit));
      mockSaveVisit.mockReturnValueOnce(throwError({ status: 500, statusText: 'Internal server error' }));

      userEvent.click(saveButton);

      expect(showNotification).toHaveBeenCalledTimes(1);
      expect(showNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          kind: 'error',
          title: 'Error starting current visit',
        }),
      );
    });
  });
});

function renderVisitForm() {
  render(<StartVisitForm {...testProps} />);
}
