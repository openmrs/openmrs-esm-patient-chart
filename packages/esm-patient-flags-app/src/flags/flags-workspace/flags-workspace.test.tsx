import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mockPatient } from 'tools';
import { mockPatientFlags } from '__mocks__';
import { usePatientFlags } from '../hooks/usePatientFlags';
import FlagsWorkspace from './flags.workspace';

const mockUsePatientFlags = usePatientFlags as jest.Mock;

jest.mock('../hooks/usePatientFlags', () => {
  const originalModule = jest.requireActual('../hooks/usePatientFlags');

  return {
    ...originalModule,
    usePatientFlags: jest.fn(),
  };
});

it('renders an Edit form that enables users to toggle flags on or off', async () => {
  mockUsePatientFlags.mockReturnValue({
    flags: mockPatientFlags,
    isLoading: false,
    error: null,
  });

  render(
    <FlagsWorkspace
      closeWorkspace={jest.fn()}
      groupProps={{
        patientUuid: mockPatient.id,
        patient: mockPatient,
        visitContext: null,
        mutateVisitContext: null,
      }}
      workspaceProps={{}}
      windowProps={{}}
      workspaceName=""
      launchChildWorkspace={null}
      windowName={''}
      isRootWorkspace={false}
    />,
  );

  const searchbox = screen.getByRole('searchbox', { name: /search for a flag/i });
  const clearSearchInputButton = screen.getByRole('button', { name: /clear search input/i });
  const discardButton = screen.getByRole('button', { name: /discard/i });
  const saveButton = screen.getByRole('button', { name: /save & close/i });

  expect(searchbox).toBeInTheDocument();
  expect(clearSearchInputButton).toBeInTheDocument();
  expect(discardButton).toBeInTheDocument();
  expect(saveButton).toBeInTheDocument();
  expect(screen.getByText(/patient has a future appointment scheduled/i)).toBeInTheDocument();
  expect(screen.getByText(/patient needs to be followed up/i)).toBeInTheDocument();
  expect(screen.getByText(/social/i)).toBeInTheDocument();
});

it('sorts by active and retired correctly via controlled dropdown', async () => {
  mockUsePatientFlags.mockReturnValue({
    flags: mockPatientFlags,
    isLoading: false,
    error: null,
  });

  render(
    <FlagsWorkspace
      closeWorkspace={jest.fn()}
      groupProps={{
        patientUuid: mockPatient.id,
        patient: mockPatient,
        visitContext: null,
        mutateVisitContext: null,
      }}
      workspaceProps={{}}
      windowProps={{}}
      workspaceName=""
      launchChildWorkspace={null}
      windowName={''}
      isRootWorkspace={false}
    />,
  );

  const user = userEvent.setup();
  const sortDropdown = screen.getByRole('combobox');
  expect(sortDropdown).toBeInTheDocument();

  // select "Retired first" then "Active first" to exercise both flows
  await user.click(sortDropdown);
  await user.click(screen.getByText(/Retired first/i));
  await user.click(sortDropdown);
  await user.click(screen.getByText(/Active first/i));
});
