import { registerBreadcrumbs } from "@openmrs/esm-api";
import { defineConfigSchema } from "@openmrs/esm-config";
import { getAsyncLifecycle } from "@openmrs/esm-react-utils";
import { esmPatientChartSchema } from "./config-schemas/openmrs-esm-patient-chart-schema";
import { backendDependencies } from "./openmrs-backend-dependencies";

const importTranslation = require.context(
  "../translations",
  false,
  /.json$/,
  "lazy"
);

function setupOpenMRS() {
  const moduleName = "@openmrs/esm-patient-chart-app";

  const options = {
    featureName: "patient-chart",
    moduleName
  };

  defineConfigSchema(moduleName, esmPatientChartSchema);

  registerBreadcrumbs([
    {
      path: `${window.spaBase}/patient/:patient/chart`,
      title: "Patient",
      parent: `${window.spaBase}/home`
    }
  ]);

  return {
    lifecycle: getAsyncLifecycle(() => import("./root.component"), options),
    activate: /^patient\/.+\/chart/,
    extensions: [
      {
        id: "patient-chart-nav-items",
        load: getAsyncLifecycle(() => import("./nav.component"), options)
      }
    ]
  };
}

export { backendDependencies, importTranslation, setupOpenMRS };
