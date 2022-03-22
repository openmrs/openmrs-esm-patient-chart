import { OBSERVATION_INTERPRETATION } from '@openmrs/esm-patient-common-lib';
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

interface DataRow {
  entries: Array<DataEntry>;
  display: string;
  name: string;
  type: string;
  uuid: string;
  units: string;
  range: string;
}

export interface TimelineCellProps {
  text: string;
  interpretation?: OBSERVATION_INTERPRETATION;
  zebra: boolean;
}

export interface DataRowsProps {
  rowData: DataRow[];
  timeColumns: Array<string>;
  sortedTimes: Array<string>;
  showShadow: boolean;
}
