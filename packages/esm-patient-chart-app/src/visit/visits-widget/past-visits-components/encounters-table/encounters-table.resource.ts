import type { TFunction } from 'i18next';
import {
  formatDatetime,
  makeUrl,
  openmrsFetch,
  parseDate,
  restBaseUrl,
  showSnackbar,
  type Diagnosis,
  type Encounter,
  type EncounterType,
  type Obs,
  useOpenmrsFetchAll,
  useOpenmrsPagination,
} from '@openmrs/esm-framework';
import { type Form } from '@openmrs/esm-patient-common-lib';
import { jsonSchemaResourceName } from '../../../../constants';

export interface EncountersTableProps {
  patientUuid: string;
  totalCount: number;
  currentPage: number;
  goTo(page: number): void;
  isLoading: boolean;
  showVisitType: boolean;
  paginatedEncounters: Array<Encounter>;
  showEncounterTypeFilter: boolean;
  encounterTypeToFilter?: EncounterType;
  setEncounterTypeToFilter?: React.Dispatch<React.SetStateAction<EncounterType>>;
  pageSize: number;
  setPageSize: React.Dispatch<React.SetStateAction<number>>;
  isSelectable: boolean;
  canPrintEncounters: boolean;
}

export interface MappedEncounter {
  datetime: string;
  rawDatetime: string;
  diagnoses: Array<Diagnosis>;
  editPrivilege: string;
  encounterType: string;
  form: Form;
  formName: string;
  id: string;
  obs: Array<Obs>;
  provider: string;
  visitStartDatetime?: string;
  visitStopDatetime?: string;
  visitType: string;
  visitTypeUuid?: string;
  visitUuid: string;
}

export function deleteEncounter(encounterUuid: string, abortController: AbortController) {
  return openmrsFetch(`${restBaseUrl}/encounter/${encounterUuid}`, {
    method: 'DELETE',
    signal: abortController.signal,
  });
}

const encountersCustomRep = `custom:(uuid,display,diagnoses:(uuid,display,rank,diagnosis,certainty,voided),encounterDatetime,form:(uuid,display,name,description,encounterType,version,resources:(uuid,display,name,valueReference)),encounterType,visit,patient,obs:(uuid,concept:(uuid,display,conceptClass:(uuid,display)),display,groupMembers:(uuid,concept:(uuid,display),value:(uuid,display),display),value,obsDatetime),encounterProviders:(provider:(person)))`;

function buildEncountersUrl(patientUuid: string, encounterType?: string): URL {
  const url = new URL(makeUrl(`${restBaseUrl}/encounter`), window.location.toString());
  url.searchParams.set('patient', patientUuid);
  url.searchParams.set('v', encountersCustomRep);
  url.searchParams.set('order', 'desc');

  if (encounterType) {
    url.searchParams.set('encounterType', encounterType);
  }

  return url;
}

export function usePaginatedEncounters(patientUuid: string, encounterType: string, pageSize: number) {
  const url = buildEncountersUrl(patientUuid, encounterType);
  return useOpenmrsPagination<Encounter>(patientUuid ? url : null, pageSize);
}

export function useAllEncounters(patientUuid: string, encounterType?: string) {
  const url = buildEncountersUrl(patientUuid, encounterType);
  return useOpenmrsFetchAll<Encounter>(patientUuid ? url.toString() : null);
}

export function useEncounterTypes() {
  return useOpenmrsFetchAll<EncounterType>(`${restBaseUrl}/encountertype`, {
    immutable: true,
  });
}

export function mapEncounter(encounter: Encounter): MappedEncounter {
  return {
    id: encounter.uuid,
    datetime: formatDatetime(parseDate(encounter.encounterDatetime), {
      noToday: true,
    }),
    rawDatetime: encounter.encounterDatetime,
    diagnoses:
      encounter.diagnoses
        ?.filter((diagnosis) => !diagnosis.voided)
        .map((diagnosis) => ({
          ...diagnosis,
          certainty: diagnosis.certainty || 'PROVISIONAL',
        })) || [],
    encounterType: encounter.encounterType?.display,
    editPrivilege: encounter.encounterType?.editPrivilege?.display,
    form: encounter.form as Form,
    formName: encounter.form?.display ?? '--',
    obs: encounter.obs,
    provider:
      encounter.encounterProviders?.length > 0 ? encounter.encounterProviders[0].provider?.person?.display : '--',
    visitStartDatetime: encounter.visit?.startDatetime,
    visitStopDatetime: encounter.visit?.stopDatetime,
    visitType: encounter.visit?.visitType?.display ?? '--',
    visitTypeUuid: encounter.visit?.visitType?.uuid,
    visitUuid: encounter.visit?.uuid,
  };
}

export function encounterHasJsonSchemaForm(encounter: Encounter): boolean {
  if (!encounter.form) {
    return false;
  }

  if (!encounter.form.resources || !Array.isArray(encounter.form.resources)) {
    return false;
  }

  return encounter.form.resources.some((resource: any) => resource.name === jsonSchemaResourceName);
}

export async function downloadPdf(encounterUuids: string[], t: TFunction) {
  if (!encounterUuids || encounterUuids.length === 0) {
    return;
  }

  let currentJobId = null;

  try {
    const initResponse = await openmrsFetch('/ws/rest/v1/patientdocuments/encounters', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(encounterUuids),
    });

    currentJobId = initResponse.data.uuid;

    showSnackbar({
      isLowContrast: true,
      kind: 'info',
      title: t('generatingPdf', 'Generating PDF'),
      subtitle: t('thisMayTakeAMoment', 'This may take a moment.'),
    });

    let isCompleted = false;
    let isFailed = false;
    let attempts = 0;
    const maxAttempts = 60;

    while (!isCompleted && !isFailed && attempts < maxAttempts) {
      attempts++;
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const statusResponse = await openmrsFetch(`/ws/rest/v1/patientdocuments/encounters/status/${currentJobId}`);
      const statusData = statusResponse.data;

      if (statusData.status === 'COMPLETED') {
        isCompleted = true;
      } else if (statusData.status === 'FAILED') {
        isFailed = true;
        throw new Error(statusData.error || 'Server failed to generate the report.');
      }
    }

    if (!isCompleted) {
      throw new Error('Report generation timed out. Please try again or select fewer encounters.');
    }

    const downloadResponse = await openmrsFetch(`/ws/rest/v1/patientdocuments/encounters/download/${currentJobId}`);

    const blob = await downloadResponse.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;

    const contentDisposition = downloadResponse.headers.get('Content-Disposition');
    let fileName = 'EncountersReport.pdf';
    if (contentDisposition && contentDisposition.includes('filename=')) {
      fileName = contentDisposition.split('filename=')[1].replace(/"/g, '');
    }

    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();

    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(url);

    showSnackbar({
      isLowContrast: true,
      kind: 'success',
      title: t('pdfDownloaded', 'PDF downloaded'),
    });
  } catch (error) {
    showSnackbar({
      isLowContrast: false,
      title: t('error', 'Error'),
      kind: 'error',
      subtitle: error.message || t('printError', 'Failed to generate PDF. Please check server logs.'),
    });
  }
}
