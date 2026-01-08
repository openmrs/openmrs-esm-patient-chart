import React from 'react';
import { render, renderHook, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { translateFrom, useConfig, useLayoutType, usePatient, useSession } from '@openmrs/esm-framework';
import { useOrderBasket } from '@openmrs/esm-patient-common-lib';
import { _resetOrderBasketStore } from '@openmrs/esm-patient-common-lib/src/orders/store';
import { mockVisit } from '__mocks__';
import { mockPatient } from 'tools';
import { LabOrderForm } from './lab-order-form.component';
import { useTestTypes } from './useTestTypes';
import { type ConfigObject } from '../../config-schema';
import { type LabOrderBasketItem, prepLabOrderPostData, useOrderReasons } from '../api';

jest.mock('@openmrs/esm-patient-common-lib', () => ({
  ...jest.requireActual('@openmrs/esm-patient-common-lib'),
  promptBeforeClosing: jest.fn(),
}));

jest.mock('./useTestTypes', () => ({
  useTestTypes: jest.fn(),
}));

jest.mock('../api', () => {
  const actual = jest.requireActual('../api');
  return {
    ...actual,
    useOrderReasons: jest.fn(),
  };
});

const mockUseSession = useSession as jest.Mock;
const mockUseConfig = useConfig as jest.Mock;
const mockUseLayoutType = useLayoutType as jest.Mock;
const mockUsePatient = usePatient as jest.Mock;
const mockTranslateFrom = translateFrom as jest.Mock;
const mockUseTestTypes = useTestTypes as jest.MockedFunction<typeof useTestTypes>;
const mockUseOrderReasons = useOrderReasons as jest.MockedFunction<typeof useOrderReasons>;

const configuredTestType = { conceptUuid: 'test-lab-uuid-1', label: 'HIV Viral Load' };
const alternativeTestType = { conceptUuid: 'test-lab-uuid-2', label: 'CD4 Count' };
const orderReasonOptions = [
  { uuid: 'reason-1', display: 'Clinical suspicion' },
  { uuid: 'reason-2', display: 'Routine monitoring' },
];
const baseConfig: ConfigObject = {
  concepts: [],
  showPrintButton: true,
  orders: {
    labOrderTypeUuid: 'lab-order-type-uuid',
  },
  labTestsWithOrderReasons: [],
};

function renderLabOrderForm(overrides: Partial<LabOrderBasketItem> = {}) {
  const closeWorkspace = jest.fn();
  const initialOrder: LabOrderBasketItem = {
    action: 'NEW',
    display: 'New lab order',
    testType: configuredTestType,
    labReferenceNumber: '',
    urgency: 'ROUTINE',
    instructions: '',
    orderer: 'test-provider-uuid',
    visit: mockVisit,
    ...overrides,
  };

  const view = render(<LabOrderForm initialOrder={initialOrder} closeWorkspace={closeWorkspace} />);

  return { initialOrder, closeWorkspace, ...view };
}

describe('LabOrderForm order reasons', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockTranslateFrom.mockImplementation((_, __, fallback: string) => fallback);
    _resetOrderBasketStore();
    mockUseSession.mockReturnValue({
      currentProvider: {
        uuid: 'test-provider-uuid',
      },
    });
    mockUsePatient.mockReturnValue({
      patient: mockPatient,
      isLoading: false,
      error: null,
    });
    mockUseLayoutType.mockReturnValue('desktop');
    mockUseConfig.mockReturnValue({
      ...baseConfig,
      labTestsWithOrderReasons: [
        {
          labTestUuid: configuredTestType.conceptUuid,
          orderReasons: orderReasonOptions.map((option) => option.uuid),
        },
      ],
    });
    mockUseTestTypes.mockReturnValue({
      testTypes: [configuredTestType, alternativeTestType],
      isLoading: false,
      error: null,
    });
    mockUseOrderReasons.mockImplementation((uuids: Array<string>) => ({
      orderReasons: uuids?.length ? orderReasonOptions : [],
      isLoading: false,
      error: undefined,
    }));
  });

  test('shows coded order reason selector when the chosen test requires one', () => {
    renderLabOrderForm();

    expect(screen.getByRole('combobox', { name: /order reason/i })).toBeInTheDocument();
  });

  test('hides the order reason selector when switching to a test without configured reasons', async () => {
    const user = userEvent.setup();
    renderLabOrderForm();

    const testTypeCombo = screen.getByRole('combobox', { name: /test type/i });
    await user.click(testTypeCombo);
    await user.click(screen.getByText(alternativeTestType.label));

    await waitFor(() => expect(screen.queryByRole('combobox', { name: /order reason/i })).not.toBeInTheDocument());
  });

  test('persists the selected order reason when saving the order', async () => {
    const user = userEvent.setup();
    const { result: basketResult } = renderHook(() =>
      useOrderBasket<LabOrderBasketItem>(mockPatient, 'labs', prepLabOrderPostData),
    );
    renderLabOrderForm();

    const orderReasonCombo = screen.getByRole('combobox', { name: /order reason/i });
    await user.click(orderReasonCombo);
    await user.click(screen.getByText(orderReasonOptions[0].display));

    const labReferenceInput = screen.getByRole('textbox', { name: /lab reference number/i });
    await user.type(labReferenceInput, 'LRN-100');

    await user.click(screen.getByRole('button', { name: /save order/i }));

    await waitFor(() =>
      expect(basketResult.current.orders).toEqual([
        expect.objectContaining({
          orderReason: orderReasonOptions[0].uuid,
          labReferenceNumber: 'LRN-100',
        }),
      ]),
    );
  });
});
