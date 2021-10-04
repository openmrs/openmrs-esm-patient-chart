import React from 'react';
import { screen } from '@testing-library/react';
import { mockPatient } from '../../../../__mocks__/patient.mock';
import { mockDrugOrders } from '../../../../__mocks__/medication.mock';
import { swrRender, waitForLoadingToFinish } from '../../../../tools/test-helpers';
import { openmrsFetch } from '@openmrs/esm-framework';
import ActiveMedications from './active-medications.component';

const testProps = {
  patientUuid: mockPatient.id,
  showAddMedications: true,
};

const mockOpenmrsFetch = openmrsFetch as jest.Mock;

describe('ActiveMedications: ', () => {
  test('renders the active medications widget', async () => {
    mockOpenmrsFetch.mockReturnValueOnce(mockDrugOrders);

    renderActiveMedications();

    await waitForLoadingToFinish();

    expect(screen.getByRole('heading', { name: /active medications/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /previous page/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /next page/i })).toBeInTheDocument();

    const expectedColumnHeaders = [/start date/, /details/];
    expectedColumnHeaders.forEach((header) => {
      expect(screen.getByRole('columnheader', { name: new RegExp(header, 'i') })).toBeInTheDocument();
    });
  });
});

function renderActiveMedications() {
  swrRender(<ActiveMedications {...testProps} />);
}
