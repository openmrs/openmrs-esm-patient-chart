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
    activate: /^patient\/.+\/chart/,
    extensions: [
      {
        id: "patient-chart-nav-items",
        load: getAsyncLifecycle(() => import("./nav.component"), options)
      },
      {
        id: "summary-menu-item",
        slot: "patient-chart-nav-menu",
        load: getAsyncLifecycle(() => import("./menu-items/summary-link"), {
          featureName: "summary-menu-item",
          moduleName
        })
      },
      {
        id: "attachments-menu-item",
        slot: "patient-chart-nav-menu",
        load: getAsyncLifecycle(() => import("./menu-items/attachments-link"), {
          featureName: "attachments-menu-item",
          moduleName
        })
      },
      {
        id: "results-menu-item",
        slot: "patient-chart-nav-menu",
        load: getAsyncLifecycle(() => import("./menu-items/results-link"), {
          featureName: "results-menu-item",
          moduleName
        })
      },
      {
        id: "orders-menu-item",
        slot: "patient-chart-nav-menu",
        load: getAsyncLifecycle(() => import("./menu-items/orders-link"), {
          featureName: "orders-menu-item",
          moduleName
        })
      },
      {
        id: "encounters-menu-item",
        slot: "patient-chart-nav-menu",
        load: getAsyncLifecycle(() => import("./menu-items/encounters-link"), {
          featureName: "encounters-menu-item",
          moduleName
        })
      },
      {
        id: "conditions-menu-item",
        slot: "patient-chart-nav-menu",
        load: getAsyncLifecycle(() => import("./menu-items/conditions-link"), {
          featureName: "conditions-menu-item",
          moduleName
        })
      },
      {
        id: "immunizations-menu-item",
        slot: "patient-chart-nav-menu",
        load: getAsyncLifecycle(
          () => import("./menu-items/immunizations-link"),
          {
            featureName: "immunizations-menu-item",
            moduleName
          }
        )
      },
      {
        id: "programs-menu-item",
        slot: "patient-chart-nav-menu",
        load: getAsyncLifecycle(() => import("./menu-items/programs-link"), {
          featureName: "programs-menu-item",
          moduleName
        })
      },
      {
        id: "allergies-menu-item",
        slot: "patient-chart-nav-menu",
        load: getAsyncLifecycle(() => import("./menu-items/allergies-link"), {
          featureName: "allergies-menu-item",
          moduleName
        })
      },
      {
        id: "appointments-menu-item",
        slot: "patient-chart-nav-menu",
        load: getAsyncLifecycle(
          () => import("./menu-items/appointments-link"),
          {
            featureName: "appointments-menu-item",
            moduleName
          }
        )
      }
    ]
  };
}

export { backendDependencies, importTranslation, setupOpenMRS };
