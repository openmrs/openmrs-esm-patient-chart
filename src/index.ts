import { getAsyncLifecycle } from "@openmrs/esm-react-utils";
import { backendDependencies } from "./openmrs-backend-dependencies";

const importTranslation = require.context(
  "../translations",
  false,
  /.json$/,
  "lazy"
);

function setupOpenMRS() {
  return {
    lifecycle: getAsyncLifecycle(() => import("./root.component"), {
      featureName: "patient-chart",
      moduleName: "@openmrs/esm-patient-chart-app"
    }),
    activate: /^patient\/.+\/chart/
  };
}

export { backendDependencies, importTranslation, setupOpenMRS };
