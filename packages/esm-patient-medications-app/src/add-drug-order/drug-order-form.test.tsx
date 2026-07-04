import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { getDefaultsFromConfigSchema, OpenmrsDatePicker, useConfig, useSession } from '@openmrs/esm-framework';
import { type DrugOrderBasketItem } from '@openmrs/esm-patient-common-lib';
import { mockPatient } from 'tools';
import { mockDrugSearchResultApiData, mockSessionDataResponse } from '__mocks__';
import { configSchema, type ConfigObject } from '../config-schema';
import { getTemplateOrderBasketItem } from './drug-search/drug-search.resource';
import DrugOrderForm, { getOrderStartDateForSubmission } from './drug-order-form.component';

const mockUseConfig = vi.mocked(useConfig<ConfigObject>);
const mockUseSession = vi.mocked(useSession);
const mockOpenmrsDatePicker = vi.mocked(OpenmrsDatePicker);
const mockUseMedicationOrders = vi.fn().mockReturnValue({
  futureOrders: [],
  activeOrders: [],
  pastOrders: [],
  error: null,
  isLoading: false,
  isValidating: false,
});
const mockUseRequireOutpatientQuantity = vi.fn().mockReturnValue({
  requireOutpatientQuantity: true,
  error: null,
  isLoading: false,
});

mockUseConfig.mockReturnValue(getDefaultsFromConfigSchema(configSchema) as ConfigObject);
mockUseSession.mockReturnValue(mockSessionDataResponse.data);

vi.mock('../api/order-config', () => ({
  useOrderConfig: vi.fn().mockReturnValue({
    orderConfigObject: {
      drugRoutes: [{ valueCoded: '160240AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', value: 'Oral' }],
      drugDosingUnits: [{ valueCoded: '1513AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', value: 'Tablet' }],
      drugDispensingUnits: [
        { valueCoded: '1513AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', value: 'Tablet' },
        { valueCoded: '162376AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', value: 'Application' },
      ],
      durationUnits: [
        { valueCoded: '1072AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', value: 'Days' },
        { valueCoded: '1073AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', value: 'Weeks' },
      ],
      orderFrequencies: [
        { valueCoded: 'once-daily-uuid', value: 'Once daily', frequencyPerDay: 1.0, names: ['OD', 'Once daily'] },
        { valueCoded: 'twice-daily-uuid', value: 'Twice daily', frequencyPerDay: 2.0, names: ['BD', 'Twice daily'] },
      ],
    },
    isLoading: false,
    error: null,
  }),
}));

vi.mock('../api', async () => ({
  ...((await vi.importActual('../api')) as object),
  useMedicationOrders: () => mockUseMedicationOrders(),
  useRequireOutpatientQuantity: () => mockUseRequireOutpatientQuantity(),
}));

function renderDrugOrderForm(initialOrderBasketItem: DrugOrderBasketItem, onSave = vi.fn()) {
  return render(
    <DrugOrderForm
      initialOrderBasketItem={initialOrderBasketItem}
      patient={mockPatient}
      visitContext={null}
      onSave={onSave}
      saveButtonText="Save order"
      onCancel={vi.fn()}
      workspaceTitle="Add drug order"
    />,
  );
}

function createNewOrderBasketItem(overrides?: Partial<DrugOrderBasketItem>): DrugOrderBasketItem {
  const base = getTemplateOrderBasketItem(mockDrugSearchResultApiData[0], null);
  return {
    ...base,
    pillsDispensed: null,
    quantityUnits: null,
    ...overrides,
  } as DrugOrderBasketItem;
}

const completeMedicationOrderFields: Partial<DrugOrderBasketItem> = {
  dosage: 1,
  unit: { valueCoded: '1513AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', value: 'Tablet' },
  route: { valueCoded: '160240AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', value: 'Oral' },
  frequency: { valueCoded: 'once-daily-uuid', value: 'Once daily', frequencyPerDay: 1 },
  duration: 7,
  durationUnit: { valueCoded: '1072AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', value: 'Days' },
  indication: 'Pain',
  pillsDispensed: 7,
  quantityUnits: { valueCoded: '1513AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', value: 'Tablet' },
  numRefills: 0,
};

function getDateFromToday(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(0, 0, 0, 0);
  return date;
}

