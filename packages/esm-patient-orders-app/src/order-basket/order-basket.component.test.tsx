import React from 'react';
import { render, screen } from '@testing-library/react';
import { type LayoutType, useSession, useConfig, useLayoutType } from '@openmrs/esm-framework';
import { useOrderBasket, useMutatePatientOrders } from '@openmrs/esm-patient-common-lib';
import { mockSessionDataResponse } from '__mocks__';
import { useOrderEncounterForSystemWithVisitDisabled, useProviders } from '../api/api';
import OrderBasket from './order-basket.component';

const mockUseSession = vi.mocked(useSession);
const mockUseConfig = vi.mocked(useConfig);
const mockUseLayoutType = vi.mocked(useLayoutType);
const mockUseOrderBasket = vi.mocked(useOrderBasket);
const mockUseMutatePatientOrders = vi.mocked(useMutatePatientOrders);
const mockUseOrderEncounterForSystemWithVisitDisabled = vi.mocked(useOrderEncounterForSystemWithVisitDisabled);
const mockUseProviders = vi.mocked(useProviders);

vi.mock('@openmrs/esm-patient-common-lib', async () => ({
  ...((await vi.importActual('@openmrs/esm-patient-common-lib')) as object),
  useOrderBasket: vi.fn(),
  useMutatePatientOrders: vi.fn(),
}));

vi.mock('../api/api', () => ({
  useOrderEncounterForSystemWithVisitDisabled: vi.fn(),
  useProviders: vi.fn(),
}));

const mockPatientUuid = 'patient-uuid-123';
const mockPatient = {
  id: mockPatientUuid,
  resourceType: 'Patient',
} as fhir.Patient;

const mockVisitContext = {
  uuid: 'visit-uuid-123',
  visitType: { display: 'Facility Visit' },
} as any;

const mockCloseWorkspace = vi.fn(() => Promise.resolve(true));
const mockMutateVisitContext = vi.fn();

const mockOrderBasketExtensionProps = {
  patient: mockPatient,
  launchDrugOrderForm: vi.fn(),
  launchLabOrderForm: vi.fn(),
  launchGeneralOrderForm: vi.fn(),
};

const defaultMockConfig = {
  orderTypes: [],
  orderEncounterType: 'order-encounter-type',
  ordererProviderRoles: [],
  orderLocationTagName: null,
};

describe('OrderBasket', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockUseLayoutType.mockReturnValue('desktop' as LayoutType);
    mockUseConfig.mockReturnValue(defaultMockConfig);
    mockUseOrderBasket.mockReturnValue({
      orders: [],
      clearOrders: vi.fn(),
      setOrders: vi.fn(),
    } as any);
    mockUseMutatePatientOrders.mockReturnValue({
      mutate: vi.fn(),
    } as any);
    mockUseOrderEncounterForSystemWithVisitDisabled.mockReturnValue({
      visitRequired: false,
      isLoading: false,
      encounterUuid: null,
      error: null,
      mutate: vi.fn(),
    } as any);
    mockUseProviders.mockReturnValue({
      providers: [],
      isLoading: false,
      error: null,
    } as any);
  });

  it('should render without crashing when currentProvider is null', () => {
    mockUseSession.mockReturnValue({ ...mockSessionDataResponse.data, currentProvider: null } as any);

    render(
      <OrderBasket
        patientUuid={mockPatientUuid}
        patient={mockPatient}
        visitContext={mockVisitContext}
        mutateVisitContext={mockMutateVisitContext}
        closeWorkspace={mockCloseWorkspace}
        orderBasketExtensionProps={mockOrderBasketExtensionProps}
      />,
    );

    expect(screen.getByText('Order Basket')).toBeInTheDocument();
  });

  it('should render normally when currentProvider exists', () => {
    mockUseSession.mockReturnValue(mockSessionDataResponse.data as any);

    render(
      <OrderBasket
        patientUuid={mockPatientUuid}
        patient={mockPatient}
        visitContext={mockVisitContext}
        mutateVisitContext={mockMutateVisitContext}
        closeWorkspace={mockCloseWorkspace}
        orderBasketExtensionProps={mockOrderBasketExtensionProps}
      />,
    );

    expect(screen.getByText('Order Basket')).toBeInTheDocument();
  });
});
