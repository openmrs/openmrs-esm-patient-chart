import React from 'react';
import { screen, render, waitFor } from '@testing-library/react';
import WorkspaceWindow from './workspace-window.component';
import { match, RouteComponentProps } from 'react-router-dom';
import {
  launchPatientWorkspace,
  registerWorkspace,
  WorkspaceWindowSizeProvider,
} from '@openmrs/esm-patient-common-lib';
import userEvent from '@testing-library/user-event';

const mockExtensionRegistry = {};

jest.mock('./workspace-renderer.component', () => ({
  WorkspaceRenderer: jest.fn().mockImplementation(() => <div>Workspace-Renderer</div>),
}));

jest.mock('@openmrs/esm-framework', () => {
  const originalModule = jest.requireActual('@openmrs/esm-framework');
  return {
    ...originalModule,
    useBodyScrollLock: jest.fn(),
    registerExtension: (ext) => {
      mockExtensionRegistry[ext.name] = ext;
    },
    getExtensionRegistration: (name) => mockExtensionRegistry[name],
    translateFrom: (module, key, defaultValue, options) => defaultValue,
  };
});

const path = `/patient/:patientUuid/chart`;
const sampleMatchProp: match<{ patientUuid: string }> = {
  isExact: false,
  path,
  url: path.replace(':patientUuid', '1'),
  params: { patientUuid: '1' },
};
const mockRoute: RouteComponentProps<{ patientUuid: string }> = {
  history: '' as any,
  location: '' as any,
  match: sampleMatchProp,
};

describe('WorkspaceWindow', () => {
  test('should reopen hidden workspace window when user re-launches the same workspace window', async () => {
    registerWorkspace({ name: 'Clinical Form', title: 'Clinical Form', load: jest.fn() });
    launchPatientWorkspace('Clinical Form', { workspaceTitle: 'POC Triage' });
    render(
      <WorkspaceWindowSizeProvider>
        <WorkspaceWindow {...mockRoute} />
      </WorkspaceWindowSizeProvider>,
    );
    expect(screen.getByRole('banner', { name: 'Workspace Title' })).toBeInTheDocument();
    expect(screen.getByText('POC Triage')).toBeInTheDocument();

    const workspaceContainer = screen.getByRole('complementary');
    expect(workspaceContainer).toHaveClass('show');

    const hideButton = screen.getByRole('button', { name: 'Hide' });
    userEvent.click(hideButton);

    expect(workspaceContainer).toHaveClass('hide');

    await waitFor(() => {
      launchPatientWorkspace('Clinical Form', { workspaceTitle: 'POC Triage' });
    });

    expect(await screen.findByRole('complementary')).toHaveClass('show');
  });

  test('should toggle between maximize and normal screen size', async () => {
    render(
      <WorkspaceWindowSizeProvider>
        <WorkspaceWindow {...mockRoute} />
      </WorkspaceWindowSizeProvider>,
    );
    const maximizeButton = await screen.findByRole('button', { name: 'Maximize' });
    userEvent.click(maximizeButton);
    expect(screen.getByRole('complementary')).toHaveClass('maximized');

    const minimizeButton = await screen.findByRole('button', { name: 'Minimize' });
    userEvent.click(minimizeButton);
    expect(screen.getByRole('complementary')).not.toHaveClass('maximized');
  });
});
