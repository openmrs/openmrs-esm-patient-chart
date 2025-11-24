import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  getDefaultsFromConfigSchema,
  useConfig,
  showSnackbar,
  useLayoutType,
  isDesktop,
  useSession,
} from '@openmrs/esm-framework';
import ObsTableHorizontal from './obs-table-horizontal.component';
import { useObs, type ObsResult } from '../resources/useObs';
import { configSchemaHorizontal } from '../config-schema-obs-horizontal';
import { updateObservation, createObservationInEncounter, createEncounter } from './obs-table-horizontal.resource';

jest.mock('../resources/useObs', () => ({
  useObs: jest.fn(),
}));

jest.mock('./obs-table-horizontal.resource', () => ({
  updateObservation: jest.fn(),
  createObservationInEncounter: jest.fn(),
  createEncounter: jest.fn(),
}));

jest.mock('@openmrs/esm-framework', () => {
  const originalModule = jest.requireActual('@openmrs/esm-framework');
  return {
    ...originalModule,
    showSnackbar: jest.fn(),
    useLayoutType: jest.fn(),
    isDesktop: jest.fn(),
    useSession: jest.fn(),
    formatDate: jest.fn((date, options) => {
      if (options?.time) return 'Jan 1, 2021, 12:00 AM';
      return 'Jan 1, 2021';
    }),
    formatTime: jest.fn(() => '12:00 AM'),
  };
});

const mockUseObs = jest.mocked(useObs);
const mockUseConfig = jest.mocked(useConfig);
const mockShowSnackbar = jest.mocked(showSnackbar);
const mockUpdateObservation = jest.mocked(updateObservation);
const mockCreateObservationInEncounter = jest.mocked(createObservationInEncounter);
const mockCreateEncounter = jest.mocked(createEncounter);
const mockUseLayoutType = jest.mocked(useLayoutType);
const mockIsDesktop = jest.mocked(isDesktop);
const mockUseSession = jest.mocked(useSession);

const mockObsData = [
  {
    id: 'obs-1',
    code: { text: 'Height', coding: [{ code: '5090AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' }] },
    conceptUuid: '5090AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    dataType: 'Number',
    effectiveDateTime: '2021-02-01T00:00:00Z',
    valueQuantity: { value: 182 },
    encounter: { reference: 'Encounter/234', name: 'Outpatient' },
  },
  {
    id: 'obs-2',
    code: { text: 'Weight', coding: [{ code: '5089AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' }] },
    conceptUuid: '5089AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    dataType: 'Number',
    effectiveDateTime: '2021-02-01T00:00:00Z',
    valueQuantity: { value: 72 },
    encounter: { reference: 'Encounter/234', name: 'Outpatient' },
  },
  {
    id: 'obs-3',
    code: { text: 'Height', coding: [{ code: '5090AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' }] },
    conceptUuid: '5090AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    dataType: 'Number',
    effectiveDateTime: '2021-01-01T00:00:00Z',
    valueQuantity: { value: 180 },
    encounter: { reference: 'Encounter/123', name: 'Inpatient' },
  },
  {
    id: 'obs-4',
    code: { text: 'Weight', coding: [{ code: '5089AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' }] },
    conceptUuid: '5089AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    dataType: 'Number',
    effectiveDateTime: '2021-01-01T00:00:00Z',
    valueQuantity: { value: 70 },
    encounter: { reference: 'Encounter/123', name: 'Inpatient' },
  },
  {
    id: 'obs-5',
    code: { text: 'Chief Complaint', coding: [{ code: '164162AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' }] },
    conceptUuid: '164162AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    dataType: 'Text',
    effectiveDateTime: '2021-01-01T00:00:00Z',
    valueString: 'Headache',
    encounter: { reference: 'Encounter/123', name: 'Inpatient' },
  },
  {
    id: 'obs-6',
    code: { text: 'Diagnosis', coding: [{ code: '1284AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' }] },
    conceptUuid: '1284AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    dataType: 'Coded',
    effectiveDateTime: '2021-01-01T00:00:00Z',
    valueCodeableConcept: {
      coding: [{ code: 'answer-uuid-1', display: 'Malaria' }],
    },
    encounter: { reference: 'Encounter/123', name: 'Inpatient' },
  },
] as Array<ObsResult>;

