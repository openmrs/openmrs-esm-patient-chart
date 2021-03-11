import React from "react";
import { never, of } from "rxjs";
import { ConfigMock } from "./chart-widgets-config.mock";
import { mockPatient } from "./patient.mock";

export const openmrsFetch = jest.fn(() => new Promise(() => {}));

export const openmrsObservableFetch = jest.fn(() =>
  of({ data: { entry: [] } })
);

export const getCurrentPatient = jest.fn(() =>
  jest.fn().mockReturnValue(never())
);

export const getCurrentPatientUuid = jest.fn();

export const newWorkspaceItem = jest.fn();

export const fhirBaseUrl = "/ws/fhir2/R4";

export function defineConfigSchema() {}

export const validators = {
  isBoolean: jest.fn(),
  isString: jest.fn(),
  isUuid: jest.fn(),
  isObject: jest.fn()
};

export function createErrorHandler() {
  return jest.fn().mockReturnValue(never());
}

export const switchTo = jest.fn();

export function UserHasAccessReact(props: any) {
  return props.children;
}

export const useCurrentPatient = jest.fn(() => {
  return [false, mockPatient, mockPatient.id, null];
});

export const getConfig = jest.fn();

export function useConfig() {
  return ConfigMock;
}

export const ComponentContext = React.createContext({
  moduleName: "fake-module-config"
});

export const mockPatientId = mockPatient.id;

export const showToast = jest.fn();

export const ExtensionSlot = ({ children }) => <>{children}</>;
