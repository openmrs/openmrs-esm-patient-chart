import {
  getStartedVisit,
  newWorkspaceItem,
  switchTo
} from "@openmrs/esm-framework";
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
    switchTo("dialog", "/start-visit/prompt", {});
  } else {
    newWorkspaceItem({
      component: componentToAdd,
      name: componentName,
      props: {
        match: { params: params ? params : {} }
      },
      inProgress: false,
      validations: (workspaceTabs) =>
        workspaceTabs.findIndex(tab => tab.component === componentToAdd)
    });
  }
}
