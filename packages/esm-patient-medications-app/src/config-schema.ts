import { Type } from '@openmrs/esm-framework';

export const configSchema = {
  daysDurationUnit: {
    _description:
      'The default medication duration unit is days. The concept for that medication duration unit is specified here.',
    uuid: {
      _type: Type.ConceptUuid,
      _default: '1072AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    },
    display: {
      _type: Type.String,
      _description: 'The text to display in the medication duration units menu for the "days" unit.',
      _default: 'Days',
    },
  },
  careSettingUuid: {
    _type: Type.UUID,
    _description: 'Only orders corresponding to this care setting will be displayed.',
    _default: '6f0c9a92-6f24-11e3-af88-005056821db0',
  },
  drugOrderTypeUUID: {
    _type: Type.UUID,
    _description: "UUID for the 'Drug' order type to fetch medications",
    _default: '131168f4-15f5-102d-96e4-000c29c2a5d7',
  },
  showPrintButton: {
    _type: Type.Boolean,
    _default: false,
    _description:
      'Determines whether or not to display the Print button in both the active and past medications datatable headers. If set to true, a Print button gets shown in both the active and past medications table headers. When clicked, this button enables the user to print out the contents of the table',
  },
};

export interface ConfigObject {
  daysDurationUnit: {
    uuid: string;
    display: string;
  };
  careSettingUuid: string;
  drugOrderTypeUUID: string;
  showPrintButton: boolean;
}
