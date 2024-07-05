import React from 'react';
import { render, renderHook, screen, waitFor } from '@testing-library/react';
import AddLabOrderWorkspace from './add-lab-order.workspace';
import userEvent from '@testing-library/user-event';
import { _resetOrderBasketStore } from '@openmrs/esm-patient-common-lib/src/orders/store';
import { type PostDataPrepLabOrderFunction } from '../api';
import { age, closeWorkspace, useConfig, useLayoutType, usePatient, useSession } from '@openmrs/esm-framework';
import { type PostDataPrepFunction, useOrderBasket } from '@openmrs/esm-patient-common-lib';
import { createEmptyLabOrder } from './lab-order';

const mockUseConfig = useConfig as jest.Mock;
const mockUseSession = useSession as jest.Mock;
const mockUsePatient = usePatient as jest.Mock;
const mockUseLayoutType = useLayoutType as jest.Mock;
const mockCloseWorkspace = closeWorkspace as jest.Mock;

mockCloseWorkspace.mockImplementation(({ onWorkspaceClose }) => {
  onWorkspaceClose?.();
});

const ptUuid = 'test-patient-uuid';

const mockTestTypes = [
  {
    conceptUuid: 'test-lab-uuid-1',
    label: 'HIV VIRAL LOAD',
  },
  {
    conceptUuid: 'test-lab-uuid-2',
    label: 'CD4 COUNT',
  },
];
const mockUseTestTypes = jest.fn().mockReturnValue({
  testTypes: mockTestTypes,
  isLoading: false,
  error: null,
});

jest.mock('./useTestTypes', () => ({
  useTestTypes: () => mockUseTestTypes(),
}));

const mocklaunchPatientWorkspace = jest.fn();
jest.mock('@openmrs/esm-patient-common-lib', () => ({
  ...jest.requireActual('@openmrs/esm-patient-common-lib'),
  launchPatientWorkspace: (...args) => mocklaunchPatientWorkspace(...args),
}));

jest.mock('@openmrs/esm-patient-common-lib/src/get-patient-uuid-from-url', () => ({
  getPatientUuidFromUrl: jest.fn(() => ptUuid),
}));

function renderAddLabOrderWorkspace() {
  const mockCloseWorkspace = jest.fn().mockImplementation(({ onWorkspaceClose }) => {
    onWorkspaceClose();
  });
  const mockCloseWorkspaceWithSavedChanges = jest.fn().mockImplementation(({ onWorkspaceClose }) => {
    onWorkspaceClose();
  });
  const mockPromptBeforeClosing = jest.fn();
  const view = render(
    <AddLabOrderWorkspace
      closeWorkspace={mockCloseWorkspace}
      closeWorkspaceWithSavedChanges={mockCloseWorkspaceWithSavedChanges}
      promptBeforeClosing={mockPromptBeforeClosing}
      patientUuid={ptUuid}
    />,
  );
  return { mockCloseWorkspace, mockPromptBeforeClosing, mockCloseWorkspaceWithSavedChanges, ...view };
}

