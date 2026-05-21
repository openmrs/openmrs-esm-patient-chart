import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  type FetchResponse,
  getDefaultsFromConfigSchema,
  openmrsFetch,
  showSnackbar,
  useConfig,
} from '@openmrs/esm-framework';
import { type PatientWorkspace2DefinitionProps } from '@openmrs/esm-patient-common-lib';
import { mockPatient } from 'tools';
import { mockProcedureTypes, mockProceduresResponse, searchedProcedure } from '__mocks__';
import { type ConfigObject, configSchema } from '../../config-schema';
import { saveProcedure, useConceptSearch, useConceptSearchField, useProcedureTypes } from '../../procedures.resource';
import ProceduresFormWorkspace, { type ProceduresFormProps } from './procedures-form.workspace';
import { type ConceptReference } from '../../types';

vi.mock('../../procedures.resource', async () => ({
  ...(await vi.importActual('../../procedures.resource')),
  saveProcedure: vi.fn(),
  useConceptSearch: vi.fn(),
  useConceptSearchField: vi.fn(),
  useProcedureTypes: vi.fn(),
  useMutatePatientProcedures: vi.fn(() => vi.fn()),
  useProcedures: vi.fn(),
}));

const mockUseConfig = vi.mocked(useConfig<ConfigObject>);
const mockOpenmrsFetch = vi.mocked(openmrsFetch);
const mockSaveProcedure = vi.mocked(saveProcedure);
const mockShowSnackbar = vi.mocked(showSnackbar);
const mockUseConceptSearch = vi.mocked(useConceptSearch);
const mockUseConceptSearchField = vi.mocked(useConceptSearchField);
const mockUseProcedureTypes = vi.mocked(useProcedureTypes);

mockUseConfig.mockReturnValue({
  ...getDefaultsFromConfigSchema(configSchema),
  procedurePageSize: 5,
  procedureConceptUuid: '',
  procedureConceptSourceType: 'any',
  bodySiteConceptUuid: '',
  bodySiteConceptSourceType: 'any',
  statusConceptUuid: '',
  statusConceptSourceType: 'any',
  durationUnitConceptUuid: '',
  durationUnitConceptSourceType: 'any',
});

const defaultProps: PatientWorkspace2DefinitionProps<ProceduresFormProps, object> = {
  closeWorkspace: vi.fn(),
  groupProps: {
    patientUuid: mockPatient.id,
    patient: mockPatient,
    visitContext: null,
    mutateVisitContext: null,
  },
  workspaceName: '',
  launchChildWorkspace: vi.fn(),
  workspaceProps: { formContext: 'creating' },
  windowProps: {},
  windowName: '',
  isRootWorkspace: false,
  showActionMenu: true,
};

const renderProceduresForm = () => {
  render(<ProceduresFormWorkspace {...defaultProps} />);
};

const fillRequiredFields = async (user: ReturnType<typeof userEvent.setup>) => {
  // The shared mockUseConceptSearch returns the same searchedProcedure mock
  // for every concept search field, so each "Appendectomy" menuitem matches the
  // currently-typed-in field — only one results list is visible at a time.
  await user.type(screen.getByRole('searchbox', { name: /enter procedure/i }), 'App');
  await user.click(screen.getByRole('menuitem', { name: /appendectomy/i }));

  await user.type(screen.getByRole('searchbox', { name: /enter body site/i }), 'Site');
  await user.click(screen.getByRole('menuitem', { name: /appendectomy/i }));

  const statusGroup = screen.getByRole('group', { name: /^status/i });
  await user.click(within(statusGroup).getByRole('combobox'));
  await user.click(screen.getByRole('option', { name: /appendectomy/i }));

  const procedureTypeGroup = screen.getByRole('group', { name: /procedure type/i });
  await user.click(within(procedureTypeGroup).getByRole('combobox'));
  await user.click(screen.getByRole('option', { name: /surgery/i }));

  const startGroup = screen.getByRole('group', { name: /start date and time/i });
  await user.click(within(startGroup).getByLabelText(/^date$/i));
  await user.paste('2026-04-27');
};

