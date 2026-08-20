import React from 'react';
import { vi, describe, it, expect, test, beforeEach } from 'vitest';
import { screen, render } from '@testing-library/react';
import { useConfig, useLayoutType, useSession } from '@openmrs/esm-framework';
import { type OrderBasketExtensionProps } from '@openmrs/esm-patient-common-lib';
import { mockPatient } from 'tools';
import OrderBasket from './order-basket.component';

const procedureOrderTypeUuid = '67890-procedure-uuid';
const labOrderTypeUuid = '52a447d3-a64a-11e3-9aeb-50e549534c5e';

vi.mock('../api/api', () => ({
  useOrderEncounterForSystemWithVisitDisabled: vi.fn().mockReturnValue({
    visitRequired: false,
    isLoading: false,
    encounterUuid: null,
    error: null,
    mutate: vi.fn(),
  }),
  useProviders: vi.fn().mockReturnValue({
    providers: [],
    isLoading: false,
    error: null,
  }),
}));

vi.mock('@openmrs/esm-patient-common-lib', async () => ({
  ...((await vi.importActual('@openmrs/esm-patient-common-lib')) as object),
  useOrderType: vi.fn().mockReturnValue({
    orderType: { display: 'Order', javaClassName: 'org.openmrs.Order' },
    isLoadingOrderType: false,
  }),
  useMutatePatientOrders: vi.fn().mockReturnValue({ mutate: vi.fn() }),
}));

const mockSession = {
  currentProvider: { uuid: 'provider-1', person: { display: 'Test Provider' } },
  sessionLocation: { uuid: 'location-1' },
  user: { person: { display: 'Test Provider' } },
};

function renderOrderBasket(visibleOrderPanels?: string[]) {
  const orderBasketExtensionProps: OrderBasketExtensionProps = {
    patient: mockPatient,
    launchDrugOrderForm: vi.fn(),
    launchLabOrderForm: vi.fn(),
    launchGeneralOrderForm: vi.fn(),
    visibleOrderPanels,
  };

  return render(
    <OrderBasket
      patientUuid={mockPatient.id}
      patient={mockPatient}
      visitContext={null}
      mutateVisitContext={vi.fn()}
      closeWorkspace={vi.fn().mockResolvedValue(true)}
      orderBasketExtensionProps={orderBasketExtensionProps}
    />,
  );
}

beforeEach(() => {
  vi.mocked(useConfig).mockReturnValue({
    orderTypes: [
      { orderTypeUuid: procedureOrderTypeUuid, label: 'Procedure orders', icon: '' },
      { orderTypeUuid: labOrderTypeUuid, label: 'Lab orders', icon: '' },
    ],
    orderEncounterType: 'test-encounter-type',
    ordererProviderRoles: [],
    orderLocationTagName: '',
  });
  vi.mocked(useSession).mockReturnValue(mockSession as any);
  vi.mocked(useLayoutType).mockReturnValue('small-desktop');
});

describe('Order basket panel filtering', () => {
  it('shows all general order panels when visibleOrderPanels is not set', () => {
    renderOrderBasket();

    expect(screen.getByText(/Procedure orders/)).toBeInTheDocument();
    expect(screen.getByText(/Lab orders/)).toBeInTheDocument();
  });

  it('shows only general order panels whose order type is in visibleOrderPanels', () => {
    renderOrderBasket([procedureOrderTypeUuid]);

    expect(screen.getByText(/Procedure orders/)).toBeInTheDocument();
    expect(screen.queryByText(/Lab orders/)).not.toBeInTheDocument();
  });

  it('hides all general order panels when visibleOrderPanels is an empty array', () => {
    renderOrderBasket([]);

    expect(screen.queryByText(/Procedure orders/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Lab orders/)).not.toBeInTheDocument();
  });
});
