import React from "react";
import GridView from "./grid-view.component";
import TabbedView from "./tabbed-view.component";
import { Redirect } from "react-router-dom";
import { useConfig, useExtensionSlotMeta } from "@openmrs/esm-framework";
import { ChartConfig, DashboardConfig } from "../config-schemas";
import { basePath } from "../constants";

function makePath(
  target: DashboardConfig,
  params: Record<string, string> = {}
) {
  const parts = `${basePath}/${target.name}/:subview?`.split("/");

  Object.keys(params).forEach((key) => {
    for (let i = 0; i < parts.length; i++) {
      if (parts[i][0] === ":" && parts[i].indexOf(key) === 1) {
        parts[i] = params[key];
      }
    }
  });

  return parts.join("/");
}

interface ChartReviewProps {
  patientUuid: string;
  patient: fhir.Patient;
  view: string;
  subview: string;
}

const ChartReview: React.FC<ChartReviewProps> = ({
  patientUuid,
  patient,
  view,
  subview,
}) => {
  const config = useConfig() as ChartConfig;
  const meta = useExtensionSlotMeta("patient-chart-dashboard-slot");
  const [dashboard] = [
    ...config.dashboardDefinitions,
    ...(Object.values(meta) as Array<DashboardConfig>),
  ]
    .filter((dashboard) => dashboard.name === view)
    .map((dashboard) =>
      dashboard.config.type === "grid" ? (
        <GridView
          slot={dashboard.slot}
          layout={dashboard.config}
          name={dashboard.name}
          patient={patient}
          patientUuid={patientUuid}
        />
      ) : (
        <TabbedView
          slot={dashboard.slot}
          layout={dashboard.config}
          name={dashboard.name}
          patientUuid={patientUuid}
          patient={patient}
          tab={subview}
        />
      )
    );

  if (!dashboard) {
    return (
      <Redirect
        to={makePath(config.dashboardDefinitions[0], {
          patientUuid,
          subview: "",
        })}
      />
    );
  }

  return dashboard;
};

export default ChartReview;
