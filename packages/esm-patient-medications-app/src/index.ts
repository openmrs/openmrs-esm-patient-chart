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
    moduleName,
  };

  defineConfigSchema(moduleName, {});

  return {
    extensions: [
      {
        id: "medications-details-widget",
        slot: "patient-chart-orders-dashboard-slot",
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
          title: "Order Basket", // t("orderBasket", "Order Basket")
        },
      },
    ],
  };
}

export { backendDependencies, importTranslation, setupOpenMRS };
