import { Type } from '@openmrs/esm-framework';

export const riskCountExtensionConfigSchema = {
  hideOnPages: {
    _type: Type.Array,
    _default: ['Patient Summary'],
    _description:
      'List of page names where the risk count badge should not be displayed. Matches against the last segment of the URL path (e.g., "Patient Summary", "Vitals", "Medications").',
    _elements: {
      _type: Type.String,
    },
  },
};

export interface FlagsRiskCountExtensionConfig {
  hideOnPages: Array<string>;
}
