/* The possible states a workspace window can be opened in. */
export enum WorkspaceWindowState {
  minimized = 'minimized',
  maximized = 'maximized',
  hidden = 'hidden',
  reopened = 'reopened',
  normal = 'normal',
}

/** The default parameters received by all workspaces */
export interface DefaultWorkspaceProps {
  closeWorkspace(): void;
  patientUuid: string;
  isTablet: boolean;
}
