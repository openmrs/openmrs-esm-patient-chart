import React from "react";
import { mockPatient } from "./patient.mock";
import { never, of } from "rxjs";

export function openmrsFetch() {
  return new Promise(() => {});
}

export function openmrsObservableFetch() {
  return of({ data: { entry: [] } });
}

export function getCurrentPatient() {
  return jest.fn().mockReturnValue(never());
}

export function createErrorHandler() {
  return jest.fn().mockReturnValue(never());
}

export function reportError() {
  return jest.fn();
}

export function UserHasAccess(props: any) {
  return props.children;
}

export function useCurrentPatient() {
  return [false, mockPatient, mockPatient.id, null];
}

export const ExtensionSlot = ({ children }) => <>{children}</>;

export const useConfig = jest.fn();
