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
        load: getAsyncLifecycle(
          () => import("./overview/recent-overview.component"),
          options
        ),
        meta: {
          columnSpan: 2,
        },
      },
      {
        id: "test-results-summary-widget",
        slot: "patient-chart-test-results-dashboard-slot",
        load: getAsyncLifecycle(() => import("./desktopView"), options),
      },
    ],
  };
}

export { backendDependencies, importTranslation, setupOpenMRS };
