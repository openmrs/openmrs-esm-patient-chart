import React from 'react';
import userEvent from '@testing-library/user-event';
import { screen, render } from '@testing-library/react';
import { useOrderType } from '@openmrs/esm-patient-common-lib';
import { getDefaultsFromConfigSchema, useConfig } from '@openmrs/esm-framework';
import type { OrderBasketExtensionProps, TestOrderBasketItem } from '@openmrs/esm-patient-common-lib';
import { type ConfigObject, configSchema } from '../../config-schema';
import LabOrderBasketPanel from './lab-order-basket-panel.extension';
import { mockPatient } from 'tools';
import { mockVisit } from '__mocks__';

const mockUseOrderBasket = jest.fn();
const mockUseConfig = jest.mocked(useConfig<ConfigObject>);
const mockUseOrderType = jest.mocked(useOrderType);

jest.mock('@openmrs/esm-patient-common-lib', () => ({
  ...jest.requireActual('@openmrs/esm-patient-common-lib'),
  useOrderBasket: () => mockUseOrderBasket(),
  useOrderType: jest.fn(),
}));

mockUseConfig.mockReturnValue({
  ...getDefaultsFromConfigSchema(configSchema),
});

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

const testProps: OrderBasketExtensionProps = {
  patient: mockPatient,
  launchDrugOrderForm: jest.fn(),
  launchLabOrderForm: jest.fn(),
  launchGeneralOrderForm: jest.fn(),
};

describe('LabOrderBasketPanel', () => {
  test('renders an empty state when no items are selected in the order basket', () => {
    mockUseOrderBasket.mockReturnValue({ orders: [] });
    render(<LabOrderBasketPanel {...testProps} />);
    expect(screen.getByRole('heading', { name: /Lab orders \(0\)/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Add/i })).toBeInTheDocument();
  });

  test('renders a tile-based layout of lab orders', async () => {
    const user = userEvent.setup();
    const labs: Array<TestOrderBasketItem> = [
      {
        action: 'NEW',
        testType: {
          conceptUuid: 'test-lab-uuid-1',
          label: 'HIV VIRAL LOAD',
        },
        display: 'HIV VIRAL LOAD',
        urgency: 'ROUTINE',
        uuid: 'order-uuid-1',
        visit: mockVisit,
      },
      {
        action: 'NEW',
        testType: {
          conceptUuid: 'test-lab-uuid-2',
          label: 'CD4 COUNT',
        },
        display: 'CD4 COUNT',
        urgency: 'STAT',
        uuid: 'order-uuid-2',
        visit: mockVisit,
      },
    ];
    let orders = [...labs];
    const mockSetOrders = jest.fn((newOrders: Array<TestOrderBasketItem>) => {
      orders = newOrders;
    });
    mockUseOrderBasket.mockImplementation(() => ({
      orders: orders,
      setOrders: mockSetOrders,
    }));
    const { rerender } = render(<LabOrderBasketPanel {...testProps} />);
    expect(screen.getByText(/Lab orders \(2\)/i)).toBeInTheDocument();
    expect(screen.getByText(/HIV VIRAL LOAD/i)).toBeInTheDocument();
    expect(screen.getByText(/CD4 COUNT/i)).toBeInTheDocument();

    const removeHivButton = screen.getAllByRole('button', { name: /remove from basket/i })[0];
    expect(removeHivButton).toBeVisible();

    await user.click(removeHivButton);
    rerender(<LabOrderBasketPanel {...testProps} />);
    await expect(screen.getByText(/Lab orders \(1\)/i)).toBeInTheDocument();
    expect(screen.getByText(/CD4 COUNT/i)).toBeInTheDocument();
    expect(screen.queryByText(/HIV VIRAL LOAD/i)).not.toBeInTheDocument();
  });
});
