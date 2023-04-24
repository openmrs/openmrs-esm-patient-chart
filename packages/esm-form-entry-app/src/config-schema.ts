import { validator } from '@openmrs/esm-framework';

export const configSchema = {
  /** @deprecated use customDataSources instead */
  dataSources: {
    monthlySchedule: {
      _type: 'Boolean',
      _default: false,
      _description:
        'Whether to use monthly scheduled appointment data source in form-entry engine. Requires `appointmentsResourceUrl`.',
    },
  },
  customDataSources: {
    _type: 'Array',
    _default: [],
    _elements: {
      name: {
        _type: 'String',
        _default: 'customDataSource',
        _description: 'The name of the data source. This is how the data source is referenced inside the form.',
        _validators: [validator((val) => val !== '', 'Must have a value')],
      },
      moduleName: {
        _type: 'String',
        _default: '',
        _description:
          'The specifier for the module, e.g., "@myOrg/myGreatDataSource". This module should be defined in your import map and will be loaded for all forms.',
        _validators: [validator((val) => val !== '', 'Must have a value')],
      },
      moduleExport: {
        _type: 'String',
        _default: 'default',
        _description:
          'The property of the module to be exposed as the data source. This is the name of the exported JS object. For example, setting this to "ageFactory" will use the attribute named "ageFactory". The default value, "default", will point to the default export, if your JS module has one.',
      },
    },
  },
  appointmentsResourceUrl: {
    _type: 'String',
    _default: '/etl-latest/etl/get-monthly-schedule',
    _description:
      'Custom URL to load resources required for appointment monthly schedule feature (under `dataSources`).',
  },
};
