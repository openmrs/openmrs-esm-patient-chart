/* eslint-disable testing-library/no-node-access */
import React from 'react';
import userEvent from '@testing-library/user-event';
import { screen, render, within, renderHook, waitFor } from '@testing-library/react';
import { getByTextWithMarkup } from 'tools';
import { getTemplateOrderBasketItem, useDrugSearch, useDrugTemplate } from './drug-search/drug-search.resource';
import {
  mockDrugSearchResultApiData,
  mockDrugOrderTemplateApiData,
  mockPatientDrugOrdersApiData,
  mockSessionDataResponse,
} from '__mocks__';
import { closeWorkspace, useSession } from '@openmrs/esm-framework';
import { type PostDataPrepFunction, useOrderBasket } from '@openmrs/esm-patient-common-lib';
import { _resetOrderBasketStore } from '@openmrs/esm-patient-common-lib/src/orders/store';
import AddDrugOrderWorkspace from './add-drug-order.workspace';

const mockCloseWorkspace = closeWorkspace as jest.Mock;
const mockLaunchPatientWorkspace = jest.fn();
const mockUseSession = jest.mocked(useSession);
const mockUseDrugSearch = jest.mocked(useDrugSearch);
const mockUseDrugTemplate = jest.mocked(useDrugTemplate);
const usePatientOrdersMock = jest.fn();

mockCloseWorkspace.mockImplementation((name, { onWorkspaceClose }) => onWorkspaceClose());
mockUseSession.mockReturnValue(mockSessionDataResponse.data);

jest.mock('@openmrs/esm-patient-common-lib', () => ({
  ...jest.requireActual('@openmrs/esm-patient-common-lib'),
  launchPatientWorkspace: (...args) => mockLaunchPatientWorkspace(...args),
}));

/** This is needed to render the order form */
global.IntersectionObserver = jest.fn(function (callback, options) {
  this.observe = jest.fn();
  this.unobserve = jest.fn();
  this.disconnect = jest.fn();
  this.trigger = (entries) => callback(entries, this);
  this.options = options;
}) as any;

jest.mock('./drug-search/drug-search.resource', () => ({
  ...jest.requireActual('./drug-search/drug-search.resource'),
  useDrugSearch: jest.fn(),
  useDrugTemplate: jest.fn(),
  useDebounce: jest.fn().mockImplementation((x) => x),
}));

jest.mock('../api/api', () => ({
  ...jest.requireActual('../api/api'),
  usePatientOrders: () => usePatientOrdersMock(),
  useRequireOutpatientQuantity: jest
    .fn()
    .mockReturnValue({ requireOutpatientQuantity: false, error: null, isLoading: false }),
}));