function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function toDatePickerInputValue(value: unknown) {
  if (value instanceof Date) {
    return toDateInputValue(value);
  }
  if (typeof value === 'string' || typeof value === 'number') {
    return toDateInputValue(new Date(value));
  }
  return '';
}

describe('DrugOrderForm - auto-calculation of dispense quantity', () => {
  beforeEach(() => {
    mockOpenmrsDatePicker.mockImplementation(({ id, labelText, value, onChange, invalid, invalidText }) => (
      <>
        <label htmlFor={id}>{labelText}</label>
        <input
          id={id}
          type="text"
          value={toDatePickerInputValue(value)}
          aria-invalid={invalid ? 'true' : undefined}
          onChange={(evt) => onChange?.(new Date(`${evt.target.value}T00:00:00`))}
        />
        {invalid ? <span>{invalidText}</span> : null}
      </>
    ));
    mockUseMedicationOrders.mockReturnValue({
      futureOrders: [],
      activeOrders: [],
      pastOrders: [],
      error: null,
      isLoading: false,
      isValidating: false,
    });
    mockUseRequireOutpatientQuantity.mockReturnValue({
      requireOutpatientQuantity: true,
      error: null,
      isLoading: false,
    });
  });

  it('snaps same-day date-only start dates to the current wall-clock time before saving', () => {
    const selectedDate = new Date('2026-05-21T00:00:00.000Z');
    const now = new Date('2026-05-21T12:34:56.000Z');

    expect(getOrderStartDateForSubmission(selectedDate, undefined, now)).toBe(now);
  });

  it('keeps applying the minimum start date after snapping same-day start dates', () => {
    const selectedDate = new Date('2026-05-21T00:00:00.000Z');
    const now = new Date('2026-05-21T12:34:56.000Z');
    const startDateMin = new Date('2026-05-21T13:00:00.000Z');

    expect(getOrderStartDateForSubmission(selectedDate, startDateMin, now)).toBe(startDateMin);
  });

  it('auto-calculates quantity when dose, frequency, and duration are filled', async () => {
    const user = userEvent.setup();
    renderDrugOrderForm(createNewOrderBasketItem());

    const doseInput = screen.getByRole('spinbutton', { name: /dose/i });
    await user.clear(doseInput);
    await user.type(doseInput, '1');

    const frequencyCombobox = screen.getByRole('combobox', { name: /frequency/i });
    await user.click(frequencyCombobox);
    await user.click(screen.getByText('Twice daily'));

    const durationInput = screen.getByRole('spinbutton', { name: /duration/i });
    await user.clear(durationInput);
    await user.type(durationInput, '7');

    const durationUnitCombobox = screen.getByRole('combobox', { name: /duration unit/i });
    await user.click(durationUnitCombobox);
    await user.click(screen.getByText('Days'));

    await waitFor(() => {
      const quantityInput = screen.getByRole('spinbutton', { name: /quantity to dispense/i });
      expect(quantityInput).toHaveValue(14);
    });
    expect(screen.getByText(/auto-calculated/i)).toBeInTheDocument();
  });

  it('auto-calculates with weekly duration units', async () => {
    const user = userEvent.setup();
    renderDrugOrderForm(createNewOrderBasketItem());

    const doseInput = screen.getByRole('spinbutton', { name: /dose/i });
    await user.clear(doseInput);
    await user.type(doseInput, '3');

    const frequencyCombobox = screen.getByRole('combobox', { name: /frequency/i });
    await user.click(frequencyCombobox);
    await user.click(screen.getByText('Twice daily'));

    const durationInput = screen.getByRole('spinbutton', { name: /duration/i });
    await user.clear(durationInput);
    await user.type(durationInput, '1');

    const durationUnitCombobox = screen.getByRole('combobox', { name: /duration unit/i });
    await user.click(durationUnitCombobox);
    await user.click(screen.getByText('Weeks'));

    // 3 × 2.0 × 7 = 42
    await waitFor(() => {
      const quantityInput = screen.getByRole('spinbutton', { name: /quantity to dispense/i });
      expect(quantityInput).toHaveValue(42);
    });
  });

  it('clears quantity when a required input is removed', async () => {
    const user = userEvent.setup();
    renderDrugOrderForm(createNewOrderBasketItem());

    // Fill all inputs
    const doseInput = screen.getByRole('spinbutton', { name: /dose/i });
    await user.clear(doseInput);
    await user.type(doseInput, '1');

    const frequencyCombobox = screen.getByRole('combobox', { name: /frequency/i });
    await user.click(frequencyCombobox);
    await user.click(screen.getByText('Twice daily'));

    const durationInput = screen.getByRole('spinbutton', { name: /duration/i });
    await user.clear(durationInput);
    await user.type(durationInput, '7');

    const durationUnitCombobox = screen.getByRole('combobox', { name: /duration unit/i });
    await user.click(durationUnitCombobox);
    await user.click(screen.getByText('Days'));

    await waitFor(() => {
      expect(screen.getByRole('spinbutton', { name: /quantity to dispense/i })).toHaveValue(14);
    });

    // Clear the duration
    await user.clear(durationInput);

    await waitFor(() => {
      expect(screen.getByRole('spinbutton', { name: /quantity to dispense/i })).not.toHaveValue();
    });
  });

  it('does not auto-calculate when PRN is checked', async () => {
    const user = userEvent.setup();
    renderDrugOrderForm(createNewOrderBasketItem());

    // Fill all inputs
    const doseInput = screen.getByRole('spinbutton', { name: /dose/i });
    await user.clear(doseInput);
    await user.type(doseInput, '1');

    const frequencyCombobox = screen.getByRole('combobox', { name: /frequency/i });
    await user.click(frequencyCombobox);
    await user.click(screen.getByText('Twice daily'));

    const durationInput = screen.getByRole('spinbutton', { name: /duration/i });
    await user.clear(durationInput);
    await user.type(durationInput, '7');

    const durationUnitCombobox = screen.getByRole('combobox', { name: /duration unit/i });
    await user.click(durationUnitCombobox);
    await user.click(screen.getByText('Days'));

    await waitFor(() => {
      expect(screen.getByRole('spinbutton', { name: /quantity to dispense/i })).toHaveValue(14);
    });

    // Check PRN
    const prnCheckbox = screen.getByRole('checkbox', { name: /take as needed/i });
    await user.click(prnCheckbox);

    await waitFor(() => {
      expect(screen.getByRole('spinbutton', { name: /quantity to dispense/i })).not.toHaveValue();
    });
    expect(screen.queryByText(/auto-calculated/i)).not.toBeInTheDocument();
  });

  it('does not auto-calculate for free-text dosage', async () => {
    const user = userEvent.setup();
    renderDrugOrderForm(createNewOrderBasketItem());

    // Toggle free-text dosage ON
    const freeTextToggle = screen.getByRole('switch', { name: /free text dosage/i });
    await user.click(freeTextToggle);

    // The quantity input should remain empty
    const quantityInput = screen.getByRole('spinbutton', { name: /quantity to dispense/i });
    expect(quantityInput).not.toHaveValue();
    expect(screen.queryByText(/auto-calculated/i)).not.toBeInTheDocument();
  });

  it('does not auto-calculate when quantity unit differs from dose unit', async () => {
    const user = userEvent.setup();
    renderDrugOrderForm(createNewOrderBasketItem());

    // Fill all inputs
    const doseInput = screen.getByRole('spinbutton', { name: /dose/i });
    await user.clear(doseInput);
    await user.type(doseInput, '1');

    const frequencyCombobox = screen.getByRole('combobox', { name: /frequency/i });
    await user.click(frequencyCombobox);
    await user.click(screen.getByText('Twice daily'));

    const durationInput = screen.getByRole('spinbutton', { name: /duration/i });
    await user.clear(durationInput);
    await user.type(durationInput, '7');

    const durationUnitCombobox = screen.getByRole('combobox', { name: /duration unit/i });
    await user.click(durationUnitCombobox);
    await user.click(screen.getByText('Days'));

    await waitFor(() => {
      expect(screen.getByRole('spinbutton', { name: /quantity to dispense/i })).toHaveValue(14);
    });

    // Change quantity unit to something different from dose unit (Tablet)
    const quantityUnitCombobox = screen.getByRole('combobox', { name: /quantity unit/i });
    await user.clear(quantityUnitCombobox);
    await user.type(quantityUnitCombobox, 'Application');
    await user.click(screen.getByText('Application'));

    await waitFor(() => {
      expect(screen.getByRole('spinbutton', { name: /quantity to dispense/i })).not.toHaveValue();
    });
  });

  it('stops auto-calculating after manual edit and shows recalculate link', async () => {
    const user = userEvent.setup();
    renderDrugOrderForm(createNewOrderBasketItem());

    // Fill all inputs to trigger auto-calc
    const doseInput = screen.getByRole('spinbutton', { name: /dose/i });
    await user.clear(doseInput);
    await user.type(doseInput, '1');

    const frequencyCombobox = screen.getByRole('combobox', { name: /frequency/i });
    await user.click(frequencyCombobox);
    await user.click(screen.getByText('Twice daily'));

    const durationInput = screen.getByRole('spinbutton', { name: /duration/i });
    await user.clear(durationInput);
    await user.type(durationInput, '7');

    const durationUnitCombobox = screen.getByRole('combobox', { name: /duration unit/i });
    await user.click(durationUnitCombobox);
    await user.click(screen.getByText('Days'));

    const quantityInput = screen.getByRole('spinbutton', { name: /quantity to dispense/i });
    await waitFor(() => {
      expect(quantityInput).toHaveValue(14);
    });

    // Manually edit quantity
    await user.clear(quantityInput);
    await user.type(quantityInput, '20');

    await waitFor(() => {
      expect(quantityInput).toHaveValue(20);
    });
    expect(screen.queryByText(/auto-calculated/i)).not.toBeInTheDocument();
    expect(screen.getByText(/apply calculated quantity \(14\)/i)).toBeInTheDocument();
  });

  it('keeps manual override when upstream inputs change', async () => {
    const user = userEvent.setup();
    renderDrugOrderForm(createNewOrderBasketItem());

    // Fill all inputs
    const doseInput = screen.getByRole('spinbutton', { name: /dose/i });
    await user.clear(doseInput);
    await user.type(doseInput, '1');

    const frequencyCombobox = screen.getByRole('combobox', { name: /frequency/i });
    await user.click(frequencyCombobox);
    await user.click(screen.getByText('Twice daily'));

    const durationInput = screen.getByRole('spinbutton', { name: /duration/i });
    await user.clear(durationInput);
    await user.type(durationInput, '7');

    const durationUnitCombobox = screen.getByRole('combobox', { name: /duration unit/i });
    await user.click(durationUnitCombobox);
    await user.click(screen.getByText('Days'));

    const quantityInput = screen.getByRole('spinbutton', { name: /quantity to dispense/i });
    await waitFor(() => {
      expect(quantityInput).toHaveValue(14);
    });

    // Manual edit
    await user.clear(quantityInput);
    await user.type(quantityInput, '20');

    await waitFor(() => {
      expect(quantityInput).toHaveValue(20);
    });

    // Change duration — manual value should be preserved, recalculate link should update
    await user.clear(durationInput);
    await user.type(durationInput, '14');

    // Quantity stays at 20 (manual override is sticky)
    await waitFor(() => {
      expect(quantityInput).toHaveValue(20);
    });
    // Recalculate link shows the would-be value: 1 × 2.0 × 14 = 28
    expect(screen.getByText(/apply calculated quantity \(28\)/i)).toBeInTheDocument();
  });

  it('resumes auto-calculation when recalculate link is clicked', async () => {
    const user = userEvent.setup();
    renderDrugOrderForm(createNewOrderBasketItem());

    // Fill all inputs
    const doseInput = screen.getByRole('spinbutton', { name: /dose/i });
    await user.clear(doseInput);
    await user.type(doseInput, '1');

    const frequencyCombobox = screen.getByRole('combobox', { name: /frequency/i });
    await user.click(frequencyCombobox);
    await user.click(screen.getByText('Twice daily'));

    const durationInput = screen.getByRole('spinbutton', { name: /duration/i });
    await user.clear(durationInput);
    await user.type(durationInput, '7');

    const durationUnitCombobox = screen.getByRole('combobox', { name: /duration unit/i });
    await user.click(durationUnitCombobox);
    await user.click(screen.getByText('Days'));

    const quantityInput = screen.getByRole('spinbutton', { name: /quantity to dispense/i });
    await waitFor(() => {
      expect(quantityInput).toHaveValue(14);
    });

    // Manual edit
    await user.clear(quantityInput);
    await user.type(quantityInput, '20');

    await waitFor(() => {
      expect(quantityInput).toHaveValue(20);
    });

    // Click recalculate
    await user.click(screen.getByText(/apply calculated quantity \(14\)/i));

    await waitFor(() => {
      expect(quantityInput).toHaveValue(14);
    });
    expect(screen.getByText(/auto-calculated/i)).toBeInTheDocument();
    expect(screen.queryByText(/apply calculated quantity/i)).not.toBeInTheDocument();
  });

  it('keeps manual override when quantity field is cleared', async () => {
    const user = userEvent.setup();
    renderDrugOrderForm(createNewOrderBasketItem());

    // Fill all inputs
    const doseInput = screen.getByRole('spinbutton', { name: /dose/i });
    await user.clear(doseInput);
    await user.type(doseInput, '1');

    const frequencyCombobox = screen.getByRole('combobox', { name: /frequency/i });
    await user.click(frequencyCombobox);
    await user.click(screen.getByText('Twice daily'));

    const durationInput = screen.getByRole('spinbutton', { name: /duration/i });
    await user.clear(durationInput);
    await user.type(durationInput, '7');

    const durationUnitCombobox = screen.getByRole('combobox', { name: /duration unit/i });
    await user.click(durationUnitCombobox);
    await user.click(screen.getByText('Days'));

    const quantityInput = screen.getByRole('spinbutton', { name: /quantity to dispense/i });
    await waitFor(() => {
      expect(quantityInput).toHaveValue(14);
    });

    // Manual edit
    await user.clear(quantityInput);
    await user.type(quantityInput, '20');

    await waitFor(() => {
      expect(quantityInput).toHaveValue(20);
    });

    // Clear the quantity field — should stay empty (manual override is sticky)
    await user.clear(quantityInput);

    await waitFor(() => {
      expect(quantityInput).toHaveValue(null);
    });
    expect(screen.getByText(/apply calculated quantity \(14\)/i)).toBeInTheDocument();
  });

  it('stays in auto mode when reopening a NEW basket item with auto-calculated quantity', async () => {
    const user = userEvent.setup();
    // Simulate reopening a saved NEW order that had auto-calculated quantity
    const item = createNewOrderBasketItem({
      pillsDispensed: 14,
      isQuantityManual: false,
      dosage: 1,
      frequency: {
        valueCoded: 'twice-daily-uuid',
        value: 'Twice daily',
        frequencyPerDay: 2.0,
      },
      duration: 7,
      durationUnit: { valueCoded: '1072AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', value: 'Days' },
    });
    renderDrugOrderForm(item);

    const quantityInput = screen.getByRole('spinbutton', { name: /quantity to dispense/i });
    expect(quantityInput).toHaveValue(14);
    expect(screen.getByText(/auto-calculated/i)).toBeInTheDocument();

    // Changing duration should auto-update quantity (not show recalculate link)
    const durationInput = screen.getByRole('spinbutton', { name: /duration/i });
    await user.clear(durationInput);
    await user.type(durationInput, '14');

    // 1 × 2.0 × 14 = 28
    await waitFor(() => {
      expect(quantityInput).toHaveValue(28);
    });
    expect(screen.getByText(/auto-calculated/i)).toBeInTheDocument();
    expect(screen.queryByText(/apply calculated quantity/i)).not.toBeInTheDocument();
  });

  it('preserves quantity for REVISE orders when frequencyPerDay is null', async () => {
    const item = createNewOrderBasketItem({
      action: 'REVISE',
      pillsDispensed: 30,
      frequency: {
        valueCoded: 'some-frequency-uuid',
        value: 'Once daily',
        frequencyPerDay: null,
      },
      dosage: 1,
      unit: { valueCoded: '1513AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', value: 'Tablet' },
      duration: 30,
      durationUnit: { valueCoded: '1072AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', value: 'Days' },
      quantityUnits: { valueCoded: '1513AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', value: 'Tablet' },
    });

    renderDrugOrderForm(item);

    // Quantity is preserved from the existing order until the clinician applies the
    // calculated quantity.
    await waitFor(() => {
      expect(screen.getByRole('spinbutton', { name: /quantity to dispense/i })).toHaveValue(30);
    });
    expect(screen.queryByText(/auto-calculated/i)).not.toBeInTheDocument();
  });

  it.each(['REVISE', 'RENEW'] as const)(
    'uses order config frequencyPerDay to show recalculate link for %s orders',
    async (action) => {
      const user = userEvent.setup();
      const item = createNewOrderBasketItem({
        action,
        pillsDispensed: 5,
        frequency: {
          valueCoded: 'once-daily-uuid',
          value: 'Once daily',
          frequencyPerDay: null,
        },
        dosage: 1,
        unit: { valueCoded: '1513AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', value: 'Tablet' },
        duration: 5,
        durationUnit: { valueCoded: '1072AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', value: 'Days' },
        quantityUnits: { valueCoded: '1513AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', value: 'Tablet' },
      });

      renderDrugOrderForm(item);

      await waitFor(() => {
        expect(screen.getByRole('spinbutton', { name: /quantity to dispense/i })).toHaveValue(5);
      });
      expect(screen.queryByText(/apply calculated quantity/i)).not.toBeInTheDocument();

      const durationInput = screen.getByRole('spinbutton', { name: /duration/i });
      await user.clear(durationInput);
      await user.type(durationInput, '7');

      await waitFor(() => {
        expect(screen.getByRole('spinbutton', { name: /quantity to dispense/i })).toHaveValue(5);
      });
      expect(screen.getByText(/apply calculated quantity \(7\)/i)).toBeInTheDocument();
    },
  );

  it('shows recalculate link for REVISE orders after re-selecting frequency with frequencyPerDay', async () => {
    const user = userEvent.setup();
    const item = createNewOrderBasketItem({
      action: 'REVISE',
      pillsDispensed: 30,
      frequency: {
        valueCoded: 'some-frequency-uuid',
        value: 'Once daily',
        frequencyPerDay: null,
      },
      dosage: 1,
      unit: { valueCoded: '1513AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', value: 'Tablet' },
      duration: 7,
      durationUnit: { valueCoded: '1072AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', value: 'Days' },
      quantityUnits: { valueCoded: '1513AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', value: 'Tablet' },
    });

    renderDrugOrderForm(item);

    await waitFor(() => {
      expect(screen.getByRole('spinbutton', { name: /quantity to dispense/i })).toHaveValue(30);
    });

    // Re-select a frequency that has frequencyPerDay — clear first so all options appear
    const frequencyCombobox = screen.getByRole('combobox', { name: /frequency/i });
    await user.clear(frequencyCombobox);
    await user.click(screen.getByText('Twice daily'));

    // Quantity is preserved — manual override is sticky for REVISE orders.
    // Recalculate link shows the would-be value: 1 × 2.0 × 7 = 14
    await waitFor(() => {
      expect(screen.getByRole('spinbutton', { name: /quantity to dispense/i })).toHaveValue(30);
    });
    expect(screen.getByText(/apply calculated quantity \(14\)/i)).toBeInTheDocument();

    // Clicking recalculate applies the calculated value
    await user.click(screen.getByText(/apply calculated quantity \(14\)/i));

    await waitFor(() => {
      expect(screen.getByRole('spinbutton', { name: /quantity to dispense/i })).toHaveValue(14);
    });
    expect(screen.getByText(/auto-calculated/i)).toBeInTheDocument();
  });

  it('does not auto-calculate when requireOutpatientQuantity is false', async () => {
    const user = userEvent.setup();
    mockUseRequireOutpatientQuantity.mockReturnValue({
      requireOutpatientQuantity: false,
      error: null,
      isLoading: false,
    });
    renderDrugOrderForm(createNewOrderBasketItem());

    const doseInput = screen.getByRole('spinbutton', { name: /dose/i });
    await user.clear(doseInput);
    await user.type(doseInput, '1');

    const frequencyCombobox = screen.getByRole('combobox', { name: /frequency/i });
    await user.click(frequencyCombobox);
    await user.click(screen.getByText('Twice daily'));

    const durationInput = screen.getByRole('spinbutton', { name: /duration/i });
    await user.clear(durationInput);
    await user.type(durationInput, '7');

    const durationUnitCombobox = screen.getByRole('combobox', { name: /duration unit/i });
    await user.click(durationUnitCombobox);
    await user.click(screen.getByText('Days'));

    const quantityInput = screen.getByRole('spinbutton', { name: /quantity to dispense/i });
    // Quantity should remain empty — auto-calc is disabled
    await waitFor(() => {
      expect(quantityInput).not.toHaveValue();
    });
    expect(screen.queryByText(/auto-calculated/i)).not.toBeInTheDocument();

    // Restore default mock
    mockUseRequireOutpatientQuantity.mockReturnValue({
      requireOutpatientQuantity: true,
      error: null,
      isLoading: false,
    });
  });

  it('auto-sets quantity unit to match dose unit when quantity unit is empty', async () => {
    const user = userEvent.setup();
    renderDrugOrderForm(createNewOrderBasketItem());

    const doseInput = screen.getByRole('spinbutton', { name: /dose/i });
    await user.clear(doseInput);
    await user.type(doseInput, '1');

    const frequencyCombobox = screen.getByRole('combobox', { name: /frequency/i });
    await user.click(frequencyCombobox);
    await user.click(screen.getByText('Twice daily'));

    const durationInput = screen.getByRole('spinbutton', { name: /duration/i });
    await user.clear(durationInput);
    await user.type(durationInput, '7');

    const durationUnitCombobox = screen.getByRole('combobox', { name: /duration unit/i });
    await user.click(durationUnitCombobox);
    await user.click(screen.getByText('Days'));

    // The quantity unit should auto-fill to match the dose unit (Tablet)
    await waitFor(() => {
      const quantityUnitCombobox = screen.getByRole('combobox', { name: /quantity unit/i });
      expect(quantityUnitCombobox).toHaveValue('Tablet');
    });
  });

  it('does not save a future start date when revising an active medication', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    const futureStartDate = getDateFromToday(2);
    renderDrugOrderForm(
      createNewOrderBasketItem({
        ...completeMedicationOrderFields,
        action: 'REVISE',
        scheduledDate: getDateFromToday(-1),
      }),
      onSave,
    );

    fireEvent.change(screen.getByLabelText(/start date/i), { target: { value: toDateInputValue(futureStartDate) } });
    fireEvent.submit(screen.getByRole('form', { name: /add drug order/i }));

    expect(
      await screen.findByText('Revisions to an active medication must start today or earlier.'),
    ).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
  });

  it('saves a future start date when revising an already-upcoming medication', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    const upcomingScheduledDate = getDateFromToday(1);
    const futureStartDate = getDateFromToday(2);
    renderDrugOrderForm(
      createNewOrderBasketItem({
        ...completeMedicationOrderFields,
        action: 'REVISE',
        scheduledDate: upcomingScheduledDate,
      }),
      onSave,
    );

    fireEvent.change(screen.getByLabelText(/start date/i), { target: { value: toDateInputValue(futureStartDate) } });
    fireEvent.submit(screen.getByRole('form', { name: /add drug order/i }));

    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
    const savedOrder = onSave.mock.calls[0][0] as DrugOrderBasketItem;
    expect(savedOrder.action).toBe('REVISE');
    expect(savedOrder.scheduledDate).toBeInstanceOf(Date);
    expect((savedOrder.scheduledDate as Date).getFullYear()).toBe(futureStartDate.getFullYear());
    expect((savedOrder.scheduledDate as Date).getMonth()).toBe(futureStartDate.getMonth());
    expect((savedOrder.scheduledDate as Date).getDate()).toBe(futureStartDate.getDate());
  });
});

