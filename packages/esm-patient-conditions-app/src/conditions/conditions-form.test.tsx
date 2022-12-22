import React from 'react';
import dayjs from 'dayjs';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { of } from 'rxjs/internal/observable/of';
import { throwError } from 'rxjs';
import { showNotification, showToast } from '@openmrs/esm-framework';
import { mockPatient } from '../../../../__mocks__/patient.mock';
import { searchedCondition } from '../../../../__mocks__/conditions.mock';
import { getByTextWithMarkup } from '../../../../tools/test-helpers';
import { createPatientCondition, useConditionsSearch } from './conditions.resource';
import ConditionsForm from './conditions-form.component';

jest.setTimeout(10000);

const utc = require('dayjs/plugin/utc');
dayjs.extend(utc);

const testProps = {
  closeWorkspace: jest.fn(),
  patientUuid: mockPatient.id,
  promptBeforeClosing: jest.fn(),
};

const mockCreatePatientCondition = createPatientCondition as jest.Mock;
const mockUseConditionsSearch = useConditionsSearch as jest.Mock;
const mockShowNotification = showNotification as jest.Mock;
const mockShowToast = showToast as jest.Mock;

jest.mock('lodash-es/debounce', () => jest.fn((fn) => fn));

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
  useConditionsSearch: jest.fn().mockImplementation(() => ({
    conditions: [],
    error: null,
    isSearchingConditions: false,
  })),
  updatePatientCondition: jest.fn(),
}));

describe('Conditions Form', () => {
  it('renders the conditions form with all the relevant fields and values', () => {
    renderConditionsForm();

    expect(screen.getByRole('group', { name: /Condition/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /Onset date/i })).toBeInTheDocument();
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

  it('closes the form and the workspace when the cancel button is clicked', async () => {
    const user = userEvent.setup();

    renderConditionsForm();

    const cancelButton = screen.getByRole('button', { name: /Cancel/i });

    await user.click(cancelButton);

    expect(testProps.closeWorkspace).toHaveBeenCalledTimes(1);
  });

  it('setting the status of a condition to "inactive" reveals an input for recording the end date', async () => {
    const user = userEvent.setup();

    renderConditionsForm();

    expect(screen.getByText('Condition')).toBeInTheDocument();

    await user.click(screen.getByRole('radio', { name: /Inactive/i }));

    expect(screen.getByLabelText(/End date/i)).toBeInTheDocument();
  });

  it('renders a list of related condition concepts when the user types in the searchbox', async () => {
    const user = userEvent.setup();

    renderConditionsForm();

    const conditionSearchInput = screen.getByRole('searchbox', { name: /enter condition/i });

    expect(screen.queryByRole('menuitem', { name: /Headache/i })).not.toBeInTheDocument();
    expect(screen.queryByDisplayValue('Headache')).not.toBeInTheDocument();

    await user.type(conditionSearchInput, 'Headache');

    expect(screen.getByDisplayValue(/headache/i)).toBeInTheDocument();
  });

  it('renders an error message when no matching conditions are found', async () => {
    const user = userEvent.setup();

    renderConditionsForm();

    const conditionSearchInput = screen.getByRole('searchbox', { name: /enter condition/i });

    expect(screen.queryByRole('menuitem', { name: /Post-acute sequelae of COVID-19/i })).not.toBeInTheDocument();
    expect(screen.queryByDisplayValue(/Post-acute sequelae of COVID-19/i)).not.toBeInTheDocument();

    await user.type(conditionSearchInput, 'Post-acute sequelae of COVID-19');

    expect(getByTextWithMarkup('No results for "Post-acute sequelae of COVID-19"')).toBeInTheDocument();
  });

  it('renders a success toast notification upon successfully recording a condition', async () => {
    const user = userEvent.setup();

    mockCreatePatientCondition.mockReturnValueOnce(of({ status: 201, body: 'Condition created' }));
    mockUseConditionsSearch.mockImplementation(() => ({
      conditions: searchedCondition,
      error: null,
      isSearchingConditions: false,
    }));

    renderConditionsForm();

    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    const submitButton = screen.getByRole('button', { name: /Save and close/i });
    const activeStatusInput = screen.getByRole('radio', { name: 'Active' });
    const conditionSearchInput = screen.getByRole('searchbox', { name: /Enter condition/i });
    const onsetDateInput = screen.getByRole('textbox', { name: /onset date/i });

    expect(cancelButton).toBeInTheDocument();
    expect(cancelButton).not.toBeDisabled();
    expect(submitButton).toBeInTheDocument();
    expect(submitButton).toBeDisabled();

    await user.type(conditionSearchInput, 'Headache');
    await user.click(screen.getByRole('menuitem', { name: /Headache/i }));
    await user.type(onsetDateInput, '2020-05-05');
    await user.click(activeStatusInput);

    expect(activeStatusInput).toBeChecked();
    expect(submitButton).not.toBeDisabled();

    await user.click(submitButton);

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
    const user = userEvent.setup();

    renderConditionsForm();

    const submitButton = screen.getByRole('button', { name: /Save and close/i });
    const activeStatusInput = screen.getByRole('radio', { name: 'Active' });
    const conditionSearchInput = screen.getByRole('searchbox', { name: /Enter condition/i });
    const onsetDateInput = screen.getByRole('textbox', { name: /onset date/i });

    const error = {
      message: 'Internal Server Error',
      response: {
        status: 500,
        statusText: 'Internal Server Error',
      },
    };

    mockCreatePatientCondition.mockReturnValue(throwError(error));

    await user.type(conditionSearchInput, 'Headache');
    await user.click(screen.getByRole('menuitem', { name: /Headache/i }));
    await user.type(onsetDateInput, '2020-05-05');
    await user.click(activeStatusInput);

    expect(activeStatusInput).toBeChecked();
    expect(submitButton).not.toBeDisabled();

    await user.click(submitButton);

    expect(mockShowNotification).toHaveBeenCalledTimes(1);
    expect(mockShowNotification).toHaveBeenCalledWith({
      critical: true,
      description: 'Internal Server Error',
      kind: 'error',
      title: 'Error saving condition',
    });
  });
});

function renderConditionsForm() {
  render(<ConditionsForm {...testProps} />);
}
