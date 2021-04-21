import { defineConfigSchema, getAsyncLifecycle } from "@openmrs/esm-framework";
import { backendDependencies } from "./openmrs-backend-dependencies";

const importTranslation = require.context(
  "../translations",
  false,
  /.json$/,
  "lazy"
);

function setupOpenMRS() {
  const moduleName = "@openmrs/esm-patient-appointments-app";

  const options = {
    featureName: "patient-appointments",
    moduleName,
  };

  defineConfigSchema(moduleName, {});

  return {
    extensions: [
      {
        id: "appointments-overview-widget",
        slot: "patient-chart-summary-dashboard-slot",
        load: getAsyncLifecycle(
          () => import("./appointments/appointments-overview.component"),
          options
        ),
        meta: {
          columnSpan: 4,
        },
      },
      {
        id: "appointments-details-widget",
        slot: "patient-chart-appointments-dashboard-slot",
        load: getAsyncLifecycle(
          () => import("./appointments/appointments.component"),
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
