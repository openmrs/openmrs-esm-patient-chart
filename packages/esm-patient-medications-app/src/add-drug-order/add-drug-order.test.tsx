/* eslint-disable testing-library/no-node-access */
import React from 'react';
import userEvent from '@testing-library/user-event';
import { screen, render, within, renderHook, waitFor } from '@testing-library/react';
import { getByTextWithMarkup, mockPatient } from 'tools';
import {
  mockDrugSearchResultApiData,
  mockDrugOrderTemplateApiData,
  mockPatientDrugOrdersApiData,
  mockSessionDataResponse,
} from '__mocks__';
import { getTemplateOrderBasketItem, useDrugSearch, useDrugTemplate } from './drug-search/drug-search.resource';
import { launchWorkspace2, useSession } from '@openmrs/esm-framework';
import * as esmFramework from '@openmrs/esm-framework';
import { type PostDataPrepFunction, useOrderBasket } from '@openmrs/esm-patient-common-lib';
import { _resetOrderBasketStore } from '@openmrs/esm-patient-common-lib/src/orders/store';
import AddDrugOrderWorkspace from './add-drug-order.workspace';
import { useIndicationSearch } from './drug-order-form.resource';

const mockCloseWorkspace = jest.fn();
const mockLaunchWorkspace = jest.mocked(launchWorkspace2);
const mockUseSession = jest.mocked(useSession);
const mockUseDrugSearch = jest.mocked(useDrugSearch);
const mockUseDrugTemplate = jest.mocked(useDrugTemplate);
const mockUseIndicationSearch = jest.mocked(useIndicationSearch);
const usePatientOrdersMock = jest.fn();

mockUseSession.mockReturnValue(mockSessionDataResponse.data);

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
}));

jest.mock('./drug-order-form.resource', () => ({
  ...jest.requireActual('./drug-order-form.resource'),
  useIndicationSearch: jest.fn(),
}));

jest.mock('../api/api', () => ({
  ...jest.requireActual('../api/api'),
  useActivePatientOrders: () => usePatientOrdersMock(),
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
      isValidating: false,
      mutate: jest.fn(),
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

    mockUseIndicationSearch.mockReturnValue({
      searchResults: [],
      isSearching: false,
      error: null,
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
      useOrderBasket(mockPatient, 'medications', ((x) => x) as unknown as PostDataPrepFunction),
    );

    const aspirin325Div = getByTextWithMarkup(/Aspirin 325mg/i).closest('div').parentElement;
    const aspirin325AddButton = within(aspirin325Div).getByText(/Add to basket/i);
    await user.click(aspirin325AddButton);

    expect(hookResult.current.orders).toEqual([
      expect.objectContaining({
        ...getTemplateOrderBasketItem(mockDrugSearchResultApiData[2], null),
        isOrderIncomplete: true,
        startDate: expect.any(Date),
      }),
    ]);
    expect(mockCloseWorkspace).toHaveBeenCalled();
  });

  test('can open the drug form ', async () => {
    const user = userEvent.setup();

    renderAddDrugOrderWorkspace();

    await user.type(screen.getByRole('searchbox'), 'Aspirin');
    const { result: hookResult } = renderHook(() =>
      useOrderBasket(mockPatient, 'medications', ((x) => x) as unknown as PostDataPrepFunction),
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
      useOrderBasket(mockPatient, 'medications', ((x) => x) as unknown as PostDataPrepFunction),
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
            null,
            undefined,
            mockDrugOrderTemplateApiData[mockDrugSearchResultApiData[0].uuid][0],
          ),
          startDate: expect.any(Date),
          indication: 'Hypertension',
        }),
      ]),
    );
  });

  test('saves coded indication when configured to use coded indication', async () => {
    const user = userEvent.setup();

    // Ensure the medications app is configured to use coded indication
    const useConfigSpy = jest.spyOn(esmFramework, 'useConfig').mockReturnValue({
      daysDurationUnit: {
        uuid: '1072AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
        display: 'Days',
      },
      drugOrderTypeUUID: '131168f4-15f5-102d-96e4-000c29c2a5d7',
      showPrintButton: false,
      debounceDelayInMs: 300,
      requireIndication: false,
      useCodedIndication: true,
    } as any);

    mockUseIndicationSearch.mockReturnValue({
      searchResults: [
        {
          uuid: 'diagnosis-uuid',
          display: 'Hypertension',
        },
      ],
      isSearching: false,
      error: null,
    });

    renderAddDrugOrderWorkspace();

    const { result: hookResult } = renderHook(() =>
      useOrderBasket(mockPatient, 'medications', ((x) => x) as unknown as PostDataPrepFunction),
    );

    await user.type(screen.getByRole('searchbox'), 'Aspirin');
    const aspirin81Div = getByTextWithMarkup(/Aspirin 81mg/i).closest('div').parentElement;
    const openFormButton = within(aspirin81Div).getByText(/Order form/i);
    await user.click(openFormButton);

    expect(screen.getByText(/Order Form/i)).toBeInTheDocument();

    const indicationCombo = screen.getByRole('combobox', { name: 'Indication' });
    await user.click(indicationCombo);
    await user.click(screen.getByText('Hypertension'));

    const saveFormButton = screen.getByText(/Save order/i);
    await user.click(saveFormButton);

    await waitFor(() =>
      expect(hookResult.current.orders).toEqual([
        expect.objectContaining({
          startDate: expect.any(Date),
          indicationCoded: {
            uuid: 'diagnosis-uuid',
            display: 'Hypertension',
          },
        }),
      ]),
    );

    useConfigSpy.mockRestore();
  });
});

function renderAddDrugOrderWorkspace() {
  render(
    <AddDrugOrderWorkspace
      workspaceProps={{
        order: null,
        orderToEditOrdererUuid: null,
      }}
      groupProps={{
        patientUuid: mockPatient.id,
        patient: mockPatient,
        visitContext: null,
        mutateVisitContext: null,
      }}
      workspaceName={''}
      launchChildWorkspace={jest.fn()}
      closeWorkspace={mockCloseWorkspace}
      windowProps={{
        encounterUuid: '',
      }}
      windowName={''}
      isRootWorkspace={false}
      showActionMenu={true}
    />,
  );
}
