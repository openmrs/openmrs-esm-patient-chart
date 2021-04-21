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
  const moduleName = "@openmrs/esm-patient-biometrics-app";

  const options = {
    featureName: "patient-biometrics",
    moduleName,
  };

  defineConfigSchema(moduleName, configSchema);

  return {
    extensions: [
      {
        id: "biometrics-overview-widget",
        slot: "patient-chart-summary-dashboard-slot",
        load: getAsyncLifecycle(
          () => import("./biometrics/biometrics-overview.component"),
          options
        ),
        meta: {
          columnSpan: 2,
        },
      },
      {
        id: "biometrics-details-widget",
        slot: "patient-chart-results-dashboard-slot",
        load: getAsyncLifecycle(
          () => import("./biometrics/biometrics-overview.component"),
          options
        ),
        meta: {
          view: "biometrics",
          title: "Biometrics",
        },
      },
    ],
  };
}

export { backendDependencies, importTranslation, setupOpenMRS };
