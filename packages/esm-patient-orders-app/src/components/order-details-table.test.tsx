import React from 'react';
import { vi, describe, it, expect, test, beforeEach } from 'vitest';
import { useReactToPrint } from 'react-to-print';
import { screen, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  type ConfigObject,
  getDefaultsFromConfigSchema,
  openmrsFetch,
  useConfig,
  useSession,
} from '@openmrs/esm-framework';
import {
  type Order,
  ErrorState,
  useOrderTypes,
  usePatientOrders,
  useOrderBasket,
} from '@openmrs/esm-patient-common-lib';
import { configSchema } from '../config-schema';
import { mockOrders, mockSessionDataResponse } from '__mocks__';
import { mockPatient } from 'tools';
import OrderDetailsTable from './order-details-table.component';

const mockUsePatientOrders = vi.mocked(usePatientOrders);
const mockUseOrderTypes = vi.mocked(useOrderTypes);
const mockUseOrderBasket = vi.mocked(useOrderBasket);
const mockOpenmrsFetch = vi.mocked(openmrsFetch);
const mockSession = vi.mocked(useSession);
const mockUseConfig = vi.mocked(useConfig<ConfigObject>);
const mockUseReactToPrint = vi.mocked(useReactToPrint);

mockSession.mockReturnValue(mockSessionDataResponse.data);
mockOpenmrsFetch.mockImplementation(vi.fn());

vi.mock('react-to-print', async () => ({
  ...((await vi.importActual('react-to-print')) as object),
  useReactToPrint: vi.fn(),
}));

vi.mock('@openmrs/esm-patient-common-lib', async () => {
  const originalModule = (await vi.importActual('@openmrs/esm-patient-common-lib')) as object;

  return {
    ...originalModule,
    usePatientOrders: vi.fn(),
    useOrderTypes: vi.fn(),
    usePatient: vi.fn(),
    useOrderBasket: vi.fn(),
  };
});

vi.mock('./general-order-table.component', () => ({
  default: function MockGeneralOrderTable() {
    return 'General order details';
  },
}));

vi.mock('./medication-record.component', () => ({
  default: function MockMedicationRecord() {
    return 'Medication details';
  },
}));

const testOrderTypeUuid = '52a447d3-a64a-11e3-9aeb-50e549534c5e';
const drugOrderTypeUuid = '131168f4-15f5-102d-96e4-000c29c2a5d7';
const generalOrderTypeUuid = '67a92e56-0f88-11ea-8d71-362b9e155667';

const drugOrderType = {
  uuid: drugOrderTypeUuid,
  display: 'Drug Order',
  name: 'Drug Order',
  retired: false,
  description: 'Drug Order',
};

const testOrderType = {
  uuid: testOrderTypeUuid,
  display: 'Test Order',
  name: 'Test Order',
  retired: false,
  description: 'Test Order',
};

const generalOrderType = {
  uuid: generalOrderTypeUuid,
  display: 'General Order',
  name: 'General Order',
  retired: false,
  description: 'General Order',
};

const mockGeneralOrder = {
  ...mockOrders[1],
  uuid: 'general-order-uuid',
  orderNumber: 'ORD-GEN-1',
  type: 'order',
  display: 'Chest X-Ray',
  instructions: 'PA and lateral views',
  orderType: {
    uuid: generalOrderTypeUuid,
    display: 'General Order',
    name: 'General Order',
    javaClassName: 'org.openmrs.Order',
    retired: false,
    description: 'General order type',
    conceptClasses: [],
    parent: null,
    links: [],
    resourceVersion: '1.10',
  },
};

