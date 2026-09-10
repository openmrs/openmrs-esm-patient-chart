import React from 'react';
import { vi, describe, it, expect, beforeEach, type Mock } from 'vitest';
import type * as EsmExpressionEvaluator from '@openmrs/esm-expression-evaluator';
import type * as Api from '../api';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor } from '@testing-library/react';
import { getDefaultsFromConfigSchema, openmrsFetch, useConfig, useLayoutType } from '@openmrs/esm-framework';
import { useOrderBasket, useOrderType, useMutatePatientOrders } from '@openmrs/esm-patient-common-lib';
import { mockFhirPatient } from '__mocks__';
import { configSchema, type ConfigObject } from '../../config-schema';
import { useOrderReasons } from '../api';
import { LabOrderForm } from './test-order-form.component';

vi.mock('@openmrs/esm-framework', async () => {
  const { evaluateAsBooleanAsync } = await vi.importActual<typeof EsmExpressionEvaluator>(
    '@openmrs/esm-expression-evaluator',
  );
  return {
    ...(await vi.importActual('@openmrs/esm-framework')),
    evaluateAsBooleanAsync,
    openmrsFetch: vi.fn(),
  };
});

vi.mock('../api', async () => {
  const actual = await vi.importActual<typeof Api>('../api');
  return {
    ...actual,
    prepTestOrderPostData: vi.fn(),
    useOrderReasons: vi.fn(actual.useOrderReasons),
  };
});

vi.mock('@openmrs/esm-patient-common-lib', async () => ({
  ...(await vi.importActual('@openmrs/esm-patient-common-lib')),
  useOrderBasket: vi.fn(),
  useOrderType: vi.fn(),
  useMutatePatientOrders: vi.fn(),
}));

const mockOpenmrsFetch = vi.mocked(openmrsFetch);
const mockUseConfig = vi.mocked(useConfig<ConfigObject>);
const mockUseLayoutType = vi.mocked(useLayoutType);
const mockUseOrderReasons = vi.mocked(useOrderReasons);
const mockUseOrderBasket = useOrderBasket as Mock;
const mockUseOrderType = useOrderType as Mock;
const mockUseMutatePatientOrders = useMutatePatientOrders as Mock;

const HIV_VIRAL_LOAD_UUID = '856AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';

const testType = { conceptUuid: 'test-concept-uuid', label: 'CD4 COUNT' };

const defaultProps = {
  closeWorkspace: vi.fn(),
  initialOrder: {
    action: 'NEW' as const,
    urgency: 'ROUTINE' as const,
    display: 'CD4 COUNT',
    testType,
    visit: null,
  },
  onCancel: vi.fn(),
  orderTypeUuid: 'test-order-type-uuid',
  orderableConceptSets: [],
  setHasUnsavedChanges: vi.fn(),
  patient: mockFhirPatient,
};

function renderLabOrderForm(props = {}) {
  return render(<LabOrderForm {...defaultProps} {...props} />);
}

