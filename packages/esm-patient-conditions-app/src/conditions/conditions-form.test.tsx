import React from 'react';
import dayjs from 'dayjs';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor, within } from '@testing-library/react';
import { type FetchResponse, openmrsFetch, showSnackbar } from '@openmrs/esm-framework';
import { mockFhirConditionsResponse, searchedCondition } from '__mocks__';
import { getByTextWithMarkup, mockPatient } from 'tools';
import { createCondition, useConditionsSearch } from './conditions.resource';
import ConditionsForm from './conditions-form.workspace';

const utc = require('dayjs/plugin/utc');
dayjs.extend(utc);

const defaultProps = {
  condition: null,
  closeWorkspace: jest.fn(),
  closeWorkspaceWithSavedChanges: jest.fn(),
  patientUuid: mockPatient.id,
  patient: mockPatient,
  promptBeforeClosing: jest.fn(),
  formContext: 'creating' as 'creating' | 'editing',
  setTitle: jest.fn(),
};

function renderConditionsForm(props = {}) {
  render(<ConditionsForm {...defaultProps} {...props} />);
}

const mockCreateCondition = jest.mocked(createCondition);
const mockUseConditionsSearch = jest.mocked(useConditionsSearch);
const mockShowSnackbar = jest.mocked(showSnackbar);
const mockOpenmrsFetch = jest.mocked(openmrsFetch);

jest.mock('./conditions.resource', () => ({
  ...jest.requireActual('./conditions.resource'),
  createCondition: jest.fn(),
  editCondition: jest.fn(),
  useConditionsSearch: jest.fn(),
}));

mockOpenmrsFetch.mockResolvedValue({ data: [] } as FetchResponse);
mockUseConditionsSearch.mockReturnValue({
  searchResults: [],
  error: null,
  isSearching: false,
});

mockCreateCondition.mockResolvedValue({ status: 201, body: 'Condition created' } as unknown as FetchResponse);

