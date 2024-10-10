import type { OBSERVATION_INTERPRETATION } from '@openmrs/esm-patient-common-lib';
import { type RowData, type TreeNode } from '../filter/filter-types';

export interface PanelNameCornerProps {
  showShadow: boolean;
  panelName: string;
}

export interface DateHeaderGridProps {
  timeColumns: Array<string>;
  yearColumns: Array<Record<string, number | string>>;
  dayColumns: Array<Record<string, number | string>>;
  showShadow: boolean;
  xScroll: number;
  setXScroll: any;
}

interface DataEntry {
  value: number | string;
  effectiveDateTime: string;
  interpretation: OBSERVATION_INTERPRETATION;
}

interface DataRow extends TreeNode {
  entries: Array<DataEntry>;
  display: string;
  name: string;
  type: string;
  uuid: string;
  units: string;
  range: string;
}

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
  panelName: string;
  setPanelName: (name: string) => void;
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