describe('AddDrugOrderWorkspace drug search', () => {
  beforeEach(() => {
    _resetOrderBasketStore();

    mockUseDrugSearch.mockImplementation(() => ({
      isLoading: false,
      drugs: mockDrugSearchResultApiData,
      error: null,
    }));

    mockUseDrugTemplate.mockImplementation((drugUuid) => ({
      templates: mockDrugOrderTemplateApiData[drugUuid] ?? [],
      isLoading: false,
      error: null,
    }));

    usePatientOrdersMock.mockReturnValue({
      isLoading: false,
      data: [],
    });
  });

  test('looks ok', async () => {
    const user = userEvent.setup();

    renderAddDrugOrderWorkspace();

    await user.type(screen.getByRole('searchbox'), 'Aspirin');
    await screen.findAllByRole('listitem');
    expect(screen.getAllByRole('listitem').length).toEqual(3);
    // Anotates results with dosing info if an order-template was found.
    const aspirin81 = getByTextWithMarkup(/Aspirin 81mg/i);
    expect(aspirin81).toBeInTheDocument();
    expect(aspirin81.closest('div')).toHaveTextContent(/Aspirin.*81mg.*tablet.*twice daily.*oral/i);
    // Only displays drug name for results without a matching order template
    const aspirin325 = getByTextWithMarkup(/Aspirin 325mg/i);
    expect(aspirin325).toBeInTheDocument();
    expect(aspirin325.closest('div')).toHaveTextContent(/Aspirin.*325mg.*tablet/i);
    const asprin162 = screen.getByText(/Aspirin 162.5mg/i);
    expect(asprin162).toBeInTheDocument();
    expect(asprin162.closest('div')).toHaveTextContent(/Aspirin.*162.5mg.*tablet/i);
  });

  test('no buttons to click if the medication is already prescribed', async () => {
    usePatientOrdersMock.mockReturnValue({
      isLoading: false,
      data: [mockPatientDrugOrdersApiData[0]],
    });
    const user = userEvent.setup();

    renderAddDrugOrderWorkspace();

    await user.type(screen.getByRole('searchbox'), 'Aspirin');
    expect(screen.getAllByRole('listitem').length).toEqual(3);
    const aspirin162Div = getByTextWithMarkup(/Aspirin 162.5mg/i).closest('div').parentElement;
    expect(aspirin162Div).toHaveTextContent(/Already prescribed/i);
  });

  test('can add items directly to the basket', async () => {
    const user = userEvent.setup();

    renderAddDrugOrderWorkspace();

    await user.type(screen.getByRole('searchbox'), 'Aspirin');
    const { result: hookResult } = renderHook(() =>
      useOrderBasket('medications', ((x) => x) as unknown as PostDataPrepFunction),
    );

    const aspirin325Div = getByTextWithMarkup(/Aspirin 325mg/i).closest('div').parentElement;
    const aspirin325AddButton = within(aspirin325Div).getByText(/Add to basket/i);
    await user.click(aspirin325AddButton);

    expect(hookResult.current.orders).toEqual([
      expect.objectContaining({
        ...getTemplateOrderBasketItem(mockDrugSearchResultApiData[2]),
        isOrderIncomplete: true,
        startDate: expect.any(Date),
      }),
    ]);
    expect(mockLaunchPatientWorkspace).toHaveBeenCalledWith('order-basket');
  });

  test('can open the drug form ', async () => {
    const user = userEvent.setup();

    renderAddDrugOrderWorkspace();

    await user.type(screen.getByRole('searchbox'), 'Aspirin');
    const { result: hookResult } = renderHook(() =>
      useOrderBasket('medications', ((x) => x) as unknown as PostDataPrepFunction),
    );
    const aspirin81Div = getByTextWithMarkup(/Aspirin 81mg/i).closest('div').parentElement;
    const aspirin81OpenFormButton = within(aspirin81Div).getByText(/Order form/i);
    await user.click(aspirin81OpenFormButton);

    expect(screen.getByText(/Order Form/i)).toBeInTheDocument();
  });

  test('can open an item in the medication form and on saving, it should add the order in the order basket store', async () => {
    const user = userEvent.setup();

    renderAddDrugOrderWorkspace();

    const { result: hookResult } = renderHook(() =>
      useOrderBasket('medications', ((x) => x) as unknown as PostDataPrepFunction),
    );
    await user.type(screen.getByRole('searchbox'), 'Aspirin');
    const aspirin81Div = getByTextWithMarkup(/Aspirin 81mg/i).closest('div').parentElement;
    const openFormButton = within(aspirin81Div).getByText(/Order form/i);
    await user.click(openFormButton);

    expect(screen.getByText(/Order Form/i)).toBeInTheDocument();
    const indicationField = screen.getByRole('textbox', { name: 'Indication' });
    await user.type(indicationField, 'Hypertension');
    const saveFormButton = screen.getByText(/Save order/i);
    await user.click(saveFormButton);

    await waitFor(() =>
      expect(hookResult.current.orders).toEqual([
        expect.objectContaining({
          ...getTemplateOrderBasketItem(
            mockDrugSearchResultApiData[0],
            undefined,
            mockDrugOrderTemplateApiData[mockDrugSearchResultApiData[0].uuid][0],
          ),
          startDate: expect.any(Date),
          indication: 'Hypertension',
          careSetting: '6f0c9a92-6f24-11e3-af88-005056821db0',
          orderer: mockSessionDataResponse.data.currentProvider.uuid,
        }),
      ]),
    );
  });
});

function renderAddDrugOrderWorkspace() {
  render(
    <AddDrugOrderWorkspace
      order={undefined as any}
      closeWorkspace={({ onWorkspaceClose }) => onWorkspaceClose()}
      closeWorkspaceWithSavedChanges={({ onWorkspaceClose }) => onWorkspaceClose()}
      promptBeforeClosing={() => false}
      patientUuid={'mock-patient-uuid'}
      setTitle={jest.fn()}
      setCancelTitle={jest.fn()}
      setCancelMessage={jest.fn()}
      setCancelConfirmText={jest.fn()}
    />,
  );
}
