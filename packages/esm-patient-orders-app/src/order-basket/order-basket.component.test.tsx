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

  it('should show error notification when currentProvider is null and delegated ordering is not configured', () => {
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

    expect(screen.getByText('Cannot place orders')).toBeInTheDocument();
    expect(
      screen.getByText('Your account is not associated with a provider. Contact your administrator.'),
    ).toBeInTheDocument();
  });

  it('should disable Sign and close button when currentProvider is null and delegated ordering is not configured', () => {
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

    const signAndCloseButton = screen.getByRole('button', { name: /sign and close/i });
    expect(signAndCloseButton).toBeDisabled();
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
    expect(screen.queryByText('Cannot place orders')).not.toBeInTheDocument();
  });

  it('should not crash when provider exists and ordererProviderRoles is configured', () => {
    mockUseSession.mockReturnValue(mockSessionDataResponse.data as any);
    mockUseConfig.mockReturnValue({
      ...defaultMockConfig,
      ordererProviderRoles: ['Clinician'],
    });
    mockUseProviders.mockReturnValue({
      providers: [
        {
          uuid: mockSessionDataResponse.data.currentProvider.uuid,
          person: mockSessionDataResponse.data.currentProvider.person,
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

  it('should not crash and not show "Cannot place orders" when currentProvider is null but ordererProviderRoles is configured', () => {
    mockUseSession.mockReturnValue({ ...mockSessionDataResponse.data, currentProvider: null } as any);
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

    // canPlaceOrders is true because allowSelectingOrderer is true — no error shown
    expect(screen.queryByText('Cannot place orders')).not.toBeInTheDocument();
    // Info hint to select an orderer is shown instead
    expect(screen.getByText('Select an orderer')).toBeInTheDocument();
    expect(screen.getByText('Please select a prescribing clinician from the dropdown.')).toBeInTheDocument();
  });

  it('should show "Select an orderer" info notification when allowSelectingOrderer is true and no orderer selected', () => {
    mockUseSession.mockReturnValue(mockSessionDataResponse.data as any);
    mockUseConfig.mockReturnValue({
      ...defaultMockConfig,
      ordererProviderRoles: ['Clinician'],
    });
    // Providers list is empty so orderer cannot be auto-set
    mockUseProviders.mockReturnValue({
      providers: [],
      isLoading: false,
      error: null,
    } as any);

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

    expect(screen.getByText('Select an orderer')).toBeInTheDocument();
    expect(screen.getByText('Please select a prescribing clinician from the dropdown.')).toBeInTheDocument();
    expect(screen.queryByText('Cannot place orders')).not.toBeInTheDocument();
  });
});
