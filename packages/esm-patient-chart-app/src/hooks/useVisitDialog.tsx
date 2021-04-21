import React from "react";
import { pushNavigationContext } from "@openmrs/esm-framework";
import { newModalItem } from "../visit/visit-dialog.resource";
import {
  EndVisitConfirmation,
  StartVisitConfirmation
} from "../visit/visit-button.component";

export function useVisitDialog(patientUuid: string) {
  React.useEffect(
    () =>
      pushNavigationContext({
        type: "dialog",
        handler: (link: string, state: any) => {
          if (link === "/start-visit") {
            newModalItem(state);
            return true;
          } else if (link === "/start-visit/prompt") {
            newModalItem({
              component: (
                <StartVisitConfirmation
                  patientUuid={patientUuid}
                  newModalItem={newModalItem}
                />
              ),
              name: "Prompt start Visit",
              props: { closeComponent: () => state.onPromptClosed?.() }
            });
            return true;
          } else if (link === "/end-visit/prompt") {
            newModalItem({
              component: (
                <EndVisitConfirmation
                  patientUuid={patientUuid}
                  visitData={state.visitData}
                  newModalItem={newModalItem}
                />
              ),
              name: "Prompt end Visit",
              props: { closeComponent: () => state.onPromptClosed?.() }
            });
            return true;
          }

          return false;
        }
      }),
    [patientUuid]
  );
}
