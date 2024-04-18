import React from 'react';
import userEvent from '@testing-library/user-event';
import { launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';
import { screen, render } from '@testing-library/react';
import { mockPatient } from 'tools';
import { mockPatientFlags } from '__mocks__';
import { usePatientFlags } from './hooks/usePatientFlags';
import Flags from './flags.component';

const mockedUsePatientFlags = usePatientFlags as jest.Mock;

jest.mock('@openmrs/esm-patient-common-lib', () => {
  const originalModule = jest.requireActual('@openmrs/esm-patient-common-lib');

  return {
    ...originalModule,
    launchPatientWorkspace: jest.fn(),
  };
});

jest.mock('./hooks/usePatientFlags', () => {
  const originalModule = jest.requireActual('./hooks/usePatientFlags');

  return {
    ...originalModule,
    usePatientFlags: jest.fn(),
  };
});

it('renders flags in the patient flags slot', async () => {
  const user = userEvent.setup();

  mockedUsePatientFlags.mockReturnValue({
    flags: mockPatientFlags,
    isLoading: false,
    error: null,
  });

  renderFlags();

  const flags = screen.getAllByRole('button', { name: /flag/i });
  expect(flags).toHaveLength(3);
  expect(screen.getByText(/patient needs to be followed up/i)).toBeInTheDocument();
  expect(screen.getByText(/diagnosis for the patient is unknown/i)).toBeInTheDocument();
  expect(screen.getByText(/patient has a future appointment scheduled/i)).toBeInTheDocument();

  const editButton = screen.getByRole('button', { name: /edit/i });
  expect(editButton).toBeInTheDocument();

  await user.click(editButton);

  expect(launchPatientWorkspace).toHaveBeenCalledWith('edit-flags-side-panel-form');
});

function renderFlags() {
  return render(<Flags patientUuid={mockPatient.id} onHandleCloseHighlightBar={() => {}} showHighlightBar={false} />);
}