const mockConceptData = [
  { uuid: '5090AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', display: 'Height', dataType: 'Numeric' },
  { uuid: '5089AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', display: 'Weight', dataType: 'Numeric' },
  { uuid: '164162AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', display: 'Chief Complaint', dataType: 'Text' },
  {
    uuid: '1284AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    display: 'Diagnosis',
    dataType: 'Coded',
    answers: [
      { uuid: 'answer-uuid-1', display: 'Malaria' },
      { uuid: 'answer-uuid-2', display: 'Typhoid' },
      { uuid: 'answer-uuid-3', display: 'Pneumonia' },
    ],
  },
];

describe('ObsTableHorizontal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseLayoutType.mockReturnValue('small-desktop');
    mockIsDesktop.mockReturnValue(true);
  });

  it('should render observations in a horizontal table', () => {
    mockUseObs.mockReturnValue({
      data: { observations: mockObsData, concepts: mockConceptData },
      error: null,
      isLoading: false,
      isValidating: false,
      mutate: jest.fn(),
    });
    mockUseConfig.mockReturnValue({
      ...(getDefaultsFromConfigSchema(configSchemaHorizontal) as Object),
      title: 'Vitals',
      editable: false,
      data: [
        { concept: '5090AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', label: 'Height' },
        { concept: '5089AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', label: 'Weight' },
      ],
    });

    render(<ObsTableHorizontal patientUuid="patient-123" />);

    expect(screen.getByText('Height')).toBeInTheDocument();
    expect(screen.getByText('Weight')).toBeInTheDocument();
    expect(screen.getByText('182')).toBeInTheDocument();
    expect(screen.getByText('72')).toBeInTheDocument();
  });
});

