import React from "react";
import { ExtensionSlot, switchTo } from "@openmrs/esm-framework";

interface FormEntryProps {
  closeWorkspace?: () => void;
  formUuid: string;
  encounterUuid: string;
}

const FormEntry: React.FC<FormEntryProps> = ({
  closeWorkspace,
  formUuid,
  encounterUuid
}) => {
  closeWorkspace = closeWorkspace ?? (() => switchTo("workspace", ""));

  return (
    <ExtensionSlot
      extensionSlotName="form-widget"
      state={{
        formUuid: formUuid,
        encounterUuid: encounterUuid,
        view: "form",
        closeWorkspace: closeWorkspace
      }}
    />
  );
};

export default FormEntry;
