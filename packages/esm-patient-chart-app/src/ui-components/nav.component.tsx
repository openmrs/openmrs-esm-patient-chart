import React from "react";
import {
  ConfigurableLink,
  useConfig,
  ExtensionSlot,
} from "@openmrs/esm-framework";
import { spaBasePath } from "../constants";
import { ChartConfig, DashboardConfig } from "../config-schemas";

function getPatientUuidFromUrl() {
  const match = /\/patient\/([a-zA-Z0-9\-]+)\/?/.exec(location.pathname);
  return match && match[1];
}

const PatientChartNavMenu: React.FC = () => {
  const patientUuid = getPatientUuidFromUrl();
  const basePath = spaBasePath.replace(":patientUuid", patientUuid);
  const config = useConfig() as ChartConfig;

  return (
    <>
      {config.dashboardDefinitions.map((db) => (
        <div key={db.name}>
          <ConfigurableLink
            to={`${basePath}/${db.name}`}
            className="bx--side-nav__link"
          >
            {db.title}
          </ConfigurableLink>
        </div>
      ))}
      <ExtensionSlot
        state={{ basePath }}
        extensionSlotName="patient-chart-dashboard-slot"
      />
    </>
  );
};

export default PatientChartNavMenu;
