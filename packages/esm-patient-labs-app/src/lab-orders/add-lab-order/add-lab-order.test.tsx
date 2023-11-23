import React from 'react';
import { render, renderHook, screen, within } from '@testing-library/react';
import AddLabOrderWorkspace from './add-lab-order.workspace';
import userEvent from '@testing-library/user-event';
import { _resetOrderBasketStore, orderBasketStore } from '@openmrs/esm-patient-common-lib/src/orders/store';
import { type LabOrderBasketItem } from '../api';
import { age, useConfig, useLayoutType, usePatient, useSession } from '@openmrs/esm-framework';
import { type PostDataPrepFunction, useOrderBasket } from '@openmrs/esm-patient-common-lib';
import { createEmptyLabOrder } from './lab-order';

jest.setTimeout(10000);

const mockUseConfig = useConfig as jest.Mock;
const mockUseSession = useSession as jest.Mock;
const mockUsePatient = usePatient as jest.Mock;
const mockUseLayoutType = useLayoutType as jest.Mock;

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

const mockCloseWorkspace = jest.fn();
const mockLaunchPatientWorkspace = jest.fn();
jest.mock('@openmrs/esm-patient-common-lib', () => ({
  ...jest.requireActual('@openmrs/esm-patient-common-lib'),
  closeWorkspace: (...args) => mockCloseWorkspace(...args),
  launchPatientWorkspace: (...args) => mockLaunchPatientWorkspace(...args),
}));

jest.mock('@openmrs/esm-patient-common-lib/src/get-patient-uuid-from-url', () => ({
  getPatientUuidFromUrl: jest.fn(() => ptUuid),
}));

function renderAddLabOrderWorkspace() {
  const mockCloseWorkspace = jest.fn();
  const mockPromptBeforeClosing = jest.fn();
  const renderResult = render(
    <AddLabOrderWorkspace
      closeWorkspace={mockCloseWorkspace}
      promptBeforeClosing={mockPromptBeforeClosing}
      patientUuid={ptUuid}
    />,
  );
  return { mockCloseWorkspace, mockPromptBeforeClosing, ...renderResult };
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
    const { mockCloseWorkspace } = renderAddLabOrderWorkspace();
    await userEvent.type(screen.getByRole('searchbox'), 'cd4');
    const cd4 = screen.getByText('CD4 COUNT');
    expect(cd4).toBeInTheDocument();
    const cd4OrderButton = within(cd4.closest('div').parentElement).getByText('Order form');
    await userEvent.click(cd4OrderButton);

    const testType = screen.getByRole('combobox', { name: 'Test type' });
    expect(testType).toBeInTheDocument();
    expect(testType).toHaveValue('CD4 COUNT');

    const priority = screen.getByRole('combobox', { name: 'Priority' });
    expect(priority).toBeInTheDocument();
    await userEvent.click(priority);
    await userEvent.click(screen.getByText(/Stat/i));
    const additionalInstructions = screen.getByRole('textbox', { name: 'Additional instructions' });
    expect(additionalInstructions).toBeInTheDocument();
    await userEvent.type(additionalInstructions, 'plz do it thx');
    const submit = screen.getByRole('button', { name: 'Save order' });
    expect(submit).toBeInTheDocument();
    await userEvent.click(submit);
    const labsOrderBasket = orderBasketStore.getState().items[ptUuid]['labs'] as Array<LabOrderBasketItem>;
    expect(labsOrderBasket.length).toBe(1);
    expect(labsOrderBasket[0].testType.conceptUuid).toBe('test-lab-uuid-2');
    expect(labsOrderBasket[0].urgency).toBe('STAT');
    expect(labsOrderBasket[0].instructions).toBe('plz do it thx');
    expect(mockCloseWorkspace).toHaveBeenCalled();
    expect(mockLaunchPatientWorkspace).toHaveBeenCalledWith('order-basket');
  });

  test('from lab search, click add directly to order basket', async () => {
    const { result: hookResult } = renderHook(() =>
      useOrderBasket('labs', ((x) => x) as unknown as PostDataPrepFunction),
    );
    renderAddLabOrderWorkspace();
    await userEvent.type(screen.getByRole('searchbox'), 'cd4');
    const cd4 = screen.getByText('CD4 COUNT');
    expect(cd4).toBeInTheDocument();
    const cd4OrderButton = within(cd4.closest('div').parentElement).getByText('Add to basket');
    await userEvent.click(cd4OrderButton);
    expect(hookResult.current.orders).toEqual([createEmptyLabOrder(mockTestTypes[1], 'test-provider-uuid')]);
    expect(mockCloseWorkspace).toHaveBeenCalled();
    expect(mockLaunchPatientWorkspace).toHaveBeenCalledWith('order-basket');
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
    expect(screen.getAllByText(/Error/i)[0]).toBeInTheDocument();
  });
});
