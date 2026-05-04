import React from 'react';
import dayjs from 'dayjs';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor } from '@testing-library/react';
import { type FetchResponse, openmrsFetch, showSnackbar } from '@openmrs/esm-framework';
import { mockFhirConditionsResponse, searchedCondition } from '__mocks__';
import { getByTextWithMarkup, mockPatient } from 'tools';
import { createCondition, useConditions, useConditionsSearch } from './conditions.resource';
import ConditionsForm, { type ConditionFormProps } from './conditions-form.workspace';
import { type PatientWorkspace2DefinitionProps } from '@openmrs/esm-patient-common-lib';

import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);

const defaultProps: PatientWorkspace2DefinitionProps<ConditionFormProps, object> = {
  closeWorkspace: jest.fn(),
  groupProps: {
    patientUuid: mockPatient.id,
    patient: mockPatient,
    visitContext: null,
    mutateVisitContext: null,
  },
  workspaceName: '',
  launchChildWorkspace: jest.fn(),
  workspaceProps: {
    condition: null,
    formContext: 'creating' as 'creating' | 'editing',
  },
  windowProps: {},
  windowName: '',
  isRootWorkspace: false,
  showActionMenu: true,
};

function renderConditionsForm(workspaceProps?: ConditionFormProps) {
  const props = {
    ...defaultProps,
    workspaceProps: {
      ...defaultProps.workspaceProps,
      ...workspaceProps,
    },
  };
  render(<ConditionsForm {...props} />);
}

const mockCreateCondition = jest.mocked(createCondition);
const mockUseConditionsSearch = jest.mocked(useConditionsSearch);
const mockUseConditions = jest.mocked(useConditions);
const mockShowSnackbar = jest.mocked(showSnackbar);
const mockOpenmrsFetch = jest.mocked(openmrsFetch);

jest.mock('./conditions.resource', () => ({
  ...jest.requireActual('./conditions.resource'),
  createCondition: jest.fn(),
  editCondition: jest.fn(),
  useConditions: jest.fn(),
  useConditionsSearch: jest.fn(),
}));

