/* The possible states a workspace window can be opened in. */
export type WorkspaceWindowState = 'maximized' | 'hidden' | 'normal';

export interface CloseWorkspaceOptions {
  workspaceTitle?: string;
  ignoreChanges?: boolean;
  onWorkspaceClose?: () => void;
  confirmBeforeClosing?: boolean;
}

/** The default parameters received by all workspaces */
export interface DefaultWorkspaceProps {
  /**
   * Call this function to close the workspace. If ignoreChanges is true, the user will not be
   * prompted to save changes before closing, even if the `testFcn` passed to `promptBeforeClosing`
   * returns `true`.
   */
  closeWorkspace(closeWorkspaceOptions?: CloseWorkspaceOptions): void;
  /**
   * Call this with a no-args function that returns true if the user should be prompted before
   * this workspace is closed; e.g. if there is unsaved data.
   */
  promptBeforeClosing(testFcn: () => boolean): void;
  patientUuid: string;
  handlePostResponse?(): void;
}

export interface WorkspaceWindowSize {
  size: WorkspaceWindowState;
}

export interface WorkspaceWindowSizeProviderProps {
  children?: React.ReactNode;
}

export interface WorkspaceWindowSizeContext {
  windowSize: WorkspaceWindowSize;
  updateWindowSize?(value: WorkspaceWindowState): any;
  active: boolean;
}
