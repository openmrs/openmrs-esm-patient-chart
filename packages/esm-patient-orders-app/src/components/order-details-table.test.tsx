import React from 'react';
import { screen, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type ConfigObject, getDefaultsFromConfigSchema, openmrsFetch, useConfig, useSession } from '@openmrs/esm-framework';
import OrderDetailsTable from './orders-details-table.component';
import { useOrderTypes, usePatientOrders } from '@openmrs/esm-patient-common-lib';
import { mockOrders, mockSessionDataResponse } from '__mocks__';
import { waitForLoadingToFinish } from 'tools';
import { configSchema } from '../config-schema';
import { useReactToPrint } from 'react-to-print';

const usePatientOrdersMock = usePatientOrders as jest.Mock;
const useOrderTypesMock = useOrderTypes as jest.Mock;
const mockSession = jest.mocked(useSession);
mockSession.mockReturnValue(mockSessionDataResponse.data);
const mockOpenmrsFetch = openmrsFetch as jest.Mock;
mockOpenmrsFetch.mockImplementation(jest.fn());
const mockUseConfig = jest.mocked(useConfig<ConfigObject>);
const mockedUseReactToPrint = jest.mocked(useReactToPrint);
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

  test('renders error state if an error occurs', async () => {
    const error = {
      message: 'You are not logged in',
      response: {
        status: 401,
        statusText: 'Unauthorized',
      },
    };
    useOrderTypesMock.mockReturnValue({
      data: [],
      isLoading: false,
      error: error,
      isValidating: false,
    });
    usePatientOrdersMock.mockReturnValue({
      data: [],
      error: error,
      isLoading: false,
      isValidating: false,
    });

    renderOrderDetailsTable();
    await screen.findByRole('combobox', { name: /select order type/i });
    expect(screen.getByText(/Sorry, there was a problem displaying this information./)).toBeInTheDocument();
  });

  test('renders loading state initially', async () => {
    useOrderTypesMock.mockReturnValue({
      data: [],
      isLoading: true,
      error: null,
      isValidating: false,
    });
    usePatientOrdersMock.mockReturnValue({
      data: [],
      error: undefined,
      isLoading: true,
      isValidating: false,
    });
    renderOrderDetailsTable();

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('renders orders table with data', async () => {
    useOrderTypesMock.mockReturnValue({
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
      isLoading: false,
      error: null,
      isValidating: false,
    });
    usePatientOrdersMock.mockReturnValue({
      data: mockOrders,
      error: undefined,
      isLoading: false,
      isValidating: false,
    });

    renderOrderDetailsTable();

    const expectedColumnHeaders = [
      /order number/i,
      /date of order/i,
      /order type/i,
      /^order$/i,
      /priority/i,
      /ordered by/i,
      /status/i,
    ];

    const expectedOrders = [
      /ORD-321 22-Nov-2024 Drug order \(NEW\) Permethrin: 1\.0 Ampule\(s\) Oral Once daily 1 Days take after eating Routine admin - Super User -- Options/i,
    ];

    await screen.findAllByRole('heading', { name: /patient orders/i });

    expectedColumnHeaders.forEach((header) => {
      expect(screen.getByRole('button', { name: new RegExp(header, 'i') })).toBeInTheDocument();
    });

    expectedOrders.forEach((order, index) => {
      expect(screen.getByRole('row', { name: new RegExp(order, 'i') })).toBeInTheDocument();
    });
  });

  test('filter orders in the order details table', async () => {
    useOrderTypesMock.mockReturnValue({
      data: [
        { uuid: 'Drug Order', display: 'Routine' },
        { uuid: 'Lab Order', display: 'Urgent' },
      ],
      isLoading: false,
      error: null,
      isValidating: false,
    });
    usePatientOrdersMock.mockReturnValue({
      data: mockOrders,
      error: undefined,
      isLoading: false,
      isValidating: false,
    });

    renderOrderDetailsTable();
    const searchbox = screen.getByRole('combobox', { name: /select order type/i });
    expect(searchbox).toBeInTheDocument();
    await user.type(searchbox, 'Routine');
    expect(screen.getByRole('row', { name: /ORD-321 22-Nov-2024 Drug order/i })).toBeInTheDocument();
  });

  test('renders print button', async () => {
    const user = userEvent.setup();
    const mockHandlePrint = jest.fn();
    mockedUseReactToPrint.mockReturnValue(mockHandlePrint);

    useOrderTypesMock.mockReturnValue({
      data: [
        { uuid: 'Drug Order', display: 'Routine' },
        { uuid: 'Lab Order', display: 'Urgent' },
      ],
      isLoading: false,
      error: null,
      isValidating: false,
    });
    usePatientOrdersMock.mockReturnValue({
      data: mockOrders,
      error: undefined,
      isLoading: false,
      isValidating: false,
    });
    mockUseConfig.mockReturnValue({
      ...getDefaultsFromConfigSchema(configSchema),
      showPrintButton: true,
    });
    jest.mock('react-to-print', () => ({
      ...jest.requireActual('react-to-print'),
      useReactToPrint: jest.fn(),
    }));

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
