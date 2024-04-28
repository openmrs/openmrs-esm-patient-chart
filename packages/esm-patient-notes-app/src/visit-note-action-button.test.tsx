import React from 'react';
import { screen, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type LayoutType, useLayoutType, useWorkspaces } from '@openmrs/esm-framework';
import { useLaunchWorkspaceRequiringVisit } from '@openmrs/esm-patient-common-lib';
import VisitNoteActionButton from './visit-note-action-button.extension';

const mockUseLayoutType = jest.mocked(useLayoutType);
const mockUseLaunchWorkspaceRequiringVisit = jest.mocked(useLaunchWorkspaceRequiringVisit);
const mockUseWorkspaces = useWorkspaces as jest.Mock;

mockUseWorkspaces.mockReturnValue({
  workspaces: [{ type: 'visit-note' }],
  workspaceWindowState: 'normal',
}),
  jest.mock('@carbon/react/icons', () => ({
    ...(jest.requireActual('@carbon/react/icons') as jest.Mock),
    Pen: jest.fn((props) => <div data-testid="pen-icon" {...props} />),
  }));

jest.mock('@openmrs/esm-patient-common-lib', () => {
  const originalModule = jest.requireActual('@openmrs/esm-patient-common-lib');

  return {
    ...originalModule,
    launchPatientWorkspace: jest.fn(),
    useVisitOrOfflineVisit: jest.fn().mockReturnValue({ currentVisit: null }),
    useLaunchWorkspaceRequiringVisit: jest.fn(),
  };
});

describe('VisitNoteActionButton', () => {
  it('should display tablet view', async () => {
    const user = userEvent.setup();

    mockUseLayoutType.mockReturnValue('tablet');

    render(<VisitNoteActionButton />);

    expect(screen.getByTestId('pen-icon').getAttribute('size')).toBe('16');
    const visitNoteButton = screen.getByRole('button', { name: /Visit note/i });
    expect(visitNoteButton).toBeInTheDocument();

    await user.click(visitNoteButton);

    expect(mockUseLaunchWorkspaceRequiringVisit).toHaveBeenCalledWith('visit-notes-form-workspace');
    expect(visitNoteButton).toHaveClass('active');
  });

  it('should display desktop view', async () => {
    const user = userEvent.setup();

    mockUseLayoutType.mockReturnValue('desktop' as LayoutType);

    render(<VisitNoteActionButton />);

    expect(screen.getByTestId('pen-icon').getAttribute('size')).toBe('16');
    const visitNoteButton = screen.getByRole('button', { name: /Note/i });
    expect(visitNoteButton).toBeInTheDocument();

    await user.click(visitNoteButton);

    expect(mockUseLaunchWorkspaceRequiringVisit).toHaveBeenCalledWith('visit-notes-form-workspace');
    expect(visitNoteButton).toHaveClass('active');
  });
});
