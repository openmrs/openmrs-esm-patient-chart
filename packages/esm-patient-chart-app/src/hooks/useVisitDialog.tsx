import React from "react";
import { useNavigationContext } from "@openmrs/esm-framework";
import { newModalItem } from "../visit/visit-dialog.resource";
import { StartVisitConfirmation } from "../visit/visit-button.component";

export function useVisitDialog() {
  useNavigationContext({
    type: "dialog",
    handler: (link: string, state: any) => {
      if (link === "/start-visit") {
        newModalItem(state);
        return true;
      } else if (link === "/start-visit/prompt") {
        newModalItem({
          component: <StartVisitConfirmation newModalItem={newModalItem} />,
          name: "Prompt start Visit",
          props: { closeComponent: () => state.onPromptClosed?.() }
        });
        return true;
      }

      return false;
    }
  });
}
