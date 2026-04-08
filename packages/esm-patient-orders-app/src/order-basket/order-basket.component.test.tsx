import React from 'react';
import { render, screen } from '@testing-library/react';
import { type LayoutType, useSession, useConfig, useLayoutType } from '@openmrs/esm-framework';
import { useOrderBasket, useMutatePatientOrders } from '@openmrs/esm-patient-common-lib';
import { mockSessionDataResponse } from '__mocks__';
import { useOrderEncounterForSystemWithVisitDisabled, useProviders } from '../api/api';
import OrderBasket from './order-basket.component';

const mockUseSession = jest.mocked(useSession);
const mockUseConfig = jest.mocked(useConfig);
const mockUseLayoutType = jest.mocked(useLayoutType);
const mockUseOrderBasket = jest.mocked(useOrderBasket);
const mockUseMutatePatientOrders = jest.mocked(useMutatePatientOrders);
const mockUseOrderEncounterForSystemWithVisitDisabled = jest.mocked(useOrderEncounterForSystemWithVisitDisabled);
const mockUseProviders = jest.mocked(useProviders);

jest.mock('@openmrs/esm-patient-common-lib', () => ({
  ...jest.requireActual('@openmrs/esm-patient-common-lib'),
  useOrderBasket: jest.fn(),
  useMutatePatientOrders: jest.fn(),
}));

jest.mock('../api/api', () => ({
  useOrderEncounterForSystemWithVisitDisabled: jest.fn(),
  useProviders: jest.fn(),
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

const mockCloseWorkspace = jest.fn(() => Promise.resolve(true));
const mockMutateVisitContext = jest.fn();

const mockOrderBasketExtensionProps = {
  patient: mockPatient,
  launchDrugOrderForm: jest.fn(),
  launchLabOrderForm: jest.fn(),
  launchGeneralOrderForm: jest.fn(),
};

const defaultMockConfig = {
  orderTypes: [],
  orderEncounterType: 'order-encounter-type',
  ordererProviderRoles: [],
  orderLocationTagName: null,
};

describe('OrderBasket', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockUseLayoutType.mockReturnValue('desktop' as LayoutType);
    mockUseConfig.mockReturnValue(defaultMockConfig);
    mockUseOrderBasket.mockReturnValue({
      orders: [],
      clearOrders: jest.fn(),
      setOrders: jest.fn(),
    } as any);
    mockUseMutatePatientOrders.mockReturnValue({
      mutate: jest.fn(),
    } as any);
    mockUseOrderEncounterForSystemWithVisitDisabled.mockReturnValue({
      visitRequired: false,
      isLoading: false,
      encounterUuid: null,
      error: null,
      mutate: jest.fn(),
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
