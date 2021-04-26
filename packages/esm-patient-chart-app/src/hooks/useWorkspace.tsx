import { useCallback, useEffect, useMemo, useState } from "react";
import { detach, ExtensionStore, extensionStore } from "@openmrs/esm-framework";
import { moduleName, patientChartWorkspaceSlot } from "../constants";
import { getTitle } from "../utils";

export interface WorkspaceState {
  title: string;
  active: boolean;
}

export interface WorkspaceDetails extends WorkspaceState {
  clearExtensionSlot(): void;
}

export function useWorkspace(): WorkspaceDetails {
  const [extensions, setExtensions] = useState([]);

  useEffect(() => {
    const update = (store: ExtensionStore) => {
      const ids =
        store.slots[patientChartWorkspaceSlot]?.instances[moduleName]
          ?.assignedIds ?? [];
      setExtensions(ids.map((id) => store.extensions[id]));
    };
    update(extensionStore.getState());
    return extensionStore.subscribe(update);
  }, []);

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
    active: extensions.length > 0,
    clearExtensionSlot,
  };
}
