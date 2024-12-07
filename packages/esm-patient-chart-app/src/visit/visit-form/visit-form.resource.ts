import { openmrsFetch, restBaseUrl, useConnectivity, useVisitTypes, type Visit } from '@openmrs/esm-framework';
import { type amPm } from '@openmrs/esm-patient-common-lib';
import { useOfflineVisitType } from '../hooks/useOfflineVisitType';
import { useState } from 'react';

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

export type OnVisitCreatedOrUpdatedCallback = (visit: Visit, patientUuid: string) => Promise<any>;

export function useOnVisitCreatedOrUpdatedCallbacks() {
  return useState<Map<string, OnVisitCreatedOrUpdatedCallback>>(new Map());
}

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
