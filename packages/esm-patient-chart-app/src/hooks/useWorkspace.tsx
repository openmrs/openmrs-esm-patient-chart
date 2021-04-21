import { useCallback, useMemo } from "react";
import { detach, useExtensionStore } from "@openmrs/esm-framework";
import { moduleName, patientChartWorkspaceSlot } from "../constants";

export interface WorkspaceState {
  title: string;
  extensionSlot: string;
}

export interface WorkspaceDetails extends WorkspaceState {
  clearExtensionSlot(): void;
}

export function useWorkspace(): WorkspaceDetails {
  const store = useExtensionStore();
  const extensions = useMemo(() => {
    const ids =
      store.slots[patientChartWorkspaceSlot]?.instances[moduleName]
        ?.assignedIds ?? [];
    return ids.map((id) => store.extensions[id]);
  }, [store]);

  const title = useMemo(() => {
    if (extensions.length === 0) {
      return "";
    } else if (extensions.length === 1) {
      return extensions[0].meta.title ?? "";
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
