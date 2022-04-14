import { ScaleTypes, LineChartOptions, TickRotations } from '@carbon/charts/interfaces';

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
  basePath?: string;
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

enum Interpretation {
  OFF_SCALE_HIGH = 'OFF_SCALE_HIGH',
  CRITICALLY_HIGH = 'CRITICALLY_HIGH',
  HIGH = 'HIGH',
  OFF_SCALE_LOW = 'OFF_SCALE_LOW',
  CRITICALLY_LOW = 'CRITICALLY_LOW',
  LOW = 'LOW',
  NORMAL = 'NORMAL',
}
export interface ObservationData {
  obsDatetime: string;
  value: number;
  interpretation: Interpretation;
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

export interface TrendlineData {
  isLoading: boolean;
  hiNormal: number;
  lowNormal: number;
  obs: Array<ObservationData>;
  title: string;
  bottomAxisTitle: string;
  leftAxisTitle: string;
  referenceRange: string;
}

export interface FilterContextProps extends ReducerState {
  timelineData: TimelineData;
  trendlineData: TrendlineData;
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

interface RowData extends TestData {
  entries: Array<
    | {
        obsDatetime: string;
        value: string;
        interpretation: Interpretation;
      }
    | undefined
  >;
}
