import immunizationWidgetSchema from "./immunizations/immunization-widget-config-schema";
import { ImmunizationWidgetConfigObject } from "./immunizations/immunization-domain";

export const configSchema = {
  immunizationsConfig: immunizationWidgetSchema,
};

export interface ConfigObject {
  immunizationsConfig: ImmunizationWidgetConfigObject;
}
