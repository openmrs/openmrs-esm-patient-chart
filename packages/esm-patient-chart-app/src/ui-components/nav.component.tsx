import React from "react";
import {
  ConfigurableLink,
  useExtensionSlotMeta,
  useConfig,
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
  const meta = useExtensionSlotMeta("patient-chart-dashboard-slot");

  return (
    <>
      {[
        ...config.dashboardDefinitions,
        ...(Object.values(meta) as Array<DashboardConfig>),
      ].map((db) => (
        <div key={db.name}>
          <ConfigurableLink
            to={`${basePath}/${db.name}`}
            className="bx--side-nav__link"
          >
            {db.title}
          </ConfigurableLink>
        </div>
      ))}
    </>
  );
};

export default PatientChartNavMenu;
