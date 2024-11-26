import React from 'react';
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
import { useOrderTypes, usePatientOrders } from '@openmrs/esm-patient-common-lib';
import { configSchema } from '../config-schema';
import { mockOrders, mockSessionDataResponse } from '__mocks__';
import OrderDetailsTable from './orders-details-table.component';

const mockUsePatientOrders = usePatientOrders as jest.Mock;
const mockUseOrderTypes = useOrderTypes as jest.Mock;
const mockOpenmrsFetch = openmrsFetch as jest.Mock;
const mockSession = jest.mocked(useSession);
const mockUseConfig = jest.mocked(useConfig<ConfigObject>);
const mockUseReactToPrint = jest.mocked(useReactToPrint);

mockSession.mockReturnValue(mockSessionDataResponse.data);
mockOpenmrsFetch.mockImplementation(jest.fn());

jest.mock('react-to-print', () => ({
  ...jest.requireActual('react-to-print'),
  useReactToPrint: jest.fn(),
}));

jest.mock('@openmrs/esm-patient-common-lib', () => {
  const originalModule = jest.requireActual('@openmrs/esm-patient-common-lib');

  return {
    ...originalModule,
    usePatientOrders: jest.fn(),
    useOrderTypes: jest.fn(),
    usePatient: jest.fn(),
  };
});

describe('OrderDetailsTable', () => {
  const user = userEvent.setup();
  const testOrderTypeUuid = '52a447d3-a64a-11e3-9aeb-50e549534c5e';
  const drugOrderTypeUuid = '131168f4-15f5-102d-96e4-000c29c2a5d7';

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
    });

    renderOrderDetailsTable();

    await screen.findByRole('combobox', { name: /select order type/i });

    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders an error state if there is a problem fetching orders', async () => {
    const error = {
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
    });

    renderOrderDetailsTable();

    await screen.findByRole('combobox', { name: /select order type/i });
    expect(screen.getByText(/sorry, there was a problem displaying this information/i)).toBeInTheDocument();
  });

  it('renders a tabular overview of order data when data is available', async () => {
    mockUseOrderTypes.mockReturnValue({
      data: [
        {
          uuid: 'Drug Order',
          display: 'Routine',
        },
        {
          uuid: 'Lab Order',
          display: 'Urgent',
        },
      ],
      error: null,
      isLoading: false,
      isValidating: false,
    });
    mockUsePatientOrders.mockReturnValue({
      data: mockOrders,
      error: undefined,
      isLoading: false,
      isValidating: false,
    });

    renderOrderDetailsTable();

    const columns = {
      orderNumber: /order number/,
      dateOfOrder: /date of order/,
      orderType: /order type/,
      order: /^order$/,
      priority: /priority/,
      orderedBy: /ordered by/,
      status: /status/,
    };

    await screen.findByRole('table');

    Object.values(columns).forEach((headerText) => {
      expect(screen.getByRole('button', { name: new RegExp(headerText, 'i') })).toBeInTheDocument();
    });

    const expectedOrder = {
      orderNumber: 'ORD-321',
      date: '22-Nov-2024',
      type: 'Drug order',
      detailedInstructions: 'Permethrin: 1\\.0 Ampule\\(s\\) Oral Once daily 1 Days take after eating',
      orderedBy: 'admin - Super User',
    };

    Object.values(expectedOrder).forEach((content) => {
      expect(screen.getByRole('cell', { name: new RegExp(content, 'i') })).toBeInTheDocument();
    });
  });

  it('filters the orders list when the user types into the searchbox', async () => {
    mockUseOrderTypes.mockReturnValue({
      data: [
        { uuid: drugOrderTypeUuid, display: 'Drug Order' },
        { uuid: testOrderTypeUuid, display: 'Test Order' },
      ],
      isLoading: false,
      error: null,
      isValidating: false,
    });
    mockUsePatientOrders.mockReturnValue({
      data: mockOrders,
      error: undefined,
      isLoading: false,
      isValidating: false,
    });

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

  it('filters the table to show only drug orders or test orders based on the dropdown filter', async () => {
    const allOrders = mockOrders;
    const testOrders = mockOrders.filter((order) => order.orderType.uuid === testOrderTypeUuid);

    mockUseOrderTypes.mockReturnValue({
      data: [
        { uuid: drugOrderTypeUuid, display: 'Drug Order' },
        { uuid: testOrderTypeUuid, display: 'Test Order' },
      ],
      isLoading: false,
      error: null,
      isValidating: false,
    });

    mockUsePatientOrders.mockImplementation((_patientUuid, _status, orderType) => ({
      data: orderType ? testOrders : allOrders,
      error: undefined,
      isLoading: false,
      isValidating: false,
    }));

    renderOrderDetailsTable();

    await screen.findByRole('table');

    const orderTypeSelector = screen.getByRole('combobox', {
      name: /select order type/i,
    });

    await user.click(orderTypeSelector);
    await user.click(screen.getByRole('option', { name: /test order/i }));

    expect(
      screen.queryByRole('cell', {
        name: /drug order/i,
      }),
    ).not.toBeInTheDocument();
  });

  it('prints the orders in the list when the print button is clicked', async () => {
    const mockHandlePrint = jest.fn();

    mockUseReactToPrint.mockReturnValue(mockHandlePrint);
    mockUseOrderTypes.mockReturnValue({
      data: [
        { uuid: drugOrderTypeUuid, display: 'Drug Order' },
        { uuid: testOrderTypeUuid, display: 'Test Order' },
      ],
      error: null,
      isLoading: false,
      isValidating: false,
    });
    mockUsePatientOrders.mockReturnValue({
      data: mockOrders,
      error: undefined,
      isLoading: false,
      isValidating: false,
    });
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
});

function renderOrderDetailsTable() {
  render(<OrderDetailsTable patientUuid="mock-patient-uuid" showAddButton showPrintButton title="Patient Orders" />);
}
