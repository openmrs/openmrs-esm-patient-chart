import { getStartedVisit, newWorkspaceItem } from "@openmrs/esm-framework";
import isEmpty from "lodash-es/isEmpty";

export interface DataCaptureComponentProps {
  entryStarted: () => void;
  entrySubmitted: () => void;
  entryCancelled: () => void;
  closeComponent: () => void;
}

export function openWorkspaceTab<
  TProps = DataCaptureComponentProps,
  TParams = any
>(
  componentToAdd: React.FC<TProps>,
  componentName: string,
  params?: TParams,
  requiresVisit = true
): void {
  if (isEmpty(getStartedVisit.value) && requiresVisit) {
    window.dispatchEvent(
      new CustomEvent("visit-dialog", {
        detail: { type: "prompt" },
      })
    );
  } else {
    newWorkspaceItem({
      component: componentToAdd,
      name: componentName,
      props: {
        match: { params: params ? params : {} },
      },
      inProgress: false,
      validations: (workspaceTabs) =>
        workspaceTabs.findIndex((tab) => tab.component === componentToAdd),
    });
  }
}
