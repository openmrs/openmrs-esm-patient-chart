import React from 'react';
import { screen, render } from '@testing-library/react';
import { mockPatient } from '../../../../__mocks__/patient.mock';
import ActiveMedications from './active-medications.component';
import { usePatientOrders } from '../utils/use-current-patient-orders.hook';
import { mockMedicationOrderByUuidResponse } from '../../../../__mocks__/medication.mock';

const testProps = {
  patientUuid: mockPatient.id,
  showAddMedications: false,
};

const mockUsePatientOrders = usePatientOrders as jest.Mock;

jest.mock('../utils/use-current-patient-orders.hook', () => ({
  usePatientOrders: jest.fn(),
}));

describe('ActiveMedications: ', () => {
  test('renders the active medications widget', () => {
    mockUsePatientOrders.mockReturnValue([mockMedicationOrderByUuidResponse, jest.fn]);

    renderActiveMedications();

    expect(screen.getByRole('heading', { name: /active medications/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /previous page/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /next page/i })).toBeInTheDocument();

    const expectedColumnHeaders = [/start date/, /details/];
    expectedColumnHeaders.forEach((header) => {
      expect(screen.getByRole('columnheader', { name: new RegExp(header, 'i') })).toBeInTheDocument();
    });
  });
});

function renderActiveMedications() {
  render(<ActiveMedications {...testProps} />);
}
