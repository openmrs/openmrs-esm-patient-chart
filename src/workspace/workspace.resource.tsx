import { Subject, Observable } from "rxjs";
import { AllergyForm } from "../widgets/allergies/allergy-form.component";
import Parcel from "single-spa-react/parcel";
import React from "react";

const workspaceItem = new Subject<WorkspaceTab>();

export function newWorkspaceItem(item: string) {
  workspaceItem.next(coreWorkspaceItems[item]);
}

export function getNewWorkspaceItem(): Observable<WorkspaceTab> {
  return workspaceItem.asObservable();
}

export const coreWorkspaceItems = {
  allergy: {
    component: AllergyForm,
    name: "Allergy",
    props: { match: { params: {} } },
    validations: [],
    inProgress: false
  },
  forms: {
    component: (
      <Parcel config={System.import("@ampath/esm-angular-form-entry")} />
    ),
    name: "Forms",
    props: { match: { params: {} } },
    inProgress: false
  }
};

export type WorkspaceTab = {
  component: any;
  name: string;
  props: any;
  validations: Function[];
  inProgress: boolean;
};

export type WorkspaceItemProps = {
  state: {
    workspaceIndex: number;
    workBegan: Function;
    workEnded: Function;
  };
};
