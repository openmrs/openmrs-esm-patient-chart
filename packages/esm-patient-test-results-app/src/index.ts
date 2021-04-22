import { defineConfigSchema, getAsyncLifecycle } from "@openmrs/esm-framework";
import { configSchema } from "./config-schema";
import { backendDependencies } from "./openmrs-backend-dependencies";
import dashboardMeta from "./dashboard/dashboard.meta";

const importTranslation = require.context(
  "../translations",
  false,
  /.json$/,
  "lazy"
);

function setupOpenMRS() {
  const moduleName = "@openmrs/esm-patient-test-results-app";

  const options = {
    featureName: "patient-test-results",
    moduleName,
  };

  defineConfigSchema(moduleName, configSchema);

  return {
    extensions: [
      {
        id: "test-results-summary-widget",
        slot: "patient-chart-summary-dashboard-slot",
        load: getAsyncLifecycle(() => import("./test.component"), options),
        meta: {
          columnSpan: 4,
        },
      },
      {
        id: "test-results-summary-dashboard",
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