describe('Conditions form', () => {
  it('renders the conditions form with all the relevant fields and values', () => {
    renderConditionsForm();

    expect(screen.getByRole('group', { name: /condition/i })).toBeInTheDocument();
    expect(screen.getByTestId('onsetDate')).toBeInTheDocument();
    expect(screen.getByRole('group', { name: /clinical status/i })).toBeInTheDocument();
    expect(screen.getByRole('searchbox', { name: /enter condition/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /clear search input/i })).toBeInTheDocument();

    expect(screen.getByLabelText(/^active/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^active/i)).not.toBeChecked();
    expect(screen.getByLabelText(/inactive/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/inactive/i)).not.toBeChecked();

    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    const submitButton = screen.getByRole('button', { name: /Save & close/i });
    expect(cancelButton).toBeInTheDocument();
    expect(cancelButton).toBeEnabled();
    expect(submitButton).toBeInTheDocument();
  });

  it('closes the form and the workspace when the cancel button is clicked', async () => {
    const user = userEvent.setup();
    renderConditionsForm();

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);
    expect(defaultProps.closeWorkspace).toHaveBeenCalledTimes(1);
  });

  it('setting the status of a condition to "inactive" reveals the end date input field', async () => {
    const user = userEvent.setup();
    renderConditionsForm();

    await user.click(screen.getByLabelText(/^active/i));
    expect(screen.queryByTestId('endDate')).not.toBeInTheDocument();

    await user.click(screen.getByLabelText(/inactive/i));
    expect(screen.getByTestId('endDate')).toBeInTheDocument();
  });

  it('renders a list of matching conditions when the user types a query into the searchbox', async () => {
    const user = userEvent.setup();
    renderConditionsForm();

    const conditionSearchInput = screen.getByRole('searchbox', { name: /enter condition/i });
    expect(screen.queryByRole('menuitem', { name: /Headache/i })).not.toBeInTheDocument();
    expect(screen.queryByDisplayValue('Headache')).not.toBeInTheDocument();

    await user.type(conditionSearchInput, 'Headache');
    expect(screen.getByDisplayValue(/headache/i)).toBeInTheDocument();
  });

  it('renders an error message when there are no conditions that match the search query', async () => {
    const user = userEvent.setup();
    renderConditionsForm();

    const conditionSearchInput = screen.getByRole('searchbox', { name: /enter condition/i });
    expect(screen.queryByRole('menuitem', { name: /Post-acute sequelae of COVID-19/i })).not.toBeInTheDocument();
    expect(screen.queryByDisplayValue(/Post-acute sequelae of COVID-19/i)).not.toBeInTheDocument();

    await user.type(conditionSearchInput, 'Post-acute sequelae of COVID-19');
    expect(getByTextWithMarkup('No results for "Post-acute sequelae of COVID-19"')).toBeInTheDocument();
  });

  it('renders a success notification upon successfully recording a condition', async () => {
    const user = userEvent.setup();

    mockUseConditionsSearch.mockReturnValue({
      searchResults: searchedCondition,
      error: null,
      isSearching: false,
    });
    mockOpenmrsFetch.mockResolvedValue({
      data: mockFhirConditionsResponse,
      mutate: Promise.resolve(undefined),
    } as unknown as FetchResponse);

    renderConditionsForm();

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    const submitButton = screen.getByRole('button', { name: /save & close/i });
    const activeStatusInput = screen.getByRole('radio', { name: 'Active' });
    const conditionSearchInput = screen.getByRole('searchbox', { name: /enter condition/i });
    const onsetDateInput = screen.getByTestId('onsetDate');
    const onsetDateDayInput = within(onsetDateInput).getByRole('spinbutton', { name: /day/i });
    const onsetDateMonthInput = within(onsetDateInput).getByRole('spinbutton', { name: /month/i });
    const onsetDateYearInput = within(onsetDateInput).getByRole('spinbutton', { name: /year/i });

    expect(cancelButton).toBeEnabled();

    await user.type(conditionSearchInput, 'Headache');
    await user.click(screen.getByRole('menuitem', { name: /headache/i }));
    await user.click(activeStatusInput);
    // await user.type(onsetDateInput, '2020-05-05');
    await user.type(onsetDateDayInput, '05');
    await user.type(onsetDateMonthInput, '05');
    await user.type(onsetDateYearInput, '2020');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockShowSnackbar).toHaveBeenCalled();
    });
    expect(mockShowSnackbar).toHaveBeenCalledWith({
      kind: 'success',
      subtitle: 'It is now visible on the Conditions page',
      title: 'Condition saved',
    });
  });

  it('renders an error notification if there was a problem recording a condition', async () => {
    const user = userEvent.setup();

    mockUseConditionsSearch.mockReturnValue({
      searchResults: searchedCondition,
      error: null,
      isSearching: false,
    });

    renderConditionsForm();

    const submitButton = screen.getByRole('button', { name: /save & close/i });
    const activeStatusInput = screen.getByRole('radio', { name: 'Active' });
    const conditionSearchInput = screen.getByRole('searchbox', { name: /enter condition/i });
    const onsetDateInput = screen.getByTestId('onsetDate');
    const onsetDateDayInput = within(onsetDateInput).getByRole('spinbutton', { name: /day/i });
    const onsetDateMonthInput = within(onsetDateInput).getByRole('spinbutton', { name: /month/i });
    const onsetDateYearInput = within(onsetDateInput).getByRole('spinbutton', { name: /year/i });

    const error = {
      message: 'Internal Server Error',
      response: {
        status: 500,
        statusText: 'Internal Server Error',
      },
    };

    mockCreateCondition.mockRejectedValue(error);
    await user.type(conditionSearchInput, 'Headache');
    await user.click(screen.getByRole('menuitem', { name: /Headache/i }));
    await user.type(onsetDateDayInput, '05');
    await user.type(onsetDateMonthInput, '05');
    await user.type(onsetDateYearInput, '2020');
    await user.click(activeStatusInput);
    expect(activeStatusInput).toBeChecked();
    expect(submitButton).toBeEnabled();
    await user.click(submitButton);
  });

  it('validates the form against the provided zod schema before submitting it', async () => {
    const user = userEvent.setup();

    mockUseConditionsSearch.mockReturnValue({
      searchResults: searchedCondition,
      error: null,
      isSearching: false,
    });

    mockCreateCondition.mockResolvedValue({ status: 201, body: 'Condition created' } as unknown as FetchResponse);

    renderConditionsForm();

    const conditionSearchInput = screen.getByRole('searchbox', { name: /enter condition/i });
    const submitButton = screen.getByRole('button', { name: /save & close/i });
    await user.click(submitButton);

    expect(screen.getByText(/a condition is required/i)).toBeInTheDocument();
    expect(screen.getByText(/a clinical status is required/i)).toBeInTheDocument();

    await user.type(conditionSearchInput, 'Headache');
    await user.click(screen.getByRole('menuitem', { name: /headache/i }));
    await user.click(submitButton);

    expect(screen.getByText(/a clinical status is required/i)).toBeInTheDocument();

    await user.click(screen.getByLabelText(/^active/i));
    await user.click(submitButton);

    expect(screen.queryByText(/a condition is required/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/a clinical status is required/i)).not.toBeInTheDocument();

    await waitFor(() => {
      expect(mockShowSnackbar).toHaveBeenCalled();
    });
    expect(mockShowSnackbar).toHaveBeenCalledWith({
      kind: 'success',
      subtitle: 'It is now visible on the Conditions page',
      title: 'Condition saved',
    });
  });

  it('launching the form with an existing condition prepopulates the form with the condition details', async () => {
    const user = userEvent.setup();

    const conditionToEdit = {
      clinicalStatus: 'Active',
      conceptId: '117399AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      display: 'Hypertension',
      abatementDateTime: undefined,
      onsetDateTime: '2020-08-19T00:00:00+00:00',
      recordedDate: '2020-08-19T18:34:48+00:00',
      id: 'f4ee2cfe-3880-4ea2-a5a6-82aa8a0f6389',
    };

    mockOpenmrsFetch.mockResolvedValue({ data: mockFhirConditionsResponse } as FetchResponse);

    renderConditionsForm({ condition: conditionToEdit, formContext: 'editing' });

    expect(screen.queryByRole('searchbox', { name: /enter condition/i })).not.toBeInTheDocument();

    const inactiveStatusInput = screen.getByLabelText(/inactive/i);
    const submitButton = screen.getByRole('button', { name: /save & close/i });

    await user.click(inactiveStatusInput);
    await user.click(submitButton);
  });
});
