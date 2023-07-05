import React from 'react';
import { screen, render } from '@testing-library/react';
import PatientFlags from './patient-flags.component';
import { mockPatient } from '../../../../__mocks__/patient.mock';
import { mockPatientFlags } from '../../../../__mocks__/patient-flags.mock';
import { useFlagsFromPatient } from './hooks/usePatientFlags';

const mockUsePatientFlags = useFlagsFromPatient as jest.Mock;

jest.mock('./hooks/usePatientFlags', () => ({
  ...(jest.requireActual('./hooks/usePatientFlags') as any),
  useFlagsFromPatient: jest.fn(),
}));

describe('PatientFlag: ', () => {
  it('renders patient flag tags in the patient flags slot', async () => {
    mockUsePatientFlags.mockReturnValue({
      flags: mockPatientFlags,
      isLoading: false,
      error: null,
    });
    render(<PatientFlags patientUuid={mockPatient.id} />);
    const buttonElements = await screen.findAllByRole('button');
    expect(buttonElements.length).toBe(4);
  });

  it('should not render if patient flag are abscent', async () => {
    mockUsePatientFlags.mockReturnValue({
      flags: [],
      isLoading: false,
      error: null,
    });
    render(<PatientFlags patientUuid={mockPatient.id} />);
    expect(await screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });
});
