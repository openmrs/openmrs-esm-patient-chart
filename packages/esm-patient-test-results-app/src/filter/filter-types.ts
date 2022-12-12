import { OBSERVATION_INTERPRETATION } from '@openmrs/esm-patient-common-lib';
interface Observation {
  display: string;
  flatName: string;
  hasData?: boolean;
}
export interface TreeNode {
  display: string;
  datatype?: string;
  subSets?: TreeNode[];
  obs?: Observation[];
  flatName: string;
  hasData?: boolean;
}
export interface FilterNodeProps {
  root: TreeNode;
  level: number;
  open?: boolean;
}

export interface FilterLeafProps {
  leaf: Observation;
}

export interface ReducerState {
  checkboxes: { [key: string]: boolean };
  parents: { [key: string]: string[] };
  roots: Array<TreeNode>;
  tests: { [key: string]: TestData };
  lowestParents: { display: string; flatName: string }[];
}

export enum ReducerActionType {
  INITIALIZE = 'initialize',
  TOGGLEVAL = 'toggleVal',
  UDPATEPARENT = 'updateParent',
  UPDATEBASEPATH = 'updateBasePath',
  RESET_TREE = 'resetTree',
}

export interface ReducerAction {
  type: ReducerActionType;
  name?: string;
  trees?: Array<TreeNode>;
  basePath?: string;
}

export interface ObservationData {
  obsDatetime: string;
  value: string;
  interpretation: OBSERVATION_INTERPRETATION;
}
export interface TestData {
  conceptUuid: string;
  datatype: string;
  display: string;
  flatName: string;
  hasData: true;
  hiCritical?: number;
  hiNormal?: number;
  lowAbsolute?: number;
  lowCritical?: number;
  lowNormal?: number;
  obs: Array<ObservationData>;
  units: string;
  range: string;
  [x: string]: any;
}

export interface ParsedTimeType {
  yearColumns: Array<{
    year: string;
    size: number;
  }>;
  dayColumns: Array<{
    year: string;
    day: string;
    size: number;
  }>;
  timeColumns: Array<string>;
  sortedTimes: Array<string>;
}
export interface TimelineData {
  loaded: boolean;
  data: {
    parsedTime: ParsedTimeType;
    rowData: Array<RowData>;
    panelName: string;
  };
}

export interface FilterContextProps extends ReducerState {
  timelineData: TimelineData;
  activeTests: string[];
  someChecked: boolean;
  totalResultsCount: number;
  initialize: any;
  toggleVal: any;
  updateParent: any;
  resetTree: () => void;
}

export interface obsShape {
  [key: string]: any;
}

export interface RowData extends TestData {
  entries: Array<
    | {
        obsDatetime: string;
        value: string;
        interpretation: OBSERVATION_INTERPRETATION;
      }
    | undefined
  >;
}
