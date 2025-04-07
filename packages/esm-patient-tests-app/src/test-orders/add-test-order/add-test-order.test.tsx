import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, renderHook, screen, waitFor } from '@testing-library/react';
import { _resetOrderBasketStore } from '@openmrs/esm-patient-common-lib/src/orders/store';
import { type PostDataPrepLabOrderFunction } from '../api';
import {
  age,
  closeWorkspace,
  getDefaultsFromConfigSchema,
  useConfig,
  useLayoutType,
  useSession,
} from '@openmrs/esm-framework';
import { type PostDataPrepFunction, useOrderBasket, useOrderType } from '@openmrs/esm-patient-common-lib';
import { configSchema, type ConfigObject } from '../../config-schema';
import { mockSessionDataResponse } from '__mocks__';
import { mockPatient } from 'tools';
import { createEmptyLabOrder } from './test-order';
import AddLabOrderWorkspace from './add-test-order.workspace';

const mockCloseWorkspace = closeWorkspace as jest.Mock;
const mockUseLayoutType = jest.mocked(useLayoutType);
const mockUseSession = jest.mocked(useSession);
const mockUseConfig = jest.mocked(useConfig<ConfigObject>);
const mockUseOrderType = jest.mocked(useOrderType);

mockCloseWorkspace.mockImplementation(({ onWorkspaceClose }) => {
  onWorkspaceClose?.();
});

const mockTestTypes = [
  // {
  //   conceptUuid: 'test-lab-uuid-1',
  //   label: 'HIV VIRAL LOAD',
  //   synonyms: ['HIV VIRAL LOAD', 'HIV VL'],
  // },
  {
    conceptUuid: 'test-lab-uuid-2',
    label: 'CD4 COUNT',
    synonyms: ['CD4 COUNT', 'CD4'],
  },
  // {
  //   conceptUuid: 'test-lab-uuid-3',
  //   label: 'HEMOGLOBIN',
  //   synonyms: ['HEMOGLOBIN', 'HGB'],
  // },
];
const mockUseTestTypes = jest.fn().mockReturnValue({
  testTypes: mockTestTypes,
  isLoading: false,
  error: null,
});

jest.mock('./useTestTypes', () => ({
  useTestTypes: () => mockUseTestTypes(),
}));

const mockLaunchPatientWorkspace = jest.fn();

jest.mock('@openmrs/esm-patient-common-lib', () => ({
  ...jest.requireActual('@openmrs/esm-patient-common-lib'),
  launchPatientWorkspace: (...args) => mockLaunchPatientWorkspace(...args),
  useOrderType: jest.fn(),
}));

