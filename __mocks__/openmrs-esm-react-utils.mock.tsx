import { mockPatient } from "./patient.mock";

export function UserHasAccess(props: any) {
  return props.children;
}

export function useCurrentPatient() {
  return [false, mockPatient, mockPatient.id, null];
}

export const useConfig = jest.fn();
