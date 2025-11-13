import React from 'react';
import { render, screen } from '@testing-library/react';
import { ActionMenuButton, useLayoutType, useWorkspaces } from '@openmrs/esm-framework';
import ClinicalFormActionButton from './clinical-form-action-button.component';

const mockUseLayoutType = jest.mocked(useLayoutType);
const mockUseWorkspaces = useWorkspaces as jest.Mock;
const mockActionMenuButton = jest.mocked(ActionMenuButton);

mockActionMenuButton.mockImplementation(({ handler, label, tagContent }) => (
  <button onClick={handler}>
    {tagContent} {label}
  </button>
));

mockUseWorkspaces.mockImplementation(() => ({
  active: true,
  windowState: 'normal',
  workspaces: [
    {
      canHide: false,
      name: 'clinical-forms-workspace',
      title: 'Clinical forms',
      preferredWindowSize: 'normal',
      type: 'form',
    },
  ],
  workspaceWindowState: 'normal',
  prompt: null,
}));

describe('<ClinicalFormActionButton>', () => {
  test('should display clinical form action button on tablet view', () => {
    mockUseLayoutType.mockReturnValue('tablet');

    render(<ClinicalFormActionButton patientUuid={'some-uuid'} />);
    expect(screen.getByRole('button', { name: /Clinical forms/i })).toBeInTheDocument();
  });

  test('should display clinical form action button on desktop view', () => {
    mockUseLayoutType.mockReturnValue('small-desktop');

    render(<ClinicalFormActionButton patientUuid={'some-uuid'} />);
    const clinicalActionButton = screen.getByRole('button', { name: /Form/i });
    expect(clinicalActionButton).toBeInTheDocument();
  });
});
