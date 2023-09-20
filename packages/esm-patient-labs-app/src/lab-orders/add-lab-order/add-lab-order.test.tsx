import React from 'react';
import { render, screen } from '@testing-library/react';
import AddLabOrderWorkspace from './add-lab-order.workspace';
import userEvent from '@testing-library/user-event';
import { orderBasketStore } from '@openmrs/esm-patient-common-lib/src/orders/store';
import { LabOrderBasketItem } from '../api';
import { age, useConfig, useLayoutType, usePatient, useSession } from '@openmrs/esm-framework';

const mockUseConfig = useConfig as jest.Mock;
const mockUseSession = useSession as jest.Mock;
const mockUsePatient = usePatient as jest.Mock;
const mockUseLayoutType = useLayoutType as jest.Mock;

const ptUuid = 'test-patient-uuid';

const mockUseTestTypes = jest.fn().mockReturnValue({
  testTypes: [
    {
      conceptUuid: 'test-lab-uuid-1',
      label: 'HIV VIRAL LOAD',
    },
    {
      conceptUuid: 'test-lab-uuid-2',
      label: 'CD4 COUNT',
    },
  ],
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
}));

jest.mock('@openmrs/esm-patient-common-lib/src/get-patient-uuid-from-url', () => ({
  getPatientUuidFromUrl: jest.fn(() => ptUuid),
}));

function renderAddLabOrderWorkspace() {
  const mockCloseWorkspace = jest.fn();
  const mockPromptBeforeClosing = jest.fn();
  const renderResult = render(
    <AddLabOrderWorkspace
      order={null}
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

  test('happy path fill and submit form', async () => {
    jest.setTimeout(10000);
    const { mockCloseWorkspace } = renderAddLabOrderWorkspace();
    const testType = screen.getByRole('combobox', { name: 'Test type' });
    expect(testType).toBeInTheDocument();
    await userEvent.click(testType);
    await userEvent.click(screen.getByText('CD4 COUNT'));
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
