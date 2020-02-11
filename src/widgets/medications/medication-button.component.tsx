import React from "react";
import { newWorkspaceItem } from "../../workspace/workspace.resource";
import { styles } from "./medication-button.css";

export function MedicationButton(props: any) {
  return (
    <button
      className="omrs-btn omrs-text-neutral"
      onClick={() =>
        newWorkspaceItem({
          component: props.component,
          name: props.name,
          props: {
            match: {
              params: {
                orderUuid: props.orderUuid,
                drugName: props.drugName,
                action: props.action
              }
            }
          },
          inProgress: props.inProgress
        })
      }
    >
      {props.label}
    </button>
  );
}
