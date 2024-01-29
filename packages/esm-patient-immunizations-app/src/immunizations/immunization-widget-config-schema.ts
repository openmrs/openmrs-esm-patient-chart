import { Type } from '@openmrs/esm-framework';

export default {
  immunizationConceptSet: {
    _type: Type.String,
    _default: 'CIEL:984',
    _description: 'A uuid or concept mapping which will have all the possible vaccines as set-members.',
  },
  sequenceDefinitions: {
    _type: Type.Array,
    _description:
      'Doses/Schedules definitions for each vaccine configured if applicable. If not provided the vaccine would be treated as a vaccine without schedules',
    _elements: {
      vaccineConceptUuid: {
        _type: Type.UUID,
        _description: 'The UUID of the individual vaccine concept',
      },
      sequences: {
        _type: Type.Array,
        _elements: {
          sequenceLabel: {
            _type: Type.String,
            _description: 'Name of the dose/booster/schedule.. This will be used as a translation key as well.',
          },
          sequenceNumber: {
            _type: Type.Number,
            _description:
              'The dose number in the vaccines. Convention for doses is [1...9] and for boosters is [11...19]',
          },
        },
      },
    },
    _default: [
      {
        vaccineConceptUuid: '783AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
        sequences: [
          {
            sequenceLabel: 'Dose-1',
            sequenceNumber: 1,
          },
          {
            sequenceLabel: 'Dose-2',
            sequenceNumber: 2,
          },
          {
            sequenceLabel: 'Dose-3',
            sequenceNumber: 3,
          },
          {
            sequenceLabel: 'Dose-4',
            sequenceNumber: 4,
          },
          {
            sequenceLabel: 'Booster-1',
            sequenceNumber: 11,
          },
          {
            sequenceLabel: 'Booster-2',
            sequenceNumber: 12,
          },
        ],
      },
    ],
  },
};