describe('DrugOrderForm - required field validation', () => {
  beforeEach(() => {
    mockOpenmrsDatePicker.mockImplementation(({ id, labelText }) => (
      <>
        <label htmlFor={id}>{labelText}</label>
        <input id={id} type="text" />
      </>
    ));
    mockUseMedicationOrders.mockReturnValue({
      futureOrders: [],
      activeOrders: [],
      pastOrders: [],
      error: null,
      isLoading: false,
      isValidating: false,
    });
    mockUseRequireOutpatientQuantity.mockReturnValue({
      requireOutpatientQuantity: true,
      error: null,
      isLoading: false,
    });
  });

  it('shows an error for each required field and does not save when submitting an empty order', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    renderDrugOrderForm(createNewOrderBasketItem(), onSave);

    await user.click(screen.getByRole('button', { name: /save order/i }));

    expect(await screen.findByText('Dosage is required')).toBeInTheDocument();
    expect(screen.getByText('Route is required')).toBeInTheDocument();
    expect(screen.getByText('Frequency is required')).toBeInTheDocument();
    expect(screen.getByText('Indication is required')).toBeInTheDocument();
    expect(screen.getByText('Quantity to dispense is required')).toBeInTheDocument();
    expect(screen.getByText('Number of refills is required')).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
  });
});
