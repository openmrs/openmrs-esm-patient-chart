import { NewVisitPayload } from '@openmrs/esm-api';
import {
  getStartedVisit,
  getSynchronizationItems,
  messageOmrsServiceWorker,
  queueSynchronizationItem,
  fetchCurrentPatient,
  saveVisit,
  setupOfflineSync,
  VisitMode,
  VisitStatus,
  subscribeConnectivity,
  QueueItemDescriptor,
} from '@openmrs/esm-framework';
import { useEffect } from 'react';
import { v4 } from 'uuid';
import useSWR, { SWRResponse } from 'swr';

const visitSyncType = 'visit';
const patientRegistrationSyncType = 'patient-registration';

interface OfflineVisit extends NewVisitPayload {
  uuid: string;
}

export function setupCacheableRoutes() {
  messageOmrsServiceWorker({
    type: 'registerDynamicRoute',
    pattern: '.+/ws/fhir2/R4/Patient/.+',
  });

  messageOmrsServiceWorker({
    type: 'registerDynamicRoute',
    pattern: '.+/ws/rest/v1/visit.+',
  });
}

export function setupOfflineVisitsSync() {
  setupOfflineSync<OfflineVisit>(visitSyncType, [patientRegistrationSyncType], async (visit, options) => {
    const visitPayload = {
      ...visit,
      stopDatetime: new Date(),
    };

    const res = await saveVisit(visitPayload, options.abort).toPromise();
    if (!res.ok) {
      throw new Error(
        `Failed to synchronize offline visit with the UUID: ${visit.uuid}. Error: ${JSON.stringify(res.data)}`,
      );
    }

    return res.data;
  });
}

export function useOfflineVisitForPatient(patientUuid?: string, location?: string) {
  useEffect(() => {
    return subscribeConnectivity(async ({ online }) => {
      if (!online && patientUuid && location) {
        const offlineVisit =
          (await getOfflineVisitForPatient(patientUuid)) ?? (await createOfflineVisitForPatient(patientUuid, location));

        getStartedVisit.next({
          mode: VisitMode.NEWVISIT,
          status: VisitStatus.ONGOING,
          visitData: offlineVisitToVisit(offlineVisit),
        });
      }
    });
  }, [patientUuid, location]);
}

async function getOfflineVisitForPatient(patientUuid: string) {
  const offlineVisits = await getSynchronizationItems<OfflineVisit>(visitSyncType);
  return offlineVisits.find((visit) => visit.patient === patientUuid);
}

async function createOfflineVisitForPatient(patientUuid: string, location: string) {
  const patientRegistrationSyncItems = await getSynchronizationItems<any>(patientRegistrationSyncType);
  const isVisitForOfflineRegisteredPatient = patientRegistrationSyncItems.some(
    (item) => item.preliminaryPatient.uuid === patientUuid,
  );

  const offlineVisit: OfflineVisit = {
    uuid: v4(),
    patient: patientUuid,
    startDatetime: new Date(),
    location,
    // TODO: This UUID belongs to the "Facility Visit" type.
    //       This should be replaced with the dedicated offline visit as soon as it exists in the BE.
    visitType: '7b0f5697-27e3-40c4-8bae-f4049abfb4ed',
  };

  const descriptor: QueueItemDescriptor = {
    id: offlineVisit.uuid,
    displayName: 'Offline visit',
    dependencies: isVisitForOfflineRegisteredPatient
      ? [
          {
            type: patientRegistrationSyncType,
            id: patientUuid,
          },
        ]
      : [],
  };

  await queueSynchronizationItem(visitSyncType, offlineVisit, descriptor);
  return offlineVisit;
}

function offlineVisitToVisit(offlineVisit: OfflineVisit) {
  return {
    uuid: offlineVisit.uuid,
    startDatetime: offlineVisit.startDatetime?.toString(),
    stopDatetime: offlineVisit.stopDatetime?.toString(),
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

export function usePatient(patientUuid: string): SWRResponse<fhir.Patient, Error> {
  return useSWR(`patient/${patientUuid}`, async () => {
    const onlinePatient = await fetchCurrentPatient(patientUuid).catch(() => undefined);
    if (onlinePatient?.data && !onlinePatient.data.issue) {
      return onlinePatient.data;
    }

    const offlinePatient = await getOfflineRegisteredPatientAsFhirPatient(patientUuid);
    if (offlinePatient) {
      return offlinePatient;
    }

    throw new Error(`Could neither retrieve an online patient, nor an offline patient. UUID: ${patientUuid}`);
  });
}

async function getOfflineRegisteredPatientAsFhirPatient(patientUuid: string): Promise<fhir.Patient> {
  const patientRegistrationSyncItems = await getSynchronizationItems<any>(patientRegistrationSyncType);
  const patientSyncItem = patientRegistrationSyncItems.find((item) => item.preliminaryPatient.uuid === patientUuid);
  return patientSyncItem
    ? mapPatientCreateFromPatientRegistrationToFhirPatient(patientSyncItem.preliminaryPatient)
    : undefined;
}

function mapPatientCreateFromPatientRegistrationToFhirPatient(patient: any = {}): fhir.Patient {
  // Important:
  // When changing this code, ideally assume that `patient` can be missing any attribute.
  // The `fhir.Patient` provides us with the benefit that all properties are nullable and thus
  // not required (technically, at least). -> Even if we cannot map some props here, we still
  // provide a valid fhir.Patient object. The various patient chart modules should be able to handle
  // such missing props correctly (and should be updated if they don't).

  // Gender in the original object only uses a single letter. fhir.Patient expects a full string.
  const genderMap = {
    ['M']: 'male',
    ['F']: 'female',
    ['O']: 'other',
    ['U']: 'unknown',
  };

  // Mapping inspired by:
  // https://github.com/openmrs/openmrs-module-fhir/blob/669b3c52220bb9abc622f815f4dc0d8523687a57/api/src/main/java/org/openmrs/module/fhir/api/util/FHIRPatientUtil.java#L36
  // https://github.com/openmrs/openmrs-esm-patient-management/blob/94e6f637fb37cf4984163c355c5981ea6b8ca38c/packages/esm-patient-search-app/src/patient-search-result/patient-search-result.component.tsx#L21
  return {
    id: patient.uuid,
    gender: genderMap[patient.person?.gender],
    birthDate: patient.person?.birthdate ?? patient.person?.birthdateEstimated,
    deceasedBoolean: patient.dead,
    deceasedDateTime: patient.deathDate,
    name: patient.person?.names?.map((name) => ({
      given: [name.givenName, name.middleName].filter(Boolean),
      family: name.familyName,
    })),
    address: patient.person?.addresses.map((address) => ({
      city: address.cityVillage,
      country: address.country,
      postalCode: address.postalCode,
      state: address.stateProvince,
      use: 'home',
    })),
    telecom: patient.attributes?.filter((attribute) => attribute.attributeType.name == 'Telephone Number'),
  };
}
