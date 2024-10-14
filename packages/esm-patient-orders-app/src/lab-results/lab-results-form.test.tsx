import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useOrderConceptByUuid, useLabEncounter, useObservation } from './lab-results.resource';
import LabResultsForm from './lab-results-form.component';
import { type Order } from '@openmrs/esm-patient-common-lib';

jest.mock('./lab-results.resource', () => ({
  useOrderConceptByUuid: jest.fn(),
  useLabEncounter: jest
    .fn()
    .mockReturnValue({ encounter: [{ obs: [] }], isLoading: false, mutateLabOrders: jest.fn() }),
  useObservation: jest.fn().mockReturnValue({ data: [], isLoading: false }),
  updateOrderResult: jest.fn().mockReturnValue(Promise.resolve()),
}));

jest.mock('@openmrs/esm-framework', () => ({
  useAbortController: jest.fn(() => ({ signal: new AbortController().signal })),
  useLayoutType: jest.fn(() => 'desktop'),
  showSnackbar: jest.fn(),
}));

const mockOrder = {
  uuid: 'order-uuid',
  concept: { uuid: 'concept-uuid' },
  encounter: { uuid: 'encounter-uuid' },
  patient: { uuid: 'patient-uuid' },
  orderNumber: 'ORD-1',
  careSetting: { uuid: 'care-setting-uuid' },
};

const testProps = {
  closeWorkspace: jest.fn(),
  closeWorkspaceWithSavedChanges: jest.fn(),
  order: mockOrder as Order,
  promptBeforeClosing: jest.fn(),
  setTitle: jest.fn(),
  patientUuid: 'patient-uuid',
};

describe('LabResultsForm', () => {
  beforeEach(() => {
    (useOrderConceptByUuid as jest.Mock).mockReturnValue({
      concept: {
        uuid: 'concept-uuid',
        display: 'Test Concept',
        setMembers: [],
        datatype: { display: 'Numeric' },
        hiAbsolute: 100,
        hiCritical: 80,
        hiNormal: 70,
        lowAbsolute: 0,
        lowCritical: 40,
        lowNormal: 50,
        units: 'mg/dL',
      },
      isLoading: false,
    });
    (useLabEncounter as jest.Mock).mockReturnValue({ encounter: { obs: [] }, isLoading: false, mutate: jest.fn() });
    (useObservation as jest.Mock).mockReturnValue({ data: null, isLoading: false });
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

    const input = await screen.findByLabelText(`Test Concept (0 - 100 mg/dL)`);
    await user.type(input, '0');

    await waitFor(() => {
      expect(screen.queryByText('Test Concept must be between 0 and 100')).not.toBeInTheDocument();
    });
  });

  test('validate numeric input with concept having only hiAbsolute', async () => {
    const user = userEvent.setup();
    (useOrderConceptByUuid as jest.Mock).mockReturnValue({
      concept: {
        uuid: 'concept-uuid',
        display: 'Test Concept',
        setMembers: [],
        datatype: { display: 'Numeric' },
        hiAbsolute: 100,
        lowAbsolute: null,
        lowCritical: null,
        lowNormal: null,
        hiCritical: null,
        hiNormal: null,
        units: 'mg/dL',
      },
    });
    render(<LabResultsForm {...testProps} />);

    const input = await screen.findByLabelText(`Test Concept (0 - 100 mg/dL)`);
    await user.type(input, '150');

    const saveButton = screen.getByRole('button', { name: /Save and close/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('Test Concept must be less than or equal to 100')).toBeInTheDocument();
    });
  });

  test('validate numeric input with concept having only lowAbsolute', async () => {
    const user = userEvent.setup();
    (useOrderConceptByUuid as jest.Mock).mockReturnValue({
      concept: {
        uuid: 'concept-uuid',
        display: 'Test Concept',
        setMembers: [],
        datatype: { display: 'Numeric' },
        lowAbsolute: 0,
        lowCritical: null,
        lowNormal: null,
        hiCritical: null,
        hiNormal: null,
        hiAbsolute: null,
        units: 'mg/dL',
      },
    });
    render(<LabResultsForm {...testProps} />);

    const input = await screen.findByLabelText(`Test Concept (0 - -- mg/dL)`);
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

  test('validate numeric input where concept is a panel', async () => {
    const user = userEvent.setup();
    (useOrderConceptByUuid as jest.Mock).mockReturnValue({
      concept: {
        uuid: 'concept-uuid',
        display: 'Test Concept',
        datatype: { display: 'Numeric' },
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
            datatype: { display: 'Numeric' },
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
            datatype: { display: 'Numeric' },
            lowAbsolute: 5,
            lowCritical: 10,
            lowNormal: 15,
            hiCritical: 20,
            hiNormal: 25,
            hiAbsolute: 30,
            units: 'mg/dL',
          },
        ],
      },
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
});