describe('LabOrderForm', () => {
  beforeEach(() => {
    mockUseLayoutType.mockReturnValue('small-desktop');
    mockUseConfig.mockReturnValue({
      ...getDefaultsFromConfigSchema(configSchema),
      showReferenceNumberField: true,
      labTestsWithOrderReasons: [
        {
          labTestUuid: testType.conceptUuid,
          required: false,
          orderReasons: [],
        },
      ],
    });
    mockUseOrderBasket.mockReturnValue({ orders: [], setOrders: vi.fn(), clearOrders: vi.fn() });
    mockUseOrderType.mockReturnValue({ orderType: { display: 'Test order' } });
    mockUseMutatePatientOrders.mockReturnValue({ mutate: vi.fn() });
    mockUseOrderReasons.mockReturnValue({ orderReasons: [], isLoading: false });
  });

  it('does not show the order reason field when all reasons are hidden by expression', () => {
    mockUseOrderReasons.mockReturnValue({ orderReasons: [], isLoading: false });

    renderLabOrderForm();

    expect(screen.queryByRole('combobox', { name: /order reason/i })).not.toBeInTheDocument();
  });

  it('shows the order reason field when reasons are visible', () => {
    mockUseOrderReasons.mockReturnValue({
      orderReasons: [
        { uuid: 'reason-uuid-1', display: 'Routine screening' },
        { uuid: 'reason-uuid-2', display: 'Follow-up' },
      ],
      isLoading: false,
    });

    renderLabOrderForm();

    expect(screen.getByRole('combobox', { name: /order reason/i })).toBeInTheDocument();
  });

  it('shows both visible order reasons in the dropdown', async () => {
    const user = userEvent.setup();
    mockUseOrderReasons.mockReturnValue({
      orderReasons: [
        { uuid: 'reason-uuid-1', display: 'Routine screening' },
        { uuid: 'reason-uuid-2', display: 'Follow-up' },
      ],
      isLoading: false,
    });

    renderLabOrderForm();

    const combobox = screen.getByRole('combobox', { name: /order reason/i });
    await user.click(combobox);

    expect(screen.getByText('Routine screening')).toBeInTheDocument();
    expect(screen.getByText('Follow-up')).toBeInTheDocument();
  });

  it('submits the selected order reason', async () => {
    const user = userEvent.setup();
    const mockSetOrders = vi.fn();
    mockUseOrderBasket.mockReturnValue({ orders: [], setOrders: mockSetOrders, clearOrders: vi.fn() });
    mockUseOrderReasons.mockReturnValue({
      orderReasons: [{ uuid: 'reason-uuid-1', display: 'Routine screening' }],
      isLoading: false,
    });

    renderLabOrderForm();

    const combobox = screen.getByRole('combobox', { name: /order reason/i });
    await user.click(combobox);
    await user.click(screen.getByText('Routine screening'));

    await user.click(screen.getByRole('button', { name: /save order/i }));

    await waitFor(() =>
      expect(mockSetOrders).toHaveBeenCalledWith([expect.objectContaining({ orderReason: 'reason-uuid-1' })]),
    );
  });

  it('shows validation error when order reason is required but not selected', async () => {
    const user = userEvent.setup();
    mockUseConfig.mockReturnValue({
      ...getDefaultsFromConfigSchema(configSchema),
      showReferenceNumberField: true,
      labTestsWithOrderReasons: [
        {
          labTestUuid: testType.conceptUuid,
          required: true,
          orderReasons: [],
        },
      ],
    });
    mockUseOrderReasons.mockReturnValue({
      orderReasons: [{ uuid: 'reason-uuid-1', display: 'Routine screening' }],
      isLoading: false,
    });

    renderLabOrderForm();

    await user.click(screen.getByRole('button', { name: /save order/i }));

    await screen.findByText(/order reason is required/i);
  });

  it('allows saving when required:true but every reason is hidden by expression', async () => {
    const user = userEvent.setup();
    const mockSetOrders = vi.fn();
    mockUseOrderBasket.mockReturnValue({ orders: [], setOrders: mockSetOrders, clearOrders: vi.fn() });
    const actual = await vi.importActual<typeof Api>('../api');
    mockUseOrderReasons.mockImplementation(actual.useOrderReasons);

    mockUseConfig.mockReturnValue({
      ...getDefaultsFromConfigSchema(configSchema),
      showReferenceNumberField: true,
      labTestsWithOrderReasons: [
        {
          labTestUuid: testType.conceptUuid,
          required: true,
          orderReasons: [{ conceptUuid: 'reason-uuid-1', hideWhenExpression: 'true' }],
        },
      ],
    });

    // conceptreferences is never reached because the visible list is empty
    mockOpenmrsFetch.mockResolvedValue({ data: {} } as any);

    renderLabOrderForm();

    // No combobox — all reasons are hidden
    await waitFor(() => {
      expect(screen.queryByRole('combobox', { name: /order reason/i })).not.toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /save order/i }));

    // Form submits; no "Order reason is required" blocking error
    await waitFor(() => expect(mockSetOrders).toHaveBeenCalled());
    expect(screen.queryByText(/order reason is required/i)).not.toBeInTheDocument();
  });

  it('hides the order reason field when only one reason exists but is hidden by expression', async () => {
    const actual = await vi.importActual<typeof Api>('../api');
    mockUseOrderReasons.mockImplementation(actual.useOrderReasons);

    mockUseConfig.mockReturnValue({
      ...getDefaultsFromConfigSchema(configSchema),
      showReferenceNumberField: true,
      labTestsWithOrderReasons: [
        {
          labTestUuid: testType.conceptUuid,
          required: false,
          orderReasons: [{ conceptUuid: 'reason-uuid-1', hideWhenExpression: "patient.gender === 'male'" }],
        },
      ],
    });

    mockOpenmrsFetch.mockResolvedValue({ data: {} } as any);

    renderLabOrderForm();

    await waitFor(() => {
      expect(screen.queryByRole('combobox', { name: /order reason/i })).not.toBeInTheDocument();
    });
  });

  describe('order reasons with patient-conditional hideWhenExpression', () => {
    const conceptsMap: Record<string, { uuid: string; display: string }> = {
      '1259AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA': { uuid: '1259AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', display: 'Reason A' },
      '163718AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA': {
        uuid: '163718AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
        display: 'Female-only reason 1',
      },
      'f87f344a-62de-45ac-9cc0-b5bed81c289e': {
        uuid: 'f87f344a-62de-45ac-9cc0-b5bed81c289e',
        display: 'Female-only reason 2',
      },
      'bb9780b3-4f44-42fd-9e94-3958d36d106f': { uuid: 'bb9780b3-4f44-42fd-9e94-3958d36d106f', display: 'Reason D' },
      '167391AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA': { uuid: '167391AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', display: 'Reason E' },
      'e299c5c6-5dc7-4977-9b9a-516252d4d582': { uuid: 'e299c5c6-5dc7-4977-9b9a-516252d4d582', display: 'Reason F' },
    };

    const femalePatient: fhir.Patient = { resourceType: 'Patient', id: 'female-patient-uuid', gender: 'female' };
    const malePatient: fhir.Patient = { resourceType: 'Patient', id: 'male-patient-uuid', gender: 'male' };

    const hivViralLoadTestType = { conceptUuid: HIV_VIRAL_LOAD_UUID, label: 'HIV VIRAL LOAD' };

    const hivInitialOrder = {
      action: 'NEW' as const,
      urgency: 'ROUTINE' as const,
      display: 'HIV VIRAL LOAD',
      testType: hivViralLoadTestType,
      visit: null,
    };

    beforeEach(async () => {
      const actual = await vi.importActual<typeof Api>('../api');
      mockUseOrderReasons.mockImplementation(actual.useOrderReasons);

      mockUseConfig.mockReturnValue({
        ...getDefaultsFromConfigSchema(configSchema),
        showReferenceNumberField: true,
        labTestsWithOrderReasons: [
          {
            labTestUuid: HIV_VIRAL_LOAD_UUID,
            required: true,
            orderReasons: [
              '1259AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
              { conceptUuid: '163718AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', hideWhenExpression: "patient.gender === 'male'" },
              { conceptUuid: 'f87f344a-62de-45ac-9cc0-b5bed81c289e', hideWhenExpression: "patient.gender === 'male'" },
              'bb9780b3-4f44-42fd-9e94-3958d36d106f',
              '167391AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
              'e299c5c6-5dc7-4977-9b9a-516252d4d582',
            ],
          },
        ],
      });

      mockOpenmrsFetch.mockImplementation(async (url: string, options?: any) => {
        if (url.includes('conceptreferences')) {
          const refs: string[] = options?.body?.references ?? [];
          const data = Object.fromEntries(
            refs.filter((uuid) => conceptsMap[uuid]).map((uuid) => [uuid, conceptsMap[uuid]]),
          );
          return { data } as any;
        }
        return { data: {} } as any;
      });
    });

    it('shows all 6 reasons for a female patient', async () => {
      const user = userEvent.setup();

      render(<LabOrderForm {...defaultProps} initialOrder={hivInitialOrder} patient={femalePatient} />);

      await screen.findByRole('combobox', { name: /order reason/i });

      await user.click(screen.getByRole('combobox', { name: /order reason/i }));

      Object.values(conceptsMap).forEach(({ display }) => expect(screen.getByText(display)).toBeInTheDocument());
    });

    it('shows only 4 reasons for a male patient (gender-hidden concepts excluded)', async () => {
      const user = userEvent.setup();

      render(<LabOrderForm {...defaultProps} initialOrder={hivInitialOrder} patient={malePatient} />);

      await screen.findByRole('combobox', { name: /order reason/i });

      await user.click(screen.getByRole('combobox', { name: /order reason/i }));

      expect(screen.getByText('Reason A')).toBeInTheDocument();
      expect(screen.getByText('Reason D')).toBeInTheDocument();
      expect(screen.getByText('Reason E')).toBeInTheDocument();
      expect(screen.getByText('Reason F')).toBeInTheDocument();
      expect(screen.queryByText('Female-only reason 1')).not.toBeInTheDocument();
      expect(screen.queryByText('Female-only reason 2')).not.toBeInTheDocument();
    });

    it('allows selecting one of the 4 male-visible reasons and saving', async () => {
      const user = userEvent.setup();
      const mockSetOrders = vi.fn();
      mockUseOrderBasket.mockReturnValue({ orders: [], setOrders: mockSetOrders, clearOrders: vi.fn() });

      render(<LabOrderForm {...defaultProps} initialOrder={hivInitialOrder} patient={malePatient} />);

      await screen.findByRole('combobox', { name: /order reason/i });

      await user.click(screen.getByRole('combobox', { name: /order reason/i }));
      await user.click(screen.getByText('Reason D'));
      await user.click(screen.getByRole('button', { name: /save order/i }));

      await waitFor(() =>
        expect(mockSetOrders).toHaveBeenCalledWith([
          expect.objectContaining({ orderReason: 'bb9780b3-4f44-42fd-9e94-3958d36d106f' }),
        ]),
      );
    });

    it('shows required validation error when no reason is selected for HIV Viral Load', async () => {
      const user = userEvent.setup();

      render(<LabOrderForm {...defaultProps} initialOrder={hivInitialOrder} patient={malePatient} />);

      await screen.findByRole('combobox', { name: /order reason/i });

      await user.click(screen.getByRole('button', { name: /save order/i }));

      await screen.findByText(/order reason is required/i);
    });
  });
});
