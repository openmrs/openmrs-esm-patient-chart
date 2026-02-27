export interface Results {
  uuid: string;
  display: string;
  encounterdatetime: string;
  obs: Obs[];
}

export interface Obs {
  uuid: string;
  concept: Concept;
  display: string;
  groupmembers: string;
  value: any;
  obsdatetime: string;
}

export interface Concept {
  uuid: string;
  display: string;
  conceptclass: Conceptclass;
}

export interface Conceptclass {
  uuid: string;
  display: string;
}
