import React from 'react';
import { render, screen } from '@testing-library/react';
import { mockPatient } from 'tools';
import { mockPatientFlags } from '__mocks__';
import { usePatientFlags } from './hooks/usePatientFlags';
import FlagsList from './flags-list.component';

const mockUsePatientFlags = usePatientFlags as jest.Mock;

jest.mock('./hooks/usePatientFlags', () => {
  const originalModule = jest.requireActual('./hooks/usePatientFlags');

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
    <FlagsList
      closeWorkspace={jest.fn()}
      closeWorkspaceWithSavedChanges={jest.fn()}
      patientUuid={mockPatient.id}
      promptBeforeClosing={jest.fn()}
      setTitle={jest.fn()}
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
  expect(screen.getByText(/future appointment/i)).toBeInTheDocument();
  expect(screen.getByText(/needs follow up/i)).toBeInTheDocument();
  expect(screen.getByText(/social/i)).toBeInTheDocument();
});
