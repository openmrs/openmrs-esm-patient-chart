import { defineConfigSchema, getAsyncLifecycle } from "@openmrs/esm-framework";
import { backendDependencies } from "./openmrs-backend-dependencies";

const importTranslation = require.context(
  "../translations",
  false,
  /.json$/,
  "lazy"
);

function setupOpenMRS() {
  const moduleName = "@openmrs/esm-patient-banner-app";

  const options = {
    featureName: "patient-banner",
    moduleName,
  };

  defineConfigSchema(moduleName, {});

  return {
    extensions: [
      {
        id: "patient-banner",
        slot: "patient-header-slot",
        load: getAsyncLifecycle(
          () => import("./banner/patient-banner.component"),
          options
        ),
      },
    ],
  };
}

export { backendDependencies, importTranslation, setupOpenMRS };
