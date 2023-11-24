import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';
import { mockPatient } from '../../../../tools/test-helpers';
import { mockPatientFlags } from '../__mocks__/patient-flags.mock';
import { usePatientFlags } from './hooks/usePatientFlags';
import FlagsHighlightBar from './flags-highlight-bar.component';

jest.setTimeout(5000);

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

it('renders a highlights bar showing a summary of the available flags', async () => {
  const user = userEvent.setup();

  mockedUsePatientFlags.mockReturnValue({
    flags: mockPatientFlags,
    isLoading: false,
    error: null,
  });

  renderFlagsHighlightBar();

  const riskFlag = screen.getByRole('button', { name: /risk flag/i });
  expect(riskFlag).toBeInTheDocument();
  expect(screen.getByText('🚩')).toBeInTheDocument();
  expect(screen.getByText(/risk flag/)).toBeInTheDocument();

  await user.click(riskFlag);

  const flags = screen.getAllByRole('button', { name: /flag/i });
  expect(flags).toHaveLength(5);
  expect(screen.getByText(/patient needs to be followed up/i)).toBeInTheDocument();
  expect(screen.getByText(/diagnosis for the patient is unknown/i)).toBeInTheDocument();
  expect(screen.getByText(/patient has a future appointment scheduled/i)).toBeInTheDocument();

  const editButton = screen.getByRole('button', { name: /edit/i });
  expect(editButton).toBeInTheDocument();

  await user.click(editButton);

  expect(launchPatientWorkspace).toHaveBeenCalledWith('edit-flags-side-panel-form');

  const closeButton = screen.getByRole('button', { name: /close flags bar/i });

  await user.click(closeButton);

  expect(screen.getAllByRole('button', { name: /flag/i })).not.toEqual(5);
});

function renderFlagsHighlightBar() {
  return render(<FlagsHighlightBar patientUuid={mockPatient.id} />);
}
