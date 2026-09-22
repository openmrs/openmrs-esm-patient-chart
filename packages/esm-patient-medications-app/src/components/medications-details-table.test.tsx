import React from 'react';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type Order, useOrderBasket } from '@openmrs/esm-patient-common-lib';
import { formatDate, useConfig, useSession } from '@openmrs/esm-framework';
import { mockPatientDrugOrdersApiData, mockSessionDataResponse } from '__mocks__';
import MedicationsDetailsTable from './medications-details-table.component';
import { mockPatient, renderWithSwr } from 'tools';

const mockUseOrderBasket = jest.mocked(useOrderBasket);
const mockUseConfig = jest.mocked(useConfig);
const mockUseSession = jest.mocked(useSession);
const mockLaunchOrderBasket = jest.fn();
const mockSetOrders = jest.fn();

jest.mock('@openmrs/esm-patient-common-lib', () => ({
  ...jest.requireActual('@openmrs/esm-patient-common-lib'),
  useOrderBasket: jest.fn(),
  useLaunchWorkspaceRequiringVisit: jest.fn(() => mockLaunchOrderBasket),
}));

describe('MedicationsDetailsTable', () => {
  beforeEach(() => {
    mockSetOrders.mockClear();
    mockLaunchOrderBasket.mockClear();
    mockUseSession.mockReturnValue(mockSessionDataResponse.data);

    mockUseOrderBasket.mockReturnValue({
      orders: [],
      setOrders: mockSetOrders,
      clearOrders: jest.fn(),
    });

    mockUseConfig.mockReturnValue({
      showPrintButton: false,
      excludePatientIdentifierCodeTypes: { uuids: [] },
    });
  });

  function medicationNamesInTableOrder(table: HTMLElement, drugNamePattern: RegExp): Array<string> {
    const names: Array<string> = [];
    for (const row of within(table).getAllByRole('row')) {
      const label = within(row).queryByText(drugNamePattern);
      if (label?.textContent) {
        names.push(label.textContent.trim());
      }
    }
    return names;
  }

  test('sorting by start date reorders medication rows within encounter groups', async () => {
    const user = userEvent.setup();
    const encounter = {
      uuid: 'enc-sort-test',
      display: 'Encounter',
      encounterDatetime: '2026-04-27T12:00:00',
    };
    const newerLaterInList = {
      ...mockPatientDrugOrdersApiData[0],
      uuid: 'med-newer',
      dateActivated: '2026-05-02T10:00:00.000+0000',
      drug: {
        ...mockPatientDrugOrdersApiData[0].drug,
        display: 'Sorttest newer drug',
      },
      encounter,
    };
    const olderEarlierInList = {
      ...mockPatientDrugOrdersApiData[1],
      uuid: 'med-older',
      dateActivated: '2026-05-01T10:00:00.000+0000',
      drug: {
        ...mockPatientDrugOrdersApiData[1].drug,
        display: 'Sorttest older drug',
      },
      encounter,
    };
    const medications = [newerLaterInList, olderEarlierInList] as unknown as Array<Order>;

    renderWithSwr(
      <MedicationsDetailsTable
        title="Active Medications"
        medications={medications}
        patient={mockPatient}
        showDiscontinueButton
        showModifyButton
        showRenewButton
      />,
    );

    const table = await screen.findByRole('table', { name: /medications/i });

    const drugPattern = /^Sorttest (newer|older) drug$/;

    expect(medicationNamesInTableOrder(table, drugPattern)).toEqual(['Sorttest newer drug', 'Sorttest older drug']);

    const startDateHeader = screen.getByRole('columnheader', { name: /start date/i });
    await user.click(within(startDateHeader).getByRole('button'));

    expect(medicationNamesInTableOrder(table, drugPattern)).toEqual(['Sorttest older drug', 'Sorttest newer drug']);
  });

  test('renders encounter date-time group headers', async () => {
    const medications = [
      {
        ...mockPatientDrugOrdersApiData[0],
        uuid: 'med-1',
        dateActivated: '2026-04-27T11:49:00',
        encounter: {
          ...mockPatientDrugOrdersApiData[0].encounter,
          uuid: 'enc-1',
          encounterDatetime: '2026-04-27T11:49:00',
        },
      },
      {
        ...mockPatientDrugOrdersApiData[1],
        uuid: 'med-2',
        dateActivated: '2026-04-27T10:13:00',
        encounter: {
          ...mockPatientDrugOrdersApiData[1].encounter,
          uuid: 'enc-2',
          encounterDatetime: '2026-04-27T10:13:00',
        },
      },
    ] as unknown as Array<Order>;

    renderWithSwr(
      <MedicationsDetailsTable
        title="Active Medications"
        medications={medications}
        patient={mockPatient}
        showDiscontinueButton
        showModifyButton
        showRenewButton
      />,
    );

    expect(
      await screen.findByText(formatDate(new Date('2026-04-27T11:49:00'), { time: true }), { exact: false }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(formatDate(new Date('2026-04-27T10:13:00'), { time: true }), { exact: false }),
    ).toBeInTheDocument();
  });

  test('renders unknown encounter date when encounter has uuid but no encounterDatetime', async () => {
    const medications = [
      {
        ...mockPatientDrugOrdersApiData[0],
        uuid: 'med-1',
        dateActivated: '2026-04-27T11:49:00',
        encounter: {
          uuid: 'enc-1',
          display: 'Encounter',
        },
      },
    ] as unknown as Array<Order>;

    renderWithSwr(
      <MedicationsDetailsTable
        title="Active Medications"
        medications={medications}
        patient={mockPatient}
        showDiscontinueButton
        showModifyButton
        showRenewButton
      />,
    );

    expect(await screen.findByText(/unknown date/i)).toBeInTheDocument();
  });

  test('renders renew all only for encounter groups with a valid encounter uuid', async () => {
    const medications = [
      {
        ...mockPatientDrugOrdersApiData[0],
        uuid: 'med-1',
        dateActivated: '2026-04-27T11:49:00',
        encounter: {
          ...mockPatientDrugOrdersApiData[0].encounter,
          uuid: 'enc-1',
          encounterDatetime: '2026-04-27T11:49:00',
        },
      },
      {
        ...mockPatientDrugOrdersApiData[1],
        uuid: 'med-2',
        dateActivated: '2026-04-27T10:13:00',
        encounter: {
          ...mockPatientDrugOrdersApiData[1].encounter,
          uuid: undefined,
          encounterDatetime: '2026-04-27T10:13:00',
        },
      },
    ] as unknown as Array<Order>;

    renderWithSwr(
      <MedicationsDetailsTable
        title="Active Medications"
        medications={medications}
        patient={mockPatient}
        showDiscontinueButton
        showModifyButton
        showRenewButton
      />,
    );

    const renewAllButtons = await screen.findAllByRole('button', { name: /renew all/i });
    expect(renewAllButtons).toHaveLength(1);
  });

  test('clicking renew all adds encounter orders to basket and launches order basket with encounter uuid', async () => {
    const user = userEvent.setup();
    const medications = [
      {
        ...mockPatientDrugOrdersApiData[0],
        uuid: 'med-1',
        dateActivated: '2026-04-27T11:49:00',
        encounter: {
          ...mockPatientDrugOrdersApiData[0].encounter,
          uuid: 'enc-1',
          encounterDatetime: '2026-04-27T11:49:00',
        },
      },
      {
        ...mockPatientDrugOrdersApiData[1],
        uuid: 'med-2',
        dateActivated: '2026-04-27T11:50:00',
        encounter: {
          ...mockPatientDrugOrdersApiData[1].encounter,
          uuid: 'enc-1',
          encounterDatetime: '2026-04-27T11:49:00',
        },
      },
    ] as unknown as Array<Order>;

    renderWithSwr(
      <MedicationsDetailsTable
        title="Active Medications"
        medications={medications}
        patient={mockPatient}
        showDiscontinueButton
        showModifyButton
        showRenewButton
      />,
    );

    const renewAllButton = await screen.findByRole('button', { name: /renew all/i });
    await user.click(renewAllButton);

    expect(mockSetOrders).toHaveBeenCalledTimes(1);
    const nextBasketItems = mockSetOrders.mock.calls[0][0] as Array<Order>;
    expect(nextBasketItems).toHaveLength(2);
    expect(nextBasketItems.every((order) => order.action === 'RENEW')).toBe(true);
    expect(mockLaunchOrderBasket).toHaveBeenCalledWith({}, { encounterUuid: 'enc-1' });
  });

  test('clicking renew all does not duplicate orders that are already in basket', async () => {
    const user = userEvent.setup();
    const medications = [
      {
        ...mockPatientDrugOrdersApiData[0],
        uuid: 'med-1',
        dateActivated: '2026-04-27T11:49:00',
        encounter: {
          ...mockPatientDrugOrdersApiData[0].encounter,
          uuid: 'enc-1',
          encounterDatetime: '2026-04-27T11:49:00',
        },
      },
      {
        ...mockPatientDrugOrdersApiData[1],
        uuid: 'med-2',
        dateActivated: '2026-04-27T11:50:00',
        encounter: {
          ...mockPatientDrugOrdersApiData[1].encounter,
          uuid: 'enc-1',
          encounterDatetime: '2026-04-27T11:49:00',
        },
      },
    ] as unknown as Array<Order>;

    mockUseOrderBasket.mockReturnValue({
      orders: [{ ...medications[0], action: 'NEW' }] as any,
      setOrders: mockSetOrders,
      clearOrders: jest.fn(),
    });

    renderWithSwr(
      <MedicationsDetailsTable
        title="Active Medications"
        medications={medications}
        patient={mockPatient}
        showDiscontinueButton
        showModifyButton
        showRenewButton
      />,
    );

    const renewAllButton = await screen.findByRole('button', { name: /renew all/i });
    await user.click(renewAllButton);

    expect(mockSetOrders).toHaveBeenCalledTimes(1);
    const nextBasketItems = mockSetOrders.mock.calls[0][0] as Array<Order>;
    expect(nextBasketItems).toHaveLength(2);
    expect(nextBasketItems.filter((order) => order.uuid === 'med-1')).toHaveLength(1);
    expect(nextBasketItems.filter((order) => order.uuid === 'med-2' && order.action === 'RENEW')).toHaveLength(1);
  });

  test('disables renew all when all encounter orders are already in basket', async () => {
    const medications = [
      {
        ...mockPatientDrugOrdersApiData[0],
        uuid: 'med-1',
        dateActivated: '2026-04-27T11:49:00',
        encounter: {
          ...mockPatientDrugOrdersApiData[0].encounter,
          uuid: 'enc-1',
          encounterDatetime: '2026-04-27T11:49:00',
        },
      },
      {
        ...mockPatientDrugOrdersApiData[1],
        uuid: 'med-2',
        dateActivated: '2026-04-27T11:50:00',
        encounter: {
          ...mockPatientDrugOrdersApiData[1].encounter,
          uuid: 'enc-1',
          encounterDatetime: '2026-04-27T11:49:00',
        },
      },
    ] as unknown as Array<Order>;

    mockUseOrderBasket.mockReturnValue({
      orders: medications.map((order) => ({ ...order, action: 'NEW' })) as any,
      setOrders: mockSetOrders,
      clearOrders: jest.fn(),
    });

    renderWithSwr(
      <MedicationsDetailsTable
        title="Active Medications"
        medications={medications}
        patient={mockPatient}
        showDiscontinueButton
        showModifyButton
        showRenewButton
      />,
    );

    const renewAllButton = await screen.findByRole('button', { name: /renew all/i });
    expect(renewAllButton).toBeDisabled();
  });

  test('clicking disabled renew all does not mutate basket or launch workspace', async () => {
    const user = userEvent.setup();
    const medications = [
      {
        ...mockPatientDrugOrdersApiData[0],
        uuid: 'med-1',
        dateActivated: '2026-04-27T11:49:00',
        encounter: {
          ...mockPatientDrugOrdersApiData[0].encounter,
          uuid: 'enc-1',
          encounterDatetime: '2026-04-27T11:49:00',
        },
      },
      {
        ...mockPatientDrugOrdersApiData[1],
        uuid: 'med-2',
        dateActivated: '2026-04-27T11:50:00',
        encounter: {
          ...mockPatientDrugOrdersApiData[1].encounter,
          uuid: 'enc-1',
          encounterDatetime: '2026-04-27T11:49:00',
        },
      },
    ] as unknown as Array<Order>;

    mockUseOrderBasket.mockReturnValue({
      orders: medications.map((order) => ({ ...order, action: 'NEW' })) as any,
      setOrders: mockSetOrders,
      clearOrders: jest.fn(),
    });

    renderWithSwr(
      <MedicationsDetailsTable
        title="Active Medications"
        medications={medications}
        patient={mockPatient}
        showDiscontinueButton
        showModifyButton
        showRenewButton
      />,
    );

    const renewAllButton = await screen.findByRole('button', { name: /renew all/i });
    expect(renewAllButton).toBeDisabled();

    await user.click(renewAllButton);

    expect(mockSetOrders).not.toHaveBeenCalled();
    expect(mockLaunchOrderBasket).not.toHaveBeenCalled();
  });
});
