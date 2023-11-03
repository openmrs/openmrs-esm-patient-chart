import useSWR from 'swr';
import {
  openmrsFetch,
  OpenmrsResource,
  Privilege,
  showActionableNotification,
  showNotification,
  showToast,
  useVisit,
  Visit,
} from '@openmrs/esm-framework';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

export function useVisits(patientUuid: string) {
  const customRepresentation =
    'custom:(uuid,encounters:(uuid,diagnoses:(uuid,display,rank,diagnosis),form:(uuid,display),encounterDatetime,orders:full,obs:full,encounterType:(uuid,display,viewPrivilege,editPrivilege),encounterProviders:(uuid,display,encounterRole:(uuid,display),provider:(uuid,person:(uuid,display)))),visitType:(uuid,name,display),startDatetime,stopDatetime,patient,attributes:(attributeType:ref,display,uuid,value)';

  const { data, error, isLoading, isValidating, mutate } = useSWR<{ data: { results: Array<Visit> } }, Error>(
    `/ws/rest/v1/visit?patient=${patientUuid}&v=${customRepresentation}`,
    openmrsFetch,
  );
  return {
    visits: data ? data?.data?.results : null,
    isError: error,
    isLoading,
    isValidating,
    mutateVisits: mutate,
  };
}
export function useEncounters(patientUuid: string) {
  const endpointUrl = '/ws/rest/v1/encounter';
  // setting this up to make it more generic and usable later
  const params = {
    patient: patientUuid,
    v: 'default',
    limit: '100',
    order: 'desc',
    startIndex: '0',
  };
  const fullRequest =
    endpointUrl +
    '?' +
    Object.entries(params)
      .map(([key, value]) => `${key}=${value}`)
      .join('&');

  const { data, error, isLoading, isValidating } = useSWR<{ data: { results: Array<Record<string, unknown>> } }, Error>(
    fullRequest,
    openmrsFetch,
  );

  return {
    encounters: data ? data?.data?.results : null,
    error,
    isLoading,
    isValidating,
  };
}

export function usePastVisits(patientUuid: string) {
  const customRepresentation =
    'custom:(uuid,encounters:(uuid,encounterDatetime,' +
    'form:(uuid,name),location:ref,' +
    'encounterType:ref,encounterProviders:(uuid,display,' +
    'provider:(uuid,display))),patient:(uuid,uuid),' +
    'visitType:(uuid,name,display),attributes:(uuid,display,value),location:(uuid,name,display),startDatetime,' +
    'stopDatetime)';

  const { data, error, isLoading, isValidating } = useSWR<{ data: { results: Array<Visit> } }, Error>(
    `/ws/rest/v1/visit?patient=${patientUuid}&v=${customRepresentation}`,
    openmrsFetch,
  );

  return {
    data: data ? data.data.results : null,
    isError: error,
    isLoading,
    isValidating,
  };
}

export function deleteVisit(visitUuid: string) {
  return openmrsFetch(`/ws/rest/v1/visit/${visitUuid}`, {
    headers: {
      'content-type': 'application/json',
    },
    method: 'POST',
    body: { voided: true },
  });
}

export function restoreVisit(visitUuid: string) {
  return openmrsFetch(`/ws/rest/v1/visit/${visitUuid}`, {
    headers: {
      'content-type': 'application/json',
    },
    method: 'POST',
    body: { voided: false },
  });
}

export function mapEncounters(visit: Visit): MappedEncounter[] {
  return visit?.encounters?.map((encounter) => ({
    id: encounter?.uuid,
    datetime: encounter?.encounterDatetime,
    encounterType: encounter?.encounterType?.display,
    editPrivilege: encounter?.encounterType?.editPrivilege?.display,
    form: encounter?.form,
    obs: encounter?.obs,
    visitUuid: visit?.uuid,
    visitType: visit?.visitType?.display,
    visitTypeUuid: visit?.visitType?.uuid,
    visitStartDatetime: visit?.startDatetime,
    visitStopDatetime: visit?.stopDatetime,
    provider:
      encounter?.encounterProviders?.length > 0 ? encounter.encounterProviders[0].provider?.person?.display : '--',
  }));
}

export interface MappedEncounter {
  id: string;
  datetime: string;
  encounterType: string;
  editPrivilege: string;
  form: OpenmrsResource;
  obs: Array<Observation>;
  provider: string;
  visitUuid: string;
  visitType: string;
  visitTypeUuid?: string;
  visitStartDatetime?: string;
  visitStopDatetime?: string;
}

export interface Encounter {
  uuid: string;
  diagnoses: Array<Diagnosis>;
  encounterDatetime: string;
  encounterProviders: Array<EncounterProvider>;
  encounterType: {
    uuid: string;
    display: string;
    viewPrivilege: Privilege;
    editPrivilege: Privilege;
  };
  obs: Array<Observation>;
  orders: Array<Order>;
  form: OpenmrsResource;
  patient: OpenmrsResource;
}

