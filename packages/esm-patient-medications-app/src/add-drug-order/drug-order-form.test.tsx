import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor } from '@testing-library/react';
import { getDefaultsFromConfigSchema, useConfig, useSession } from '@openmrs/esm-framework';
import { type DrugOrderBasketItem } from '@openmrs/esm-patient-common-lib';
import { mockPatient } from 'tools';
import { mockDrugSearchResultApiData, mockSessionDataResponse } from '__mocks__';
import { configSchema, type ConfigObject } from '../config-schema';
import { getTemplateOrderBasketItem } from './drug-search/drug-search.resource';
import DrugOrderForm from './drug-order-form.component';

const mockUseConfig = jest.mocked(useConfig<ConfigObject>);
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
    .mockReturnValue({ requireOutpatientQuantity: false, error: null, isLoading: false }),
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

  it('stops auto-calculating after manual edit of quantity', async () => {
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
  });

  it('resumes auto-calculation when an upstream input changes after manual edit', async () => {
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

    // Change duration (driver key changes) — auto-calc should resume
    await user.clear(durationInput);
    await user.type(durationInput, '14');

    // 1 × 2.0 × 14 = 28
    await waitFor(() => {
      expect(quantityInput).toHaveValue(28);
    });
    expect(screen.getByText(/auto-calculated/i)).toBeInTheDocument();
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

  it('auto-calculates for REVISE orders after re-selecting frequency with frequencyPerDay', async () => {
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

    // 1 × 2.0 × 7 = 14
    await waitFor(() => {
      expect(screen.getByRole('spinbutton', { name: /quantity to dispense/i })).toHaveValue(14);
    });
    expect(screen.getByText(/auto-calculated/i)).toBeInTheDocument();
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
