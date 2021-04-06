import { defineConfigSchema, getAsyncLifecycle } from "@openmrs/esm-framework";
import { backendDependencies } from "./openmrs-backend-dependencies";

const importTranslation = require.context(
  "../translations",
  false,
  /.json$/,
  "lazy"
);

function setupOpenMRS() {
  const moduleName = "@openmrs/esm-patient-allergies-app";

  const options = {
    featureName: "patient-allergies",
    moduleName
  };

  defineConfigSchema(moduleName, {});

  return {
    extensions: [
      {
        id: "allergies-overview-widget",
        slot: "patient-chart-summary-dashboard-slot",
        load: getAsyncLifecycle(
          () => import("./allergies/allergies-overview.component"),
          options
        ),
        meta: {
          columnSpan: 2
        }
      },
      {
        id: "allergies-details-widget",
        slot: "patient-chart-allergies-dashboard-slot",
        load: getAsyncLifecycle(
          () => import("./allergies/allergies.component"),
          options
        ),
        meta: {
          columnSpan: 1
        }
      }
    ]
  };
}

export { backendDependencies, importTranslation, setupOpenMRS };
