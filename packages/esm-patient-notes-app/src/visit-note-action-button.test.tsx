import React from 'react';
import userEvent from '@testing-library/user-event';
import { screen, render } from '@testing-library/react';
import { type LayoutType, useLayoutType, useWorkspaces, ActionMenuButton } from '@openmrs/esm-framework';
import { useLaunchWorkspaceRequiringVisit } from '@openmrs/esm-patient-common-lib';
import VisitNoteActionButton from './visit-note-action-button.extension';

const mockActionMenuButton = jest.mocked(ActionMenuButton);
const mockUseLayoutType = jest.mocked(useLayoutType);
const mockUseLaunchWorkspaceRequiringVisit = jest.mocked(useLaunchWorkspaceRequiringVisit);
const mockUseWorkspaces = useWorkspaces as jest.Mock;

mockActionMenuButton.mockImplementation(({ handler, label, tagContent }) => (
  <button onClick={handler}>
    {tagContent} {label}
  </button>
));

mockUseWorkspaces.mockReturnValue({
  workspaces: [{ type: 'visit-note' }],
  workspaceWindowState: 'normal',
});

jest.mock('@openmrs/esm-patient-common-lib', () => {
  const originalModule = jest.requireActual('@openmrs/esm-patient-common-lib');

  return {
    ...originalModule,
    useVisitOrOfflineVisit: jest.fn().mockReturnValue({ currentVisit: null }),
    useLaunchWorkspaceRequiringVisit: jest.fn(),
  };
});

describe('VisitNoteActionButton', () => {
  it('should display tablet view', async () => {
    const user = userEvent.setup();

    mockUseLayoutType.mockReturnValue('tablet');

    render(<VisitNoteActionButton />);

    const visitNoteButton = screen.getByRole('button', { name: /Visit note/i });
    expect(visitNoteButton).toBeInTheDocument();

    await user.click(visitNoteButton);

    expect(mockUseLaunchWorkspaceRequiringVisit).toHaveBeenCalledWith('visit-notes-form-workspace');
  });

  it('should display desktop view', async () => {
    const user = userEvent.setup();

    mockUseLayoutType.mockReturnValue('desktop' as LayoutType);

    render(<VisitNoteActionButton />);

    const visitNoteButton = screen.getByRole('button', { name: /Note/i });
    expect(visitNoteButton).toBeInTheDocument();

    await user.click(visitNoteButton);

    expect(mockUseLaunchWorkspaceRequiringVisit).toHaveBeenCalledWith('visit-notes-form-workspace');
  });
});
