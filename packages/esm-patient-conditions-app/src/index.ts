import { defineConfigSchema, getAsyncLifecycle } from "@openmrs/esm-framework";
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
    moduleName
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
          columnSpan: 2
        }
      },
      {
        id: "conditions-details-widget",
        slot: "patient-chart-conditions-dashboard-slot",
        load: getAsyncLifecycle(
          () => import("./conditions/conditions.component"),
          options
        ),
        meta: {
          columnSpan: 4
        }
      }
    ]
  };
}

export { backendDependencies, importTranslation, setupOpenMRS };
