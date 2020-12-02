import React from "react";
import { ExtensionSlot } from "@openmrs/esm-react-utils";
import { spaBasePath } from "./constants";

export default function PatientChartNavMenu() {
  //TODO insert/replace patientUuid into the spaBasePath
  return (
    <ExtensionSlot
      extensionSlotName="patient-chart-nav-menu"
      state={{ basePath: spaBasePath }}
    />
  );
}
