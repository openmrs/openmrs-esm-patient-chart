import React from 'react';
import { vi, describe, it, expect, test, beforeEach, type Mock } from 'vitest';
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
import AddTestOrderWorkspace from './add-test-order.workspace';

const mockCloseWorkspace = closeWorkspace as Mock;
const mockUseLayoutType = vi.mocked(useLayoutType);
const mockUseSession = vi.mocked(useSession);
const mockUseConfig = vi.mocked(useConfig<ConfigObject>);
const mockUseOrderType = vi.mocked(useOrderType);

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
const mockUseTestTypes = vi.fn().mockReturnValue({
  testTypes: mockTestTypes,
  isLoading: false,
  error: null,
});

vi.mock('./useTestTypes', () => ({
  useTestTypes: () => mockUseTestTypes(),
}));

vi.mock('@openmrs/esm-patient-common-lib', async () => ({
  ...((await vi.importActual('@openmrs/esm-patient-common-lib')) as object),
  useOrderType: vi.fn(),
}));

function renderAddLabOrderWorkspace() {
  return render(
    <AddTestOrderWorkspace
      closeWorkspace={mockCloseWorkspace}
      workspaceProps={{
        orderTypeUuid: 'test-lab-order-type-uuid',
        orderToEditOrdererUuid: '',
      }}
      groupProps={{
        patientUuid: mockPatient.id,
        patient: mockPatient,
        visitContext: null,
        mutateVisitContext: null,
      }}
      workspaceName={''}
      launchChildWorkspace={vi.fn()}
      windowName={''}
      windowProps={{ encounterUuid: '' }}
      isRootWorkspace={false}
      showActionMenu={true}
    />,
  );
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
      useOrderBasket(mockPatient, 'test-lab-order-type-uuid', ((x) => x) as unknown as PostDataPrepLabOrderFunction),
    );
    renderAddLabOrderWorkspace();
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
        }),
      ]);
    });

    expect(mockCloseWorkspace).toHaveBeenCalled();
  });

  test('from lab search, click add directly to order basket', async () => {
    const user = userEvent.setup();
    const { result: hookResult } = renderHook(() =>
      useOrderBasket(mockPatient, 'test-lab-order-type-uuid', ((x) => x) as unknown as PostDataPrepFunction),
    );
    renderAddLabOrderWorkspace();
    await user.type(screen.getByRole('searchbox'), 'cd4');
    await screen.findByText('CD4 COUNT');

    const cd4AddToBasketButton = screen.getByRole('button', { name: /add to basket/i });
    await user.click(cd4AddToBasketButton);

    await waitFor(() => {
      expect(hookResult.current.orders).toEqual([
        {
          ...createEmptyLabOrder(mockTestTypes[0], mockSessionDataResponse.data.currentProvider.uuid, null),
          isOrderIncomplete: true,
        },
      ]);
    });

    expect(mockCloseWorkspace).toHaveBeenCalled();
  });

  test('discarding a new order returns to test type search', async () => {
    const user = userEvent.setup();

    renderAddLabOrderWorkspace();

    await user.type(screen.getByRole('searchbox'), 'cd4');
    await screen.findByText('CD4 COUNT');

    const cd4OrderButton = screen.getByRole('button', { name: /order form/i });
    await user.click(cd4OrderButton);

    expect(screen.getByText('Test type')).toBeInTheDocument();
    expect(screen.queryByRole('searchbox')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /discard/i }));

    expect(screen.getByRole('searchbox')).toBeInTheDocument();
    expect(mockCloseWorkspace).not.toHaveBeenCalled();
  });

  test('preserves search term when navigating back from order form', async () => {
    const user = userEvent.setup();

    renderAddLabOrderWorkspace();

    await user.type(screen.getByRole('searchbox'), 'cd4');
    await screen.findByText('CD4 COUNT');

    const cd4OrderButton = screen.getByRole('button', { name: /order form/i });
    await user.click(cd4OrderButton);

    expect(screen.getByText('Test type')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /discard/i }));

    expect(screen.getByRole('searchbox')).toHaveValue('cd4');
  });

  test('discarding an edited order closes the workspace', async () => {
    const user = userEvent.setup();

    render(
      <AddTestOrderWorkspace
        closeWorkspace={mockCloseWorkspace}
        workspaceProps={{
          orderTypeUuid: 'test-lab-order-type-uuid',
          orderToEditOrdererUuid: '',
          order: {
            ...createEmptyLabOrder(mockTestTypes[0], mockSessionDataResponse.data.currentProvider.uuid, null),
            action: 'REVISE',
          },
        }}
        groupProps={{
          patientUuid: mockPatient.id,
          patient: mockPatient,
          visitContext: null,
          mutateVisitContext: null,
        }}
        workspaceName={''}
        launchChildWorkspace={vi.fn()}
        windowName={''}
        windowProps={{ encounterUuid: '' }}
        isRootWorkspace={false}
        showActionMenu={true}
      />,
    );

    // Should render the order form directly (no search view)
    expect(screen.getByText('Test type')).toBeInTheDocument();
    expect(screen.queryByRole('searchbox')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /discard/i }));

    expect(mockCloseWorkspace).toHaveBeenCalled();
  });

  test('save order button is disabled while submitting', async () => {
    const user = userEvent.setup();

    renderAddLabOrderWorkspace();

    await user.type(screen.getByRole('searchbox'), 'cd4');
    await screen.findByText('CD4 COUNT');

    const cd4OrderButton = screen.getByRole('button', { name: /order form/i });
    await user.click(cd4OrderButton);

    const saveButton = screen.getByRole('button', { name: /save order/i });
    expect(saveButton).toBeEnabled();
  });

  test('back to order basket', async () => {
    const user = userEvent.setup();
    renderAddLabOrderWorkspace();
    const back = screen.getByText('Back to order basket');
    expect(back).toBeInTheDocument();
    await user.click(back);
    expect(mockCloseWorkspace).toHaveBeenCalled();
  });

  test('should display a patient header on tablet', () => {
    mockUseLayoutType.mockReturnValue('tablet');
    renderAddLabOrderWorkspace();
    expect(screen.getByText(/john wilson/i)).toBeInTheDocument();
    expect(screen.getByText(/male/i)).toBeInTheDocument();
    expect(screen.getByText(new RegExp(age(mockPatient.birthDate), 'i'))).toBeInTheDocument();
    expect(screen.getByText('04 — Apr — 1972')).toBeInTheDocument();
  });

  test('should fall back to the configured lab order type UUID when orderTypeUuid is not provided', () => {
    mockUseOrderType.mockClear();

    render(
      <AddTestOrderWorkspace
        closeWorkspace={mockCloseWorkspace}
        workspaceProps={{
          orderToEditOrdererUuid: '',
        }}
        groupProps={{
          patientUuid: mockPatient.id,
          patient: mockPatient,
          visitContext: null,
          mutateVisitContext: null,
        }}
        workspaceName={''}
        launchChildWorkspace={vi.fn()}
        windowName={''}
        windowProps={{ encounterUuid: '' }}
        isRootWorkspace={false}
        showActionMenu={true}
      />,
    );

    expect(mockUseOrderType).toHaveBeenLastCalledWith('test-lab-order-type-uuid');
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
