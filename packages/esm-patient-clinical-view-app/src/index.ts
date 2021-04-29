import { defineConfigSchema, getAsyncLifecycle } from "@openmrs/esm-framework";
import { configSchema } from "./config-schema";
import { backendDependencies } from "./openmrs-backend-dependencies";

const importTranslation = require.context(
  "../translations",
  false,
  /.json$/,
  "lazy"
);

function setupOpenMRS() {
  const moduleName = "@openmrs/esm-patient-clinical-view-app";

  const options = {
    featureName: "patient-clinical-view",
    moduleName,
  };

  defineConfigSchema(moduleName, configSchema);

  return {
    extensions: [
      {
        id: "patient-clinical-view-overview",
        slot: "patient-chart-summary-dashboard-slot",
        load: getAsyncLifecycle(
          () =>
            import("./clinical-view-overview/clinical-view-overview.component"),
          options
        ),
        meta: {
          view: "ClinicalView",
          title: "Clinical Views",
          columnSpan: 4,
        },
      },
      {
        id: "patient-clinical-view-form-workspace",
        load: getAsyncLifecycle(
          () => import("./clinical-view-form/clinical-view-form.component"),
          options
        ),
        meta: {
          title: "Add Clinical View",
        },
      },
    ],
  };
}

export { backendDependencies, importTranslation, setupOpenMRS };
