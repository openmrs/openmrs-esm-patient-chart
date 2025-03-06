import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  useOrderConceptByUuid,
  useLabEncounter,
  useObservation,
  type LabOrderConcept,
  updateOrderResult,
  type Datatype,
  useCompletedLabResults,
} from './lab-results.resource';
import LabResultsForm from './lab-results-form.component';
import { type Order } from '@openmrs/esm-patient-common-lib';
import { type Encounter } from '../types/encounter';
import { mockPatient } from 'tools';

const mockUseOrderConceptByUuid = jest.mocked(useOrderConceptByUuid);
const mockUseLabEncounter = jest.mocked(useLabEncounter);
const mockUseObservation = jest.mocked(useObservation);
const mockUseCompletedLabResults = jest.mocked(useCompletedLabResults);

jest.mock('./lab-results.resource', () => ({
  ...jest.requireActual('./lab-results.resource'),
  useOrderConceptByUuid: jest.fn(),
  useLabEncounter: jest.fn(),
  useObservation: jest.fn(),
  updateOrderResult: jest.fn().mockResolvedValue({}),
  useCompletedLabResults: jest.fn(),
  isCoded: (concept) => concept?.datatype?.display === 'Coded',
  isText: (concept) => concept?.datatype?.display === 'Text',
  isNumeric: (concept) => concept?.datatype?.display === 'Numeric',
  isPanel: (concept) => concept?.setMembers?.length > 0,
}));

const mockOrder = {
  uuid: 'order-uuid',
  concept: { uuid: 'concept-uuid' },
  encounter: { uuid: 'encounter-uuid' },
  patient: { uuid: 'patient-uuid' },
  orderNumber: 'ORD-1',
  careSetting: { uuid: 'care-setting-uuid' },
  orderer: { uuid: 'orderer-uuid' },
};

const testProps = {
  closeWorkspace: jest.fn(),
  closeWorkspaceWithSavedChanges: jest.fn(),
  order: mockOrder as Order,
  promptBeforeClosing: jest.fn(),
  setTitle: jest.fn(),
  patientUuid: mockPatient.id,
  patient: mockPatient,
};

