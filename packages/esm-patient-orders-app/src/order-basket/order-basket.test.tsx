import React from 'react';
import { screen, render } from '@testing-library/react';
import { useConfig, useLayoutType, useSession } from '@openmrs/esm-framework';
import { type OrderBasketExtensionProps } from '@openmrs/esm-patient-common-lib';
import { mockPatient } from 'tools';
import OrderBasket from './order-basket.component';

const procedureOrderTypeUuid = '67890-procedure-uuid';
const labOrderTypeUuid = '52a447d3-a64a-11e3-9aeb-50e549534c5e';

jest.mock('../api/api', () => ({
  useOrderEncounterForSystemWithVisitDisabled: jest.fn().mockReturnValue({
    visitRequired: false,
    isLoading: false,
    encounterUuid: null,
    error: null,
    mutate: jest.fn(),
  }),
  useProviders: jest.fn().mockReturnValue({
    providers: [],
    isLoading: false,
    error: null,
  }),
}));

jest.mock('@openmrs/esm-patient-common-lib', () => ({
  ...jest.requireActual('@openmrs/esm-patient-common-lib'),
  useOrderType: jest.fn().mockReturnValue({
    orderType: { display: 'Order', javaClassName: 'org.openmrs.Order' },
    isLoadingOrderType: false,
  }),
  useMutatePatientOrders: jest.fn().mockReturnValue({ mutate: jest.fn() }),
}));

const mockSession = {
  currentProvider: { uuid: 'provider-1', person: { display: 'Test Provider' } },
  sessionLocation: { uuid: 'location-1' },
  user: { person: { display: 'Test Provider' } },
};

function renderOrderBasket(visibleOrderPanels?: string[]) {
  const orderBasketExtensionProps: OrderBasketExtensionProps = {
    patient: mockPatient,
    launchDrugOrderForm: jest.fn(),
    launchLabOrderForm: jest.fn(),
    launchGeneralOrderForm: jest.fn(),
    visibleOrderPanels,
  };

  return render(
    <OrderBasket
      patientUuid={mockPatient.id}
      patient={mockPatient}
      visitContext={null}
      mutateVisitContext={jest.fn()}
      closeWorkspace={jest.fn().mockResolvedValue(true)}
      orderBasketExtensionProps={orderBasketExtensionProps}
    />,
  );
}

beforeEach(() => {
  jest.mocked(useConfig).mockReturnValue({
    orderTypes: [
      { orderTypeUuid: procedureOrderTypeUuid, label: 'Procedure orders', icon: '' },
      { orderTypeUuid: labOrderTypeUuid, label: 'Lab orders', icon: '' },
    ],
    orderEncounterType: 'test-encounter-type',
    ordererProviderRoles: [],
    orderLocationTagName: '',
  });
  jest.mocked(useSession).mockReturnValue(mockSession as any);
  jest.mocked(useLayoutType).mockReturnValue('small-desktop');
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
