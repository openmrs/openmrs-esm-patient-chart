import {
  defineConfigSchema,
  getAsyncLifecycle,
  getSyncLifecycle,
} from "@openmrs/esm-framework";
import { createDashboardLink } from "@openmrs/esm-patient-common-lib";
import { configSchema } from "./config-schema";
import { dashboardMeta } from "./dashboard.meta";
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
        id: "results-summary-dashboard",
        slot: "patient-chart-dashboard-slot",
        load: getSyncLifecycle(createDashboardLink(dashboardMeta), options),
        meta: dashboardMeta,
      },
      {
        id: "biometrics-details-widget",
        slot: dashboardMeta.slot,
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
