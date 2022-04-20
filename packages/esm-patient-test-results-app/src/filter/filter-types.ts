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

interface StateProps {
  checkboxes: { [key: string]: boolean };
  parents: { [key: string]: string[] };
  roots: { [key: string]: any }[];
}

export interface FilterContextProps {
  state: StateProps;
  checkboxes: { [key: string]: boolean };
  parents: { [key: string]: string[] };
  roots: TreeNode[];
  tests: { [key: string]: any };
  lowestParents: { display: string; flatName: string }[];
  timelineData: { [key: string]: any };
  activeTests: string[];
  someChecked: boolean;
  initialize: any;
  toggleVal: any;
  updateParent: any;
}

export interface FilterProviderProps {
  roots: any[];
  children: React.ReactNode;
}

export interface obsShape {
  [key: string]: any;
}
