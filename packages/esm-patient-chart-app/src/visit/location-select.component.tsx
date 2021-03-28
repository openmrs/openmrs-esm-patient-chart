import React from "react";
import { Location, useLocations } from "@openmrs/esm-framework";

export interface LocationSelectProps {
  onLocationChanged: (selected: Location) => any;
  currentLocationUuid: string;
  id?: string;
}

const LocationSelect: React.FC<LocationSelectProps> = ({
  id = "visitLocation",
  currentLocationUuid,
  onLocationChanged
}) => {
  const locations = useLocations();

  const onLocationsChanged = React.useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      onLocationChanged(locations.find(loc => loc.uuid == event.target.value));
    },
    [locations]
  );

  return (
    <select
      name="visitLocation"
      id={id}
      className="omrs-type-body-regular"
      style={{ height: "40px" }}
      value={currentLocationUuid}
      onChange={onLocationsChanged}
    >
      <option value="" className="omrs-padding-8" />
      {locations.map(location => {
        return (
          <option
            key={location.uuid}
            value={location.uuid}
            className="omrs-padding-8"
          >
            {location.display}
          </option>
        );
      })}
    </select>
  );
};

export default LocationSelect;
