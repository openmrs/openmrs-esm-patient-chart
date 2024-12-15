import { openmrsFetch, restBaseUrl, useConnectivity, useVisitTypes, type Visit } from '@openmrs/esm-framework';
import { type amPm } from '@openmrs/esm-patient-common-lib';
import { useOfflineVisitType } from '../hooks/useOfflineVisitType';
import { useRef } from 'react';

export type VisitFormData = {
  visitStartDate: Date;
  visitStartTime: string;
  visitStartTimeFormat: amPm;
  visitStopDate: Date;
  visitStopTime: string;
  visitStopTimeFormat: amPm;
  programType: string;
  visitType: string;
  visitLocation: {
    display?: string;
    uuid?: string;
  };
  visitAttributes: {
    [x: string]: string;
  };
};

export function useConditionalVisitTypes() {
  const isOnline = useConnectivity();

  const visitTypesHook = isOnline ? useVisitTypes : useOfflineVisitType;

  return visitTypesHook();
}
export interface VisitFormCallbacks {
  onVisitCreatedOrUpdated: (visit: Visit) => Promise<any>;
}


export function useVisitFormCallbacks() {
  return useRef<Map<string, VisitFormCallbacks>>(new Map());


export function createVisitAttribute(visitUuid: string, attributeType: string, value: string) {
  return openmrsFetch(`${restBaseUrl}/visit/${visitUuid}/attribute`, {
    method: 'POST',
    headers: { 'Content-type': 'application/json' },
    body: { attributeType, value },
  });
}

export function updateVisitAttribute(visitUuid: string, visitAttributeUuid: string, value: string) {
  return openmrsFetch(`${restBaseUrl}/visit/${visitUuid}/attribute/${visitAttributeUuid}`, {
    method: 'POST',
    headers: { 'Content-type': 'application/json' },
    body: { value },
  });
}

export function deleteVisitAttribute(visitUuid: string, visitAttributeUuid: string) {
  return openmrsFetch(`${restBaseUrl}/visit/${visitUuid}/attribute/${visitAttributeUuid}`, {
    method: 'DELETE',
  });
}
