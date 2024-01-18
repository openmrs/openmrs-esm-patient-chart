import immunizationWidgetSchema from './immunizations/immunization-widget-config-schema';
import { type ImmunizationWidgetConfigObject } from './types/fhir-immunization-domain';

export const configSchema = {
  immunizationsConfig: immunizationWidgetSchema,
};

export interface ConfigObject {
  immunizationsConfig: ImmunizationWidgetConfigObject;
}
