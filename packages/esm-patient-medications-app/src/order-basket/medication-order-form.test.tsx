import React from 'react';
import { screen, render } from '@testing-library/react';
import { mockCommonMedicine, mockOrderBasketItem } from '../../../../__mocks__/medication.mock';
import * as esmFramework from '@openmrs/esm-framework/mock';
import MedicationOrderForm from './medication-order-form.component';

const testProps = {
  initialOrderBasketItem: mockOrderBasketItem,
  durationUnits: [],
  onSign: jest.fn(),
  onCancel: jest.fn(),
};

jest.mock('../api/common-medication', () => ({
  getCommonMedicationByUuid: jest.fn(() => mockCommonMedicine),
}));

describe('MedicationOrderForm: ', () => {
  test('should render Medication order form header for tablet', async () => {
    spyOn(esmFramework, 'useLayoutType').and.returnValue('tablet');
    render(<MedicationOrderForm {...testProps} />);
    expect(screen.getByText('DOSE')).toBeInTheDocument();
    expect(screen.getByText('Aspirin (81 mg)')).toBeInTheDocument();
    expect(screen.getByText('— Oral — Tablet —')).toBeInTheDocument();
    expect(screen.getByText('81 mg')).toBeInTheDocument();
  });

  test('should render Medication order form header for Desktop', async () => {
    spyOn(esmFramework, 'useLayoutType').and.returnValue('desktop');
    render(<MedicationOrderForm {...testProps} />);
    expect(screen.getByText('DOSE')).toBeInTheDocument();
    expect(screen.getByText('Aspirin (81 mg)')).toBeInTheDocument();
    expect(screen.getByText('— Oral — Tablet —')).toBeInTheDocument();
    expect(screen.getByText('81 mg')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Back to order basket' })).toBeInTheDocument();
    expect(screen.getByText('Order Form')).toBeInTheDocument();
  });

  test('should render "Dosage Instructions" section', async () => {
    spyOn(esmFramework, 'useLayoutType').and.returnValue('tablet');
    render(<MedicationOrderForm {...testProps} />);
    expect(screen.getByText('1. Dosage Instructions')).toBeInTheDocument();
    expect(screen.getByText('Free Text Dosage')).toBeInTheDocument();

    expect(screen.getByText('Enter Dose')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Dose')).toBeInTheDocument();

    expect(screen.getByText('Enter Frequency')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Frequency')).toBeInTheDocument();

    expect(screen.getByText('Enter Route')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Route')).toBeInTheDocument();

    expect(screen.getByText('Patient Instructions')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('Additional dosing instructions (e.g. "Take after eating")'),
    ).toBeInTheDocument();

    expect(screen.getByText('Take As Needed')).toBeInTheDocument();
    expect(screen.getByLabelText('Take As Needed')).toBeChecked();

    expect(screen.getByText('P.R.N. Reason')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Reason to take medicine')).toBeInTheDocument();
  });

  test('should render "Prescription Duration" section', async () => {
    spyOn(esmFramework, 'useLayoutType').and.returnValue('tablet');
    render(<MedicationOrderForm {...testProps} />);
    expect(screen.getByText('2. Prescription Duration')).toBeInTheDocument();
  });

  test('should render "Dispensing Information" section', async () => {
    spyOn(esmFramework, 'useLayoutType').and.returnValue('tablet');
    render(<MedicationOrderForm {...testProps} />);
    expect(screen.getByText('3. Dispensing Information')).toBeInTheDocument();
  });
});
