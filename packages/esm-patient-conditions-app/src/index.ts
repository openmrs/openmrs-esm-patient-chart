import { defineConfigSchema, getAsyncLifecycle } from "@openmrs/esm-framework";
import { backendDependencies } from "./openmrs-backend-dependencies";
import dashboardMeta from "./dashboard/dashboard.meta";

const importTranslation = require.context(
  "../translations",
  false,
  /.json$/,
  "lazy"
);

function setupOpenMRS() {
  const moduleName = "@openmrs/esm-patient-vitals-app";

  const options = {
    featureName: "patient-vitals",
    moduleName,
  };

  defineConfigSchema(moduleName, {});

  return {
    extensions: [
      {
        id: "conditions-overview-widget",
        slot: "patient-chart-summary-dashboard-slot",
        load: getAsyncLifecycle(
          () => import("./conditions/conditions-overview.component"),
          options
        ),
        meta: {
          columnSpan: 2,
        },
      },
      {
        id: "conditions-details-widget",
        slot: dashboardMeta.slot,
        load: getAsyncLifecycle(
          () => import("./conditions/conditions.component"),
          options
        ),
        meta: {
          columnSpan: 4,
        },
      },
      {
        id: "conditions-summary-dashboard",
        slot: "patient-chart-dashboard-slot",
        load: getAsyncLifecycle(
          () => import("./dashboard/dashboard-link.component"),
          options
        ),
        meta: dashboardMeta,
      },
    ],
  };
}

export { backendDependencies, importTranslation, setupOpenMRS };
