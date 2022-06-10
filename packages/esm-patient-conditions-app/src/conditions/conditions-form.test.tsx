import React from 'react';
import dayjs from 'dayjs';
import { fireEvent, render, screen } from '@testing-library/react';
import { delay } from 'rxjs/operators';
import { of } from 'rxjs/internal/observable/of';
import { throwError } from 'rxjs';
import { mockPatient } from '../../../../__mocks__/patient.mock';
import { searchedCondition } from '../../../../__mocks__/conditions.mock';
import { createErrorHandler, showNotification, showToast, useLayoutType } from '@openmrs/esm-framework';
import { createPatientCondition, searchConditionConcepts } from './conditions.resource';
import { getByTextWithMarkup, waitForLoadingToFinish } from '../../../../tools/test-helpers';
import ConditionsForm from './conditions-form.component';

const utc = require('dayjs/plugin/utc');
dayjs.extend(utc);

jest.mock('lodash-es/debounce', () => jest.fn((fn) => fn));

const testProps = {
  patientUuid: mockPatient.id,
  closeWorkspace: jest.fn(),
  promptBeforeClosing: jest.fn(),
};

const mockCreateErrorHandler = createErrorHandler as jest.Mock;
const mockCreatePatientCondition = createPatientCondition as jest.Mock;
const mockSearchConditionConcepts = searchConditionConcepts as jest.Mock;
const mockShowNotification = showNotification as jest.Mock;
const mockShowToast = showToast as jest.Mock;
const mockUseLayoutType = useLayoutType as jest.Mock;

jest.mock('@openmrs/esm-framework', () => {
  const originalModule = jest.requireActual('@openmrs/esm-framework');

  return {
    ...originalModule,
    createErrorHandler: jest.fn(),
    showNotification: jest.fn(),
    showToast: jest.fn(),
  };
});

jest.mock('./conditions.resource', () => ({
  createPatientCondition: jest.fn(),
  searchConditionConcepts: jest.fn(),
  updatePatientCondition: jest.fn(),
}));