export interface EncounterProvider {
  uuid: string;
  display: string;
  encounterRole: {
    uuid: string;
    display: string;
  };
  provider: {
    uuid: string;
    person: {
      uuid: string;
      display: string;
    };
  };
}

export interface Observation {
  uuid: string;
  concept: {
    uuid: string;
    display: string;
    conceptClass: {
      uuid: string;
      display: string;
    };
  };
  display: string;
  groupMembers: null | Array<{
    uuid: string;
    concept: {
      uuid: string;
      display: string;
    };
    value: {
      uuid: string;
      display: string;
    };
    display: string;
  }>;
  value: any;
  obsDatetime?: string;
}

export interface Order {
  uuid: string;
  dateActivated: string;
  dateStopped?: Date | null;
  dose: number;
  dosingInstructions: string | null;
  dosingType?: 'org.openmrs.FreeTextDosingInstructions' | 'org.openmrs.SimpleDosingInstructions';
  doseUnits: {
    uuid: string;
    display: string;
  };
  drug: {
    uuid: string;
    name: string;
    strength: string;
    display: string;
  };
  duration: number;
  durationUnits: {
    uuid: string;
    display: string;
  };
  frequency: {
    uuid: string;
    display: string;
  };
  numRefills: number;
  orderNumber: string;
  orderReason: string | null;
  orderReasonNonCoded: string | null;
  orderer: {
    uuid: string;
    person: {
      uuid: string;
      display: string;
    };
  };
  orderType: {
    uuid: string;
    display: string;
  };
  route: {
    uuid: string;
    display: string;
  };
  quantity: number;
  quantityUnits: OpenmrsResource;
}

export interface Note {
  concept: OpenmrsResource;
  note: string;
  provider: {
    name: string;
    role: string;
  };
  time: string;
}

export interface OrderItem {
  order: Order;
  provider: {
    name: string;
    role: string;
  };
}
export interface Diagnosis {
  certainty: string;
  display: string;
  encounter: OpenmrsResource;
  links: Array<any>;
  patient: OpenmrsResource;
  rank: number;
  resourceVersion: string;
  uuid: string;
  voided: boolean;
  diagnosis: {
    coded: {
      display: string;
      links: Array<any>;
    };
  };
}

export function useDeleteVisit(patientUuid: string, visit: Visit, onVisitDelete = () => {}, onVisitRestore = () => {}) {
  const { mutateVisits } = useVisits(patientUuid);
  const { mutate: mutateCurrentVisit } = useVisit(patientUuid);
  const [isDeletingVisit, setIsDeletingVisit] = useState(false);
  const { t } = useTranslation();

  const restoreDeletedVisit = () => {
    restoreVisit(visit?.uuid)
      .then(() => {
        showNotification({
          title: t('visitRestored', 'Visit restored'),
          description: t('visitRestoredSuccessfully', '{{visit}} restored successfully', {
            visit: visit?.visitType?.display ?? t('visit', 'Visit'),
          }),
          kind: 'success',
        });
        mutateVisits();
        mutateCurrentVisit();
        onVisitRestore?.();
      })
      .catch(() => {
        showNotification({
          title: t('visitNotRestored', "Visit couldn't be restored"),
          description: t('errorWhenRestoringVisit', 'Error occured when restoring {{visit}}', {
            visit: visit?.visitType?.display ?? t('visit', 'Visit'),
          }),
          kind: 'error',
        });
      });
  };

  const initiateDeletingVisit = () => {
    setIsDeletingVisit(true);
    const isCurrentVisitDeleted = !visit?.stopDatetime;

    deleteVisit(visit?.uuid)
      .then(() => {
        mutateVisits();
        mutateCurrentVisit();
        // TODO: Needs to be replaced with Actionable Snackbar when Actionable
        showActionableNotification({
          title: !isCurrentVisitDeleted
            ? t('visitDeleted', '{{visit}} deleted', {
                visit: visit?.visitType?.display ?? t('visit', 'Visit'),
              })
            : t('cancelVisit', 'Cancel visit'),
          kind: 'success',
          subtitle: !isCurrentVisitDeleted
            ? t('visitDeletedSuccessfully', '{{visit}} is deleted successfully', {
                visit: visit?.visitType?.display ?? t('visit', 'Visit'),
              })
            : t('visitCanceled', 'Canceled active visit successfully'),
          actionButtonLabel: t('undo', 'Undo'),
          onActionButtonClick: restoreDeletedVisit,
        });
        onVisitDelete?.();
      })
      .catch(() => {
        showNotification({
          title: isCurrentVisitDeleted
            ? t('errorDeletingVisit', 'Error deleting visit')
            : t('cancelVisitError', 'Error cancelling active visit'),
          kind: 'error',
          description: t('errorOccuredDeletingVisit', 'An error occured when deleting visit'),
        });
      })
      .finally(() => {
        setIsDeletingVisit(false);
      });
  };

  return {
    initiateDeletingVisit,
    isDeletingVisit,
  };
}
