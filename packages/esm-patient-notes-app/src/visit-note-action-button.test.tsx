import React from 'react';
import VisitNoteActionButton from './visit-note-action-button.component';
import { screen, render } from '@testing-library/react';
import { useLayoutType } from '@openmrs/esm-framework/mock';
import userEvent from '@testing-library/user-event';
import { launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';

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

describe('<VisitNoteActionButton/>', () => {
  it('should display tablet view', () => {
    useLayoutType.mockImplementation(() => 'tablet');
    render(<VisitNoteActionButton />);

    const visitNoteButton = screen.getByRole('button', { name: /Visit note/i });
    expect(visitNoteButton).toBeInTheDocument();
    userEvent.click(visitNoteButton);

    expect(launchPatientWorkspace).toHaveBeenCalledWith('visit-notes-form-workspace');
    expect(visitNoteButton).toHaveClass('active');
  });

  it('should display desktop view', () => {
    useLayoutType.mockImplementation(() => 'desktop');
    render(<VisitNoteActionButton />);

    const visitNoteButton = screen.getByRole('button', { name: /Note/i });
    expect(visitNoteButton).toBeInTheDocument();
    userEvent.click(visitNoteButton);

    expect(launchPatientWorkspace).toHaveBeenCalledWith('visit-notes-form-workspace');
    expect(visitNoteButton).toHaveClass('active');
  });
});
