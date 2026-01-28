import React from 'react';
import { render, screen } from '@testing-library/react';
import { useSession, useConfig, useLayoutType } from '@openmrs/esm-framework';
import { useOrderBasket, useMutatePatientOrders } from '@openmrs/esm-patient-common-lib';
import { useOrderEncounterForSystemWithVisitDisabled, useProviders } from '../api/api';
import OrderBasket from './order-basket.component';

const mockUseSession = jest.mocked(useSession);
const mockUseConfig = jest.mocked(useConfig);
const mockUseLayoutType = jest.mocked(useLayoutType);
const mockUseOrderBasket = jest.mocked(useOrderBasket);
const mockUseMutatePatientOrders = jest.mocked(useMutatePatientOrders);
const mockUseOrderEncounterForSystemWithVisitDisabled = jest.mocked(useOrderEncounterForSystemWithVisitDisabled);
const mockUseProviders = jest.mocked(useProviders);

jest.mock('@openmrs/esm-framework', () => ({
  ...jest.requireActual('@openmrs/esm-framework'),
  useSession: jest.fn(),
  useConfig: jest.fn(),
  useLayoutType: jest.fn(),
}));

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

const mockSessionWithProvider = {
  authenticated: true,
  locale: 'en_GB',
  currentProvider: {
    uuid: 'provider-uuid-123',
    display: 'Dr. Test Provider',
    person: {
      uuid: 'person-uuid-123',
      display: 'Dr. Test Provider',
    },
    identifier: 'TEST123',
    attributes: [],
  },
  sessionLocation: {
    uuid: 'location-uuid-123',
    display: 'Test Location',
    name: 'Test Location',
  },
  user: {
    uuid: 'user-uuid-123',
    display: 'testuser',
    username: 'testuser',
    person: {
      uuid: 'person-uuid-123',
      display: 'Dr. Test Provider',
    },
  },
};

const mockSessionWithoutProvider = {
  ...mockSessionWithProvider,
  currentProvider: null,
};

const defaultMockConfig = {
  orderTypes: [],
  orderEncounterType: 'order-encounter-type',
  ordererProviderRoles: [],
};

describe('OrderBasket', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockUseLayoutType.mockReturnValue('desktop');
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
    mockUseSession.mockReturnValue(mockSessionWithoutProvider);

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

  it('should show error notification when currentProvider is null', () => {
    mockUseSession.mockReturnValue(mockSessionWithoutProvider);

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

    expect(screen.getByText('Current user is not a provider')).toBeInTheDocument();
    expect(
      screen.getByText('A provider account is required to place orders. Please contact your system administrator.'),
    ).toBeInTheDocument();
  });

  it('should disable Sign and close button when currentProvider is null', () => {
    mockUseSession.mockReturnValue(mockSessionWithoutProvider);

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

    const signAndCloseButton = screen.getByRole('button', { name: /sign and close/i });
    expect(signAndCloseButton).toBeDisabled();
  });

  it('should render normally when currentProvider exists', () => {
    mockUseSession.mockReturnValue(mockSessionWithProvider);

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
    expect(screen.queryByText('Current user is not a provider')).not.toBeInTheDocument();
  });

  it('should not crash when accessing currentProvider.uuid in useEffect when provider exists', () => {
    mockUseSession.mockReturnValue(mockSessionWithProvider);
    mockUseConfig.mockReturnValue({
      ...defaultMockConfig,
      ordererProviderRoles: ['Clinician'],
    });
    mockUseProviders.mockReturnValue({
      providers: [
        {
          uuid: 'provider-uuid-123',
          person: { uuid: 'person-uuid-123', display: 'Dr. Test Provider' },
        } as any,
      ],
      isLoading: false,
      error: null,
    } as any);

    expect(() => {
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
    }).not.toThrow();
  });

  it('should not crash when accessing currentProvider.uuid in useEffect when provider is null', () => {
    mockUseSession.mockReturnValue(mockSessionWithoutProvider);
    mockUseConfig.mockReturnValue({
      ...defaultMockConfig,
      ordererProviderRoles: ['Clinician'],
    });
    mockUseProviders.mockReturnValue({
      providers: [
        {
          uuid: 'some-provider-uuid',
          person: { uuid: 'some-person-uuid', display: 'Some Provider' },
        } as any,
      ],
      isLoading: false,
      error: null,
    } as any);

    expect(() => {
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
    }).not.toThrow();
  });
});
