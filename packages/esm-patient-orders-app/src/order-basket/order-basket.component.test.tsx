import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type LayoutType, useSession, useConfig, useLayoutType } from '@openmrs/esm-framework';
import {
  type OrderBasketItem,
  postOrders,
  postOrdersOnNewEncounter,
  setOrderBasketItemErrors,
  useOrderBasket,
  useMutatePatientOrders,
} from '@openmrs/esm-patient-common-lib';
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
const mockPostOrders = vi.mocked(postOrders);
const mockPostOrdersOnNewEncounter = vi.mocked(postOrdersOnNewEncounter);
const mockSetOrderBasketItemErrors = vi.mocked(setOrderBasketItemErrors);

vi.mock('@openmrs/esm-patient-common-lib', async () => ({
  ...((await vi.importActual('@openmrs/esm-patient-common-lib')) as object),
  useOrderBasket: vi.fn(),
  useMutatePatientOrders: vi.fn(),
  postOrders: vi.fn(),
  postOrdersOnNewEncounter: vi.fn(),
  setOrderBasketItemErrors: vi.fn(),
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

  it('shows why signing failed and marks the orders as failed when the server rejects them', async () => {
    const user = userEvent.setup();
    const aspirinOrder = { action: 'NEW', display: 'Aspirin' } as OrderBasketItem;
    const forbiddenError = Object.assign(new Error('Forbidden'), {
      response: { status: 403 },
      responseBody: { error: { message: 'Privileges required: Add Orders' } },
    });
    mockUseSession.mockReturnValue(mockSessionDataResponse.data as any);
    mockUseOrderBasket.mockReturnValue({
      orders: [aspirinOrder],
      clearOrders: vi.fn(),
      setOrders: vi.fn(),
    } as any);
    mockPostOrdersOnNewEncounter.mockRejectedValue(forbiddenError);

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

    await user.click(screen.getByRole('button', { name: /sign and close/i }));

    expect(await screen.findByText("Couldn't sign orders")).toBeInTheDocument();
    expect(screen.getByText('Privileges required: Add Orders')).toBeInTheDocument();
    expect(screen.queryByText('Please try launching the workspace again')).not.toBeInTheDocument();
    expect(mockCloseWorkspace).not.toHaveBeenCalled();

    const getOrderError = mockSetOrderBasketItemErrors.mock.calls.at(-1)[1];
    expect(mockSetOrderBasketItemErrors).toHaveBeenLastCalledWith(mockPatientUuid, expect.any(Function));
    expect(getOrderError(aspirinOrder)).toBe(forbiddenError);
  });

  it('only marks the order that failed when another order in the basket has the same name', async () => {
    const user = userEvent.setup();
    const signedOrder = { action: 'NEW', display: 'Malaria test', concept: { uuid: 'concept-1' } } as OrderBasketItem;
    const rejectedOrder = { action: 'NEW', display: 'Malaria test', concept: { uuid: 'concept-2' } } as OrderBasketItem;
    const forbiddenError = Object.assign(new Error('Forbidden'), {
      responseBody: { error: { message: 'Privileges required: Add Orders' } },
    });
    const mockClearOrders = vi.fn();
    mockUseSession.mockReturnValue(mockSessionDataResponse.data as any);
    mockUseOrderBasket.mockReturnValue({
      orders: [signedOrder, rejectedOrder],
      clearOrders: mockClearOrders,
      setOrders: vi.fn(),
    } as any);
    mockUseOrderEncounterForSystemWithVisitDisabled.mockReturnValue({
      visitRequired: false,
      isLoading: false,
      encounterUuid: 'order-encounter-uuid',
      error: null,
      mutate: vi.fn(),
    } as any);
    mockPostOrders.mockResolvedValue({
      postedOrders: [],
      postedItems: [signedOrder],
      erroredItems: [{ ...rejectedOrder, orderError: forbiddenError }],
    });

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

    await user.click(screen.getByRole('button', { name: /sign and close/i }));
    await waitFor(() => expect(mockSetOrderBasketItemErrors).toHaveBeenCalledTimes(2));

    const { exceptThoseMatching } = mockClearOrders.mock.calls.at(-1)[0];
    expect(exceptThoseMatching(signedOrder)).toBe(false);
    expect(exceptThoseMatching(rejectedOrder)).toBe(true);

    const getOrderError = mockSetOrderBasketItemErrors.mock.calls.at(-1)[1];
    expect(getOrderError(signedOrder)).toBeUndefined();
    expect(getOrderError(rejectedOrder)).toBe(forbiddenError);
  });

  it('keeps orders that were edited while they were being signed', async () => {
    const user = userEvent.setup();
    const signedOrder = { action: 'NEW', display: 'Aspirin', instructions: 'with food' } as OrderBasketItem;
    const rejectedOrder = { action: 'NEW', display: 'Malaria test', urgency: 'ROUTINE' } as OrderBasketItem;
    const forbiddenError = Object.assign(new Error('Forbidden'), {
      responseBody: { error: { message: 'Privileges required: Add Orders' } },
    });
    const mockClearOrders = vi.fn();
    mockUseSession.mockReturnValue(mockSessionDataResponse.data as any);
    mockUseOrderBasket.mockReturnValue({
      orders: [signedOrder, rejectedOrder],
      clearOrders: mockClearOrders,
      setOrders: vi.fn(),
    } as any);
    mockUseOrderEncounterForSystemWithVisitDisabled.mockReturnValue({
      visitRequired: false,
      isLoading: false,
      encounterUuid: 'order-encounter-uuid',
      error: null,
      mutate: vi.fn(),
    } as any);
    mockPostOrders.mockResolvedValue({
      postedOrders: [],
      postedItems: [signedOrder],
      erroredItems: [{ ...rejectedOrder, orderError: forbiddenError }],
    });

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

    await user.click(screen.getByRole('button', { name: /sign and close/i }));
    await waitFor(() => expect(mockSetOrderBasketItemErrors).toHaveBeenCalledTimes(2));

    // Saving an edit replaces the basket item with a new object, so these are not the items that were sent.
    const editedSignedOrder = { ...signedOrder, instructions: 'after food' };
    const editedRejectedOrder = { ...rejectedOrder, urgency: 'STAT' } as OrderBasketItem;
    const { exceptThoseMatching } = mockClearOrders.mock.calls.at(-1)[0];
    expect(exceptThoseMatching(signedOrder)).toBe(false);
    expect(exceptThoseMatching(rejectedOrder)).toBe(true);
    expect(exceptThoseMatching(editedSignedOrder)).toBe(true);
    expect(exceptThoseMatching(editedRejectedOrder)).toBe(true);
  });
});
