import { newWorkspaceItem } from "@openmrs/esm-framework";
import { BehaviorSubject } from "rxjs";
import { Visit } from "./visit.resource";

export default function openVisitsNoteWorkspace(
  componentName: string,
  title: string
) {
  newWorkspaceItem({
    component: componentName,
    name: title,
    props: {},
    inProgress: false,
    validations: (workspaceTabs: Array<any>) =>
      workspaceTabs.findIndex((tab) => tab.component === componentName),
  });
}

export const getStartedVisit = new BehaviorSubject<VisitItem>(null);

export interface VisitItem {
  mode: VisitMode;
  visitData?: Visit;
  status: VisitStatus;
  anythingElse?: any;
}

export enum VisitMode {
  NEWVISIT = "startVisit",
  EDITVISIT = "editVisit",
  LOADING = "loadingVisit",
}

export enum VisitStatus {
  NOTSTARTED = "notStarted",
  ONGOING = "ongoing",
}
