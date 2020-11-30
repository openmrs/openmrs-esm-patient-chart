import { getAsyncLifecycle } from "@openmrs/esm-react-utils";
import { defineConfigSchema } from "@openmrs/esm-config";
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

  return {
    lifecycle: getAsyncLifecycle(() => import("./root.component"), options),
    activate: /^patient\/.+\/chart/
  };
}

export { backendDependencies, importTranslation, setupOpenMRS };
