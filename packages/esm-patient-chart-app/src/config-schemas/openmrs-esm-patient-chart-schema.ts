import { Type } from "@openmrs/esm-framework";
import { defaultDashboardDefinitions, DashboardConfig } from "./core-views";

export const esmPatientChartSchema = {
  dashboardDefinitions: {
    _type: Type.Array,
    _elements: {
      name: { _type: Type.String },
      title: { _type: Type.String },
      extensionSlotName: { _type: Type.String },
      layout: {
        columns: { _type: Type.Number }
      }
    },
    _default: defaultDashboardDefinitions
  }
};

export interface ChartConfig {
  dashboardDefinitions: Array<DashboardConfig>;
}
