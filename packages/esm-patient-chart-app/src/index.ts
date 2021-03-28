import capitalize from "lodash-es/capitalize";
import {
  registerBreadcrumbs,
  defineConfigSchema,
  getAsyncLifecycle
} from "@openmrs/esm-framework";
import { esmPatientChartSchema } from "./config-schemas/openmrs-esm-patient-chart-schema";
import { spaBasePath } from "./constants";
import { backendDependencies } from "./openmrs-backend-dependencies";

const importTranslation = require.context(
  "../translations",
  false,
  /.json$/,
  "lazy"
);

function setupOpenMRS() {
  const moduleName = "@openmrs/esm-patient-chart-app";

  defineConfigSchema(moduleName, esmPatientChartSchema);

  registerBreadcrumbs([
    {
      path: spaBasePath,
      title: "Patient",
      parent: `${window.spaBase}/home`
    },
    {
      path: `${spaBasePath}/:view/:subview?`,
      title: ([_, key]) => `${capitalize(key)} Dashboard`,
      parent: spaBasePath
    }
  ]);

  return {
    pages: [
      {
        route: /^patient\/.+\/chart/,
        load: getAsyncLifecycle(() => import("./root.component"), {
          featureName: "patient-chart",
          moduleName
        })
      }
    ],
    extensions: [
      {
        id: "patient-chart-nav-items",
        load: getAsyncLifecycle(() => import("./ui-components/nav.component"), {
          featureName: "nav-items",
          moduleName
        })
      }
    ]
  };
}

export { backendDependencies, importTranslation, setupOpenMRS };
