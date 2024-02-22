import React from 'react';
import dayjs from 'dayjs';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { showSnackbar } from '@openmrs/esm-framework';
import { searchedCondition } from '__mocks__';
import { getByTextWithMarkup, mockPatient } from 'tools';
import { createCondition, useConditionsSearch } from './conditions.resource';
import ConditionsForm from './conditions-form.component';

jest.mock('zod', () => {
  const originalModule = jest.requireActual('zod');
  const mockedZod = {
    ...originalModule,
    z: {
      ...originalModule.z,
      schema: jest.fn(() => ({
        safeParse: jest.fn(() => ({
          success: true,
          data: {},
        })),
      })),
    },
  };
  return mockedZod;
});

const utc = require('dayjs/plugin/utc');
dayjs.extend(utc);

const testProps = {
  closeWorkspace: jest.fn(),
  closeWorkspaceWithSavedChanges: jest.fn(),
  patientUuid: mockPatient.id,
  formContext: 'creating' as const,
};

const mockCreateCondition = createCondition as jest.Mock;
const mockUseConditionsSearch = useConditionsSearch as jest.Mock;
const mockshowSnackbar = showSnackbar as jest.Mock;

jest.mock('lodash-es/debounce', () => jest.fn((fn) => fn));

jest.mock('@openmrs/esm-framework', () => {
  const originalModule = jest.requireActual('@openmrs/esm-framework');

  return {
    ...originalModule,
    showSnackbar: jest.fn(),
  };
});

jest.mock('./conditions.resource', () => ({
  createCondition: jest.fn(),
  editCondition: jest.fn(),
  useConditions: jest.fn().mockImplementation(() => ({
    mutate: jest.fn(),
  })),
  useConditionsSearch: jest.fn().mockImplementation(() => ({
    conditions: [],
    error: null,
    isSearching: false,
  })),
}));

describe('Conditions Form', () => {
  it('renders the conditions form with all the relevant fields and values', () => {
    renderConditionsForm();

    expect(screen.getByRole('group', { name: /Condition/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /Onset date/i })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: /Current status/i })).toBeInTheDocument();
    expect(screen.getByRole('searchbox', { name: /Enter condition/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Clear search input/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Active' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Active' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Inactive' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Inactive' })).not.toBeChecked();

    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    const submitButton = screen.getByRole('button', { name: /Save & close/i });
    expect(cancelButton).toBeInTheDocument();
    expect(cancelButton).not.toBeDisabled();
    expect(submitButton).toBeInTheDocument();
    expect(submitButton).not.toBeDisabled();
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

    mockCreateCondition.mockReturnValue(Promise.resolve({ status: 201, body: 'Condition created' }));
    mockUseConditionsSearch.mockReturnValue({
      searchResults: searchedCondition,
      error: null,
      isSearching: false,
    });

    renderConditionsForm();

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    const submitButton = screen.getByRole('button', { name: /save & close/i });
    const activeStatusInput = screen.getByRole('radio', { name: 'Active' });
    const conditionSearchInput = screen.getByRole('searchbox', { name: /enter condition/i });
    const onsetDateInput = screen.getByRole('textbox', { name: /onset date/i });

    expect(cancelButton).not.toBeDisabled();
    expect(submitButton).not.toBeDisabled();

    await user.type(conditionSearchInput, 'Headache');
    await user.click(screen.getByRole('menuitem', { name: /headache/i }));
    await user.type(onsetDateInput, '2020-05-05');

    expect(activeStatusInput).toBeChecked();
    expect(submitButton).not.toBeDisabled();

    await user.click(submitButton);
  });

  it('renders an error notification if there was a problem recording a condition', async () => {
    const user = userEvent.setup();

    renderConditionsForm();

    const submitButton = screen.getByRole('button', { name: /save & close/i });
    const activeStatusInput = screen.getByRole('radio', { name: 'Active' });
    const conditionSearchInput = screen.getByRole('searchbox', { name: /enter condition/i });
    const onsetDateInput = screen.getByRole('textbox', { name: /onset date/i });

    const error = {
      message: 'Internal Server Error',
      response: {
        status: 500,
        statusText: 'Internal Server Error',
      },
    };

    mockCreateCondition.mockImplementation(() => Promise.reject(error));

    await user.type(conditionSearchInput, 'Headache');
    await user.click(screen.getByRole('menuitem', { name: /Headache/i }));
    await user.type(onsetDateInput, '2020-05-05');
    await user.click(activeStatusInput);

    expect(activeStatusInput).toBeChecked();
    expect(submitButton).not.toBeDisabled();

    await user.click(submitButton);
  });
});

function renderConditionsForm() {
  render(<ConditionsForm promptBeforeClosing={() => {}} {...testProps} />);
}
