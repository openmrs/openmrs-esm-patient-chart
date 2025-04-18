import {
  type Encounter,
  type EncounterType,
  formatDatetime,
  makeUrl,
  type Obs,
  openmrsFetch,
  type OpenmrsResource,
  parseDate,
  restBaseUrl,
  useOpenmrsFetchAll,
  useOpenmrsPagination,
} from '@openmrs/esm-framework';

export interface EncountersTableProps {
  patientUuid: string;
  totalCount: number;
  currentPage: number;
  goTo(page: number): void;
  isLoading: boolean;
  onEncountersUpdated(): void;
  showVisitType: boolean;
  paginated: boolean;
  paginatedEncounters: Array<Encounter>;
  showEncounterTypeFilter: boolean;
  encounterTypeToFilter?: EncounterType;
  setEncounterTypeToFilter?: React.Dispatch<React.SetStateAction<EncounterType>>;
}

export function deleteEncounter(encounterUuid: string, abortController: AbortController) {
  return openmrsFetch(`${restBaseUrl}/encounter/${encounterUuid}`, {
    method: 'DELETE',
    signal: abortController.signal,
  });
}

export function usePaginatedEncounters(patientUuid: string, encounterType: string, pageSize: number) {
  const customRep = `custom:(uuid,display,encounterDatetime,form,encounterType,visit,patient,obs:(uuid,concept:(uuid,display,conceptClass:(uuid,display)),display,groupMembers:(uuid,concept:(uuid,display),value:(uuid,display),display),value,obsDatetime),encounterProviders:(provider:(person)))`;
  const url = new URL(makeUrl(`${restBaseUrl}/encounter`), window.location.toString());
  url.searchParams.set('patient', patientUuid);
  url.searchParams.set('v', customRep);
  url.searchParams.set('order', 'desc');
  encounterType && url.searchParams.set('encounterType', encounterType);
  return useOpenmrsPagination<Encounter>(patientUuid ? url : null, pageSize);
}

export function useEncounterTypes() {
  return useOpenmrsFetchAll<EncounterType>(`${restBaseUrl}/encountertype`, {
    immutable: true,
  });
}

export function mapEncounter(encounter: Encounter): MappedEncounter {
  return {
    id: encounter.uuid,
    datetime: formatDatetime(parseDate(encounter.encounterDatetime)),
    encounterType: encounter.encounterType?.display,
    editPrivilege: encounter.encounterType?.editPrivilege?.display,
    form: encounter.form,
    formName: encounter.form?.display ?? '--',
    obs: encounter.obs,
    visitUuid: encounter.visit?.uuid,
    visitType: encounter.visit?.visitType?.display,
    visitTypeUuid: encounter.visit?.visitType?.uuid,
    visitStartDatetime: encounter.visit?.startDatetime,
    visitStopDatetime: encounter.visit?.stopDatetime,
    provider:
      encounter.encounterProviders?.length > 0 ? encounter.encounterProviders[0].provider?.person?.display : '--',
  };
}

export interface MappedEncounter {
  id: string;
  datetime: string;
  encounterType: string;
  editPrivilege: string;
  form: OpenmrsResource;
  formName: string;
  obs: Array<Obs>;
  provider: string;
  visitUuid: string;
  visitType: string;
  visitTypeUuid?: string;
  visitStartDatetime?: string;
  visitStopDatetime?: string;
}
