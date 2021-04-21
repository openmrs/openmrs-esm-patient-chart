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
  const moduleName = "@openmrs/esm-patient-notes-app";

  const options = {
    featureName: "patient-notes",
    moduleName,
  };

  defineConfigSchema(moduleName, configSchema);

  return {
    extensions: [
      {
        id: "notes-overview-widget",
        slot: "patient-chart-summary-dashboard-slot",
        load: getAsyncLifecycle(
          () => import("./notes/notes-overview.component"),
          options
        ),
        meta: {
          columnSpan: 4,
        },
      },
      {
        id: "notes-details-widget",
        slot: "patient-chart-encounters-dashboard-slot",
        load: getAsyncLifecycle(
          () => import("./notes/notes.component"),
          options
        ),
        meta: {
          title: "Notes",
          view: "notes",
        },
      },
      {
        id: "visit-notes-workspace",
        load: getAsyncLifecycle(
          () => import("./notes/visit-notes-form.component"),
          options
        ),
        meta: {
          title: "Visit Note", //t("visitNote", "Visit Note")
        },
      },
    ],
  };
}

export { backendDependencies, importTranslation, setupOpenMRS };
