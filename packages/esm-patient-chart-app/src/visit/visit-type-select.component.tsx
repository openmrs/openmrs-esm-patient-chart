import React from "react";
import { VisitType, useVisitTypes } from "@openmrs/esm-framework";

export interface VisitTypeSelectProps {
  onVisitTypeChanged: (selected: VisitType) => any;
  defaultSelectedUuid?: string;
  id?: string;
  visitTypeUuid: string;
}

export default function VisitTypeSelect(props: VisitTypeSelectProps) {
  const visitTypes = useVisitTypes();
  const onVisitTypesChanged = React.useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      props.onVisitTypeChanged(
        visitTypes.find(loc => loc.uuid === event.target.value)
      );
    },
    []
  );

  return (
    <>
      <select
        name="visitType"
        id={props.id || "visitType"}
        className="omrs-type-body-regular"
        style={{ height: "40px" }}
        onChange={onVisitTypesChanged}
        value={props.visitTypeUuid}
      >
        <option value="" className="omrs-padding-8" />
        {visitTypes.map(visitType => (
          <option
            key={visitType.uuid}
            value={visitType.uuid}
            className="omrs-padding-8"
          >
            {visitType.display}
          </option>
        ))}
      </select>
    </>
  );
}