describe('OrderDetailsTable', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    mockUseOrderBasket.mockReturnValue({
      orders: [],
      setOrders: vi.fn(),
      clearOrders: vi.fn(),
    });
    mockUseOrderTypes.mockReturnValue({
      data: [drugOrderType, testOrderType],
      error: null,
      isLoading: false,
      isValidating: false,
    });
    mockUsePatientOrders.mockReturnValue({
      data: mockOrders as unknown as Array<Order>,
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: vi.fn(),
    });
  });

  it('renders a loading state when fetching orders', async () => {
    mockUseOrderTypes.mockReturnValue({
      data: [],
      error: null,
      isLoading: true,
      isValidating: false,
    });
    mockUsePatientOrders.mockReturnValue({
      data: [],
      error: undefined,
      isLoading: true,
      isValidating: false,
      mutate: vi.fn(),
    });

    renderOrderDetailsTable();

    await screen.findByRole('combobox', { name: /select order type/i });

    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders an error state if there is a problem fetching orders', async () => {
    const error = {
      name: 'Error',
      message: 'You are not logged in',
      response: {
        status: 401,
        statusText: 'Unauthorized',
      },
    };
    mockUseOrderTypes.mockReturnValue({
      data: [],
      error: error,
      isLoading: false,
      isValidating: false,
    });
    mockUsePatientOrders.mockReturnValue({
      data: [],
      error: error,
      isLoading: false,
      isValidating: false,
      mutate: vi.fn(),
    });

    renderOrderDetailsTable();

    await screen.findByRole('combobox', { name: /select order type/i });
    expect(ErrorState).toHaveBeenCalledWith(expect.objectContaining({ error, headerTitle: 'Patient Orders' }), {});
  });

  it('renders a tabular overview of order data when data is available', async () => {
    renderOrderDetailsTable();

    const columns = {
      orderNumber: /order number/i,
      dateOfOrder: /date of order/i,
      orderType: /order type/i,
      order: /^order$/i,
      priority: /priority/i,
      orderedBy: /ordered by/i,
      status: /status/i,
    };

    await screen.findByRole('table');

    Object.values(columns).forEach((headerText) => {
      const headers = screen.getAllByText(headerText);
      expect(headers.length).toBeGreaterThan(0);
    });

    const expectedOrder = {
      orderNumber: 'ORD-321',
      date: '22-Nov-2024',
      type: 'Drug order',
      detailedInstructions: 'Permethrin: 1\\.0 Ampule\\(s\\) Oral Once daily 1 Days take after eating',
      orderedBy: 'admin - Super User',
    };

    Object.values(expectedOrder).forEach((content) => {
      expect(screen.getByText(new RegExp(content, 'i'))).toBeInTheDocument();
    });
  });

  it('filters the orders list when the user types into the searchbox', async () => {
    renderOrderDetailsTable();

    await screen.findByRole('table');

    const searchbox = screen.getByRole('searchbox');
    await user.type(searchbox, 'perm');

    expect(
      screen.getByRole('cell', {
        name: /\(NEW\) Permethrin\: 1\.0 Ampule\(s\) Oral Once daily 1 Days take after eating/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('cell', {
        name: /serum chloride/i,
      }),
    ).not.toBeInTheDocument();

    await user.type(searchbox, 'marco polo');

    expect(screen.getByText(/no matching orders to display/i)).toBeInTheDocument();
    expect(screen.getByText(/check the filters above/i)).toBeInTheDocument();
  });

  it('prints the orders in the list when the print button is clicked', async () => {
    const mockHandlePrint = vi.fn();
    mockUseReactToPrint.mockReturnValue(mockHandlePrint);
    mockUseConfig.mockReturnValue({
      ...getDefaultsFromConfigSchema(configSchema),
      showPrintButton: true,
    });

    renderOrderDetailsTable();

    const printButton = screen.getByRole('button', { name: /print/i });
    expect(printButton).toBeInTheDocument();

    await user.click(printButton);

    expect(mockHandlePrint).toHaveBeenCalledTimes(1);
  });

  it('renders a date range picker with a default value of today', async () => {
    renderOrderDetailsTable();

    await screen.findByRole('table');

    expect(screen.getByText(/date range/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue(/\d{2}\/\d{2}\/\d{4}–\d{2}\/\d{2}\/\d{4}/)).toBeInTheDocument();
  });

  it('renders priority tags for each urgency level', async () => {
    const ordersWithPriorities = [
      { ...mockOrders[0], uuid: 'routine-order', orderNumber: 'ORD-R', urgency: 'ROUTINE' },
      { ...mockOrders[0], uuid: 'stat-order', orderNumber: 'ORD-S', urgency: 'STAT' },
      { ...mockOrders[0], uuid: 'scheduled-order', orderNumber: 'ORD-D', urgency: 'ON_SCHEDULED_DATE' },
    ];

    mockUsePatientOrders.mockReturnValue({
      data: ordersWithPriorities as unknown as Array<Order>,
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: vi.fn(),
    });

    renderOrderDetailsTable();

    await screen.findByRole('table');

    expect(screen.getByText('Routine')).toBeInTheDocument();
    expect(screen.getByText('Stat')).toBeInTheDocument();
    expect(screen.getByText('On scheduled date')).toBeInTheDocument();
  });

  it('renders status tags for orders with fulfiller statuses and a dash for orders without', async () => {
    const ordersWithStatuses = [
      { ...mockOrders[1], uuid: 'received-order', orderNumber: 'ORD-RCV', fulfillerStatus: 'RECEIVED' },
      { ...mockOrders[1], uuid: 'in-progress-order', orderNumber: 'ORD-PRG', fulfillerStatus: 'IN_PROGRESS' },
      { ...mockOrders[1], uuid: 'completed-order', orderNumber: 'ORD-CMP', fulfillerStatus: 'COMPLETED' },
      { ...mockOrders[1], uuid: 'no-status-order', orderNumber: 'ORD-NUL', fulfillerStatus: null },
    ];

    mockUsePatientOrders.mockReturnValue({
      data: ordersWithStatuses as unknown as Array<Order>,
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: vi.fn(),
    });

    renderOrderDetailsTable();

    await screen.findByRole('table');

    expect(screen.getByText('Received')).toBeInTheDocument();
    expect(screen.getByText('In progress')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
    expect(screen.getByText('--')).toBeInTheDocument();
  });

  it('shows medication details when expanding a drug order row', async () => {
    mockUsePatientOrders.mockReturnValue({
      data: [mockOrders[0]] as unknown as Array<Order>,
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: vi.fn(),
    });

    renderOrderDetailsTable();

    await screen.findByRole('table');

    const expandButton = screen.getByRole('button', { name: /expand current row/i });
    await user.click(expandButton);

    expect(screen.getByText('Medication details')).toBeInTheDocument();
  });

  it('shows general order details when expanding a general order row', async () => {
    mockUseOrderTypes.mockReturnValue({
      data: [generalOrderType],
      error: null,
      isLoading: false,
      isValidating: false,
    });
    mockUsePatientOrders.mockReturnValue({
      data: [mockGeneralOrder] as unknown as Array<Order>,
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: vi.fn(),
    });

    renderOrderDetailsTable();

    await screen.findByRole('table');

    const expandButton = screen.getByRole('button', { name: /expand current row/i });
    await user.click(expandButton);

    expect(screen.getByText('General order details')).toBeInTheDocument();
  });

  it('does not show an expand button for test orders', async () => {
    mockUsePatientOrders.mockReturnValue({
      data: [mockOrders[1]] as unknown as Array<Order>,
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: vi.fn(),
    });

    renderOrderDetailsTable();

    await screen.findByRole('table');

    expect(screen.queryByRole('button', { name: /expand current row/i })).not.toBeInTheDocument();
  });

  it('shows pagination controls when there are multiple pages', async () => {
    const manyOrders = Array.from({ length: 25 }, (_, index) => ({
      ...mockOrders[0],
      uuid: `order-${index}`,
      orderNumber: `ORD-${index + 1}`,
    }));

    mockUsePatientOrders.mockReturnValue({
      data: manyOrders as unknown as Array<Order>,
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: vi.fn(),
    });

    renderOrderDetailsTable();

    await screen.findByRole('table');

    const paginationContainer = screen.getByText(/items per page/i);
    expect(paginationContainer).toBeInTheDocument();

    const nextButton = screen.getByRole('button', { name: /next page/i });
    expect(nextButton).toBeInTheDocument();
  });

  it('handles order type filtering correctly with different order types', async () => {
    const allOrders = mockOrders;
    const testOrders = mockOrders.filter((order) => order.orderType.uuid === testOrderTypeUuid);

    mockUsePatientOrders.mockImplementation((_patientUuid, _status, orderType) => {
      const filteredOrders =
        orderType === drugOrderTypeUuid
          ? allOrders.filter((order) => order.orderType.uuid === drugOrderTypeUuid)
          : orderType === testOrderTypeUuid
            ? testOrders
            : allOrders;

      return {
        data: filteredOrders as unknown as Array<Order>,
        error: undefined,
        isLoading: false,
        isValidating: false,
        mutate: vi.fn(),
      };
    });

    renderOrderDetailsTable();

    await screen.findByRole('table');

    const orderTypeSelector = screen.getByRole('combobox', {
      name: /select order type/i,
    });

    await user.click(orderTypeSelector);
    await user.click(screen.getByRole('option', { name: /drug order/i }));

    expect(screen.queryByText(/test order/i)).not.toBeInTheDocument();

    await user.click(orderTypeSelector);
    await user.click(screen.getByRole('option', { name: /test order/i }));

    // Verify only test orders are shown
    expect(screen.queryByText(/drug order/i)).not.toBeInTheDocument();

    // Test "All orders" filtering
    await user.click(orderTypeSelector);
    await user.click(screen.getByRole('option', { name: /all orders/i }));

    // Verify all orders are shown
    expect(screen.getAllByText(/test order/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/drug order/i)).toBeInTheDocument();
  });

  it('shows add button when showAddButton prop is true', async () => {
    renderOrderDetailsTable();

    await screen.findByRole('table');

    const addButton = screen.getByRole('button', { name: /add/i });
    expect(addButton).toBeInTheDocument();
  });

  it('does not show add button when showAddButton prop is false', async () => {
    render(
      <OrderDetailsTable
        patientUuid={mockPatient.id}
        patient={mockPatient}
        showAddButton={false}
        showPrintButton={false}
        title="Patient Orders"
      />,
    );

    await screen.findByRole('table');

    const addButton = screen.queryByRole('button', { name: /add/i });
    expect(addButton).not.toBeInTheDocument();
  });

  it('handles empty order types gracefully', async () => {
    mockUseOrderTypes.mockReturnValue({
      data: [],
      error: null,
      isLoading: false,
      isValidating: false,
    });

    mockUsePatientOrders.mockReturnValue({
      data: [],
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: vi.fn(),
    });

    renderOrderDetailsTable();

    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('displays validation state when orders are being refreshed', async () => {
    mockUseOrderTypes.mockReturnValue({
      data: [drugOrderType],
      isLoading: false,
      error: null,
      isValidating: true,
    });

    mockUsePatientOrders.mockReturnValue({
      data: mockOrders as unknown as Array<Order>,
      error: undefined,
      isLoading: false,
      isValidating: true,
      mutate: vi.fn(),
    });

    renderOrderDetailsTable();

    await screen.findByRole('table');

    const validationIndicator = screen.getByText(/loading/i);
    expect(validationIndicator).toBeInTheDocument();
  });

  it('does not show an overflow menu for declined orders', async () => {
    const declinedOrder = {
      ...mockOrders[0],
      uuid: 'declined-order-uuid',
      orderNumber: 'ORD-DECLINED',
      fulfillerStatus: 'DECLINED',
    };

    mockUsePatientOrders.mockReturnValue({
      data: [declinedOrder] as unknown as Array<Order>,
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: vi.fn(),
    });

    renderOrderDetailsTable();

    await screen.findByRole('table');

    expect(screen.getByText(/ORD-DECLINED/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /options/i })).not.toBeInTheDocument();
  });

  it('renders an empty state when there are order types but no orders', async () => {
    mockUsePatientOrders.mockReturnValue({
      data: [],
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: vi.fn(),
    });

    renderOrderDetailsTable();

    await screen.findByRole('combobox', { name: /select order type/i });

    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.getByText(/there are no.*to display/i)).toBeInTheDocument();
  });

  it('shows an overflow menu for active orders', async () => {
    mockUsePatientOrders.mockReturnValue({
      data: [mockOrders[0]] as unknown as Array<Order>,
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: vi.fn(),
    });

    renderOrderDetailsTable();

    await screen.findByRole('table');

    expect(screen.getByRole('button', { name: /options/i })).toBeInTheDocument();
  });

  it('disables modify and cancel actions when an order has no visit context', async () => {
    const orderWithoutVisitContext = {
      ...mockOrders[0],
      encounter: null,
    };

    mockUsePatientOrders.mockReturnValue({
      data: [orderWithoutVisitContext] as unknown as Array<Order>,
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: vi.fn(),
    });

    renderOrderDetailsTable();

    await screen.findByRole('table');
    await user.click(screen.getByRole('button', { name: /options/i }));

    expect(screen.getByRole('button', { name: /modify order/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /cancel order/i })).toBeDisabled();
  });
});

function renderOrderDetailsTable() {
  render(
    <OrderDetailsTable
      patientUuid={mockPatient.id}
      patient={mockPatient}
      showAddButton
      showPrintButton
      title="Patient Orders"
    />,
  );
}