describe('LabResultsForm', () => {
  beforeEach(() => {
    mockUseOrderConceptByUuid.mockReturnValue({
      concept: {
        uuid: 'concept-uuid',
        display: 'Test Concept',
        setMembers: [],
        datatype: { display: 'Numeric', hl7Abbreviation: 'NM' },
        hiAbsolute: 100,
        hiCritical: 80,
        hiNormal: 70,
        lowAbsolute: 0,
        lowCritical: 40,
        lowNormal: 50,
        units: 'mg/dL',
        allowDecimal: false,
      } as LabOrderConcept,
      isLoading: false,
      error: null,
      isValidating: false,
      mutate: jest.fn(),
    });
    mockUseLabEncounter.mockReturnValue({
      encounter: { obs: [] } as Encounter,
      isLoading: false,
      error: null,
      isValidating: false,
      mutate: jest.fn(),
    });
    mockUseObservation.mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
      isValidating: false,
      mutate: jest.fn(),
    });
    mockUseCompletedLabResults.mockReturnValue({
      completeLabResult: null,
      isLoading: false,
      error: null,
      mutate: jest.fn(),
    });
  });

  test('validates numeric input correctly', async () => {
    const user = userEvent.setup();
    render(<LabResultsForm {...testProps} />);

    const input = await screen.findByLabelText(`Test Concept (0 - 100 mg/dL)`);
    await user.type(input, '150');

    const saveButton = screen.getByRole('button', { name: /Save and close/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('Test Concept must be between 0 and 100')).toBeInTheDocument();
    });
  });

  test('validate when we have a concept with allowDecimal set to true', async () => {
    const user = userEvent.setup();
    // if allowDecimal is true, we should allow decimal values
    mockUseOrderConceptByUuid.mockReturnValue({
      concept: {
        uuid: 'concept-uuid',
        display: 'Test Concept',
        setMembers: [],
        datatype: { display: 'Numeric', hl7Abbreviation: 'NM' },
        hiAbsolute: 100,
        lowAbsolute: null,
        lowCritical: null,
        lowNormal: null,
        hiCritical: null,
        hiNormal: null,
        units: 'mg/dL',
        allowDecimal: true,
      } as LabOrderConcept,
      isLoading: false,
      error: null,
      isValidating: false,
      mutate: jest.fn(),
    });
    render(<LabResultsForm {...testProps} />);

    const input = screen.getByRole('spinbutton', {
      name: /Test Concept/i,
    });
    await user.type(input, '50.5');

    const saveButton = screen.getByRole('button', { name: /Save and close/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(screen.queryByText('Test Concept must be a whole number')).not.toBeInTheDocument();
    });
  });

  test('validate when we have a concept with allowDecimal set to null', async () => {
    const user = userEvent.setup();
    render(<LabResultsForm {...testProps} />);

    const input = await screen.findByLabelText(`Test Concept (0 - 100 mg/dL)`);
    await user.type(input, '50.5');

    const saveButton = screen.getByRole('button', { name: /Save and close/i });
    await user.click(saveButton);

    // if allowDecimal is null or false, we should not allow decimal values
    await waitFor(() => {
      expect(screen.getByText('Test Concept must be a whole number')).toBeInTheDocument();
    });
  });

  test('validate numeric input with negative value', async () => {
    const user = userEvent.setup();
    render(<LabResultsForm {...testProps} />);

    const input = await screen.findByLabelText(`Test Concept (0 - 100 mg/dL)`);
    await user.type(input, '-50');

    const saveButton = screen.getByRole('button', { name: /Save and close/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('Test Concept must be between 0 and 100')).toBeInTheDocument();
    });
  });

  test('validate numeric input with zero value', async () => {
    const user = userEvent.setup();
    render(<LabResultsForm {...testProps} />);

    const input = await screen.findByLabelText('Test Concept (0 - 100 mg/dL)');
    await user.type(input, '0');

    await waitFor(() => {
      expect(screen.queryByText('Test Concept must be between 0 and 100')).not.toBeInTheDocument();
    });
  });

  test('validate numeric input with concept having only hiAbsolute', async () => {
    const user = userEvent.setup();
    mockUseOrderConceptByUuid.mockReturnValue({
      concept: {
        uuid: 'concept-uuid',
        display: 'Test Concept',
        setMembers: [],
        datatype: { display: 'Numeric', hl7Abbreviation: 'NM' },
        hiAbsolute: 100,
        lowAbsolute: null,
        lowCritical: null,
        lowNormal: null,
        hiCritical: null,
        hiNormal: null,
        units: 'mg/dL',
      } as LabOrderConcept,
      isLoading: false,
      error: null,
      isValidating: false,
      mutate: jest.fn(),
    });
    render(<LabResultsForm {...testProps} />);

    const input = screen.getByRole('spinbutton', {
      name: /Test Concept/i,
    });
    await user.type(input, '150');

    const saveButton = screen.getByRole('button', { name: /Save and close/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('Test Concept must be less than or equal to 100')).toBeInTheDocument();
    });
  });

  test('validate numeric input with concept having only lowAbsolute', async () => {
    const user = userEvent.setup();
    mockUseOrderConceptByUuid.mockReturnValue({
      concept: {
        uuid: 'concept-uuid',
        display: 'Test Concept',
        setMembers: [],
        datatype: { display: 'Numeric', hl7Abbreviation: 'NM' },
        lowAbsolute: 0,
        lowCritical: null,
        lowNormal: null,
        hiCritical: null,
        hiNormal: null,
        hiAbsolute: null,
        units: 'mg/dL',
      } as LabOrderConcept,
      isLoading: false,
      error: null,
      isValidating: false,
      mutate: jest.fn(),
    });
    render(<LabResultsForm {...testProps} />);

    const input = screen.getByRole('spinbutton', {
      name: /Test Concept/i,
    });
    await user.type(input, '-50');

    const saveButton = screen.getByRole('button', { name: /Save and close/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('Test Concept must be greater than or equal to 0')).toBeInTheDocument();
    });
  });

  test('submits form with valid data', async () => {
    const user = userEvent.setup();
    const mockCloseWorkspace = jest.fn();
    const mockCloseWorkspaceWithSavedChanges = jest.fn();

    render(
      <LabResultsForm
        {...testProps}
        closeWorkspace={mockCloseWorkspace}
        closeWorkspaceWithSavedChanges={mockCloseWorkspaceWithSavedChanges}
      />,
    );

    const input = await screen.findByLabelText(`Test Concept (0 - 100 mg/dL)`);
    await user.type(input, '50');

    const saveButton = screen.getByRole('button', { name: /Save and close/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(mockCloseWorkspaceWithSavedChanges).toHaveBeenCalled();
    });
  });

  test('validate numeric input where concept is a set', async () => {
    const user = userEvent.setup();
    mockUseOrderConceptByUuid.mockReturnValue({
      concept: {
        uuid: 'concept-uuid',
        display: 'Test Concept',
        datatype: { display: 'Numeric', hl7Abbreviation: 'NM' },
        lowAbsolute: 0,
        lowCritical: null,
        lowNormal: null,
        hiCritical: null,
        hiNormal: null,
        hiAbsolute: null,
        units: 'mg/dL',
        setMembers: [
          {
            uuid: 'set-member-uuid',
            display: 'Set Member',
            setMembers: [],
            datatype: { display: 'Numeric', hl7Abbreviation: 'NM' },
            lowAbsolute: 50,
            lowCritical: 70,
            lowNormal: 80,
            hiCritical: 140,
            hiNormal: 120,
            hiAbsolute: 150,
            units: 'mg/dL',
          },
          {
            uuid: 'set-member-uuid-2',
            display: 'Set Member 2',
            setMembers: [],
            datatype: { display: 'Numeric', hl7Abbreviation: 'NM' },
            lowAbsolute: 5,
            lowCritical: 10,
            lowNormal: 15,
            hiCritical: 20,
            hiNormal: 25,
            hiAbsolute: 30,
            units: 'mg/dL',
          },
        ],
      } as LabOrderConcept,
      isLoading: false,
      error: null,
      isValidating: false,
      mutate: jest.fn(),
    });
    render(<LabResultsForm {...testProps} />);

    // Normal input range
    const setMember1Input = screen.getByLabelText('Set Member (50 - 150 mg/dL)');
    await user.type(setMember1Input, '50');
    expect(screen.queryByText('Set Member must be between 50 and 150')).not.toBeInTheDocument();

    const setMember2Input = screen.getByLabelText('Set Member 2 (5 - 30 mg/dL)');
    await user.type(setMember2Input, '10');
    expect(screen.queryByText('Set Member must be between 5 and 30')).not.toBeInTheDocument();

    // Out of range input, upper limit
    await user.type(setMember1Input, '151');
    expect(await screen.findByText('Set Member must be between 50 and 150')).toBeInTheDocument();

    await user.type(setMember2Input, '31');
    expect(await screen.findByText('Set Member 2 must be between 5 and 30')).toBeInTheDocument();

    // Out of range input, lower limit
    await user.type(setMember1Input, '49');
    expect(await screen.findByText('Set Member must be between 50 and 150')).toBeInTheDocument();

    await user.type(setMember2Input, '4');
    expect(await screen.findByText('Set Member 2 must be between 5 and 30')).toBeInTheDocument();
  });

  test('lab results form submits the correct lab result payload when the concept is not a set', async () => {
    const user = userEvent.setup();
    mockUseOrderConceptByUuid.mockReturnValue({
      concept: {
        uuid: 'concept-uuid',
        display: 'Test Concept',
        setMembers: [],
        datatype: { display: 'Text', hl7Abbreviation: 'ST' } as Datatype,
        hiAbsolute: 100,
        lowAbsolute: 0,
        lowCritical: null,
        lowNormal: null,
        hiCritical: null,
        hiNormal: null,
        units: 'mg/dL',
      } as LabOrderConcept,
      isLoading: false,
      error: null,
      isValidating: false,
      mutate: jest.fn(),
    });

    render(<LabResultsForm {...testProps} />);
    const input = await screen.findByRole('textbox', { name: /Test Concept/i });
    await user.type(input, '100');
    const submitButton = screen.getByRole('button', { name: 'Save and close' });
    await user.click(submitButton);

    expect(updateOrderResult).toHaveBeenCalledWith(
      'order-uuid',
      'encounter-uuid',
      { obs: [{ concept: { uuid: 'concept-uuid' }, order: { uuid: 'order-uuid' }, status: 'FINAL', value: '100' }] },
      { fulfillerComment: 'Test Results Entered', fulfillerStatus: 'COMPLETED' },
      {
        action: 'DISCONTINUE',
        careSetting: 'care-setting-uuid',
        concept: 'concept-uuid',
        encounter: 'encounter-uuid',
        orderer: mockOrder.orderer,
        patient: 'patient-uuid',
        previousOrder: 'order-uuid',
        type: 'testorder',
      },
      expect.anything(),
    );
  });

  test('lab results forms submits correct payload when the concept is a set and one set member is keyed', async () => {
    const user = userEvent.setup();
    mockUseOrderConceptByUuid.mockReturnValue({
      concept: {
        uuid: 'concept-uuid',
        display: 'Test Concept',
        set: true,
        setMembers: [
          {
            uuid: 'set-member-uuid-1',
            display: 'Set Member 1',
            concept: { uuid: 'concept-uuid-1', display: 'Concept 1' },
            datatype: { display: 'Numeric', hl7Abbreviation: 'NM' } as Datatype,
            hiAbsolute: 100,
            lowAbsolute: 0,
            lowCritical: null,
            lowNormal: null,
            hiCritical: null,
            hiNormal: null,
            units: 'mg/dL',
          },
          {
            uuid: 'set-member-uuid-2',
            display: 'Set Member 2',
            concept: { uuid: 'concept-uuid-2', display: 'Concept 2' },
            datatype: { display: 'Numeric', hl7Abbreviation: 'NM' } as Datatype,
            hiAbsolute: 80,
            lowAbsolute: 0,
            lowCritical: null,
            lowNormal: null,
            hiCritical: null,
            hiNormal: null,
            units: 'mmol/L',
          },
        ],
        datatype: { display: 'Numeric', hl7Abbreviation: 'NM' },
        hiAbsolute: 100,
        lowAbsolute: 0,
        lowCritical: null,
        lowNormal: null,
        hiCritical: null,
        hiNormal: null,
        units: 'mg/dL',
      } as unknown as LabOrderConcept,
      isLoading: false,
      error: null,
      isValidating: false,
      mutate: jest.fn(),
    });

    render(<LabResultsForm {...testProps} />);
    const concept1Input = await screen.findByLabelText('Set Member 1 (0 - 100 mg/dL)');
    await user.type(concept1Input, '100');

    const submitButton = screen.getByRole('button', { name: 'Save and close' });
    await user.click(submitButton);

    // Expect the observation payload to include only the set member that was keyed
    expect(updateOrderResult).toHaveBeenCalledWith(
      'order-uuid',
      'encounter-uuid',
      {
        obs: [
          {
            concept: {
              uuid: 'concept-uuid',
            },
            status: 'FINAL',
            order: {
              uuid: 'order-uuid',
            },
            groupMembers: [
              {
                concept: {
                  uuid: 'set-member-uuid-1',
                },
                value: 100,
                status: 'FINAL',
                order: {
                  uuid: 'order-uuid',
                },
              },
            ],
          },
        ],
      },
      {
        fulfillerStatus: 'COMPLETED',
        fulfillerComment: 'Test Results Entered',
      },
      {
        previousOrder: 'order-uuid',
        type: 'testorder',
        action: 'DISCONTINUE',
        careSetting: 'care-setting-uuid',
        encounter: 'encounter-uuid',
        patient: 'patient-uuid',
        concept: 'concept-uuid',
        orderer: { uuid: 'orderer-uuid' },
      },
      expect.anything(),
    );
  });

  test('lab results form submits correct payload when the concept is a set and both set members are keyed', async () => {
    const user = userEvent.setup();
    mockUseOrderConceptByUuid.mockReturnValue({
      concept: {
        uuid: 'concept-uuid',
        display: 'Test Concept',
        set: true,
        setMembers: [
          {
            uuid: 'set-member-uuid-1',
            display: 'Set Member 1',
            concept: { uuid: 'concept-uuid-1', display: 'Concept 1' },
            datatype: { display: 'Numeric', hl7Abbreviation: 'NM' },
            hiAbsolute: 100,
            lowAbsolute: 0,
            lowCritical: null,
            lowNormal: null,
            hiCritical: null,
            hiNormal: null,
            units: 'mg/dL',
          },
          {
            uuid: 'set-member-uuid-2',
            display: 'Set Member 2',
            concept: { uuid: 'concept-uuid-2', display: 'Concept 2' },
            datatype: { display: 'Numeric', hl7Abbreviation: 'NM' },
            hiAbsolute: 80,
            lowAbsolute: 0,
            lowCritical: null,
            lowNormal: null,
            hiCritical: null,
            hiNormal: null,
            units: 'mmol/L',
          },
        ],
        datatype: { display: 'Numeric' },
        hiAbsolute: 100,
        lowAbsolute: 0,
        lowCritical: null,
        lowNormal: null,
        hiCritical: null,
        hiNormal: null,
        units: 'mg/dL',
      } as unknown as LabOrderConcept,
      isLoading: false,
      error: null,
      isValidating: false,
      mutate: jest.fn(),
    });

    render(<LabResultsForm {...testProps} />);
    const concept1Input = await screen.findByLabelText('Set Member 1 (0 - 100 mg/dL)');
    await user.type(concept1Input, '100');

    const concept2Input = await screen.findByLabelText('Set Member 2 (0 - 80 mmol/L)');
    await user.type(concept2Input, '60');

    const submitButton = screen.getByRole('button', { name: 'Save and close' });
    await user.click(submitButton);

    // Expect the observation payload to include both set members with their respective values
    expect(updateOrderResult).toHaveBeenCalledWith(
      'order-uuid',
      'encounter-uuid',
      {
        obs: [
          {
            concept: {
              uuid: 'concept-uuid',
            },
            status: 'FINAL',
            order: {
              uuid: 'order-uuid',
            },
            groupMembers: [
              {
                concept: {
                  uuid: 'set-member-uuid-1',
                },
                value: 100,
                status: 'FINAL',
                order: {
                  uuid: 'order-uuid',
                },
              },
              {
                concept: {
                  uuid: 'set-member-uuid-2',
                },
                value: 60,
                status: 'FINAL',
                order: {
                  uuid: 'order-uuid',
                },
              },
            ],
          },
        ],
      },
      {
        fulfillerStatus: 'COMPLETED',
        fulfillerComment: 'Test Results Entered',
      },
      {
        previousOrder: 'order-uuid',
        type: 'testorder',
        action: 'DISCONTINUE',
        careSetting: 'care-setting-uuid',
        encounter: 'encounter-uuid',
        patient: 'patient-uuid',
        concept: 'concept-uuid',
        orderer: { uuid: 'orderer-uuid' },
      },
      expect.anything(),
    );
  });

  test('should handle empty form submission', async () => {
    const user = userEvent.setup();
    render(<LabResultsForm {...testProps} />);

    const saveButton = screen.getByRole('button', { name: /Save and close/i });
    await user.click(saveButton);

    expect(screen.getByText('Please fill at least one field.')).toBeInTheDocument();
    expect(updateOrderResult).not.toHaveBeenCalled();
  });

  test('should disable save button when form has validation errors', async () => {
    const user = userEvent.setup();
    render(<LabResultsForm {...testProps} />);

    const input = await screen.findByLabelText(`Test Concept (0 - 100 mg/dL)`);
    await user.type(input, '150');

    const saveButton = screen.getByRole('button', { name: /Save and close/i });
    expect(saveButton).toBeDisabled();
  });
});
