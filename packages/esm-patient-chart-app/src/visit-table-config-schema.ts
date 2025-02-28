import { type ConfigSchema, Type, validators } from '@openmrs/esm-framework';

export interface VisitTablesConfig {
  columnDefinitions: VisitsTableColumnDefinition[];

  /*
    A list of table definitions. A queue table (whether it is displaying entries from a
    particular queue+status combination, from a particular queue, or from multiple queues)
    will determine what columns to show based on these definitions. If multiple TableDefinitions
    have matching appliedTo criteria, the first one will be used.
  */
  tableDefinitions: VisitTableDefinition[];
}

const visitTableColumnTypes = ['date', 'visit-type', 'diagnoses'] as const;
export type VisitTableColumnType = (typeof visitTableColumnTypes)[number];

export type VisitsTableColumnDefinition = {
  id: string;
  header?: string;
  columnType: VisitTableColumnType;
} & { columnType: 'diagnoses'; config: DiagnosesColumnConfig };

export interface DiagnosesColumnConfig {}

export interface VisitTableDefinition {
  columns: Array<string>;
}

export const defaultVisitTable: VisitTableDefinition = {
  columns: ['date', 'visit-type', 'diagnoses'],
};

export const visitTableConfigSchema: ConfigSchema = {
  columnDefinitions: {
    _type: Type.Array,
    _default: [],
    _elements: {
      id: {
        _type: Type.String,
        _description: 'The unique identifier for the column you are defining',
      },
      columnType: {
        _type: Type.String,
        _description: 'The type of column, if different from the ID',
        _validators: [validators.oneOf(visitTableColumnTypes)],
        _default: null,
      },
      header: {
        _type: Type.String,
        _description:
          'The i18next translation key for the column header text. If not provided, the columnType will be used as translation key.',
        _default: null,
      },
      config: {},
    },
  },
  tableDefinitions: {
    _type: Type.Array,
    _default: [defaultVisitTable],
    _description: 'An array of table definitions.',
    _elements: {
      columns: {
        _type: Type.Array,
        _elements: {
          _type: Type.String,
          _description: 'the id of the column',
        },
      },
    },
  },
};
