import { never, of } from "rxjs";

export function openmrsFetch() {
  return new Promise(() => {});
}

export function openmrsObservableFetch() {
  return of({ data: { entry: [] } });
}
export function UserHasAccessReact(props: any) {
  return props.children;
}

export function getCurrentPatient() {
  return jest.fn().mockReturnValue(never());
}
