import React from 'react';
import { screen, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useLayoutType } from '@openmrs/esm-framework';
import { launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';
import VisitNoteActionButton from './visit-note-action-button.component';

const mockedUseLayoutType = useLayoutType as jest.Mock;

jest.mock('@carbon/react/icons', () => ({
  ...(jest.requireActual('@carbon/react/icons') as jest.Mock),
  Pen: jest.fn((props) => <div data-testid="pen-icon" {...props} />),
}));

jest.mock('@openmrs/esm-patient-common-lib', () => {
  const originalModule = jest.requireActual('@openmrs/esm-patient-common-lib');

  return {
    ...originalModule,
    launchPatientWorkspace: jest.fn(),
  };
});

jest.mock('@openmrs/esm-patient-common-lib/src/workspaces/useWorkspaces', () => ({
  ...jest.requireActual('@openmrs/esm-patient-common-lib/src/workspaces/useWorkspaces'),
  useWorkspaces: jest.fn().mockReturnValue({
    workspaces: [{ type: 'visit-note' }],
    workspaceWindowState: 'normal',
  }),
}));

describe('VisitNoteActionButton', () => {
  it('should display tablet view', async () => {
    const user = userEvent.setup();

    mockedUseLayoutType.mockReturnValue('tablet');

    render(<VisitNoteActionButton />);

    expect(screen.getByTestId('pen-icon').getAttribute('size')).toBe('16');
    const visitNoteButton = screen.getByRole('button', { name: /Visit note/i });
    expect(visitNoteButton).toBeInTheDocument();

    await user.click(visitNoteButton);

    expect(launchPatientWorkspace).toHaveBeenCalledWith('visit-notes-form-workspace');
    expect(visitNoteButton).toHaveClass('active');
  });

  it('should display desktop view', async () => {
    const user = userEvent.setup();

    mockedUseLayoutType.mockReturnValue('desktop');

    render(<VisitNoteActionButton />);

    expect(screen.getByTestId('pen-icon').getAttribute('size')).toBe('16');
    const visitNoteButton = screen.getByRole('button', { name: /Note/i });
    expect(visitNoteButton).toBeInTheDocument();

    await user.click(visitNoteButton);

    expect(launchPatientWorkspace).toHaveBeenCalledWith('visit-notes-form-workspace');
    expect(visitNoteButton).toHaveClass('active');
  });
});
