import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  type LayoutType,
  useSession,
  useConfig,
  useLayoutType,
  useOpenmrsFetchAll,
  userHasAccess,
} from '@openmrs/esm-framework';
import {
  PRIVILEGE_EDIT_ENCOUNTERS_ON_BEHALF_OF_OTHERS,
  useOrderBasket,
  useMutatePatientOrders,
} from '@openmrs/esm-patient-common-lib';
import { mockSessionDataResponse } from '__mocks__';
import { useOrderEncounterForSystemWithVisitDisabled } from '../api/api';
import OrderBasket from './order-basket.component';

const mockUseSession = vi.mocked(useSession);
const mockUseConfig = vi.mocked(useConfig);
const mockUseLayoutType = vi.mocked(useLayoutType);
const mockUseOrderBasket = vi.mocked(useOrderBasket);
const mockUseMutatePatientOrders = vi.mocked(useMutatePatientOrders);
const mockUseOrderEncounterForSystemWithVisitDisabled = vi.mocked(useOrderEncounterForSystemWithVisitDisabled);

vi.mock('@openmrs/esm-patient-common-lib', async () => ({
  ...((await vi.importActual('@openmrs/esm-patient-common-lib')) as object),
  useOrderBasket: vi.fn(),
  useMutatePatientOrders: vi.fn(),
}));

vi.mock('../api/api', () => ({
  useOrderEncounterForSystemWithVisitDisabled: vi.fn(),
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
  });

  it('should render without crashing when currentProvider is null', () => {
    mockUseSession.mockReturnValue({ ...mockSessionDataResponse.data, currentProvider: null } as any);

    render(
      <OrderBasket
        patientUuid={mockPatientUuid}
        patient={mockPatient}
        visitContext={mockVisitContext}
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
        closeWorkspace={mockCloseWorkspace}
        orderBasketExtensionProps={mockOrderBasketExtensionProps}
      />,
    );

    expect(screen.getByText('Order Basket')).toBeInTheDocument();
  });

  describe('orderer and encounter date', () => {
    const renderOrderBasket = () =>
      render(
        <OrderBasket
          patientUuid={mockPatientUuid}
          patient={mockPatient}
          visitContext={mockVisitContext}
          closeWorkspace={mockCloseWorkspace}
          orderBasketExtensionProps={mockOrderBasketExtensionProps}
        />,
      );

    beforeEach(() => {
      mockUseSession.mockReturnValue(mockSessionDataResponse.data as any);
      vi.mocked(useOpenmrsFetchAll).mockReturnValue({
        data: [{ uuid: 'provider-uuid', person: { display: 'Some Clinician' } }],
        isLoading: false,
        error: undefined,
      } as any);
    });

    it('does not offer choosing the orderer without the privilege to act on behalf of others', () => {
      vi.mocked(userHasAccess).mockReturnValue(false);
      renderOrderBasket();

      expect(screen.queryByRole('combobox', { name: /orderer/i })).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign and close/i })).toBeInTheDocument();
    });

    it('offers choosing the orderer with the privilege to act on behalf of others, limited to the configured roles', () => {
      vi.mocked(userHasAccess).mockImplementation(
        (privilege) => privilege === PRIVILEGE_EDIT_ENCOUNTERS_ON_BEHALF_OF_OTHERS,
      );
      mockUseConfig.mockReturnValue({ ...defaultMockConfig, ordererProviderRoles: ['role-uuid'] });
      renderOrderBasket();

      expect(screen.getByRole('combobox', { name: /orderer/i })).toBeInTheDocument();
      expect(vi.mocked(useOpenmrsFetchAll)).toHaveBeenCalledWith(expect.stringContaining('providerRoles=role-uuid'));
    });

    it('offers backdating the order encounter within the active visit', () => {
      vi.mocked(userHasAccess).mockReturnValue(false);
      renderOrderBasket();

      expect(screen.getByRole('tab', { name: /^now$/i })).toBeInTheDocument();
    });
  });
});
