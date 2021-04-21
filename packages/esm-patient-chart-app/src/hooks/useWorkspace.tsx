import { useCallback, useMemo } from "react";
import { detach, useAssignedExtensionIds } from "@openmrs/esm-framework";
import { moduleName, patientChartWorkspaceSlot } from "../constants";
import { getTitle } from "../utils";

export interface WorkspaceState {
  title: string;
  extensionSlot: string;
}

export interface WorkspaceDetails extends WorkspaceState {
  clearExtensionSlot(): void;
}

export function useWorkspace(): WorkspaceDetails {
  const extensions = useAssignedExtensionIds(
    moduleName,
    patientChartWorkspaceSlot
  );

  const title = useMemo(() => {
    if (extensions.length === 0) {
      return "";
    } else if (extensions.length === 1) {
      return getTitle(extensions[0]);
    } else {
      return `Workspaces (${extensions.length})`;
    }
  }, [extensions]);

  const clearExtensionSlot = useCallback(() => {
    for (const extension of extensions) {
      detach(patientChartWorkspaceSlot, extension.name);
    }
  }, [extensions]);

  return {
    title,
    extensionSlot:
      extensions.length > 0 ? patientChartWorkspaceSlot : undefined,
    clearExtensionSlot,
  };
}
