import React from 'react';
import userEvent from '@testing-library/user-event';
import { screen, render } from '@testing-library/react';
import { launchWorkspace } from '@openmrs/esm-framework';
import { mockPatient } from 'tools';
import { mockPatientFlags } from '__mocks__';
import { usePatientFlags } from './hooks/usePatientFlags';
import Flags from './flags.component';

const mockUsePatientFlags = jest.mocked(usePatientFlags);
const mockLaunchWorkspace = jest.mocked(launchWorkspace);

jest.mock('./hooks/usePatientFlags', () => {
  const originalModule = jest.requireActual('./hooks/usePatientFlags');

  return {
    ...originalModule,
    usePatientFlags: jest.fn(),
  };
});

it('renders flags in the patient flags slot', async () => {
  const user = userEvent.setup();

  mockUsePatientFlags.mockReturnValue({
    error: null,
    flags: mockPatientFlags,
    isLoading: false,
    isValidating: false,
    mutate: jest.fn(),
  });

  render(<Flags patientUuid={mockPatient.id} onHandleCloseHighlightBar={jest.fn()} showHighlightBar={false} />);

  const flags = screen.getAllByRole('button', { name: /flag/i });
  expect(flags).toHaveLength(3);
  expect(screen.getByText(/patient needs to be followed up/i)).toBeInTheDocument();
  expect(screen.getByText(/diagnosis for the patient is unknown/i)).toBeInTheDocument();
  expect(screen.getByText(/patient has a future appointment scheduled/i)).toBeInTheDocument();

  const editButton = screen.getByRole('button', { name: /edit/i });
  expect(editButton).toBeInTheDocument();

  await user.click(editButton);

  expect(mockLaunchWorkspace).toHaveBeenCalledWith('edit-flags-side-panel-form');
});
