import { defineConfigSchema, getAsyncLifecycle } from "@openmrs/esm-framework";
import { configSchema } from "./config-schema";
import { backendDependencies } from "./openmrs-backend-dependencies";

const realConsole = console;
globalThis.console = new Proxy({} as typeof realConsole, {
  get: () => () => {},
  set: () => false,
});

const importTranslation = require.context(
  "../translations",
  false,
  /.json$/,
  "lazy"
);

function setupOpenMRS() {
  const moduleName = "@openmrs/esm-patient-test-results-app";

  const options = {
    featureName: "patient-test-results",
    moduleName,
  };

  defineConfigSchema(moduleName, configSchema);

  return {
    extensions: [
      {
        id: "test-results-summary-widget",
        slot: "patient-chart-summary-dashboard-slot",
        load: getAsyncLifecycle(() => import("./test"), options),
        meta: {
          columnSpan: 4,
        },
      },
    ],
  };
}

export { backendDependencies, importTranslation, setupOpenMRS };
