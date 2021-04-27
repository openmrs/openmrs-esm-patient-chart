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
  const moduleName = "@openmrs/esm-patient-attachments-app";

  defineConfigSchema(moduleName, {});

  return {
    extensions: [
      {
        id: "attachments-overview-widget",
        slot: dashboardMeta.slot,
        load: getAsyncLifecycle(
          () => import("./attachments/attachments-overview.component"),
          {
            featureName: "patient-attachments",
            moduleName,
          }
        ),
        meta: {
          columnSpan: 1,
        },
      },
      {
        id: "capture-photo-widget",
        slot: "capture-patient-photo-slot",
        load: getAsyncLifecycle(
          () => import("./attachments/capture-photo.component"),
          {
            featureName: "capture-photo-widget",
            moduleName,
          }
        ),
      },
      {
        id: "attachments-results-summary-dashboard",
        slot: "patient-chart-dashboard-slot",
        load: getAsyncLifecycle(
          () => import("./dashboard/dashboard-link.component"),
          {
            featureName: "patient-attachments",
            moduleName,
          }
        ),
        meta: dashboardMeta,
      },
    ],
  };
}

export { backendDependencies, importTranslation, setupOpenMRS };
