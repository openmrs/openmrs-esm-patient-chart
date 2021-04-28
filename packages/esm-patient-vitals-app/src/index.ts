import { defineConfigSchema, getAsyncLifecycle } from "@openmrs/esm-framework";
import { configSchema } from "./config-schema";
import { patientVitalsBiometricsFormWorkspace } from "./constants";
import { backendDependencies } from "./openmrs-backend-dependencies";

const importTranslation = require.context(
  "../translations",
  false,
  /.json$/,
  "lazy"
);

function setupOpenMRS() {
  const moduleName = "@openmrs/esm-patient-vitals-app";

  const options = {
    featureName: "patient-vitals",
    moduleName,
  };

  defineConfigSchema(moduleName, configSchema);

  return {
    extensions: [
      {
        id: "vitals-overview-widget",
        slot: "patient-chart-summary-dashboard-slot",
        load: getAsyncLifecycle(
          () => import("./vitals/vitals-overview.component"),
          options
        ),
        meta: {
          columnSpan: 2,
        },
      },
      {
        id: "vitals-details-widget",
        slot: "patient-chart-results-dashboard-slot",
        load: getAsyncLifecycle(
          () => import("./vitals/vitals-overview.component"),
          options
        ),
        meta: {
          view: "vitals",
          title: "Vitals",
        },
      },
      {
        id: "patient-vitals-info",
        slot: "patient-info-slot",
        load: getAsyncLifecycle(
          () => import("./vitals/vitals-header/vital-header-state.component"),
          options
        ),
      },
      {
        id: patientVitalsBiometricsFormWorkspace,
        load: getAsyncLifecycle(
          () =>
            import(
              "./vitals/vitals-biometrics-form/vitals-biometrics-form.component"
            ),
          options
        ),
        meta: {
          title: {
            key: "recordVitalsAndBiometrics",
            default: "Record Vitals and Biometrics",
          },
        },
      },
    ],
  };
}

export { backendDependencies, importTranslation, setupOpenMRS };
