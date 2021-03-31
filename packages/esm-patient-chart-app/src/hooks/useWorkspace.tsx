import {
  ExtensionSlot,
  ExtensionSlotProps,
  useNavigationContext,
} from "@openmrs/esm-framework";
import React, { useCallback, useState } from "react";

export interface WorkspaceState {
  title: string;
  extensionSlot: React.FC<ExtensionSlotProps>;
  clearExtensionSlot(): void;
}

export function useWorkspace(): WorkspaceState {
  const [
    currentWorkspaceExtensionSlot,
    setCurrentWorkspaceExtensionSlot,
  ] = useState<React.FC<ExtensionSlotProps>>();
  const [workspaceTitle, setWorkspaceTitle] = useState("");

  const clearCurrentWorkspaceContext = useCallback(() => {
    setCurrentWorkspaceExtensionSlot(undefined);
    setWorkspaceTitle("");
  }, []);

  useNavigationContext({
    type: "workspace",
    handler: (link, state: { title?: string }) => {
      setCurrentWorkspaceExtensionSlot(() => (
        <ExtensionSlot
          extensionSlotName={link}
          state={{ closeWorkspace: clearCurrentWorkspaceContext, ...state }}
        />
      ));
      setWorkspaceTitle(state.title ?? "");
      return true;
    },
  });

  return {
    title: workspaceTitle,
    extensionSlot: currentWorkspaceExtensionSlot,
    clearExtensionSlot: clearCurrentWorkspaceContext,
  };
}
