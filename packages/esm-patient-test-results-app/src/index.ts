import { defineConfigSchema, getAsyncLifecycle } from "@openmrs/esm-framework";
import { configSchema } from "./config-schema";
import { backendDependencies } from "./openmrs-backend-dependencies";

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
        load: getAsyncLifecycle(() => import("./test"), options),
        meta: {
          columnSpan: 4,
        },
      },
      {
        id: "test-results-summary-dashboard",
        slot: "patient-chart-dashboard-slot",
        load: getAsyncLifecycle((() => {}) as any, options),
        meta: {
          name: "test-results",
          slot: "patient-chart-test-results-dashboard-slot",
          config: { columns: 1, type: "grid" },
          title: "Test Results",
        },
      },
    ],
  };
}

export { backendDependencies, importTranslation, setupOpenMRS };
