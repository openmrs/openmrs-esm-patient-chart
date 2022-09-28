import React from 'react';
import { screen, render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useLayoutType } from '@openmrs/esm-framework';
import { launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';
import VisitNoteActionButton from './visit-note-action-button.component';

const mockedUseLayoutType = useLayoutType as jest.Mock;

jest.mock('@openmrs/esm-framework', () => {
  const originalModule = jest.requireActual('@openmrs/esm-framework');

  return {
    ...originalModule,
    useLayoutType: jest.fn(),
  };
});

jest.mock('@openmrs/esm-patient-common-lib', () => {
  const originalModule = jest.requireActual('@openmrs/esm-patient-common-lib');

  return {
    ...originalModule,
    launchPatientWorkspace: jest.fn(),
    useWorkspaces: jest.fn(() => {
      return { workspaces: [{ name: 'visit-note' }] };
    }),
  };
});

describe('VisitNoteActionButton', () => {
  it('should display tablet view', async () => {
    const user = userEvent.setup();

    mockedUseLayoutType.mockReturnValue('tablet');

    render(<VisitNoteActionButton />);

    const visitNoteButton = screen.getByRole('button', { name: /Visit note/i });
    expect(visitNoteButton).toBeInTheDocument();

    await waitFor(() => user.click(visitNoteButton));

    expect(launchPatientWorkspace).toHaveBeenCalledWith('visit-notes-form-workspace');
    expect(visitNoteButton).toHaveClass('active');
  });

  it('should display desktop view', async () => {
    const user = userEvent.setup();

    mockedUseLayoutType.mockReturnValue('desktop');

    render(<VisitNoteActionButton />);

    const visitNoteButton = screen.getByRole('button', { name: /Note/i });
    expect(visitNoteButton).toBeInTheDocument();

    await waitFor(() => user.click(visitNoteButton));

    expect(launchPatientWorkspace).toHaveBeenCalledWith('visit-notes-form-workspace');
    expect(visitNoteButton).toHaveClass('active');
  });
});
