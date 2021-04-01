import { defineConfigSchema, getAsyncLifecycle } from "@openmrs/esm-framework";
import { backendDependencies } from "./openmrs-backend-dependencies";

const importTranslation = require.context(
  "../translations",
  false,
  /.json$/,
  "lazy"
);

function setupOpenMRS() {
  const moduleName = "@openmrs/esm-patient-medications-app";

  const options = {
    featureName: "patient-medications",
    moduleName
  };

  defineConfigSchema(moduleName, {});

  return {
    pages: [
      {
        load: getAsyncLifecycle(
          () => import("./medications/root-order-basket"),
          options
        ),
        route: /^patient\/.+\/drugorder\/basket/
      }
    ],
    extensions: [
      {
        id: "medications-overview-widget",
        slot: "patient-chart-summary-dashboard-slot",
        load: getAsyncLifecycle(
          () => import("./medications/root-medication-summary"),
          options
        ),
        meta: {
          columnSpan: 3
        }
      },
      {
        id: "medications-details-widget",
        slot: "patient-chart-orders-dashboard-slot",
        load: getAsyncLifecycle(
          () => import("./medications/root-medication-summary"),
          options
        ),
        meta: {
          columnSpan: 1
        }
      },
      {
        id: "order-basket-workspace",
        slot: "/patient/:patientUuid/drugorder/basket",
        load: getAsyncLifecycle(
          () => import("./medications/root-order-basket"),
          options
        )
      }
    ]
  };
}

export { backendDependencies, importTranslation, setupOpenMRS };
