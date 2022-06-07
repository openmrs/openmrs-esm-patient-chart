import React from 'react';
import ClinicalFormActionButton from './clinical-form-action-button.component';
import { render, screen } from '@testing-library/react';
import { mockPatient } from '../../../__mocks__/patient.mock';
import { useLayoutType } from '@openmrs/esm-framework';

const mockLayoutType = useLayoutType as jest.Mock;

jest.mock('@openmrs/esm-framework', () => {
  const originalModule = jest.requireActual('@openmrs/esm-framework');
  return {
    ...originalModule,
    usePatient: jest.fn(() => ({ patientUuid: 'someUuid', patient: mockPatient })),
    useConnectivity: jest.fn(() => true),
    useLayoutType: jest.fn(),
  };
});

describe('<ClinicalFormActionButton/>', () => {
  test('should display clinical form action button on tablet view', async () => {
    mockLayoutType.mockReturnValueOnce('tablet');
    render(<ClinicalFormActionButton />);
    expect(await screen.findByRole('button', { name: /Form/ })).toBeInTheDocument();
  });

  test('should display clinical form action button on desktop view', async () => {
    mockLayoutType.mockReturnValueOnce('desktop');
    render(<ClinicalFormActionButton />);
    const clinicalActionButton = await screen.findByRole('button', { name: /Form/ });
    expect(clinicalActionButton).not.toHaveTextContent('Clinical form');
  });
});