jest.mock('@openmrs/esm-patient-common-lib/src/store/patient-chart-store', () => ({
  getPatientUuidFromStore: jest.fn(() => mockPatient.id),
  usePatientChartStore: jest.fn(() => ({
    patientUuid: mockPatient.id,
    patient: mockPatient,
  })),
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
      patientUuid={mockPatient.id}
      patient={mockPatient}
      setTitle={jest.fn()}
      orderTypeUuid="test-lab-order-type-uuid"
    />,
  );
  return { mockCloseWorkspace, mockPromptBeforeClosing, mockCloseWorkspaceWithSavedChanges, ...view };
}

mockUseConfig.mockReturnValue({
  ...getDefaultsFromConfigSchema(configSchema),
  orders: {
    labOrderTypeUuid: 'test-lab-order-type-uuid',
    labOrderableConcepts: [],
  },
  additionalTestOrderTypes: [],
});

mockUseSession.mockReturnValue(mockSessionDataResponse.data);

mockUseOrderType.mockReturnValue({
  orderType: {
    uuid: 'test-order-type-uuid',
    display: 'Test order',
    javaClassName: 'org.openmrs.TestOrder',
    name: 'Test order',
    retired: false,
    description: '',
    conceptClasses: [],
  },
  isLoadingOrderType: false,
  isValidatingOrderType: false,
  errorFetchingOrderType: undefined,
});

describe('AddLabOrder', () => {
  beforeEach(() => {
    _resetOrderBasketStore();
  });

  test('happy path fill and submit form', async () => {
    const user = userEvent.setup();
    const { result: hookResult } = renderHook(() =>
      useOrderBasket('test-lab-order-type-uuid', ((x) => x) as unknown as PostDataPrepLabOrderFunction),
    );
    const { mockCloseWorkspaceWithSavedChanges } = renderAddLabOrderWorkspace();
    await user.type(screen.getByRole('searchbox'), 'cd4');
    await screen.findByText('CD4 COUNT');

    const cd4OrderButton = screen.getByRole('button', { name: /order form/i });
    await user.click(cd4OrderButton);

    const testTypeLabel = screen.getByText('Test type');
    const testTypeValue = screen.getByText('CD4 COUNT');
    expect(testTypeLabel).toBeInTheDocument();
    expect(testTypeValue).toBeInTheDocument();

    const labReferenceNumber = screen.getByRole('textbox', { name: 'Reference number' });
    expect(labReferenceNumber).toBeInTheDocument();
    await user.type(labReferenceNumber, 'lba-000124');

    const priority = screen.getByRole('combobox', { name: 'Priority' });
    expect(priority).toBeInTheDocument();
    await user.click(priority);
    await user.selectOptions(priority, 'STAT');

    const additionalInstructions = screen.getByRole('textbox', { name: 'Additional instructions' });
    expect(additionalInstructions).toBeInTheDocument();
    await user.type(additionalInstructions, 'plz do it thx');
    const submit = screen.getByRole('button', { name: 'Save order' });

    expect(submit).toBeInTheDocument();
    await user.click(submit);

    await waitFor(() => {
      expect(hookResult.current.orders).toEqual([
        expect.objectContaining({
          action: 'NEW',
          display: 'CD4 COUNT',
          urgency: 'STAT',
          instructions: 'plz do it thx',
          accessionNumber: 'lba-000124',
          testType: { label: 'CD4 COUNT', conceptUuid: 'test-lab-uuid-2' },
          orderer: mockSessionDataResponse.data.currentProvider.uuid,
        }),
      ]);
    });

    expect(mockCloseWorkspaceWithSavedChanges).toHaveBeenCalled();
    expect(mockLaunchPatientWorkspace).toHaveBeenCalledWith('order-basket');
  });

  test('from lab search, click add directly to order basket', async () => {
    const user = userEvent.setup();
    const { result: hookResult } = renderHook(() =>
      useOrderBasket('test-lab-order-type-uuid', ((x) => x) as unknown as PostDataPrepFunction),
    );
    renderAddLabOrderWorkspace();
    await user.type(screen.getByRole('searchbox'), 'cd4');
    await screen.findByText('CD4 COUNT');

    const cd4AddToBasketButton = screen.getByRole('button', { name: /add to basket/i });
    await user.click(cd4AddToBasketButton);

    await waitFor(() => {
      expect(hookResult.current.orders).toEqual([
        {
          ...createEmptyLabOrder(mockTestTypes[0], mockSessionDataResponse.data.currentProvider.uuid),
          isOrderIncomplete: true,
        },
      ]);
    });

    expect(mockCloseWorkspace).toHaveBeenCalled();
    expect(mockCloseWorkspace).toHaveBeenCalledWith('add-lab-order', {
      ignoreChanges: true,
      onWorkspaceClose: expect.any(Function),
    });
  });

  test('back to order basket', async () => {
    const user = userEvent.setup();
    const { mockCloseWorkspace } = renderAddLabOrderWorkspace();
    const back = screen.getByText('Back to order basket');
    expect(back).toBeInTheDocument();
    await user.click(back);
    expect(mockCloseWorkspace).toHaveBeenCalled();
    expect(mockLaunchPatientWorkspace).toHaveBeenCalledWith('order-basket');
  });

  test('should display a patient header on tablet', () => {
    mockUseLayoutType.mockReturnValue('tablet');
    renderAddLabOrderWorkspace();
    expect(screen.getByText(/john wilson/i)).toBeInTheDocument();
    expect(screen.getByText(/male/i)).toBeInTheDocument();
    expect(screen.getByText(new RegExp(age(mockPatient.birthDate)!, 'i'))).toBeInTheDocument();
    expect(screen.getByText('04 — Apr — 1972')).toBeInTheDocument();
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