describe('ObsTableHorizontal editable mode', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseLayoutType.mockReturnValue('small-desktop');
    mockIsDesktop.mockReturnValue(true);
    mockUseSession.mockReturnValue({
      sessionLocation: { uuid: 'location-uuid-123' },
    } as any);
    mockUpdateObservation.mockResolvedValue({ data: {} } as any);
    mockCreateObservationInEncounter.mockResolvedValue({ data: {} } as any);
    mockCreateEncounter.mockResolvedValue({ data: { uuid: 'new-encounter-uuid' } } as any);
  });

  it('should show edit button on hover when editable is true', async () => {
    const user = userEvent.setup();
    const mockMutate = jest.fn().mockResolvedValue(undefined);

    mockUseObs.mockReturnValue({
      data: { observations: mockObsData, concepts: mockConceptData },
      error: null,
      isLoading: false,
      isValidating: false,
      mutate: mockMutate,
    });
    mockUseConfig.mockReturnValue({
      ...(getDefaultsFromConfigSchema(configSchemaHorizontal) as Object),
      title: 'Vitals',
      editable: true,
      data: [
        { concept: '5090AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', label: 'Height' },
        { concept: '5089AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', label: 'Weight' },
      ],
    });

    render(<ObsTableHorizontal patientUuid="patient-123" />);

    const heightCell = screen.getByRole('cell', { name: /182/ });
    expect(heightCell).toBeInTheDocument();

    // Hover over the cell to trigger the edit button visibility
    await user.hover(heightCell);
    // The edit button should be in the document (even if opacity is 0, it's still in DOM)
    const editButtons = screen.queryAllByLabelText('Edit');
    expect(editButtons.length).toBeGreaterThan(0);
  });

  it('should not show edit button when editable is false', () => {
    mockUseObs.mockReturnValue({
      data: { observations: mockObsData, concepts: mockConceptData },
      error: null,
      isLoading: false,
      isValidating: false,
      mutate: jest.fn(),
    });
    mockUseConfig.mockReturnValue({
      ...(getDefaultsFromConfigSchema(configSchemaHorizontal) as Object),
      title: 'Vitals',
      editable: false,
      data: [
        { concept: '5090AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', label: 'Height' },
        { concept: '5089AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', label: 'Weight' },
      ],
    });

    render(<ObsTableHorizontal patientUuid="patient-123" />);

    const editButtons = screen.queryAllByLabelText('Edit');
    expect(editButtons).toHaveLength(0);
  });

  it("should show 'tap to edit' message when editable is true and on tablet", () => {
    mockUseLayoutType.mockReturnValue('tablet');
    mockIsDesktop.mockReturnValue(false);
    mockUseConfig.mockReturnValue({
      ...(getDefaultsFromConfigSchema(configSchemaHorizontal) as Object),
      title: 'Vitals',
      editable: true,
    });

    render(<ObsTableHorizontal patientUuid="patient-123" />);
    expect(screen.getByText(/tap an observation to edit/i)).toBeInTheDocument();
  });

  it('should open input field when edit button is clicked', async () => {
    const user = userEvent.setup();
    const mockMutate = jest.fn().mockResolvedValue(undefined);

    mockUseObs.mockReturnValue({
      data: { observations: mockObsData, concepts: mockConceptData },
      error: null,
      isLoading: false,
      isValidating: false,
      mutate: mockMutate,
    });
    mockUseConfig.mockReturnValue({
      ...(getDefaultsFromConfigSchema(configSchemaHorizontal) as Object),
      title: 'Vitals',
      editable: true,
      data: [
        { concept: '5090AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', label: 'Height' },
        { concept: '5089AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', label: 'Weight' },
      ],
    });

    render(<ObsTableHorizontal patientUuid="patient-123" />);

    const heightCell = screen.getByRole('cell', { name: /182/ });
    await user.hover(heightCell);
    const editButton = within(heightCell).getByRole('button', { name: 'Edit' });
    await user.click(editButton);

    await waitFor(() => {
      expect(screen.getByRole('spinbutton')).toBeInTheDocument();
    });
    const input = screen.getByRole('spinbutton');
    expect(input).toHaveValue(182);
  });

  it('should update existing observation when value is changed and saved', async () => {
    const user = userEvent.setup();
    const mockMutate = jest.fn().mockResolvedValue(undefined);

    mockUseObs.mockReturnValue({
      data: { observations: mockObsData, concepts: mockConceptData },
      error: null,
      isLoading: false,
      isValidating: false,
      mutate: mockMutate,
    });
    mockUseConfig.mockReturnValue({
      ...(getDefaultsFromConfigSchema(configSchemaHorizontal) as Object),
      title: 'Vitals',
      editable: true,
      data: [
        { concept: '5090AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', label: 'Height' },
        { concept: '5089AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', label: 'Weight' },
      ],
    });

    render(<ObsTableHorizontal patientUuid="patient-123" />);

    const heightCell = screen.getByRole('cell', { name: /182/ });
    await user.hover(heightCell);
    const editButton = within(heightCell).getByRole('button', { name: 'Edit' });
    await user.click(editButton);

    await waitFor(() => {
      expect(screen.getByRole('spinbutton')).toBeInTheDocument();
    });

    const input = screen.getByRole('spinbutton');
    await user.clear(input);
    await user.type(input, '185');

    await user.tab(); // Trigger blur to save

    await waitFor(() => {
      expect(mockUpdateObservation).toHaveBeenCalledWith('obs-1', 185);
    });
    expect(mockMutate).toHaveBeenCalled();
    expect(mockShowSnackbar).toHaveBeenCalledWith(
      expect.objectContaining({
        kind: 'success',
        title: 'Success',
      }),
    );
  });

  it('should create new observation when editing empty cell', async () => {
    const user = userEvent.setup();
    const mockMutate = jest.fn().mockResolvedValue(undefined);

    // Create obs data without one of the concepts
    const obsDataWithoutWeight = mockObsData.filter(
      (obs) => obs.conceptUuid !== '5089AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    );

    mockUseObs.mockReturnValue({
      data: { observations: obsDataWithoutWeight, concepts: mockConceptData },
      error: null,
      isLoading: false,
      isValidating: false,
      mutate: mockMutate,
    });
    mockUseConfig.mockReturnValue({
      ...(getDefaultsFromConfigSchema(configSchemaHorizontal) as Object),
      title: 'Vitals',
      editable: true,
      data: [
        { concept: '5090AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', label: 'Height' },
        { concept: '5089AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', label: 'Weight' },
      ],
    });

    render(<ObsTableHorizontal patientUuid="patient-123" />);

    // Find an empty cell in the Weight row (should show '--' or '-- Edit')
    const weightRow = screen.getByRole('row', { name: /Weight/i });
    const allCells = within(weightRow).getAllByRole('cell');
    // Skip the first cell (label) and find a cell that contains '--' (empty value cell)
    const weightEmptyCell = allCells.slice(1).find((cell) => {
      const cellText = cell.textContent || '';
      return cellText.includes('--');
    });
    expect(weightEmptyCell).toBeInTheDocument();

    await user.hover(weightEmptyCell);
    const editButton = within(weightEmptyCell).getByRole('button', { name: 'Edit' });
    await user.click(editButton);

    await waitFor(() => {
      expect(screen.getByRole('spinbutton')).toBeInTheDocument();
    });

    const input = screen.getByRole('spinbutton');
    await user.type(input, '75');

    await user.tab(); // Trigger blur to save

    await waitFor(() => {
      expect(mockCreateObservationInEncounter).toHaveBeenCalledWith(
        '234',
        'patient-123',
        '5089AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
        75,
      );
    });
    expect(mockMutate).toHaveBeenCalled();
  });

  it('should cancel editing when Escape key is pressed', async () => {
    const user = userEvent.setup();
    const mockMutate = jest.fn().mockResolvedValue(undefined);

    mockUseObs.mockReturnValue({
      data: { observations: mockObsData, concepts: mockConceptData },
      error: null,
      isLoading: false,
      isValidating: false,
      mutate: mockMutate,
    });
    mockUseConfig.mockReturnValue({
      ...(getDefaultsFromConfigSchema(configSchemaHorizontal) as Object),
      title: 'Vitals',
      editable: true,
      data: [
        { concept: '5090AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', label: 'Height' },
        { concept: '5089AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', label: 'Weight' },
      ],
    });

    render(<ObsTableHorizontal patientUuid="patient-123" />);

    const heightCell = screen.getByRole('cell', { name: /182/ });
    await user.hover(heightCell);
    const editButton = within(heightCell).getByRole('button', { name: 'Edit' });
    await user.click(editButton);

    await waitFor(() => {
      expect(screen.getByRole('spinbutton')).toBeInTheDocument();
    });

    const input = screen.getByRole('spinbutton');
    await user.type(input, '{Escape}');

    await waitFor(() => {
      expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument();
    });
    expect(mockUpdateObservation).not.toHaveBeenCalled();
  });

  it('should handle text observations', async () => {
    const user = userEvent.setup();
    const mockMutate = jest.fn().mockResolvedValue(undefined);

    mockUseObs.mockReturnValue({
      data: { observations: mockObsData, concepts: mockConceptData },
      error: null,
      isLoading: false,
      isValidating: false,
      mutate: mockMutate,
    });
    mockUseConfig.mockReturnValue({
      ...(getDefaultsFromConfigSchema(configSchemaHorizontal) as Object),
      title: 'Vitals',
      editable: true,
      data: [{ concept: '164162AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', label: 'Chief Complaint' }],
    });

    render(<ObsTableHorizontal patientUuid="patient-123" />);

    const complaintCell = screen.getByRole('cell', { name: /Headache/ });
    await user.hover(complaintCell);
    const editButton = within(complaintCell).getByRole('button', { name: 'Edit' });
    await user.click(editButton);

    await waitFor(() => {
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });
    const textInput = screen.getByRole('textbox');
    expect(textInput).toHaveValue('Headache');

    await user.clear(textInput);
    await user.type(textInput, 'Fever');

    await user.tab(); // Trigger blur to save

    await waitFor(() => {
      expect(mockUpdateObservation).toHaveBeenCalledWith('obs-5', 'Fever');
    });
    expect(mockMutate).toHaveBeenCalled();
  });

  it('should handle coded observations', async () => {
    const user = userEvent.setup();
    const mockMutate = jest.fn().mockResolvedValue(undefined);

    mockUseObs.mockReturnValue({
      data: { observations: mockObsData, concepts: mockConceptData },
      error: null,
      isLoading: false,
      isValidating: false,
      mutate: mockMutate,
    });
    mockUseConfig.mockReturnValue({
      ...(getDefaultsFromConfigSchema(configSchemaHorizontal) as Object),
      title: 'Diagnosis',
      editable: true,
      data: [{ concept: '1284AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', label: 'Diagnosis' }],
    });

    render(<ObsTableHorizontal patientUuid="patient-123" />);

    const diagnosisCell = screen.getByRole('cell', { name: /Malaria/ });
    expect(diagnosisCell).toBeInTheDocument();

    await user.hover(diagnosisCell);
    const editButton = within(diagnosisCell).getByRole('button', { name: 'Edit' });
    await user.click(editButton);

    await waitFor(() => {
      expect(within(diagnosisCell).getByRole('combobox')).toBeInTheDocument();
    });
    const select = within(diagnosisCell).getByRole('combobox');
    expect(select).toHaveValue('answer-uuid-1');

    // Change to a different answer
    await user.selectOptions(select, 'answer-uuid-2');

    await user.tab(); // Trigger blur to save

    await waitFor(() => {
      expect(mockUpdateObservation).toHaveBeenCalledWith('obs-6', 'answer-uuid-2');
    });
    expect(mockMutate).toHaveBeenCalled();
    expect(mockShowSnackbar).toHaveBeenCalledWith(
      expect.objectContaining({
        kind: 'success',
        title: 'Success',
      }),
    );
  });

  it('should not save when value is unchanged', async () => {
    const user = userEvent.setup();
    const mockMutate = jest.fn().mockResolvedValue(undefined);

    mockUseObs.mockReturnValue({
      data: { observations: mockObsData, concepts: mockConceptData },
      error: null,
      isLoading: false,
      isValidating: false,
      mutate: mockMutate,
    });
    mockUseConfig.mockReturnValue({
      ...(getDefaultsFromConfigSchema(configSchemaHorizontal) as Object),
      title: 'Vitals',
      editable: true,
      data: [
        { concept: '5090AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', label: 'Height' },
        { concept: '5089AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', label: 'Weight' },
      ],
    });

    render(<ObsTableHorizontal patientUuid="patient-123" />);

    const heightCell = screen.getByRole('cell', { name: /182/ });
    await user.hover(heightCell);
    const editButton = within(heightCell).getByRole('button', { name: 'Edit' });
    await user.click(editButton);

    await waitFor(() => {
      expect(screen.getByRole('spinbutton')).toBeInTheDocument();
    });

    await user.tab(); // Trigger blur without changing value

    await waitFor(() => {
      expect(mockUpdateObservation).not.toHaveBeenCalled();
    });
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('should not create observation when editing empty cell and nothing is entered', async () => {
    const user = userEvent.setup();
    const mockMutate = jest.fn().mockResolvedValue(undefined);

    // Create obs data where one encounter is missing a Weight observation
    // This will create an empty cell in an existing encounter
    const obsDataWithoutWeightInOneEncounter = mockObsData.filter(
      (obs) =>
        !(obs.conceptUuid === '5089AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' && obs.encounter.reference === 'Encounter/234'),
    );

    mockUseObs.mockReturnValue({
      data: { observations: obsDataWithoutWeightInOneEncounter, concepts: mockConceptData },
      error: null,
      isLoading: false,
      isValidating: false,
      mutate: mockMutate,
    });
    mockUseConfig.mockReturnValue({
      ...(getDefaultsFromConfigSchema(configSchemaHorizontal) as Object),
      title: 'Vitals',
      editable: true,
      data: [
        { concept: '5090AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', label: 'Height' },
        { concept: '5089AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', label: 'Weight' },
      ],
    });

    render(<ObsTableHorizontal patientUuid="patient-123" />);

    // Find an empty cell in the Weight row (should show '--')
    const weightRow = screen.getByRole('row', { name: /Weight/i });
    const allCells = within(weightRow).getAllByRole('cell');
    const emptyCell = allCells.slice(1).find((cell) => {
      const cellText = cell.textContent || '';
      return cellText.includes('--');
    });
    expect(emptyCell).toBeInTheDocument();

    // Hover and click the edit button
    await user.hover(emptyCell);
    const editButton = within(emptyCell).getByRole('button', { name: 'Edit' });
    await user.click(editButton);

    // Wait for the input to appear
    await waitFor(() => {
      expect(screen.getByRole('spinbutton')).toBeInTheDocument();
    });

    // Tab out without entering any value
    await user.tab();

    // Wait a bit to ensure no API calls are made
    await waitFor(() => {
      expect(mockCreateObservationInEncounter).not.toHaveBeenCalled();
    });

    expect(mockCreateEncounter).not.toHaveBeenCalled();
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('should create and save encounter', async () => {
    const user = userEvent.setup();
    const mockMutate = jest.fn().mockResolvedValue(undefined);
    const newEncounterUuid = 'new-encounter-uuid-123';

    mockUseObs.mockReturnValue({
      data: { observations: mockObsData, concepts: mockConceptData },
      error: null,
      isLoading: false,
      isValidating: false,
      mutate: mockMutate,
    });
    mockUseConfig.mockReturnValue({
      ...(getDefaultsFromConfigSchema(configSchemaHorizontal) as Object),
      title: 'Vitals',
      editable: true,
      encounterTypeToCreateUuid: 'dd528487-82a5-4082-9c72-ed246bd49591',
      data: [
        { concept: '5090AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', label: 'Height' },
        { concept: '5089AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', label: 'Weight' },
      ],
    });

    mockCreateEncounter.mockResolvedValue({
      data: { uuid: newEncounterUuid },
    } as any);

    render(<ObsTableHorizontal patientUuid="patient-123" />);

    // Click the "+" button to add a new encounter
    const addButton = screen.getByRole('button', { name: /add encounter/i });
    await user.click(addButton);

    // Wait for the new column to appear
    await waitFor(() => {
      const headers = screen.getAllByRole('columnheader');
      expect(headers.length).toBeGreaterThan(2); // Should have label column + existing columns + new column
    });

    expect(mockCreateEncounter).not.toHaveBeenCalled();

    // Find an empty cell in the Weight row in the new temporary encounter
    const weightRow = screen.getByRole('row', { name: /Weight/i });
    const allCells = within(weightRow).getAllByRole('cell');
    // Find a cell that contains '--' (empty value cell) - should be the last one (new temporary encounter)
    const emptyCell = allCells.slice(1).find((cell) => {
      const cellText = cell.textContent || '';
      return cellText.includes('--');
    });
    expect(emptyCell).toBeInTheDocument();

    // Hover and click the edit button
    await user.hover(emptyCell);
    const editButton = within(emptyCell).getByRole('button', { name: 'Edit' });
    await user.click(editButton);

    // Wait for the input to appear
    await waitFor(() => {
      expect(screen.getByRole('spinbutton')).toBeInTheDocument();
    });

    // Enter a value
    const input = screen.getByRole('spinbutton');
    await user.type(input, '75');

    // Tab out to save
    await user.tab();

    // Verify that createEncounter was called with correct parameters
    await waitFor(() => {
      expect(mockCreateEncounter).toHaveBeenCalledWith(
        'patient-123',
        'dd528487-82a5-4082-9c72-ed246bd49591',
        'location-uuid-123',
        [{ concept: '5089AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', value: 75 }],
      );
    });

    // Verify that mutate was called (via onEncounterCreated)
    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalled();
    });

    // Verify success snackbar is shown
    await waitFor(() => {
      expect(mockShowSnackbar).toHaveBeenCalledWith(
        expect.objectContaining({
          kind: 'success',
          title: 'Success',
          subtitle: 'Observation saved successfully',
        }),
      );
    });
  });

  it('should show error snackbar when update fails', async () => {
    const user = userEvent.setup();
    const mockMutate = jest.fn().mockResolvedValue(undefined);
    const error = new Error('Update failed');
    mockUpdateObservation.mockRejectedValue(error);

    mockUseObs.mockReturnValue({
      data: { observations: mockObsData, concepts: mockConceptData },
      error: null,
      isLoading: false,
      isValidating: false,
      mutate: mockMutate,
    });
    mockUseConfig.mockReturnValue({
      ...(getDefaultsFromConfigSchema(configSchemaHorizontal) as Object),
      title: 'Vitals',
      editable: true,
      data: [
        { concept: '5090AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', label: 'Height' },
        { concept: '5089AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', label: 'Weight' },
      ],
    });

    render(<ObsTableHorizontal patientUuid="patient-123" />);

    const heightCell = screen.getByRole('cell', { name: /182/ });
    await user.hover(heightCell);
    const editButton = within(heightCell).getByRole('button', { name: 'Edit' });
    await user.click(editButton);

    await waitFor(() => {
      expect(screen.getByRole('spinbutton')).toBeInTheDocument();
    });

    const input = screen.getByRole('spinbutton');
    await user.clear(input);
    await user.type(input, '185');

    await user.tab(); // Trigger blur to save

    await waitFor(() => {
      expect(mockShowSnackbar).toHaveBeenCalledWith(
        expect.objectContaining({
          kind: 'error',
          title: 'Error',
        }),
      );
    });
  });
});