describe('AddLabOrder', () => {
  beforeAll(() => {
    mockUseConfig.mockReturnValue({
      orders: {
        careSettingUuid: 'test-care-setting-uuid',
        labOrderTypeUUID: 'test-lab-order-type-uuid',
      },
    });
    mockUseSession.mockReturnValue({
      currentProvider: {
        uuid: 'test-provider-uuid',
      },
    });
    mockUsePatient.mockReturnValue({
      patient: {
        uuid: ptUuid,
        gender: 'M',
        birthDate: '1990-01-01',
      },
      isLoading: false,
    });
  });

  beforeEach(() => {
    _resetOrderBasketStore();
  });

  test('happy path fill and submit form', async () => {
    const user = userEvent.setup();
    const { result: hookResult } = renderHook(() =>
      useOrderBasket('labs', ((x) => x) as unknown as PostDataPrepLabOrderFunction),
    );
    const { mockCloseWorkspaceWithSavedChanges } = renderAddLabOrderWorkspace();
    await user.type(screen.getByRole('searchbox'), 'cd4');
    const cd4 = screen.getByText('CD4 COUNT');
    expect(cd4).toBeInTheDocument();
    const cd4OrderButton = screen.getAllByRole('button', { name: 'Order form' })[1];
    await user.click(cd4OrderButton);

    const testType = screen.getByRole('combobox', { name: 'Test type' });
    expect(testType).toBeInTheDocument();
    expect(testType).toHaveValue('CD4 COUNT');

    const labReferenceNumber = screen.getByRole('textbox', { name: 'Lab reference number' });
    expect(labReferenceNumber).toBeInTheDocument();
    await user.type(labReferenceNumber, 'lba-000124');

    const priority = screen.getByRole('combobox', { name: 'Priority' });
    expect(priority).toBeInTheDocument();
    await user.click(priority);
    await user.click(screen.getByText(/Stat/i));

    const additionalInstructions = screen.getByRole('textbox', { name: 'Additional instructions' });
    expect(additionalInstructions).toBeInTheDocument();
    await user.type(additionalInstructions, 'plz do it thx');
    const submit = screen.getByRole('button', { name: 'Save order' });

    expect(submit).toBeInTheDocument();
    await user.click(submit);

    await waitFor(() => {
      expect(hookResult.current.orders).toEqual([
        expect.objectContaining({
          urgency: 'STAT',
          instructions: 'plz do it thx',
          labReferenceNumber: 'lba-000124',
          testType: { label: 'CD4 COUNT', conceptUuid: 'test-lab-uuid-2' },
          orderer: 'test-provider-uuid',
        }),
      ]);
    });

    expect(mockCloseWorkspaceWithSavedChanges).toHaveBeenCalled();
    expect(mocklaunchPatientWorkspace).toHaveBeenCalledWith('order-basket');
  });

  test('from lab search, click add directly to order basket', async () => {
    const user = userEvent.setup();
    const { result: hookResult } = renderHook(() =>
      useOrderBasket('labs', ((x) => x) as unknown as PostDataPrepFunction),
    );
    renderAddLabOrderWorkspace();
    await user.type(screen.getByRole('searchbox'), 'cd4');
    const cd4 = screen.getByText('CD4 COUNT');
    expect(cd4).toBeInTheDocument();
    const cd4OrderButton = screen.getAllByRole('button', { name: 'Add to basket' })[1];
    await user.click(cd4OrderButton);
    expect(hookResult.current.orders).toEqual([
      { ...createEmptyLabOrder(mockTestTypes[1], 'test-provider-uuid'), isOrderIncomplete: true },
    ]);

    expect(mockCloseWorkspace).toHaveBeenCalled();
    expect(mocklaunchPatientWorkspace).toHaveBeenCalledWith('order-basket');
  });

  test('back to order basket', async () => {
    const user = userEvent.setup();
    const { mockCloseWorkspace } = renderAddLabOrderWorkspace();
    const back = screen.getByText('Back to order basket');
    expect(back).toBeInTheDocument();
    await user.click(back);
    expect(mockCloseWorkspace).toHaveBeenCalled();
    expect(mocklaunchPatientWorkspace).toHaveBeenCalledWith('order-basket');
  });

  test('should display a patient header on tablet', () => {
    mockUseLayoutType.mockReturnValue('tablet');
    renderAddLabOrderWorkspace();
    const ptAge = age('1990-01-01');
    expect(screen.getByText(RegExp(`M\\s*.*${ptAge}`))).toBeInTheDocument();
    expect(screen.getByText('01 — Jan — 1990')).toBeInTheDocument();
  });

  test('should display an error message if test types fail to load', () => {
    mockUseTestTypes.mockReturnValue({
      testTypes: [],
      isLoading: false,
      error: {
        message: 'test error',
        response: {
          status: 500,
          statusText: 'Internal Server Error',
        },
      },
    });
    renderAddLabOrderWorkspace();
    expect(screen.getByText(/Error/i)).toBeInTheDocument();
  });
});
