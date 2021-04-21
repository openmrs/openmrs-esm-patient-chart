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
  const moduleName = "@openmrs/esm-patient-immunizations-app";

  const options = {
    featureName: "patient-immunizations",
    moduleName,
  };

  defineConfigSchema(moduleName, configSchema);

  return {
    extensions: [
      {
        id: "immunization-overview-widget",
        slot: "patient-chart-summary-dashboard-slot",
        load: getAsyncLifecycle(
          () => import("./immunizations/immunizations-overview.component"),
          options
        ),
        meta: {
          columnSpan: 2,
        },
      },
      {
        id: "immunization-details-widget",
        slot: "patient-chart-immunizations-dashboard-slot",
        load: getAsyncLifecycle(
          () =>
            import("./immunizations/immunizations-detailed-summary.component"),
          options
        ),
        meta: {
          columnSpan: 1,
        },
      },
    ],
  };
}

export { backendDependencies, importTranslation, setupOpenMRS };
