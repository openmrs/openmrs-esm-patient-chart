import { useExtensionStore } from "@openmrs/esm-framework";
import startCase from "lodash-es/startCase";

export const useClinicalView = () => {
  const { slots } = useExtensionStore();
  if (slots) {
    const viewResults = Object.keys(slots)
      .filter(slot => slot.search("slot") !== -1)
      .map(slot => {
        return {
          slotName: startCase(slot.replace(/-/g, " ").replace("slot", "")),
          slot: slot
        };
      });
    return viewResults
  }
  return [];
};