describe('ConditionsForm: ', () => {
  beforeEach(() => {
    testProps.closeWorkspace.mockReset();
  });

  it('renders the conditions form with all the relevant fields and values', () => {
    renderConditionsForm();

    expect(screen.getByRole('group', { name: /Condition/i })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: /Onset date/i })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: /Current status/i })).toBeInTheDocument();
    expect(screen.getByRole('search', { name: /Enter condition/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Clear search input/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Active' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Active' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Inactive' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Inactive' })).not.toBeChecked();

    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    const submitButton = screen.getByRole('button', { name: /Save and close/i });
    expect(cancelButton).toBeInTheDocument();
    expect(cancelButton).not.toBeDisabled();
    expect(submitButton).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
  });

  it('closes the form and the workspace when the cancel button is clicked', () => {
    renderConditionsForm();

    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelButton);

    expect(testProps.closeWorkspace).toHaveBeenCalledTimes(1);
  });

  it('setting the status of a condition to "inactive" reveals an input for recording the end date', () => {
    renderConditionsForm();

    expect(screen.getByText('Condition')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('radio', { name: /Inactive/i }));

    expect(screen.getByLabelText(/End date/i)).toBeInTheDocument();
  });

  describe('Conditions search: ', () => {
    let conditionSearchInput: HTMLElement;

    beforeEach(() => {
      renderConditionsForm();

      conditionSearchInput = screen.getByRole('searchbox', { name: /Enter condition/i });
    });

    it('renders a list of related condition concepts when the user types in the searchbox', async () => {
      mockSearchConditionConcepts.mockReturnValueOnce(of(searchedCondition).pipe(delay(10)));

      expect(screen.queryByRole('menuitem', { name: /Headache/i })).not.toBeInTheDocument();
      expect(screen.queryByDisplayValue('Headache')).not.toBeInTheDocument();

      fireEvent.change(conditionSearchInput, { target: { value: 'Headache' } });

      await waitForLoadingToFinish();

      expect(screen.getByDisplayValue('Headache')).toBeInTheDocument();
    });

    it('renders an error message when no matching conditions are found', async () => {
      mockSearchConditionConcepts.mockReturnValueOnce(of([]).pipe(delay(10)));

      expect(screen.queryByRole('menuitem', { name: /Post-acute sequelae of COVID-19/i })).not.toBeInTheDocument();
      expect(screen.queryByDisplayValue(/Post-acute sequelae of COVID-19/i)).not.toBeInTheDocument();

      fireEvent.change(conditionSearchInput, { target: { value: 'Post-acute sequelae of COVID-19' } });

      await waitForLoadingToFinish();

      expect(screen.queryByRole('menuitem', { name: /Post-acute sequelae of COVID-19/i })).not.toBeInTheDocument();
      expect(screen.getByDisplayValue(/Post-acute sequelae of COVID-19/i)).toBeInTheDocument();
      expect(getByTextWithMarkup('No results for "Post-acute sequelae of COVID-19"')).toBeInTheDocument();
    });
  });

  describe('Form submission: ', () => {
    let cancelButton: HTMLElement;
    let submitButton: HTMLElement;
    let activeStatusInput: HTMLElement;
    let conditionSearchInput: HTMLElement;
    let onsetDateInput: HTMLElement;

    beforeEach(() => {
      renderConditionsForm();

      cancelButton = screen.getByRole('button', { name: /Cancel/i });
      submitButton = screen.getByRole('button', { name: /Save and close/i });
      activeStatusInput = screen.getByRole('radio', { name: 'Active' });
      conditionSearchInput = screen.getByRole('searchbox', { name: /Enter condition/i });
      onsetDateInput = screen.getByRole('textbox', { name: '' });
    });

    it('renders a success toast notification upon successfully recording a condition', async () => {
      mockSearchConditionConcepts.mockReturnValueOnce(of(searchedCondition));
      mockCreatePatientCondition.mockReturnValueOnce(of({ status: 201, body: 'Condition created' }));

      expect(cancelButton).toBeInTheDocument();
      expect(cancelButton).not.toBeDisabled();
      expect(submitButton).toBeInTheDocument();
      expect(submitButton).toBeDisabled();

      fireEvent.change(conditionSearchInput, { target: { value: 'Headache' } });
      screen.getByDisplayValue('Headache');
      fireEvent.click(screen.getByRole('menuitem', { name: /Headache/i }));

      fireEvent.change(onsetDateInput, { target: { value: '2020-05-05' } });
      screen.getByDisplayValue('2020-05-05');

      fireEvent.click(activeStatusInput);
      await screen.findByRole('radio', { name: 'Active' });
      expect(activeStatusInput).toBeChecked();

      expect(submitButton).not.toBeDisabled();
      fireEvent.click(submitButton);

      expect(mockCreatePatientCondition).toHaveBeenCalledTimes(1);
      expect(mockCreatePatientCondition).toHaveBeenCalledWith(
        expect.objectContaining({
          clinicalStatus: {
            coding: [
              {
                code: 'active',
                system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
              },
            ],
          },
          code: {
            coding: [
              {
                code: '139084AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                display: 'Headache',
              },
            ],
          },
          // onsetDateTime: '2020-05-05',
          endDate: null,
          recorder: {
            reference: 'Practitioner/undefined',
          },
          resourceType: 'Condition',
          subject: {
            reference: 'Patient/' + mockPatient.id,
          },
        }),
        new AbortController(),
      );

      expect(mockShowToast).toHaveBeenCalledTimes(1);
      expect(mockShowToast).toHaveBeenCalledWith(
        expect.objectContaining({
          critical: true,
          description: 'It is now visible on the Conditions page',
          kind: 'success',
          title: 'Condition saved',
        }),
      );
    });

    it('renders an error notification if there was a problem recording a condition', async () => {
      const error = {
        message: 'Internal Server Error',
        response: {
          status: 500,
          statusText: 'Internal Server Error',
        },
      };

      mockSearchConditionConcepts.mockReturnValueOnce(of(searchedCondition));
      mockCreatePatientCondition.mockReturnValueOnce(throwError(error));

      fireEvent.change(conditionSearchInput, { target: { value: 'Headache' } });
      screen.getByDisplayValue('Headache');

      fireEvent.click(screen.getByRole('menuitem', { name: /Headache/i }));
      fireEvent.change(onsetDateInput, { target: { value: '2020-05-05' } });
      screen.getByDisplayValue('2020-05-05');

      fireEvent.click(activeStatusInput);

      await screen.findByRole('radio', { name: 'Active' });
      expect(activeStatusInput).toBeChecked();
      expect(submitButton).not.toBeDisabled();

      fireEvent.click(submitButton);

      expect(mockCreateErrorHandler).toHaveBeenCalledTimes(1);
      expect(mockShowNotification).toHaveBeenCalledTimes(1);
      expect(mockShowNotification).toHaveBeenCalledWith({
        critical: true,
        description: 'Internal Server Error',
        kind: 'error',
        title: 'Error saving condition',
      });
    });
  });
});

function renderConditionsForm() {
  render(<ConditionsForm {...testProps} />);
}
