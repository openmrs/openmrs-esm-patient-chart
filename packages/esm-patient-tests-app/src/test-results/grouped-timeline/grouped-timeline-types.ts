import type { OBSERVATION_INTERPRETATION } from '@openmrs/esm-patient-common-lib';
import { type RowData, type TreeNode } from '../filter/filter-types';

export interface NewRowStartCellProps {
  title: string;
  range: string;
  units: string;
  conceptUuid: string;
  patientUuid: string;
  shadow?: boolean;
  isString?: boolean;
}

export interface TimelineCellProps {
  text: string;
  interpretation?: OBSERVATION_INTERPRETATION;
  zebra: boolean;
}

export interface TimelineDataGroupProps {
  patientUuid: string;
  parent: TreeNode;
  subRows: Array<RowData>;
  xScroll: number;
  setXScroll: (x: number) => void;
  groupNumber: number;
}

export interface DataRowsProps {
  patientUuid: string;
  rowData: Array<RowData>;
  timeColumns: Array<string>;
  sortedTimes: Array<string>;
  showShadow: boolean;
}
