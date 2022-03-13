import React from 'react';
import VisitNoteActionButton from './visit-note-action-button.component';
import { screen, render } from '@testing-library/react';
import * as openmrsEsmFramework from '@openmrs/esm-framework';
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
    spyOn(openmrsEsmFramework, 'useLayoutType').and.returnValue('tablet');
    render(<VisitNoteActionButton />);

    const visitNoteButton = screen.getByRole('button', { name: /Visit note/i });
    expect(visitNoteButton).toBeInTheDocument();
    expect(visitNoteButton).toHaveClass('container');
    userEvent.click(visitNoteButton);

    expect(launchPatientWorkspace).toHaveBeenCalledWith('visit-notes-form-workspace');
    expect(visitNoteButton).toHaveClass('active');
  });

  it('should display desktop view', () => {
    spyOn(openmrsEsmFramework, 'useLayoutType').and.returnValue('desktop');
    render(<VisitNoteActionButton />);

    const visitNoteButton = screen.getByRole('button', { name: /Note/i });
    expect(visitNoteButton).toBeInTheDocument();
    expect(visitNoteButton).toHaveClass('container');
    userEvent.click(visitNoteButton);

    expect(launchPatientWorkspace).toHaveBeenCalledWith('visit-notes-form-workspace');
    expect(visitNoteButton).toHaveClass('active');
  });
});
