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
  /**
   * Call this with a no-args function that returns true if the user should be prompted before
   * this workspace is closed; e.g. if there is unsaved data.
   */
  promptBeforeClosing(testFcn: () => boolean): void;
  patientUuid: string;
}
