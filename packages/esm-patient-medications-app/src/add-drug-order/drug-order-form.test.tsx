import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor } from '@testing-library/react';
import { getDefaultsFromConfigSchema, useConfig, useLayoutType, useSession } from '@openmrs/esm-framework';
import { type DrugOrderBasketItem } from '@openmrs/esm-patient-common-lib';
import { mockPatient } from 'tools';
import { mockDrugSearchResultApiData, mockSessionDataResponse } from '__mocks__';
import { configSchema, type ConfigObject } from '../config-schema';
import { useRequireOutpatientQuantity } from '../api/api';
import { getTemplateOrderBasketItem } from './drug-search/drug-search.resource';
import DrugOrderForm from './drug-order-form.component';

const mockUseConfig = jest.mocked(useConfig<ConfigObject>);
const mockUseLayoutType = jest.mocked(useLayoutType);
const mockUseSession = jest.mocked(useSession);

mockUseConfig.mockReturnValue(getDefaultsFromConfigSchema(configSchema) as ConfigObject);
mockUseSession.mockReturnValue(mockSessionDataResponse.data);

jest.mock('../api/order-config', () => ({
  useOrderConfig: jest.fn().mockReturnValue({
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

jest.mock('../api/api', () => ({
  ...jest.requireActual('../api/api'),
  useActivePatientOrders: jest.fn().mockReturnValue({ isLoading: false, data: [] }),
  useRequireOutpatientQuantity: jest
    .fn()
    .mockReturnValue({ requireOutpatientQuantity: true, error: null, isLoading: false }),
}));

function renderDrugOrderForm(initialOrderBasketItem: DrugOrderBasketItem) {
  return render(
    <DrugOrderForm
      initialOrderBasketItem={initialOrderBasketItem}
      patient={mockPatient}
      visitContext={null}
      onSave={jest.fn()}
      saveButtonText="Save order"
      onCancel={jest.fn()}
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

describe('DrugOrderForm - auto-calculation of dispense quantity', () => {
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

    // Quantity is preserved from the existing order — the effect returns early for
    // REVISE orders with null frequencyPerDay
    await waitFor(() => {
      expect(screen.getByRole('spinbutton', { name: /quantity to dispense/i })).toHaveValue(30);
    });
    expect(screen.queryByText(/auto-calculated/i)).not.toBeInTheDocument();
  });

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
    (useRequireOutpatientQuantity as jest.Mock).mockReturnValue({
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
    (useRequireOutpatientQuantity as jest.Mock).mockReturnValue({
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
});

describe('DrugOrderForm - responsive layout behavior', () => {
  afterEach(() => {
    mockUseLayoutType.mockReset();
  });

  it('shows the patient header on tablet layout', () => {
    mockUseLayoutType.mockReturnValue('tablet');
    renderDrugOrderForm(createNewOrderBasketItem());

    expect(screen.getByText('John Wilson')).toBeInTheDocument();
  });

  it('hides the patient header on desktop layout', () => {
    mockUseLayoutType.mockReturnValue('small-desktop');
    renderDrugOrderForm(createNewOrderBasketItem());

    expect(screen.queryByText('John Wilson')).not.toBeInTheDocument();
  });

  it('hides the patient header on phone layout', () => {
    mockUseLayoutType.mockReturnValue('phone');
    renderDrugOrderForm(createNewOrderBasketItem());

    expect(screen.queryByText('John Wilson')).not.toBeInTheDocument();
  });
});
