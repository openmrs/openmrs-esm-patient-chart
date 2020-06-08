import "./set-public-path";
import { backendDependencies } from "./openmrs-backend-dependencies";

const importTranslation = require.context(
  "../translations",
  false,
  /.json$/,
  "lazy"
);

function setupOpenMRS() {
  return {
    lifecycle: () => import("./openmrs-esm-patient-chart"),
    activate: /^patient\/.+\/chart/
  };
}

export { backendDependencies, importTranslation, setupOpenMRS };
