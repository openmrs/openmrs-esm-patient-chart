import "./set-public-path";
import { routeRegex } from "@openmrs/esm-root-config";
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
    activate: location => routeRegex(/^patient\/.+\/chart/, location)
  };
}

export { backendDependencies, importTranslation, setupOpenMRS };
