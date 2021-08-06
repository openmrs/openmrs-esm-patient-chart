export interface ListResult<T> {
  results: Array<T>;
}

export interface GetLocation {
  uuid: string;
  display: string;
}

export interface GetProvider {
  uuid: string;
  display: string;
  person?: {
    uuid: string;
  };
}

export interface GetConcept {
  uuid: string;
  name: {
    display: string;
  };
  conceptClass: {
    uuid: string;
  };
  answers: Array<GetConcept>;
  setMembers: Array<GetConcept>;
}