beforeEach(() => {
  mockUseProcedureTypes.mockReturnValue({ procedureTypes: mockProcedureTypes, isLoading: false });
  mockUseConceptSearch.mockReturnValue({ searchResults: [], isSearching: false });
  mockOpenmrsFetch.mockResolvedValue({ data: { results: [] } } as FetchResponse);
  mockUseConceptSearchField.mockImplementation(() => {
    const [searchTerm, setSearchTerm] = React.useState('');
    const [selectedConcept, setSelectedConcept] = React.useState<ConceptReference | null>(null);
    const { searchResults, isSearching } = mockUseConceptSearch(searchTerm, { uuid: '', sourceType: 'any' });
    return {
      searchTerm,
      setSearchTerm,
      selectedConcept,
      setSelectedConcept,
      searchResults,
      isSearching,
      clear: () => {
        setSearchTerm('');
        setSelectedConcept(null);
      },
    };
  });
});

describe('ProceduresForm', () => {
  it('renders all form fields', () => {
    renderProceduresForm();

    expect(screen.getByRole('searchbox', { name: /enter procedure/i })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: /procedure type/i })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: /body site/i })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: /start date and time/i })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: /end date and time/i })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: /^procedure duration$/i })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: /^status/i })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: /notes/i })).toBeInTheDocument();
  });

  it('renders Cancel and Save & close buttons', () => {
    renderProceduresForm();

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    const submitButton = screen.getByRole('button', { name: /save & close/i });
    expect(cancelButton).toBeInTheDocument();
    expect(cancelButton).toBeEnabled();
    expect(submitButton).toBeInTheDocument();
    expect(submitButton).toBeEnabled();
  });

  it('calls closeWorkspace when Cancel is clicked', async () => {
    const user = userEvent.setup();
    renderProceduresForm();

    await user.click(screen.getByRole('button', { name: /cancel/i }));
    expect(defaultProps.closeWorkspace).toHaveBeenCalledTimes(1);
  });

  it('shows a validation error when submitting without a procedure', async () => {
    const user = userEvent.setup();
    renderProceduresForm();

    await user.click(screen.getByRole('button', { name: /save & close/i }));

    expect(screen.getByText(/a procedure is required/i)).toBeInTheDocument();
  });

  it('renders search results as the user types in the procedure search box', async () => {
    const user = userEvent.setup();

    mockUseConceptSearch.mockReturnValue({ searchResults: searchedProcedure, isSearching: false });

    renderProceduresForm();

    await user.type(screen.getByRole('searchbox', { name: /enter procedure/i }), 'App');

    expect(screen.getByRole('menuitem', { name: /appendectomy/i })).toBeInTheDocument();
  });

  it('shows a "No results" tile when a search yields no matches', async () => {
    const user = userEvent.setup();

    mockUseConceptSearch.mockReturnValue({ searchResults: [], isSearching: false });

    renderProceduresForm();

    await user.type(screen.getByRole('searchbox', { name: /enter procedure/i }), 'Xyz123');

    expect(screen.getByText(/no results for/i)).toBeInTheDocument();
  });

  it('shows a loading indicator while searching', async () => {
    const user = userEvent.setup();

    mockUseConceptSearch.mockReturnValue({ searchResults: [], isSearching: true });

    renderProceduresForm();

    await user.type(screen.getByRole('searchbox', { name: /enter procedure/i }), 'App');

    expect(screen.getByText(/searching/i)).toBeInTheDocument();
  });

  it('displays procedure types in the ComboBox', async () => {
    const user = userEvent.setup();
    renderProceduresForm();

    // The ComboBox input is within the "Procedure type" group
    const procedureTypeGroup = screen.getByRole('group', { name: /procedure type/i });
    const combobox = within(procedureTypeGroup).getByRole('combobox');
    expect(combobox).toBeInTheDocument();

    // Open the dropdown and expect items to appear
    await user.click(combobox);
    expect(screen.getByRole('option', { name: /surgery/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /endoscopy/i })).toBeInTheDocument();
  });

  it('shows a loading indicator for procedure types while loading', () => {
    mockUseProcedureTypes.mockReturnValue({ procedureTypes: [], isLoading: true });
    renderProceduresForm();

    expect(screen.getAllByText(/loading/i).length).toBeGreaterThan(0);
  });

  it('calls saveProcedure with the correct payload on submission', async () => {
    const user = userEvent.setup();

    mockUseConceptSearch.mockReturnValue({ searchResults: searchedProcedure, isSearching: false });
    mockSaveProcedure.mockResolvedValue({ status: 201 } as unknown as FetchResponse);

    renderProceduresForm();

    await fillRequiredFields(user);
    await user.click(screen.getByRole('button', { name: /save & close/i }));

    await waitFor(() =>
      expect(mockSaveProcedure).toHaveBeenCalledWith({
        patient: mockPatient.id,
        procedureCoded: 'proc-concept-uuid-1',
        procedureType: 'pt-uuid-1',
        bodySite: 'proc-concept-uuid-1',
        startDateTime: expect.stringMatching(/^2026-04-27T/),
        endDateTime: null,
        status: 'proc-concept-uuid-1',
        notes: '',
        estimatedStartDate: null,
        duration: null,
        durationUnit: null,
      }),
    );
  });

  it('includes notes in the payload when provided', async () => {
    const user = userEvent.setup();

    mockUseConceptSearch.mockReturnValue({ searchResults: searchedProcedure, isSearching: false });
    mockSaveProcedure.mockResolvedValue({ status: 201 } as unknown as FetchResponse);

    renderProceduresForm();

    await fillRequiredFields(user);
    await user.type(screen.getByPlaceholderText(/enter notes/i), 'Some clinical notes');
    await user.click(screen.getByRole('button', { name: /save & close/i }));

    await waitFor(() =>
      expect(mockSaveProcedure).toHaveBeenCalledWith(expect.objectContaining({ notes: 'Some clinical notes' })),
    );
  });

  it('includes the selected procedure type in the payload', async () => {
    const user = userEvent.setup();

    mockUseConceptSearch.mockReturnValue({ searchResults: searchedProcedure, isSearching: false });
    mockSaveProcedure.mockResolvedValue({ status: 201 } as unknown as FetchResponse);

    renderProceduresForm();

    await fillRequiredFields(user);
    await user.click(screen.getByRole('button', { name: /save & close/i }));

    await waitFor(() =>
      expect(mockSaveProcedure).toHaveBeenCalledWith(expect.objectContaining({ procedureType: 'pt-uuid-1' })),
    );
  });

  it('closes the workspace after a successful save', async () => {
    const user = userEvent.setup();

    mockUseConceptSearch.mockReturnValue({ searchResults: searchedProcedure, isSearching: false });
    mockSaveProcedure.mockResolvedValue({ status: 201 } as unknown as FetchResponse);

    renderProceduresForm();

    await fillRequiredFields(user);
    await user.click(screen.getByRole('button', { name: /save & close/i }));

    await waitFor(() => expect(defaultProps.closeWorkspace).toHaveBeenCalledWith({ discardUnsavedChanges: true }));
  });

  it('shows a success snackbar after successfully saving a procedure', async () => {
    const user = userEvent.setup();

    mockUseConceptSearch.mockReturnValue({ searchResults: searchedProcedure, isSearching: false });
    mockSaveProcedure.mockResolvedValue({ status: 201 } as unknown as FetchResponse);
    mockOpenmrsFetch.mockResolvedValue({ data: mockProceduresResponse } as FetchResponse);

    renderProceduresForm();

    await fillRequiredFields(user);
    await user.click(screen.getByRole('button', { name: /save & close/i }));

    await waitFor(() => expect(mockShowSnackbar).toHaveBeenCalled());
    expect(mockShowSnackbar).toHaveBeenCalledWith(
      expect.objectContaining({ kind: 'success', title: 'Procedure saved' }),
    );
  });

  it('includes duration and duration unit in the payload when provided', async () => {
    const user = userEvent.setup();

    mockUseConceptSearch.mockReturnValue({ searchResults: searchedProcedure, isSearching: false });
    mockSaveProcedure.mockResolvedValue({ status: 201 } as unknown as FetchResponse);

    renderProceduresForm();

    await fillRequiredFields(user);

    const durationInput = screen.getByRole('spinbutton', { name: /^duration$/i });
    await user.type(durationInput, '30');

    const unitCombobox = screen.getByRole('combobox', { name: /duration unit/i });
    await user.click(unitCombobox);
    await user.click(screen.getByRole('option', { name: /appendectomy/i }));

    await user.click(screen.getByRole('button', { name: /save & close/i }));

    await waitFor(() =>
      expect(mockSaveProcedure).toHaveBeenCalledWith(
        expect.objectContaining({ duration: 30, durationUnit: 'proc-concept-uuid-1' }),
      ),
    );
  });

  it('requires a duration unit when a duration value is entered', async () => {
    const user = userEvent.setup();

    mockUseConceptSearch.mockReturnValue({ searchResults: searchedProcedure, isSearching: false });

    renderProceduresForm();

    await user.type(screen.getByRole('searchbox', { name: /enter procedure/i }), 'App');
    await user.click(screen.getByRole('menuitem', { name: /appendectomy/i }));

    const durationInput = screen.getByRole('spinbutton', { name: /^duration$/i });
    await user.type(durationInput, '5');

    await user.click(screen.getByRole('button', { name: /save & close/i }));

    expect(await screen.findByText(/duration unit is required/i)).toBeInTheDocument();
    expect(mockSaveProcedure).not.toHaveBeenCalled();
  });

  it('renders Carbon TimePicker inputs alongside the start and end date pickers', () => {
    renderProceduresForm();

    const startGroup = screen.getByRole('group', { name: /start date and time/i });
    expect(within(startGroup).getByLabelText(/^date$/i)).toBeInTheDocument();
    expect(within(startGroup).getByLabelText(/^time$/i)).toBeInTheDocument();
    expect(within(startGroup).getByLabelText(/am\/pm/i)).toBeInTheDocument();

    const endGroup = screen.getByRole('group', { name: /end date and time/i });
    expect(within(endGroup).getByLabelText(/^date$/i)).toBeInTheDocument();
    expect(within(endGroup).getByLabelText(/^time$/i)).toBeInTheDocument();
    expect(within(endGroup).getByLabelText(/am\/pm/i)).toBeInTheDocument();
  });

  it('disables the TimePicker and AM/PM select until a date is picked', async () => {
    const user = userEvent.setup();
    renderProceduresForm();

    const startGroup = screen.getByRole('group', { name: /start date and time/i });
    const startTimeInput = within(startGroup).getByLabelText(/^time$/i);
    const startMeridiemSelect = within(startGroup).getByLabelText(/am\/pm/i);
    expect(startTimeInput).toBeDisabled();
    expect(startMeridiemSelect).toBeDisabled();

    const startDateInput = within(startGroup).getByLabelText(/^date$/i);
    await user.click(startDateInput);
    await user.paste('2026-04-27');

    expect(startTimeInput).toBeEnabled();
    expect(startMeridiemSelect).toBeEnabled();
  });

  it('submits the combined date and time as an ISO datetime using the AM/PM selection', async () => {
    const user = userEvent.setup();

    mockUseConceptSearch.mockReturnValue({ searchResults: searchedProcedure, isSearching: false });
    mockSaveProcedure.mockResolvedValue({ status: 201 } as unknown as FetchResponse);

    renderProceduresForm();

    await user.type(screen.getByRole('searchbox', { name: /enter procedure/i }), 'App');
    await user.click(screen.getByRole('menuitem', { name: /appendectomy/i }));
    await user.type(screen.getByRole('searchbox', { name: /enter body site/i }), 'Site');
    await user.click(screen.getByRole('menuitem', { name: /appendectomy/i }));
    const statusGroup = screen.getByRole('group', { name: /^status/i });
    await user.click(within(statusGroup).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: /appendectomy/i }));

    const procedureTypeGroup = screen.getByRole('group', { name: /procedure type/i });
    await user.click(within(procedureTypeGroup).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: /surgery/i }));

    const startGroup = screen.getByRole('group', { name: /start date and time/i });
    await user.click(within(startGroup).getByLabelText(/^date$/i));
    await user.paste('2026-04-27');
    await user.type(within(startGroup).getByLabelText(/^time$/i), '02:30');
    await user.selectOptions(within(startGroup).getByLabelText(/am\/pm/i), 'PM');

    await user.click(screen.getByRole('button', { name: /save & close/i }));

    await waitFor(() =>
      expect(mockSaveProcedure).toHaveBeenCalledWith(
        expect.objectContaining({
          startDateTime: expect.stringMatching(/^2026-04-27T14:30/),
        }),
      ),
    );
  });

  it('keeps morning hours unchanged when AM is the selected meridiem', async () => {
    const user = userEvent.setup();

    mockUseConceptSearch.mockReturnValue({ searchResults: searchedProcedure, isSearching: false });
    mockSaveProcedure.mockResolvedValue({ status: 201 } as unknown as FetchResponse);

    renderProceduresForm();

    await fillRequiredFields(user);

    const startGroup = screen.getByRole('group', { name: /start date and time/i });
    await user.type(within(startGroup).getByLabelText(/^time$/i), '09:15');

    await user.click(screen.getByRole('button', { name: /save & close/i }));

    await waitFor(() =>
      expect(mockSaveProcedure).toHaveBeenCalledWith(
        expect.objectContaining({
          startDateTime: expect.stringMatching(/^2026-04-27T09:15/),
        }),
      ),
    );
  });

  it('shows an error notification when saving fails', async () => {
    const user = userEvent.setup();

    mockUseConceptSearch.mockReturnValue({ searchResults: searchedProcedure, isSearching: false });
    mockSaveProcedure.mockRejectedValue(new Error('Internal Server Error'));
    mockOpenmrsFetch.mockResolvedValue({ data: { results: [] } } as FetchResponse);

    renderProceduresForm();

    await fillRequiredFields(user);
    await user.click(screen.getByRole('button', { name: /save & close/i }));

    await screen.findByText(/error saving procedure/i);
    expect(screen.getByText(/internal server error/i)).toBeInTheDocument();
  });

  it('clears exact start date and requires estimated date when toggled to unknown', async () => {
    const user = userEvent.setup();
    mockUseConceptSearch.mockReturnValue({ searchResults: searchedProcedure, isSearching: false });
    renderProceduresForm();

    await fillRequiredFields(user);

    const noSwitch = screen.getByRole('tab', { name: /^no$/i });
    await user.click(noSwitch);

    await user.click(screen.getByRole('button', { name: /save & close/i }));

    expect(screen.getByText(/start date is required/i)).toBeInTheDocument();

    await user.click(screen.getByRole('combobox', { name: /year/i }));
    await user.click(screen.getByRole('option', { name: '2023' }));

    expect(screen.queryByText(/start date is required/i)).not.toBeInTheDocument();
  });

  it('saves an estimated start date when "Is start date known?" is "No"', async () => {
    const user = userEvent.setup();
    mockUseConceptSearch.mockReturnValue({ searchResults: searchedProcedure, isSearching: false });
    mockSaveProcedure.mockResolvedValue({ status: 201 } as unknown as FetchResponse);
    renderProceduresForm();

    await user.type(screen.getByRole('searchbox', { name: /enter procedure/i }), 'App');
    await user.click(screen.getByRole('menuitem', { name: /appendectomy/i }));
    await user.type(screen.getByRole('searchbox', { name: /enter body site/i }), 'Site');
    await user.click(screen.getByRole('menuitem', { name: /appendectomy/i }));
    const statusGroup = screen.getByRole('group', { name: /^status/i });
    await user.click(within(statusGroup).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: /appendectomy/i }));
    const procedureTypeGroup = screen.getByRole('group', { name: /procedure type/i });
    await user.click(within(procedureTypeGroup).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: /surgery/i }));

    const known = screen.getByRole('group', { name: /is start date known/i });
    await user.click(within(known).getByRole('tab', { name: /^no$/i }));

    await user.click(screen.getByRole('combobox', { name: /year/i }));
    await user.click(screen.getByRole('option', { name: '2023' }));
    await user.click(screen.getByRole('combobox', { name: /month/i }));
    await user.click(screen.getByRole('option', { name: /may/i }));

    await user.click(screen.getByRole('button', { name: /save & close/i }));
    await waitFor(() =>
      expect(mockSaveProcedure).toHaveBeenCalledWith(
        expect.objectContaining({ startDateTime: null, estimatedStartDate: '2023-05' }),
      ),
    );
  });
});