mockOpenmrsFetch.mockResolvedValue({ data: [] } as FetchResponse);
mockUseConditions.mockReturnValue({
  conditions: [],
  error: null,
  isLoading: false,
  isValidating: false,
  mutate: jest.fn().mockResolvedValue(undefined),
});
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
    expect(screen.getByLabelText(/onset date/i)).toBeInTheDocument();
    expect(screen.getByRole('group', { name: /clinical status/i })).toBeInTheDocument();
    expect(screen.getByRole('searchbox', { name: /enter condition/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /clear search input/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/^active/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^active/i)).toBeChecked();
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

    // TODO: use better selector
    await user.click(screen.getByLabelText(/^active/i));
    expect(screen.queryByLabelText('End date')).not.toBeInTheDocument();

    await user.click(screen.getByLabelText(/inactive/i));
    expect(screen.getByLabelText('End date')).toBeInTheDocument();
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

    const onsetDateInput = screen.getByRole('textbox', { name: /onset date/i });
    expect(onsetDateInput).toBeInTheDocument();

    expect(cancelButton).toBeEnabled();

    await user.type(conditionSearchInput, 'Headache');
    await user.click(screen.getByRole('menuitem', { name: /headache/i }));
    await user.click(activeStatusInput);
    await user.click(onsetDateInput);
    await user.paste('2020-05-05');
    expect(onsetDateInput).toHaveDisplayValue(/05\/05\/2020/i);
    expect(submitButton).toBeEnabled();
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
    const onsetDateInput = screen.getByRole('textbox', { name: /onset date/i });

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
    await user.click(onsetDateInput);
    await user.paste('2020-05-05');
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
    expect(screen.queryByText(/a clinical status is required/i)).not.toBeInTheDocument();

    await user.type(conditionSearchInput, 'Headache');
    await user.click(screen.getByRole('menuitem', { name: /headache/i }));
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

  it('requires selecting a condition result before submitting typed search text', async () => {
    const user = userEvent.setup();

    mockCreateCondition.mockClear();
    mockUseConditionsSearch.mockReturnValue({
      searchResults: [],
      error: null,
      isSearching: false,
    });

    renderConditionsForm();

    const conditionSearchInput = screen.getByRole('searchbox', { name: /enter condition/i });
    const submitButton = screen.getByRole('button', { name: /save & close/i });

    await user.type(conditionSearchInput, 'Definitely not a condition');
    await user.click(submitButton);

    expect(await screen.findByText(/a condition is required/i)).toBeInTheDocument();
    expect(mockCreateCondition).not.toHaveBeenCalled();
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

describe('Duplicate condition detection', () => {
  const hypertensionSearchResult = [
    {
      display: 'Hypertension',
      uuid: '117399AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    },
  ];

  it('shows a warning when selecting a condition that already exists as active', async () => {
    const user = userEvent.setup();

    mockUseConditionsSearch.mockReturnValue({
      searchResults: hypertensionSearchResult,
      error: null,
      isSearching: false,
    });

    mockUseConditions.mockReturnValue({
      conditions: [
        {
          clinicalStatus: 'Active',
          conceptId: '117399AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
          display: 'Hypertension',
          onsetDateTime: '2020-08-19T00:00:00+00:00',
          recordedDate: '2020-08-19T18:34:48+00:00',
          id: 'f4ee2cfe-3880-4ea2-a5a6-82aa8a0f6389',
        },
      ],
      error: null,
      isLoading: false,
      isValidating: false,
      mutate: jest.fn().mockResolvedValue(undefined),
    });

    renderConditionsForm();

    const conditionSearchInput = screen.getByRole('searchbox', { name: /enter condition/i });
    await user.type(conditionSearchInput, 'Hypertension');
    await user.click(screen.getByRole('menuitem', { name: /hypertension/i }));

    expect(screen.getByText(/hypertension is already on this patient's active problem list/i)).toBeInTheDocument();

    // Save button should still be enabled (non-blocking)
    expect(screen.getByRole('button', { name: /save & close/i })).toBeEnabled();
  });

  it('shows a different warning when selecting a condition that exists as inactive', async () => {
    const user = userEvent.setup();

    mockUseConditions.mockReturnValue({
      conditions: [
        {
          clinicalStatus: 'Inactive',
          conceptId: '117399AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
          display: 'Hypertension',
          onsetDateTime: '2020-07-01T00:00:00+00:00',
          recordedDate: '2020-08-19T18:35:08+00:00',
          id: 'b1bc2101-e322-4bbe-a651-200bd0d4e1ad',
        },
      ],
      error: null,
      isLoading: false,
      isValidating: false,
      mutate: jest.fn().mockResolvedValue(undefined),
    });

    mockUseConditionsSearch.mockReturnValue({
      searchResults: hypertensionSearchResult,
      error: null,
      isSearching: false,
    });

    renderConditionsForm();

    const conditionSearchInput = screen.getByRole('searchbox', { name: /enter condition/i });
    await user.type(conditionSearchInput, 'Hypertension');
    await user.click(screen.getByRole('menuitem', { name: /hypertension/i }));

    expect(screen.getByText(/was previously recorded and is now inactive/i)).toBeInTheDocument();
    expect(
      screen.getByText(/consider reactivating the existing record instead of creating a new one/i),
    ).toBeInTheDocument();

    expect(screen.getByRole('button', { name: /save & close/i })).toBeEnabled();
  });

  it('does not show a duplicate warning when selecting a condition not on the patient problem list', async () => {
    const user = userEvent.setup();

    mockUseConditionsSearch.mockReturnValue({
      searchResults: searchedCondition,
      error: null,
      isSearching: false,
    });

    mockUseConditions.mockReturnValue({
      conditions: [
        {
          clinicalStatus: 'Active',
          conceptId: '117399AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
          display: 'Hypertension',
          onsetDateTime: '2020-08-19T00:00:00+00:00',
          recordedDate: '2020-08-19T18:34:48+00:00',
          id: 'f4ee2cfe-3880-4ea2-a5a6-82aa8a0f6389',
        },
      ],
      error: null,
      isLoading: false,
      isValidating: false,
      mutate: jest.fn().mockResolvedValue(undefined),
    });

    renderConditionsForm();

    const conditionSearchInput = screen.getByRole('searchbox', { name: /enter condition/i });
    await user.type(conditionSearchInput, 'Headache');
    await user.click(screen.getByRole('menuitem', { name: /headache/i }));

    expect(screen.queryByText(/already on this patient.*active problem list/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/was previously recorded and is now inactive/i)).not.toBeInTheDocument();
  });

  it('removes the duplicate warning when the search input is cleared', async () => {
    const user = userEvent.setup();

    mockUseConditionsSearch.mockReturnValue({
      searchResults: hypertensionSearchResult,
      error: null,
      isSearching: false,
    });

    mockUseConditions.mockReturnValue({
      conditions: [
        {
          clinicalStatus: 'Active',
          conceptId: '117399AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
          display: 'Hypertension',
          onsetDateTime: '2020-08-19T00:00:00+00:00',
          recordedDate: '2020-08-19T18:34:48+00:00',
          id: 'f4ee2cfe-3880-4ea2-a5a6-82aa8a0f6389',
        },
      ],
      error: null,
      isLoading: false,
      isValidating: false,
      mutate: jest.fn().mockResolvedValue(undefined),
    });

    renderConditionsForm();

    const conditionSearchInput = screen.getByRole('searchbox', { name: /enter condition/i });
    await user.type(conditionSearchInput, 'Hypertension');
    await user.click(screen.getByRole('menuitem', { name: /hypertension/i }));

    expect(screen.getByText(/already on this patient.*active problem list/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /clear search input/i }));

    expect(screen.queryByText(/already on this patient.*active problem list/i)).not.toBeInTheDocument();
  });

  it('shows active-duplicate warning when both active and inactive duplicates exist', async () => {
    const user = userEvent.setup();

    mockUseConditionsSearch.mockReturnValue({
      searchResults: hypertensionSearchResult,
      error: null,
      isSearching: false,
    });

    mockUseConditions.mockReturnValue({
      conditions: [
        {
          clinicalStatus: 'Inactive',
          conceptId: '117399AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
          display: 'Hypertension',
          onsetDateTime: '2019-03-12T00:00:00+00:00',
          recordedDate: '2019-03-12T18:34:48+00:00',
          id: 'aa111111-1111-1111-1111-111111111111',
        },
        {
          clinicalStatus: 'Active',
          conceptId: '117399AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
          display: 'Hypertension',
          onsetDateTime: '2020-08-19T00:00:00+00:00',
          recordedDate: '2020-08-19T18:34:48+00:00',
          id: 'bb222222-2222-2222-2222-222222222222',
        },
      ],
      error: null,
      isLoading: false,
      isValidating: false,
      mutate: jest.fn().mockResolvedValue(undefined),
    });

    renderConditionsForm();

    const conditionSearchInput = screen.getByRole('searchbox', { name: /enter condition/i });
    await user.type(conditionSearchInput, 'Hypertension');
    await user.click(screen.getByRole('menuitem', { name: /hypertension/i }));

    expect(screen.getByText(/already on this patient.*active problem list/i)).toBeInTheDocument();
    expect(screen.queryByText(/was previously recorded and is now inactive/i)).not.toBeInTheDocument();
  });

  it('allows saving a condition even when a duplicate warning is shown', async () => {
    const user = userEvent.setup();

    mockUseConditionsSearch.mockReturnValue({
      searchResults: hypertensionSearchResult,
      error: null,
      isSearching: false,
    });

    const mockMutate = jest.fn().mockResolvedValue(undefined);
    mockUseConditions.mockReturnValue({
      conditions: [
        {
          clinicalStatus: 'Active',
          conceptId: '117399AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
          display: 'Hypertension',
          onsetDateTime: '2020-08-19T00:00:00+00:00',
          recordedDate: '2020-08-19T18:34:48+00:00',
          id: 'f4ee2cfe-3880-4ea2-a5a6-82aa8a0f6389',
        },
      ],
      error: null,
      isLoading: false,
      isValidating: false,
      mutate: mockMutate,
    });

    mockCreateCondition.mockResolvedValue({ status: 201, body: 'Condition created' } as unknown as FetchResponse);

    renderConditionsForm();

    const conditionSearchInput = screen.getByRole('searchbox', { name: /enter condition/i });
    await user.type(conditionSearchInput, 'Hypertension');
    await user.click(screen.getByRole('menuitem', { name: /hypertension/i }));

    expect(screen.getByText(/already on this patient.*active problem list/i)).toBeInTheDocument();

    const onsetDateInput = screen.getByRole('textbox', { name: /onset date/i });
    await user.click(onsetDateInput);
    await user.paste('2020-05-05');
    await user.click(screen.getByRole('button', { name: /save & close/i }));

    await waitFor(() => {
      expect(mockCreateCondition).toHaveBeenCalled();
    });
  });
});
