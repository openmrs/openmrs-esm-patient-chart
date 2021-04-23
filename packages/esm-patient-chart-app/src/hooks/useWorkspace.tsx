import { useCallback, useMemo } from "react";
import { detach, extensionStore, useAssignedExtensionIds } from "@openmrs/esm-framework";
import { patientChartWorkspaceSlot } from "../constants";
import { getTitle } from "../utils";

export interface WorkspaceState {
  title: string;
  active: boolean;
}

export interface WorkspaceDetails extends WorkspaceState {
  clearExtensionSlot(): void;
}

export function useWorkspace(): WorkspaceDetails {
  const extensions = useAssignedExtensionIds(patientChartWorkspaceSlot);

  const title = useMemo(() => {
    if (extensions.length === 0) {
      return "";
    } else if (extensions.length === 1) {
      const state = extensionStore.getState();
      return getTitle(state.extensions[extensions[0]]);
    } else {
      return `Workspaces (${extensions.length})`;
    }
  }, [extensions]);

  const clearExtensionSlot = useCallback(() => {
    for (const extension of extensions) {
      detach(patientChartWorkspaceSlot, extension);
    }
  }, [extensions]);

  return {
    title,
    active: extensions.length > 0,
    clearExtensionSlot,
  };
}
