import {
  defineConfigSchema,
  getAsyncLifecycle,
  getSyncLifecycle,
} from "@openmrs/esm-framework";
import { createDashboardLink } from "@openmrs/esm-patient-common-lib";
import { backendDependencies } from "./openmrs-backend-dependencies";
import { dashboardMeta } from "./dashboard.meta";

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
    moduleName,
  };

  defineConfigSchema(moduleName, {});

  return {
    extensions: [
      {
        id: "medications-details-widget",
        slot: dashboardMeta.slot,
        load: getAsyncLifecycle(
          () => import("./medications/root-medication-summary"),
          options
        ),
        meta: {
          columnSpan: 1,
        },
      },
      {
        id: "order-basket-workspace",
        load: getAsyncLifecycle(
          () => import("./medications/root-order-basket"),
          options
        ),
        meta: {
          title: {
            key: "orderBasket",
            default: "Order Basket",
          },
        },
      },
      {
        id: "medications-summary-dashboard",
        slot: "patient-chart-dashboard-slot",
        load: getSyncLifecycle(createDashboardLink(dashboardMeta), options),
        meta: dashboardMeta,
      },
    ],
  };
}

export { backendDependencies, importTranslation, setupOpenMRS };
