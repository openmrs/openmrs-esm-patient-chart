import React from 'react';
import { vi, describe, expect, beforeEach, it } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, renderHook, screen, waitFor, within } from '@testing-library/react';
import { _resetOrderBasketStore } from '@openmrs/esm-patient-common-lib/src/orders/store';
import { useSession } from '@openmrs/esm-framework';
import { type PostDataPrepFunction, useOrderBasket, usePatientOrders } from '@openmrs/esm-patient-common-lib';
import { mockSessionDataResponse } from '__mocks__';
import { mockPatient } from 'tools';
import { TestTypeSearch } from './test-type-search.component';

const orderTypeUuid = 'test-procedure-order-type-uuid';
const otherOrderTypeUuid = 'test-other-order-type-uuid';
const xrayConceptUuid = 'ankle-xray-concept-uuid';
const cd4ConceptUuid = 'cd4-concept-uuid';

const mockCloseWorkspace = vi.fn();
const mockOpenLabForm = vi.fn();
const mockUseSession = vi.mocked(useSession);
const mockUsePatientOrders = vi.mocked(usePatientOrders);

vi.mock('./useTestTypes', () => ({
  useTestTypes: () => ({
    testTypes: [
      { conceptUuid: xrayConceptUuid, label: 'ANKLE X-RAY', synonyms: [] },
      { conceptUuid: cd4ConceptUuid, label: 'CD4 COUNT', synonyms: [] },
    ],
    isLoading: false,
    error: null,
  }),
}));

vi.mock('@openmrs/esm-patient-common-lib', async () => ({
  ...((await vi.importActual('@openmrs/esm-patient-common-lib')) as object),
  usePatientOrders: vi.fn(),
}));

function mockActiveOrders(orders: Array<Record<string, unknown>>, isLoading = false) {
  mockUsePatientOrders.mockReturnValue({
    data: orders,
    error: undefined,
    isLoading,
    isValidating: false,
    mutate: vi.fn(),
  } as unknown as ReturnType<typeof usePatientOrders>);
}

function activeOrder(conceptUuid: string, overrides: Record<string, unknown> = {}) {
  return {
    uuid: `order-${conceptUuid}`,
    action: 'NEW',
    concept: { uuid: conceptUuid },
    orderType: { uuid: orderTypeUuid },
    dateStopped: null,
    ...overrides,
  };
}

function renderTestTypeSearch() {
  return render(
    <TestTypeSearch
      patient={mockPatient}
      visit={null}
      openLabForm={mockOpenLabForm}
      orderTypeUuid={orderTypeUuid}
      orderableConceptSets={[]}
      closeWorkspace={mockCloseWorkspace}
      searchTerm=""
      onSearchTermChange={vi.fn()}
    />,
  );
}

function getTile(label: string) {
  return screen.getByText(label).closest('[role="listitem"]') as HTMLElement;
}

describe('TestTypeSearch', () => {
  beforeEach(() => {
    _resetOrderBasketStore();
    mockCloseWorkspace.mockClear();
    mockOpenLabForm.mockClear();
    mockUseSession.mockReturnValue(mockSessionDataResponse.data);
  });

  it('asks the active orders of the patient for the order type being searched', () => {
    mockActiveOrders([]);
    renderTestTypeSearch();

    expect(mockUsePatientOrders).toHaveBeenCalledWith(mockPatient.id, 'ACTIVE', orderTypeUuid);
  });

  it('flags a test that is already active and blocks ordering it until the repeat is confirmed', async () => {
    const user = userEvent.setup();
    mockActiveOrders([activeOrder(xrayConceptUuid)]);
    const { result: basket } = renderHook(() =>
      useOrderBasket(mockPatient, orderTypeUuid, ((x) => x) as unknown as PostDataPrepFunction),
    );
    renderTestTypeSearch();

    const xrayTile = getTile('ANKLE X-RAY');
    expect(xrayTile).toHaveTextContent('Already active');
    const addButton = within(xrayTile).getByRole('button', { name: /add to basket/i });
    const orderFormButton = within(xrayTile).getByRole('button', { name: /order form/i });
    expect(addButton).toBeDisabled();
    expect(orderFormButton).toBeDisabled();

    await user.click(addButton);
    expect(basket.current.orders).toEqual([]);
    expect(mockCloseWorkspace).not.toHaveBeenCalled();

    await user.click(within(xrayTile).getByRole('checkbox', { name: /already active\. order it again/i }));
    expect(addButton).toBeEnabled();
    expect(orderFormButton).toBeEnabled();

    await user.click(addButton);
    await waitFor(() =>
      expect(basket.current.orders).toEqual([
        expect.objectContaining({ action: 'NEW', testType: expect.objectContaining({ conceptUuid: xrayConceptUuid }) }),
      ]),
    );
    expect(mockCloseWorkspace).toHaveBeenCalled();
  });

  it('opens the order form for an active test only once the repeat is confirmed', async () => {
    const user = userEvent.setup();
    mockActiveOrders([activeOrder(xrayConceptUuid)]);
    renderTestTypeSearch();

    const xrayTile = getTile('ANKLE X-RAY');
    await user.click(within(xrayTile).getByRole('button', { name: /order form/i }));
    expect(mockOpenLabForm).not.toHaveBeenCalled();

    await user.click(within(xrayTile).getByRole('checkbox'));
    await user.click(within(xrayTile).getByRole('button', { name: /order form/i }));
    expect(mockOpenLabForm).toHaveBeenCalledWith(
      expect.objectContaining({ testType: expect.objectContaining({ conceptUuid: xrayConceptUuid }) }),
    );
  });

  it('does not flag a test whose only order is stopped, discontinued or of another order type', () => {
    mockActiveOrders([
      activeOrder(xrayConceptUuid, { dateStopped: '2026-11-06T08:00:00.000+0000' }),
      activeOrder(xrayConceptUuid, { action: 'DISCONTINUE' }),
      activeOrder(cd4ConceptUuid, { orderType: { uuid: otherOrderTypeUuid } }),
    ]);
    renderTestTypeSearch();

    for (const label of ['ANKLE X-RAY', 'CD4 COUNT']) {
      const tile = getTile(label);
      expect(tile).not.toHaveTextContent('Already active');
      expect(within(tile).queryByRole('checkbox')).not.toBeInTheDocument();
      expect(within(tile).getByRole('button', { name: /add to basket/i })).toBeEnabled();
    }
  });

  it('only flags the test that is active, not the other results', () => {
    mockActiveOrders([activeOrder(xrayConceptUuid)]);
    renderTestTypeSearch();

    const cd4Tile = getTile('CD4 COUNT');
    expect(cd4Tile).not.toHaveTextContent('Already active');
    expect(within(cd4Tile).getByRole('button', { name: /add to basket/i })).toBeEnabled();
  });

  it('keeps ordering disabled while the active orders are loading', () => {
    mockActiveOrders(null, true);
    renderTestTypeSearch();

    const cd4Tile = getTile('CD4 COUNT');
    expect(within(cd4Tile).getByRole('button', { name: /add to basket/i })).toBeDisabled();
    expect(within(cd4Tile).getByRole('button', { name: /order form/i })).toBeDisabled();
  });
});
