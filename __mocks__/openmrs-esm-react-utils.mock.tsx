import React from "react";
import { mockPatient } from "./patient.mock";

export function UserHasAccess(props: any) {
  return props.children;
}

export function useCurrentPatient() {
  return [false, mockPatient, mockPatient.id, null];
}

export const ExtensionSlot = ({ children }) => <>{children}</>;

export const useConfig = jest.fn();
