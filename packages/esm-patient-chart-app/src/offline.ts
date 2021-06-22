import { NewVisitPayload, Visit } from '@openmrs/esm-api';
import {
  getStartedVisit,
  saveVisit,
  subscribeConnectivityChanged,
  VisitMode,
  VisitStatus,
} from '@openmrs/esm-framework';
import { Dexie, Table } from 'dexie';
import { useEffect } from 'react';
import { v4 } from 'uuid';

export async function syncOfflineVisits() {
  const db = new PatientChartDb();
  const visits = await db.offlineVisits.toArray();
  await Promise.all(visits.map(async (visit) => saveVisit(visit.visit, new AbortController())));
}

export function useOfflineVisitForPatient(patientUuid?: string, location?: string, visitType?: string) {
  useEffect(() => {
    return subscribeConnectivityChanged(async ({ online }) => {
      if (!online && patientUuid && location && visitType) {
        const offlineVisit =
          (await getOfflineVisitForPatient(patientUuid)) ??
          (await createOfflineVisitForPatient(patientUuid, location, visitType));

        getStartedVisit.next({
          mode: VisitMode.NEWVISIT,
          status: VisitStatus.ONGOING,
          visitData: offlineVisitToVisit(offlineVisit.visit),
        });
      }
    });
  }, [patientUuid, location, visitType]);
}

async function getOfflineVisitForPatient(patientUuid: string) {
  const db = new PatientChartDb();
  return await db.offlineVisits.get({ 'visit.patient': patientUuid });
}

async function createOfflineVisitForPatient(patientUuid: string, location: string, visitType: string) {
  const db = new PatientChartDb();
  await db.offlineVisits.add({
    visit: {
      uuid: 'OFFLINE+' + v4(),
      patient: patientUuid,
      startDatetime: new Date(),
      location,
      // @ts-ignore
      visitType: undefined,
      // visitType,
    },
  });

  return await getOfflineVisitForPatient(patientUuid);
}

function offlineVisitToVisit(offlineVisit: OfflineVisit): Visit {
  return {
    uuid: offlineVisit.uuid,
    startDatetime: offlineVisit.startDatetime,
    stopDatetime: offlineVisit.stopDatetime,
    encounters: [],
    visitType: {
      uuid: offlineVisit.visitType,
      display: 'OFFLINE_VISIT_PLACEHOLDER',
    },
    patient: {
      uuid: offlineVisit.patient,
    },
  };
}

export class PatientChartDb extends Dexie {
  offlineVisits: Table<QueuedOfflineVisit, number>;

  constructor() {
    super('EsmPatientChart');

    this.version(1).stores({
      offlineVisits: '++id,&visit.patient',
    });

    this.offlineVisits = this.table('offlineVisits');
  }
}

export interface QueuedOfflineVisit {
  id?: number;
  visit: OfflineVisit;
}

export interface OfflineVisit extends NewVisitPayload {
  uuid: string;
}
