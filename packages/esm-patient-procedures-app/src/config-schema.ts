import { Type } from '@openmrs/esm-framework';
import { PROCEDURE_HISTORY_CONCEPT_UUID } from './constants';

export const configSchema = {
  procedureConceptUuid: {
    _type: Type.String,
    _description: 'UUID of the concept representing procedure history',
    _default: PROCEDURE_HISTORY_CONCEPT_UUID,
  },
  procedureDateConceptUuid: {
    _type: Type.String,
    _description: 'UUID of the concept for storing the actual procedure date (separate from obsDatetime)',
    _default: '',
  },
  statusConceptUuids: {
    _type: Type.Array,
    _description: 'Array of UUIDs for procedure status concepts',
    _default: [],
  },
  useMockData: {
    _type: Type.Boolean,
    _description: 'Use mock data for development (when true, ignores backend)',
    _default: false,
  },
  displayColumns: {
    _type: Type.Object,
    _description: 'Configure which columns to display in the procedures table',
    _default: {
      procedureName: true,
      date: true,
      status: true,
    },
  },
};

export interface ConfigObject {
  procedureConceptUuid: string;
  procedureDateConceptUuid: string;
  statusConceptUuids: string[];
  useMockData: boolean;
  displayColumns: {
    procedureName: boolean;
    date: boolean;
    status: boolean;
  };
}
