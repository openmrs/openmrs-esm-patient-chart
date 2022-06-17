import React from 'react';
import dayjs from 'dayjs';
import { screen, render, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { mockPatient } from '../../../../../__mocks__/patient.mock';
import { mockLocations } from '../../../../../__mocks__/location.mock';
import { mockCurrentVisit, mockVisitTypes } from '../../../../../__mocks__/visits.mock';
import { saveVisit, showNotification, showToast, toOmrsIsoString, toDateObjectStrict } from '@openmrs/esm-framework';
import { getByTextWithMarkup } from '../../../../../tools/test-helpers';
import StartVisitForm from './visit-form.component';

const isoFormat = 'YYYY-MM-DDTHH:mm:ss.SSSZZ';
const mockDateTimeStampInSeconds = 1638682781000;
const mockCloseWorkspace = jest.fn();
const mockPromptBeforeClosing = jest.fn();

const testProps = {
  patientUuid: mockPatient.id,
  closeWorkspace: mockCloseWorkspace,
  promptBeforeClosing: mockPromptBeforeClosing,
};

const mockSaveVisit = saveVisit as jest.Mock;
const mockGetStartedVisitGetter = jest.fn();
const mockToOmrsIsoString = toOmrsIsoString as jest.Mock;
const mockToDateObjectStrict = toDateObjectStrict as jest.Mock;

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

describe('VisitForm: ', () => {
  beforeEach(() => {
    // @ts-ignore
    jest.useFakeTimers('modern');
    // @ts-ignore
    jest.setSystemTime(mockDateTimeStampInSeconds);
  });
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
      // @ts-ignore
      jest.useFakeTimers('modern');
      // @ts-ignore
      jest.setSystemTime(1638682781000); // 5 Dec 2021 05:39:41 GMT
    });

    beforeEach(() => {
      mockToDateObjectStrict.mockImplementation((date) => dayjs(date, isoFormat).toDate());
      mockToOmrsIsoString.mockImplementation((date) => dayjs(date).format(isoFormat));
      mockGetStartedVisitGetter.mockReturnValueOnce(new BehaviorSubject(mockCurrentVisit));

      renderVisitForm();
      saveButton = screen.getByRole('button', { name: /Start Visit/i });
    });

    it('renders an error message if a Visit Type is not selected', () => {
      userEvent.click(saveButton);

      const errorAlert = screen.getByRole('alert');
      expect(errorAlert).toBeInTheDocument();
      expect(getByTextWithMarkup(/Missing visit type/i)).toBeInTheDocument();
      expect(getByTextWithMarkup(/Please select a visit type/i)).toBeInTheDocument();

      userEvent.click(screen.getByLabelText(/Outpatient visit/i));

      expect(errorAlert).not.toBeInTheDocument();
    });

    it('starts a new visit upon successful submission', () => {
      // Set time
      const timePicker = screen.getByRole('textbox', { name: /Time/i });

      // Set time format
      const timeFormat = screen.getByRole('combobox', { name: /Time/i });
      userEvent.selectOptions(timeFormat, 'AM');
      fireEvent.change(timePicker, { target: { value: '08:15' } });

      // Set visit type
      userEvent.click(screen.getByLabelText(/Outpatient visit/i));

      // Set location
      const locationOptions = screen.getByRole('combobox', { name: /Select a location/i });
      userEvent.selectOptions(locationOptions, 'b1a8b05e-3542-4037-bbd3-998ee9c40574');

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
      expect(showToast).toHaveBeenCalledWith({ description: 'Visit started successfully', kind: 'success' });
    });

    it('renders an error message if there was a problem starting a new visit', () => {
      userEvent.click(screen.getByLabelText(/Outpatient visit/i));

      mockSaveVisit.mockReturnValueOnce(throwError({ status: 500, statusText: 'Internal server error' }));

      userEvent.click(saveButton);

      expect(showNotification).toHaveBeenCalledTimes(1);
      expect(showNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          kind: 'error',
          title: 'Error starting visit',
        }),
      );
    });

    test('should display unsaved-changes modal, when form has unsaved changes', () => {
      userEvent.click(screen.getByLabelText(/Outpatient visit/i));

      const closeButton = screen.getByRole('button', { name: /Discard/ });
      userEvent.click(closeButton);

      expect(mockCloseWorkspace).toHaveBeenCalled();
    });
  });
});

function renderVisitForm() {
  render(<StartVisitForm {...testProps} />);
}
