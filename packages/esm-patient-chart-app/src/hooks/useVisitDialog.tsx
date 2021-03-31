import { useNavigationContext } from "@openmrs/esm-framework";
import { newModalItem } from "../visit/visit-dialog.resource";

export function useVisitDialog() {
  useNavigationContext({
    type: "dialog",
    handler: (link: string, state: any) => {
      if (link === "/start-visit") {
        newModalItem(state);
        return true;
      }

      return false;
    },
  });
}
