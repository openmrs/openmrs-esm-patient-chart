import { defineConfigSchema, getAsyncLifecycle } from "@openmrs/esm-framework";
import { backendDependencies } from "./openmrs-backend-dependencies";

const importTranslation = require.context(
  "../translations",
  false,
  /.json$/,
  "lazy"
);

function setupOpenMRS() {
  const moduleName = "@openmrs/esm-patient-programs-app";

  const options = {
    featureName: "patient-programs",
    moduleName,
  };

  defineConfigSchema(moduleName, {});

  return {
    extensions: [
      {
        id: "programs-overview-widget",
        slot: "patient-chart-summary-dashboard-slot",
        load: getAsyncLifecycle(
          () => import("./programs/programs-overview.component"),
          options
        ),
        meta: {
          columnSpan: 2,
        },
      },
      {
        id: "programs-details-widget",
        slot: "patient-chart-programs-dashboard-slot",
        load: getAsyncLifecycle(
          () => import("./programs/programs.component"),
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
