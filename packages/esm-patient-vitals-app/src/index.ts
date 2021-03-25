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
  const moduleName = "@openmrs/esm-patient-vitals-app";

  const options = {
    featureName: "patient-vitals",
    moduleName,
  };

  defineConfigSchema(moduleName, configSchema);

  return {
    extensions: [
      {
        id: "vitals-widget",
        slot: "patient-chart-results-dashboard-slot",
        load: getAsyncLifecycle(
          () => import("./vitals/vitals-overview.component"),
          options
        ),
        meta: {
          view: "vitals",
          title: "Vitals",
        },
      },
    ],
  };
}

export { backendDependencies, importTranslation, setupOpenMRS };
