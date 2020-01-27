import { Subject, Observable } from "rxjs";

const workspaceItem = new Subject<WorkspaceTab>();

export function newWorkspaceItem(item: WorkspaceTab) {
  workspaceItem.next(item);
}

export function getNewWorkspaceItem(): Observable<WorkspaceTab> {
  return workspaceItem.asObservable();
}

export type WorkspaceTab = {
  component: any;
  name: string;
  props: any;
  validations?: Function;
  inProgress: boolean;
};
