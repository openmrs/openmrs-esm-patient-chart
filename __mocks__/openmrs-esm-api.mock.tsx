import { never } from "rxjs";

export function openmrsFetch() {
  return new Promise(() => {});
}

export function UserHasAccessReact(props: any) {
  return props.children;
}

export function getCurrentPatient() {
  return jest.fn().mockReturnValue(never());
}
